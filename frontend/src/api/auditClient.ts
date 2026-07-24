import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface AuditReport {
  id?: string;
  url: string;
  status: number;
  responseTimeMs: number;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imagesMissingAlt: number;
  wordCount: number;
  contentType: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  savedToHistory: boolean;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export async function requestAudit(url: string): Promise<AuditReport> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post<AuditReport>(
      `${API_BASE_URL}/api/audit`,
      { url },
      { headers, withCredentials: true }
    );
    return response.data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.data?.error) {
      throw err.response.data.error;
    }
    throw { code: 'INTERNAL_ERROR', message: err.message || 'Failed to connect to audit server.' };
  }
}
