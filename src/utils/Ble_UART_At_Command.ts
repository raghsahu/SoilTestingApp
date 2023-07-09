// Command	Responce	Unit	Discription

import {ATCommandInterface} from './Interfaces';

export const deviceName = 'SS_7IN1';
// AT	OK	-	Represent at commands are working
// AT+TEMP?	AT+TEMP=27.6	℃	Returns temperature in ℃
// AT+MOIS?	AT+MOIS=5	%RH	Returns relative humidity
// AT+COND?	AT+COND=1000	us/cm	Returns conductivity
// AT+PH?	AT+PH=3.08	pH	Returns pH Value
// AT+NITROGEN?	AT+NITROGEN=32	mg/kg	Returns Nitrogen value
// AT+PHOSPHORUS?	AT+PHOSPHORUS=37	mg/kg	Returns phosphorus value
// AT+POTASSIUM?	AT+POTASSIUM=48	mg/kg	Returns potassium value

// Error will send if wrong command received
// AT commands are not case sensitive
// UART Connection: Baud Rate 115200

export const ALL_AT_COMMANDS = [
  {
    command: 'AT+TEMP?',
    inResInclude: 'TEMP=',
  },
  {
    command: 'AT+MOIS?',
    inResInclude: 'MOIS=',
  },
  {
    command: 'AT+PH?',
    inResInclude: 'PH=',
  },
  {
    command: 'AT+NITROGEN?',
    inResInclude: 'NITROGEN=',
  },
  {
    command: 'AT+COND?',
    inResInclude: 'COND=',
  },
  {
    command: 'AT+PHOSPHORUS?',
    inResInclude: 'PHOSPHORUS=',
  },
  {
    command: 'AT+POTASSIUM?',
    inResInclude: 'POTASSIUM=',
  },
] as ATCommandInterface[];

export const AllCommandMaxValueRes = {
  temp: {
    key: 'Temp',
    maxValue: 60,
  },
  mois: {
    key: 'Humidity',
    maxValue: 100,
  },
  ph: {
    key: 'PH',
    maxValue: 14,
  },
  nitrogen: {
    key: 'N',
    maxValue: 200,
  },
  cond: {
    key: 'EC',
    maxValue: 20,
  },
  phosphorus: {
    key: 'P',
    maxValue: 100,
  },
  potassium: {
    key: 'K',
    maxValue: 200,
  },
};

export const XAxisAllLabel = ['Temp', 'EC', 'PH', 'N', 'K', 'P', 'Humidity'];
