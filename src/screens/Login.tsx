import React, { useState} from 'react';
//ASSETS
import {COLORS} from '../assets';
//PACKAGES
import {StyleSheet,  View} from 'react-native';
import { VStack, Text, } from 'native-base';
import { Button, Statusbar, Input } from '../components';
import { firebase } from '@react-native-firebase/auth';
import { countryCode, showToast } from '../utils/CommonUtils';

const Login = (props: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneNumberSubmit = async () => {
    try {
      const phoneNumberWithCode = countryCode + phoneNumber; // Include country code
      const confirmation: any = await firebase.auth().signInWithPhoneNumber(phoneNumberWithCode);
     if(confirmation?._verificationId){
       props.navigation.navigate('Otp', {
        mobileNo: phoneNumberWithCode,
        verificationId: confirmation?._verificationId,
      })
     }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
        <Statusbar/>
          <VStack marginLeft={5} marginRight={5}>
              <Text
                  fontFamily={'Poppins-Regular'}
                  height={100}
                  fontStyle={'normal'}
                  marginTop={20}
                  fontWeight={500}
                  fontSize={33}
                  color={COLORS.black_400}
                  textAlign={'left'}
              >Welcome  To Quick Test
              </Text>
              <VStack marginTop={'40%'}>
                  <Input
                      label={'Mobile No'}
                      placeholder={'Enter Mobile No'}
                      inputText={phoneNumber}
                      onChangeText={(text: string) => setPhoneNumber(text)}
                  />
                  <Button
                      text={'Login'}
                      style={{marginTop: 30}}
                      onPress={()=> {
                        if(phoneNumber.length === 10){
                          handlePhoneNumberSubmit();
                        }else{
                          showToast('Please enter 10 digit mobile number')
                        }
                      }}
                  />
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
});

export default Login;
