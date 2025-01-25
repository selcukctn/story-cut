import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import useVideoStore from '../stores/useVideoStore';
import colors from '../utils/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import left_ico from '../img/angle-left.png';

const Settings = ({navigation}) => {
  const deleteAllVideos = useVideoStore(state => state.clearVideos);

  const handleResetDatabase = () => {
    setTimeout(() => {
      Alert.alert(
        'Reset Database',
        'All videos and data will be deleted. This action cannot be undone!',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await deleteAllVideos();
                if (result) {
                  Alert.alert('Success', 'Database has been successfully reset');
                  navigation.goBack();
                  return true;
                } else {
                  Alert.alert('Error', 'Failed to reset database');
                  return false;
                }
              } catch (error) {
                console.error('Database reset error:', error);
                Alert.alert('Error', 'An error occurred while resetting database');
                return false;
              }
            }
          }
        ]
      );
    }, 100);
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

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetDatabase}
        >
          <View style={styles.buttonContent}>
          <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.resetText}>Reset Database</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.main_bg,
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
  content: {
    flex: 1,
    padding: 16,
  },
  resetButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetText: {
    color: colors.main_green,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
});

export default Settings;
