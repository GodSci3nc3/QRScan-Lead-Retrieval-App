import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUser = async (email: string, password: string) => {
  await AsyncStorage.setItem(`user:${email}`, JSON.stringify({ email, password }));
};

export const getUser = async (email: string) => {
  const data = await AsyncStorage.getItem(`user:${email}`);
  return data ? JSON.parse(data) : null;
};

export const checkLogin = async (email: string, password: string) => {
  const user = await getUser(email);
  return user && user.password === password;
};
