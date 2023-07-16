import React, {useEffect} from 'react';
import {COLORS} from '../assets';
import {BackHandler, StyleSheet} from 'react-native';
import {VStack, Text, View, HStack, ScrollView} from 'native-base';
import {Statusbar, Header} from '../components';
import {settingsData} from '../utils/GraphData';

const Settings = (props: any) => {
  useEffect(() => {
    const backAction = () => {
      props.navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, []);

  return (
    <>
      <VStack style={styles.container}>
        <Statusbar />
        <VStack marginTop={10}>
          <Header
            onBack={() => {
              props.navigation.goBack();
            }}
            label={'Settings'}
          ></Header>

          <VStack marginLeft={5} marginRight={5}>
            <HStack
              marginTop={10}
              width={'100%'}
              alignContent={'center'}
              backgroundColor={COLORS.settingsCardBg}
              padding={2}
            >
              <Text flex={0.33} style={styles.headerText}>
                Parameter
              </Text>
              <Text flex={0.33} style={styles.headerText}>
                Unit
              </Text>
              <Text flex={0.33} style={styles.headerText}>
                Range
              </Text>
            </HStack>
            <ScrollView>
              {settingsData.map((item) => {
                return (
                  <HStack
                    marginTop={4}
                    width={'100%'}
                    alignContent={'center'}
                    padding={2}
                    flex={1}
                  >
                    <Text flex={0.33} style={styles.itemText}>
                      {item.label}
                    </Text>
                    <Text flex={0.33} style={styles.itemText}>
                      {item.unit}
                    </Text>
                    <Text flex={0.33} style={styles.itemText}>
                      {item.min + ' to ' + item.max + ' ' + item.unit}
                    </Text>
                  </HStack>
                );
              })}
            </ScrollView>
          </VStack>
        </VStack>
      </VStack>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1.0,
    backgroundColor: COLORS.white,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black_300,
    padding: 2,
  },
  itemText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.black_400,
    padding: 2,
  },
});

export default Settings;
