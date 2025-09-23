import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ExportService } from '../services/exportService';
import { ProspectDatabase } from '../services/prospectDatabase';
import LoginScreen from './LoginScreen';
import ProspectDetailScreen from './ProspectDetailScreen';
import ProspectsListScreen from './ProspectsListScreen';
import QRScannerScreen from './QRScannerScreen';
import RegisterScreen from './RegisterScreen';

type Screen = 'login' | 'register' | 'qrscanner' | 'prospects' | 'detail';

export default function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);

  const navigateToLogin = () => setCurrentScreen('login');
  const navigateToRegister = () => setCurrentScreen('register');
  const navigateToQRScanner = () => setCurrentScreen('qrscanner');
  const navigateToProspects = () => setCurrentScreen('prospects');
  const navigateToDetail = (prospectId: string) => {
    setSelectedProspectId(prospectId);
    setCurrentScreen('detail');
  };

  const handleLogin = () => {
    setCurrentScreen('prospects');
  };

  const handleRegister = () => {
    setCurrentScreen('qrscanner');
  };

  const handleQRScanned = (data: string) => {
    console.log('QR Scanned:', data);
  };

  const handleProspectSaved = (prospectId: string) => {
    navigateToDetail(prospectId);
  };

  const handleProspectSelect = (prospectId: string) => {
    navigateToDetail(prospectId);
  };

  const handleExportAll = async () => {
    try {
      const prospects = await ProspectDatabase.getAllProspects();
      
      if (prospects.length === 0) {
        Alert.alert('No Data', 'No hay prospectos para exportar');
        return;
      }

      Alert.alert(
        'Exportar Prospectos',
        '¿En qué formato deseas exportar los datos?',
        [
          {
            text: 'CSV',
            onPress: () => ExportService.exportProspects({
              format: 'CSV',
              includeNotes: true,
              prospects
            })
          },
          {
            text: 'JSON',
            onPress: () => ExportService.exportProspects({
              format: 'JSON',
              includeNotes: true,
              prospects
            })
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los prospectos');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onNavigateToRegister={navigateToRegister}
          />
        );
      
      case 'register':
        return (
          <RegisterScreen
            onRegister={handleRegister}
            onNavigateToLogin={navigateToLogin}
          />
        );
      
      case 'qrscanner':
        return (
          <QRScannerScreen
            onQRScanned={handleQRScanned}
            onManualEntry={navigateToProspects}
            onBack={navigateToProspects}
            onProspectSaved={handleProspectSaved}
            exhibitorName="QRScan LDA"
          />
        );
      
      case 'prospects':
        return (
          <ProspectsListScreen
            onProspectSelect={handleProspectSelect}
            onAddProspect={navigateToQRScanner}
            onScanQR={navigateToQRScanner}
            onExportAll={handleExportAll}
          />
        );
      
      case 'detail':
        if (!selectedProspectId) {
          setCurrentScreen('prospects');
          return null;
        }
        return (
          <ProspectDetailScreen
            prospectId={selectedProspectId}
            onBack={navigateToProspects}
            onShare={() => {
              // Handle sharing
              console.log('Share prospect');
            }}
            onEdit={() => {
              // Handle editing
              console.log('Edit prospect');
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="auto" />
    </>
  );
}