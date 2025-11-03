import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, SafeAreaView, StyleSheet } from 'react-native';
import { ExportService } from '../../services/exportService';
import { ProspectDatabase } from '../../services/prospectDatabase';
import ProspectsListScreen from '../ProspectsListScreen';

export default function ProspectsTab() {
  const router = useRouter();

  // Limpiar base de datos una sola vez al iniciar
  useEffect(() => {
    const cleanDatabase = async () => {
      try {
        const prospects = await ProspectDatabase.getAllProspects();
        console.log(`🔍 Prospectos encontrados: ${prospects.length}`);
        
        // Verificar si hay prospectos inválidos
        const invalidProspects = prospects.filter(p => 
          (!p.fullName || p.fullName.trim() === '') && 
          (!p.email || !p.email.includes('@'))
        );
        
        if (invalidProspects.length > 0) {
          console.log(`🗑️ Limpiando ${invalidProspects.length} prospectos inválidos...`);
          await ProspectDatabase.clearAllProspects();
          console.log('✅ Base de datos limpiada correctamente');
        } else {
          console.log('✅ No hay prospectos inválidos para limpiar');
        }
      } catch (error) {
        console.error('❌ Error al limpiar BD:', error);
      }
    };
    
    cleanDatabase();
  }, []);

  const handleProspectSelect = (prospectId: string) => {
    // Navegar a la pantalla de detalles del prospecto
    router.push({
      pathname: '/prospect-detail',
      params: { prospectId }
    });
  };

  const handleAddProspect = () => {
    // Navegar al formulario de registro manual
    router.push('/RegisterScreen');
  };

  const handleScanQR = () => {
    // Cambiar a la tab del scanner
    router.push('/(tabs)/qrscanner');
  };

  const handleExportAll = async () => {
    try {
      const prospects = await ProspectDatabase.getAllProspects();
      
      if (prospects.length === 0) {
        Alert.alert('Sin Datos', 'No hay prospectos para exportar');
        return;
      }

      Alert.alert(
        'Exportar Prospectos',
        `Tienes ${prospects.length} prospectos. ¿En qué formato quieres exportarlos?`,
        [
          { 
            text: 'CSV', 
            onPress: async () => {
              await ExportService.exportProspects({
                format: 'CSV',
                includeNotes: true,
                prospects: prospects
              });
            }
          },
          { 
            text: 'Excel', 
            onPress: async () => {
              await ExportService.exportProspects({
                format: 'EXCEL',
                includeNotes: true,
                prospects: prospects
              });
            }
          },
          { 
            text: 'JSON', 
            onPress: async () => {
              await ExportService.exportProspects({
                format: 'JSON',
                includeNotes: true,
                prospects: prospects
              });
            }
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error al obtener prospectos:', error);
      Alert.alert('Error', 'No se pudieron cargar los prospectos para exportar');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProspectsListScreen
        onProspectSelect={handleProspectSelect}
        onAddProspect={handleAddProspect}
        onScanQR={handleScanQR}
        onExportAll={handleExportAll}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});