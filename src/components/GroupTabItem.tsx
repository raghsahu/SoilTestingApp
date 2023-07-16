import {TouchableOpacity} from 'react-native';
import {Text} from 'native-base';
import {COLORS} from '../assets';
import {GroupTabItemInterface} from '../utils/Interfaces';

const GroupTabItem = (props: GroupTabItemInterface) => {
  const {item, isSelectedGroup, isFarmReport, onTabClick, onTabLongClick} =
    props;

  const getBgColors = () => {
    if (isSelectedGroup.group_id === item.group_id) {
      if (isFarmReport) {
        return COLORS.brown_400;
      }
      return COLORS.brown_500;
    } else {
      return COLORS.black_50;
    }
  };

  const getTextColors = () => {
    if (isSelectedGroup.group_id === item.group_id) {
      return COLORS.white;
    } else {
      return COLORS.black_300;
    }
  };

  return (
    <TouchableOpacity
      style={{
        height: 34,
        margin: 5,
        //width: 'auto',
        flexWrap: 'wrap',
        paddingLeft: 4,
        paddingRight: 4,
        backgroundColor: getBgColors(),
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
      }}
      onPress={() => {
        onTabClick && onTabClick();
      }}
      onLongPress={() => {
        onTabLongClick && onTabLongClick();
      }}
    >
      <Text
        style={{
          color: getTextColors(),
          flex: 1,
          alignSelf: 'center',
          justifyContent: 'center',
          textAlignVertical: 'center',
        }}
      >
        {item.group_name}
      </Text>
    </TouchableOpacity>
  );
};

export default GroupTabItem;
