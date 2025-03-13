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