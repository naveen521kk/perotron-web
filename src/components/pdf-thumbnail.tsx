import React from "react"
import PdfWorkerUrl from "../../node_modules/pdfjs-dist/build/pdf.worker.mjs?worker&url"
import { toast } from "sonner" 

interface PdfThumbnailProps {
    file: File
    /** Rendered canvas width in pixels (height is proportional). Default: 160 */
    width?: number
    className?: string
}

export function PdfThumbnail({
    file,
    width = 160,
    className,
}: PdfThumbnailProps) {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const [status, setStatus] = React.useState<"loading" | "done" | "error">(
        "loading"
    )

    React.useEffect(() => {
        if (!canvasRef.current) return
        let cancelled = false

        async function render() {
            try {
                const pdfjsLib = await import("pdfjs-dist")
                pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorkerUrl

                const arrayBuffer = await file.arrayBuffer()
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
                    .promise
                const page = await pdf.getPage(1)

                const unscaledViewport = page.getViewport({ scale: 1 })
                const scale = width / unscaledViewport.width
                const viewport = page.getViewport({ scale })

                const canvas = canvasRef.current
                if (!canvas || cancelled) return
                canvas.width = viewport.width
                canvas.height = viewport.height

                const ctx = canvas.getContext("2d")
                if (!ctx) throw new Error("No 2d context")

                await page.render({ canvasContext: ctx, viewport, canvas })
                    .promise
                if (!cancelled) setStatus("done")
            } catch (error) {
                console.error(error)
                if (!cancelled) {
                    setStatus("error")
                    toast.error(`Failed to render thumbnail for ${file.name}.`)
                }
            }
        }

        render()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file, width])

    if (status === "error") {
        return (
            <div
                style={{ width }}
                className={`flex aspect-[3/4] items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 text-xs text-destructive ${className ?? ""}`}
            >
                Error
            </div>
        )
    }

    return (
        <div
            style={{ width }}
            className={`relative aspect-[3/4] ${className ?? ""}`}
        >
            {status === "loading" && (
                <div className="absolute inset-0 animate-pulse rounded-md bg-muted" />
            )}
            <canvas
                ref={canvasRef}
                className="h-full w-full rounded-md object-contain"
                style={{ display: status === "done" ? "block" : "none" }}
            />
        </div>
    )
}
