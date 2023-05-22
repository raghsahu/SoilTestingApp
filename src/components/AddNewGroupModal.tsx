import { View } from "native-base";
import { useState } from "react";
import { Modal, TouchableOpacity, } from "react-native";
import { showToast } from "../utils/CommonUtils";
import Button from "./Button";
import { addNewGroupStyles } from "./CommonStyle";
import Input from "./Input";
import { AddNewGroupModalInterface } from "../utils/Interfaces";

const AddNewGroupModal = (props: AddNewGroupModalInterface) => {
    const [newGroupName, setNewGroup] = useState('');

    return (
        <Modal style={addNewGroupStyles.container}
            transparent={true}
            animationType='fade'
            visible={props.visible}
            onRequestClose={() => { props.closeAble && props.onClose() }}
        >
            <TouchableOpacity
                style={addNewGroupStyles.container}
                activeOpacity={1}
                //onPressOut={() => { props.onClose() }}
            >
                <View style={[addNewGroupStyles.viewWrapper]}>
                    <View style={addNewGroupStyles.modal}>
                        <Input
                            style={addNewGroupStyles.inputView}
                            placeholder={'Add Group Name Here'}
                            inputText={''}
                            onChangeText={(text: any) => {
                                setNewGroup(text)
                            }}
                        />
                        <Button
                            text={'Save Group'}
                            style={{ marginTop: 30, width: 200, alignSelf: 'center' }}
                            onPress={() => {
                                if(newGroupName.length){
                                props.onSubmit(newGroupName);
                                }else{
                                    showToast('Please Enter Group Name')
                                }
                            }}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>

    )
};


export default AddNewGroupModal