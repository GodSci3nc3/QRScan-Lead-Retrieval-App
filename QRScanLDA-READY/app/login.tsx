import { useRouter } from 'expo-router';
import LoginScreen from './LoginScreen';

export default function Login() {
  const router = useRouter();
  return (
    <LoginScreen
      onLogin={() => router.replace('/(tabs)/prospects')}
      onNavigateToRegister={() => router.push('/RegisterScreen')}
    />
  );
}
