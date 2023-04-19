import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View } from 'native-base';

const DateTimePick = (props: any) => {
  const [date, setDate] = useState(new Date());

  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || date;
    props?.onDateChange(currentDate)
  };
  
  return (
    <View style={styles.container}>
      <DateTimePicker
          value={date}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onChange}
        />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePicker: {
    width: 200,
    backgroundColor: '#fff',
  },
});

export default DateTimePick;