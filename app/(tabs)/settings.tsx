import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function SettingsTab() {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.iconContainer}>
          <IconSymbol 
            size={80} 
            name="gearshape.fill" 
            color="#007AFF" 
          />
        </ThemedView>
        <ThemedText type="title" style={styles.title}>
          Configuración
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Próximamente...
        </ThemedText>
        <ThemedText style={styles.description}>
          Esta sección se desarrollará en futuras versiones de la aplicación.
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  description: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 24,
  },
});