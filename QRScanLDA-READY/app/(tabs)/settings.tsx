import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useI18n } from '@/hooks/useI18n';
import { useConnectivity } from '@/hooks/useConnectivity';

export default function SettingsTab() {
  const router = useRouter();
  const { t, changeLanguage, getCurrentLanguage } = useI18n();
  const { isOnline, connectionType, forcSync, getOfflineStats } = useConnectivity();
  const [autoSync, setAutoSync] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const currentLanguage = getCurrentLanguage();
  const offlineStats = getOfflineStats();

  const handleLanguageChange = () => {
    const newLanguage = currentLanguage === 'es' ? 'en' : 'es';
    changeLanguage(newLanguage);
    Alert.alert(t('common.language'), `${t('common.changedTo')} ${newLanguage === 'es' ? 'Español' : 'English'}`);
  };

  const handleSyncNow = async () => {
    const success = await forcSync();
    if (success) {
      Alert.alert('Éxito', 'Sincronización completada');
    }
  };

  return (
    <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings.title')}</Text>
            <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="language" size={20} color="#007AFF" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{t('settings.language')}</Text>
                    <Text style={styles.settingSubtitle}>
                      {currentLanguage === 'es' ? 'Español' : 'English'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="moon" size={20} color="#007AFF" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{t('settings.darkMode')}</Text>
                    <Text style={styles.settingSubtitle}>{t('settings.darkTheme')}</Text>
                  </View>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="sync" size={20} color="#007AFF" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{t('settings.sync')}</Text>
                    <Text style={styles.settingSubtitle}>{t('settings.autoSync')}</Text>
                  </View>
                </View>
                <Switch
                  value={autoSync}
                  onValueChange={setAutoSync}
                  trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <TouchableOpacity 
                style={styles.settingItem} 
                onPress={() => router.push('/admin' as any)}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="server" size={20} color="#007AFF" />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{t('settings.adminPanel')}</Text>
                    <Text style={styles.settingSubtitle}>{t('settings.adminDescription')}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Connection Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ESTADO DE CONEXIÓN</Text>
            <View style={styles.sectionContent}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: isOnline ? '#E8F5E8' : '#FFE8E8' }]}>
                    <Ionicons 
                      name={isOnline ? "wifi" : "wifi-outline"} 
                      size={20} 
                      color={isOnline ? "#34C759" : "#FF3B30"} 
                    />
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Estado</Text>
                    <Text style={[styles.settingSubtitle, { color: isOnline ? '#34C759' : '#FF3B30' }]}>
                      {isOnline ? 'En línea' : 'Sin conexión'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.connectionType}>{connectionType}</Text>
              </View>

              {offlineStats.totalPending > 0 && (
                <View style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons name="cloud-upload" size={20} color="#FF9500" />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>Pendientes</Text>
                      <Text style={styles.settingSubtitle}>
                        {offlineStats.totalPending} acciones pendientes
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.syncButton} onPress={handleSyncNow}>
                    <Ionicons name="sync" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>QRScanLDA v1.0.0</Text>
            <Text style={styles.footerSubtext}>© 2025</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
  header: { padding: 24, paddingBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1d1d1f', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#86868b' },
  section: { marginBottom: 24, marginHorizontal: 16 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#86868b', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 8, 
    marginLeft: 4 
  },
  sectionContent: { backgroundColor: '#ffffff', borderRadius: 12, elevation: 2 },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#E5E5EA' 
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { 
    width: 32, 
    height: 32, 
    borderRadius: 8, 
    backgroundColor: '#F2F2F7', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '500', color: '#1d1d1f', marginBottom: 2 },
  settingSubtitle: { fontSize: 14, color: '#86868b' },
  connectionType: { fontSize: 12, color: '#86868b', textTransform: 'uppercase' },
  syncButton: { 
    backgroundColor: '#007AFF', 
    borderRadius: 16, 
    width: 32, 
    height: 32, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  footer: { padding: 24, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#86868b', textAlign: 'center' },
  footerSubtext: { fontSize: 12, color: '#C7C7CC', textAlign: 'center', marginTop: 4 }
});
