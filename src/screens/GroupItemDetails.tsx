import React, { useCallback, useEffect, useState } from 'react';
//ASSETS
import { COLORS, IMAGES } from '../assets';

import { BackHandler, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
//import { RNText } from '../components';
import { VStack, Text, View, HStack, Image, ScrollView, } from 'native-base';
import { Button, Statusbar, Input, Header, GroupTabItem } from '../components';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { barData } from '../utils/GraphData';
import { groupByDataList, groupTabList } from '../utils/GroupData';
import GroupByItemList from '../components/GroupByItemList';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncKey, getDeviceData } from '../utils/CommonUtils';
import { BleManager, Characteristic, Device } from 'react-native-ble-plx';

const manager = new BleManager();

const GroupItemDetails = (props: any) => {
    const [state, setState] = useState({
        openAddGroupModal: false,
    });
    const [connectedDevice, setConnectedDevice] = useState({} as any);
    const command = 'AT+PH?'

    useEffect(() => {
        const backAction = () => {
            props.navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        // Subscribe to BLE state changes
        const subscription = manager.onStateChange(state => {
          if (state === 'PoweredOn') {
            checkDeviceAndConnect();
          }
        }, true);
        // Cleanup function
        return () => subscription.remove();
      }, []);

      const checkDeviceAndConnect = useCallback(async () => {
        const device = await getDeviceData();
        if (device) {
            // Check if device is connected
            if (device?.id) {
                connectToDevice(device)
            }
        }else{
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
          if (device?.name === 'SS_7IN1') {
            AsyncStorage.setItem(AsyncKey.device, JSON.stringify(device));
            setConnectedDevice(device)
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
            const connectedDevice = await manager.connectToDevice(device.id);
            setConnectedDevice(connectedDevice)
          console.log(`Connected to device: ${device.name} (${device.id})`);
          discoverServices(connectedDevice);
        } catch (error) {
          console.log(`Error connecting to device: ${device.name} (${device.id})`);
          console.log(error);
        }
      };
      
      const discoverServices = async (device: Device) => {
        try {
            await device.discoverAllServicesAndCharacteristics();
            const services = await device.services();
            services.forEach(async service => {
             // console.log(`Service UUID: ${service.uuid}`);
            
              const characteristics = await service.characteristics();
              characteristics.forEach(async characteristic => {
              //  console.log(`Characteristic UUID: ${ JSON.stringify(characteristic)}`);

                if(characteristic?.isWritableWithResponse){
                    const base64String = btoa(command);
                    await characteristic.writeWithResponse(base64String);
                }
                if(characteristic?.isNotifiable){
                   // subscribeToNotifications(characteristic);
                    
                    device.monitorCharacteristicForService(service.uuid, characteristic.uuid, (error, characteristic) => {
                     if (error) {
                       console.error(error);
                       return;
                     }
                     const readableString = atob(characteristic?.value || '');
                     console.log('rrr555',readableString);
                   });
                 }
               // const value = await characteristic.read();
                //console.log(`Characteristic value: ${JSON.stringify(value)}`);
              });
            });
        } catch (error) {
          console.log(`Error discovering services for device: ${device.name} (${device.id})`);
          console.log(error);
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
    // useEffect(() => {
    //     checkDeviceAndConnect();
    // }, []);

    // const checkDeviceAndConnect = useCallback(async () => {
    //     let blePeripheral = null as any;
    //     let blePeripheral1 = null as any;
    //     BleManager.start({ showAlert: false });
    //     const device = await getDeviceData();
    //     if (device) {
    //         BleManager.isPeripheralConnected(device.id)
    //             .then((isConnected) => {
    //                 if (isConnected) {
    //                     console.log('Device is connected');
    //                     setDevices(device)
    //                     retrieveServices(device);
                       
    //                 } else {
    //                     console.log('Device is not connected');
    //                     BleManager.connect(device?.id).then(() => {
    //                         setDevices(device)
    //                         retrieveServices(device);
    //                     });
    //                 }
    //                 blePeripheral1 = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValue);
    //             })
    //             .catch((error) => {
    //                 console.log('Error checking device connection:', error);
    //             });
    //     } else {
    //         blePeripheral = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    //         startScan();
    //     }
    //     return () => {
    //         BleManager.stopScan();
    //         blePeripheral.remove();
    //         blePeripheral1.remove();
    //     };
    // }, []);

    // const startScan = () => {
    //     BleManager.scan([], 10, true).then(results => {
    //         console.log("Scanning...");
    //     });
    // }

    // const handleUpdateValue = (data: any) => {
    //     console.log('handleUpdateValue:', data);
    // }

    // const handleDiscoverPeripheral = (device: any) => {
    //    // console.log('Discovered device:', device);
    //     //{"advertising": {"isConnectable": true, "localName": "SS_7IN1", 
    //     // "manufacturerData": {"CDVType": "ArrayBuffer", "bytes": [Array], 
    //     //"data": "AgEGBRIgAEAACAlTU183SU4xAgoDBRIgAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="},
    //     //"serviceData": {}, "serviceUUIDs": [], "txPowerLevel": 3}, "id": "EC:62:60:9C:04:4E", "name": "SS_7IN1", "rssi": -42}

    //     if (device.name === 'SS_7IN1') {
    //         BleManager.stopScan();
    //         setDevices(device)
    //         AsyncStorage.setItem(AsyncKey.device, JSON.stringify(device));
    //         BleManager.connect(device?.id).then(() => {
    //             retrieveServices(device);
    //         });
    //     }
    // };

    // const retrieveServices = (device: any) => {
    //     BleManager.retrieveServices(device.id).then((peripheralInfo) => {
    //         // console.log('rrr4',peripheralInfo);
    //          setPeripheralInfo(peripheralInfo)
    //         getCharacteristicData(device, peripheralInfo)

    //      });
    // }

    // const getCharacteristicData = async (device: any, peripheralInfo: any) => {
    //   // console.log('Discovered device:', device);
    //     //console.log('rrr433', JSON.stringify(peripheralInfo));
    //     if (peripheralInfo?.characteristics) {
    //         for (let i = 0; i < peripheralInfo.characteristics?.length; i++) {
    //             // write the data to the characteristic
    //             if (peripheralInfo.characteristics?.[i]?.properties?.Write) {
    //                 const serviceUUID = peripheralInfo.characteristics?.[i]?.service || '';
    //                 const characteristicUUID = peripheralInfo.characteristics?.[i]?.characteristic || '';
    //                 const byteArray = command.split('').map(char => char.charCodeAt(0));
    //                 // await BleManager.startNotification(device?.id, serviceUUID, characteristicUUID);

    //                 BleManager.write(device?.id, serviceUUID, characteristicUUID, byteArray)
    //                     .then(() => {
    //                         console.log('Data written successfully');
    //                         // if (peripheralInfo.characteristics?.[i]?.properties?.Notify) {
    //                         //     if (peripheralInfo.characteristics?.[i]?.descriptors?.[0]?.uuid) {
    //                             console.log('rrr44 ', serviceUUID,characteristicUUID)
    //                                 BleManager.readDescriptor(device?.id, serviceUUID, characteristicUUID, '2902')
    //                                     .then((descriptor) => {
    //                                         console.log('Descriptor value:', descriptor);
    //                                         const sensorData = bin2String(descriptor);
    //                                         console.log('Descriptor string:', sensorData);
    //                                     })
    //                                     .catch((error) => {
    //                                         console.log('Error reading descriptor:', error);
    //                                     });
    //                            // }

    //                        // }
    //                     })
    //                     .catch((error) => {
    //                         console.log('Error writing data:', error);
    //                     });
    //             }
    //             // if (peripheralInfo.characteristics?.[i]?.properties?.Read) {
    //             //     BleManager.read(device?.id, serviceUUID, characteristicUUID)
    //             //         .then((readData) => {
    //             //             if (readData) {
    //             //                 // Read data is returned as an array of bytes
    //             //                 const sensorData = bin2String(readData);
    //             //                 console.log('Read data:', sensorData);
    //             //             }
    //             //         })
    //             //         .catch((error) => {
    //             //             console.log('Read error:', error);
    //             //         });
    //             // }
    //             //////
               
           
    //         }
    //     }
    // }
    // function bin2String(array: any) {
    //     let result = "";
    //     for (let i = 0; i < array.length; i++) {
    //       result += String.fromCharCode(array[i]);
    //     }
    //     return result;
    //   }

    return (
        <>
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
                                onPress={async () => {
                                    // props.navigation.goBack();
                                   const isConnected= await manager.isDeviceConnected(connectedDevice.id);
                                   if(isConnected){
                                    discoverServices(connectedDevice);
                                   }else{
                                    connectToDevice(connectedDevice)
                                   }
                                }}
                            />
                        </VStack>
                    </ScrollView>
                </VStack>
            </View>
        </>
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
