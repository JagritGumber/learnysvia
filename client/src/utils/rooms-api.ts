import api from "./api";

export interface Room {
  id: string;
  code: string;
  name: string;
  description?: string;
  isPublic: boolean;
  maxParticipants: number;
  allowAnonymous: boolean;
  expiresAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomParticipant {
  id: string;
  roomId: string;
  userId?: string;
  displayName?: string;
  role: "owner" | "authenticated" | "anonymous";
  joinedAt: string;
}

export interface RoomSettings {
  id: string;
  roomId: string;
  allowChat: boolean;
  allowFileSharing: boolean;
  requireApproval: boolean;
  customSettings?: any;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  isPublic?: boolean;
  maxParticipants?: number;
  allowAnonymous?: boolean;
  expiresAt?: Date;
}

export interface UpdateRoomData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  maxParticipants?: number;
  allowAnonymous?: boolean;
  expiresAt?: Date;
}

export interface RoomSettingsData {
  allowChat?: boolean;
  allowFileSharing?: boolean;
  requireApproval?: boolean;
  customSettings?: any;
}

export interface JoinRoomData {
  displayName?: string;
}

export const roomsApi = {
  // Get user's rooms
  async getRooms(): Promise<Room[]> {
    const response = await api.get("/api/rooms");
    return response.data.rooms;
  },

  // Create room
  async createRoom(data: CreateRoomData): Promise<{
    room: Room;
    code: string;
    shareUrl: string;
  }> {
    const response = await api.post("/api/rooms", data);
    return response.data;
  },

  // Get room by ID
  async getRoom(id: string): Promise<{
    room: Room;
    settings: RoomSettings | null;
    participants: RoomParticipant[];
    participantCount: number;
  }> {
    const response = await api.get(`/api/rooms/${id}`);
    return response.data;
  },

  // Update room
  async updateRoom(id: string, data: UpdateRoomData): Promise<{ room: Room }> {
    const response = await api.put(`/api/rooms/${id}`, data);
    return response.data;
  },

  // Delete room
  async deleteRoom(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/rooms/${id}`);
    return response.data;
  },

  // Join room by code
  async joinRoom(
    code: string,
    data?: JoinRoomData
  ): Promise<{ success: boolean; message: string; room: Room }> {
    const response = await api.post(`/api/rooms/${code}/join`, data);
    return response.data;
  },

  // Get room participants
  async getRoomParticipants(id: string): Promise<{ participants: RoomParticipant[] }> {
    const response = await api.get(`/api/rooms/${id}/participants`);
    return response.data;
  },

  // Update room settings
  async updateRoomSettings(
    id: string,
    data: RoomSettingsData
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/api/rooms/${id}/settings`, data);
    return response.data;
  },
};
