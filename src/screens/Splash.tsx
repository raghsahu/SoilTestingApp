import React, {useEffect} from 'react';

//ASSETS
import {COLORS, IMAGES} from '../assets';

//PACKAGES
import {CommonActions} from '@react-navigation/native';
import { ImageBackground, StyleSheet,  View} from 'react-native';
import { VStack, Text, Image } from 'native-base';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInterface } from '../utils/Interfaces';
import database from '@react-native-firebase/database';
import { firebase } from '@react-native-firebase/auth';
import { AsyncKey } from '../utils/CommonUtils';

const Splash = (props: any) => {
  const usersRef = database().ref('users');

  useEffect(()=> {
    checkUserAuth();
  }, [])

  const checkUserAuth = async ()=> {
  // Listen for authentication state changes
  firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        // User is authenticated
        const userAuthData = {
          phoneNumber: user?.phoneNumber,
          uid: user?.uid,
          name: user?.displayName,
          email: user?.email,
          photoURL: user?.photoURL,
          //dob: '',
        } as UserInterface;
        // Find the user with a specific user ID
        const userId = user?.uid;
        const userRef = usersRef.child(userId);
        // Fetch the data for the user node
        userRef.once('value')
          .then(async (snapshot) => {
            const userData = snapshot.val();
            if (userData) {
              await AsyncStorage.setItem(AsyncKey.user, JSON.stringify(userData));
            } else {
              await AsyncStorage.setItem(AsyncKey.user, JSON.stringify(userAuthData));
            }
            moveToNext('Home');
          })
          .catch((error) => {
            console.error('Error getting user data:', error);
          });
      } else {
        // User is not authenticated
        console.log('User is not authenticated');
        moveToNext('Login');
      }
    })
  }

  const moveToNext = (screenName: string) => {
    setTimeout(() => {
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: screenName}],
        }),
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={IMAGES.SplashBG}
        style={{
          height: '100%',
          width: '100%',
        }}
      >
        <VStack flex={1} justifyContent={'center'} alignContent={'center'}>
          <Image
          size={32}
            source={IMAGES.SplashLogo}
            alignSelf={'center'}
          />
        <Text fontFamily={'Poppins-Regular'} fontWeight={600} fontSize={36} color={'white'} textAlign={'center'}>Quick Test</Text>
        <Text fontFamily={'Poppins-Regular'} fontWeight={600} fontSize={20} color={'white'} textAlign={'center'}>Test soil in a seconds</Text>
        </VStack>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1.0,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Splash;
