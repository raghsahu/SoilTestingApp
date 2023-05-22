import React, { useCallback, useEffect, useState } from 'react';
//ASSETS
import { COLORS, IMAGES } from '../assets';

import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
//import { RNText } from '../components';
import { VStack, Text, View, HStack, Image, ScrollView, FlatList } from 'native-base';
import { Button, Statusbar, Input, Header, GroupTabItem, DateTimePicker } from '../components';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { getGraphReportData, getSelectedGraphReportData } from '../utils/GraphData';
import GroupByItemList from '../components/GroupByItemList';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AsyncKey,
  UART_Baud_Rate,
  dateFormatToDDMMYYYY,
  dateFormatToUTC,
  endDateFormatToUTC,
  getDeviceData,
  getSeparatedValues,
  getUserData,
  hexStringToByteArray,
  showToast,
  stringToHex,
} from '../utils/CommonUtils';
import { BleManager, Characteristic, Device } from 'react-native-ble-plx';
import { Codes, Parity, UsbSerialManager } from '../usbSerialModule';
import { ATCommandInterface, GraphBarDataInterface, USBDeviceInterface, UserInterface } from '../utils/Interfaces';
import { ALL_AT_COMMANDS } from '../utils/Ble_UART_At_Command';
import { CreateFarmsItems, ReportByFarmItems } from '../database/Interfaces';
import {
  fetchAllReportDataByFarm,
  fetchSamplesCountByFarm,
  initializeSoilDb,
  saveReportByFarm,
  updateFarmData,
} from '../database/SoilAppDB';
import ReportByFarmItemList from '../components/ReportByFarmItems';
import StartEndDatePicker from '../components/StartEndDatePicker';
import { useFocusEffect } from '@react-navigation/native';
import SwiperFlatList from 'react-native-swiper-flatlist';

const manager = new BleManager();

