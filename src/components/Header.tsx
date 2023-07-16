import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
//ASSETS
import { COLORS, IMAGES } from '../assets';
import { Text, Image, View } from 'native-base';
import { HeaderInterface } from '../utils/Interfaces';

const Header = (props: HeaderInterface) => {
  return (
    <View style={[styles.container, props?.style]}>
      {props.onProfile && (
        <TouchableOpacity style={styles.backContainer} onPress={props.onProfile}>
          <Image
            style={styles.menu}
            source={props?.photoURL?.length ? { uri: props?.photoURL } : IMAGES.ProfileIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
      {props.onBack && (
        <TouchableOpacity style={styles.backContainer} onPress={props.onBack}>
          <Image
            style={styles.back}
            source={IMAGES.BackIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity 
      style={[{ justifyContent: 'center', alignContent: 'center', flex: 1 }]}
        onPress={props.onHeaderLabelClick}
      >
          <Text
            fontFamily={'Poppins-Regular'}
            height={100}
            fontStyle={'normal'}
            marginTop={20}
            fontWeight={500}
            fontSize={18}
            color={COLORS.black_300}
            alignSelf={'center'}
            textAlign={'center'}>
            {props?.label}
          </Text>
      </TouchableOpacity>

      {props.onSettings && (
        <TouchableOpacity style={[styles.backContainer, { justifyContent: 'flex-end' }]} 
        onPress={props.onSettings}>
          <Image
            style={styles.settings}
            source={IMAGES.SettingsIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: Platform.OS == 'ios' ? 44 : 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    marginHorizontal: 12,
  },
  backContainer: {
    alignSelf: 'center',
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignContent: 'center',
  },
  back: {
    height: 24,
    width: 24,
    alignSelf: 'center',
  },
  menu: {
    height: 40,
    width: 40,
    alignSelf: 'center',
    borderRadius: 20,
  },
  settings: {
    height: 24,
    width: 24,
    alignSelf: 'center',
  },
});

export default Header;
