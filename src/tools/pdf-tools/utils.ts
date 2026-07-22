function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function acceptPdfFiles(fileList: FileList | null): File[] {
    if (!fileList) return []
    return Array.from(fileList).filter((f) => f.type === "application/pdf")
}

function acceptSinglePdf(fileList: FileList | null): File | null {
    if (!fileList) return null
    const files = Array.from(fileList).filter(
        (f) => f.type === "application/pdf"
    )
    return files[0] ?? null
}

export { formatBytes, acceptPdfFiles, acceptSinglePdf }
