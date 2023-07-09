import React, {useCallback, useEffect, useState} from 'react';
import {COLORS, IMAGES} from '../assets';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {VStack, Text, View, HStack, Image} from 'native-base';
import {Button, Statusbar, Header} from '../components';
import {BarChart} from 'react-native-gifted-charts';
import {getGraphReportData} from '../utils/GraphData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AsyncKey,
  UART_Baud_Rate,
  dateFormatToDDMMYYYY,
  dateFormatToUTC,
  getDeviceData,
  getSeparatedValues,
  hexStringToByteArray,
  showToast,
  stringToHex,
} from '../utils/CommonUtils';
import {BleManager, Characteristic, Device} from 'react-native-ble-plx';
import {Codes, Parity, UsbSerialManager} from '../usbSerialModule';
import {
  ATCommandInterface,
  GraphBarDataInterface,
  USBDeviceInterface,
} from '../utils/Interfaces';
import {ALL_AT_COMMANDS, XAxisAllLabel, deviceName} from '../utils/Ble_UART_At_Command';
import {CreateFarmsItems, ReportByFarmItems} from '../database/Interfaces';
import {
  fetchSamplesCountByFarm,
  initializeSoilDb,
  saveReportByFarm,
  updateFarmData,
} from '../database/SoilAppDB';
import ReportByFarmItemList from '../components/ReportByFarmItems';

const manager = new BleManager();

