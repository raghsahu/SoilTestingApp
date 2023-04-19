import React, { useCallback, useEffect, useState } from 'react';
//ASSETS
import { COLORS, IMAGES } from '../assets';

import {BackHandler, StyleSheet, TouchableOpacity } from 'react-native';
import { VStack, Text, View, HStack, Image } from 'native-base';
import { Statusbar, Header } from '../components';
import { UserInterface } from '../utils/Interfaces';
import { getUserData } from '../utils/CommonUtils';
import { useFocusEffect } from '@react-navigation/native';

const Profile = (props: any) => {
    const [user, setUser] = useState({} as UserInterface);

    useEffect(()=> {
        getProfileDataFromLocalStorage();
    }, [props])

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

    return (
        <View style={styles.container}>
            <Statusbar />
            <VStack marginTop={10}>
                <Header
                    onBack={() => {
                        props.navigation.goBack();
                    }}
                    label={'My Profile'}
                ></Header>
                
                <VStack marginLeft={5} marginRight={5}>
                    <HStack marginTop={10} alignItems={'center'}>
                        <Image
                            style={styles.profileImage}
                            source={user?.photoURL?.length ? { uri: user.photoURL} : IMAGES.ProfileIcon}
                            resizeMode="contain"
                        />
                        <VStack paddingLeft={5}>
                            <Text
                                fontFamily={'Poppins-Regular'}
                                fontStyle={'normal'}
                                fontWeight={500}
                                fontSize={20}
                                color={COLORS.textColor}
                            >
                                {user?.name || user?.phoneNumber}
                            </Text>
                            <Text
                                fontFamily={'Poppins-Regular'}
                                fontStyle={'normal'}
                                fontWeight={500}
                                fontSize={16}
                                color={COLORS.subTextColor}
                            >
                                {user?.email}
                            </Text>
                        </VStack>
                    </HStack>

                    <TouchableOpacity
                        onPress={() => {
                            props.navigation.navigate('EditProfile', {user: user})
                        }}
                    >
                        <HStack marginTop={20}>
                            <HStack flex={.9}
                            >
                                <Image
                                    style={styles.editProfileIcon}
                                    source={IMAGES.EditProfileIcon}
                                    resizeMode="contain"
                                />

                                <Text
                                    fontFamily={'Poppins-Regular'}
                                    fontStyle={'normal'}
                                    fontWeight={500}
                                    fontSize={16}
                                    color={COLORS.black_300}
                                    paddingLeft={5}
                                    paddingTop={2}
                                >
                                    Edit Profile
                                </Text>
                            </HStack>

                            <View justifyContent={'center'} alignContent={'center'} flex={.1} >
                                <Image
                                    style={styles.rightArrowIcon}
                                    source={IMAGES.RightArrowIcon}
                                    resizeMode="contain"
                                />
                            </View>
                        </HStack>
                    </TouchableOpacity>
                </VStack>
            </VStack>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1.0,
        backgroundColor: COLORS.white,
    },
    profileImage: {
        height: 80,
        width: 80,
        borderRadius: 40,
    },
    editProfileIcon: {
        height: 43,
        width: 43,
        borderRadius: 22,
    },
    rightArrowIcon: {
        height: 18,
        width: 18,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Profile;
