import axios from 'axios';
import { AuditReport } from './auditClient';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface HistoryPaginatedResponse {
  data: AuditReport[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchHistory(page = 1, limit = 10): Promise<HistoryPaginatedResponse> {
  try {
    const response = await axios.get<HistoryPaginatedResponse>(`${API_BASE_URL}/api/history?page=${page}&limit=${limit}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw err.response.data.error;
    }
    throw { code: 'INTERNAL_ERROR', message: 'Failed to load audit history.' };
  }
}

export async function deleteAuditRecord(id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/api/history/${id}`, {
      withCredentials: true,
    });
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw err.response.data.error;
    }
    throw { code: 'INTERNAL_ERROR', message: 'Failed to delete audit record.' };
  }
}
