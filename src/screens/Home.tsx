import React, {useCallback, useEffect, useState} from 'react';
//ASSETS
import {COLORS, IMAGES} from '../assets';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  VStack,
  Text,
  View,
  HStack,
  Image,
  ScrollView,
  FlatList,
} from 'native-base';
import {Button, Statusbar, Header, GroupTabItem} from '../components';
import {BarChart} from 'react-native-gifted-charts';
import {getGraphReportData} from '../utils/GraphData';
import GroupByItemList from '../components/GroupByItemList';
import AddNewGroupModal from '../components/AddNewGroupModal';
import UpdateGroupModal from '../components/UpdateGroupModal';
import AddNewFarmModal from '../components/AddNewFarmModal';
import {
  AsyncKey,
  dateFormatToDDMMYYYY,
  dateFormatToUTC,
  endDateFormatToUTC,
  getDeviceData,
  getUserData,
  showToast,
} from '../utils/CommonUtils';
import {
  deleteFarmData,
  deleteGroupData,
  fetchAllFarmByGroupList,
  fetchAllGroupData,
  fetchAllReportDataByDate,
  fetchAllReportDataByFarm,
  fetchAllReportDataByGroup,
  initializeSoilDb,
  saveFarmData,
  saveGroupData,
  updateFarmData,
  updateGroupData,
} from '../database/SoilAppDB';
import {
  CreateFarmsItems,
  CreateGroupItems,
  ReportByFarmItems,
} from '../database/Interfaces';
import {useFocusEffect} from '@react-navigation/native';
import {
  GraphBarDataInterface,
  GraphSingleData,
  USBDeviceInterface,
  UserInterface,
} from '../utils/Interfaces';
import {UsbSerialManager} from '../usbSerialModule';
import StartEndDatePicker from '../components/StartEndDatePicker';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import PercentageBar from '../components/PercentageBar';
import {BleManager, Device} from 'react-native-ble-plx';
import {deviceName} from '../utils/Ble_UART_At_Command';
import AsyncStorage from '@react-native-async-storage/async-storage';

