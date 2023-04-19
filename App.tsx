import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
//SCREENS
import {
  Splash,
  Login,
  Otp,
  Home,
  Profile,
  EditProfile,
  GroupItemDetails,
} from './src/screens';
import { NativeBaseProvider } from 'native-base';
const {Navigator, Screen} = createStackNavigator();
import firebase from '@react-native-firebase/app';
import { firebaseConfig } from './src/database/FirebaseConfig';

const App = () => {

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={'Splash'}>
          <Screen name="Splash" component={Splash} />
          <Screen name="Login" component={Login} />
          <Screen name="Otp" component={Otp} />
          <Screen name="Home" component={Home} />
          <Screen name="Profile" component={Profile} />
          <Screen name="EditProfile" component={EditProfile} />
          <Screen name="GroupItemDetails" component={GroupItemDetails} />
        </Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
