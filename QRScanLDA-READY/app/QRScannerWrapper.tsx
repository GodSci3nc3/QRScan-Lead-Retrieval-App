import { useRouter } from 'expo-router';
import QRScannerScreen from './QRScannerScreen';

export default function QRScannerWrapper() {
  const router = useRouter();

  const handleQRScanned = (data: string) => {
    console.log('QR Scanned:', data);
  };

  const handleManualEntry = () => {
    // For now, just navigate back
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  const handleProspectSaved = (prospectId: string) => {
    // Navigate to detail screen
    console.log('Prospect saved:', prospectId);
    router.back(); // For now, just go back
  };

  return (
    <QRScannerScreen
      onQRScanned={handleQRScanned}
      onManualEntry={handleManualEntry}
      onBack={handleBack}
      onProspectSaved={handleProspectSaved}
      exhibitorName="QRScan LDA"
    />
  );
}