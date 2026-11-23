import { useEffect, useMemo, useState } from "react";
import { IconPlus, IconSearch, IconUsers, IconCrown } from "@tabler/icons-react";
import { listRooms, type Room } from "../api/rooms";
import { ApiError } from "../api/client";
import type { AuthUser } from "../api/auth";
import { dotGridStyle } from "../theme";
import { UserMenu } from "../component/UserMenu";
import { CreateRoomModal } from "../component/CreateRoomModal";

type RoomListProps = {
  user: AuthUser;
  onSelectRoom: (room: { id: string; slug: string }) => void;
  onLogout: () => void;
};

type Filter = "all" | "owned" | "shared";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "owned", label: "Created by me" },
  { key: "shared", label: "Shared with me" },
];

const THUMB_COLORS = ["#6965db", "#e8590c", "#2f9e44", "#1971c2", "#c2255c", "#f08c00"];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function timeAgo(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, "y"],
    [60 * 60 * 24 * 30, "mo"],
    [60 * 60 * 24 * 7, "w"],
    [60 * 60 * 24, "d"],
    [60 * 60, "h"],
    [60, "m"],
  ];
  for (const [size, label] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)}${label} ago`;
  }
  return "just now";
}

/** Decorative, deterministic doodle so each room card is recognisable at a glance. */
function RoomThumbnail({ seed }: { seed: string }) {
  const h = hash(seed);
  const color = THUMB_COLORS[h % THUMB_COLORS.length];
  const accent = THUMB_COLORS[(h >> 3) % THUMB_COLORS.length];
  const variant = h % 3;

  return (
    <svg viewBox="0 0 200 110" className="h-full w-full" aria-hidden="true">
      {variant === 0 && (
        <>
          <rect x="24" y="22" width="62" height="40" rx="6" fill={`${color}18`} stroke={color} strokeWidth="2" />
          <ellipse cx="148" cy="72" rx="30" ry="20" fill={`${accent}18`} stroke={accent} strokeWidth="2" />
          <path d="M88 44 C 110 44, 112 66, 116 68" fill="none" stroke="#1e1e1e" strokeWidth="1.6" />
          <path d="M110 62 l7 7 l2 -9" fill="none" stroke="#1e1e1e" strokeWidth="1.6" />
        </>
      )}
      {variant === 1 && (
        <>
          <path d="M60 18 L92 48 L60 78 L28 48 Z" fill={`${color}18`} stroke={color} strokeWidth="2" />
          <rect x="116" y="30" width="62" height="38" rx="6" fill={`${accent}18`} stroke={accent} strokeWidth="2" />
          <path d="M94 48 L114 48" stroke="#1e1e1e" strokeWidth="1.6" />
          <path d="M36 92 q 30 -12 60 0 t 70 -4" fill="none" stroke={color} strokeWidth="1.6" />
        </>
      )}
      {variant === 2 && (
        <>
          <ellipse cx="56" cy="50" rx="30" ry="24" fill={`${color}18`} stroke={color} strokeWidth="2" />
          <path
            d="M104 80 q 10 -40 30 -30 t 34 -24"
            fill="none"
            stroke={accent}
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <rect x="120" y="70" width="52" height="22" rx="4" fill="none" stroke="#1e1e1e" strokeWidth="1.4" strokeDasharray="4 3" />
        </>
      )}
    </svg>
  );
}

export function RoomList({ user, onSelectRoom, onLogout }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    listRooms()
      .then((res) => setRooms(res.rooms))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load rooms"));
  }, []);

  const visibleRooms = useMemo(() => {
    if (!rooms) return [];
    const q = query.trim().toLowerCase();
    return rooms
      .filter((r) => (filter === "owned" ? r.ownerId === user.id : filter === "shared" ? r.ownerId !== user.id : true))
      .filter((r) => !q || r.slug.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [rooms, query, filter, user.id]);

  const hasRooms = rooms !== null && rooms.length > 0;

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={dotGridStyle}>
      <header className="sticky top-0 z-20 border-b border-[#e0dfff]/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <h1 className="text-3xl text-[#6965db]" style={{ fontFamily: "'Caveat', cursive" }}>
            sanchitra
          </h1>
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#1e1e1e]">Your rooms</h2>
            <p className="mt-1 text-sm text-[#6b6b6b]">
              {rooms === null ? " " : `${rooms.length} ${rooms.length === 1 ? "room" : "rooms"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#6965db] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(105,101,219,0.35)] hover:bg-[#5b57d1]"
          >
            <IconPlus className="h-4 w-4" stroke={2.5} />
            New room
          </button>
        </div>

        {hasRooms && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-xl border border-[#e0dfff] bg-white p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    filter === f.key ? "bg-[#e0dfff] text-[#4a47b1]" : "text-[#6b6b6b] hover:text-[#1e1e1e]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="flex w-full items-center gap-2 rounded-xl border border-[#e0dfff] bg-white px-3 py-2 focus-within:border-[#6965db] focus-within:ring-2 focus-within:ring-[#6965db]/20 sm:w-64">
              <IconSearch className="h-4 w-4 text-[#9a9a9a]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rooms"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          </div>
        )}

        {error && <p className="rounded-lg bg-[#fff0f0] px-4 py-3 text-sm text-[#e03131]">{error}</p>}

        {!error && rooms === null && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-2xl border border-[#e0dfff] bg-white/70" />
            ))}
          </div>
        )}

        {rooms !== null && rooms.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#c9c7f5] bg-white/70 px-6 py-16 text-center">
            <div className="h-24 w-44">
              <RoomThumbnail seed="empty" />
            </div>
            <p className="font-medium text-[#1e1e1e]">No rooms yet</p>
            <p className="max-w-xs text-sm text-[#6b6b6b]">
              Create a room to start sketching, then share the link to draw together in real time.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-2 flex items-center gap-1.5 rounded-xl bg-[#6965db] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b57d1]"
            >
              <IconPlus className="h-4 w-4" stroke={2.5} />
              Create your first room
            </button>
          </div>
        )}

        {hasRooms && visibleRooms.length === 0 && (
          <p className="py-10 text-center text-sm text-[#6b6b6b]">No rooms match your search.</p>
        )}

        {visibleRooms.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRooms.map((room) => {
              const isOwner = room.ownerId === user.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => onSelectRoom(room)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#e0dfff] bg-white text-left shadow-[0_2px_12px_rgba(105,101,219,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#c9c7f5] hover:shadow-[0_8px_28px_rgba(105,101,219,0.2)]"
                >
                  <div className="h-32 border-b border-[#efeefc] bg-[#fafaff]" style={dotGridStyle}>
                    <RoomThumbnail seed={room.id} />
                  </div>
                  <div className="flex flex-col gap-2 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-[#1e1e1e]">{room.slug}</span>
                      <span className="text-sm font-medium text-[#6965db] opacity-0 transition-opacity group-hover:opacity-100">
                        Open →
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#6b6b6b]">
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                          isOwner ? "bg-[#f0efff] text-[#4a47b1]" : "bg-[#ebfbee] text-[#2b8a3e]"
                        }`}
                      >
                        {isOwner ? <IconCrown className="h-3 w-3" /> : <IconUsers className="h-3 w-3" />}
                        {isOwner ? "Owner" : "Shared"}
                      </span>
                      <span>Edited {timeAgo(room.updatedAt)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {isCreateOpen && (
        <CreateRoomModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(room) => {
            setIsCreateOpen(false);
            onSelectRoom(room);
          }}
        />
      )}
    </div>
  );
}
