import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/login`, { email, password }, { withCredentials: true });
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw err.response.data.error;
    }
    throw { code: 'INTERNAL_ERROR', message: err.message || 'Login request failed.' };
  }
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/api/auth/register`, { email, password }, { withCredentials: true });
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw err.response.data.error;
    }
    throw { code: 'INTERNAL_ERROR', message: err.message || 'Registration request failed.' };
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
  } catch {
    // Ignore logout failure
  }
}
