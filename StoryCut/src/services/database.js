import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'videos.db';

class Database {
  constructor() {
    this.db = null;
  }

  async ensureDirectories() {
    if (Platform.OS === 'ios') {
      const dirs = [
        `${FileSystem.documentDirectory}SQLite`,
        `${FileSystem.documentDirectory}videos`,
        `${FileSystem.documentDirectory}thumbnails`
      ];

      for (const dir of dirs) {
        const { exists } = await FileSystem.getInfoAsync(dir);
        if (!exists) {
          console.log(`Dizin oluşturuluyor: ${dir}`);
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }
      }
    }
  }

  async init() {
    try {
      if (this.db) {
        return this.db;
      }

      await this.ensureDirectories();

      let dbPath = DB_NAME;
      if (Platform.OS === 'ios') {
        dbPath = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
      }

      console.log('Veritabanı açılıyor...', dbPath);
      
      this.db = SQLite.openDatabaseSync(DB_NAME);
      
      if (!this.db) {
        throw new Error('Veritabanı açılamadı');
      }

      console.log('Veritabanı bağlantısı başarılı');

      // Tablo kontrolü ve oluşturma
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          uri TEXT,
          originalUri TEXT,
          duration REAL,
          startTime REAL,
          endTime REAL,
          createdAt TEXT,
          thumbnailUri TEXT
        );
      `);

      // Test verisi ekle
      const testQuery = "SELECT * FROM videos LIMIT 1;";
      const testResult = await this.db.execAsync(testQuery);
      console.log('Test sorgu sonucu:', testResult);

      return this.db;
    } catch (error) {
      console.error('Veritabanı init hatası:', error);
      throw error;
    }
  }

  async addVideo(videoData) {
    try {
      if (!this.db) await this.init();

      // iOS için dosya yollarını düzelt
      if (Platform.OS === 'ios') {
        if (videoData.uri) {
          const newVideoPath = `${FileSystem.documentDirectory}videos/video_${Date.now()}.mp4`;
          if (videoData.uri !== newVideoPath) {
            await FileSystem.moveAsync({
              from: videoData.uri,
              to: newVideoPath
            });
            videoData.uri = newVideoPath;
          }
        }

        if (videoData.thumbnailUri) {
          if (videoData.thumbnailUri.includes('default_thumb.jpg')) {
            const newThumbPath = `${FileSystem.documentDirectory}thumbnails/thumb_${Date.now()}.jpg`;
            const defaultThumbData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            await FileSystem.writeAsStringAsync(newThumbPath, defaultThumbData, {
              encoding: FileSystem.EncodingType.Base64,
            });
            videoData.thumbnailUri = newThumbPath;
          } else {
            const newThumbPath = `${FileSystem.documentDirectory}thumbnails/thumb_${Date.now()}.jpg`;
            if (videoData.thumbnailUri !== newThumbPath) {
              await FileSystem.moveAsync({
                from: videoData.thumbnailUri,
                to: newThumbPath
              });
              videoData.thumbnailUri = newThumbPath;
            }
          }
        }
      }

      // Verileri hazırla ve undefined kontrolü yap
      const id = videoData.id || `video_${Date.now()}`;
      const name = videoData.name || 'İsimsiz Video';
      const description = videoData.description || '';
      const uri = videoData.uri || '';
      const originalUri = videoData.originalUri || videoData.uri || '';
      const duration = Number(videoData.duration) || 0;
      const startTime = Number(videoData.startTime) || 0;
      const endTime = Number(videoData.endTime) || 0;
      const createdAt = videoData.createdAt || new Date().toISOString();
      const thumbnailUri = videoData.thumbnailUri || '';

      // SQL sorgusunu oluştur
      const sql = `
        INSERT OR REPLACE INTO videos (
          id, name, description, uri, originalUri, 
          duration, startTime, endTime, createdAt, thumbnailUri
        ) VALUES (
          '${id}', 
          '${name.replace(/'/g, "''")}', 
          '${description.replace(/'/g, "''")}', 
          '${uri.replace(/'/g, "''")}', 
          '${originalUri.replace(/'/g, "''")}', 
          ${duration}, 
          ${startTime}, 
          ${endTime}, 
          '${createdAt}', 
          '${thumbnailUri.replace(/'/g, "''")}'
        );
      `;

      console.log('Çalıştırılacak SQL sorgusu:', sql);
      const insertResult = await this.db.execAsync(sql);
      console.log('SQL ekleme sonucu:', insertResult);
      console.log('Video başarıyla kaydedildi');

      // Eklenen videoyu doğrula
      const verifyResult = await this.db.execAsync(`SELECT * FROM videos WHERE id = '${id}';`);
      console.log('Doğrulama sonucu:', verifyResult);

      return videoData;
    } catch (error) {
      console.error('Video ekleme hatası:', error);
      throw error;
    }
  }

  async getVideos() {
    try {
      if (!this.db) {
        await this.init();
      }

      const result = await this.db.getAllAsync('SELECT * FROM videos ORDER BY createdAt DESC');
      console.log('Bulunan videolar:', result);

      if (Array.isArray(result)) {
        console.log(`${result.length} video bulundu`);
        return result;
      }

      console.log('Video bulunamadı veya geçersiz sonuç');
      return [];
    } catch (error) {
      console.error('Videoları getirme hatası:', error);
      return [];
    }
  }

  async deleteVideo(id) {
    try {
      if (!this.db) await this.init();

      console.log('Video silme işlemi başlatılıyor, ID:', id);

      // Önce video bilgilerini al
      const result = await this.db.getAllAsync(`SELECT * FROM videos WHERE id = '${id}'`);
      console.log('Video arama sonucu:', result);

      if (result && result.length > 0) {
        const video = result[0];
        console.log('Silinecek video bulundu:', video);

        // Dosyaları sil
        if (Platform.OS === 'ios') {
          try {
            if (video.uri) {
              const uriExists = await FileSystem.getInfoAsync(video.uri);
              if (uriExists.exists) {
                await FileSystem.deleteAsync(video.uri, { idempotent: true });
                console.log('Video dosyası silindi:', video.uri);
              }
            }
            
            if (video.thumbnailUri) {
              const thumbnailExists = await FileSystem.getInfoAsync(video.thumbnailUri);
              if (thumbnailExists.exists) {
                await FileSystem.deleteAsync(video.thumbnailUri, { idempotent: true });
                console.log('Thumbnail dosyası silindi:', video.thumbnailUri);
              }
            }
          } catch (fileError) {
            console.error('Dosya silme hatası:', fileError);
          }
        }

        // Veritabanından kaydı sil
        await this.db.execAsync(`DELETE FROM videos WHERE id = '${id}'`);
        console.log('Video veritabanından silindi');
        return true;
      }

      console.log('Silinecek video bulunamadı');
      return true;
    } catch (error) {
      console.error('Video silme hatası:', error);
      return false;
    }
  }

  async deleteAllVideos() {
    try {
      if (!this.db) await this.init();
      
      console.log('Veritabanı sıfırlama başlatılıyor...');

      // Mevcut videoları al
      const videos = await this.getVideos();
      console.log('Silinecek video sayısı:', videos.length);

      // iOS için dosya sistemini temizle
      if (Platform.OS === 'ios') {
        // Dosyaları sil
        for (const video of videos) {
          try {
            if (video.uri) {
              const videoExists = await FileSystem.getInfoAsync(video.uri);
              if (videoExists.exists) {
                await FileSystem.deleteAsync(video.uri, { idempotent: true });
                console.log('Video dosyası silindi:', video.uri);
              }
            }

            if (video.thumbnailUri) {
              const thumbnailExists = await FileSystem.getInfoAsync(video.thumbnailUri);
              if (thumbnailExists.exists) {
                await FileSystem.deleteAsync(video.thumbnailUri, { idempotent: true });
                console.log('Thumbnail dosyası silindi:', video.thumbnailUri);
              }
            }
          } catch (error) {
            console.error('Dosya silme hatası:', error);
          }
        }

        // Ana dizinleri temizle
        try {
          const videosDir = `${FileSystem.documentDirectory}videos/`;
          const thumbnailsDir = `${FileSystem.documentDirectory}thumbnails/`;

          const videosDirInfo = await FileSystem.getInfoAsync(videosDir);
          const thumbnailsDirInfo = await FileSystem.getInfoAsync(thumbnailsDir);

          if (videosDirInfo.exists) {
            await FileSystem.deleteAsync(videosDir, { idempotent: true });
            console.log('Videos dizini silindi');
          }

          if (thumbnailsDirInfo.exists) {
            await FileSystem.deleteAsync(thumbnailsDir, { idempotent: true });
            console.log('Thumbnails dizini silindi');
          }
        } catch (error) {
          console.error('Dizin silme hatası:', error);
        }
      }

      // Veritabanını sıfırla
      await this.db.execAsync('DROP TABLE IF EXISTS videos');
      console.log('Tablo silindi');

      // Yeni tabloyu oluştur
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS videos (
          id TEXT PRIMARY KEY,
          name TEXT,
          description TEXT,
          uri TEXT,
          originalUri TEXT,
          duration REAL,
          startTime REAL,
          endTime REAL,
          createdAt TEXT,
          thumbnailUri TEXT
        )
      `);
      console.log('Yeni tablo oluşturuldu');

      // Kontrol et
      const result = await this.db.execAsync('SELECT * FROM videos');
      console.log('Tablo kontrol sonucu:', result);

      return true;
    } catch (error) {
      console.error('Veritabanı sıfırlama hatası:', error);
      return false;
    }
  }
}

const database = new Database();
export default database;
