import { Dimensions, StyleSheet } from "react-native";
import { COLORS } from "../assets";

const { width } = Dimensions.get("window");
export const addNewGroupStyles = StyleSheet.create({
    container: {
        flex: 1.0,
    },
    modal: {
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: "50%",
        left: "50%",
        elevation: 5,
        transform: [{ translateX: -(width * 0.4) },
        { translateY: -90 }],
        height: 180,
        width: width * 0.8,
        backgroundColor: "#fff",
        borderRadius: 8,
    },
    viewWrapper: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    inputView: {
        width: 250,
        height: 36,
        alignSelf: 'center'
    },
    farmModal: {
        position: "absolute",
        top: "50%",
        left: "50%",
        elevation: 5,
        transform: [{ translateX: -(width * 0.4) },
        { translateY: -90 }],
        height: 345,
        width: width * 0.8,
        backgroundColor: "#fff",
        borderRadius: 8,
    },
});