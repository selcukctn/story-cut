import { create } from "zustand";
import database from '../services/database';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const useVideoStore = create((set, get) => ({
  videos: [],
  loading: false,
  error: null,
  
  initializeStore: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Veritabanı başlatılıyor...');
      await database.init();
      const result = await database.getVideos();
      const videos = Array.isArray(result) ? result : [];
      console.log('Yüklenen video sayısı:', videos.length);
      
      set({ 
        videos,
        loading: false 
      });
    } catch (error) {
      console.error('Store başlatma hatası:', error);
      set({ 
        error: error.message,
        loading: false 
      });
    }
  },

  addVideo: async (videoData) => {
    set({ loading: true, error: null });
    try {
      console.log('Video ekleniyor:', videoData.uri);
      
      const newVideoData = {
        ...videoData,
        id: `video_${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      await database.addVideo(newVideoData);
      
      const result = await database.getVideos();
      const videos = Array.isArray(result) ? result : [];
      
      console.log('Video başarıyla eklendi');
      
      set({ 
        videos,
        loading: false 
      });
      
      return newVideoData;
    } catch (error) {
      console.error('Video ekleme hatası:', error);
      set({ 
        error: error.message,
        loading: false 
      });
      throw error;
    }
  },

  refreshVideos: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Videolar yenileniyor...');
      const result = await database.getVideos();
      const videos = Array.isArray(result) ? result : [];
      
      console.log('Videolar yenilendi, toplam:', videos.length);
      set({ 
        videos,
        loading: false 
      });
    } catch (error) {
      console.error('Video yenileme hatası:', error);
      set({ 
        error: error.message,
        loading: false 
      });
    }
  },

  deleteVideo: async (id) => {
    try {
      set({ loading: true });
      console.log('Video siliniyor, ID:', id);
      
      const success = await database.deleteVideo(id);
      
      if (success) {
        const result = await database.getVideos();
        const videos = Array.isArray(result) ? result : [];
        
        console.log('Video başarıyla silindi');
        set({ 
          videos,
          loading: false 
        });
        return true;
      } else {
        throw new Error('Video silinemedi');
      }
    } catch (error) {
      console.error('Video silme hatası:', error);
      set({ 
        error: error.message,
        loading: false 
      });
      return false;
    }
  },

  clearVideos: async () => {
    set({ loading: true, error: null });
    try {
      const result = await database.deleteAllVideos();
      if (result) {
        set({ videos: [], loading: false });
        return true;
      } else {
        throw new Error('Veritabanı sıfırlama başarısız oldu');
      }
    } catch (error) {
      console.error('Video temizleme hatası:', error);
      set({ error: error.message, loading: false });
      return false;
    }
  },
  
  clearError: () => set({ error: null }),
  setLoading: (loading) => set({ loading }),
  
  getVideoCount: () => get().videos.length,
  
  getVideoById: (id) => get().videos.find(video => video.id === id),
  
  resetStore: () => set({ videos: [], loading: false, error: null })
}));

export default useVideoStore;