const manager = new BleManager();
const Home = (props: any) => {
  const db = initializeSoilDb();
  const [user, setUser] = useState({} as UserInterface);
  const [state, setState] = useState({
    isFarmLoading: false,
    isReportLoading: false,
    openAddGroupModal: false,
    openUpdateGroupModal: false,
    openAddNewFarmModal: false,
    isEditFarm: false,
    groupTabList: [] as CreateGroupItems[],
    isSelectedGroup: {} as CreateGroupItems,
    groupByFarmList: [] as CreateFarmsItems[],
    isSelectedFarmItem: {} as CreateFarmsItems,
    filterByToDate: dateFormatToUTC(new Date().toString()),
    filterByFromDate: '',
    allGraphReportData: [] as GraphBarDataInterface[],
    allInOneReportData: {} as GraphBarDataInterface,
    openDatePicker: false,
    isAllInOneGraphOpen: true,
    isFirstGroupCreated: false,
    connectedBleDevice: {} as any,
    connectedUsbDevice: {} as USBDeviceInterface,
    isConnectedBy: '' as string,
    isFarmReport: false,
  });

  useEffect(() => {
    const backAction = () => {
      //BackHandler.exitApp();
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
    getAllGroupLists();
  }, []);

  // Refresh data on focus
  useFocusEffect(
    useCallback(() => {
      getProfileDataFromLocalStorage();
    }, [props])
  );

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
            // showToast('Please check bluetooth or USB device');
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
      //usbSerialport.close();
    } catch (err) {
      console.log('err', err);
    }
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
        console.log(error);
        return;
      }
      if (device?.name === deviceName) {
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
      AsyncStorage.setItem(AsyncKey.device, JSON.stringify(connectedDevice));
      setState((prev) => {
        return {
          ...prev,
          connectedBleDevice: connectedDevice,
          isConnectedBy: 'Bluetooth',
        };
      });
    } catch (error) {
      // showToast(`Error connecting to device: ${device.name}`);
      setState((prev) => {
        return {
          ...prev,
          connectedBleDevice: {},
          isConnectedBy: '',
        };
      });
      console.log(error);
    }
  };

  const getAllReportByDate = async (toDate: string, fromDate?: string) => {
    setState((prev) => {
      return {
        ...prev,
        isReportLoading: true,
        isFarmReport: false,
      };
    });
    const allReportRes = await fetchAllReportDataByDate(db, toDate, fromDate);
    if (allReportRes?.length > 0) {
      const allGraphReportData = await getGraphReportData(allReportRes);
      setState((prev) => {
        return {
          ...prev,
          allGraphReportData: allGraphReportData.allSeparateGraph,
          allInOneReportData: allGraphReportData.allInOneGraph,
          isReportLoading: false,
        };
      });
    } else {
      setState((prev) => {
        return {
          ...prev,
          isReportLoading: false,
          allGraphReportData: [],
        };
      });
    }
  };

  const getProfileDataFromLocalStorage = useCallback(async () => {
    // fetch data and update state
    const user = await getUserData();
    if (user) {
      setUser(user);
    }
  }, []);

  const getAllGroupLists = async () => {
    const allGroupRes = await fetchAllGroupData(db).catch((err) => {
      if (state.groupTabList.length === 0) {
        setState((prev) => {
          return {
            ...prev,
            groupTabList: [],
            openAddGroupModal: true,
            isFirstGroupCreated: true,
          };
        });
      }
    });

    if (allGroupRes?.length) {
      setState((prev) => {
        return {
          ...prev,
          groupTabList: allGroupRes,
          openAddGroupModal: false,
          openUpdateGroupModal: false,
          isSelectedGroup: state.isSelectedGroup?.group_id
            ? state.isSelectedGroup
            : allGroupRes[0],
          openAddNewFarmModal: state.isFirstGroupCreated,
        };
      });

      fetchGroupByFarmList(
        state.isSelectedGroup?.group_id
          ? state.isSelectedGroup?.group_id
          : allGroupRes[0]?.group_id
      );
    } else {
      if (allGroupRes?.length === 0) {
        setState((prev) => {
          return {
            ...prev,
            groupTabList: [],
            openAddGroupModal: true,
            isFirstGroupCreated: true,
          };
        });
      }
    }
  };

  const fetchGroupByFarmList = async (group_id: number) => {
    const allFarmRes = await fetchAllFarmByGroupList(db, group_id);
    if (allFarmRes?.length) {
      state.groupByFarmList = allFarmRes;
      setState((prev) => {
        return {
          ...prev,
          groupByFarmList: allFarmRes,
          openAddNewFarmModal: false,
          isFarmLoading: false,
        };
      });
    } else {
      setState((prev) => {
        return {
          ...prev,
          isFarmLoading: false,
          groupByFarmList: [] as CreateFarmsItems[],
        };
      });
    }
  };

  const openConfirmationAlert = (title: string, isFarm: boolean) => {
    Alert.alert(
      '',
      title,
      [
        {
          text: 'Yes',
          onPress: () => {
            isFarm ? onDeleteFarm() : onDeleteGroup();
          },
        },
        {
          text: 'No',
          onPress: () => console.log('No button clicked'),
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  const addNewGroup = async (groupName: string) => {
    if (groupName.length) {
      try {
        const newItem = {
          group_name: groupName,
          user_id: 1,
          create_time: new Date(),
        } as CreateGroupItems;

        const saveGroupRes = await saveGroupData(db, newItem);
        if (saveGroupRes?.ok) {
          showToast('Group created successfully');
          getAllGroupLists();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      showToast('Please Enter Group Name');
    }
  };

  const onUpdateGroupName = async (groupName: string) => {
    if (groupName.length) {
      try {
        const newItem = {
          group_name: groupName,
          update_time: new Date(),
        } as CreateGroupItems;

        const updateGroupRes = await updateGroupData(
          db,
          newItem,
          state.isSelectedGroup
        );
        if (updateGroupRes?.ok) {
          showToast('Group updated successfully');
          getAllGroupLists();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      showToast('Please Enter Group Name');
    }
  };

  const onDeleteGroup = async () => {
    try {
      const updateGroupRes = await deleteGroupData(db, state.isSelectedGroup);
      if (updateGroupRes?.ok) {
        showToast('Group deleted successfully');
        setState((prev) => {
          return {
            ...prev,
            isSelectedGroup: {} as CreateGroupItems,
            groupByFarmList: [] as CreateFarmsItems[],
            openAddGroupModal: false,
            openUpdateGroupModal: false,
          };
        });
        getAllGroupLists();
        getAllReportByDate(state.filterByToDate, state.filterByFromDate);
      }
    } catch (err) {
      console.error('group_errr', err);
    }
  };

  const onDeleteFarm = async () => {
    try {
      const updateGroupRes = await deleteFarmData(db, state.isSelectedFarmItem);
      if (updateGroupRes?.ok) {
        showToast('Farm deleted successfully');
        setState((prev) => {
          return {
            ...prev,
            isSelectedFarmItem: {} as CreateFarmsItems,
          };
        });
        fetchGroupByFarmList(state.isSelectedGroup?.group_id);
        getAllReportByDate(state.filterByToDate, state.filterByFromDate);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addNewFarm = async (
    farmName: string,
    farmField: string,
    isEditFarm: boolean,
    image?: string
  ) => {
    if (farmName.length && farmField.length) {
      try {
        const newItem = {
          group_id: state.isSelectedGroup.group_id,
          group_name: state.isSelectedGroup.group_name,
          farm_name: farmName,
          farm_field: farmField,
          farm_image: image,
          user_id: 1,
          sampleCount: 0,
          create_time: new Date(),
        } as CreateFarmsItems;

        if (!isEditFarm) {
          const saveFarmRes = await saveFarmData(db, newItem);
          if (saveFarmRes?.ok) {
            showToast('Farm created successfully');
          }
        } else {
          const updateFarmRes = await updateFarmData(
            db,
            newItem,
            state.isSelectedFarmItem
          );
          if (updateFarmRes?.ok) {
            showToast('Farm updated successfully');
          }
        }
        fetchGroupByFarmList(state.isSelectedGroup?.group_id);
      } catch (err) {
        console.error(err);
      }
    } else {
      showToast('Please Enter All Fields');
    }
  };

  const getAllReportByFarmLists = async (
    farmData: CreateFarmsItems,
    toDate: string,
    fromDate?: string
  ) => {
    setState((prev) => {
      return {
        ...prev,
        isReportLoading: true,
      };
    });
    const allReportRes = await fetchAllReportDataByFarm(
      db,
      farmData.group_id,
      farmData.farm_id,
      toDate,
      fromDate
    );

    if (allReportRes?.length) {
      const allGraphReportData = await getGraphReportData(allReportRes);
      setState((prev) => {
        return {
          ...prev,
          allGraphReportData: allGraphReportData.allSeparateGraph,
          allInOneReportData: allGraphReportData.allInOneGraph,
          isReportLoading: false,
          isFarmReport: true,
        };
      });
    } else {
      setState((prev) => {
        return {
          ...prev,
          isReportLoading: false,
          reportByFarmList: [],
          allGraphReportData: [],
          isFarmReport: false,
        };
      });
    }
  };

  const getAllReportByGroup = async (
    group_id: number,
    toDate: string,
    fromDate?: string
  ) => {
    setState((prev) => {
      return {
        ...prev,
        isReportLoading: true,
      };
    });
    const allReportRes = await fetchAllReportDataByGroup(
      db,
      group_id,
      toDate,
      fromDate
    );
    if (allReportRes?.length) {
      const allGraphReportData = await getGraphReportData(allReportRes);
      setState((prev) => {
        return {
          ...prev,
          allGraphReportData: allGraphReportData.allSeparateGraph,
          allInOneReportData: allGraphReportData.allInOneGraph,
          isReportLoading: false,
        };
      });
    } else {
      setState((prev) => {
        return {
          ...prev,
          isReportLoading: false,
          reportByFarmList: [],
          allGraphReportData: [],
        };
      });
    }
  };

  const onRefreshFarm = (data: CreateFarmsItems) => {
    if (state.isSelectedGroup?.group_id) {
      state.groupByFarmList = [];
      setState((prev) => {
        return {
          ...prev,
          isFarmLoading: true,
          groupByFarmList: [] as CreateFarmsItems[],
        };
      });
      fetchGroupByFarmList(data.group_id);
      getAllReportByGroup(
        data.group_id,
        state.filterByToDate,
        state.filterByFromDate
      );
      console.log('rrr33 ', state.isSelectedGroup, data.group_id);
    }
  };

  const openCollectFarm = async (item: CreateFarmsItems) => {
    props.navigation.navigate('GroupItemDetails', {
      farmData: item,
      onGoBack: (data: CreateFarmsItems) => {
        onRefreshFarm(data);
      },
    });
  };

  return (
    <View style={styles.container}>
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
          onHeaderLabelClick={() => {
            checkBleSerial();
          }}
          label={
            state.connectedBleDevice?.name
              ? 'Device: ' + state.connectedBleDevice?.name
              : state.connectedUsbDevice?.deviceId
              ? 'Device Id: ' + state.connectedUsbDevice?.deviceId
              : 'No Device Connected'
          }
        ></Header>
        <VStack marginLeft={5} marginRight={5}>
          <HStack
            marginTop={8}
            width={'100%'}
            justifyContent={'space-between'}
            alignContent={'center'}
          >
            <Text
              fontSize={16}
              fontWeight={600}
              fontFamily={'Poppins-Regular'}
              color={COLORS.black_400}
              style={{alignSelf: 'center', justifyContent: 'center'}}
            >
              {'Soil Report'}
            </Text>
            {state.groupTabList?.length ? (
              <HStack>
                <TouchableOpacity
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
                      {`${dateFormatToDDMMYYYY(state.filterByToDate)} ${
                        state.filterByFromDate
                          ? '-' + dateFormatToDDMMYYYY(state.filterByFromDate)
                          : ''
                      }`}
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
                      };
                    });
                  }}
                >
                  <Image
                    style={styles.graphIcon}
                    source={IMAGES.GraphIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </HStack>
            ) : (
              <></>
            )}
          </HStack>

          {state.isReportLoading ? (
            <View height={323} justifyContent={'center'} alignItems={'center'}>
              <ActivityIndicator size="large" color={COLORS.brown_500} />
            </View>
          ) : state.isAllInOneGraphOpen ? (
            state.allGraphReportData?.length > 0 ? (
              <View
                justifyContent={'center'}
                height={323}
                backgroundColor={COLORS.brown_400}
                mt={5}
                borderRadius={16}
                width={355}
                ml={2}
                mr={2}
              >
                {state.allInOneReportData.graphData?.map(
                  (item: GraphSingleData) => {
                    return (
                      <PercentageBar
                        height={8}
                        backgroundColor={COLORS.brown_200}
                        completedColor={COLORS.brown_300}
                        item={item}
                      />
                    );
                  }
                )}
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
                  source={
                    state.groupTabList?.length === 0
                      ? IMAGES.NoGroupDataIcon
                      : IMAGES.NoReportsDataIcon
                  }
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
                    {state.groupTabList?.length === 0
                      ? `No data available, Please add groups and farms to start`
                      : `No reports available, Connect your device and start testing soil in seconds!`}
                  </Text>
                </View>
              </View>
            )
          ) : state.allGraphReportData?.length > 0 ? (
            <SwiperFlatList index={0}>
              {state.allGraphReportData?.map((item: any) => {
                return (
                  <View
                    justifyContent={'center'}
                    height={323}
                    backgroundColor={
                      state.isFarmReport ? COLORS.white : COLORS.brown_400
                    }
                    mt={5}
                    borderRadius={16}
                    width={355}
                    ml={2}
                    mr={2}
                  >
                    <Text
                      mb={2}
                      fontSize={16}
                      fontWeight={500}
                      fontFamily={'Poppins-Regular'}
                      color={state.isFarmReport ? COLORS.black : COLORS.white}
                      style={{marginLeft: 5, paddingLeft: 5}}
                    >
                      {item.graphHeader}
                    </Text>

                    <BarChart
                      barWidth={8}
                      //noOfSections={3}
                      barBorderRadius={4}
                      frontColor="lightgray"
                      data={item.graphData}
                      yAxisThickness={0}
                      xAxisThickness={0}
                      labelWidth={60}
                      width={305}
                      xAxisLabelTextStyle={{
                        fontSize: 10,
                        color: state.isFarmReport ? COLORS.black : COLORS.white,
                      }}
                      yAxisTextStyle={{
                        color: state.isFarmReport ? COLORS.black : COLORS.white,
                      }}
                    />
                  </View>
                );
              })}
            </SwiperFlatList>
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
                source={
                  state.groupTabList?.length
                    ? IMAGES.NoGroupDataIcon
                    : IMAGES.NoReportsDataIcon
                }
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
                  {state.groupTabList?.length
                    ? `No data available, Please add groups and farms to start`
                    : `No reports available, Connect your device and start testing soil in seconds!`}
                </Text>
              </View>
            </View>
          )}
          {state.groupTabList?.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{marginTop: 10}}
            >
              {state.groupTabList?.length > 0 &&
                state.groupTabList?.map((item: CreateGroupItems) => {
                  return (
                    <GroupTabItem
                      item={item}
                      isSelectedGroup={state.isSelectedGroup}
                      isFarmReport={state.isFarmReport}
                      onTabClick={() => {
                        setState((prev) => {
                          return {
                            ...prev,
                            isSelectedGroup: item,
                          };
                        });
                        if (item?.group_id) {
                          setState((prev) => {
                            return {
                              ...prev,
                              isFarmLoading: true,
                              isSelectedFarmItem: {} as CreateFarmsItems,
                              isFarmReport: false,
                            };
                          });
                          fetchGroupByFarmList(item?.group_id);
                          getAllReportByGroup(
                            item.group_id,
                            state.filterByToDate,
                            state.filterByFromDate
                          );
                        }
                      }}
                      onTabLongClick={() => {
                        setState((prev) => {
                          return {
                            ...prev,
                            openUpdateGroupModal: true,
                            isSelectedGroup: item,
                          };
                        });
                      }}
                    />
                  );
                })}
              <TouchableOpacity
                style={{
                  height: 34,
                  margin: 5,
                  //width: 'auto',
                  flexWrap: 'wrap',
                  paddingLeft: 4,
                  paddingRight: 4,
                  backgroundColor: COLORS.brown_300,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  alignSelf: 'center',
                }}
                onPress={() => {
                  setState((prev) => {
                    return {
                      ...prev,
                      openAddGroupModal: true,
                    };
                  });
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    flex: 1,
                    alignSelf: 'center',
                    justifyContent: 'center',
                    textAlignVertical: 'center',
                  }}
                >
                  {'Add New'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
          {state.groupTabList?.length === 0 && (
            <View flex={1} mb={10} mt={100} width={'100%'}>
              <Button
                text={'Create Group'}
                style={{
                  width: 180,
                  alignSelf: 'center',
                  backgroundColor: COLORS.brown_300,
                }}
                onPress={() => {
                  setState((prev) => {
                    return {
                      ...prev,
                      openAddGroupModal: true,
                    };
                  });
                }}
              />
            </View>
          )}
          {state.isFarmLoading ? (
            <View justifyContent={'center'} alignItems={'center'}>
              <ActivityIndicator size="large" color={COLORS.brown_500} />
            </View>
          ) : state.groupByFarmList?.length > 0 ? (
            <View height={330}>
              <FlatList
                data={state.groupByFarmList}
                renderItem={({item}) => {
                  return (
                    <GroupByItemList
                      item={item}
                      isSelectedFarmItem={state.isSelectedFarmItem}
                      onItemClick={() => {
                        if (!item.sampleCount) {
                          openCollectFarm(item);
                        } else {
                          setState((prev) => {
                            return {
                              ...prev,
                              isSelectedFarmItem: item,
                            };
                          });
                          if (item.sampleCount > 0) {
                            getAllReportByFarmLists(
                              item,
                              state.filterByToDate,
                              state.filterByFromDate
                            );
                          }
                        }
                      }}
                      onEditClick={() => {
                        setState((prev) => {
                          return {
                            ...prev,
                            openAddNewFarmModal: true,
                            isEditFarm: true,
                          };
                        });
                      }}
                      onItemPlusClick={() => {
                        openCollectFarm(item);
                      }}
                      onDeleteClick={() => {
                        openConfirmationAlert(
                          `Are You Sure You Want to Delete ${item.farm_name} ?`,
                          true
                        );
                      }}
                    />
                  );
                }}
                keyExtractor={(item, index) => index + item.farm_id + ''}
              />
            </View>
          ) : (
            <></>
            // <View mt={10} justifyContent={'center'} alignItems={'center'}>
            //   <Text color={COLORS.black_200}>No Samples Available</Text>
            // </View>
          )}
        </VStack>

        {state.groupTabList?.length > 0 && (
          <View
            flex={1}
            mb={10}
            mt={Dimensions.get('window').height - 100}
            position={'absolute'}
            width={'100%'}
          >
            <Button
              text={'Add New Farm'}
              style={{
                width: 180,
                alignSelf: 'center',
                backgroundColor: COLORS.brown_300,
              }}
              onPress={() => {
                setState((prev) => {
                  return {
                    ...prev,
                    openAddNewFarmModal: true,
                    isSelectedFarmItem: {} as CreateFarmsItems,
                  };
                });
              }}
            />
          </View>
        )}
      </VStack>

      {state.openAddGroupModal && (
        <AddNewGroupModal
          visible={state.openAddGroupModal}
          closeAble={state.groupTabList.length !== 0 ? true : false}
          onClose={() => {
            setState((prev) => {
              return {
                ...prev,
                openAddGroupModal: false,
              };
            });
          }}
          onSubmit={(text: any) => {
            addNewGroup(text);
          }}
        />
      )}

      {state.openUpdateGroupModal && (
        <UpdateGroupModal
          visible={state.openUpdateGroupModal}
          isSelectedGroup={state.isSelectedGroup}
          onClose={() => {
            setState((prev) => {
              return {
                ...prev,
                openUpdateGroupModal: false,
              };
            });
          }}
          onUpdate={(text: any) => {
            onUpdateGroupName(text);
          }}
          onDelete={(item: CreateGroupItems) => {
            openConfirmationAlert(
              `Are You Sure You Want to Delete ${item.group_name} ?`,
              false
            );
          }}
        />
      )}

      {state.openAddNewFarmModal && (
        <AddNewFarmModal
          visible={state.openAddNewFarmModal}
          isSelectedFarmItem={state.isSelectedFarmItem}
          isEdit={state.isEditFarm}
          onClose={() => {
            setState((prev) => {
              return {
                ...prev,
                openAddNewFarmModal: false,
                isEditFarm: false,
                isSelectedFarmItem: {} as CreateFarmsItems,
                isFirstGroupCreated: false,
              };
            });
          }}
          onSubmit={(
            farmName: string,
            farmField: string,
            isEditFarm: boolean,
            image?: string
          ) => {
            addNewFarm(farmName, farmField, isEditFarm, image);
            setState((prev) => {
              return {
                ...prev,
                isFirstGroupCreated: false,
              };
            });
          }}
        />
      )}
      {state.openDatePicker && (
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
              };
            });
            getAllReportByDate(
              dateFormatToUTC(startDate),
              endDateFormatToUTC(endDate)
            );
          }}
        />
      )}
    </View>
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
  graphIconBg: {
    backgroundColor: COLORS.brown_400,
    height: 32,
    width: 32,
    borderRadius: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarIcon: {
    height: 14,
    width: 14,
    alignSelf: 'center',
  },
  pagerView: {
    flex: 1,
    height: 350,
  },
});

export default Home;
