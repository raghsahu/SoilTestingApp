import { View, Text } from 'native-base';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

//ASSETS
import { COLORS } from '../assets';
import { ButtonInterface } from '../utils/Interfaces';

const Button = (props: ButtonInterface) => {

    return (
        <>
            {props?.type === 1 ?
                <TouchableOpacity
                    activeOpacity={0.9}
                    {...props}
                    style={[styles.borderContainer, props?.style]}
                    onPress={props?.onPress}
                >
                    <View
                        style={[{ height: props?.height ? props.height : 48, justifyContent: 'center', }]}>
                        <Text mb={1} fontFamily={'Poppins-Regular'} fontStyle={'normal'} fontWeight={600} fontSize={'20px'} color={COLORS.black_400}>{props.text}</Text>
                    </View>
                </TouchableOpacity>
                :
                <TouchableOpacity
                    activeOpacity={0.9}
                    {...props}
                    style={[styles.container, props?.style]}
                    onPress={props?.onPress}
                >
                    <View
                        style={[{ height: props?.height ? props.height : 48, justifyContent: 'center', }]}>
                        <Text mb={1} fontFamily={'Poppins-Regular'} fontStyle={'normal'} fontWeight={600} fontSize={'20px'} color={COLORS.white}>{props.text}</Text>
                    </View>
                </TouchableOpacity>
            }
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 12,
        justifyContent: 'center',
        height: 48,
        backgroundColor: COLORS.ButtonBg,
    },
    borderContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        justifyContent: 'center',
        height: 48,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.brown_300,
    },
    shadow: {
        shadowColor: COLORS.ButtonBg,
        shadowOpacity: 0.3,
        shadowRadius: 1,
        shadowOffset: { width: 0, height: 1 },
        backgroundColor: COLORS.ButtonBg,
        borderRadius: 12,
    },
});

export default Button