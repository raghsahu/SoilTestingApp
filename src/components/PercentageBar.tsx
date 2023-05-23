import { View, Text } from "native-base";
import { useState } from "react";
import { COLORS } from "../assets";


const PercentageBar = (props: any) => {
    const { height, backgroundColor, completedColor, percentage, labelColor, item } = props

    return (
        <View m={2}>
            <Text fontSize={12}
                fontWeight={500}
                color={labelColor || COLORS.white}>{item.label} {' - '} {item.value}
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
                            width: percentage ? percentage : 0,
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