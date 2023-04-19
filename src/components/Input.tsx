import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

//Assets
import { COLORS, IMAGES } from '../assets'
import {Text,Image } from 'native-base';
import { InputInterface } from '../utils/Interfaces';
//Packages

/**
 * Input is Component to render app text input 
 * @property {Any} extraStyle - style as per parent view
 * @property {string} label - input title header text
 */

const Input = (props: InputInterface) => {

    const [open, setOpen] = useState(false);

        return (
            <View style={props?.style}>
                {props.label && <Label title={props.label} />}
                {props?.type === 1 ?
                  <View style={[styles.inputContainerBorder,]}>
                  <TextInput
                      {...props}
                      style={[styles.input, props?.inputStyle]}
                      placeholderTextColor={COLORS.black_200}
                      autoCapitalize='none'
                      autoCorrect={false}
                      defaultValue={props.inputText}
                      editable={props?.isEdit}
                  />
                   {props.onRight && 
                     <TouchableOpacity 
                        style={{ justifyContent: 'center', alignSelf: 'center', }}
                        onPress={()=> {
                            props?.onRight &&  props?.onRight()
                        }}
                        >
                                <Image
                                    style={styles.back}
                                    source={IMAGES.CalendarIcon}
                                    resizeMode="contain"
                                />
                     </TouchableOpacity>
                    }
              </View>
            :
                <View style={[styles.inputContainer,]}>
                    <TextInput
                        {...props}
                        style={[styles.input, props?.inputStyle]}
                        placeholderTextColor={COLORS.black_200}
                        autoCapitalize='none'
                        autoCorrect={false}
                        defaultValue={props.inputText}
                        editable={props?.isEdit}
                    />
                </View>
                            
            }
            </View>
        )
    

}

const Label = (props: any) => {
    return (
        <Text
            style={{ marginLeft: 1, marginBottom: 4}}
            fontSize={16}
            fontWeight={500}
            fontFamily={'Poppins-Regular'}
            color={COLORS.black_300}>
            {props.title}
        </Text>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        height: 48,
        paddingVertical: 1,
        paddingHorizontal: 10,
        borderRadius: 8,
        flexDirection: 'row',
        backgroundColor: COLORS.inputBg,
    },
    inputContainerBorder: {
        height: 48,
        paddingVertical: 1,
        paddingHorizontal: 10,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.black_100,
    },
    input: {
        flex: 1.0,
        fontFamily: 'Poppins-Regular',
        fontWeight: '500',
        fontSize: 16,
        color: COLORS.black,
    },
    back: {
        height: 16,
        width: 16,
        alignSelf: 'center',
      },
});

export default Input