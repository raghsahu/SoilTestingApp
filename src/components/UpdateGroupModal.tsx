import {HStack, View} from 'native-base';
import {useEffect, useState} from 'react';
import {Modal, TouchableOpacity} from 'react-native';
import Button from './Button';
import {addNewGroupStyles} from './CommonStyle';
import Input from './Input';
import {UpdateGroupModalInterface} from '../utils/Interfaces';

const UpdateGroupModal = (props: UpdateGroupModalInterface) => {
  const [newGroupName, setNewGroup] = useState(
    props?.isSelectedGroup?.group_name || ''
  );

  return (
    <Modal
      style={addNewGroupStyles.container}
      transparent={true}
      animationType="fade"
      visible={props.visible}
      onRequestClose={() => {
        props.onClose();
      }}
    >
      <TouchableOpacity
        style={addNewGroupStyles.container}
        activeOpacity={1}
        onPressOut={() => {
          props.onClose();
        }}
      >
        <View style={[addNewGroupStyles.viewWrapper]}>
          <View style={addNewGroupStyles.modal}>
            <Input
              style={addNewGroupStyles.inputView}
              placeholder={'Edit Group Name Here'}
              inputText={newGroupName}
              onChangeText={(text: string) => {
                setNewGroup(text);
              }}
            />

            <HStack mt={30} justifyContent={'space-between'}>
              <Button
                text={'Update'}
                style={{width: 140, alignSelf: 'center', marginRight: 5}}
                onPress={() => {
                  props.onUpdate(newGroupName);
                }}
              />

              <Button
                text={'Delete'}
                type={1}
                style={{width: 140, alignSelf: 'center', marginLeft: 5}}
                onPress={() => {
                  props.onDelete(props?.isSelectedGroup);
                }}
              />
            </HStack>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default UpdateGroupModal;
