import axios, { AxiosError } from 'axios';

if (!import.meta.env.VITE_API_URL) {
  throw new Error('Missing environment variable: VITE_API_URL');
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export class ApiError extends Error {
  code: number

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export class ClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientError';
  }
}

export interface Category {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error: string | null;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get<ApiResponse<Category[]>>('/api/v1/categories');
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError('Something went wrong', statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}