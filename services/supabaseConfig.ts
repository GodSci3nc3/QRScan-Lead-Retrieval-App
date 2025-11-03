// =================================================================
// Configuración de Supabase para QRScanLDA
// =================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// NOTA: Reemplazar con las credenciales reales de Supabase
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qlcyeplehtvxmaikfgmb.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'tu-publishable-key-aqui';

// Configuración del cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'qrscanlda-mobile',
    },
  },
});

// =================================================================
// Tipos de datos para TypeScript
// =================================================================

export interface DatabaseUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'exhibitor' | 'manager';
  company?: string;
  phone?: string;
  is_active: boolean;
  language_preference: 'es' | 'en';
  created_at: string;
  updated_at: string;
}

export interface DatabaseEvent {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  organizer_id?: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseExhibitor {
  id: string;
  user_id: string;
  event_id: string;
  booth_number?: string;
  company_name: string;
  industry?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProspect {
  id: string;
  exhibitor_id: string;
  event_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  industry?: string;
  website?: string;
  address?: string;
  lead_source: 'qr_scan' | 'manual_entry' | 'import';
  priority: 'low' | 'medium' | 'high';
  interest_level: 'cold' | 'warm' | 'hot';
  notes?: string;
  tags?: string[];
  is_starred: boolean;
  is_qualified: boolean;
  qr_data?: Record<string, any>;
  sync_status: 'pending' | 'synced' | 'error';
  last_interaction?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseInteraction {
  id: string;
  prospect_id: string;
  exhibitor_id: string;
  interaction_type: 'scan' | 'note_added' | 'email_sent' | 'call_made' | 'meeting_scheduled' | 'follow_up';
  description?: string;
  interaction_data: Record<string, any>;
  created_at: string;
}

// =================================================================
// Database Schema Definition
// =================================================================
export interface Database {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser;
        Insert: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>>;
      };
      events: {
        Row: DatabaseEvent;
        Insert: Omit<DatabaseEvent, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseEvent, 'id' | 'created_at' | 'updated_at'>>;
      };
      exhibitors: {
        Row: DatabaseExhibitor;
        Insert: Omit<DatabaseExhibitor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseExhibitor, 'id' | 'created_at' | 'updated_at'>>;
      };
      prospects: {
        Row: DatabaseProspect;
        Insert: Omit<DatabaseProspect, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseProspect, 'id' | 'created_at' | 'updated_at'>>;
      };
      prospect_interactions: {
        Row: DatabaseInteraction;
        Insert: Omit<DatabaseInteraction, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseInteraction, 'id' | 'created_at'>>;
      };
      app_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: any;
          description?: string;
          is_system: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          setting_key: string;
          setting_value: any;
          description?: string;
          is_system?: boolean;
        };
        Update: {
          setting_value?: any;
          description?: string;
        };
      };
      sync_logs: {
        Row: {
          id: string;
          user_id: string;
          table_name: string;
          operation: 'insert' | 'update' | 'delete';
          record_id: string;
          sync_status: 'pending' | 'success' | 'error';
          error_message?: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          table_name: string;
          operation: 'insert' | 'update' | 'delete';
          record_id: string;
          sync_status?: 'pending' | 'success' | 'error';
          error_message?: string;
        };
        Update: {
          sync_status?: 'pending' | 'success' | 'error';
          error_message?: string;
        };
      };
    };
    Views: {
      prospect_stats_by_exhibitor: {
        Row: {
          exhibitor_id: string;
          company_name: string;
          booth_number?: string;
          contact_person: string;
          total_prospects: number;
          hot_prospects: number;
          warm_prospects: number;
          cold_prospects: number;
          qualified_prospects: number;
          qr_prospects: number;
          manual_prospects: number;
          last_prospect_date?: string;
        };
      };
      daily_activity: {
        Row: {
          activity_date: string;
          total_prospects: number;
          active_exhibitors: number;
          qr_scans: number;
          manual_entries: number;
        };
      };
    };
    Functions: {
      cleanup_old_sync_logs: {
        Args: {};
        Returns: number;
      };
      get_event_stats: {
        Args: { event_uuid: string };
        Returns: any;
      };
    };
  };
}

// =================================================================
// Funciones de utilidad
// =================================================================

export const isSupabaseConfigured = (): boolean => {
  return SUPABASE_URL !== 'https://qlcyeplehtvxmaikfgmb.supabase.co' && 
         SUPABASE_KEY !== 'tu-publishable-key-aqui';
};

export const getSupabaseConfig = () => ({
  url: SUPABASE_URL,
  publishableKey: SUPABASE_KEY,
  configured: isSupabaseConfigured()
});

// Cliente tipado
export const typedSupabase = supabase as unknown as ReturnType<typeof createClient<Database>>;