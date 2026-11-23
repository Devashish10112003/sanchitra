import { useEffect, useRef, useState } from "react";
import { IconLogout, IconMail, IconUser } from "@tabler/icons-react";
import type { AuthUser } from "../api/auth";

type UserMenuProps = {
  user: AuthUser;
  onLogout: () => void;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const avatar = (size: string, text: string) => (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#8b88f0] to-[#6965db] font-semibold text-white ${text}`}
    >
      {initials(user.username)}
    </span>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full p-0.5 transition-shadow ${
          open ? "ring-2 ring-[#6965db]/40" : "hover:ring-2 hover:ring-[#6965db]/20"
        }`}
      >
        {avatar("h-9 w-9", "text-sm")}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-30 w-72 overflow-hidden rounded-2xl border border-[#e0dfff] bg-white shadow-[0_12px_40px_rgba(105,101,219,0.2)]"
        >
          <div className="flex items-center gap-3 border-b border-[#efeefc] bg-[#fafaff] p-4">
            {avatar("h-12 w-12", "text-base")}
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#1e1e1e]">{user.username}</p>
              <p className="truncate text-xs text-[#6b6b6b]">{user.email}</p>
            </div>
          </div>

          <dl className="flex flex-col gap-2 p-4 text-sm">
            <div className="flex items-center gap-2 text-[#6b6b6b]">
              <IconUser className="h-4 w-4 shrink-0" />
              <dt className="sr-only">Username</dt>
              <dd className="truncate text-[#1e1e1e]">{user.username}</dd>
            </div>
            <div className="flex items-center gap-2 text-[#6b6b6b]">
              <IconMail className="h-4 w-4 shrink-0" />
              <dt className="sr-only">Email</dt>
              <dd className="truncate text-[#1e1e1e]">{user.email}</dd>
            </div>
          </dl>

          <div className="border-t border-[#efeefc] p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#e03131] hover:bg-[#fff0f0]"
            >
              <IconLogout className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
