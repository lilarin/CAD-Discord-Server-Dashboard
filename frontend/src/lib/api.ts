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
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Channel {
  id: number;
  position: number;
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
    const response = await api.get<ApiResponse<Category[]>>(
        '/api/v1/categories'
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function getChannels(categoryId: number): Promise<Channel[]> {
  try {
    const response = await api.get<ApiResponse<Channel[]>>(
        `/api/v1/channels/${categoryId}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function deleteCategory(categoryId: number): Promise<Category[]> {
  try {
    const response = await api.delete<ApiResponse<Category[]>>(
        `/api/v1/categories/${categoryId}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}


export async function deleteChannel(channelId: number): Promise<Channel[]> {
  try {
    const response = await api.delete<ApiResponse<Channel[]>>(
        `/api/v1/channels/${channelId}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function updateCategoryPosition(categoryId: number, newPosition: number): Promise<Category[]> {
  try {
    const response = await api.patch<ApiResponse<Category[]>>(
      `/api/v1/categories/${categoryId}/position/${newPosition}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function updateChannelPosition(channelId: number, newPosition: number): Promise<Channel[]> {
  try {
    const response = await api.patch<ApiResponse<Channel[]>>(
      `/api/v1/channels/${channelId}/position/${newPosition}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function createCategory(name: string): Promise<Category[]> {
  try {
    const response = await api.post<ApiResponse<Category[]>>(
        `/api/v1/categories/${name}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function createChannel(categoryId: number, name: string, channel_type: string): Promise<Channel[]> {
  try {
    const allowedChannelTypes = ["text", "voice"];
    if (allowedChannelTypes.includes(channel_type)) {
      const response = await api.post<ApiResponse<Channel[]>>(
          `/api/v1/channels/${categoryId}/channel_name/${name}/${channel_type}`
      );
      return response.data.data;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function renameChannel(channelId: number, name: string): Promise<Channel[]> {
  try {
    const response = await api.patch<ApiResponse<Channel[]>>(
      `/api/v1/channels/${channelId}/rename/${name}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function renameCategory(channelId: number, name: string): Promise<Category[]> {
  try {
    const response = await api.patch<ApiResponse<Category[]>>(
      `/api/v1/categories/${channelId}/rename/${name}`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function getCategoryAccessRoles(categoryId: number): Promise<Role[]> {
  try {
    console.log(categoryId)
    const response = await api.get<ApiResponse<Role[]>>(
        `/api/v1/categories/${categoryId}/permissions`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function editCategoryPermissions(categoryId: number, rolesWithAccess: number[]): Promise<Role[]> {
  try {
    const response = await api.put<ApiResponse<Role[]>>(
      `/api/v1/categories/${categoryId}/permissions`,
      rolesWithAccess
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(axiosError.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

export async function getRoles(): Promise<Role[]> {
  try {
    const response = await api.get<ApiResponse<Role[]>>(
        `/api/v1/roles`
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      throw new ApiError(error.message, statusCode);
    } else if (error instanceof Error) {
      throw new ClientError(error.message);
    } else {
      throw new ClientError(`Something went wrong: ${String(error)}`);
    }
  }
}

