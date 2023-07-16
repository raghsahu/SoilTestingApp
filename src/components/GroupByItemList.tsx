import {HStack, Image, VStack, Text, View, Pressable} from 'native-base';
import {TouchableOpacity, StyleSheet} from 'react-native';
import {SwipeItem, SwipeButtonsContainer} from 'react-native-swipe-item';
import {COLORS, IMAGES} from '../assets';
import {GroupListItemInterface} from '../utils/Interfaces';
import CircleImageBackground from './CircleImageBackground';
import moment from 'moment';

const GroupByItemList = (props: GroupListItemInterface) => {
  const {item, isSelectedFarmItem, onItemClick, onItemPlusClick} = props;

  const getBgColors = () => {
    if (isSelectedFarmItem?.farm_id === item.farm_id) {
      return COLORS.brown_500;
    } else {
      return COLORS.groupListItemBg;
    }
  };

  const getTextColors = () => {
    if (isSelectedFarmItem?.farm_id === item.farm_id) {
      return COLORS.white;
    } else {
      return COLORS.black;
    }
  };

  const getSubTextColors = () => {
    if (isSelectedFarmItem?.farm_id === item.farm_id) {
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
      }}
    >
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignContent: 'center',
          alignSelf: 'center',
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          backgroundColor: '#FF02024A',
          width: 80,
          height: 85,
        }}
        onPress={() => props?.onDeleteClick && props?.onDeleteClick()}
      >
        <Image
          style={styles.leftIcon}
          source={IMAGES.DeleteIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignContent: 'center',
          alignSelf: 'center',
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          backgroundColor: '#1BA6044A',
          width: 80,
          height: 85,
        }}
        onPress={() => {
          props?.onEditClick && props?.onEditClick();
        }}
      >
        <Image
          style={styles.leftIcon}
          source={IMAGES.EditIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </SwipeButtonsContainer>
  );

  const rightButton = (
    <SwipeButtonsContainer
      style={{
        alignSelf: 'center',
        aspectRatio: 1,
        flexDirection: 'row',
        // padding: 5,
      }}
    >
      <TouchableOpacity
        style={{
          justifyContent: 'center',
          alignContent: 'center',
          alignSelf: 'center',
          borderRadius: 8,
          backgroundColor: '#1BA6044A',
          width: 80,
          height: 85,
        }}
        onPress={() => {
          onItemPlusClick && onItemPlusClick();
        }}
      >
        <Image
          style={styles.leftIcon}
          source={IMAGES.PlusIcon}
          resizeMode="contain"
          tintColor={'green.500'}
        />
      </TouchableOpacity>
    </SwipeButtonsContainer>
  );

  return (
    <SwipeItem
      style={{
        margin: 5,
        //backgroundColor: getBgColors(item),
        borderRadius: 8,
        height: 85,
      }}
      //swipeContainerStyle={styles.swipeContentContainerStyle}
      leftButtons={
        props?.isCollectingSamplePage
          ? undefined
          : isSelectedFarmItem?.farm_id === item.farm_id
          ? leftButton
          : undefined
      }
      rightButtons={
        props?.isCollectingSamplePage
          ? undefined
          : isSelectedFarmItem?.farm_id === item.farm_id
          ? rightButton
          : undefined
      }
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

          <VStack padding={2} flex={0.85}>
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
            <HStack marginTop={1}>
              <Text
                fontFamily={'Poppins-Regular'}
                fontStyle={'normal'}
                fontWeight={500}
                fontSize={12}
                color={getSubTextColors()}
              >
                {props?.isCollectingSamplePage
                  ? '1  Sample is collected'
                  : item.sampleCount + ' Samples collected'}
              </Text>
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
            </HStack>
          </VStack>

          {!props?.isCollectingSamplePage ? (
            <Pressable
              backgroundColor={COLORS.brown_400}
              borderTopLeftRadius={42}
              borderBottomLeftRadius={42}
              width={32}
              height={'90%'}
              justifyContent={'center'}
              alignContent={'center'}
              alignSelf={'center'}
              flex={0.15}
              onPress={() => {
                onItemPlusClick && onItemPlusClick();
              }}
            >
              <Image
                style={styles.plusIcon}
                source={IMAGES.PlusIcon}
                resizeMode="contain"
              />
            </Pressable>
          ) : (
            <></>
          )}
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
    height: 60,
    width: 60,
    borderRadius: 23,
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

export default GroupByItemList;
