import axios, {AxiosError, AxiosResponse} from 'axios';
import {Category, Channel, Role, User} from "@/lib/types.ts";

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
	code: number;

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


interface ApiResponse<T> {
	data: T;
	success: boolean;
	error: string | null;
}

async function handleRequest<T>(apiCall: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
	try {
		const response = await apiCall;
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


export async function getCategories(): Promise<Category[]> {
	return handleRequest(api.get<ApiResponse<Category[]>>('/api/v1/categories'));
}

export async function getChannels(categoryId: number): Promise<Channel[]> {
	return handleRequest(api.get<ApiResponse<Channel[]>>(`/api/v1/channels/${categoryId}`));
}

export async function deleteCategory(categoryId: number): Promise<Category[]> {
	return handleRequest(api.delete<ApiResponse<Category[]>>(`/api/v1/categories/${categoryId}`));
}

export async function deleteChannel(channelId: number): Promise<Channel[]> {
	return handleRequest(api.delete<ApiResponse<Channel[]>>(`/api/v1/channels/${channelId}`));
}

export async function updateCategoryPosition(categoryId: number, newPosition: number): Promise<Category[]> {
	return handleRequest(api.patch<ApiResponse<Category[]>>(`/api/v1/categories/${categoryId}/position/${newPosition}`));
}

export async function updateChannelPosition(channelId: number, newPosition: number): Promise<Channel[]> {
	return handleRequest(api.patch<ApiResponse<Channel[]>>(`/api/v1/channels/${channelId}/position/${newPosition}`));
}

export async function createCategory(name: string): Promise<Category[]> {
	return handleRequest(api.post<ApiResponse<Category[]>>(`/api/v1/categories/${name}`));
}

export async function createChannel(categoryId: number, name: string, channel_type: string): Promise<Channel[]> {
	const allowedChannelTypes = ["text", "voice"];
	if (allowedChannelTypes.includes(channel_type)) {
		return handleRequest(api.post<ApiResponse<Channel[]>>(`/api/v1/channels/${categoryId}/channel_name/${name}/${channel_type}`));
	}
	return Promise.reject(new ClientError('Invalid channel type'));
}

export async function renameChannel(channelId: number, name: string): Promise<Channel[]> {
	return handleRequest(api.patch<ApiResponse<Channel[]>>(`/api/v1/channels/${channelId}/rename/${name}`));
}

export async function renameCategory(channelId: number, name: string): Promise<Category[]> {
	return handleRequest(api.patch<ApiResponse<Category[]>>(`/api/v1/categories/${channelId}/rename/${name}`));
}

export async function getCategoryAccessRoles(categoryId: number): Promise<Role[]> {
	return handleRequest(api.get<ApiResponse<Role[]>>(`/api/v1/categories/${categoryId}/permissions`));
}

export async function editCategoryPermissions(categoryId: number, rolesWithAccess: number[]): Promise<Role[]> {
	return handleRequest(api.put<ApiResponse<Role[]>>(`/api/v1/categories/${categoryId}/permissions`, rolesWithAccess));
}

export async function getAllRoles(): Promise<Role[]> {
	return handleRequest(api.get<ApiResponse<Role[]>>(`/api/v1/roles`));
}

export async function getEditableRoles(): Promise<Role[]> {
	return handleRequest(api.get<ApiResponse<Role[]>>(`/api/v1/roles/editable`));
}

export async function createRole(name: string): Promise<Role[]> {
	return handleRequest(api.post<ApiResponse<Role[]>>(`/api/v1/roles/${name}`));
}

export async function renameRole(roleId: number, name: string): Promise<Role[]> {
	return handleRequest(api.patch<ApiResponse<Role[]>>(`/api/v1/roles/${roleId}/rename/${name}`));
}

export async function deleteRole(roleId: number): Promise<Role[]> {
	return handleRequest(api.delete<ApiResponse<Role[]>>(`/api/v1/roles/${roleId}`));
}

export async function getUsers(): Promise<User[]> {
	return handleRequest(api.get<ApiResponse<User[]>>(`/api/v1/users`));
}

export async function renameUser(userId: number, name: string): Promise<User[]> {
	return handleRequest(api.patch<ApiResponse<User[]>>(`/api/v1/users/${userId}/rename/${name}`));
}

export async function kickUser(userId: number): Promise<User[]> {
	return handleRequest(api.delete<ApiResponse<User[]>>(`/api/v1/users/${userId}`));
}

export async function getUserRoles(userId: number): Promise<Role[]> {
	return handleRequest(api.get<ApiResponse<Role[]>>(`/api/v1/users/${userId}`));
}

export async function editUserRoles(userId: number, roles: number[]): Promise<User[]> {
	return handleRequest(api.put<ApiResponse<User[]>>(`/api/v1/users/${userId}/`, roles));
}