const AddNewReport = (props: any) => {
  const {farmData} = props.route?.params;
  const db = initializeSoilDb();
  const [state, setState] = useState({
    isFarmLoading: false,
    connectedBleDevice: {} as any,
    connectedUsbDevice: {} as USBDeviceInterface,
    isConnectedBy: '' as string,
    bleCharacteristic: [] as any,
    allInOneReportData: {} as GraphBarDataInterface,
    filterByToDate: dateFormatToUTC(new Date().toString()),
    openDatePicker: false,
    readingTempData: null as any,
  });

  useEffect(() => {
    const backAction = () => {
      props?.route?.params && props?.route?.params?.onGoBack?.(farmData);
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
    checkBleSerial();
  }, [props]);

  const updateSampleCountByFarm = async () => {
    const farmReportLength = await fetchSamplesCountByFarm(
      db,
      farmData.group_id,
      farmData.farm_id
    );
    try {
      const newItem = {
        sampleCount: farmReportLength,
        update_time: new Date(),
      } as CreateFarmsItems;
      await updateFarmData(db, newItem, farmData);
    } catch (err) {
      console.error(err);
    }
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
          } else {
            // showToast('Please check bluetooth or USB device')
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
      if (err?.code === Codes.DEVICE_NOT_FOND) {
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
      await usbSerialport.send(hexStr).catch((err: any) => {
        console.log('cmd send failed ', err);
        showToast(err);
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
    manager.startDeviceScan(null, null, async (error, device) => {
      if (error) {
        console.log('scanError', error);
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
      } else {
        if (Platform.OS === 'android') {
          const devices = await UsbSerialManager.list();
          if (devices?.length > 0) {
            connectUsbSerialPort(devices);
          } else {
            // showToast('Please check bluetooth or USB device')
          }
        }
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
      const connectedDevice = await manager.connectToDevice(device.id);
      state.connectedBleDevice = connectedDevice;
      setState((prev) => {
        return {
          ...prev,
          connectedBleDevice: connectedDevice,
          isConnectedBy: 'Bluetooth',
        };
      });
      console.log(
        `Connected to device: ${connectedDevice.name} (${connectedDevice.id})`
      );
      discoverServices(connectedDevice);
    } catch (error) {
      //showToast(`Error connecting to device`)
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
      setState((prev) => {
        return {
          ...prev,
          isFarmLoading: false,
        };
      });
    }
  };

  const extractAllRes = useCallback(async (allNotifyData: any) => {
    const uniqueArray = [...new Set(allNotifyData)];
    console.log('rrr346u88 ', JSON.stringify(uniqueArray));
    const allValuesAre = await getSeparatedValues(uniqueArray);
    console.log('rrr22332 ', JSON.stringify(allValuesAre));
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
        allInOneReportData: allGraphReportData.allInOneGraph,
        isFarmLoading: false,
      };
    });
  }, []);

  const storeDetailInDb = async (readingTempData: any) => {
    delete readingTempData.update_time;
    const saveFarmReportRes = await saveReportByFarm(db, readingTempData);
    if (saveFarmReportRes?.ok) {
      updateSampleCountByFarm();
      props?.route?.params && props?.route?.params?.onGoBack?.(farmData);
      props.navigation.goBack();
      showToast('Farm report saved successfully');
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
          connectUsbSerialPort(devices);
        } else {
          showToast('Please connect device');
        }
      }
    } else {
      showToast('Please connect device');
    }
  };

  return (
    <>
      <VStack style={styles.container}>
        <Statusbar />
        <VStack marginTop={10}>
          <Header
            onSettings={() => {
              //props.navigation.navigate('Login');
            }}
            onHeaderLabelClick={() => {
              checkBleSerial();
            }}
            onBack={() => {
              props?.route?.params &&
                props?.route?.params?.onGoBack?.(farmData);
              props.navigation.goBack();
            }}
            label={
              state.connectedBleDevice?.name
                ? 'Device: ' + state.connectedBleDevice?.name
                : state.connectedUsbDevice?.deviceId
                ? 'Device Id: ' + state.connectedUsbDevice?.deviceId
                : ''
            }
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
                    {farmData.group_name + ' - ' + farmData.farm_name}
                  </Text>
                </VStack>
              </HStack>
              <HStack>
                <TouchableOpacity
                  disabled
                  style={{justifyContent: 'center', alignItems: 'center'}}
                  onPress={() => {
                    setState((prev) => {
                      return {
                        ...prev,
                        openDatePicker: true,
                      };
                    });
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
                      {`${dateFormatToDDMMYYYY(state.filterByToDate)}`}
                    </Text>

                    <Image
                      style={styles.calendarIcon}
                      source={IMAGES.CalendarIcon}
                      resizeMode="contain"
                    />
                  </HStack>
                </TouchableOpacity>
              </HStack>
            </HStack>

            {state.isFarmLoading ? (
              <View
                height={323}
                justifyContent={'center'}
                alignItems={'center'}
              >
                <ActivityIndicator size="large" color={COLORS.brown_500} />
              </View>
            ) : state.allInOneReportData?.graphData ? (
              <View
                justifyContent={'center'}
                height={323}
                width={355}
                backgroundColor={COLORS.white}
                ml={2}
                mr={2}
                borderRadius={16}
              >
                <BarChart
                  width={305}
                  barWidth={8}
                  barBorderRadius={4}
                  frontColor="lightgray"
                  data={state.allInOneReportData?.graphData}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  labelWidth={90}
                  xAxisLabelTextStyle={{fontSize: 10}}
                />
              </View>
            ) : (
              <View
                justifyContent={'center'}
                alignItems={'center'}
                justifyItems={'center'}
                alignSelf={'center'}
                alignContent={'center'}
                height={323}
                backgroundColor={COLORS.homeNoDataBg}
                mt={5}
                borderRadius={16}
                width={355}
                ml={2}
                mr={2}
              >
                <Image
                  height={131}
                  width={182}
                  source={IMAGES.NoReportsDataIcon}
                  alignSelf={'center'}
                />
                <View
                  justifyContent={'center'}
                  alignItems={'center'}
                  justifyItems={'center'}
                  alignSelf={'center'}
                  width={'80%'}
                >
                  <Text m={5} color={COLORS.black_200}>
                    {`No reports available, Connect your device and start testing soil in seconds!`}
                  </Text>
                </View>
              </View>
            )}

            {
              state.isFarmLoading ? (
                <View justifyContent={'center'} alignItems={'center'}>
                  <ActivityIndicator size="large" color={COLORS.brown_500} />
                </View>
              ) : state.readingTempData !== null ? (
                <ReportByFarmItemList
                  item={state.readingTempData}
                  collectingSampleText={'1 sample is collecting...'}
                  isCollectingSamplePage={true}
                />
              ) : (
                <></>
              )
              // <View mt={10} justifyContent={'center'} alignItems={'center'}>
              //   <Text color={COLORS.black_200}>No Samples Available</Text>
              // </View>
            }
          </VStack>

          <HStack
            mb={10}
            flex={1}
            width={'100%'}
            mt={Dimensions.get('window').height - 100}
            position={'absolute'}
            justifyContent={'center'}
          >
            <Button
              text={'Saved Record'}
              style={{
                width: 180,
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: COLORS.brown_300,
              }}
              onPress={async () => {
                if (state.readingTempData !== null) {
                  storeDetailInDb(state.readingTempData);
                } else {
                  showToast('Reading data not found');
                }
              }}
            />

            <TouchableOpacity
              style={{
                marginLeft: 15,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                refreshReadingData();
              }}
            >
              <Image
                style={{
                  height: 28,
                  width: 28,
                }}
                source={IMAGES.RefreshIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </HStack>
        </VStack>
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
  },
});

export default AddNewReport;
