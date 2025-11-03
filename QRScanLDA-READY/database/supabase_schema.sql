-- =================================================================
-- QRScanLDA - Base de Datos PostgreSQL para Supabase
-- Script de creación de esquema completo
-- =================================================================

-- Habilitar Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- =================================================================
-- 1. TABLA DE USUARIOS
-- =================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'exhibitor' CHECK (role IN ('admin', 'exhibitor', 'manager')),
    company VARCHAR(255),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    language_preference VARCHAR(5) DEFAULT 'es' CHECK (language_preference IN ('es', 'en')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- 2. TABLA DE EVENTOS
-- =================================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(255),
    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- 3. TABLA DE EXPOSITORES
-- =================================================================
CREATE TABLE IF NOT EXISTS exhibitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    booth_number VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(500),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- =================================================================
-- 4. TABLA DE PROSPECTOS
-- =================================================================
CREATE TABLE IF NOT EXISTS prospects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- Información básica del prospecto
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    position VARCHAR(255),
    industry VARCHAR(100),
    website VARCHAR(255),
    address TEXT,
    
    -- Información adicional
    lead_source VARCHAR(100) DEFAULT 'qr_scan' CHECK (lead_source IN ('qr_scan', 'manual_entry', 'import')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    interest_level VARCHAR(20) DEFAULT 'warm' CHECK (interest_level IN ('cold', 'warm', 'hot')),
    
    -- Metadatos
    notes TEXT,
    tags TEXT[], -- Array de tags
    is_starred BOOLEAN DEFAULT false,
    is_qualified BOOLEAN DEFAULT false,
    
    -- Datos técnicos
    qr_data JSONB, -- Datos originales del QR
    sync_status VARCHAR(20) DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'error')),
    last_interaction TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indices para búsquedas rápidas
    CONSTRAINT unique_prospect_per_exhibitor UNIQUE(exhibitor_id, email, event_id)
);

-- =================================================================
-- 5. TABLA DE INTERACCIONES
-- =================================================================
CREATE TABLE IF NOT EXISTS prospect_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
    exhibitor_id UUID REFERENCES exhibitors(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('scan', 'note_added', 'email_sent', 'call_made', 'meeting_scheduled', 'follow_up')),
    description TEXT,
    interaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- 6. TABLA DE CONFIGURACIONES GLOBALES
-- =================================================================
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- 7. TABLA DE SINCRONIZACIÓN
-- =================================================================
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('insert', 'update', 'delete')),
    record_id UUID NOT NULL,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'error')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================
-- ÍNDICES PARA RENDIMIENTO
-- =================================================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índices para eventos
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);

-- Índices para expositores
CREATE INDEX IF NOT EXISTS idx_exhibitors_user_event ON exhibitors(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_exhibitors_company ON exhibitors(company_name);

-- Índices para prospectos
CREATE INDEX IF NOT EXISTS idx_prospects_exhibitor ON prospects(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_prospects_event ON prospects(event_id);
CREATE INDEX IF NOT EXISTS idx_prospects_email ON prospects(email);
CREATE INDEX IF NOT EXISTS idx_prospects_company ON prospects(company);
CREATE INDEX IF NOT EXISTS idx_prospects_created ON prospects(created_at);
CREATE INDEX IF NOT EXISTS idx_prospects_sync_status ON prospects(sync_status);
CREATE INDEX IF NOT EXISTS idx_prospects_priority ON prospects(priority);
CREATE INDEX IF NOT EXISTS idx_prospects_tags ON prospects USING GIN(tags);

-- Índices para interacciones
CREATE INDEX IF NOT EXISTS idx_interactions_prospect ON prospect_interactions(prospect_id);
CREATE INDEX IF NOT EXISTS idx_interactions_exhibitor ON prospect_interactions(exhibitor_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON prospect_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON prospect_interactions(created_at);

-- =================================================================
-- TRIGGERS PARA UPDATED_AT
-- =================================================================

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas principales
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibitors_updated_at BEFORE UPDATE ON exhibitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prospects_updated_at BEFORE UPDATE ON prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (solo pueden ver/editar sus propios datos)
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para expositores
CREATE POLICY "Exhibitors can view own data" ON exhibitors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Exhibitors can update own data" ON exhibitors
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para prospectos
CREATE POLICY "Exhibitors can view own prospects" ON prospects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exhibitors 
            WHERE exhibitors.id = prospects.exhibitor_id 
            AND exhibitors.user_id = auth.uid()
        )
    );

CREATE POLICY "Exhibitors can manage own prospects" ON prospects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exhibitors 
            WHERE exhibitors.id = prospects.exhibitor_id 
            AND exhibitors.user_id = auth.uid()
        )
    );

-- Políticas para administradores (pueden ver todo)
CREATE POLICY "Admins can view everything" ON prospects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- =================================================================
-- DATOS INICIALES
-- =================================================================

