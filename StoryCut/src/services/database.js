import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

// Veritabanı yolu tanımlama
const dbName = 'videos.db';
const dbPath = FileSystem.documentDirectory + dbName;

// Veritabanı bağlantısı
const db = SQLite.openDatabaseSync(dbPath);
const getDatabase = () => {
  if (db === null) {
    db = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return db;
};
// Veritabanı kurulumu
const setupDatabase = async () => {
  try {
    await db.execAsync(`
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
    console.log("Tablo oluşturuldu");
  } catch (error) {
    console.error('Veritabanı kurulum hatası:', error);
    throw error;
  }
};

// Video ekleme fonksiyonu
const addVideo = async (videoData) => {
  const db = getDatabase();
  try {
    // Gelen veriyi kontrol et
    console.log('Kaydedilecek video verisi:', JSON.stringify(videoData, null, 2));

    // Veriyi güvenli bir şekilde hazırla
    const video = {
      id: videoData.id || `video_${Date.now()}`,
      name: videoData.name || 'İsimsiz Video',
      description: videoData.description || '',
      uri: videoData.uri,
      originalUri: videoData.originalUri || videoData.uri,
      duration: Number(videoData.duration) || 0,
      startTime: Number(videoData.startTime) || 0,
      endTime: Number(videoData.endTime) || 0,
      createdAt: videoData.createdAt || new Date().toISOString(),
      thumbnailUri: videoData.thumbnailUri || ''
    };

    // SQL sorgusunu template literal ile oluştur
    const query = `
      INSERT OR REPLACE INTO videos (
        id, 
        name, 
        description, 
        uri,
        originalUri,
        duration,
        startTime,
        endTime,
        createdAt,
        thumbnailUri
      ) VALUES (
        '${video.id}',
        '${video.name}',
        '${video.description}',
        '${video.uri}',
        '${video.originalUri}',
        ${video.duration},
        ${video.startTime},
        ${video.endTime},
        '${video.createdAt}',
        '${video.thumbnailUri}'
      )
    `;

    console.log('SQL Sorgusu:', query);

    // Sorguyu çalıştır
    await db.execAsync(query);

    // Kaydın başarılı olup olmadığını kontrol et
    const savedVideos = await db.execAsync(`
      SELECT * FROM videos WHERE id = '${video.id}'
    `);

    console.log('Kaydedilen video sorgu sonucu:', savedVideos);

    // SQLite'ın döndürdüğü sonuç yapısını kontrol et
    if (savedVideos && Array.isArray(savedVideos) && savedVideos.length > 0) {
      console.log('Video başarıyla kaydedildi');
      return true;
    }

    // Eğer buraya kadar geldiyse ve hata oluşmadıysa, kayıt başarılıdır
    console.log('Video kaydedildi ama sorgu sonucu boş döndü');
    return true;

  } catch (error) {
    console.error('Video kaydetme hatası db:', error);
    throw error;
  }
};

// Videoları getirme fonksiyonu
const getVideos = async () => {
  try {
    const result = await db.getAllAsync(`
      SELECT * FROM videos ORDER BY createdAt DESC
    `);
    console.log("Bulunan videolar:", result);
    return result || [];
  } catch (error) {
    console.error('Videoları getirme hatası:', error);
    return [];
  }
};

const deleteVideo = async (id) => {
  const db = getDatabase();
  try {
    console.log('Video silme işlemi başlatılıyor, ID:', id);

    // Önce video bilgilerini al
    const query = `
      SELECT * FROM videos 
      WHERE id = '${id}'
    `;

    const result = await db.getAllAsync(query);
    console.log('Video arama sonucu:', result);
    const videos = await getVideos();
    console.log('Videolar:', videos);
    if (result && result.length > 0) {
      const video = result[0];
      console.log('Silinecek video bulundu:', video);
      // Dosyaları sil
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

      // Veritabanından kaydı sil
      const deleteQuery = `
        DELETE FROM videos 
        WHERE id = '${id}'
      `;
      
      await db.execAsync(deleteQuery);
      console.log('Video veritabanından silindi');
      return true;
    } else {
      console.log('Silinecek video bulunamadı');
      return true;
    }
  } catch (error) {
    console.error('Video silme hatası:', error);
    return true;
  } finally{
    navigation.replace('Home');
  }
};

const resetDatabase = async () => {
  try {
    console.log('Veritabanı sıfırlama başlatılıyor...');
    const db = getDatabase();

    // 1. Önce mevcut videoları al
    const videos = await getVideos();
    console.log('Silinecek video sayısı:', videos.length);

    // 2. Dosya sistemini temizle
    for (const video of videos) {
      try {
        // Video dosyasını sil
        if (video.uri) {
          const videoExists = await FileSystem.getInfoAsync(video.uri);
          if (videoExists.exists) {
            await FileSystem.deleteAsync(video.uri, { idempotent: true });
            console.log('Video dosyası silindi:', video.uri);
          }
        }

        // Thumbnail dosyasını sil
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

    // 3. Ana dizinleri temizle
    try {
      const videosDir = FileSystem.documentDirectory + 'videos/';
      const thumbnailsDir = FileSystem.documentDirectory + 'thumbnails/';

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

    // 4. Veritabanını sıfırla
    try {
      // Tabloyu sil
      await db.execAsync('DROP TABLE IF EXISTS videos');
      console.log('Tablo silindi');

      // Yeni tabloyu oluştur
      await db.execAsync(`
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
      const result = await db.execAsync('SELECT * FROM videos');
      console.log('Tablo kontrol sonucu:', result);

      return true;
    } catch (dbError) {
      console.error('Veritabanı işlem hatası:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Veritabanı sıfırlama ana hatası:', error);
    throw error;
  }
};

export { 
  setupDatabase, 
  addVideo, 
  getVideos,
  deleteVideo,
  resetDatabase
};
