import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import ProspectDetailScreen from './ProspectDetailScreen';

export default function ProspectDetailPage() {
  const router = useRouter();
  const { prospectId } = useLocalSearchParams<{ prospectId: string }>();

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    // Implementar funcionalidad de compartir
    console.log('Share prospect');
  };

  const handleEdit = () => {
    // Implementar funcionalidad de edición
    console.log('Edit prospect');
  };

  if (!prospectId) {
    // Si no hay prospectId, redirigir de vuelta
    router.replace('/(tabs)/prospects');
    return null;
  }

  return (
    <ProspectDetailScreen
      prospectId={prospectId}
      onBack={handleBack}
      onShare={handleShare}
      onEdit={handleEdit}
    />
  );
}