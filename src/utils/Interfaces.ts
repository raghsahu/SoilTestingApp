import { CreateFarmsItems, CreateGroupItems, ReportByFarmItems } from "../database/Interfaces";

export interface GroupTabItemInterface {
    item: CreateGroupItems,
    isSelectedGroup: any,
    onTabClick?: () => void,
    onTabLongClick?: () => void,
}

export interface GroupListItemInterface {
    item: CreateFarmsItems,
    isCollectingSamplePage?: boolean,
    isSelectedFarmItem?: CreateFarmsItems,
    onItemClick?: () => void,
    onEditClick?: () => void,
    onDeleteClick?: () => void,
    onItemPlusClick?: () => void,
}

export interface ButtonInterface {
    style?: any,
    height?: number | string,
    text: any,
    type?: number,
    onPress: () => void,
}

export interface circleImageInterface {
    style?: any,
    source: any,
    showGalleryIcon: boolean,
}

export interface InputInterface {
    style?: any,
    height?: number | string,
    label?: any,
    inputStyle?: any,
    placeholder: any,
    type?: number,
    inputText?: any,
    isEdit?: boolean,
    onChangeText?: (text: any) => void,
    onRight?: () => void,
}

export interface HeaderInterface {
    style?: any,
    height?: number | string,
    label?: string | number,
    onSettings?: () => void,
    onBack?: () => void,
    onProfile?: () => void,
    photoURL?: string,
}

export interface AddNewGroupModalInterface {
    style?: any,
    visible: boolean,
    onClose: () => void,
    onSubmit: (text: string) => void,
    closeAble: boolean;
}

export interface AddNewFarmModalInterface {
    style?: any,
    visible: boolean,
    isEdit: boolean,
    isSelectedFarmItem: CreateFarmsItems,
    onClose: () => void,
    onSubmit: (farmName: string, farmField: string, isEditFarm: boolean,image?: string) => void,
}

export interface UpdateGroupModalInterface {
    style?: any,
    visible: boolean,
    isSelectedGroup: CreateGroupItems,
    onClose: () => void,
    onDelete: (isSelectedGroup: CreateGroupItems) => void,
    onUpdate: (text: string) => void,
}

export interface UserInterface {
    phoneNumber: string,
    uid: string,
    name?: string,
    email?: string,
    photoURL?: string,
    dob?: string,
}

export interface USBDeviceInterface {
	deviceId: number;
	productId: number;
	vendorId: number;
}

export interface ATCommandInterface {
	command: string;
	inResInclude: string;
}

export interface ReportListItemInterface {
    item: ReportByFarmItems,
    isCollectingSamplePage?: boolean,
    isSelectedFarmItem?: ReportByFarmItems,
    onItemClick?: () => void,
}

export interface GraphGroupDataInterface {
    allInOneGraph:  GraphBarDataInterface,
    allSeparateGraph: GraphBarDataInterface[],
}

export interface GraphBarDataInterface {
    graphHeader: string,
    key: string,
    graphData: GraphSingleData[],
}

export interface GraphSingleData {
    value: number,
    label: string,
}