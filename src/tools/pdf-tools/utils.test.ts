import { describe, it, expect } from "vitest"
import { formatBytes, acceptPdfFiles, acceptSinglePdf } from "./utils"

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * Creates a minimal File-like object that satisfies the filter conditions.
 * happy-dom supports the File constructor so this works as a real File.
 */
function makeFile(name: string, type: string, sizeBytes = 1024): File {
    // Fill the blob with `sizeBytes` zero bytes so File.size is accurate
    const content = new Uint8Array(sizeBytes)
    return new File([content], name, { type })
}

function makePdf(name = "sample.pdf", sizeBytes = 1024): File {
    return makeFile(name, "application/pdf", sizeBytes)
}

function makeNonPdf(name = "image.png"): File {
    return makeFile(name, "image/png")
}

/** Builds a FileList from an array of File objects (FileList is normally read-only). */
function makeFileList(files: File[]): FileList {
    const dt = new DataTransfer()
    files.forEach((f) => dt.items.add(f))
    return dt.files
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  formatBytes                                                                */
/* ─────────────────────────────────────────────────────────────────────────── */

describe("formatBytes()", () => {
    describe("bytes range (< 1 KB)", () => {
        it("formats 0 bytes", () => {
            expect(formatBytes(0)).toBe("0 B")
        })

        it("formats 1 byte", () => {
            expect(formatBytes(1)).toBe("1 B")
        })

        it("formats 1023 bytes (boundary: still in B range)", () => {
            expect(formatBytes(1023)).toBe("1023 B")
        })
    })

    describe("kilobytes range (>= 1 KB and < 1 MB)", () => {
        it("formats exactly 1 KB (1024 bytes)", () => {
            expect(formatBytes(1024)).toBe("1.0 KB")
        })

        it("formats 2048 bytes as 2.0 KB", () => {
            expect(formatBytes(2048)).toBe("2.0 KB")
        })

        it("formats 1536 bytes as 1.5 KB", () => {
            expect(formatBytes(1536)).toBe("1.5 KB")
        })

        it("formats 1 MB minus 1 byte correctly (still in KB)", () => {
            // 1 048 575 bytes / 1024 ≈ 1023.999... → "1024.0 KB"
            expect(formatBytes(1024 * 1024 - 1)).toBe("1024.0 KB")
        })
    })

    describe("megabytes range (>= 1 MB)", () => {
        it("formats exactly 1 MB (1048576 bytes)", () => {
            expect(formatBytes(1024 * 1024)).toBe("1.0 MB")
        })

        it("formats 10 MB", () => {
            expect(formatBytes(10 * 1024 * 1024)).toBe("10.0 MB")
        })

        it("formats 2.5 MB", () => {
            expect(formatBytes(2.5 * 1024 * 1024)).toBe("2.5 MB")
        })

        it("formats a large file (100 MB)", () => {
            expect(formatBytes(100 * 1024 * 1024)).toBe("100.0 MB")
        })
    })
})

/* ─────────────────────────────────────────────────────────────────────────── */
/*  acceptPdfFiles                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

describe("acceptPdfFiles()", () => {
    it("returns an empty array when fileList is null", () => {
        expect(acceptPdfFiles(null)).toEqual([])
    })

    it("returns an empty array when fileList is empty", () => {
        expect(acceptPdfFiles(makeFileList([]))).toEqual([])
    })

    it("returns only PDF files from a mixed list", () => {
        const pdf1 = makePdf("a.pdf")
        const img = makeNonPdf("img.jpg")
        const pdf2 = makePdf("b.pdf")
        const result = acceptPdfFiles(makeFileList([pdf1, img, pdf2]))
        expect(result).toHaveLength(2)
        expect(result[0].name).toBe("a.pdf")
        expect(result[1].name).toBe("b.pdf")
    })

    it("returns an empty array when no PDFs are present", () => {
        const result = acceptPdfFiles(makeFileList([makeNonPdf("doc.docx"), makeNonPdf("img.png")]))
        expect(result).toHaveLength(0)
    })

    it("returns all files when every file is a PDF", () => {
        const files = [makePdf("1.pdf"), makePdf("2.pdf"), makePdf("3.pdf")]
        const result = acceptPdfFiles(makeFileList(files))
        expect(result).toHaveLength(3)
    })

    it("filters by MIME type, not by extension", () => {
        // A file named .pdf but with wrong MIME type should be rejected
        const wrongMime = makeFile("tricky.pdf", "text/plain")
        const result = acceptPdfFiles(makeFileList([wrongMime]))
        expect(result).toHaveLength(0)
    })
})

/* ─────────────────────────────────────────────────────────────────────────── */
/*  acceptSinglePdf                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

describe("acceptSinglePdf()", () => {
    it("returns null when fileList is null", () => {
        expect(acceptSinglePdf(null)).toBeNull()
    })

    it("returns null when fileList is empty", () => {
        expect(acceptSinglePdf(makeFileList([]))).toBeNull()
    })

    it("returns null when no PDF files are present", () => {
        const result = acceptSinglePdf(makeFileList([makeNonPdf("img.png")]))
        expect(result).toBeNull()
    })

    it("returns the first PDF file when exactly one PDF is present", () => {
        const pdf = makePdf("doc.pdf")
        expect(acceptSinglePdf(makeFileList([pdf]))).toBe(pdf)
    })

    it("returns only the FIRST PDF when multiple PDFs are present", () => {
        const first = makePdf("first.pdf")
        const second = makePdf("second.pdf")
        const result = acceptSinglePdf(makeFileList([first, second]))
        expect(result).toBe(first)
    })

    it("ignores non-PDF files before the first PDF", () => {
        const img = makeNonPdf("img.png")
        const pdf = makePdf("doc.pdf")
        // Non-PDF comes first, but the first PDF should still be returned
        const result = acceptSinglePdf(makeFileList([img, pdf]))
        expect(result).toBe(pdf)
    })

    it("filters by MIME type, not by extension", () => {
        const wrongMime = makeFile("tricky.pdf", "application/octet-stream")
        expect(acceptSinglePdf(makeFileList([wrongMime]))).toBeNull()
    })
})
