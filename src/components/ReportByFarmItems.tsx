import {HStack, Image, VStack, Text, View, Pressable} from 'native-base';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {SwipeItem, SwipeButtonsContainer} from 'react-native-swipe-item';
import {COLORS, IMAGES} from '../assets';
import {ReportListItemInterface} from '../utils/Interfaces';
import CircleImageBackground from './CircleImageBackground';
import moment from 'moment';

const ReportByFarmItemList = (props: ReportListItemInterface) => {
  const {item, isSelectedFarmItem, onItemClick} = props;

  const getBgColors = () => {
    if (isSelectedFarmItem?.report_id === item.report_id) {
      return COLORS.brown_500;
    } else {
      return COLORS.groupListItemBg;
    }
  };

  const getTextColors = () => {
    if (isSelectedFarmItem?.report_id === item.report_id) {
      return COLORS.white;
    } else {
      return COLORS.black;
    }
  };

  const getSubTextColors = () => {
    if (isSelectedFarmItem?.report_id === item.report_id) {
      return COLORS.white;
    } else {
      return COLORS.black_400;
    }
  };

  const leftButton = (
    <SwipeButtonsContainer
      style={{
        alignSelf: 'center',
        aspectRatio: 1,
        flexDirection: 'row',
        padding: 10,
      }}
    ></SwipeButtonsContainer>
  );

  return (
    <SwipeItem
      style={{
        margin: 5,
        //backgroundColor: getBgColors(item),
        borderRadius: 8,
        height: 115,
      }}
      //swipeContainerStyle={styles.swipeContentContainerStyle}
      // leftButtons={props?.isCollectingSamplePage ? undefined : (isSelectedFarmItem?.farm_id === item.farm_id) ? leftButton : undefined}
      disableSwipeIfNoButton
    >
      <Pressable
        style={{
          backgroundColor: getBgColors(),
          borderRadius: 8,
        }}
        onPress={() => {
          onItemClick && onItemClick();
        }}
      >
        <HStack
        //flex={1}
        >
          <CircleImageBackground
            style={styles.profileImage}
            source={
              item?.farm_image?.length
                ? {uri: `data:image/jpeg;base64,${item.farm_image}`}
                : IMAGES.GrayBgIcon
            }
            showGalleryIcon={item?.farm_image?.length ? false : true}
          />
          {/* <ImageBackground
                            style={styles.profileImage}
                            source={IMAGES.GrayBgIcon}
                        >
                            <Image
                                style={styles.editProfileIcon}
                                source={IMAGES.TomatoIcon}
                                resizeMode="contain"
                            />
                        </ImageBackground> */}

          <VStack padding={5} flex={0.8}>
            <HStack>
              <Text
                fontFamily={'Poppins-Regular'}
                fontStyle={'normal'}
                fontWeight={600}
                fontSize={14}
                color={getTextColors()}
              >
                {item.farm_name}
              </Text>

              {/* <View
                                    style={{
                                        backgroundColor: 'red',
                                        borderRadius: 12,
                                        height: 24,
                                        width: 24,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginLeft: 5,
                                    }}
                                >
                                    <Text
                                        fontFamily={'Poppins-Regular'}
                                        fontStyle={'normal'}
                                        fontWeight={600}
                                        fontSize={14}
                                        color={COLORS.white}
                                        alignSelf={'center'}
                                        textAlign={'center'}
                                    >
                                        2
                                    </Text>
                                </View> */}
            </HStack>
            <Text
              fontFamily={'Poppins-Regular'}
              fontStyle={'normal'}
              fontWeight={500}
              fontSize={12}
              color={getSubTextColors()}
            >
              {item.farm_field}
            </Text>
            <HStack marginTop={2}>
              <Text
                fontFamily={'Poppins-Regular'}
                fontStyle={'normal'}
                fontWeight={500}
                fontSize={12}
                color={getSubTextColors()}
              >
                {props?.collectingSampleText
                  ? props.collectingSampleText
                  : props?.isCollectingSamplePage
                  ? '1 sample is collecting...'
                  : item.sampleCount + ' Samples collected'}
              </Text>
              {!props?.isCollectingSamplePage ? (
                <Text
                  fontFamily={'Poppins-Regular'}
                  fontStyle={'normal'}
                  fontWeight={500}
                  fontSize={10}
                  color={COLORS.black_200}
                  alignSelf={'flex-end'}
                  marginLeft={5}
                >
                  {'' + moment(new Date(item?.create_time)).fromNow()}
                </Text>
              ) : (
                <></>
              )}
            </HStack>
          </VStack>
        </HStack>
      </Pressable>
    </SwipeItem>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1.0,
    backgroundColor: COLORS.white,
  },
  profileImage: {
    height: 80,
    width: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    marginLeft: 10,
    overflow: 'hidden',
  },
  editProfileIcon: {
    height: 36,
    width: 36,
    alignSelf: 'center',
  },
  plusIcon: {
    height: 14,
    width: 14,
    alignSelf: 'center',
  },
  leftIcon: {
    height: 20,
    width: 20,
    alignSelf: 'center',
  },
  swipeContentContainerStyle: {
    backgroundColor: '#ffffff',
  },
});

export default ReportByFarmItemList;
