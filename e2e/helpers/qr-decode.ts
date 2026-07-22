/**
 * QR decoding helpers for E2E tests.
 *
 * Uses `sharp` (already a project dependency) to convert a PNG file to raw
 * RGBA pixel data, then `jsqr` to decode the QR code contained within.
 */

import * as path from "path"
import * as fs from "fs"
import jsQR from "jsqr"
import sharp from "sharp"
import type { Download } from "@playwright/test"

/**
 * Save a Playwright {@link Download} to a temp file and return the file path.
 * The caller is responsible for deleting the file after the test.
 */
export async function saveDownload(
  download: Download,
  dir: string
): Promise<string> {
  const filename = download.suggestedFilename()
  const filePath = path.join(dir, filename)
  await download.saveAs(filePath)
  return filePath
}

/**
 * Decode a QR code from a PNG file path.
 * Returns the decoded string, or throws if decoding fails.
 */
export async function decodeQrFromFile(filePath: string): Promise<string> {
  // Use sharp to get raw RGBA pixel data
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // jsQR expects Uint8ClampedArray
  const pixels = new Uint8ClampedArray(data.buffer)
  const result = jsQR(pixels, info.width, info.height)

  if (!result) {
    throw new Error(
      `jsQR could not decode a QR code from: ${path.basename(filePath)}`
    )
  }

  return result.data
}

/**
 * Convenience: save a Playwright download to a temp dir, decode it, and
 * delete the file. Returns the decoded QR string.
 */
export async function decodeDownloadedQr(
  download: Download,
  tmpDir: string
): Promise<string> {
  const filePath = await saveDownload(download, tmpDir)
  try {
    return await decodeQrFromFile(filePath)
  } finally {
    fs.rmSync(filePath, { force: true })
  }
}
