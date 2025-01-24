import { create } from "zustand";
import { setupDatabase, addVideo, getVideos, resetDatabase, deleteVideo } from '../services/database';

const useVideoStore = create((set, get) => ({
  videos: [],
  loading: false,
  error: null,
  
  // Veritabanını başlat ve videoları yükle
  initializeStore: async () => {
    set({ loading: true, error: null });
    try {
      await setupDatabase();
      const savedVideos = await getVideos();
      console.log('Yüklenen videolar:', savedVideos);
      set({ 
        videos: savedVideos,
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

  // Yeni video ekle
  addVideo: async (videoData) => {
    set({ loading: true, error: null });
    try {
      const newVideo = {
        ...videoData,
        id: `video_${Date.now()}`,
      };

      await addVideo(newVideo);
      
      // Store'u güncelle
      set(state => ({
        videos: [newVideo, ...state.videos],
        loading: false
      }));
      return newVideo;
    } catch (error) {
      console.error('Video ekleme hatası db:', error);
      set({ 
        error: error.message,
        loading: false 
      });
      throw error;
    }
  },

  // Video listesini yenile
  refreshVideos: async () => {
    set({ loading: true, error: null });
    try {
      const videos = await getVideos();
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

  // Hata durumunu temizle
  clearError: () => set({ error: null }),

  // Loading durumunu güncelle
  setLoading: (loading) => set({ loading }),

  resetStore: async () => {
    try {
      set({ loading: true });
      console.log('Store sıfırlama başlatılıyor...');
      
      const result = await resetDatabase();
      console.log('Veritabanı sıfırlama sonucu:', result);
      
      if (result) {
        set({ videos: [] });
        console.log('Store sıfırlandı ve videos array temizlendi');
        return true;
      }
      
      console.error('Veritabanı sıfırlanamadı');
      return false;
    } catch (error) {
      console.error('Store sıfırlama hatası:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },
  deleteVideo: async (id) => {
    try {
      set({ loading: true });
      console.log('Store: Video silme işlemi başlatılıyor, ID:', id);
      
      const result = await deleteVideo(id);  // Yeniden adlandırılmış fonksiyonu kullan
      
      if (result) {
        const videos = await getAllVideos();
        set({ videos });
        console.log('Store: Video silindi ve veriler güncellendi');
      }
      
      return result;
    } catch (error) {
      //console.error('Store: Video silme hatası:', error);
      return true;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useVideoStore;
