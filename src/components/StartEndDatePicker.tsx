import { HStack, VStack, View } from "native-base";
import { useState } from "react";
import { Modal, TouchableOpacity, StyleSheet } from "react-native";
import Button from "./Button";
import { addNewGroupStyles } from "./CommonStyle";
import Input from "./Input";
import { dateFormatToDDMMYYYY, showToast } from "../utils/CommonUtils";
import DateTimePicker from "./DateTimePicker";

const StartEndDatePicker = (props: any) => {
    const [state, setState] = useState({
        openStartDatePicker: false,
        openEndDatePicker: false,
        startDate: '' as any,
        endDate: '' as any,
    });

    const onStartDateChange = (date: any) => {
        setState((prev) => {
            return {
                ...prev,
                openStartDatePicker: false,
                startDate: date,
                //dateFormatToUTC(date),
            }
        })
        // Ensure that the end date is not before the start date
        if (state.endDate < date) {
            setState((prev) => {
                return {
                    ...prev,
                    endDate: date,
                }
            })
        }
    };

    const onEndDateChange = (date: any) => {
        setState((prev) => {
            return {
                ...prev,
                openEndDatePicker: false,
                endDate: date,
            }
        })
        // Ensure that the start date is not after the end date
        if (date < state.startDate) {
            setState((prev) => {
                return {
                    ...prev,
                    startDate: date,
                }
            })
        }
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
                    <View style={addNewGroupStyles.datePickerModal}>
                        <VStack justifyContent={'center'} alignItems={'center'} style={addNewGroupStyles.container}>
                            <TouchableOpacity
                                onPress={() => {
                                    setState((prev) => {
                                        return {
                                            ...prev,
                                            openStartDatePicker: true,
                                        }
                                    })
                                }}
                            >
                                <Input
                                    placeholder={'Enter Start Date'}
                                    style={{ width: 250, marginLeft: 5 }}
                                    type={1}
                                    inputText={state.startDate ? dateFormatToDDMMYYYY(state.startDate.toString()) : ''}
                                    isEdit={false}
                                    onRight={() => {
                                        console.log('')
                                    }}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setState({
                                        ...state,
                                        openEndDatePicker: true,
                                    })
                                }}
                            >
                                <Input
                                    placeholder={'Enter End Date'}
                                    style={{ width: 250, marginLeft: 5 }}
                                    type={1}
                                    inputText={state.endDate ? dateFormatToDDMMYYYY(state.endDate.toString()) : ''}
                                    isEdit={false}
                                    onRight={() => {
                                        console.log('')
                                    }}
                                />
                            </TouchableOpacity>

                            <HStack marginTop={30} justifyContent={'center'}>
                                <Button
                                    text={'Apply'}
                                    style={{ width: 100, alignSelf: 'center' }}
                                    onPress={() => {
                                        console.log('')
                                        if (!state.startDate) {
                                            showToast('Please enter start date')
                                        } else {
                                            props?.onDateApply(state.startDate, state.endDate)
                                        }
                                    }}
                                />

                                <Button
                                    text={'Cancel'}
                                    style={{ marginLeft: 5, width: 100, alignSelf: 'center' }}
                                    onPress={() => {
                                        console.log('')
                                        props?.onClose()
                                    }}
                                />
                            </HStack>
                        </VStack>
                    </View>
                    {(state.openStartDatePicker) &&
                <DateTimePicker
                    selectedDate={state.startDate}
                    onDateChange={(date: any) => {
                        onStartDateChange(date);
                    }}
                />
            }
            {(state.openEndDatePicker) &&
                <DateTimePicker
                    selectedDate={state.endDate}
                    onDateChange={(date: any) => {
                        onEndDateChange(date);
                    }}
                />
            }
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

export default StartEndDatePicker;