const GroupItemDetails = (props: any) => {
  const { farmData } = props.route?.params;
  const db = initializeSoilDb();
  const [user, setUser] = useState({} as UserInterface);
  const [state, setState] = useState({
    isFarmLoading: false,
    openAddGroupModal: false,
    connectedBleDevice: {} as any,
    connectedUsbDevice: {} as USBDeviceInterface,
    isConnectedBy: '' as string,
    bleCharacteristic: [] as any,
    reportByFarmList: [] as ReportByFarmItems[],
    isSelectedFarmItem: {} as ReportByFarmItems,
    allGraphReportData: [] as GraphBarDataInterface[],
    allInOneReportData: {} as GraphBarDataInterface,
    filterByToDate: dateFormatToUTC((new Date()).toString()),
    filterByFromDate: '',
    openDatePicker: false,
    isAllInOneGraphOpen: true,
    readingTempData: null as any,
  });
  const [allNotifyData, setAllNotifyData] = useState([] as string[]);
  const deviceName = 'SS_7IN1';

  useEffect(() => {
    const backAction = () => {
      props.navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    checkUsbSerial();
    updateSampleCountByFarm();
    setTimeout(()=> {
      getAllReportByFarmLists(state.filterByToDate);
    }, 3000)
  }, [props]);

  // Refresh data on focus
  useFocusEffect(
    useCallback(() => {
      getProfileDataFromLocalStorage();
    }, [])
  );

  const getProfileDataFromLocalStorage = useCallback(async () => {
    // fetch data and update state
    const user = await getUserData();
    if (user) {
      setUser(user);
    }
  }, []);
  
  const updateSampleCountByFarm = async () => {
    const farmReportLength = await fetchSamplesCountByFarm(
      db,
      farmData.group_id,
      farmData.farm_id,
    );
    try {
      const newItem = {
        sampleCount: farmReportLength,
        update_time: new Date(),
      } as CreateFarmsItems;
      const updateFarmRes = await updateFarmData(
        db,
        newItem,
        farmData
      );
    } catch (err) {
      console.error(err);
    }
  }
  const getAllReportByFarmLists = async (toDate: string, fromDate?: string) => {
    setState((prev) => {
      return {
        ...prev,
        isFarmLoading: true,
      };
    });
    const allReportRes = await fetchAllReportDataByFarm(
      db,
      farmData.group_id,
      farmData.farm_id,
      toDate,
      fromDate,
    );
    if (allReportRes?.length) {
      const allGraphReportData = await getGraphReportData(allReportRes);
      //console.log('rrr666 ', JSON.stringify(allGraphReportData))
      setState((prev) => {
        return {
          ...prev,
          reportByFarmList: allReportRes.reverse(),
          allGraphReportData: allGraphReportData.allSeparateGraph,
          allInOneReportData: allGraphReportData.allInOneGraph,
          isFarmLoading: false,
        };
      });
    } else {
      setState((prev) => {
        return {
          ...prev,
          isFarmLoading: false,
          reportByFarmList: [],
          allGraphReportData: [],
        };
      });
    }
  };

  const setSelectedGraphData = async (selectedSample: ReportByFarmItems) => {
    const allGraphReportData = await getSelectedGraphReportData(selectedSample);
    setState((prev) => {
      return {
        ...prev,
        allGraphReportData: allGraphReportData,
      };
    });
  }

  const checkUsbSerial = async () => {
    // if (Platform.OS === 'android') {
    //   const devices = await UsbSerialManager.list();
    //   if (devices?.length > 0) {
    //     connectUsbSerialPort(devices);
    //   } else {
    //     checkBleSerial();
    //   }
    // } else {
      checkBleSerial();
    //}
  };

  const checkBleSerial = async () => {
    // Subscribe to BLE state changes
    const subscription = manager.onStateChange(async (state) => {
      if (state === 'PoweredOn') {
        checkDeviceAndConnect();
      } else {
        if (Platform.OS === 'android') {
          const devices = await UsbSerialManager.list();
          if (devices?.length > 0) {
            connectUsbSerialPort(devices);
          }
        }
      }
    }, true);
    // Cleanup function
    return () => subscription.remove();
  };

  const connectUsbSerialPort = async (devices: USBDeviceInterface[]) => {
    try {
      const deviceId = devices?.[0]?.deviceId;
      await UsbSerialManager.tryRequestPermission(deviceId);
      setState((prev) => {
        return {
          ...prev,
          connectedUsbDevice: devices?.[0],
          isConnectedBy: 'USB',
        };
      });
      readAndWriteDataFromUsbSerial(deviceId);
      //usbSerialport.close();
    } catch (err: any) {
      console.log('err', err);
      if (err.code === Codes.DEVICE_NOT_FOND) {
        // ...
      }
    }
  };

  const readAndWriteDataFromUsbSerial = async (deviceId: number) => {
    const usbSerialport = await UsbSerialManager.open(deviceId, {
      baudRate: UART_Baud_Rate,
      parity: Parity.None,
      dataBits: 8,
      stopBits: 1,
    });
    ALL_AT_COMMANDS.map(async (data: ATCommandInterface) => {
      const hexStr = stringToHex(data.command);
      await usbSerialport.send(hexStr)
        .catch((err: any) => {
          console.log('cmd send failed ', err)
          showToast(err)
        });
    });
    const allData = [] as string[];
    const sub = usbSerialport.onReceived((event) => {
      const readableString = hexStringToByteArray(event.data);
      console.log('onReceive111', readableString);
      allData.push(readableString);
    });
    setTimeout(() => {
      if (allData.length) {
        extractAllRes(allData);
      }
    }, 5000);
    // unsubscribe
    sub.remove();
  };

  const checkDeviceAndConnect = useCallback(async () => {
    const device = await getDeviceData();
    // Check if device is connected
    if (device?.id) {
      connectToDevice(device);
    } else {
      console.log('Scanning for devices');
      scanForDevices();
    }
  }, []);

  const scanForDevices = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
        return;
      }
      if (device?.name === deviceName) {
        AsyncStorage.setItem(AsyncKey.device, JSON.stringify(device));
        setState((prev) => {
          return {
            ...prev,
            connectedBleDevice: device,
            isConnectedBy: 'Bluetooth',
          };
        });
        connectToDevice(device);
      }
    });
    setTimeout(() => {
      manager.stopDeviceScan();
      console.log('Scan stopped');
    }, 5000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      const isAlreadyConnected = await manager.isDeviceConnected(device.id);
      if (isAlreadyConnected) {
        await manager.cancelDeviceConnection(device.id);
      }
      //else{
      const connectedDevice = await manager.connectToDevice(device.id);
      setState((prev) => {
        return {
          ...prev,
          connectedBleDevice: connectedDevice,
          isConnectedBy: 'Bluetooth',
        };
      });
      console.log(`Connected to device: ${device.name} (${device.id})`);
      discoverServices(connectedDevice);
      // }
    } catch (error) {
      console.log(`Error connecting to device: ${device.name} (${device.id})`);
      console.log(error);
    }
  };

  const discoverServices = async (device: Device) => {
    setState((prev) => {
      return {
        ...prev,
        isFarmLoading: true,
      };
    });
    try {
      await device.discoverAllServicesAndCharacteristics();
      const services = await device.services();
      services.forEach(async (service) => {
        // console.log(`Service UUID: ${service.uuid}`);
        const characteristics = await service.characteristics();
        setState((prev) => {
          return {
            ...prev,
            bleCharacteristic: characteristics,
          };
        });

        characteristics.forEach(async (characteristic) => {
          //  console.log(`Characteristic UUID: ${ JSON.stringify(characteristic)}`);
          if (characteristic?.isWritableWithResponse) {
            ALL_AT_COMMANDS.map(async (data: ATCommandInterface) => {
              const base64String = btoa(data.command);
              await characteristic.writeWithResponse(base64String);
            });
          }
          if (characteristic?.isNotifiable) {
            const allData = [] as string[];
            // subscribeToNotifications(characteristic);
            device.monitorCharacteristicForService(
              service.uuid,
              characteristic.uuid,
              (error, characteristic) => {
                if (error) {
                  console.error(error);
                  return;
                }
                const readableString = atob(characteristic?.value || '');
                allData.push(readableString);
              }
            );
            setTimeout(() => {
              extractAllRes(allData);
            }, 3000);
          }
          // const value = await characteristic.read();
          //console.log(`Characteristic value: ${JSON.stringify(value)}`);
        });
      });
    } catch (error) {
      console.log(
        `Error discovering services for device: ${device.name} (${device.id})`
      );
      console.log(error);
    }
  };

  const extractAllRes = useCallback(async (allNotifyData: any) => {
    const uniqueArray = [...new Set(allNotifyData)];
    console.log('rrr346u88 ', JSON.stringify(uniqueArray))
    const allValuesAre = await getSeparatedValues(uniqueArray);
    console.log('rrr22332 ', JSON.stringify(allValuesAre))
    const newItem = {
      ...farmData,
      ...allValuesAre,
      create_time: new Date(),
      sampleCount: 1,
    } as ReportByFarmItems;
    const allGraphReportData = await getGraphReportData([newItem]);
    setState((prev) => {
      return {
        ...prev,
        readingTempData: newItem,
       // reportByFarmList: [...[newItem], ...state.reportByFarmList],
        allGraphReportData: allGraphReportData.allSeparateGraph,
        allInOneReportData: allGraphReportData.allInOneGraph,
        isFarmLoading: false,
      };
    });
  }, []);

  const storeDetailInDb = async (readingTempData: any) => {
    delete readingTempData.update_time;
    const saveFarmReportRes = await saveReportByFarm(db, readingTempData);
    if (saveFarmReportRes?.ok) {
      showToast('Farm report saved successfully');
      updateSampleCountByFarm();
      getAllReportByFarmLists(state.filterByToDate, state.filterByFromDate);

      setState((prev) => {
        return {
          ...prev,
          readingTempData: null,
        };
      });
    }
  };

  const subscribeToNotifications = async (characteristic: Characteristic) => {
    try {
      // Subscribe to notifications for the characteristic
      await characteristic.monitor((error, characteristic) => {
        if (error) {
          console.error(`Error subscribing to notifications: ${error}`);
          return;
        }
        console.log(`Received notification: ${characteristic?.value}`);
      });
      console.log('Subscribed to notifications successfully');
    } catch (error) {
      console.error(`Error subscribing to notifications: ${error}`);
    }
  };

  const refreshReadingData = async () => {
    if (state.isConnectedBy === 'Bluetooth') {
      const isConnected = await manager.isDeviceConnected(
        state.connectedBleDevice.id
      );
      if (isConnected) {
        discoverServices(state.connectedBleDevice);
      } else {
        connectToDevice(state.connectedBleDevice);
      }
    } else if (state.isConnectedBy === 'USB') {
      if (Platform.OS === 'android') {
        const devices = await UsbSerialManager.list();
        if (devices?.length > 0) {
          connectUsbSerialPort(devices)
          // readAndWriteDataFromUsbSerial(
          //   state.connectedUsbDevice.deviceId
          // );
        } else {
          showToast('Please connect device')
        }
      }
    } else {
      showToast('Please connect device')
    }
  }

  return (
    <>
      <VStack style={styles.container}>
        <Statusbar />
        <VStack marginTop={10}>
          <Header
            photoURL={user?.photoURL || ''}
            onProfile={() => {
              props.navigation.navigate('Profile');
            }}
            onSettings={() => {
              //props.navigation.navigate('Login');
            }}
          ></Header>
          
            <VStack marginLeft={5} marginRight={5}>
              <HStack
                marginTop={8}
                width={'100%'}
                justifyContent={'space-between'}
                alignContent={'center'}
              >
              <HStack>
                <VStack>
                  <Text
                    fontSize={16}
                    fontWeight={600}
                    fontFamily={'Poppins-Regular'}
                    color={COLORS.black_400}
                  //style={{ alignSelf: 'center', justifyContent: 'center' }}
                  >
                    Soil Report
                  </Text>
                  <Text
                    fontSize={12}
                    fontWeight={500}
                    fontFamily={'Poppins-Regular'}
                    color={COLORS.black_300}
                    style={{
                      paddingRight: 5,
                      alignSelf: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {farmData.group_name + ' - ' + farmData.farm_field}
                  </Text>
                </VStack>
                <TouchableOpacity
                    style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}
                    onPress={() => {
                      refreshReadingData();
                    }}
                  >
                    <Image
                      style={{  height: 24,
                        width: 24,
                        alignSelf: 'center',}}
                      source={IMAGES.RefreshIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </HStack>
                <HStack>
                  <TouchableOpacity
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {
                      setState((prev) => {
                        return {
                          ...prev,
                          openDatePicker: true,
                        }
                      })
                    }}
                  >
                    <HStack marginRight={2}>
                      <Text
                        fontSize={10}
                        fontWeight={500}
                        fontFamily={'Poppins-Regular'}
                        color={COLORS.black_200}
                        style={{
                          paddingRight: 5,
                          alignSelf: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {`${dateFormatToDDMMYYYY(state.filterByToDate)} ${state.filterByFromDate ? '-' + dateFormatToDDMMYYYY(state.filterByFromDate) : ''}`}
                      </Text>

                      <Image
                        style={styles.calendarIcon}
                        source={IMAGES.CalendarIcon}
                        resizeMode="contain"
                      />
                    </HStack>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.graphIconBg}
                    onPress={() => {
                      setState((prev) => {
                        return {
                          ...prev,
                          isAllInOneGraphOpen: !state.isAllInOneGraphOpen,
                        }
                      })
                    }}
                  >
                    <Image
                      style={styles.graphIcon}
                      source={IMAGES.GraphIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </HStack>
              </HStack>

              {state.isFarmLoading ?
                <View height={323} justifyContent={'center'} alignItems={'center'}>
                  <ActivityIndicator size="large" color={COLORS.brown_500} />
                </View>
                :
                state.isAllInOneGraphOpen ?
                  state.allGraphReportData?.length > 0 ?
                    <View
                     // flex={1}
                      justifyContent={'center'}
                      height={323}
                      width={355}
                      backgroundColor={COLORS.white}
                      ml={2}
                      mr={2}
                    //borderRadius={16}
                    >
                      <BarChart
                       // horizontal
                        //width={260}
                        width={305}
                       // height={260}
                        barWidth={8}
                        //noOfSections={3}
                        barBorderRadius={4}
                        frontColor="lightgray"
                        data={state.allInOneReportData.graphData}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        labelWidth={60}
                        //xAxisLabelTextStyle={{ fontSize: 8, marginBottom: 25, marginTop: -10 }}
                        xAxisLabelTextStyle={{ fontSize: 10 }}
                      />
                    </View>
                    :
                    <View height={323} justifyContent={'center'} alignItems={'center'}>
                      <Text color={COLORS.black_200}>No Reports Available</Text>
                    </View>
                  :
                  state.allGraphReportData?.length > 0 ?
                  <SwiperFlatList index={0}>
                      {
                        state.allGraphReportData?.map((item: any) => {
                          return (
                            <View
                              //flex={1}
                              justifyContent={'center'}
                              height={323}
                              width={355}
                              backgroundColor={COLORS.white}
                              ml={2}
                              mr={2}
                              borderRadius={16}
                            >
                              <Text
                                mb={2}
                                fontSize={16}
                                fontWeight={500}
                                fontFamily={'Poppins-Regular'}
                                color={COLORS.black}
                                style={{ marginLeft: 5, paddingLeft: 5 }}
                              >
                                {item.graphHeader}
                              </Text>
                              <BarChart
                                // areaChart
                                width={305}
                                //height={280}
                                barWidth={8}
                                //noOfSections={3}
                                barBorderRadius={4}
                                frontColor="lightgray"
                                data={item.graphData}
                                yAxisThickness={0}
                                xAxisThickness={0}
                                labelWidth={60}
                                xAxisLabelTextStyle={{ fontSize: 10 }}
                              />
                            </View>
                          );
                        })
                      }
                    </SwiperFlatList>
                    : <View height={323} justifyContent={'center'} alignItems={'center'}>
                      <Text color={COLORS.black_200}>No Reports Available</Text>
                    </View>
              }

              {state.isFarmLoading ?
                <View justifyContent={'center'} alignItems={'center'}>
                  <ActivityIndicator size="large" color={COLORS.brown_500} />
                </View>
                : 
                state.readingTempData !== null ?
                      <ReportByFarmItemList
                          item={state.readingTempData}
                          isCollectingSamplePage={true}
                          isSelectedFarmItem={state.isSelectedFarmItem}
                        />
                :
                state.reportByFarmList?.length > 0 ? (
                  <View height={380}>
                  <FlatList
                    data={state.reportByFarmList}
                    renderItem={({item}) => {
                      return (
                        <ReportByFarmItemList
                          item={item}
                          isCollectingSamplePage={false}
                          isSelectedFarmItem={state.isSelectedFarmItem}
                          onItemClick={() => {
                            setState((prev) => {
                              return {
                                ...prev,
                                isSelectedFarmItem: item,
                              }
                            });
                            setSelectedGraphData(item);
                          }}
                        />
                      )
                    }}
                    keyExtractor={(item, index) => index + item.farm_id + ''}
                  />
                  </View>
                ) :
                  <View mt={10} justifyContent={'center'} alignItems={'center'}>
                    <Text color={COLORS.black_200}>No Samples Available</Text>
                  </View>
              }
            </VStack>

          <View
            flex={1}
            mb={10}
            mt={Dimensions.get('window').height - 100}
            position={'absolute'}
            width={'100%'}
          >
            <Button
              text={'Save Record'}
              style={{
                width: 180,
                alignSelf: 'center',
                backgroundColor: COLORS.brown_300,
              }}
              onPress={
                async () => {
                  if (state.readingTempData !== null) {
                    storeDetailInDb(state.readingTempData);
                  } else {
                    showToast('Reading data not found')
                  }
                }
              }
            />
          </View>
          
        </VStack>
  
        {state.openDatePicker &&
          <StartEndDatePicker
            visible={state.openDatePicker}
            onClose={() => {
              setState((prev) => {
                return {
                  ...prev,
                  openDatePicker: false,
                };
              });
            }}
            onDateApply={(startDate: any, endDate: any) => {
              setState((prev) => {
                return {
                  ...prev,
                  openDatePicker: false,
                  filterByToDate: dateFormatToUTC(startDate),
                  filterByFromDate: endDateFormatToUTC(endDate),
                  isSelectedFarmItem: {} as ReportByFarmItems,
                }
              })
              getAllReportByFarmLists(dateFormatToUTC(startDate), endDateFormatToUTC(endDate));
            }}
          />
        }
      </VStack>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1.0,
    backgroundColor: COLORS.white,
  },
  graphIcon: {
    height: 16,
    width: 16,
    alignSelf: 'center',
  },
  calendarIcon: {
    height: 14,
    width: 14,
    alignSelf: 'center',
  },
  graphIconBg: {
    backgroundColor: COLORS.brown_400,
    height: 32,
    width: 32,
    borderRadius: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagerView: {
    flex: 1,
    height: 350,
    // justifyContent: 'center'
  },
});

export default GroupItemDetails;
