import React, { useEffect, useState } from 'react';
//ASSETS
import { COLORS, IMAGES } from '../assets';

import { BackHandler, StyleSheet, TouchableOpacity } from 'react-native';
import { VStack, Text, View, HStack, } from 'native-base';
import { Button, Statusbar, Input, Header, DateTimePicker, CircleImageBackground } from '../components';
import { AsyncKey, dateFormatToDDMMYYYY, removeCountryCodeFromPhoneNumber, showToast } from '../utils/CommonUtils';
import firebase from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaType, launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const EditProfile = (props: any) => {
    const { user } = props.route?.params;
    const usersRef = firebase.database().ref('users');
    const [state, setState] = useState({
        isLoading: false,
        name: user?.name || '',
        email: user?.email || '',
        dob: user?.dob || '',
        mobileNo: removeCountryCodeFromPhoneNumber(user?.phoneNumber) || '',
        photoUrl: user?.photoURL || '',
        openDatePicker: false,
        uid: user?.uid,
    });

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

    const onUpdateProfile = () => {
        if(!state.name){
            showToast('Please enter name')
        }else if(!state.email){
            showToast('Please enter email')
        }else if(!state.mobileNo){
            showToast('Please enter mobile no')
        }else {
            saveProfileToFirebase();
        }
    }

    const saveProfileToFirebase = async () => {
        const userData = {
            name: state.name,
            email: state.email,
            dob: state.dob,
            phoneNumber: state.mobileNo,
            uid: user.uid,
            photoURL: state.photoUrl,
        };

        // Find the user with a specific user ID
        const userId = user.uid;
        const userRef = usersRef.child(userId);
        if (userRef) {
            // Update the user's email address
            userRef.update(userData)
                .then(async (res) => {
                    showToast('Update profile successfully')
                    await AsyncStorage.setItem(AsyncKey.user, JSON.stringify(userData));
                    props.navigation.goBack();
                })
                .catch((error) => {
                    console.error('Error saving user:', error);
                });
        } else {
            usersRef.set(userData)
                .then(async () => {
                    showToast('Update profile successfully')
                    await AsyncStorage.setItem(AsyncKey.user, JSON.stringify(userData));
                    props.navigation.goBack();
                })
                .catch((error) => {
                    console.error('Error saving user:', error);
                });

        }
    }

    const options= {
        selectionLimit: 1,
        mediaType: 'photo' as MediaType,
        includeBase64: false,
      }
      
    const handlePickFromGallery = async () => {
        const result = await launchImageLibrary(options);
        uploadImage(result?.assets?.[0])
    };

    const uploadImage = async (image: any) => {
        // Check if an image is selected
        if (!image) {
            return;
        }
        // Create a reference to the Firebase Storage path
        const ref = storage().ref(`images/${image.fileName}`);
        // Upload the image to Firebase Storage
         await ref.putFile(image.uri);

         getImageDownloadURL(ref)
        
    };

    const getImageDownloadURL = async (ref: any) => {
        try {
          const url = await ref.getDownloadURL();
          console.log('Image download URL: ', url);
          if (url) {
            setState({
                ...state,
                photoUrl: url || '',
            })
        }
          //return url;
        } catch (error) {
          console.log('Error getting image download URL: ', error);
        }
      };

    return (
        <View style={styles.container}>
            <Statusbar />
            <VStack marginTop={10}>
                <Header
                    onBack={() => {
                        props.navigation.goBack();
                    }}
                    label={'Edit Profile'}
                ></Header>

                <VStack marginLeft={5} marginRight={5}>
                    <HStack marginTop={20}>
                    <TouchableOpacity onPress={handlePickFromGallery}>
                        <CircleImageBackground
                            style={styles.profileImage}
                            source={state.photoUrl.length ? { uri: state.photoUrl}: IMAGES.GrayBgIcon}
                            showGalleryIcon={state.photoUrl.length ? false : true}
                        />
                        </TouchableOpacity>
                        <VStack paddingLeft={5} alignSelf={'center'}>
                            <Text
                                fontFamily={'Poppins-Regular'}
                                fontStyle={'normal'}
                                fontWeight={500}
                                fontSize={20}
                                color={COLORS.textColor}
                            >
                                Upload Image
                            </Text>

                        </VStack>
                    </HStack>

                    <VStack mt={10}>
                        <HStack width={'100%'} justifyContent={'space-between'} alignContent={'center'}>
                            <Text
                                fontSize={16}
                                fontWeight={500}
                                fontFamily={'Poppins-Regular'}
                                color={COLORS.black_200}
                                style={{ alignSelf: 'center', justifyContent: 'center' }}
                            >
                                Full Name :
                            </Text>
                            <Input
                                placeholder={'Enter Full Name'}
                                style={{ width: 250, marginLeft: 5 }}
                                type={1}
                                inputText={state.name}
                                onChangeText={(text: string) => {
                                    setState({
                                        ...state,
                                        name: text,
                                    })
                                }}
                            />
                        </HStack>

                        <HStack width={'100%'} justifyContent={'space-between'} alignContent={'center'}>
                            <Text
                                fontSize={16}
                                fontWeight={500}
                                fontFamily={'Poppins-Regular'}
                                color={COLORS.black_200}
                                style={{ alignSelf: 'center', justifyContent: 'center' }}
                            >
                                Email ID :
                            </Text>
                            <Input
                                placeholder={'Enter Email ID'}
                                style={{ width: 250, marginLeft: 5, }}
                                type={1}
                                inputText={state.email}
                                onChangeText={(text: string) => {
                                    setState({
                                        ...state,
                                        email: text,
                                    })
                                }}
                            />
                        </HStack>
                        <HStack width={'100%'} justifyContent={'space-between'} alignContent={'center'}>
                            <Text
                                fontSize={16}
                                fontWeight={500}
                                fontFamily={'Poppins-Regular'}
                                color={COLORS.black_200}
                                style={{ alignSelf: 'center', justifyContent: 'center' }}
                            >
                                DOB :
                            </Text>
                            <TouchableOpacity
                            onPress={()=> {
                                setState({
                                    ...state,
                                    openDatePicker: true,
                                })
                            }}
                            >
                            <Input
                                placeholder={'Enter DOB'}
                                style={{ width: 250, marginLeft: 5 }}
                                type={1}
                                inputText={state.dob}
                                isEdit={false}
                                onChangeText={(text: string) => {
                                    setState({
                                        ...state,
                                        dob: text,
                                    })
                                }}
                                onRight={() => {
                                    console.log('')
                                }}
                            />
                            </TouchableOpacity>
                        </HStack>
                        <HStack width={'100%'} justifyContent={'space-between'} alignContent={'center'}>
                            <Text
                                fontSize={16}
                                fontWeight={500}
                                fontFamily={'Poppins-Regular'}
                                color={COLORS.black_200}
                                style={{ alignSelf: 'center', justifyContent: 'center' }}
                            >
                                Mobile No :
                            </Text>
                            <Input
                                placeholder={'Enter Mobile No'}
                                style={{ width: 250, marginLeft: 5 }}
                                type={1}
                                isEdit={false}
                                inputText={state.mobileNo}
                                onChangeText={(text: string) => {
                                    setState({
                                        ...state,
                                        mobileNo: text,
                                    })
                                }}
                            />
                        </HStack>
                    </VStack>
                    <Button
                        text={'Save'}
                        style={{ marginTop: 40, width: 200, alignSelf: 'center' }}
                        onPress={() => {
                            onUpdateProfile();
                            //props.navigation.goBack();
                        }}
                    />
                </VStack>
            </VStack>
            {state.openDatePicker &&
                <DateTimePicker
                    selectedDate={state.dob}
                    onDateChange={(date: any) => {
                        setState({
                            ...state,
                            openDatePicker: false,
                            dob: dateFormatToDDMMYYYY(date),
                        })
                    }}
                />
            }
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
        justifyContent: 'center',
        alignContent: 'center',
        overflow: 'hidden',
    },
    editProfileIcon: {
        height: 36,
        width: 36,
        alignSelf: 'center',
    },
    rightArrowIcon: {
        height: 18,
        width: 18,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EditProfile;
