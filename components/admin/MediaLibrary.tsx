"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./StudioUI";
const folders = [
  "all",
  "properties",
  "projects",
  "services",
  "editorial",
  "uploads",
];
export function ImageField({
  value,
  label,
  onChoose,
}: {
  value: string;
  label: string;
  onChoose: () => void;
}) {
  return (
    <div className="cms-image-field">
      <span>{label}</span>
      <button type="button" onClick={onChoose}>
        {value ? (
          <Image src={value} alt="" width={120} height={80} unoptimized />
        ) : (
          <span className="cms-image-placeholder">
            <Icon name="media" size={30} />
          </span>
        )}
        <span>
          <strong>{value ? "Change photograph" : "Choose photograph"}</strong>
          <small>
            {value
              ? value.split("/").pop()
              : "Find the right image in your library"}
          </small>
        </span>
        <Icon name="external" size={19} />
      </button>
    </div>
  );
}
export function MediaGrid({
  media,
  onUpload,
  onSelect,
  current,
}: {
  media: string[];
  onUpload: (src: string) => void;
  onSelect?: (src: string) => void;
  current?: string;
}) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [folder, setFolder] = useState("all");
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState("");
  async function upload(file: File) {
    if (uploading) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      onUpload(result.src);
      if (onSelect) onSelect(result.src);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setUploading(false);
    }
  }
  const filtered = media.filter(
    (src) =>
      (folder === "all" || src.includes(`/${folder}/`)) &&
      src.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div
      className={`cms-media-library ${dragging ? "is-dragging" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (event.dataTransfer.files[0])
          void upload(event.dataTransfer.files[0]);
      }}
    >
      <div className="cms-media-toolbar">
        <label className="cms-search">
          <Icon name="search" size={18} />
          <span className="sr-only">Search photographs</span>
          <input
            type="search"
            placeholder="Find a photograph…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label
          className={`cms-button cms-primary cms-upload ${uploading ? "disabled" : ""}`}
        >
          <Icon name="upload" size={18} />
          {uploading ? "Uploading…" : "Upload photograph"}
          <input
            aria-label="Upload photograph"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      <div className="cms-media-folders" aria-label="Photo folders">
        {folders
          .filter(
            (f) => f === "all" || media.some((src) => src.includes(`/${f}/`)),
          )
          .map((f) => (
            <button
              key={f}
              aria-pressed={folder === f}
              className={folder === f ? "active" : ""}
              onClick={() => setFolder(f)}
            >
              {f === "all"
                ? "All photographs"
                : f.charAt(0).toUpperCase() + f.slice(1)}
              <span>
                {f === "all"
                  ? media.length
                  : media.filter((src) => src.includes(`/${f}/`)).length}
              </span>
            </button>
          ))}
      </div>
      <div className="cms-media-info">
        <span>
          {filtered.length} photograph{filtered.length === 1 ? "" : "s"}
        </span>
        <span>Drag & drop to upload · JPG, PNG, WebP · max 8 MB</span>
      </div>
      {error && (
        <p role="alert" className="cms-error">
          <Icon name="warning" />
          {error}
        </p>
      )}
      <div className="cms-media-grid">
        {filtered.map((src) => (
          <article
            key={src}
            className={`cms-media-card ${src === current ? "is-selected" : ""}`}
          >
            <div className="cms-media-photo">
              <Image
                src={src}
                alt={src.split("/").pop()!.replace(/[-_]/g, " ")}
                fill
                sizes="(max-width: 600px) 45vw, 260px"
                unoptimized
              />
              <span className="cms-media-format">
                {src.split(".").pop()?.toUpperCase()}
              </span>
              {src === current && (
                <span className="cms-media-selected">
                  <Icon name="check" size={17} />
                </span>
              )}
              <button
                className="cms-media-photo-action"
                onClick={() =>
                  onSelect
                    ? onSelect(src)
                    : void navigator.clipboard
                        .writeText(src)
                        .then(() => setCopied(src))
                        .catch(() => setError(`Image path: ${src}`))
                }
              >
                {onSelect
                  ? "Use photograph"
                  : copied === src
                    ? "Path copied"
                    : "Copy image path"}
                <Icon name={onSelect ? "plus" : "copy"} size={16} />
              </button>
            </div>
            <div className="cms-media-card-meta">
              <p title={src}>{src.split("/").pop()}</p>
              <small>
                {src.split("/")[2]} / {src.split(".").pop()?.toUpperCase()}
              </small>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <div className="cms-empty">
          <Icon name="media" size={32} />
          <h3>No photographs found</h3>
          <p>
            {query
              ? "Try another name or choose a different folder."
              : "Upload your first photograph to get started."}
          </p>
          {(query || folder !== "all") && (
            <button
              className="cms-button"
              onClick={() => {
                setQuery("");
                setFolder("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
      {dragging && (
        <div className="cms-drop-overlay">
          <Icon name="upload" size={42} />
          <strong>Drop your next great photograph.</strong>
          <span>One image at a time · up to 8 MB</span>
        </div>
      )}
    </div>
  );
}
export function MediaPicker({
  media,
  current,
  onClose,
  onSelect,
  onUpload,
}: {
  media: string[];
  current: string;
  onClose: () => void;
  onSelect: (src: string) => void;
  onUpload: (src: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="cms-media-dialog"
      aria-labelledby="cms-media-title"
      onCancel={onClose}
    >
      <div className="cms-dialog-heading">
        <div>
          <span className="cms-overline">THE IMAGE MAKES THE DIFFERENCE</span>
          <h2 id="cms-media-title">
            Find the right perspective<span>.</span>
          </h2>
          <p>Choose from your library or upload something new.</p>
        </div>
        <button
          className="cms-icon-button"
          aria-label="Close media library"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <MediaGrid
        media={media}
        current={current}
        onSelect={onSelect}
        onUpload={onUpload}
      />
    </dialog>
  );
}
