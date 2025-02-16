import axios, {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {Category, Channel, Log, Queue, RenameRequest, ReorderRequest, Role, User} from "@/lib/types.ts";
import {supabase} from "@/lib/supabaseClient";

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


api.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		const session = await supabase.auth.getSession();
		const token = session.data?.session?.access_token;

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);


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

export async function getChannels(categoryId: string): Promise<Channel[]> {
	return handleRequest(api.get<ApiResponse<Channel[]>>(`/api/v1/channels/${categoryId}`));
}

export async function deleteCategory(categoryId: string): Promise<Category[]> {
	return handleRequest(api.delete<ApiResponse<Category[]>>(`/api/v1/categories/${categoryId}`, {
		headers: {
			'X-Request-Source-Method': encodeURI('Видалення категорії')
		}
	}));
}

export async function deleteChannel(channelId: string): Promise<Channel[]> {
	return handleRequest(api.delete<ApiResponse<Channel[]>>(`/api/v1/channels/${channelId}`, {
		headers: {
			'X-Request-Source-Method': encodeURI('Видалення каналу')
		}
	}));
}

export async function updateCategoryPosition(categoryId: string, position: number): Promise<Category[]> {
	const requestBody: ReorderRequest = {position};
	return handleRequest(api.patch<ApiResponse<Category[]>>(`/api/v1/categories/${categoryId}/reorder`, requestBody, {
		headers: {
			'X-Request-Source-Method': encodeURI('Зміна позиції категорії')
		}
	}));
}

export async function updateChannelPosition(channelId: string, position: number): Promise<Channel[]> {
	const requestBody: ReorderRequest = {position};
	return handleRequest(api.patch<ApiResponse<Channel[]>>(`/api/v1/channels/${channelId}/reorder`, requestBody, {
		headers: {
			'X-Request-Source-Method': encodeURI('Зміна позиції каналу')
		}
	}));
}

export async function createCategory(name: string): Promise<Category[]> {
	return handleRequest(api.post<ApiResponse<Category[]>>(`/api/v1/categories/${name}`, {}, {
		headers: {
			'X-Request-Source-Method': encodeURI('Створення категорії')
		}
	}));
}

export async function createChannel(categoryId: string, name: string, channel_type: string): Promise<Channel[]> {
	const allowedChannelTypes = ["text", "voice"];
	if (allowedChannelTypes.includes(channel_type)) {
		const requestBody: RenameRequest = {name};
		return handleRequest(api.post<ApiResponse<Channel[]>>(`/api/v1/channels/${categoryId}/${channel_type}`, requestBody, {
			headers: {
				'X-Request-Source-Method': encodeURI('Створення каналу')
			}
		}));
	}
	return Promise.reject(new ClientError('Invalid channel type'));
}

export async function renameChannel(channelId: string, name: string): Promise<Channel[]> {
	const requestBody: RenameRequest = {name};
	return handleRequest(api.patch<ApiResponse<Channel[]>>(`/api/v1/channels/${channelId}`, requestBody, {
		headers: {
			'X-Request-Source-Method': encodeURI('Перейменування каналу')
		}
	}));
}

export async function renameCategory(categoryId: string, name: string): Promise<Category[]> {
	const requestBody: RenameRequest = {name};
	return handleRequest(api.patch<ApiResponse<Category[]>>(`/api/v1/categories/${categoryId}`, requestBody, {
		headers: {
			'X-Request-Source-Method': encodeURI('Перейменування категорії')
		}
	}));
}

export async function getCategoryAccessRoles(categoryId: string): Promise<Role[]> {
	return handleRequest(api.get<ApiResponse<Role[]>>(`/api/v1/categories/${categoryId}/permissions`));
}

export async function editCategoryPermissions(categoryId: string, rolesWithAccess: number[]): Promise<Role[]> {
	return handleRequest(api.put<ApiResponse<Role[]>>(`/api/v1/categories/${categoryId}/permissions`, rolesWithAccess, {
		headers: {
			'X-Request-Source-Method': encodeURI('Зміна доступу до категорії')
		}
	}));
}

export async function getAllRoles(): Promise<Role[]> {
	return handleRequest(api.get<ApiResponse<Role[]>>(`/api/v1/roles`));
}

export async function getEditableRoles(): Promise<Role[]> {
	return handleRequest(api.get<ApiResponse<Role[]>>(`/api/v1/roles/editable`));
}

export async function createRole(name: string): Promise<Role[]> {
	return handleRequest(api.post<ApiResponse<Role[]>>(`/api/v1/roles/${name}`, {}, {
		headers: {
			'X-Request-Source-Method': encodeURI('Створення ролі')
		}
	}));
}

export async function renameRole(roleId: string, name: string): Promise<Role[]> {
	const requestBody: RenameRequest = {name};
	return handleRequest(
		api.patch<ApiResponse<Role[]>>(`/api/v1/roles/${roleId}`, requestBody, {
			headers: {
				'X-Request-Source-Method': encodeURI('Перейменування ролі')
			}
		}));
}

export async function deleteRole(roleId: string): Promise<Role[]> {
	return handleRequest(api.delete<ApiResponse<Role[]>>(`/api/v1/roles/${roleId}`, {
		headers: {
			'X-Request-Source-Method': encodeURI('Видалення ролі')
		}
	}));
}

export async function getUsers(): Promise<User[]> {
	return handleRequest(api.get<ApiResponse<User[]>>(`/api/v1/users`));
}

export async function renameUser(userId: string, name: string): Promise<User[]> {
	const requestBody: RenameRequest = {name};
	return handleRequest(api.patch<ApiResponse<User[]>>(`/api/v1/users/${userId}`, requestBody, {
		headers: {
			'X-Request-Source-Method': encodeURI('Перейменування користувача')
		}
	}));
}

export async function kickUser(userId: string): Promise<User[]> {
	return handleRequest(api.delete<ApiResponse<User[]>>(`/api/v1/users/${userId}`, {
		headers: {
			'X-Request-Source-Method': encodeURI('Вигон користувача з серверу')
		}
	}));
}

export async function getUserRoles(userId: string): Promise<Role[]> {
	return handleRequest(api.get<ApiResponse<Role[]>>(`/api/v1/users/${userId}/roles`));
}

export async function getUser(userId: string): Promise<User> {
	return handleRequest(api.get<ApiResponse<User>>(`/api/v1/users/${userId}`));
}

export async function editUserRoles(userId: string, roles: number[]): Promise<User[]> {
	return handleRequest(api.put<ApiResponse<User[]>>(`/api/v1/users/${userId}`, roles, {
		headers: {
			'X-Request-Source-Method': encodeURI('Зміна ролей користувача')
		}
	}));
}

export async function getLogs(): Promise<Log[]> {
	return handleRequest(api.get<ApiResponse<Log[]>>('/api/v1/logs'));
}

export async function createQueueMessage(channelId: string, title: string, eventTime: string): Promise<void> {
	const requestBody: Queue = {channelId, title, eventTime};
	return handleRequest(api.post<ApiResponse<void>>('/queue', requestBody));
}
