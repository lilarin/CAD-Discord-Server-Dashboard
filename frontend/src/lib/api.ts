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

export interface Channel {
  id: string;
  name: string;
  type: string
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error: string | null;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get<ApiResponse<Category[]>>('/api/v1/categories');
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError('Something went wrong fetching categories', statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function getChannels(categoryId: string): Promise<Channel[]> {
  try {
    const response = await api.get<ApiResponse<Channel[]>>(`/api/v1/channels/${categoryId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(`Something went wrong fetching channels for category ${categoryId}`, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function deleteCategory(categoryId: string): Promise<Category[]> {
  try {
    const response = await api.delete<ApiResponse<Category[]>>(`/api/v1/categories/${categoryId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(`Something went wrong deleting category ${categoryId}`, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}


export async function deleteChannel(categoryId: string): Promise<Channel[]> {
  try {
    const response = await api.delete<ApiResponse<Channel[]>>(`/api/v1/channels/${categoryId}`);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(`Something went wrong deleting category ${categoryId}`, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function updateCategoryPosition(categoryId: string, newPosition: number): Promise<Category[]> {
  try {
    const response = await api.patch<ApiResponse<Category[]>>(
      `/api/v1/categories/${categoryId}/position/${newPosition}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(`Something went wrong updating category position for ${categoryId}`, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}