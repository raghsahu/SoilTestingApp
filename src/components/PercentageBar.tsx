import {View, Text, HStack} from 'native-base';
import {useState} from 'react';
import {COLORS} from '../assets';
import {getDecimalNumber, getPercentageValue} from '../utils/CommonUtils';

const PercentageBar = (props: any) => {
  const {height, backgroundColor, completedColor, labelColor, item} = props;

  return (
    <View m={2}>
      <HStack>
        <Text
          flex={1}
          fontSize={12}
          fontWeight={500}
          color={labelColor || COLORS.white}
        >
          {item.label} {' - '}
          {/* {getPercentageValue(item.value, item.maxValue)} */}
          {getDecimalNumber(item.value)}
        </Text>
        <Text
          justifyContent={'flex-end'}
          alignItems={'flex-end'}
          alignSelf={'flex-end'}
          fontSize={12}
          fontWeight={500}
          color={labelColor || COLORS.white}
        >
          {item.maxValue}
        </Text>
      </HStack>
      <View style={{justifyContent: 'center'}}>
        <View
          style={{
            width: '100%',
            height: height,
            borderRadius: 5,
            backgroundColor: backgroundColor,
          }}
        >
          <View
            style={{
              width: getPercentageValue(item.value, item.maxValue)
                ? getPercentageValue(item.value, item.maxValue) + '%'
                : 0,
              maxWidth: 340,
              height: height,
              backgroundColor: completedColor,
              position: 'absolute',
              borderRadius: 5,
            }}
          />
        </View>
      </View>
    </View>
  );
};
export default PercentageBar;
