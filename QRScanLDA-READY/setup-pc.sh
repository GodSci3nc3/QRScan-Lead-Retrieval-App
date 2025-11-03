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
