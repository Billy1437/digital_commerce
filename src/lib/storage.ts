/** Public URL for a file in the `screenshots` bucket. */
export function screenshotUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/screenshots/${path}`;
}
