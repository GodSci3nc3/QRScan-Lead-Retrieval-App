import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { ProspectDatabase } from '../services/prospectDatabase';
import { Prospect } from '../types/prospect';

interface ProspectDetailScreenProps {
  prospectId: string;
  onBack?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
}

type InterestLevel = 'Cold' | 'Warm' | 'Hot';

const ProspectDetailScreen: React.FC<ProspectDetailScreenProps> = ({
  prospectId,
  onBack,
  onShare,
  onEdit
}) => {
  const router = useRouter();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingNotes, setEditingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [interestLevel, setInterestLevel] = useState<InterestLevel>('Warm');
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const loadProspect = useCallback(async () => {
    try {
      const loadedProspect = await ProspectDatabase.getProspectById(prospectId);
      if (loadedProspect) {
        setProspect(loadedProspect);
        // Set interest level based on tags or default
        if (loadedProspect.tags?.includes('Hot')) setInterestLevel('Hot');
        else if (loadedProspect.tags?.includes('Cold')) setInterestLevel('Cold');
        else setInterestLevel('Warm');
      }
    } catch (error) {
      console.error('Error loading prospect:', error);
      Alert.alert('Error', 'No se pudo cargar el prospecto');
    } finally {
      setLoading(false);
    }
  }, [prospectId]);

  useEffect(() => {
    loadProspect();
  }, [loadProspect]);

    const handleAddNote = async () => {
    if (!prospect || !newNote.trim()) return;

    try {
      const existingNotes = prospect.notes || '';
      const timestamp = new Date().toLocaleDateString('es-ES');
      const noteText = `[${timestamp}] ${newNote.trim()}`;
      const updatedNotes = existingNotes ? `${existingNotes}\n\n${noteText}` : noteText;
      
      await ProspectDatabase.updateProspect(prospect.id, { notes: updatedNotes });
      
      setProspect({ ...prospect, notes: updatedNotes });
      setNewNote('');
      setEditingNotes(false);
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'No se pudo agregar la nota');
    }
  };

    const handleDeleteNote = async (noteId: string) => {
    if (!prospect) return;

    try {
      // For simplified notes (string), we'll just clear all notes
      // In a real app, you might want to parse and remove specific notes
      Alert.alert(
        'Eliminar Notas',
        '¿Quieres eliminar todas las notas?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: async () => {
              await ProspectDatabase.updateProspect(prospect.id, { notes: '' });
              setProspect({ ...prospect, notes: '' });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'No se pudo eliminar la nota');
    }
  };

  const addTag = async () => {
    if (!newTag.trim() || !prospect) return;

    try {
      const currentTags = prospect.tags || [];
      if (currentTags.includes(newTag.trim())) {
        Alert.alert('Error', 'Este tag ya existe');
        return;
      }

      const updatedTags = [...currentTags, newTag.trim()];
      await ProspectDatabase.updateProspect(prospect.id, { tags: updatedTags });
      
      setProspect({ ...prospect, tags: updatedTags });
      setNewTag('');
      setShowTagInput(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el tag');
    }
  };

  const removeTag = async (tagToRemove: string) => {
    if (!prospect) return;

    try {
      const updatedTags = prospect.tags?.filter(tag => tag !== tagToRemove) || [];
      await ProspectDatabase.updateProspect(prospect.id, { tags: updatedTags });
      setProspect({ ...prospect, tags: updatedTags });
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el tag');
    }
  };

  const updateInterestLevel = async (level: InterestLevel) => {
    if (!prospect) return;

    try {
      setInterestLevel(level);
      
      // Update tags to reflect interest level
      let updatedTags = prospect.tags?.filter(tag => !['Cold', 'Warm', 'Hot'].includes(tag)) || [];
      updatedTags.push(level);
      
      await ProspectDatabase.updateProspect(prospect.id, { tags: updatedTags });
      setProspect({ ...prospect, tags: updatedTags });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el nivel de interés');
    }
  };

  const toggleStar = async () => {
    if (!prospect) return;

    try {
      const updatedProspect = { ...prospect, isStarred: !prospect.isStarred };
      await ProspectDatabase.updateProspect(prospect.id, { isStarred: !prospect.isStarred });
      setProspect(updatedProspect);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el prospecto');
    }
  };

  const getInterestLevelColor = (level: InterestLevel) => {
    switch (level) {
      case 'Cold': return '#6b7280';
      case 'Warm': return '#7c3aed';
      case 'Hot': return '#ef4444';
      default: return '#7c3aed';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') return '??';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to render notes properly (handles both string and array formats)
  const renderNotes = (notes: any) => {
    if (!notes) return null;
    
    // If it's a string, render directly
    if (typeof notes === 'string') {
      return notes.length > 0 ? (
        <View style={styles.noteItem}>
          <Text style={styles.noteContent}>{notes}</Text>
          <View style={styles.noteFooter}>
            <Text style={styles.noteDate}>Notas</Text>
            <TouchableOpacity
              onPress={() => handleDeleteNote('all')}
              style={styles.deleteNoteButton}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      ) : null;
    }
    
    // If it's an array (legacy format), convert to string
    if (Array.isArray(notes) && notes.length > 0) {
      const notesText = notes.map(note => 
        typeof note === 'object' ? note.content : note
      ).join('\n\n');
      
      return (
        <View style={styles.noteItem}>
          <Text style={styles.noteContent}>{notesText}</Text>
          <View style={styles.noteFooter}>
            <Text style={styles.noteDate}>Notas (convertidas)</Text>
            <TouchableOpacity
              onPress={() => handleDeleteNote('all')}
              style={styles.deleteNoteButton}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Cargando prospecto...</Text>
      </View>
    );
  }

  if (!prospect) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Prospecto no encontrado</Text>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onBack ? onBack() : router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Lead Profile</Text>
          <Text style={styles.headerSubtitle}>11/Media LLC Exhibitor</Text>
        </View>
        
        <TouchableOpacity onPress={onShare} style={styles.headerButton}>
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#1e2139', '#252a47']}
              style={styles.profileGradient}
            >
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={['#7c3aed', '#a855f7']}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {getInitials(prospect.name || prospect.fullName)}
                    </Text>
                  </LinearGradient>
                </View>
                
                <TouchableOpacity onPress={toggleStar} style={styles.starButton}>
                  <Ionicons
                    name={prospect.isStarred ? "star" : "star-outline"}
                    size={24}
                    color={prospect.isStarred ? "#f59e0b" : "#6b7280"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{prospect.name || prospect.fullName || 'Sin nombre'}</Text>
                <Text style={styles.profileTitle}>{prospect.position || prospect.jobTitle || ''}</Text>
                <Text style={styles.profileCompany}>{prospect.company}</Text>
              </View>

              {/* Contact Info */}
              <View style={styles.contactSection}>
                <TouchableOpacity style={styles.contactItem}>
                  <Ionicons name="mail-outline" size={20} color="#8b9dc3" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>{prospect.email}</Text>
                  </View>
                </TouchableOpacity>

                {prospect.phone && (
                  <TouchableOpacity style={styles.contactItem}>
                    <Ionicons name="call-outline" size={20} color="#8b9dc3" />
                    <View style={styles.contactTextContainer}>
                      <Text style={styles.contactLabel}>Phone</Text>
                      <Text style={styles.contactValue}>{prospect.phone}</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View style={styles.contactItem}>
                  <Ionicons name="ribbon-outline" size={20} color="#8b9dc3" />
                  <View style={styles.contactTextContainer}>
                    <Text style={styles.contactLabel}>Reg. Type</Text>
                    <Text style={styles.contactValue}>{prospect.registrationType}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Notes Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <TouchableOpacity
                onPress={() => setEditingNotes(true)}
                style={styles.addButton}
              >
                <Ionicons name="add" size={20} color="#7c3aed" />
              </TouchableOpacity>
            </View>

            {editingNotes ? (
              <View style={styles.noteInput}>
                <TextInput
                  style={styles.noteTextInput}
                  placeholder="Add a note..."
                  placeholderTextColor="#6b7280"
                  value={newNote}
                  onChangeText={setNewNote}
                  multiline
                  autoFocus
                />
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingNotes(false);
                      setNewNote('');
                    }}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleAddNote} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.notesContainer}>
                {renderNotes(prospect.notes) || (
                  <Text style={styles.emptyNotesText}>
                    No hay notas agregadas aún.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Tags Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <TouchableOpacity
                onPress={() => setShowTagInput(true)}
                style={styles.addButton}
              >
                <Ionicons name="add" size={20} color="#7c3aed" />
              </TouchableOpacity>
            </View>

            <View style={styles.tagsContainer}>
              {prospect.tags && prospect.tags.length > 0 ? (
                prospect.tags
                  .filter(tag => !['Cold', 'Warm', 'Hot'].includes(tag))
                  .map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={styles.tag}
                      onLongPress={() => removeTag(tag)}
                    >
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity
                        onPress={() => removeTag(tag)}
                        style={styles.removeTagButton}
                      >
                        <Ionicons name="close" size={16} color="white" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))
              ) : null}

              {/* Default tags */}
              <View style={styles.tag}>
                <Text style={styles.tagText}>Decision Maker</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Enterprise</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Follow-up</Text>
              </View>

              {showTagInput ? (
                <View style={styles.tagInputContainer}>
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Add tag"
                    placeholderTextColor="#6b7280"
                    value={newTag}
                    onChangeText={setNewTag}
                    onSubmitEditing={addTag}
                    autoFocus
                  />
                  <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
                    <Ionicons name="checkmark" size={16} color="#7c3aed" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowTagInput(true)}
                  style={styles.addTagPlaceholder}
                >
                  <Ionicons name="add" size={16} color="#6b7280" />
                  <Text style={styles.addTagText}>Add tag</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Interest Level Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Interest Level</Text>
            
            <View style={styles.interestLevels}>
              {(['Cold', 'Warm', 'Hot'] as InterestLevel[]).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.interestButton,
                    interestLevel === level && [
                      styles.interestButtonActive,
                      { backgroundColor: getInterestLevelColor(level) }
                    ]
                  ]}
                  onPress={() => updateInterestLevel(level)}
                >
                  <Text
                    style={[
                      styles.interestButtonText,
                      interestLevel === level && styles.interestButtonTextActive
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home-outline" size={24} color="#6b7280" />
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="people-outline" size={24} color="white" />
          <Text style={[styles.navButtonText, styles.navButtonTextActive]}>Leads</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButtonScan}>
          <LinearGradient
            colors={['#7c3aed', '#a855f7']}
            style={styles.scanGradient}
          >
            <Ionicons name="scan-outline" size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.navButtonText, styles.navButtonTextActive]}>Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="settings-outline" size={24} color="#6b7280" />
          <Text style={styles.navButtonText}>Settings</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 30,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8b9dc3',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  starButton: {
    padding: 8,
  },
  profileInfo: {
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 16,
    color: '#8b9dc3',
    marginBottom: 4,
  },
  profileCompany: {
    fontSize: 16,
    color: '#8b9dc3',
  },
  contactSection: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
  },
  contactTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#8b9dc3',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#1a1d36',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  noteTextInput: {
    color: 'white',
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#8b9dc3',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  notesContainer: {
    gap: 12,
  },
  noteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
  },
  noteContent: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  deleteNoteButton: {
    padding: 4,
  },
  emptyNotesText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#7c3aed',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  removeTagButton: {
    marginLeft: 6,
    padding: 2,
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagInput: {
    color: 'white',
    fontSize: 14,
    flex: 1,
    minWidth: 60,
  },
  addTagButton: {
    marginLeft: 8,
    padding: 2,
  },
  addTagPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addTagText: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 4,
  },
  interestLevels: {
    flexDirection: 'row',
    gap: 12,
  },
  interestButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  interestButtonActive: {
    backgroundColor: '#7c3aed',
  },
  interestButtonText: {
    color: '#8b9dc3',
    fontSize: 16,
    fontWeight: '600',
  },
  interestButtonTextActive: {
    color: 'white',
  },
  bottomSpacing: {
    height: 100,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1a1d36',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navButtonScan: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  scanGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navButtonText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  navButtonTextActive: {
    color: 'white',
  },
});

export default ProspectDetailScreen;