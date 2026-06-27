import { createFileRoute } from "@tanstack/react-router"
import { UploadCloud, Scissors } from "lucide-react"
import { Button } from "@/components/ui/button"

export const Route = createFileRoute("/split")({
    head: () => ({
        meta: [
            {
                title: "Split PDF — Extract Pages from PDF Free | Naveen's Tools",
            },
            {
                name: "description",
                content:
                    "Extract individual pages or split a large PDF into separate files — no uploads required. Your PDF stays in your browser and is never sent to a server.",
            },
            // Open Graph
            {
                property: "og:title",
                content:
                    "Split PDF — Extract Pages from PDF Free | Naveen's Tools",
            },
            {
                property: "og:description",
                content:
                    "Extract individual pages or split a large PDF into separate files — no uploads required. Your PDF stays in your browser and is never sent to a server.",
            },
            { property: "og:type", content: "website" },
            // Twitter
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content:
                    "Split PDF — Extract Pages from PDF Free | Naveen's Tools",
            },
            {
                name: "twitter:description",
                content:
                    "Extract individual pages or split a large PDF into separate files — no uploads required. Your PDF stays in your browser and is never sent to a server.",
            },
        ],
        links: [
            { rel: "canonical", href: "https://tools.naveenmk.me/split" },
        ],
    }),
    component: SplitPage,
})

function SplitPage() {
    return (
        <div className="flex w-full flex-1 flex-col items-center px-4 py-16">
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="mx-auto mb-10 flex w-full max-w-2xl animate-in flex-col items-center gap-4 text-center duration-500 fade-in slide-in-from-bottom-4">
                <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                    <Scissors className="size-7" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                    Split PDF
                </h1>
                <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                    Upload a PDF and pull out the pages you need — as individual
                    files or a new document. Stays in your browser.
                </p>
            </div>

            {/* ── Drop zone ─────────────────────────────────────────── */}
            <div className="mx-auto w-full max-w-2xl animate-in delay-100 duration-700 fill-mode-both fade-in slide-in-from-bottom-6">
                <label
                    htmlFor="split-file-upload"
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
                                <span>Select a PDF file</span>
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                or drag and drop it here
                            </p>
                        </div>
                    </div>

                    <input
                        id="split-file-upload"
                        type="file"
                        className="hidden"
                        accept="application/pdf"
                    />
                </label>
            </div>
        </div>
    )
}
