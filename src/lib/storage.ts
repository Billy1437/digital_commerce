/** Public app URL for a listing screenshot stored in the private S3 bucket.
 *  Served through our own proxy route so the bucket stays private; safe to
 *  call from client and server (no secrets, just builds a path). */
export function screenshotUrl(key: string) {
  return `/api/screenshots/${key}`;
}
