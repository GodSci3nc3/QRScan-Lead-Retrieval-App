// Script temporal para limpiar la base de datos
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROSPECTS_KEY = 'qr_prospects';

export const clearDatabase = async () => {
  try {
    console.log('🗑️ Limpiando base de datos...');
    
    // Mostrar datos actuales antes de limpiar
    const currentData = await AsyncStorage.getItem(PROSPECTS_KEY);
    const prospects = currentData ? JSON.parse(currentData) : [];
    console.log(`📊 Prospectos actuales: ${prospects.length}`);
    
    // Limpiar la base de datos
    await AsyncStorage.removeItem(PROSPECTS_KEY);
    
    // Verificar que se limpió
    const afterClear = await AsyncStorage.getItem(PROSPECTS_KEY);
    console.log('✅ Base de datos limpiada correctamente');
    console.log(`📊 Prospectos después: ${afterClear ? JSON.parse(afterClear).length : 0}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error limpiando base de datos:', error);
    return false;
  }
};

// Ejecutar automáticamente si se importa
// clearDatabase();