// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-localstorage-backend'; // Để tải tài nguyên từ local storage
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'; // Để phát hiện ngôn ngữ của người dùng
import vi from './locales/vi/translation.json'
const resources = {
  vi: {
    translation: vi
  }
}
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Ngôn ngữ dự phòng nếu ngôn ngữ người dùng không có
    debug: true, // Bật chế độ debug để xem thông tin chi tiết (có thể tắt khi sản xuất)
    interpolation: {
      escapeValue: false, // React đã xử lý việc escape các giá trị
    },
    backend: {
      // Đường dẫn để tải tài nguyên ngôn ngữ từ local storage
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });
export default i18n;
