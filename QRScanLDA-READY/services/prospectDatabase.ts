import AsyncStorage from '@react-native-async-storage/async-storage';
import { Prospect, ProspectFilter, generateId } from '../types/prospect';

const PROSPECTS_KEY = 'qr_prospects';
const SETTINGS_KEY = 'qr_settings';

export class ProspectDatabase {
  // Save a new prospect
  static async saveProspect(prospectData: Omit<Prospect, 'id'>): Promise<Prospect> {
    try {
      const prospect: Prospect = {
        ...prospectData,
        id: generateId(),
        createdAt: prospectData.createdAt || new Date().toISOString(),
        isStarred: prospectData.isStarred || false,
        tags: prospectData.tags || [],
        synced: false,
        lastModified: new Date().toISOString()
      };

      const prospects = await this.getAllProspects();
      prospects.push(prospect);
      
      await AsyncStorage.setItem(PROSPECTS_KEY, JSON.stringify(prospects));
      return prospect;
    } catch (error) {
      console.error('Error saving prospect:', error);
      throw new Error('Failed to save prospect');
    }
  }

  // Add prospect (alias for saveProspect for sync compatibility)
  static async addProspect(prospectData: Prospect): Promise<Prospect> {
    try {
      const prospects = await this.getAllProspects();
      const updatedProspect = {
        ...prospectData,
        lastModified: new Date().toISOString()
      };
      prospects.push(updatedProspect);
      
      await AsyncStorage.setItem(PROSPECTS_KEY, JSON.stringify(prospects));
      return updatedProspect;
    } catch (error) {
      console.error('Error adding prospect:', error);
      throw new Error('Failed to add prospect');
    }
  }

  // Get all prospects
  static async getAllProspects(): Promise<Prospect[]> {
    try {
      const data = await AsyncStorage.getItem(PROSPECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting prospects:', error);
      return [];
    }
  }

  // Get prospect by ID
  static async getProspectById(id: string): Promise<Prospect | null> {
    try {
      const prospects = await this.getAllProspects();
      return prospects.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting prospect by ID:', error);
      return null;
    }
  }

  // Update prospect
  static async updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect | null> {
    try {
      const prospects = await this.getAllProspects();
      const index = prospects.findIndex(p => p.id === id);
      
      if (index === -1) {
        throw new Error('Prospect not found');
      }

      prospects[index] = { ...prospects[index], ...updates };
      await AsyncStorage.setItem(PROSPECTS_KEY, JSON.stringify(prospects));
      
      return prospects[index];
    } catch (error) {
      console.error('Error updating prospect:', error);
      throw new Error('Failed to update prospect');
    }
  }

  // Delete prospect
  static async deleteProspect(id: string): Promise<boolean> {
    try {
      const prospects = await this.getAllProspects();
      const filteredProspects = prospects.filter(p => p.id !== id);
      
      if (filteredProspects.length === prospects.length) {
        return false; // Prospect not found
      }

      await AsyncStorage.setItem(PROSPECTS_KEY, JSON.stringify(filteredProspects));
      return true;
    } catch (error) {
      console.error('Error deleting prospect:', error);
      throw new Error('Failed to delete prospect');
    }
  }

  // Search and filter prospects
  static async searchProspects(filter: ProspectFilter): Promise<Prospect[]> {
    try {
      let prospects = await this.getAllProspects();

      // Apply search term
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        prospects = prospects.filter(prospect => {
          const name = prospect.name || prospect.fullName || '';
          const position = prospect.position || prospect.jobTitle || '';
          return (
            name.toLowerCase().includes(searchTerm) ||
            (prospect.company || '').toLowerCase().includes(searchTerm) ||
            (prospect.email || '').toLowerCase().includes(searchTerm) ||
            position.toLowerCase().includes(searchTerm)
          );
        });
      }

      // Apply registration type filter
      if (filter.registrationType && filter.registrationType.length > 0) {
        prospects = prospects.filter(prospect =>
          prospect.registrationType && filter.registrationType!.includes(prospect.registrationType)
        );
      }

      // Apply company filter
      if (filter.company) {
        prospects = prospects.filter(prospect =>
          (prospect.company || '').toLowerCase().includes(filter.company!.toLowerCase())
        );
      }

      // Apply date range filter
      if (filter.dateRange) {
        const start = new Date(filter.dateRange.start);
        const end = new Date(filter.dateRange.end);
        prospects = prospects.filter(prospect => {
          const dateToCheck = prospect.createdAt || prospect.scannedAt;
          if (!dateToCheck) return false;
          const scannedDate = new Date(dateToCheck);
          return scannedDate >= start && scannedDate <= end;
        });
      }

      // Apply starred filter
      if (filter.isStarred !== undefined) {
        prospects = prospects.filter(prospect => prospect.isStarred === filter.isStarred);
      }

      // Apply tags filter
      if (filter.tags && filter.tags.length > 0) {
        prospects = prospects.filter(prospect =>
          prospect.tags?.some(tag => filter.tags!.includes(tag))
        );
      }

      return prospects;
    } catch (error) {
      console.error('Error searching prospects:', error);
      return [];
    }
  }

