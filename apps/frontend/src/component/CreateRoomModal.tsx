import { useEffect, useRef, useState } from "react";
import { IconLink, IconX } from "@tabler/icons-react";
import { createRoom } from "../api/rooms";
import { ApiError } from "../api/client";

const MIN_LEN = 3;
const MAX_LEN = 20;

type CreateRoomModalProps = {
  onClose: () => void;
  onCreated: (room: { id: string; slug: string }) => void;
};

/** Turn free text into a URL-friendly room slug. */
function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

export function CreateRoomModal({ onClose, onCreated }: CreateRoomModalProps) {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const slug = toSlug(name).slice(0, MAX_LEN);
  const isValid = slug.length >= MIN_LEN;
  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${slug || "your-room"}`;

  useEffect(() => {
    inputRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isCreating) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isCreating]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setError(null);
    setIsCreating(true);
    try {
      const res = await createRoom(slug);
      onCreated({ id: res.roomId, slug });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create room");
      setIsCreating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#1e1e1e]/30 px-4 backdrop-blur-[2px]"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && !isCreating) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-room-title"
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-[#e0dfff] bg-white shadow-[0_20px_60px_rgba(105,101,219,0.25)]"
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-2">
          <div>
            <h2 id="create-room-title" className="text-lg font-semibold text-[#1e1e1e]">
              Create a new room
            </h2>
            <p className="mt-1 text-sm text-[#6b6b6b]">
              A room is a shared canvas. Anyone with the link can join and draw with you.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={isCreating}
            className="rounded-lg p-1 text-[#6b6b6b] hover:bg-[#f5f5f9] disabled:opacity-50"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6 pt-4">
          <label className="flex flex-col gap-1.5">
            <span className="flex items-baseline justify-between text-sm font-medium text-[#1e1e1e]">
              Room name
              <span className={`text-xs font-normal ${slug.length >= MAX_LEN ? "text-[#e8590c]" : "text-[#9a9a9a]"}`}>
                {slug.length}/{MAX_LEN}
              </span>
            </span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Sprint planning"
              className="rounded-lg border border-[#e0dfff] px-3 py-2 text-sm outline-none focus:border-[#6965db] focus:ring-2 focus:ring-[#6965db]/20"
            />
            <span className="text-xs text-[#9a9a9a]">
              {MIN_LEN}–{MAX_LEN} characters. Letters, numbers and dashes only — spaces become dashes.
            </span>
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[#1e1e1e]">Share link</span>
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#e0dfff] bg-[#fafaff] px-3 py-2 text-xs text-[#6b6b6b]">
              <IconLink className="h-4 w-4 shrink-0 text-[#6965db]" />
              <span className="truncate font-mono">{shareUrl}</span>
            </div>
          </div>

          {error && <p className="rounded-lg bg-[#fff0f0] px-3 py-2 text-sm text-[#e03131]">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#efeefc] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[#1e1e1e] hover:bg-[#f5f5f9] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || isCreating}
            className="rounded-lg bg-[#6965db] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b57d1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Creating…" : "Create & open"}
          </button>
        </div>
      </form>
    </div>
  );
}
