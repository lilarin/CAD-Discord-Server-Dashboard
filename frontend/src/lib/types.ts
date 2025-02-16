export interface Category {
	id: number;
	name: string;
}

export interface Channel {
	id: number;
	position: number;
	name: string;
	type: string
}

export interface Role {
	id: number;
	name: string;
}

export interface RenameRequest {
	name: string;
}

export interface ReorderRequest {
	position: number;
}

export interface User {
	id: number;
	name: string;
	group?: string | null;
}

export interface Log {
	userName: string;
	userAvatar: string;
	action: string;
	createdAt: string
}

export interface Queue {
	channelId: string;
	messageId?: string | null;
	title: string;
	eventTime: string;
}