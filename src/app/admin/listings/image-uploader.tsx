"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { screenshotUrl } from "@/lib/storage";

/** Uploads listing screenshots to S3 (via our admin API route, which keeps the
 *  bucket private and the AWS secret server-side) and feeds the stored object
 *  keys to the form as hidden inputs, so the server action only sees keys. */
export function ImageUploader({ initialImages }: { initialImages: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Only files added in this session get deleted from S3 on remove; previously
  // saved photos stay until the listing is saved without them.
  const sessionUploads = useRef(new Set<string>());

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setUploading(true);

    for (const file of Array.from(fileList)) {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/screenshots", {
        method: "POST",
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Upload failed for ${file.name}.`);
        continue;
      }
      const { key } = await res.json();
      sessionUploads.current.add(key);
      setImages((current) => [...current, key]);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function removeImage(key: string) {
    setImages((current) => current.filter((image) => image !== key));
    if (sessionUploads.current.has(key)) {
      sessionUploads.current.delete(key);
      await fetch(`/api/admin/screenshots?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
    }
  }

  return (
    <div className="space-y-3">
      {images.map((key) => (
        <input key={key} type="hidden" name="images" value={key} />
      ))}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((key, index) => (
            <div
              key={key}
              className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={screenshotUrl(key)}
                alt={`Screenshot ${index + 1}`}
                fill
                sizes="160px"
                className="object-cover"
              />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-bold">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(key)}
                aria-label="Remove screenshot"
                className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-md bg-background/80 opacity-0 transition-opacity hover:bg-destructive group-hover:opacity-100"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
      >
        <ImagePlus data-slot="icon" aria-hidden="true" />
        {uploading ? "Uploading…" : "Add screenshots"}
      </Button>
      <p className="text-xs text-muted-foreground">
        First photo becomes the cover. JPG/PNG/WebP, up to 4 MB each.
      </p>
      {error && (
        <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
