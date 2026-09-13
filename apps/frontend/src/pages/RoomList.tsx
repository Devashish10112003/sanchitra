import { useEffect, useState } from "react";
import { createRoom, listRooms, type Room } from "../api/rooms";
import { ApiError } from "../api/client";
import type { AuthUser } from "../api/auth";
import { dotGridStyle } from "../theme";

type RoomListProps = {
  user: AuthUser;
  onSelectRoom: (room: { id: string; slug: string }) => void;
  onLogout: () => void;
};

export function RoomList({ user, onSelectRoom, onLogout }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    listRooms()
      .then((res) => setRooms(res.rooms))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load rooms"));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      const res = await createRoom(newSlug);
      onSelectRoom({ id: res.roomId, slug: newSlug });
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "Failed to create room");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={dotGridStyle}>
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
        <header className="flex items-center justify-between">
          <h1 className="text-4xl text-[#6965db]" style={{ fontFamily: "'Caveat', cursive" }}>
            sanchitra
          </h1>
          <div className="flex items-center gap-3 text-sm text-[#6b6b6b]">
            <span>{user.username}</span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-[#e0dfff] bg-white px-3 py-1.5 font-medium text-[#1e1e1e] hover:bg-[#f5f5f9]"
            >
              Log out
            </button>
          </div>
        </header>

        <form
          onSubmit={handleCreate}
          className="flex items-start gap-2 rounded-2xl border border-[#e0dfff] bg-white p-4 shadow-[0_4px_24px_rgba(105,101,219,0.1)]"
        >
          <div className="flex flex-1 flex-col gap-1">
            <input
              type="text"
              required
              minLength={3}
              maxLength={20}
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="new-room-name"
              className="rounded-lg border border-[#e0dfff] px-3 py-2 text-sm outline-none focus:border-[#6965db] focus:ring-2 focus:ring-[#6965db]/20"
            />
            {createError && <p className="text-xs text-[#e03131]">{createError}</p>}
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-lg bg-[#6965db] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b57d1] disabled:opacity-60"
          >
            + New room
          </button>
        </form>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-[#6b6b6b]">Your rooms</h2>

          {error && <p className="text-sm text-[#e03131]">{error}</p>}
          {!error && rooms === null && <p className="text-sm text-[#6b6b6b]">Loading rooms…</p>}
          {rooms !== null && rooms.length === 0 && (
            <p className="text-sm text-[#6b6b6b]">No rooms yet — create one above to get started.</p>
          )}

          {rooms?.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelectRoom(room)}
              className="flex items-center justify-between rounded-2xl border border-[#e0dfff] bg-white px-5 py-4 text-left shadow-[0_2px_12px_rgba(105,101,219,0.08)] transition-shadow hover:shadow-[0_4px_20px_rgba(105,101,219,0.18)]"
            >
              <span className="font-medium text-[#1e1e1e]">{room.slug}</span>
              <span className="text-sm font-medium text-[#6965db]">Open →</span>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}
