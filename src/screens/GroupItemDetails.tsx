import React, {useCallback, useEffect, useState} from 'react';
//ASSETS
import {COLORS, IMAGES} from '../assets';

import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {VStack, Text, View, HStack, Image, FlatList} from 'native-base';
import {Button, Statusbar, Header} from '../components';
import {BarChart} from 'react-native-gifted-charts';
import {getGraphReportData} from '../utils/GraphData';

import {
  GetAllPermissions,
  dateFormatToDDMMYYYY,
  dateFormatToUTC,
  endDateFormatToUTC,
} from '../utils/CommonUtils';
import {
  GraphBarDataInterface,
  GraphSingleData,
  USBDeviceInterface,
} from '../utils/Interfaces';
import {CreateFarmsItems, ReportByFarmItems} from '../database/Interfaces';
import {
  fetchAllReportDataByFarm,
  initializeSoilDb,
  updateFarmData,
} from '../database/SoilAppDB';
import ReportByFarmItemList from '../components/ReportByFarmItems';
import StartEndDatePicker from '../components/StartEndDatePicker';
import SwiperFlatList from 'react-native-swiper-flatlist';
import PercentageBar from '../components/PercentageBar';
import {UsbSerialManager} from '../usbSerialModule';

const GroupItemDetails = (props: any) => {
  const {farmData} = props.route?.params;
  const db = initializeSoilDb();
  const [state, setState] = useState({
    isFarmLoading: false,
    connectedBleDevice: {} as any,
    connectedUsbDevice: {} as USBDeviceInterface,
    isConnectedBy: '' as string,
    bleCharacteristic: [] as any,
    reportByFarmList: [] as ReportByFarmItems[],
    isSelectedFarmItem: {} as ReportByFarmItems,
    allGraphReportData: [] as GraphBarDataInterface[],
    allInOneReportData: {} as GraphBarDataInterface,
    filterByToDate: dateFormatToUTC(new Date().toString()),
    filterByFromDate: '',
    openDatePicker: false,
    isAllInOneGraphOpen: true,
    isFarmReport: false,
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
    GetAllPermissions();
    getAllReportByFarmLists(state.filterByToDate, state.filterByFromDate);
  }, [props]);

  const getAllReportByFarmLists = async (toDate: string, fromDate?: string) => {
    setState((prev) => {
      return {
        ...prev,
        isFarmLoading: true,
        isFarmReport: false,
        isSelectedFarmItem: {} as ReportByFarmItems,
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
    const allGraphReportData = await getGraphReportData([selectedSample]);
    setState((prev) => {
      return {
        ...prev,
        allGraphReportData: allGraphReportData.allSeparateGraph,
        allInOneReportData: allGraphReportData.allInOneGraph,
        isFarmReport: true,
      };
    });
  };

  const onRefreshFarm = (data: CreateFarmsItems) => {
    getAllReportByFarmLists(state.filterByToDate, state.filterByFromDate);
  };

  const openCollectFarm = async (item: CreateFarmsItems) => {
    if (Platform.OS === 'android') {
      const devices = await UsbSerialManager.list();
      if (devices?.length) {
        try {
          const deviceId = devices?.[0]?.deviceId;
          await UsbSerialManager.tryRequestPermission(deviceId);
          props.navigation.navigate('AddNewReport', {
            farmData: item,
            onGoBack: (data: CreateFarmsItems) => {
              onRefreshFarm(data);
            },
          });
        } catch (err) {
          console.log('err', err);
        }
      } else {
        await GetAllPermissions();
        props.navigation.navigate('AddNewReport', {
          farmData: item,
          onGoBack: (data: CreateFarmsItems) => {
            onRefreshFarm(data);
          },
        });
      }
    } else {
      props.navigation.navigate('AddNewReport', {
        farmData: item,
        onGoBack: (data: CreateFarmsItems) => {
          onRefreshFarm(data);
        },
      });
    }
  };
  const { width } = Dimensions.get('window');
  const slideWidth = width - 50;

  return (
    <>
      <VStack style={styles.container}>
        <Statusbar />
        <VStack marginTop={10}>
          <Header
            onBack={() => {
              props?.route?.params &&
                props?.route?.params?.onGoBack?.(farmData);
              props.navigation.goBack();
            }}
          ></Header>

          <VStack marginLeft={5} marginRight={5}>
            <HStack
              marginTop={8}
              width={'100%'}
              justifyContent={'space-between'}
              alignContent={'center'}
            >
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

                {state.allGraphReportData?.length ? (
                  <TouchableOpacity
                    disabled={state.isFarmReport}
                    style={[
                      styles.graphIconBg,
                      {
                        backgroundColor: !state.isFarmReport
                          ? COLORS.brown_400
                          : COLORS.brown_300,
                      },
                    ]}
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
                       key={state.isAllInOneGraphOpen ? 'graphIcon' : 'graphVerticalIcon'}
                      style={styles.graphIcon}
                      source={state.isAllInOneGraphOpen ? IMAGES.GraphIcon : IMAGES.GraphVerticalIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ) : (
                  <></>
                )}
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
            ) : state.isAllInOneGraphOpen ? (
              state.allInOneReportData?.graphData?.length > 0 ? (
                <View
                  justifyContent={'center'}
                  height={323}
                  width={370}
                  backgroundColor={COLORS.white}
                >
                  {state.allInOneReportData?.graphData.map(
                    (item: GraphSingleData) => {
                      return (
                        <PercentageBar
                          height={8}
                          backgroundColor={COLORS.brown_200}
                          completedColor={COLORS.brown_300}
                          labelColor={COLORS.black_300}
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
              )
            ) : state.isFarmReport ? (
              <View
                  justifyContent={'center'}
                  height={323}
                  width={370}
                  backgroundColor={COLORS.white}
                >
                  {state.allInOneReportData?.graphData.map(
                    (item: GraphSingleData) => {
                      return (
                        <PercentageBar
                          height={8}
                          backgroundColor={COLORS.brown_200}
                          completedColor={COLORS.brown_300}
                          labelColor={COLORS.black_300}
                          item={item}
                        />
                      );
                    }
                  )}
                </View>
            ) : state.allGraphReportData?.length > 0 ? (
              <View height={323} mt={2}>
              <SwiperFlatList
                data={state.allGraphReportData}
                renderItem={({item}) => (
                  <View style={styles.slide}>
                    <View
                      style={[styles.childContainer, {width: slideWidth}]}
                      height={323}
                      backgroundColor={
                        state.isFarmReport ? COLORS.white : COLORS.brown_400
                      }
                      borderRadius={16}
                    >
                      <Text
                        mb={2}
                        mt={2}
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
                        barBorderRadius={4}
                        frontColor="lightgray"
                        data={item.graphData}
                        yAxisThickness={0}
                        xAxisThickness={0}
                        labelWidth={40}
                        width={305}
                        rotateLabel={true}
                        xAxisLabelTextStyle={{
                          fontSize: 9,
                          color: state.isFarmReport
                            ? COLORS.black
                            : COLORS.white,
                        }}
                        yAxisTextStyle={{
                          color: state.isFarmReport
                            ? COLORS.black
                            : COLORS.white,
                        }}
                      />
                    </View>
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                horizontal
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
              ) : state.reportByFarmList?.length > 0 ? (
                <View height={380} mt={1}>
                  <FlatList
                    data={state.reportByFarmList}
                    renderItem={({item, index}) => {
                      return (
                        <ReportByFarmItemList
                          item={item}
                          isCollectingSamplePage={false}
                          collectingSampleText={
                            index === 0
                              ? 'Last sample collected'
                              : item.sampleCount + ' Samples collected'
                          }
                          isSelectedFarmItem={state.isSelectedFarmItem}
                          onItemClick={() => {
                            setState((prev) => {
                              return {
                                ...prev,
                                isSelectedFarmItem: item,
                              };
                            });
                            setSelectedGraphData(item);
                          }}
                        />
                      );
                    }}
                    keyExtractor={(item, index) => index + item.farm_id + ''}
                  />
                </View>
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
              text={'Add New'}
              style={{
                width: 180,
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: COLORS.brown_300,
              }}
              onPress={async () => {
                openCollectFarm(farmData);
              }}
            />
          </HStack>
        </VStack>

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
                  isSelectedFarmItem: {} as ReportByFarmItems,
                };
              });
              getAllReportByFarmLists(
                dateFormatToUTC(startDate),
                endDateFormatToUTC(endDate)
              );
            }}
          />
        )}
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
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childContainer: {
    marginRight: 5,
    marginLeft: 5,
    flex: 1,
  },
});

export default GroupItemDetails;
