import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "native-base"
import { UserInterface } from "./Interfaces";
import moment from "moment";
import { PermissionsAndroid, Platform } from "react-native";

export const countryCode= '+91';
export const UART_Baud_Rate= 115200;
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

export const getTime = (date: string)=> {
  const newFormatDate = moment(date).format('hh a');
  return newFormatDate;
}

export const dateFormatToUTC = (date: string)=> {
  const newFormatDate = moment(date).format('YYYY-MM-DDT00:00:00.000Z');
  return newFormatDate;
}

export const endDateFormatToUTC = (date: string)=> {
  const newFormatDate = moment(date).format('YYYY-MM-DDT23:59:59.000Z');
  return newFormatDate;
}

export const bin2String = (array: any)=> {
  let result = "";
  for (let i = 0; i < array.length; i++) {
    result += String.fromCharCode(array[i]);
  }
  return result;
}

export const stringToHex = (str: string)=> {
  //converting string into buffer
  const bufStr = Buffer.from(str, 'utf8');
  //with buffer, you can convert it into hex with following code
  return bufStr.toString('hex');
}

export const hexStringToByteArray = (hexString: any)=> {
  if (hexString.length % 2 !== 0) {
    throw "Must have an even number of hex digits to convert to bytes";
  }
  const numBytes = hexString.length / 2;
  const byteArray = new Uint8Array(numBytes);
  for (let i = 0; i < numBytes; i++) {
    byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bin2String(byteArray);
}

export const GetAllPermissions = async ()=> {
  try {
    if (Platform.OS === "android") {
      const userResponse = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      return userResponse;
    }
  } catch (err) {
   // Warning(err);
  }
  return null;
}

export const getSeparatedValues = async (uniqueArray: any[])=> {
  const allSevenValues= {
    temp: '',
    mois: '',
    ph: '',
    nitrogen: '',
    cond: '',
    phosphorus: '',
    potassium: '',
  }
  await uniqueArray?.forEach((item: any, index, array) => {
    if (item.includes('=')) {
      // console.log(item.split("=")[1]);
      if (item.includes('TEMP=') || item.includes('EMP=')) {
        allSevenValues.temp = item.split("=")[1]
      } else if (item.includes('MOIS=') || item.includes('OIS=')) {
        allSevenValues.mois = item.split("=")[1]
      } else if (item.includes('PH=') || item.includes('H=')) {
        allSevenValues.ph = (item.split("=")[1] / 10).toString();
      } else if (item.includes('NITROGEN=') || item.includes('ITROGEN=')) {
        allSevenValues.nitrogen = item.split("=")[1]
      } else if (item.includes('COND=') || item.includes('OND=')) {
        allSevenValues.cond = item.split("=")[1]
      } else if (item.includes('PHOSPHORUS=') || item.includes('HOSPHORUS=')) {
        allSevenValues.phosphorus = item.split("=")[1]
      } else if (item.includes('POTASSIUM=') || item.includes('OTASSIUM=')) {
        allSevenValues.potassium = item.split("=")[1]
      }
    }

  });
  return allSevenValues;
}

export const getPercentageValue = (value: number, total: number) => {
  const result = (Number(value) / total) * 100;
  let parsedValue = parseFloat(result.toString());
  if (!isNaN(parsedValue)) {
    parsedValue = parseFloat(parsedValue.toFixed(2));
  }
  return parsedValue;
}