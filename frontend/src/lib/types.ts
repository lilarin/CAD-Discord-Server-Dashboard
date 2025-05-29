export type Category = {
	id: number;
	name: string;
}

export type Channel = {
	id: number;
	position: number;
	name: string;
	type: string
}

export type Role = {
	id: number;
	name: string;
}

export type NameRequest = {
	name: string;
}

export type ReorderRequest = {
	position: number;
}

export type User = {
	id: number;
	name: string;
	group?: string | null;
	is_admin?: boolean | null;
}

export type Log = {
	user_name: string;
	user_avatar: string;
	action: string;
	event_time: string
}

export type Queue = {
	channel_id: string;
	message_id?: string | null;
	title: string;
	event_time: string;
}

export interface ServerConfig {
    language: string | null;
    registration: {
        channel_id: string | null;
        message_id: string | null;
    };
    staff: {
        category_id: string | null;
        channel_id: string | null;
        message_id: string | null;
    };
}

export interface LanguageRequest {
    language: "en" | "uk";
}

export interface RegistrationRequest {
    channel_id?: string;
}

export interface StaffCategoryRequest {
    category_id?: string;
}