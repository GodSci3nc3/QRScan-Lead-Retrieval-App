import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ProspectDatabase } from '../services/prospectDatabase';
import { Prospect, ProspectFilter, RegistrationType } from '../types/prospect';

interface ProspectsListScreenProps {
  onProspectSelect?: (prospectId: string) => void;
  onAddProspect?: () => void;
  onScanQR?: () => void;
  onExportAll?: () => void;
}

const ProspectsListScreen: React.FC<ProspectsListScreenProps> = ({
  onProspectSelect,
  onAddProspect,
  onScanQR,
  onExportAll
}) => {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<RegistrationType | 'All'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ total: 0, recentCount: 0 });

  const registrationTypes: (RegistrationType | 'All')[] = [
    'All', 'VIP', 'General', 'Speaker', 'Press', 'Staff', 'Sponsor', 'Other'
  ];

  const loadProspects = useCallback(async () => {
    try {
      const filter: ProspectFilter = {
        searchTerm: searchTerm || undefined,
        registrationType: selectedType === 'All' ? undefined : [selectedType]
      };
      
      const [loadedProspects, statsData] = await Promise.all([
        ProspectDatabase.searchProspects(filter),
        ProspectDatabase.getProspectsStats()
      ]);
      
      setProspects(loadedProspects);
      setStats({ total: statsData.total, recentCount: statsData.recentCount });
    } catch (error) {
      console.error('Error loading prospects:', error);
      Alert.alert('Error', 'No se pudieron cargar los prospectos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm, selectedType]);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProspects();
  }, [loadProspects]);

  const handleDeleteProspect = (prospect: Prospect) => {
    const prospectName = prospect.name || prospect.fullName || 'este prospecto';
    Alert.alert(
      'Eliminar Prospecto',
      `¿Estás seguro de que quieres eliminar a ${prospectName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ProspectDatabase.deleteProspect(prospect.id);
              loadProspects();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el prospecto');
            }
          }
        }
      ]
    );
  };

  const toggleStar = async (prospect: Prospect) => {
    try {
      await ProspectDatabase.updateProspect(prospect.id, {
        isStarred: !prospect.isStarred
      });
      loadProspects();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el prospecto');
    }
  };

  const getTypeColor = (type: RegistrationType) => {
    const colors = {
      VIP: '#f59e0b',
      General: '#6b7280',
      Speaker: '#7c3aed',
      Press: '#06b6d4',
      Staff: '#10b981',
      Sponsor: '#ef4444',
      Other: '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderProspectCard = ({ item }: { item: Prospect }) => (
    <TouchableOpacity
      style={styles.prospectCard}
      onPress={() => onProspectSelect?.(item.id)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#1e2139', '#252a47']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.prospectName}>{item.name || item.fullName || 'Sin nombre'}</Text>
            <Text style={styles.prospectCompany}>{item.company}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <TouchableOpacity
              onPress={() => toggleStar(item)}
              style={styles.starButton}
            >
              <Ionicons
                name={item.isStarred ? "star" : "star-outline"}
                size={20}
                color={item.isStarred ? "#f59e0b" : "#6b7280"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeleteProspect(item)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.prospectTitle}>{item.jobTitle}</Text>
          <Text style={styles.prospectEmail}>{item.email}</Text>
          {item.phone && (
            <Text style={styles.prospectPhone}>{item.phone}</Text>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.cardFooterLeft}>
            <View style={[styles.typeTag, { backgroundColor: getTypeColor(item.registrationType || 'General') }]}>
              <Text style={styles.typeTagText}>{item.registrationType || 'General'}</Text>
            </View>
            <Text style={styles.scannedDate}>
              {formatDate(item.scannedAt || item.createdAt || new Date().toISOString())}
            </Text>
          </View>
          
          {item.notes && item.notes.length > 0 && (
            <View style={styles.notesIndicator}>
              <Ionicons name="document-text-outline" size={16} color="#7c3aed" />
              <Text style={styles.notesCount}>{item.notes.length}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="scan-outline" size={64} color="#6b7280" />
      <Text style={styles.emptyStateTitle}>No hay prospectos</Text>
      <Text style={styles.emptyStateSubtitle}>
        Comienza escaneando códigos QR para agregar prospectos
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={onScanQR}
      >
        <LinearGradient
          colors={['#7c3aed', '#a855f7']}
          style={styles.scanButtonGradient}
        >
          <Ionicons name="qr-code-outline" size={24} color="white" />
          <Text style={styles.scanButtonText}>Escanear QR</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Cargando prospectos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Prospectos</Text>
          <TouchableOpacity onPress={onExportAll} style={styles.exportButton}>
            <Ionicons name="download-outline" size={24} color="#7c3aed" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            Total: {stats.total} • Recientes: {stats.recentCount}
          </Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, empresa o email..."
            placeholderTextColor="#6b7280"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={showFilters ? "#7c3aed" : "#6b7280"}
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={registrationTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedType === item && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedType(item)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedType === item && styles.filterChipTextActive
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Prospects List */}
      {prospects.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={prospects}
          keyExtractor={(item) => item.id}
          renderItem={renderProspectCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fabSecondary}
          onPress={onAddProspect}
        >
          <Ionicons name="person-add-outline" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.fabPrimary}
          onPress={onScanQR}
        >
          <LinearGradient
            colors={['#7c3aed', '#a855f7']}
            style={styles.fabGradient}
          >
            <Ionicons name="qr-code-outline" size={28} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  loadingText: {
    color: '#8b9dc3',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    marginTop: 8,
  },
  statsText: {
    color: '#8b9dc3',
    fontSize: 14,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2139',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
    padding: 4,
  },
  filtersContainer: {
    marginTop: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1e2139',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2d3561',
  },
  filterChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  filterChipText: {
    color: '#8b9dc3',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  prospectCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prospectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  prospectCompany: {
    fontSize: 16,
    color: '#8b9dc3',
    fontWeight: '500',
  },
  starButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  prospectTitle: {
    fontSize: 14,
    color: '#8b9dc3',
    marginBottom: 4,
  },
  prospectEmail: {
    fontSize: 14,
    color: '#a855f7',
    marginBottom: 2,
  },
  prospectPhone: {
    fontSize: 14,
    color: '#8b9dc3',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  typeTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  scannedDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  notesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesCount: {
    color: '#7c3aed',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#8b9dc3',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  scanButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    alignItems: 'center',
  },
  fabSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPrimary: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProspectsListScreen;