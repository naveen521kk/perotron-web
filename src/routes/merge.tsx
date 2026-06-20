import { createFileRoute } from "@tanstack/react-router"
import { UploadCloud, FileStack } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/merge")({
    head: () => ({
        meta: [
            {
                title: "Merge PDF — Combine PDFs Free Online | Naveen's Tools",
            },
            {
                name: "description",
                content:
                    "Combine multiple PDF files into one document instantly. Arrange pages in any order and download the merged PDF — everything stays in your browser, nothing is uploaded.",
            },
            // Open Graph
            {
                property: "og:title",
                content:
                    "Merge PDF — Combine PDFs Free Online | Naveen's Tools",
            },
            {
                property: "og:description",
                content:
                    "Combine multiple PDF files into one document instantly. Arrange pages in any order and download the merged PDF — everything stays in your browser, nothing is uploaded.",
            },
            { property: "og:type", content: "website" },
            // Twitter
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content:
                    "Merge PDF — Combine PDFs Free Online | Naveen's Tools",
            },
            {
                name: "twitter:description",
                content:
                    "Combine multiple PDF files into one document instantly. Arrange pages in any order and download the merged PDF — everything stays in your browser, nothing is uploaded.",
            },
        ],
    }),
    component: MergePage,
})

function MergePage() {
    return (
        <div className="flex w-full flex-1 flex-col items-center px-4 py-16">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="mx-auto mb-10 flex w-full max-w-2xl animate-in flex-col items-center gap-4 text-center duration-500 fade-in slide-in-from-bottom-4">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                    <FileStack className="size-7" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                    Merge PDFs
                </h1>
                <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                    Drop your files below. Arrange them in the order you want,
                    then download the merged result. Nothing is uploaded.
                </p>
            </div>

            {/* ── Drop zone ─────────────────────────────────────────── */}
            <div className="mx-auto w-full max-w-2xl animate-in delay-100 duration-700 fill-mode-both fade-in slide-in-from-bottom-6">
                <label
                    htmlFor="merge-file-upload"
                    className="group relative flex h-80 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card transition-all duration-300 hover:border-primary/50 hover:bg-accent/30"
                >
                    {/* Glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="relative z-10 flex flex-col items-center gap-6 transition-transform duration-500 group-hover:-translate-y-1">
                        <div className="relative">
                            <div className="absolute -inset-3 rounded-full bg-primary/15 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
                            <div className="flex size-20 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg">
                                <UploadCloud className="size-9" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-full px-8 shadow-md"
                            >
                                <span>Select PDF files</span>
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                or drag and drop them here
                            </p>
                        </div>
                    </div>

                    <input
                        id="merge-file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        accept="application/pdf"
                    />
                </label>
            </div>
        </div>
    )
}
