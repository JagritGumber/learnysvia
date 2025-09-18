import api from "./api";

// Import Drizzle types from backend
import type {
  SelectRoom,
  SelectRoomParticipant,
  SelectRoomSettings,
  InsertRoom,
  InsertRoomSettings,
} from "../../../backend/src/database/schemas";

export type Room = SelectRoom;
export type RoomParticipant = SelectRoomParticipant & {
  userName: string | null;
  userEmail: string | null;
};
export type RoomSettings = SelectRoomSettings;

export type CreateRoomData = Omit<
  InsertRoom,
  "id" | "code" | "createdBy" | "createdAt" | "updatedAt"
>;
export type UpdateRoomData = Partial<
  Omit<InsertRoom, "id" | "code" | "createdBy" | "createdAt" | "updatedAt">
>;
export type RoomSettingsData = Partial<
  Omit<InsertRoomSettings, "id" | "roomId">
>;

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
  async joinRoom(code: string): Promise<{ success: boolean; message: string; room: Room }> {
    const response = await api.post(`/api/rooms/${code}/join`);
    return response.data;
  },

  // Get room participants
  async getRoomParticipants(
    id: string
  ): Promise<{ participants: RoomParticipant[] }> {
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
