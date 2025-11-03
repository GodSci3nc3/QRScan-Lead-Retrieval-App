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
