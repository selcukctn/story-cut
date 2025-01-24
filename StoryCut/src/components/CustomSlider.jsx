import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions, Image, ImageBackground, ActivityIndicator } from 'react-native';
import colors from '../utils/colors';
import VideoPlayer from "expo-video-player";

const { width, height } = Dimensions.get("window");
const SLIDER_WIDTH = width / 1.3;
const THUMB_SIZE = 20;

const CustomRangeSlider = ({ imageUri, videoUri, setStartTime, setEndTime }) => {
    const [range, setRange] = useState({ min: 0, max: 0 });
    const [loading, setLoading] = useState(true);
    const sliderWidthRef = useRef(SLIDER_WIDTH);
    const minPosition = useRef(new Animated.Value(0)).current;
    const maxPosition = useRef(new Animated.Value(SLIDER_WIDTH)).current;
    const [videoDuration, setVideoDuration] = useState(0); 

    const handleVideoLoad = (data) => {
        const duration = data.durationMillis / 1000; 
        setVideoDuration(duration);
        setEndTime(duration);
        setRange({ min: 0, max: duration });
        setLoading(false);
    };

    const panResponderMin = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                let newX = Math.min(
                    Math.max(0, gestureState.moveX - 20), 
                    maxPosition._value - THUMB_SIZE 
                );
                minPosition.setValue(newX);
                updateRange(newX, maxPosition._value); 
            },
            onPanResponderRelease: () => {
                updateRange(minPosition._value, maxPosition._value); 
            },
        })
    ).current;

    const panResponderMax = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                let newX = Math.max(
                    Math.min(sliderWidthRef.current, gestureState.moveX - 20),
                    minPosition._value + THUMB_SIZE
                );
                maxPosition.setValue(newX);
                updateRange(minPosition._value, newX); 
            },
            onPanResponderRelease: () => {
                updateRange(minPosition._value, maxPosition._value); 
            },
        })
    ).current;

    const updateRange = (minX, maxX) => {
        const min = (minX / SLIDER_WIDTH) * videoDuration;
        const max = (maxX / SLIDER_WIDTH) * videoDuration;
        setRange({
            min: formatTime(min),
            max: formatTime(max),
        });
        setStartTime(min);
        setEndTime(max);
    };

    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = Math.floor(timeInSeconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    useEffect(() => {
        if (videoDuration) {
            setRange({ min: formatTime(0), max: formatTime(videoDuration) });
        }
    }, [videoDuration]);

    const renderScale = () => {
        const scaleMarks = [];
        const numMarks = 10;
        for (let i = 0; i <= numMarks; i++) {
            const position = (SLIDER_WIDTH / numMarks) * i;
            scaleMarks.push(
                <View key={i} style={[styles.scaleMark, { left: position }]} />
            );
        }
        return scaleMarks;
    };

    return (
        <View style={styles.container}>
            <VideoPlayer
                videoProps={{
                    source: { uri: videoUri },
                    shouldPlay: false,
                    onLoad: handleVideoLoad,
                    resizeMode: 'contain',
                }}
                style={{
                    width: width / 1.1,
                    height: height / 4,
                }}
                inFullscreen={false}
            />
            {
                loading ? <ActivityIndicator /> :
                    <>
                        <Text style={styles.rangeText}>
                            Başlangıç: {range.min} - Bitiş: {range.max}
                        </Text>
                        {/* Slider Çubuğu */}
                        <View style={styles.sliderContainer}>
                            <ImageBackground
                                style={styles.slider}
                                source={{ uri: imageUri }}
                            >
                                {/* Seçilen Aralık */}
                                <Animated.View
                                    style={[styles.selectedRange, {
                                        left: minPosition,
                                        width: Animated.subtract(maxPosition, minPosition),
                                    }]}

                                />

                                {/* Minimum Nokta */}
                                <Animated.View
                                    style={[styles.thumb, { left: minPosition }]}
                                    {...panResponderMin.panHandlers}
                                />

                                {/* Maksimum Nokta */}
                                <Animated.View
                                    style={[styles.thumb, { left: maxPosition }]}
                                    {...panResponderMax.panHandlers}
                                />
                            </ImageBackground>

                            {/* Cetvel ve işaretler */}
                            <View style={styles.scaleContainer}>
                                {renderScale()}
                            </View>
                        </View>
                    </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    rangeText: {
        fontSize: 16,
        marginBottom: 20,
        color: colors.main_green,
    },
    sliderContainer: {
        alignItems: 'center',
    },
    slider: {
        width: SLIDER_WIDTH,
        backgroundColor: colors.main_gray,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    selectedRange: {
        position: 'absolute',
        height: 4,
        backgroundColor: colors.main_green,
        borderRadius: 2,
    },
    thumb: {
        position: 'absolute',
        width: 10,
        height: 40,
        backgroundColor: colors.main_green,
    },
    scaleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: SLIDER_WIDTH,
        marginTop: 10,
    },
    scaleMark: {
        position: 'absolute',
        width: 2,
        height: 10,
        backgroundColor: colors.main_green,
        bottom: -5,
    },
});

export default CustomRangeSlider;
