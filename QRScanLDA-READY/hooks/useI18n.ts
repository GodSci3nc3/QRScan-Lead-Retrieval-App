// =================================================================
// Hook personalizado para internacionalización - QRScanLDA
// =================================================================

import { useTranslation } from 'react-i18next';
import i18n from '../services/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useI18n = () => {
  const { t, i18n: i18nInstance } = useTranslation();

  const changeLanguage = async (language: 'es' | 'en') => {
    try {
      await i18nInstance.changeLanguage(language);
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getCurrentLanguage = (): 'es' | 'en' => {
    return (i18nInstance.language as 'es' | 'en') || 'es';
  };

  const getAvailableLanguages = () => [
    { code: 'es', name: t('common.spanish'), nativeName: 'Español' },
    { code: 'en', name: t('common.english'), nativeName: 'English' }
  ];

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    isReady: i18nInstance.isInitialized
  };
};

// Hook para usar traducciones específicas por sección
export const useI18nSection = (section: string) => {
  const { t } = useI18n();
  
  return (key: string, options?: any) => t(`${section}.${key}`, options);
};

// Hooks especializados para cada sección
export const useAuthTranslations = () => useI18nSection('auth');
export const useProspectsTranslations = () => useI18nSection('prospects');
export const useQRScannerTranslations = () => useI18nSection('qr_scanner');
export const useRegisterTranslations = () => useI18nSection('register');
export const useSettingsTranslations = () => useI18nSection('settings');
export const useAdminTranslations = () => useI18nSection('admin');
export const useCommonTranslations = () => useI18nSection('common');
export const useErrorTranslations = () => useI18nSection('errors');
export const useSuccessTranslations = () => useI18nSection('success');

export default useI18n;