import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, View } from 'react-native';
import { ProspectDatabase } from '../../services/prospectDatabase';
import { parseQRData } from '../../types/prospect';
import SimpleQRScanner from '../SimpleQRScanner';

export default function QRScannerTab() {
  const router = useRouter();

  const handleQRScanned = async (data: string) => {
    try {
      console.log('QR Data:', data);
      
      // Intentar parsear los datos del QR
      const prospectData = parseQRData(data);
      console.log('Parsed Prospect Data:', prospectData);
      
      // VALIDACIÓN ROBUSTA: Solo guardar si tenemos información mínima válida
      const hasValidName = (prospectData.name || prospectData.fullName) && 
                         ((prospectData.name?.trim().length || 0) > 0 || (prospectData.fullName?.trim().length || 0) > 0);
      const hasValidEmail = prospectData.email && prospectData.email.includes('@');
      
      console.log('Validation:', { hasValidName, hasValidEmail, name: prospectData.name, email: prospectData.email });
      
      // Requiere al menos nombre O email válido para guardar
      if (!hasValidName && !hasValidEmail) {
        Alert.alert(
          'QR Insuficiente',
          'El código QR no contiene información suficiente (nombre o email). Intenta con un QR que contenga datos de contacto.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Verificar si el prospecto ya existe (solo si tenemos email o teléfono)
      if (prospectData.email || prospectData.phone) {
        const existingProspects = await ProspectDatabase.getAllProspects();
        const exists = existingProspects.find(p => 
          (prospectData.email && p.email === prospectData.email) || 
          (prospectData.phone && p.phone === prospectData.phone && prospectData.phone)
        );

        if (exists) {
          const existingName = exists.name || exists.fullName || exists.email;
          Alert.alert(
            'Prospecto Existente',
            `Este prospecto ya está registrado: ${existingName}`,
            [
              { text: 'Ver Detalles', onPress: () => {
                router.push({
                  pathname: '/prospect-detail',
                  params: { prospectId: exists.id }
                });
              }},
              { text: 'Cancelar', style: 'cancel' }
            ]
          );
          return;
        }
      }

      // Guardar nuevo prospecto con datos mínimos del QR
      const prospectToSave = {
        name: prospectData.name || prospectData.fullName || '',
        company: prospectData.company || '',
        position: prospectData.position || prospectData.jobTitle || '',
        email: prospectData.email || '',
        phone: prospectData.phone || '',
        industry: prospectData.industry || '',
        website: prospectData.website || '',
        address: prospectData.address || '',
        priority: prospectData.priority || 'Media' as const,
        leadSource: prospectData.leadSource || 'QR Scanner',
        notes: prospectData.notes || '',
        qrData: data,
        isStarred: false,
        tags: [],
        createdAt: new Date().toISOString()
      };
      
      const savedProspect = await ProspectDatabase.saveProspect(prospectToSave);
      
      // Ir directamente a los detalles para que el expositor complete la información
      router.push({
        pathname: '/prospect-detail',
        params: { prospectId: savedProspect.id }
      });

    } catch (error) {
      console.error('Error processing QR:', error);
      Alert.alert(
        'Error',
        'No se pudo procesar el código QR. Intenta de nuevo.'
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SimpleQRScanner
        onQRScanned={handleQRScanned}
        onBack={() => {}}
      />
    </View>
  );
}