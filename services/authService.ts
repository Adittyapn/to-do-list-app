import api from './api';
import type { User } from './types';

interface LoginResponse {
  token: string;
  username: string;
}

export const registerUser = async (
  email: string,
  username: string,
  password: string
): Promise<boolean> => {
  try {
    await api.post('/register', { email, username, password });
    alert('Pendaftaran berhasil! Silakan login.');
    return true;
  } catch (error: any) {
    alert(
      `Pendaftaran gagal: ${error.response?.data?.message || error.message}`
    );
    return false;
  }
};

export const loginUser = async (
  username: string,
  password: string
): Promise<User | null> => {
  try {
    const response = await api.post('/login', {
      username,
      password,
    });

    const token = response.data.data.token;
    sessionStorage.setItem('authToken', token);

    const user: User = {
      id: 0,
      username: response.data.data.username || username,
    };
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));

    return user;
  } catch (error: any) {
    alert(`Login gagal: ${error.response?.data?.message || error.message}`);
    return null;
  }
};

export const logoutUser = (): void => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('loggedInUser');
};

export const getLoggedInUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userJson = sessionStorage.getItem('loggedInUser');
  return userJson ? JSON.parse(userJson) : null;
};
