import React, { useEffect, useState } from 'react';
//ASSETS
import { COLORS, IMAGES } from '../assets';

import { StyleSheet } from 'react-native';
import {  Text, View, HStack, Image, ScrollView, VStack, } from 'native-base';
import { Button, Statusbar, Input, Header, GroupTabItem } from '../components';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { barData } from '../utils/GraphData';
import { groupByDataList, groupTabList } from '../utils/GroupData';
import GroupByItemList from '../components/GroupByItemList';


const GroupItemDetails = (props: any) => {
    const [connected, setConnected] = useState(false);
    const [data, setData] = useState('');
    const [state, setState]= useState({
        openAddGroupModal: false,
    });

    useEffect(() => {
      console.log('rrr')
     // connectToDevice();
      }, []);
      
    return (
        <View style={styles.container}>
            <Statusbar />
            <VStack marginTop={10}>
                <Header
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
                                    style={{ paddingRight: 5, alignSelf: 'center', justifyContent: 'center' }}
                                >
                                    Group 01 - Tomato Field
                                </Text>
                                </VStack>
                            <HStack>
                                <Text
                                    fontSize={10}
                                    fontWeight={500}
                                    fontFamily={'Poppins-Regular'}
                                    color={COLORS.black_200}
                                    style={{ paddingRight: 5, alignSelf: 'center', justifyContent: 'center' }}
                                >
                                    13 March 2023 - 31 March 2023
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

                        <View justifyContent={'center'} height={323} backgroundColor={COLORS.white} mt={5} borderRadius={16}>
                            <Text
                                fontSize={16}
                                fontWeight={500}
                                fontFamily={'Poppins-Regular'}
                                color={COLORS.black}
                                style={{ marginLeft: 5, paddingLeft: 5 }}
                            >
                                EC Report
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

                        {/* <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={{ marginTop: 10 }}>
                            <GroupTabItem
                                item={groupTabList[0]}
                                isSelectedGroup={groupTabList[0]}
                            />
                        </ScrollView> */}

                        {/* <View overflow={'scroll'}>
                            <GroupByItemList
                                item={groupByDataList[0]}
                                isSelectedGroupItem={groupByDataList[0]}
                                isCollectingSamplePage={true}
                            />
                        </View> */}

                        <Button
                            text={'Save Record'}
                            style={{ marginTop: 20, marginBottom: 20, width: 200, alignSelf: 'center' }}
                            onPress={() => {
                                props.navigation.goBack();
                            }}
                        />
                    </VStack>
                </ScrollView>
            </VStack>
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

export default GroupItemDetails;