  // Get prospects count
  static async getProspectsCount(): Promise<number> {
    try {
      const prospects = await this.getAllProspects();
      return prospects.length;
    } catch (error) {
      console.error('Error getting prospects count:', error);
      return 0;
    }
  }

  // Get prospects statistics
  static async getProspectsStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byCompany: Record<string, number>;
    recentCount: number;
  }> {
    try {
      const prospects = await this.getAllProspects();
      const stats = {
        total: prospects.length,
        byType: {} as Record<string, number>,
        byCompany: {} as Record<string, number>,
        recentCount: 0
      };

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      prospects.forEach(prospect => {
        // Count by registration type
        if (prospect.registrationType) {
          stats.byType[prospect.registrationType] = (stats.byType[prospect.registrationType] || 0) + 1;
        }
        
        // Count by company
        if (prospect.company) {
          stats.byCompany[prospect.company] = (stats.byCompany[prospect.company] || 0) + 1;
        }
        
        // Count recent prospects
        const dateToCheck = prospect.createdAt || prospect.scannedAt;
        if (dateToCheck && new Date(dateToCheck) >= oneWeekAgo) {
          stats.recentCount++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting prospects stats:', error);
      return { total: 0, byType: {}, byCompany: {}, recentCount: 0 };
    }
  }

  // Check if prospect with email already exists
  static async prospectExistsByEmail(email: string): Promise<Prospect | null> {
    try {
      const prospects = await this.getAllProspects();
      return prospects.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Error checking prospect existence:', error);
      return null;
    }
  }

  // Bulk operations
  static async bulkDeleteProspects(ids: string[]): Promise<number> {
    try {
      const prospects = await this.getAllProspects();
      const filteredProspects = prospects.filter(p => !ids.includes(p.id));
      const deletedCount = prospects.length - filteredProspects.length;
      
      await AsyncStorage.setItem(PROSPECTS_KEY, JSON.stringify(filteredProspects));
      return deletedCount;
    } catch (error) {
      console.error('Error bulk deleting prospects:', error);
      throw new Error('Failed to delete prospects');
    }
  }

  // Clear all data (use with caution)
  static async clearAllProspects(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROSPECTS_KEY);
    } catch (error) {
      console.error('Error clearing prospects:', error);
      throw new Error('Failed to clear prospects');
    }
  }

  // Backup and restore functions
  static async exportProspectsData(): Promise<string> {
    try {
      const prospects = await this.getAllProspects();
      return JSON.stringify({
        prospects,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      });
    } catch (error) {
      console.error('Error exporting prospects data:', error);
      throw new Error('Failed to export data');
    }
  }

  static async importProspectsData(data: string, mergeMode: boolean = true): Promise<number> {
    try {
      const importData = JSON.parse(data);
      const importedProspects: Prospect[] = importData.prospects || [];
      
      if (mergeMode) {
        const existingProspects = await this.getAllProspects();
        const existingEmails = new Set(existingProspects.map(p => p.email.toLowerCase()));
        
        // Only import prospects that don't already exist (by email)
        const newProspects = importedProspects.filter(p => 
          !existingEmails.has(p.email.toLowerCase())
        );
        
        const mergedProspects = [...existingProspects, ...newProspects];
        await AsyncStorage.setItem(PROSPECTS_KEY, JSON.stringify(mergedProspects));
        return newProspects.length;
      } else {
        // Replace all data
        await AsyncStorage.setItem(PROSPECTS_KEY, JSON.stringify(importedProspects));
        return importedProspects.length;
      }
    } catch (error) {
      console.error('Error importing prospects data:', error);
      throw new Error('Failed to import data');
    }
  }
}