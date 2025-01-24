import { FFmpegKit } from 'ffmpeg-kit-react-native';

/**
 * FFMPEG kullanarak video kırpma işlemini gerçekleştirir.
 * @param {string} inputUri - Giriş video dosyasının URI'si.
 * @param {string} outputUri - Kırpılmış video için çıkış URI'si.
 * @param {number} start - Başlangıç zamanı (saniye cinsinden).
 * @param {number} duration - Kırpılacak video süresi (saniye cinsinden).
 * @returns {Promise<void>}
 */
export const cropVideo = async (inputUri, outputUri, start, duration) => {
  const command = `-i ${inputUri} -ss ${start} -t ${duration} -c copy ${outputUri}`;
  console.log("Running FFMPEG Command:", command);

  try {
    await FFmpegKit.execute(command);
    console.log("Video cropping completed:", outputUri);
  } catch (error) {
    console.error("FFMPEG Error:", error);
    throw new Error("Video cropping failed. Please try again.");
  }
};
