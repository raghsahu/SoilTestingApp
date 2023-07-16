import React from 'react';
import {Text} from 'native-base';

const RNText = (props: any) => {
  function getPoppinsFont() {
    if (props?.weight == 400) {
      return 'Poppins-Regular';
    } else if (props?.weight == 500) {
      return 'Poppins-Medium';
    } else if (props?.weight == 600) {
      return 'Poppins-SemiBold';
    } else if (props?.weight == 800) {
      return 'Poppins-Bold';
    } else if (props?.weight == 'bold') {
      return 'Poppins-Bold';
    } else {
      return 'Poppins-Regular';
    }
  }

  return (
    <Text
      {...props}
      style={[
        props?.style,
        {
          color: props?.color || '#fff',
          textAlign: props?.align || 'left',
          fontWeight: props?.weight || 400,
          fontSize: parseInt(props?.size || 14),
          fontFamily: getPoppinsFont(),
        },
      ]}
    >
      {props.children}
    </Text>
  );
};

export default RNText;
