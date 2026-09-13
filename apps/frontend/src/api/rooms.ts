import { apiFetch } from "./client";

export type Room = {
  id: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export function listRooms() {
  return apiFetch<{ success: boolean; rooms: Room[] }>("/api/v1/room/all");
}

export function createRoom(slug: string) {
  return apiFetch<{ success: boolean; roomId: string; message: string }>("/api/v1/room/create", {
    method: "POST",
    body: JSON.stringify({ slug }),
  });
}

export function getRoomBySlug(slug: string) {
  return apiFetch<{ success: boolean; room: Room }>(`/api/v1/room/${encodeURIComponent(slug)}`);
}
