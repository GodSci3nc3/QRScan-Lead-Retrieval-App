#!/bin/bash

# =================================================================
# Script de Preparación para Transferencia a PC Potente
# =================================================================

echo "🔧 Preparando proyecto QRScanLDA para transferencia..."

# Crear directorio de preparación
PREP_DIR="QRScanLDA-READY"
echo "📁 Creando directorio de preparación: $PREP_DIR"

# Limpiar directorio si existe
if [ -d "$PREP_DIR" ]; then
    rm -rf "$PREP_DIR"
fi

mkdir "$PREP_DIR"

# Copiar archivos esenciales
echo "📋 Copiando archivos del proyecto..."

# Archivos de configuración principales
cp package.json "$PREP_DIR/"
cp package-lock.json "$PREP_DIR/" 2>/dev/null || echo "⚠️  package-lock.json no encontrado"
cp app.json "$PREP_DIR/"
cp eas.json "$PREP_DIR/"
cp tsconfig.json "$PREP_DIR/"
cp eslint.config.js "$PREP_DIR/"
cp expo-env.d.ts "$PREP_DIR/"

# Archivos de entorno (IMPORTANTE: configurar antes)
cp .env.example "$PREP_DIR/"
echo "⚠️  IMPORTANTE: Configurar .env con credenciales reales de Supabase"

# Copiar código fuente
cp -r app "$PREP_DIR/"
cp -r assets "$PREP_DIR/"
cp -r components "$PREP_DIR/"
cp -r constants "$PREP_DIR/"
cp -r database "$PREP_DIR/"
cp -r hooks "$PREP_DIR/"
cp -r locales "$PREP_DIR/"
cp -r services "$PREP_DIR/"
cp -r types "$PREP_DIR/"
cp -r utils "$PREP_DIR/"
cp -r scripts "$PREP_DIR/"

# Copiar datos de prueba
cp -r test-qr-data "$PREP_DIR/"

# Crear archivo de instrucciones
cat > "$PREP_DIR/INSTRUCCIONES_PC.md" << 'EOF'
# 🚀 Instrucciones para Compilación en PC Potente

## 1. Configuración Inicial:
```bash
# Instalar dependencias
npm install

# Verificar que Expo CLI esté disponible
npx expo --version
```

## 2. Configurar Supabase:
- Copiar `.env.example` a `.env`
- Completar las credenciales reales en `.env`
- Ejecutar el schema SQL en Supabase

## 3. Compilación:
```bash
# Para desarrollo/testing
npm run build:dev

# Para producción
npm run build:prod

# O usar el script optimizado
chmod +x scripts/build-apk.sh
./scripts/build-apk.sh
```

## 4. Compilación con EAS (Recomendado):
```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Compilar APK
eas build --platform android --profile production
```

## 5. Verificaciones antes de compilar:
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Schema de Supabase ejecutado
- [ ] Permisos del sistema configurados

## 6. Problemas comunes:
- Si falla la instalación: `npm cache clean --force`
- Si falla la compilación: verificar memoria disponible (min 8GB RAM)
- Si faltan permisos: ejecutar como administrador en Windows
EOF

# Crear script de instalación rápida
cat > "$PREP_DIR/setup-pc.sh" << 'EOF'
#!/bin/bash
echo "🔧 Configuración rápida en PC potente..."

# Instalar dependencias con configuración optimizada
npm config set fund false
npm config set audit false
npm install --prefer-offline

# Verificar instalación
echo "✅ Verificando instalación..."
npm list --depth=0

echo "🚀 Proyecto listo para compilar!"
echo "💡 Siguiente paso: configurar .env y ejecutar npm run build:prod"
EOF

chmod +x "$PREP_DIR/setup-pc.sh"

# Crear comprimido para transferencia
echo "📦 Creando archivo comprimido..."
tar -czf "QRScanLDA-READY.tar.gz" "$PREP_DIR"

echo ""
echo "✅ Proyecto preparado exitosamente!"
echo "📁 Directorio: $PREP_DIR"
echo "📦 Archivo comprimido: QRScanLDA-READY.tar.gz"
echo ""
echo "🔄 Pasos siguientes:"
echo "1. Transferir QRScanLDA-READY.tar.gz a tu PC potente"
echo "2. Extraer: tar -xzf QRScanLDA-READY.tar.gz"
echo "3. cd QRScanLDA-READY"
echo "4. Configurar .env con credenciales reales"
echo "5. Ejecutar: ./setup-pc.sh"
echo "6. Compilar: npm run build:prod"
echo ""
echo "⚠️  CRÍTICO: No olvides configurar las credenciales de Supabase!"