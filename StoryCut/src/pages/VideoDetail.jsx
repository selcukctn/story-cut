import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Alert,  StatusBar, } from 'react-native';
import { Video } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import colors from '../utils/colors';
import { Ionicons } from '@expo/vector-icons';
import useVideoStore from '../stores/useVideoStore';

const { width } = Dimensions.get('window');

const VideoDetail = ({ route }) => {
  const navigation = useNavigation();
  const { video } = route.params;
  const deleteVideo = useVideoStore(state => state.deleteVideo);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDelete = async () => {
    if (!video || !video.id) {
      console.error('Video bilgisi eksik');
      return;
    }

    console.log('Silinecek video:', video);

    Alert.alert(
      'Videoyu Sil',
      'Bu videoyu silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Video silme işlemi başlatılıyor, ID:', video.id);
              const result = await deleteVideo(video.id);
              if (result) {
                console.log('Video başarıyla silindi');
                Alert.alert('Başarılı', 'Video başarıyla silindi', [
                  {
                    text: 'Tamam',
                    onPress: () => navigation.goBack()
                  }
                ]);
              } else {
                console.log('Video silinemedi');
              }
            } catch (error) {
              console.error('Video silme hatası:', error);
            }
          }
        }
      ]
    );
  };

  // Video verisi kontrolü
  if (!video) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Video bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
       <StatusBar backgroundColor={colors.main_bg} barStyle={'light-content'} />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.replace('Home')}
      >
        <Ionicons name="arrow-back" size={24} color={colors.main_green} />
      </TouchableOpacity>

      <Video
        source={{ uri: video.uri }}
        style={styles.video}
        useNativeControls
        resizeMode="contain"
        isLooping
      />

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{video.name}</Text>
        <Text style={styles.description}>{video.description}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color={colors.main_green} />
            <Text style={styles.detailText}>
              Time: {formatDuration(video.duration)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.main_green} />
            <Text style={styles.detailText}>
            Creation: {formatDate(video.createdAt)}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="cut-outline" size={20} color={colors.main_green} />
            <Text style={styles.detailText}>
            Cutting Range: {formatDuration(video.startTime)} - {formatDuration(video.endTime)}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text style={styles.deleteButtonText}>Delete Video</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.main_bg,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: colors.main_gray,
    borderRadius: 20,
  },
  video: {
    width: width,
    height: width * 0.6,
    backgroundColor: '#000',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: colors.card_bg,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    color: colors.white,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  deleteButtonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginTop: 20,
  }
});

export default VideoDetail;
