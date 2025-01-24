import React, { Component } from 'react';
import { View, Text } from 'react-native';

class ErrorBoundary extends Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        // Hata meydana geldiğinde state'i güncelle
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Hata yakalanırsa, hata bilgilerini konsola yazdır
        console.log('Error caught in ErrorBoundary:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View>
                    <Text>Bir hata oluştu.</Text>
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
