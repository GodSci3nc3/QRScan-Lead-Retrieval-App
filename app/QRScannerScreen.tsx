import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface QRScannerScreenProps {
  onQRScanned?: (data: string) => void;
  onManualEntry?: () => void;
  onBack?: () => void;
  exhibitorName?: string;
}

const { width, height } = Dimensions.get('window');
const scannerSize = width * 0.75;

const QRScannerScreen: React.FC<QRScannerScreenProps> = ({
  onQRScanned,
  onManualEntry,
  onBack,
  exhibitorName = "11/Media LLC"
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Definir la función fuera para poder reutilizarla
  const getCameraPermissions = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  setHasPermission(status === 'granted');
  };

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      onQRScanned?.(data);
      
      // Reset scanner after a delay
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    }
  };

  const handleFlip = () => {
    // Toggle between front and back camera if needed
    // This would require additional state management for camera type
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>No access to camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={() => getCameraPermissions()}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="scan-outline" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{exhibitorName}</Text>
            <Text style={styles.headerSubtitle}>Scan QR</Text>
          </View>
          
          <TouchableOpacity style={styles.flashButton}>
            <Ionicons name="flash" size={20} color="#7c3aed" />
          </TouchableOpacity>
        </View>

        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onCameraReady={() => setIsCameraReady(true)}
          />
          
          {/* Scanner Overlay */}
          <View style={styles.overlay}>
            {/* Top Overlay */}
            <View style={styles.overlayTop} />
            
            {/* Middle Section with Scanner Frame */}
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              
              {/* Scanner Frame */}
              <View style={styles.scannerFrame}>
                <LinearGradient
                  colors={['#7c3aed', '#a855f7']}
                  style={styles.scannerBorder}
                >
                  <View style={styles.scannerInner}>
                    {/* Corner Indicators */}
                    <View style={[styles.corner, styles.cornerTopLeft]} />
                    <View style={[styles.corner, styles.cornerTopRight]} />
                    <View style={[styles.corner, styles.cornerBottomLeft]} />
                    <View style={[styles.corner, styles.cornerBottomRight]} />
                    
                    {/* Camera Icon in Center */}
                    <View style={styles.centerIcon}>
                      <View style={styles.cameraIconCircle}>
                        <Ionicons name="camera-outline" size={32} color="#7c3aed" />
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </View>
              
              <View style={styles.overlaySide} />
            </View>
            
            {/* Bottom Overlay */}
            <View style={styles.overlayBottom} />
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Align the QR code within the frame to scan automatically.
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handleFlip} style={styles.controlButton}>
            <Ionicons name="camera-reverse-outline" size={24} color="white" />
            <Text style={styles.controlButtonText}>Flip</Text>
          </TouchableOpacity>
        </View>

        {/* Manual Entry Button */}
        <TouchableOpacity onPress={onManualEntry} style={styles.manualButton}>
          <LinearGradient
            colors={['#7c3aed', '#a855f7']}
            style={styles.manualButtonGradient}
          >
            <Text style={styles.manualButtonText}>Enter ID manually</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8b9dc3',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: scannerSize,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
  },
  scannerFrame: {
    width: scannerSize,
    height: scannerSize,
  },
  scannerBorder: {
    flex: 1,
    borderRadius: 20,
    padding: 3,
  },
  scannerInner: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 17,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#7c3aed',
    borderWidth: 3,
  },
  cornerTopLeft: {
    top: 10,
    left: 10,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 10,
  },
  cornerTopRight: {
    top: 10,
    right: 10,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 10,
  },
  cornerBottomLeft: {
    bottom: 10,
    left: 10,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
  },
  cornerBottomRight: {
    bottom: 10,
    right: 10,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 10,
  },
  centerIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -35 }],
  },
  cameraIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 35, 0.8)',
  },
  instructions: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#8b9dc3',
    textAlign: 'center',
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  controlButton: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  manualButton: {
    marginHorizontal: 32,
    marginBottom: 32,
    borderRadius: 12,
    overflow: 'hidden',
  },
  manualButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScannerScreen;