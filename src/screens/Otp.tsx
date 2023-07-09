import React, { useState } from 'react';
//ASSETS
import { COLORS, IMAGES } from '../assets';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { VStack, Text, Image} from 'native-base';
import { Button, Statusbar, Input } from '../components';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { firebase } from '@react-native-firebase/auth';
import { AsyncKey, showToast } from '../utils/CommonUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInterface } from '../utils/Interfaces';

const Otp = (props: any) => {
    const {mobileNo, verificationId} = props.route?.params;
    const [verificationCode, setVerificationCode] = useState('');
    const [otpVerificationId, setOtpVerificationId] = useState(verificationId);
    const [isLoading, setIsLoading] = useState(false);

    const handleVerificationCodeSubmit = async () => {
        setIsLoading(true);
        try {
            const credential = firebase.auth.PhoneAuthProvider.credential(
              otpVerificationId,
              verificationCode,
            );
           const verifyRes = await firebase.auth().signInWithCredential(credential);
           const userData={
            phoneNumber: verifyRes?.user?.phoneNumber,
            uid: verifyRes?.user?.uid,
            name: verifyRes?.user?.displayName,
            email: verifyRes?.user?.email,
            photoURL: verifyRes?.user?.photoURL,
           //dob: '',
          } as UserInterface;
          
          await AsyncStorage.setItem(AsyncKey.user, JSON.stringify(userData));
           setIsLoading(false);
           showToast('Mobile verification successfully') 
           props.navigation.navigate('Home', {mobileNo: mobileNo})
        //    props.navigation.dispatch(
        //     StackActions.reset({
        //       index: 0,
        //       routes: [{ name: 'Home', para }],
        //     }),
        //   );
        } catch (error) {
            setIsLoading(false);
            console.log('error ', error)
            Alert.alert('Error', ''+ error);
          }
      };

      const resendOtp = async () => {
        setIsLoading(true);
        try {
          const phoneNumberWithCode = mobileNo; // Include country code
          const confirmation: any = await firebase.auth().signInWithPhoneNumber(phoneNumberWithCode);
         if(confirmation?._verificationId){
           setIsLoading(false);
           setOtpVerificationId(confirmation?._verificationId);
           showToast('Otp resend successfully')
         }
        } catch (error) {
          console.log(error);
          showToast('' + error)
          setIsLoading(false);
        }
      };

    return (
        <View style={styles.container}>
            <Statusbar />
            <VStack marginLeft={5} marginRight={5}>
                <TouchableOpacity
                 onPress={()=> {
                    props.navigation.goBack(); 
                  }}
                >
                    <Image
                        height={'20px'}
                        width={'20px'}
                        source={IMAGES.BackIcon}
                        resizeMode="contain"
                        marginTop={5}
                    />
                    
                </TouchableOpacity>
                <Text fontFamily={'Poppins-Regular'} height={100} fontStyle={'normal'} marginTop={20} fontWeight={500} fontSize={33} color={COLORS.black_400} textAlign={'left'}>Enter OTP </Text>
                <VStack marginTop={'30%'}>
                    <Text fontFamily={'Poppins-Regular'}
                        height={100} fontStyle={'normal'}
                        fontWeight={500}
                        fontSize={16} color={COLORS.black_400}
                        textAlign={'left'}>
                        {'An 6 digit code has been sent to \n'+ mobileNo}
                    </Text>
                    <Input
                        style={{marginTop: 5}}
                        placeholder={'Enter OTP'}
                        keyboardType="numeric"
                        inputText={verificationCode}
                        onChangeText={(text: string) => setVerificationCode(text)}
                    />

                    <Button
                        text={'Submit'}
                        style={{ marginTop: 30 }}
                        onPress={() => {
                            handleVerificationCodeSubmit();
                        }}
                    />
                    <TouchableOpacity
                        onPress={() => {
                            resendOtp();
                        }}
                    >
                        <Text fontFamily={'Poppins-Regular'} fontStyle={'normal'} marginTop={5} fontWeight={500} fontSize={14} color={COLORS.black_400} textAlign={'center'}>Resend OTP</Text>
                    </TouchableOpacity>
                </VStack>
            </VStack>
            {isLoading && <ActivityIndicator size="large" color={COLORS.brown_500} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1.0,
        backgroundColor: COLORS.white,
    },
});

export default Otp;
