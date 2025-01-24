import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  Text, 
  TouchableOpacity, 
  PanResponder, 
  Animated,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import colors from '../utils/colors';
import left_ico from '../img/angle-left.png';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import useVideoStore from '../stores/useVideoStore';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');
const TIMELINE_WIDTH = width - 40;
const MIN_TRIM_DURATION = 1;
const THUMBNAIL_WIDTH = 50;
const THUMBNAIL_COUNT = 10;

const VideoTrimTool = ({route}) => {
  const videoUri = route.params.videoUri;
  const videoRef = useRef(null);
  const scrollViewRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnails, setThumbnails] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [isSaving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoName, setVideoName] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [trimmedVideoData, setTrimmedVideoData] = useState(null);
  
  const startX = useRef(new Animated.Value(0)).current;
  const endX = useRef(new Animated.Value(TIMELINE_WIDTH)).current;
  const progressX = useRef(new Animated.Value(0)).current;

  const { addVideo, setLoading } = useVideoStore();
  const navigation = useNavigation();

  useEffect(() => {
    generateThumbnails();
  }, [duration]);

  const generateThumbnails = async () => {
    if (!duration) return;

    try {
      const thumbnailArray = [];
      const interval = duration / THUMBNAIL_COUNT;

      for (let i = 0; i < THUMBNAIL_COUNT; i++) {
        const time = i * interval * 1000;
        const thumbnail = await VideoThumbnails.getThumbnailAsync(
          videoUri,
          {
            time: time,
            quality: 0.5,
          }
        );
        thumbnailArray.push(thumbnail.uri);
      }
      setThumbnails(thumbnailArray);
    } catch (error) {
      console.log('Thumbnail oluşturma hatası:', error);
    }
  };

  const startPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      if (isPlaying) {
        videoRef.current?.pauseAsync();
        setIsPlaying(false);
      }
    },
    onPanResponderMove: (_, gestureState) => {
      const newPosition = Math.max(0, gestureState.moveX - 20);
      const maxPosition = endX._value - MIN_TRIM_DURATION * (TIMELINE_WIDTH / duration);
      
      if (newPosition >= 0 && newPosition < maxPosition) {
        startX.setValue(newPosition);
        const newTime = (newPosition / TIMELINE_WIDTH) * duration;
        videoRef.current?.setPositionAsync(newTime * 1000);
      }
    },
    onPanResponderRelease: () => {
      const newTime = (startX._value / TIMELINE_WIDTH) * duration;
      videoRef.current?.setPositionAsync(newTime * 1000);
    },
  });

  const endPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newPosition = gestureState.moveX - 20;
      if (newPosition <= TIMELINE_WIDTH && newPosition > startX._value + MIN_TRIM_DURATION * (TIMELINE_WIDTH / duration)) {
        endX.setValue(newPosition);
        if (isPlaying) {
          videoRef.current?.pauseAsync();
          setIsPlaying(false);
        }
        const newTime = (newPosition / TIMELINE_WIDTH) * duration;
        videoRef.current?.setPositionAsync(newTime * 1000);
      }
    },
    onPanResponderRelease: () => {
      const newTime = (endX._value / TIMELINE_WIDTH) * duration;
      videoRef.current?.setPositionAsync(newTime * 1000);
    },
  });

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    try {
      const status = await videoRef.current.getStatusAsync();
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        const selectedTimes = getSelectedTimes();
        await videoRef.current.setPositionAsync(selectedTimes.start * 1000);
        await videoRef.current.playAsync();
        setIsPlaying(true);
        startProgressAnimation(selectedTimes.start, selectedTimes.end);
      }
    } catch (error) {
      console.log('Video oynatma hatası:', error);
    }
  };

  const seekVideo = async (seconds) => {
    if (!videoRef.current) return;
    
    const status = await videoRef.current.getStatusAsync();
    const newTime = Math.max(0, Math.min(status.positionMillis / 1000 + seconds, duration));
    await videoRef.current.setPositionAsync(newTime * 1000);
  };

  const startProgressAnimation = (startTime, endTime) => {
    const duration = (endTime - startTime) * 1000;
    progressX.setValue(startX._value);
    
    Animated.timing(progressX, {
      toValue: endX._value,
      duration: duration,
      useNativeDriver: false,
    }).start();
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      const currentTimeInSeconds = status.positionMillis / 1000;
      setCurrentTime(currentTimeInSeconds);
      
      if (!duration && status.durationMillis) {
        setDuration(status.durationMillis / 1000);
      }

      const selectedTimes = getSelectedTimes();
      if (currentTimeInSeconds >= selectedTimes.end) {
        videoRef.current?.pauseAsync();
        setIsPlaying(false);
        videoRef.current?.setPositionAsync(selectedTimes.start * 1000);
      }
    }
  };

  const getSelectedTimes = () => {
    const startTime = (startX._value / TIMELINE_WIDTH) * duration;
    const endTime = (endX._value / TIMELINE_WIDTH) * duration;
    
    // Değerleri kontrol et ve düzelt
    const start = Math.max(0, startTime);
    const end = Math.min(duration, endTime);
    
    // Sayısal değerleri kontrol et
    if (isNaN(start) || isNaN(end)) {
      throw new Error('Geçersiz süre değerleri');
    }
    
    console.log('Hesaplanan süreler:', { start, end, duration });
    
    return {
      start: Number(start.toFixed(2)),
      end: Number(end.toFixed(2))
    };
  };

  const saveVideo = async () => {
    if (!videoRef.current) return;
    
    try {
      setSaving(true);
      setLoading(true);
      
      const selectedTimes = getSelectedTimes();
      console.log('Seçilen süreler:', selectedTimes);

      const outputUri = `${FileSystem.cacheDirectory}trimmed_video_${Date.now()}.mp4`;
      
      // Video kesme işlemi
      const command = `-i ${videoUri} -ss ${selectedTimes.start} -t ${selectedTimes.end - selectedTimes.start} -c:v copy -c:a copy ${outputUri}`;
      await FFmpegKit.execute(command);

      // Thumbnail oluştur
      const thumbnailUri = await generateThumbnail(outputUri);
      
      // Video verilerini hazırla
      const videoData = {
        id: `video_${Date.now()}`,
        uri: outputUri,
        originalUri: videoUri,
        thumbnailUri: thumbnailUri,
        duration: Number((selectedTimes.end - selectedTimes.start).toFixed(2)),
        startTime: Number(selectedTimes.start.toFixed(2)) || 0, // Kesinlikle sayı olduğundan emin ol
        endTime: Number(selectedTimes.end.toFixed(2)),
        createdAt: new Date().toISOString(),
        name: 'İsimsiz Video', // Varsayılan değerler ekle
        description: 'Açıklama yok'
      };

      // Debug için tüm değerleri kontrol et
      console.log('Hazırlanan video verisi:', JSON.stringify(videoData, null, 2));

      // Zorunlu alanları kontrol et
      const requiredFields = ['id', 'uri', 'startTime', 'endTime', 'duration', 'name'];
      const missingFields = requiredFields.filter(field => 
        videoData[field] === null || 
        videoData[field] === undefined || 
        (typeof videoData[field] === 'number' && isNaN(videoData[field]))
      );

      if (missingFields.length > 0) {
        throw new Error(`Eksik alanlar: ${missingFields.join(', ')}`);
      }

      setTrimmedVideoData(videoData);
      setModalVisible(true);

    } catch (error) {
      console.error('Video kaydetme hatası:', error);
      Alert.alert('Hata', 'Video kaydedilirken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnail = async (videoUri) => {
    try {
      const thumbnail = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 0,
        quality: 1
      });
      return thumbnail.uri;
    } catch (error) {
      console.error('Thumbnail oluşturma hatası:', error);
      throw error;
    }
  };

  const handleSaveWithDetails = async () => {
    try {
      if (!trimmedVideoData) {
        throw new Error('Video verisi bulunamadı');
      }

      // Tüm değerlerin dolu olduğundan emin ol
      const finalVideoData = {
        ...trimmedVideoData,
        name: videoName.trim() || 'İsimsiz Video',
        description: videoDescription.trim() || 'Açıklama yok',
        createdAt: trimmedVideoData.createdAt || new Date().toISOString(),
        duration: trimmedVideoData.duration || 0,
        startTime: trimmedVideoData.startTime || 0,
        endTime: trimmedVideoData.endTime || 0,
        originalUri: trimmedVideoData.originalUri || trimmedVideoData.uri,
        thumbnailUri: trimmedVideoData.thumbnailUri || ''
      };

      // Debug için kontrol
      console.log('Kaydedilecek final video verisi:', finalVideoData);

      // Tüm gerekli alanların dolu olduğunu kontrol et
      const requiredFields = ['id', 'name', 'uri', 'duration', 'startTime', 'endTime', 'createdAt'];
      const missingFields = requiredFields.filter(field => !finalVideoData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing fields: ${missingFields.join(', ')}`);
      }

      // useVideoStore üzerinden kaydet
      await addVideo(finalVideoData);
      
      setModalVisible(false);
      setSaving(false);
      
      Alert.alert(
        'Success',
        'Video successfully saved!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Video save error:', error);
      Alert.alert(
        'Error',
        'An error occurred while saving the video: ' + error.message
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
       <StatusBar backgroundColor={colors.main_bg} barStyle={'light-content'} />
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.topBarButton} 
          onPress={() => {navigation.goBack()}}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.topBarButton, styles.saveButton]} 
          onPress={saveVideo}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUri }}
            style={styles.video}
            resizeMode="contain"
            shouldPlay={false}
            onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          />
        </View>

        <View style={styles.editorContainer}>
          <TouchableOpacity 
            style={styles.playButtonContainer} 
            onPress={togglePlayPause}
          >
            <View style={styles.playButton}>
              <MaterialIcons 
                name={isPlaying ? "pause" : "play-arrow"} 
                size={24} 
                color="#FFFFFF" 
              />
            </View>
          </TouchableOpacity>

          <View style={styles.timelineWrapper}>
            <ScrollView 
              ref={scrollViewRef}
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.timelineScroll}
            >
              <View style={styles.thumbnailContainer}>
                {thumbnails.map((uri, index) => (
                  <Image 
                    key={index}
                    source={{ uri }}
                    style={styles.thumbnail}
                  />
                ))}
              </View>

              <View style={styles.trimmerOverlay}>
                <Animated.View
                  style={[styles.darkArea, { width: startX }]}
                />
                <Animated.View
                  style={[
                    styles.darkArea, 
                    { left: endX, right: 0 }
                  ]}
                />

                <Animated.View
                  style={[styles.handle, styles.leftHandle, { left: startX }]}
                  {...startPanResponder.panHandlers}
                >
                  <View style={styles.handleBar}>
                    <Text style={styles.handleIcon}>{'‹'}</Text>
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.handle, styles.rightHandle, { left: endX }]}
                  {...endPanResponder.panHandlers}
                >
                  <View style={styles.handleBar}>
                    <Text style={styles.handleIcon}>{'›'}</Text>
                  </View>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.selectedArea,
                    {
                      left: startX,
                      width: Animated.subtract(endX, startX),
                    },
                  ]}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Video Details</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Video Name"
              placeholderTextColor="#999"
              value={videoName}
              onChangeText={setVideoName}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Video Description"
              placeholderTextColor="#999"
              value={videoDescription}
              onChangeText={setVideoDescription}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveWithDetails}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.main_bg,
  },
  topBar: {
    height: height/17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.main_bg,
  },
  topBarButton: {
    padding: 8,
    borderRadius:10,
  },
  saveButton: {
    backgroundColor: '#0071e3', // Apple mavi rengi
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: colors.main_bg,
  },
  video: {
    flex: 1,
  },
  editorContainer: {
    height: 80,
    backgroundColor: '#1C1C1E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  playButtonContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineWrapper: {
    flex: 1,
    height: 44,
    marginLeft: 10,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  timelineScroll: {
    height: '100%',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  thumbnail: {
    width: 44,
    height: '100%',
  },
  trimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  darkArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
    zIndex: 10,
  },
  leftHandle: {
    left: 0,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  rightHandle: {
    right: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  handleBar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB800',
  },
  handleIcon: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
  },
  selectedArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#FFB800',
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default VideoTrimTool;