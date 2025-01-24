import React,{useEffect, useRef} from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const Skeleton = ({width, height, style ,color2, color1}) => {
    const translateX = useRef(new Animated.Value(-width)).current;
    useEffect(()=>{
       Animated.loop(
        Animated.timing(translateX,{
            toValue: width,
            useNativeDriver: true,
            duration:1200
        })
       ).start();
    },[]);
    return(
        <View 
            style={StyleSheet.flatten([
                {width:width, height:height, backgroundColor:color2,overflow:'hidden'},
                style
            ])}
        >
            <Animated.View
                style={{width:'100%', height:'100%', transform:[{translateX:translateX}]}} 
            >
                <LinearGradient 
                    style={{width:'100%', height:'100%'}} 
                    colors={["transparent", color1, "transparent"]}
                    start={{x:1, y:1}}
                />
            </Animated.View>
        </View>
    );
}



export default Skeleton;