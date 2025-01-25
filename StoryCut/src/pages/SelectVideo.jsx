import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Pressable, Image, SafeAreaView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import colors from '../utils/colors';
import left_ico from '../img/angle-left.png';

const SelectVideo = ({ navigation }) => {

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });

      if (result.assets && result.assets[0]) {
        const videoUri = result.assets[0].uri;
        navigation.navigate('Test', { videoUri });
      }
    } catch (error) {
      console.log('Video seçiminde hata:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Topbar */}
      <View style={styles.top_bar}>
        <Pressable style={styles.send_button} onPress={() => { navigation.goBack() }}>
          <Image
            source={left_ico}
            style={styles.icon}
          />
        </Pressable>
      </View>

      {/* Ana İçerik */}
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={pickVideo}
        >
          <Ionicons name="videocam" size={40} color="#fff" />
          <Text style={styles.buttonText}>Select a Video</Text>
          <Text style={styles.description}>
          Select the video you want to process
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  top_bar: {
    width: width,
    height: height / 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.main_bg,
    padding: 10,
  },
  send_button: {
    width: height / 23,
    height: height / 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.main_green
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: colors.main_bg,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  selectButton: {
    backgroundColor: '#4CAF50',
    padding: 30,
    borderRadius: 15,
    width: '90%',
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SelectVideo;
