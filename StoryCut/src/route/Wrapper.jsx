import React, { useEffect, useState } from "react";
import Router from "./Router";
import useVideoStore from "../stores/useVideoStore";
import { View, ActivityIndicator } from "react-native";
import colors from "../utils/colors";

const Wrapper = () => {
    const [isLoading, setIsLoading] = useState(true);
    const initializeStore = useVideoStore(state => state.initializeStore);

    useEffect(() => {
        const setupDatabase = async () => {
            try {
                console.log('Veritabanı başlatılıyor...');
                await initializeStore();
                console.log('Veritabanı başlatıldı ve veriler yüklendi');
            } catch (error) {
                console.error('Veritabanı başlatma hatası:', error);
            } finally {
                setIsLoading(false);
            }
        };

        setupDatabase();
    }, []);

    if (isLoading) {
        return (
            <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center',
                backgroundColor: colors.main_bg 
            }}>
                <ActivityIndicator size="large" color={colors.main_green} />
            </View>
        );
    }

    return <Router />;
}

export default Wrapper;