/**
 * Playwright globalSetup — generates test PDF fixtures before any tests run.
 *
 * Uses raw PDF byte construction so we don't need any external dependencies.
 * Produces:
 *   - test-1page.pdf  — valid single-page PDF
 *   - test-3page.pdf  — valid three-page PDF
 *   - test-corrupted.pdf — intentionally malformed PDF
 *   - not-a-pdf.txt   — wrong file format for rejection tests
 */
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"

const FIXTURES_DIR = join(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), ".")

/** Build a minimal valid PDF with N pages. */
function buildPdf(pageCount: number): Buffer {
  // Object numbering: 1 = Catalog, 2 = Pages, 3..3+N-1 = Page objects
  const objects: string[] = []
  const offsets: number[] = []

  // Collect page object references
  const pageRefs = Array.from({ length: pageCount }, (_, i) => `${i + 3} 0 R`).join(" ")

  // Object 1: Catalog
  objects.push(
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`
  )

  // Object 2: Pages
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageRefs}] /Count ${pageCount} >>\nendobj\n`
  )

  // Page objects (3..3+N-1)
  for (let i = 0; i < pageCount; i++) {
    const objNum = i + 3
    objects.push(
      `${objNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n`
    )
  }

  // Assemble PDF
  let pdf = "%PDF-1.4\n"
  for (const obj of objects) {
    offsets.push(pdf.length)
    pdf += obj
  }

  // Cross-reference table
  const xrefOffset = pdf.length
  pdf += "xref\n"
  pdf += `0 ${objects.length + 1}\n`
  pdf += "0000000000 65535 f \n"
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`
  }

  // Trailer
  pdf += "trailer\n"
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`
  pdf += "startxref\n"
  pdf += `${xrefOffset}\n`
  pdf += "%%EOF\n"

  return Buffer.from(pdf, "utf-8")
}

export default function globalSetup() {
  if (!existsSync(FIXTURES_DIR)) {
    mkdirSync(FIXTURES_DIR, { recursive: true })
  }

  // Valid single-page PDF
  writeFileSync(join(FIXTURES_DIR, "test-1page.pdf"), buildPdf(1))

  // Valid three-page PDF
  writeFileSync(join(FIXTURES_DIR, "test-3page.pdf"), buildPdf(3))

  // Corrupted PDF — starts with PDF header but has garbage content
  writeFileSync(
    join(FIXTURES_DIR, "test-corrupted.pdf"),
    Buffer.from("%PDF-1.4\n%%CORRUPTED_GARBAGE_DATA_HERE%%\n%%EOF\n", "utf-8")
  )

  // Not a PDF — plain text file
  writeFileSync(
    join(FIXTURES_DIR, "not-a-pdf.txt"),
    Buffer.from("This is not a PDF file. It is plain text.\n", "utf-8")
  )

  console.log("[globalSetup] Test PDF fixtures generated in:", FIXTURES_DIR)
}
