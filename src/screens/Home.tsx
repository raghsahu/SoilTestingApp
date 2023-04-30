import React, { useCallback, useEffect, useState } from 'react';
//ASSETS
import { COLORS, IMAGES } from '../assets';
import { Alert, BackHandler, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { VStack, Text, View, HStack, Image, ScrollView, } from 'native-base';
import { Button, Statusbar, Header, GroupTabItem } from '../components';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { barData } from '../utils/GraphData';
import GroupByItemList from '../components/GroupByItemList';
import AddNewGroupModal from '../components/AddNewGroupModal';
import UpdateGroupModal from '../components/UpdateGroupModal';
import AddNewFarmModal from '../components/AddNewFarmModal';
import { GetAllPermissions, getUserData, showToast } from '../utils/CommonUtils';
import { deleteFarmData, deleteGroupData, fetchAllGroupByFarmList, fetchAllGroupData, initializeSoilDb, saveFarmData, saveGroupData, updateFarmData, updateGroupData } from '../database/SoilAppDB';
import { CreateFarmsItems, CreateGroupItems } from '../database/Interfaces';
import { useFocusEffect } from '@react-navigation/native';
import { UserInterface } from '../utils/Interfaces';
import { UsbSerialManager } from '../usbSerialModule';

const Home = (props: any) => {
    const db = initializeSoilDb();
    const [user, setUser] = useState({} as UserInterface);
    const [state, setState] = useState({
        isFarmLoading: false,
        openAddGroupModal: false,
        openUpdateGroupModal: false,
        openAddNewFarmModal: false,
        isEditFarm: false,
        groupTabList: [] as CreateGroupItems[],
        isSelectedGroup: {} as CreateGroupItems,
        groupByFarmList: [] as CreateFarmsItems[],
        isSelectedFarmItem: {} as CreateFarmsItems,
    });

    useEffect(() => {
        const backAction = () => {
            BackHandler.exitApp();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        getAllGroupLists();
    }, [props])

    useEffect(() => {
        if (state.isSelectedGroup?.group_id) {
            setState({
                ...state,
                isFarmLoading: true,
            })
            fetchGroupByFarmList(state.isSelectedGroup?.group_id);
        }
    }, [state.isSelectedGroup])

        // Refresh data on focus
  useFocusEffect(
    useCallback(() => {
      getProfileDataFromLocalStorage();
    }, [])
  );
  
  const getProfileDataFromLocalStorage = useCallback(async () => {
    // fetch data and update state
    const user= await getUserData();
        if(user){
            setUser(user);
        }
  }, []);

    const getAllGroupLists = async () => {
        const allGroupRes = await fetchAllGroupData(db);
        if (allGroupRes.length) {
            setState({
                ...state,
                groupTabList: allGroupRes,
                openAddGroupModal: false,
                openUpdateGroupModal: false,
                isSelectedGroup: state.isSelectedGroup?.group_id ? state.isSelectedGroup : allGroupRes[0],
            })
            //fetchGroupByFarmList(state.isSelectedGroup?.group_id || allGroupRes[0].group_id);
        }
    }

    const fetchGroupByFarmList = async (group_id: number) => {
        const allFarmRes = await fetchAllGroupByFarmList(db, group_id);
        if (allFarmRes?.length) {
            setState({
                ...state,
                groupByFarmList: allFarmRes,
                openAddNewFarmModal: false,
                isFarmLoading: false,
            })
        } else {
            setState({
                ...state,
                isFarmLoading: false,
            })
        }
    }

    const openConfirmationAlert = (title: string, isFarm: boolean) => {
        Alert.alert(
            '',
            title,
            [
                {
                    text: 'Yes', onPress: () => {
                        isFarm ? onDeleteFarm() : onDeleteGroup();
                    }
                },
                { text: 'No', onPress: () => console.log('No button clicked'), style: 'cancel' },
            ],
            {
                cancelable: true
            }
        );
    }

    const addNewGroup = async (groupName: string) => {
        if (groupName.length) {
            try {
                const newItem = {
                    group_name: groupName,
                    user_id: 1,
                    create_time: new Date(),
                } as CreateGroupItems;

                const saveGroupRes = await saveGroupData(db, newItem)
                if (saveGroupRes?.ok) {
                    showToast('Group created successfully')
                    getAllGroupLists();
                }
            } catch (err) {
                console.error(err);
            }

        } else {
            showToast('Please Enter Group Name')
        }
    }

    const onUpdateGroupName = async (groupName: string) => {
        if (groupName.length) {
            try {
                const newItem = {
                    group_name: groupName,
                    update_time: new Date(),
                } as CreateGroupItems;

                const updateGroupRes = await updateGroupData(db, newItem, state.isSelectedGroup)
                if (updateGroupRes?.ok) {
                    showToast('Group updated successfully')
                    getAllGroupLists();
                }
            } catch (err) {
                console.error(err);
            }

        } else {
            showToast('Please Enter Group Name')
        }
    }

    const onDeleteGroup = async () => {
        try {
            const updateGroupRes = await deleteGroupData(db, state.isSelectedGroup)
            if (updateGroupRes?.ok) {
                showToast('Group deleted successfully')
                setState({
                    ...state,
                    isSelectedGroup: {} as CreateGroupItems,
                })
                getAllGroupLists();
            }
        } catch (err) {
            console.error(err);
        }
    }


    const onDeleteFarm = async () => {
        try {
            const updateGroupRes = await deleteFarmData(db, state.isSelectedFarmItem)
            if (updateGroupRes?.ok) {
                showToast('Farm deleted successfully')
                setState({
                    ...state,
                    isSelectedFarmItem: {} as CreateFarmsItems,
                })
                fetchGroupByFarmList(state.isSelectedGroup?.group_id);
            }
        } catch (err) {
            console.error(err);
        }
    }

    const addNewFarm = async (farmName: string, farmField: string, isEditFarm: boolean, image?: string) => {
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
                    const saveFarmRes = await saveFarmData(db, newItem)
                    if (saveFarmRes?.ok) {
                        showToast('Farm created successfully')
                    }
                } else {
                    const updateFarmRes = await updateFarmData(db, newItem, state.isSelectedFarmItem)
                    if (updateFarmRes?.ok) {
                        showToast('Farm updated successfully')
                    }
                }
                fetchGroupByFarmList(state.isSelectedGroup?.group_id);
            } catch (err) {
                console.error(err);
            }

        } else {
            showToast('Please Enter All Fields')
        }
    }

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
                ></Header>
                <ScrollView marginTop={30} showsVerticalScrollIndicator={false}>
                    <VStack marginLeft={5} marginRight={5}>
                        <HStack marginTop={5} width={'100%'} justifyContent={'space-between'} alignContent={'center'}>
                            <Text
                                fontSize={16}
                                fontWeight={600}
                                fontFamily={'Poppins-Regular'}
                                color={COLORS.black_400}
                                style={{ alignSelf: 'center', justifyContent: 'center' }}
                            >
                                {'Soil Report'}
                            </Text>
                            <HStack>
                                <Text
                                    fontSize={10}
                                    fontWeight={500}
                                    fontFamily={'Poppins-Regular'}
                                    color={COLORS.black_200}
                                    style={{ paddingRight: 5, alignSelf: 'center', justifyContent: 'center' }}
                                >
                                    {'13 March 2023 - 31 March 2023'}
                                </Text>

                                <View
                                    style={styles.graphIconBg}
                                >
                                    <Image
                                        style={styles.graphIcon}
                                        source={IMAGES.GraphIcon}
                                        resizeMode="contain"
                                    />
                                </View>
                            </HStack>
                        </HStack>

                        <View justifyContent={'center'} height={323} backgroundColor={COLORS.brown_400} mt={5} borderRadius={16}>
                            <Text
                                fontSize={16}
                                fontWeight={500}
                                fontFamily={'Poppins-Regular'}
                                color={COLORS.white}
                                style={{ marginLeft: 5, paddingLeft: 5 }}
                            >
                                {'Ph Report'}
                            </Text>
                            <BarChart
                                barWidth={22}
                                noOfSections={3}
                                barBorderRadius={4}
                                frontColor="lightgray"
                                data={barData}
                                yAxisThickness={0}
                                xAxisThickness={0}
                            />
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                            {state.groupTabList?.length > 0 &&
                                state.groupTabList?.map((item: CreateGroupItems) => {
                                    return (
                                        <GroupTabItem
                                            item={item}
                                            isSelectedGroup={state.isSelectedGroup}
                                            onTabClick={() => {
                                                setState({
                                                    ...state,
                                                    isSelectedGroup: item,
                                                })
                                            }}
                                            onTabLongClick={() => {
                                                setState({
                                                    ...state,
                                                    openUpdateGroupModal: true,
                                                    isSelectedGroup: item,
                                                })
                                            }}
                                        />
                                    )
                                })
                            }
                            <TouchableOpacity
                                style={{
                                    height: 40,
                                    margin: 5,
                                    width: 83,
                                    backgroundColor: COLORS.brown_300,
                                    borderRadius: 8,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                onPress={() => {
                                    setState({
                                        ...state,
                                        openAddGroupModal: true,
                                    })
                                }}
                            >
                                <Text
                                    style={{
                                        color: COLORS.white
                                    }}
                                >
                                    {'Add New'}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {!state.isFarmLoading && state.groupByFarmList?.length > 0 && (
                            <View overflow={'scroll'}>
                                {state.groupByFarmList.map((item: CreateFarmsItems) => {
                                    return (
                                        <GroupByItemList
                                            item={item}
                                            isSelectedFarmItem={state.isSelectedFarmItem}
                                            onItemClick={() => {
                                                setState({
                                                    ...state,
                                                    isSelectedFarmItem: item,
                                                })
                                            }}
                                            onEditClick={() => {
                                                setState({
                                                    ...state,
                                                    openAddNewFarmModal: true,
                                                    isEditFarm: true,
                                                })
                                            }}
                                            onItemPlusClick={async () => {
                                                if(Platform.OS === 'android'){
                                                    const devices = await UsbSerialManager.list();
                                                    if(devices?.length){
                                                        try {
                                                            const deviceId= devices?.[0]?.deviceId;
                                                            await UsbSerialManager.tryRequestPermission(deviceId);
                                                            props.navigation.navigate('GroupItemDetails', {
                                                                farmData: item,
                                                            })
                                                        } catch (err: any) {
                                                            console.log('err',err);
                                                          }
                                                    }else{
                                                     await GetAllPermissions()
                                                     props.navigation.navigate('GroupItemDetails', {
                                                        farmData: item,
                                                    })
                                                    }
                                                }
                                                else{
                                                    props.navigation.navigate('GroupItemDetails', {
                                                        farmData: item,
                                                    })
                                                }
                                            }}
                                            onDeleteClick={() => {
                                                openConfirmationAlert(`Are You Sure You Want to delete ${item.farm_name} ?`, true)
                                            }}
                                        />
                                    )
                                })
                                }
                            </View>
                        )}

                        {state.groupTabList?.length > 0 &&
                            <Button
                                text={'Add New Farm'}
                                style={{ marginTop: 20, marginBottom: 20, width: 200, alignSelf: 'center' }}
                                onPress={() => {
                                    setState({
                                        ...state,
                                        openAddNewFarmModal: true,
                                        isSelectedFarmItem: {} as CreateFarmsItems,
                                    })
                                }}
                            />
                        }
                    </VStack>
                </ScrollView>
            </VStack>

            {state.openAddGroupModal && (
                <AddNewGroupModal
                    visible={state.openAddGroupModal}
                    onClose={() => {
                        setState({
                            ...state,
                            openAddGroupModal: false,
                        })
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
                        setState({
                            ...state,
                            openUpdateGroupModal: false,
                        })
                    }}
                    onUpdate={(text: any) => {
                        onUpdateGroupName(text)
                    }}
                    onDelete={(item: CreateGroupItems) => {
                        openConfirmationAlert(`Are You Sure You Want to delete ${item.group_name} ?`, false);
                    }}
                />
            )}

            {state.openAddNewFarmModal && (
                <AddNewFarmModal
                    visible={state.openAddNewFarmModal}
                    isSelectedFarmItem={state.isSelectedFarmItem}
                    isEdit={state.isEditFarm}
                    onClose={() => {
                        setState({
                            ...state,
                            openAddNewFarmModal: false,
                            isEditFarm: false,
                            isSelectedFarmItem: {} as CreateFarmsItems,
                        })
                    }}
                    onSubmit={(farmName: string, farmField: string, isEditFarm: boolean, image?: string) => {
                        addNewFarm(farmName, farmField, isEditFarm, image)
                    }}
                />
            )}
        </View>
    );
}

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
    }
});

export default Home;