-- Configuraciones por defecto
INSERT INTO app_settings (setting_key, setting_value, description, is_system) VALUES
('app_version', '"1.0.0"', 'Versión actual de la aplicación', true),
('max_prospects_per_exhibitor', '10000', 'Máximo número de prospectos por expositor', true),
('sync_interval_minutes', '15', 'Intervalo de sincronización en minutos', false),
('export_formats', '["csv", "excel", "json", "vcf"]', 'Formatos de exportación disponibles', true),
('default_language', '"es"', 'Idioma por defecto de la aplicación', false);

-- Usuario administrador por defecto (cambiar password!)
INSERT INTO users (email, password_hash, full_name, role, language_preference) VALUES
('admin@qrscanlda.com', '$2b$10$example_hash_change_this', 'Administrador Sistema', 'admin', 'es');

-- Evento de ejemplo
INSERT INTO events (name, description, start_date, end_date, location, is_active) VALUES
('Expo Tech 2025', 'Exposición de tecnología empresarial', '2025-03-15', '2025-03-17', 'Centro de Convenciones', true);

-- =================================================================
-- VISTAS PARA REPORTES
-- =================================================================

-- Vista de estadísticas de prospectos por expositor
CREATE OR REPLACE VIEW prospect_stats_by_exhibitor AS
SELECT 
    e.id as exhibitor_id,
    e.company_name,
    e.booth_number,
    u.full_name as contact_person,
    COUNT(p.id) as total_prospects,
    COUNT(CASE WHEN p.interest_level = 'hot' THEN 1 END) as hot_prospects,
    COUNT(CASE WHEN p.interest_level = 'warm' THEN 1 END) as warm_prospects,
    COUNT(CASE WHEN p.interest_level = 'cold' THEN 1 END) as cold_prospects,
    COUNT(CASE WHEN p.is_qualified = true THEN 1 END) as qualified_prospects,
    COUNT(CASE WHEN p.lead_source = 'qr_scan' THEN 1 END) as qr_prospects,
    COUNT(CASE WHEN p.lead_source = 'manual_entry' THEN 1 END) as manual_prospects,
    MAX(p.created_at) as last_prospect_date
FROM exhibitors e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN prospects p ON e.id = p.exhibitor_id
WHERE e.is_active = true
GROUP BY e.id, e.company_name, e.booth_number, u.full_name;

-- Vista de actividad diaria
CREATE OR REPLACE VIEW daily_activity AS
SELECT 
    DATE(p.created_at) as activity_date,
    COUNT(p.id) as total_prospects,
    COUNT(DISTINCT p.exhibitor_id) as active_exhibitors,
    COUNT(CASE WHEN p.lead_source = 'qr_scan' THEN 1 END) as qr_scans,
    COUNT(CASE WHEN p.lead_source = 'manual_entry' THEN 1 END) as manual_entries
FROM prospects p
WHERE p.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(p.created_at)
ORDER BY activity_date DESC;

-- =================================================================
-- FUNCIONES AUXILIARES
-- =================================================================

-- Función para limpiar datos antiguos de sincronización
CREATE OR REPLACE FUNCTION cleanup_old_sync_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sync_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas del evento
CREATE OR REPLACE FUNCTION get_event_stats(event_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_exhibitors', (SELECT COUNT(*) FROM exhibitors WHERE event_id = event_uuid AND is_active = true),
        'total_prospects', (SELECT COUNT(*) FROM prospects WHERE event_id = event_uuid),
        'total_interactions', (SELECT COUNT(*) FROM prospect_interactions pi 
                              JOIN prospects p ON pi.prospect_id = p.id 
                              WHERE p.event_id = event_uuid),
        'avg_prospects_per_exhibitor', (SELECT ROUND(AVG(prospect_count), 2) 
                                       FROM (SELECT COUNT(p.id) as prospect_count 
                                            FROM exhibitors e 
                                            LEFT JOIN prospects p ON e.id = p.exhibitor_id 
                                            WHERE e.event_id = event_uuid AND e.is_active = true 
                                            GROUP BY e.id) as subq),
        'top_performing_exhibitors', (SELECT json_agg(json_build_object(
                                        'company_name', company_name,
                                        'total_prospects', total_prospects
                                      )) 
                                     FROM prospect_stats_by_exhibitor 
                                     ORDER BY total_prospects DESC 
                                     LIMIT 5)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- COMENTARIOS FINALES
-- =================================================================

-- Este esquema incluye:
-- ✅ Gestión completa de usuarios y roles
-- ✅ Sistema multi-evento
-- ✅ Tracking de expositores y sus prospectos
-- ✅ Historial de interacciones
-- ✅ Sistema de sincronización
-- ✅ Row Level Security para privacidad
-- ✅ Índices optimizados para rendimiento
-- ✅ Vistas para reportes
-- ✅ Funciones auxiliares

COMMENT ON DATABASE postgres IS 'QRScanLDA - Lead Data Acquisition System Database';