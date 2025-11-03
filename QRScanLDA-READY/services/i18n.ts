// =================================================================
// Configuración de Internacionalización (i18n) - QRScanLDA
// =================================================================

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';

// Importar traducciones
import es from '../locales/es.json';
import en from '../locales/en.json';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      // 1. Intentar obtener el idioma guardado en AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }

      // 2. Usar el idioma del sistema
      const systemLanguage = getLocales()[0]?.languageCode || 'es';
      const supportedLanguage = ['es', 'en'].includes(systemLanguage) ? systemLanguage : 'es';
      callback(supportedLanguage);
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('es'); // Fallback a español
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }
};

// Configuración de i18next
i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      es: es,
      en: en
    },
    fallbackLng: 'es',
    debug: __DEV__, // Solo debug en desarrollo
    interpolation: {
      escapeValue: false // React ya escapa por defecto
    },
    react: {
      useSuspense: false // Evitar problemas con Suspense en React Native
    }
  });

export default i18n;