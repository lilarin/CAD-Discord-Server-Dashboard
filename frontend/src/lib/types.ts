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
    user_name: string;
    user_avatar: string;
    action: string;
    created_at: string
}

export interface Queue {
    channel_id: string;
    message_id?: string | null;
    title: string;
    event_time: string;
}