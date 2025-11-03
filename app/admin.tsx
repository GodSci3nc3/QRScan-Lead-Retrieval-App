import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface DashboardStats {
  totalProspects: number;
  todayScans: number;
  totalExhibitors: number;
  conversionRate: number;
}

interface ProspectData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }>;
}

export default function AdminScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProspects: 0,
    todayScans: 0,
    totalExhibitors: 0,
    conversionRate: 0
  });
  
  const [chartData, setChartData] = useState<ProspectData>({
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      data: [0, 0, 0, 0, 0, 0, 0],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
      strokeWidth: 2
    }]
  });

  const [pieData, setPieData] = useState([
    { name: 'Hot Leads', population: 0, color: '#FF6B6B', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Warm Leads', population: 0, color: '#4ECDC4', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Cold Leads', population: 0, color: '#45B7D1', legendFontColor: '#7F7F7F', legendFontSize: 12 }
  ]);

  const [newExhibitor, setNewExhibitor] = useState({
    name: '',
    company: '',
    booth: '',
    email: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulamos datos del dashboard (en una implementación real, esto vendría de Supabase)
      const mockStats: DashboardStats = {
        totalProspects: 1247,
        todayScans: 89,
        totalExhibitors: 45,
        conversionRate: 23.5
      };

      const mockWeeklyData = {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          data: [12, 19, 23, 15, 28, 22, 17],
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
          strokeWidth: 2
        }]
      };

      const mockPieData = [
        { name: 'Hot Leads', population: 35, color: '#FF6B6B', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: 'Warm Leads', population: 45, color: '#4ECDC4', legendFontColor: '#7F7F7F', legendFontSize: 12 },
        { name: 'Cold Leads', population: 20, color: '#45B7D1', legendFontColor: '#7F7F7F', legendFontSize: 12 }
      ];

      setStats(mockStats);
      setChartData(mockWeeklyData);
      setPieData(mockPieData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleAddExhibitor = () => {
    if (!newExhibitor.name || !newExhibitor.company) {
      Alert.alert('Error', 'Nombre y empresa son requeridos');
      return;
    }

    // Aquí conectaríamos con Supabase para agregar el expositor
    Alert.alert('Éxito', 'Expositor agregado correctamente');
    setNewExhibitor({ name: '', company: '', booth: '', email: '' });
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#8641f4'
    }
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Panel de Administración</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#667eea" />
              <Text style={styles.statNumber}>{stats.totalProspects}</Text>
              <Text style={styles.statLabel}>Total Prospectos</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="qr-code" size={24} color="#4ECDC4" />
              <Text style={styles.statNumber}>{stats.todayScans}</Text>
              <Text style={styles.statLabel}>Escaneos Hoy</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="business" size={24} color="#FF6B6B" />
              <Text style={styles.statNumber}>{stats.totalExhibitors}</Text>
              <Text style={styles.statLabel}>Expositores</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color="#45B7D1" />
              <Text style={styles.statNumber}>{stats.conversionRate}%</Text>
              <Text style={styles.statLabel}>Conversión</Text>
            </View>
          </View>

          {/* Weekly Activity Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Actividad Semanal</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>

          {/* Lead Distribution */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Distribución de Leads</Text>
            <PieChart
              data={pieData}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>

          {/* Add Exhibitor Section */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Agregar Expositor</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del expositor"
              placeholderTextColor="#999"
              value={newExhibitor.name}
              onChangeText={(text) => setNewExhibitor({...newExhibitor, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Empresa"
              placeholderTextColor="#999"
              value={newExhibitor.company}
              onChangeText={(text) => setNewExhibitor({...newExhibitor, company: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Stand/Booth"
              placeholderTextColor="#999"
              value={newExhibitor.booth}
              onChangeText={(text) => setNewExhibitor({...newExhibitor, booth: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={newExhibitor.email}
              onChangeText={(text) => setNewExhibitor({...newExhibitor, email: text})}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddExhibitor}>
              <Ionicons name="add-circle" size={20} color="#ffffff" />
              <Text style={styles.addButtonText}>Agregar Expositor</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.actionsTitle}>Acciones Rápidas</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download" size={24} color="#667eea" />
                <Text style={styles.actionText}>Exportar Datos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="settings" size={24} color="#667eea" />
                <Text style={styles.actionText}>Configuración</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="analytics" size={24} color="#667eea" />
                <Text style={styles.actionText}>Reportes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="sync" size={24} color="#667eea" />
                <Text style={styles.actionText}>Sincronizar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#86868b',
    textAlign: 'center',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
  },
  addButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#1d1d1f',
    textAlign: 'center',
    marginTop: 8,
  },
});