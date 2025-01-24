# StoryCut App

## 📖 **Uygulama Hakkında / About the App**

**Türkçe:**  
Video Günlüğü Uygulaması, kullanıcıların cihazlarından videolar seçebildiği, videoların istedikleri herhangi bir zaman aralığını kırpabildiği, bu kırpılmış videolara isim ve açıklama ekleyebildiği bir mobil uygulamadır. Kırpılmış videolar SQLite veritabanında saklanır ve tüm bilgiler kullanıcıya düzenli bir şekilde sunulur.

**English:**  
The Video Diary App is a mobile application that allows users to select videos from their devices, crop any desired time range, and add names and descriptions to the cropped videos. The cropped videos are stored in a SQLite database, and all related information is displayed in an organized manner.

---

## 🚀 **Özellikler / Features**

### **Türkçe:**
- 📂 **Video Seçimi:** Kullanıcılar cihazlarından bir video seçebilir.  
- ✂️ **Video Kırpma:**  
  - Kullanıcılar videonun herhangi bir başlangıç ve bitiş zamanını seçebilir.  
  - Örneğin, 10. saniyeden 25. saniyeye kadar olan bölümü kırpabilir.  
- 📝 **Meta Veri Ekleme:** Kırpılan videolara isim ve açıklama eklenebilir.  
- 📋 **Kırpılmış Videoların Listesi:** Daha önce kırpılan videolar bir listede saklanır.  
- 🔎 **Detay Sayfası:** Videonun ismi, açıklaması, başlangıç ve bitiş zamanı, süre bilgisi, orijinal dosya yolu ve küçük resim gibi detayları görüntülenir.  
- 💾 **Kalıcı Depolama:** Videolar **SQLite veritabanında** tüm detaylarıyla saklanır.  

### **English:**
- 📂 **Video Selection:** Users can select a video from their device.  
- ✂️ **Video Cropping:**  
  - Users can select any start and end time within the video.  
  - For example, they can crop from the 10th second to the 25th second.  
- 📝 **Add Metadata:** Names and descriptions can be added to the cropped videos.  
- 📋 **Cropped Videos List:** Previously cropped videos are stored in a list.  
- 🔎 **Details Page:** Detailed information such as name, description, start and end time, duration, original file path, and thumbnail is displayed.  
- 💾 **Persistent Storage:** Videos are stored with all details in a **SQLite database**.

---

## 🛠️ **Kullanılan Teknolojiler / Technologies Used**

### **Türkçe:**
- **React Native (Expo):** Mobil uygulama geliştirme için temel framework.  
- **Expo Router:** Uygulama içi navigasyon yönetimi.  
- **SQLite (Expo SQLite):** Kırpılan videoların tüm detaylarının cihazda kalıcı olarak saklanması için kullanılır.  
- **Zustand:** Global durum yönetimi için kullanılan hafif bir kütüphane.  
- **Tanstack Query:** Video kırpma işlemleri gibi asenkron işlemleri yönetmek için kullanılan güçlü bir kütüphane.  
- **FFmpeg Kit:** Video işleme ve kırpma işlemleri için kullanılan bir kütüphane.  
- **NativeWind (Tailwind CSS):** Responsive ve modern bir tasarım oluşturmak için kullanılan stil çözümü.  
- **Expo Video:** Videoları oynatmak için kullanılan bileşen.  

### **English:**
- **React Native (Expo):** The main framework for mobile app development.  
- **Expo Router:** Handles in-app navigation.  
- **SQLite (Expo SQLite):** Used to persist all details of cropped videos on the device.  
- **Zustand:** A lightweight library for global state management.  
- **Tanstack Query:** A powerful library for managing asynchronous tasks, such as video cropping.  
- **FFmpeg Kit:** A library used for video processing and cropping.  
- **NativeWind (Tailwind CSS):** A styling solution for creating responsive and modern designs.  
- **Expo Video:** A component for video playback.  

---

## 🗂️ **SQLite Veritabanı / SQLite Database**

### **Türkçe:**
Uygulamada, tüm video detayları **SQLite** veritabanında saklanır.  
**Tablo:** `videos`  
**Sütunlar:**
- `id`: Video kimliği (UUID).  
- `name`: Videonun ismi.  
- `description`: Videonun açıklaması.  
- `uri`: Kırpılan video dosyasının yolu.  
- `originalUri`: Orijinal video dosyasının yolu.  
- `duration`: Kırpılan videonun süresi (saniye).  
- `startTime`: Videonun kırpılmaya başlandığı zaman (saniye).  
- `endTime`: Videonun kırpılmanın bittiği zaman (saniye).  
- `createdAt`: Video kırpma işleminin gerçekleştiği tarih ve saat.  
- `thumbnailUri`: Videonun küçük resmi için dosya yolu.  

---

### **English:**
The application stores all video details in a **SQLite** database.  
**Table:** `videos`  
**Columns:**
- `id`: Video ID (UUID).  
- `name`: Name of the video.  
- `description`: Description of the video.  
- `uri`: Path of the cropped video file.  
- `originalUri`: Path of the original video file.  
- `duration`: Duration of the cropped video (in seconds).  
- `startTime`: The start time of the cropped segment (in seconds).  
- `endTime`: The end time of the cropped segment (in seconds).  
- `createdAt`: The date and time when the video was cropped.  
- `thumbnailUri`: File path for the thumbnail of the video.  

---


## Ekran Görüntüleri

![Uygulama Ekran Görüntüsü](https://blogger.googleusercontent.com/img/a/AVvXsEgU0Q5s6_HUJOVT2AWISa040YGeiuneZvgBbcEBrznhpWTDQsqRjOaKLxxgQBDoPbc1twcuVm9iptFvOeL3PcMvWWBT3noJFUpET0NUZNzNvvRC95DWAm79a6aHEjZNo1KKVuP_7S5fjHa__mlvCqUqVWipLhBbFKq_kO78dbjSUaTrVQZrldTavQsxD2Oi)
![Uygulama Ekran Görüntüsü](https://blogger.googleusercontent.com/img/a/AVvXsEg9xQvF7QKH6b9f_hjQC2ttl-SrAMUNe2sFr1ru04w7--WDidwObV9AG66pwKI0Yc3nWt3DHe3jTLXKvnMcaLYEqoQl-0fuVypojzbkU-frnYdRStiJ0AEadW13YJ9PK5uc3nkeVIH6fdcOEMUqmU2ddsGAJmyd_CcCj49sjRE0OGj-4q7pTVMa0ZqRIv4D)

  