import "server-only";
import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const bucket = process.env.S3_BUCKET!;
export const SCREENSHOTS_PREFIX = process.env.S3_SCREENSHOTS_PREFIX ?? "accounts_screenshots/";

const s3 = new S3Client({ region: process.env.AWS_REGION });

/** Guards the proxy/delete routes against fetching keys outside our prefix. */
export function isScreenshotKey(key: string) {
  return (
    key.startsWith(SCREENSHOTS_PREFIX) &&
    !key.includes("..") &&
    key.length > SCREENSHOTS_PREFIX.length
  );
}

export async function uploadScreenshot(
  body: Buffer,
  contentType: string,
  extension: string
) {
  const key = `${SCREENSHOTS_PREFIX}${randomUUID()}.${extension}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

export async function getScreenshot(key: string) {
  const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const bytes = await res.Body!.transformToByteArray();
  return { bytes, contentType: res.ContentType ?? "image/jpeg" };
}

export async function deleteScreenshot(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
