import React from 'react';
import { View, ImageBackground } from 'react-native';
import { Image } from "native-base";
import { IMAGES } from '../assets';
import { circleImageInterface } from '../utils/Interfaces';

const CircleImageBackground = (props: circleImageInterface) => {

    return (
        <ImageBackground source={props.source} style={props?.style ? props.style : { width: 80, height: 80, borderRadius: 40 }}>
            {props?.showGalleryIcon &&
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Image
                        style={{
                            height: 36,
                            width: 36,
                            alignSelf: 'center',
                        }}
                        source={IMAGES.UploadIcon}
                        resizeMode="contain"
                        tintColor={'white'}
                    />
                </View>
            }
        </ImageBackground>
    );
};

export default CircleImageBackground;
