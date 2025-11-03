# =================================================================
# Script de Compilación y Generación de APK - QRScanLDA
# =================================================================

#!/bin/bash

echo "🚀 Iniciando proceso de compilación de QRScanLDA..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Función para verificar instalaciones
check_dependencies() {
    echo "📋 Verificando dependencias..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js no está instalado"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm no está instalado"
        exit 1
    fi
    
    # Verificar Expo CLI
    if ! command -v npx &> /dev/null; then
        echo "❌ npx no está disponible"
        exit 1
    fi
    
    echo "✅ Dependencias verificadas"
}

# Función para instalar dependencias
install_dependencies() {
    echo "📦 Instalando dependencias del proyecto..."
    
    # Usar cache de npm para acelerar instalaciones
    npm ci --prefer-offline --no-audit
    
    if [ $? -ne 0 ]; then
        echo "❌ Error instalando dependencias"
        echo "💡 Intentando con npm install..."
        npm install --prefer-offline --no-audit
        
        if [ $? -ne 0 ]; then
            echo "❌ Error crítico instalando dependencias"
            exit 1
        fi
    fi
    
    echo "✅ Dependencias instaladas exitosamente"
}

# Función para limpiar caché
clean_cache() {
    echo "🧹 Limpiando caché..."
    npx expo install --fix
    npm start -- --clear
}

# Función para verificar configuración
verify_config() {
    echo "🔍 Verificando configuración del proyecto..."
    
    # Verificar app.json
    if [ ! -f "app.json" ]; then
        echo "❌ No se encontró app.json"
        exit 1
    fi
    
    # Verificar que los assets existen
    if [ ! -d "assets/images" ]; then
        echo "⚠️  Advertencia: Directorio de assets no encontrado"
    fi
    
    echo "✅ Configuración verificada"
}

# Función para compilar para Android
build_android() {
    echo "🔨 Compilando para Android..."
    
    # Prebuild para Android
    echo "📱 Generando proyecto nativo de Android..."
    npx expo prebuild --platform android --clean
    
    if [ $? -ne 0 ]; then
        echo "❌ Error en prebuild de Android"
        exit 1
    fi
    
    # Compilar APK
    echo "📦 Generando APK..."
    npx expo build:android --type apk
    
    if [ $? -ne 0 ]; then
        echo "❌ Error compilando APK"
        exit 1
    fi
    
    echo "✅ Compilación de Android completada"
}

# Función alternativa usando EAS Build
build_with_eas() {
    echo "🏗️  Compilando con EAS Build..."
    
    # Verificar EAS CLI
    if ! command -v eas &> /dev/null; then
        echo "📥 Instalando EAS CLI..."
        npm install -g @expo/eas-cli
    fi
    
    # Configurar EAS si no existe
    if [ ! -f "eas.json" ]; then
        echo "⚙️  Configurando EAS..."
        npx eas build:configure
    fi
    
    # Compilar APK con EAS
    echo "🔨 Compilando APK con EAS..."
    npx eas build --platform android --profile development
    
    echo "✅ Compilación con EAS completada"
}

# Función para generar bundle local
build_local() {
    echo "🏠 Generando build local..."
    
    # Instalar dependencias específicas para build local
    npm install -g @expo/cli
    
    # Generar bundle
    npx expo export --platform android
    
    # Compilar APK local (requiere Android SDK)
    if command -v android &> /dev/null; then
        echo "📱 Compilando APK local..."
        cd android
        ./gradlew assembleDebug
        cd ..
        
        echo "📁 APK generado en: android/app/build/outputs/apk/debug/app-debug.apk"
    else
        echo "⚠️  Android SDK no encontrado. Solo se generó el bundle."
    fi
}

# Función principal
main() {
    echo "🎯 QRScanLDA - Compilación y Generación de APK"
    echo "============================================="
    
    check_dependencies
    install_dependencies
    verify_config
    
    echo ""
    echo "📋 Opciones de compilación:"
    echo "1. EAS Build (Recomendado)"
    echo "2. Build local"
    echo "3. Export bundle solamente"
    echo ""
    
    read -p "Selecciona una opción (1-3): " choice
    
    case $choice in
        1)
            build_with_eas
            ;;
        2)
            build_local
            ;;
        3)
            npx expo export --platform android
            echo "✅ Bundle exportado a dist/"
            ;;
        *)
            echo "❌ Opción inválida"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 ¡Proceso completado exitosamente!"
    echo "📱 Para instalar el APK en tu dispositivo:"
    echo "   1. Habilita 'Fuentes desconocidas' en Configuración"
    echo "   2. Transfiere el APK a tu dispositivo"
    echo "   3. Abre el archivo APK para instalar"
}

# Ejecutar función principal
main "$@"