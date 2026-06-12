"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { screenshotUrl } from "@/lib/storage";

/** Uploads listing screenshots straight to the public `screenshots` bucket
 *  (admin-only by RLS) and feeds the stored paths to the form as hidden
 *  inputs, so the server action only ever sees paths. */
export function ImageUploader({ initialImages }: { initialImages: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Only files added in this session are deleted from storage on remove;
  // previously saved photos stay until the listing is saved without them.
  const sessionUploads = useRef(new Set<string>());

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(fileList)) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is over 5 MB — compress it and retry.`);
        continue;
      }
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `listings/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("screenshots")
        .upload(path, file, { contentType: file.type || "image/jpeg" });
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        continue;
      }
      sessionUploads.current.add(path);
      setImages((current) => [...current, path]);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function removeImage(path: string) {
    setImages((current) => current.filter((image) => image !== path));
    if (sessionUploads.current.has(path)) {
      sessionUploads.current.delete(path);
      const supabase = createClient();
      await supabase.storage.from("screenshots").remove([path]);
    }
  }

  return (
    <div className="space-y-3">
      {images.map((path) => (
        <input key={path} type="hidden" name="images" value={path} />
      ))}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((path, index) => (
            <div
              key={path}
              className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={screenshotUrl(path)}
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
                onClick={() => removeImage(path)}
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
        accept="image/*"
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
        First photo becomes the cover. JPG/PNG, up to 5 MB each.
      </p>
      {error && (
        <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
