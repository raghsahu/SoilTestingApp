import { View, Text, VStack, HStack } from "native-base";
import { useState } from "react";
import { Modal, TouchableOpacity,StyleSheet } from "react-native";
import { COLORS, IMAGES } from "../assets";
import Button from "./Button";
import { addNewGroupStyles } from "./CommonStyle";
import Input from "./Input";
import { AddNewFarmModalInterface } from "../utils/Interfaces";
import {  MediaType, launchImageLibrary} from 'react-native-image-picker';
import CircleImageBackground from "./CircleImageBackground";
import { showToast } from "../utils/CommonUtils";

const AddNewFarmModal = (props: AddNewFarmModalInterface) => {
    const [newFarmName, setNewFarmName] = useState(props?.isSelectedFarmItem?.farm_name || '');
    const [newFarmField, setNewFarmField] = useState(props?.isSelectedFarmItem?.farm_field || '');
    const [image, setImage] = useState(props?.isSelectedFarmItem?.farm_image || '');

    const options= {
        selectionLimit: 1,
        mediaType: 'photo' as MediaType,
        includeBase64: true,
      }

    const handlePickFromGallery = async () => {
        const result = await launchImageLibrary(options);
       // {"assets": [{base64:'', "fileName": "rn_image_picker_lib_temp_9b67ba5b-4f62-4bb0-81e2-124b847aff63.jpg", "fileSize": 296798, "height": 1073, "type": "image/jpeg", 
       //"uri": "file:///data/user/0/com.soiltestingapp/cache/rn_image_picker_lib_temp_9b67ba5b-4f62-4bb0-81e2-124b847aff63.jpg", "width": 838}]}
        setImage(result?.assets?.[0].base64 || '')
    };
      
    return (
        <Modal style={addNewGroupStyles.container}
            transparent={true}
            animationType='fade'
            visible={props.visible}
            onRequestClose={() => { props.onClose() }}
        >
            <TouchableOpacity
                style={addNewGroupStyles.container}
                activeOpacity={1}
                onPressOut={() => { props.onClose() }}
            >
                <View style={[addNewGroupStyles.viewWrapper]}>
                    <View style={addNewGroupStyles.farmModal}>
                        <Text
                            fontSize={16}
                            fontWeight={500}
                            fontFamily={'Poppins-Regular'}
                            color={COLORS.black_400}
                            style={{margin: 15}}
                        >
                            {props?.isSelectedFarmItem?.group_name}
                        </Text>
                        <HStack margin={15} justifyContent={'center'} alignItems={'center'} backgroundColor={COLORS.black_50} borderRadius={8}>
                       
                        <TouchableOpacity onPress={handlePickFromGallery}>
                        <CircleImageBackground
                            style={styles.profileImage}
                            source={image.length ? { uri: `data:image/jpeg;base64,${image}`} : IMAGES.GrayBgIcon}
                            showGalleryIcon={image.length ? false : true}
                        />
                        </TouchableOpacity>

                            <VStack height={150}>
                                <Input
                                    style={[styles.inputView, {marginTop: 5}]}
                                    placeholder={'Add Farm Name'}
                                    type={1}
                                    inputText={newFarmName}
                                    onChangeText={(text: string) => {
                                        setNewFarmName(text)
                                    }}
                                />
                                <Input
                                    style={[styles.inputView, { marginTop: 30 }]}
                                    type={1}
                                    placeholder={'Add Field Name'}
                                    inputText={newFarmField}
                                    onChangeText={(text: string )=> {
                                        setNewFarmField(text)
                                    }}
                                />
                            </VStack>

                        </HStack>

                        <Button
                            text={props?.isEdit ? 'Update' : 'Save Farm'}
                            style={{ marginTop: 30, width: 200, alignSelf: 'center' }}
                            onPress={() => {
                                if(newFarmName.length && newFarmField.length){
                                    props.onSubmit(newFarmName, newFarmField, props.isEdit, image);
                                }else{
                                    showToast('Please enter all fields')
                                }
                            }}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>

    )
};

const styles = StyleSheet.create({
    profileImage: {
        height: 80,
        width: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignContent: 'center',
        overflow: 'hidden',
    },
    editProfileIcon: {
        height: 36,
        width: 36,
        alignSelf: 'center',
    },
    inputView: {
        width: 180,
        height: 36,
        alignSelf: 'center'
    },
});

export default AddNewFarmModal