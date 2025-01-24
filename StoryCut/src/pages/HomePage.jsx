import React, { useContext, useEffect,} from "react";
import { View, StyleSheet, Dimensions, Text, Pressable, Image, FlatList, SafeAreaView, ActivityIndicator, Alert,  StatusBar, } from "react-native";
import useVideoStore from "../stores/useVideoStore";
import Skeleton from "../components/Skeleton";
import colors from "../utils/colors";
import film_ico from "../img/film.png";
import settings_ico from "../img/settings.png";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HomePage = ({ navigation }) => {
    const videos = useVideoStore(state => state.videos);
    const loading = useVideoStore(state => state.loading);
    const initializeStore = useVideoStore(state => state.initializeStore);
    const resetStore = useVideoStore(state => state.resetStore);

    useEffect(() => {
        initializeStore();
    }, []);

    const handleRenderItem = ({ item }) => {
        console.log('Render edilen video:', item);
        return (
            <Pressable 
                style={styles.videoCard}
                onPress={() => {
                    console.log('Seçilen video:', item);
                    if (item && item.id) {
                        navigation.navigate('VideoDetail', { video: item });
                    } else {
                        console.error('Geçersiz video verisi:', item);
                    }
                }}
            >
                <Image 
                    source={{ uri: item.thumbnailUri }}
                    style={styles.thumbnail}
                />
                <View style={styles.videoInfo}>
                    <Text style={styles.videoName} numberOfLines={1}>
                        {item.name || 'İsimsiz Video'}
                    </Text>
                    <Text style={styles.videoDescription} numberOfLines={2}>
                        {item.description || 'Açıklama yok'}
                    </Text>
                    <View style={styles.bottomInfo}>
                        <Text style={styles.videoDate}>
                            {format(new Date(item.createdAt), 'dd MMMM yyyy HH:mm')}
                        </Text>
                        <Text style={styles.videoDuration}>
                            {Math.floor(item.duration || 0)}sn
                        </Text>
                    </View>
                    <View style={styles.videoTimes}>
                        <Text style={styles.timeText}>
                            Start: {Math.floor(item.startTime || 0)}sn
                        </Text>
                        <Text style={styles.timeText}>
                            End: {Math.floor(item.endTime || 0)}sn
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    }

    const handleReset = () => {
        Alert.alert(
            'Veritabanını Sıfırla',
            'Tüm videolar ve veriler silinecek. Bu işlem geri alınamaz. Devam etmek istiyor musunuz?',
            [
                {
                    text: 'İptal',
                    style: 'cancel'
                },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await resetStore();
                            if (result) {
                                Alert.alert('Başarılı', 'Veritabanı başarıyla sıfırlandı');
                            } else {
                                Alert.alert('Hata', 'Sıfırlama işlemi başarısız oldu');
                            }
                        } catch (error) {
                            console.error('Sıfırlama hatası:', error);
                            Alert.alert('Hata', 'Sıfırlama işlemi sırasında bir hata oluştu');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.main_green} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={colors.main_bg} barStyle={'light-content'} />
            <View style={styles.top_bar}>
                <Text style={styles.top_bar_title}>StoryCut</Text>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 10,
                }}>
                    <Pressable style={styles.send_button} onPress={() => { navigation.navigate('SelectVideo')}}>
                        <Image
                            source={film_ico}
                            style={styles.icon}
                        />
                    </Pressable>
                    <Pressable style={styles.send_button} onPress={() => { navigation.navigate('Settings')}}>
                        <Image
                            source={settings_ico}
                            style={styles.icon}
                        />
                    </Pressable>
                </View>
            </View>

            <View style={styles.main}>
                {videos.length == 0 ? <>
                    <Text
                        style={{ color: colors.white }}
                    >No videos yet</Text>
                </> : <>
                    <FlatList
                        data={videos}
                        renderItem={handleRenderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>Henüz video yok</Text>
                            </View>
                        )}
                    />
                </>}
            </View>
        </SafeAreaView>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.main_bg,
    },
    top_bar: {
        width: width,
        height: height / 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.main_bg,
        padding: 10,
    },
    top_bar_title: {
        fontWeight: 'bold',
        color: colors.main_green,
        fontSize: width / 19,
    },
    icon: {
        width: 25,
        height: 25,
        tintColor: colors.main_bg,
    },
    main: {
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    send_button: {
        width: height / 23,
        height: height / 23,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: colors.main_green,
    },
    videoCard: {
        width: width / 1.1,
        height: height / 5,
        backgroundColor: colors.main_gray,
        borderRadius: 10,
        marginVertical: 5,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    thumbnail: {
        width: width / 3,
        height: '100%',
        backgroundColor: colors.main_bg,
    },
    videoInfo: {
        flex: 1,
        padding: 10,
        justifyContent: 'space-between',
    },
    videoName: {
        color: colors.white,
        fontSize: width / 25,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    videoDescription: {
        color: colors.white,
        fontSize: width / 32,
        opacity: 0.8,
        marginBottom: 8,
    },
    bottomInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    videoDate: {
        color: colors.white,
        fontSize: width / 35,
        opacity: 0.7,
    },
    videoDuration: {
        color: colors.main_green,
        fontSize: width / 32,
        fontWeight: '500',
    },
    videoTimes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeText: {
        color: colors.white,
        fontSize: width / 35,
        opacity: 0.6,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: colors.white,
        fontSize: width / 25,
    },
    resetButton: {
        backgroundColor: colors.error,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        margin: 10,
    },
    resetButtonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HomePage;