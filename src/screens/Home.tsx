import React, {useCallback, useEffect, useState} from 'react';
//ASSETS
import {COLORS, IMAGES} from '../assets';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {VStack, Text, View, HStack, Image, ScrollView} from 'native-base';
import {Button, Statusbar, Header, GroupTabItem} from '../components';
import {BarChart} from 'react-native-gifted-charts';
import {
  getGraphReportData,
} from '../utils/GraphData';
import GroupByItemList from '../components/GroupByItemList';
import AddNewGroupModal from '../components/AddNewGroupModal';
import UpdateGroupModal from '../components/UpdateGroupModal';
import AddNewFarmModal from '../components/AddNewFarmModal';
import {
  GetAllPermissions,
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
import {Codes, UsbSerialManager} from '../usbSerialModule';
import StartEndDatePicker from '../components/StartEndDatePicker';
import {SwiperFlatList} from 'react-native-swiper-flatlist';
import PercentageBar from '../components/PercentageBar';
import {BleManager, Device} from 'react-native-ble-plx';
import {deviceName} from '../utils/Ble_UART_At_Command';

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
    checkUsbSerial();
    getAllGroupLists();
  }, [props]);

  // Refresh data on focus
  useFocusEffect(
    useCallback(() => {
      getProfileDataFromLocalStorage();
      getAllReportByDate(state.filterByToDate, state.filterByFromDate);
      if (state.isSelectedGroup?.group_id) {
        setState((prev) => {
          return {
            ...prev,
            isFarmLoading: true,
          };
        });
        fetchGroupByFarmList(state.isSelectedGroup?.group_id);
      }
    }, [])
  );

  const checkUsbSerial = async () => {
    checkBleSerial();
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
      console.error(err);
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

  const getAllReportByGroup = async (
    groupData: CreateGroupItems,
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
      groupData.group_id,
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
            checkUsbSerial();
          }}
          label={
            state.connectedBleDevice?.name
              ? 'Device: ' + state.connectedBleDevice?.name
              : state.connectedUsbDevice?.deviceId
              ? 'Device Id: ' + state.connectedUsbDevice?.deviceId
              : 'No Device Connected'
          }
        ></Header>
        <ScrollView marginTop={5} showsVerticalScrollIndicator={false}>
          <VStack marginLeft={5} marginRight={5}>
            <HStack
              marginTop={5}
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
            </HStack>

            {state.isReportLoading ? (
              <View
                height={323}
                justifyContent={'center'}
                alignItems={'center'}
              >
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
                  flex={1}
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
                  height={323}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <Text color={COLORS.black_200}>No Reports Available</Text>
                </View>
              )
            ) : state.allGraphReportData?.length > 0 ? (
              <SwiperFlatList index={0}>
                {state.allGraphReportData?.map((item: any) => {
                  return (
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
                      <Text
                        mb={2}
                        fontSize={16}
                        fontWeight={500}
                        fontFamily={'Poppins-Regular'}
                        color={COLORS.white}
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
                        xAxisLabelTextStyle={{fontSize: 10}}
                      />
                    </View>
                  );
                })}
              </SwiperFlatList>
            ) : (
              <View
                height={323}
                justifyContent={'center'}
                alignItems={'center'}
              >
                <Text color={COLORS.black_200}>No Reports Available</Text>
              </View>
            )}
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
                            };
                          });
                          fetchGroupByFarmList(item?.group_id);
                          getAllReportByGroup(
                            item,
                            state.filterByToDate,
                            state.filterByFromDate)
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
                  height: 40,
                  margin: 5,
                  width: 83,
                  backgroundColor: COLORS.brown_300,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
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
                  }}
                >
                  {'Add New'}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {state.isFarmLoading ? (
              <View justifyContent={'center'} alignItems={'center'}>
                <ActivityIndicator size="large" color={COLORS.brown_500} />
              </View>
            ) : state.groupByFarmList?.length > 0 ? (
              <View overflow={'scroll'}>
                {state.groupByFarmList.map((item: CreateFarmsItems) => {
                  return (
                    <GroupByItemList
                      item={item}
                      isSelectedFarmItem={state.isSelectedFarmItem}
                      onItemClick={() => {
                        setState((prev) => {
                          return {
                            ...prev,
                            isSelectedFarmItem: item,
                          };
                        });
                        if (item.sampleCount > 1) {
                          getAllReportByFarmLists(
                            item,
                            state.filterByToDate,
                            state.filterByFromDate
                          );
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
                      onItemPlusClick={async () => {
                        if (Platform.OS === 'android') {
                          const devices = await UsbSerialManager.list();
                          if (devices?.length) {
                            try {
                              const deviceId = devices?.[0]?.deviceId;
                              await UsbSerialManager.tryRequestPermission(
                                deviceId
                              );
                              props.navigation.navigate('GroupItemDetails', {
                                farmData: item,
                              });
                            } catch (err) {
                              console.log('err', err);
                            }
                          } else {
                            await GetAllPermissions();
                            props.navigation.navigate('GroupItemDetails', {
                              farmData: item,
                            });
                          }
                        } else {
                          props.navigation.navigate('GroupItemDetails', {
                            farmData: item,
                          });
                        }
                      }}
                      onDeleteClick={() => {
                        openConfirmationAlert(
                          `Are You Sure You Want to Delete ${item.farm_name} ?`,
                          true
                        );
                      }}
                    />
                  );
                })}
              </View>
            ) : (
              <View mt={10} justifyContent={'center'} alignItems={'center'}>
                <Text color={COLORS.black_200}>No Samples Available</Text>
              </View>
            )}

            {state.groupTabList?.length > 0 && (
              <Button
                text={'Add New Farm'}
                style={{
                  marginTop: 20,
                  marginBottom: 20,
                  width: 200,
                  alignSelf: 'center',
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
            )}
          </VStack>
        </ScrollView>
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
