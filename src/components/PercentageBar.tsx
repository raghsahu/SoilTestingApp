import { View, Text } from "native-base";
import { useState } from "react";
import { COLORS } from "../assets";
import { getPercentageValue } from "../utils/CommonUtils";


const PercentageBar = (props: any) => {
    const { height, backgroundColor, completedColor, labelColor, item } = props

    return (
        <View m={2}>
            <Text fontSize={12}
                fontWeight={500}
                color={labelColor || COLORS.white}>{item.label} {' - '} 
                {getPercentageValue(item.value, item.maxValue)} {'%'}
                </Text>
            <View style={{ justifyContent: 'center' }}>
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
                            width: getPercentageValue(item.value, item.maxValue) ? getPercentageValue(item.value, item.maxValue) + '%' : 0,
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