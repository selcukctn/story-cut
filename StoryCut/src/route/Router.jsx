import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
//import pages****
import HomePage from "../pages/HomePage";
import VideoTrimTool from "../pages/VideoTrimTool";
import SelectVideo from "../pages/SelectVideo";
import VideoDetail from '../pages/VideoDetail';
import Settings from '../pages/Settings';
/****/
const Stack = createStackNavigator();



const Router = () => {
    return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{
            headerShown:false
          }}>
            <Stack.Screen name="Home" component={HomePage} />
            <Stack.Screen name="SelectVideo" component={SelectVideo} />
            <Stack.Screen name="Test" component={VideoTrimTool} />
            <Stack.Screen name="VideoDetail" component={VideoDetail} />
            <Stack.Screen name="Settings" component={Settings} />
          </Stack.Navigator>
        </NavigationContainer>
      );
}




export default Router;