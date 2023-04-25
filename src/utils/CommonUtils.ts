import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "native-base"
import { UserInterface } from "./Interfaces";
import moment from "moment";

export const countryCode= '+91';
export const AsyncKey ={
  user: 'user',
  device: 'device',
}

export const showToast = (message: string)=> {
    Toast.show({
        title: message,
        placement: 'bottom'
      })
}

export const getUserData = async () => {
  try {
    const value = await AsyncStorage.getItem(AsyncKey.user);
    if (value !== null) {
      return JSON.parse(value) as UserInterface;
    }
  } catch (e) {
    console.log('Error reading data', e);
  }
  return {} as UserInterface;
};

export const getDeviceData = async () => {
  try {
    const value = await AsyncStorage.getItem(AsyncKey.device);
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (e) {
    console.log('Error reading data', e);
  }
  return {};
};

export const removeCountryCodeFromPhoneNumber=  (phoneNumber: string) => {
  // Regular expression to match Indian phone numbers with country code
  const regex = /^(\+91|91)?([6-9]\d{9})$/;
  // Check if the phone number matches the regular expression
  if (regex.test(phoneNumber)) {
    // If it matches, remove the country code portion
    const phoneNumberWithoutCountryCode = phoneNumber.replace(/^(\+91|91)?/, '');
    return phoneNumberWithoutCountryCode;
  }
  // If the phone number doesn't match the regular expression, return it unchanged
  return phoneNumber;
}

export const dateFormatToDDMMYYYY = (date: string)=> {
  const newFormatDate = moment(date).format('DD-MM-YYYY');
  return newFormatDate;
}