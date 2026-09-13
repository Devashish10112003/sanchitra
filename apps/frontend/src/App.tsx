import { useEffect, useState } from "react";
import Canvas from "./canvas/Canvas";
import { Toolbar } from "./component/Toolbar";
import { PropertiesPanel } from "./component/PropertiesPanel";
import type { ElementTypeSchema } from "@repo/schemas/types";
import { DEFAULT_STYLE, type ElementStyle } from "./canvas/style";
import { Login } from "./pages/Login";
import { RoomList } from "./pages/RoomList";
import { getMe, logout, type AuthUser } from "./api/auth";
import { getRoomBySlug } from "./api/rooms";
import { ApiError } from "./api/client";
import { IconCheck, IconLink } from "@tabler/icons-react";

type Status = "loading" | "anon" | "authed";
type SelectedRoom = { id: string; slug: string };

function readRoomSlugFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("room");
}

function App() {
  const [activeTool, setActiveTool] = useState<ElementTypeSchema>("rect");
  const [style, setStyle] = useState<ElementStyle>(DEFAULT_STYLE);
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [room, setRoom] = useState<SelectedRoom | null>(null);
  const [roomLoadError, setRoomLoadError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    getMe()
      .then((res) => {
        setUser(res.user);
        setStatus("authed");
      })
      .catch(() => setStatus("anon"));
  }, []);

  useEffect(() => {
    if (status !== "authed" || room) return;
    const slug = readRoomSlugFromUrl();
    if (!slug) return;

    getRoomBySlug(slug)
      .then((res) => setRoom({ id: res.room.id, slug: res.room.slug }))
      .catch((err) => {
        setRoomLoadError(err instanceof ApiError ? err.message : "Room not found");
        window.history.replaceState({}, "", window.location.pathname);
      });
  }, [status, room]);

  function updateStyle(patch: Partial<ElementStyle>) {
    setStyle((prev) => ({ ...prev, ...patch }));
  }

  function handleSelectRoom(selected: SelectedRoom) {
    setRoomLoadError(null);
    setRoom(selected);
    window.history.pushState({}, "", `?room=${encodeURIComponent(selected.slug)}`);
  }

  async function handleShare(slug: string) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(slug)}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      window.prompt("Copy this link to invite someone:", shareUrl);
      return;
    }

    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  }

  function handleBackToRooms() {
    setRoom(null);
    window.history.pushState({}, "", window.location.pathname);
  }

  async function handleLogout() {
    await logout().catch(() => {});
    setUser(null);
    setRoom(null);
    setStatus("anon");
    window.history.pushState({}, "", window.location.pathname);
  }

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-[#6b6b6b]">Loading…</div>;
  }

  if (status === "anon" || !user) {
    return (
      <Login
        onAuthenticated={(authedUser) => {
          setUser(authedUser);
          setStatus("authed");
        }}
      />
    );
  }

  if (!room) {
    return (
      <>
        {roomLoadError && (
          <div className="fixed left-1/2 top-4 z-20 -translate-x-1/2 rounded-lg bg-[#fff0f0] px-4 py-2 text-sm text-[#e03131] shadow">
            {roomLoadError}
          </div>
        )}
        <RoomList user={user} onSelectRoom={handleSelectRoom} onLogout={handleLogout} />
      </>
    );
  }

  return (
    <>
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-2xl border border-[#e0dfff] bg-white p-1.5 shadow-[0_4px_16px_rgba(105,101,219,0.18)]">
        <button
          type="button"
          className="flex h-9 items-center rounded-xl px-3 text-sm font-medium text-[#1e1e1e] hover:bg-[#f5f5f9]"
          onClick={handleBackToRooms}
        >
          ← Rooms
        </button>
        <span className="h-5 w-px bg-[#e0dfff]" />
        <span className="px-2 text-sm text-[#6b6b6b]">{room.slug}</span>
        <span className="h-5 w-px bg-[#e0dfff]" />
        <button
          type="button"
          onClick={() => handleShare(room.slug)}
          className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-[#6965db] hover:bg-[#f5f5f9]"
        >
          {linkCopied ? (
            <>
              <IconCheck className="h-4 w-4" /> Copied!
            </>
          ) : (
            <>
              <IconLink className="h-4 w-4" /> Share
            </>
          )}
        </button>
      </div>
      <Toolbar activeTool={activeTool} onSelectTool={setActiveTool} />
      <PropertiesPanel tool={activeTool} style={style} onChange={updateStyle} />
      <Canvas activeTool={activeTool} style={style} roomId={room.id} userId={user.id} />
    </>
  );
}

export default App;
