import { createFileRoute, Link } from "@tanstack/react-router"
import { FileStack, Scissors, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

export const Route = createFileRoute("/pdf/")({
    head: () => ({
        meta: [
            {
                title: "PDF Tools — Merge, Split & Edit PDFs Free Online | Perotron Web",
            },
            {
                name: "description",
                content:
                    "Free, privacy-first PDF tools powered by WebAssembly. Merge multiple PDFs into one, split a PDF into separate files, and more — all inside your browser. No uploads, no accounts.",
            },
            {
                property: "og:title",
                content:
                    "PDF Tools — Merge, Split & Edit PDFs Free Online | Perotron Web",
            },
            {
                property: "og:description",
                content:
                    "Free, privacy-first PDF tools powered by WebAssembly. Merge multiple PDFs into one, split a PDF into separate files, and more — all inside your browser. No uploads, no accounts.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content:
                    "PDF Tools — Merge, Split & Edit PDFs Free Online | Perotron Web",
            },
            {
                name: "twitter:description",
                content:
                    "Free, privacy-first PDF tools powered by WebAssembly. Merge multiple PDFs into one, split a PDF into separate files, and more — all inside your browser. No uploads, no accounts.",
            },
        ],
        links: [{ rel: "canonical", href: "https://tools.naveenmk.me/pdf" }],
    }),
    component: PdfIndexPage,
})

function PdfIndexPage() {
    return (
        <div className="flex w-full flex-1 flex-col items-center px-4">
            {/* ── Hero ─────────────────────────────────────────────── */}
            <section className="mx-auto flex w-full max-w-3xl animate-in flex-col items-center gap-6 pt-20 pb-12 text-center duration-700 fade-in slide-in-from-bottom-6">
                <Badge
                    variant="secondary"
                    className="gap-1.5 px-3 py-1 text-xs font-semibold tracking-widest uppercase"
                >
                    <ShieldCheck className="size-3.5" />
                    100% browser-based
                </Badge>

                <h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-foreground md:text-[4rem]">
                    PDF Tools
                </h1>

                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                    Merge, split, and manipulate PDFs entirely in your browser.
                    Your files never leave your device — powered by
                    WebAssembly.
                </p>
            </section>

            {/* ── Tools grid ───────────────────────────────────────── */}
            <section className="mx-auto w-full max-w-3xl pb-20">
                <p className="mb-5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Available PDF tools
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    <ToolCard
                        to="/pdf/merge"
                        icon={<FileStack className="size-6" />}
                        title="Merge PDF"
                        description="Combine multiple PDFs into one document. Arrange them in the order you need, then download."
                    />
                    <ToolCard
                        to="/pdf/split"
                        icon={<Scissors className="size-6" />}
                        title="Split PDF"
                        description="Extract individual pages or split a large PDF into separate files, all without uploading anything."
                    />
                </div>
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    More PDF tools coming soon.
                </p>
            </section>
        </div>
    )
}

/* ── Sub-components ──────────────────────────────────────── */

function ToolCard({
    to,
    icon,
    title,
    description,
}: {
    to: string
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <Link to={to} className="group outline-none">
            <Card className="h-full animate-in transition-all duration-200 duration-500 fade-in slide-in-from-bottom-4 hover:border-primary/40 hover:shadow-lg">
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                        {icon}
                    </div>
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-lg font-semibold transition-colors group-hover:text-primary">
                            {title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                            {description}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </Link>
    )
}
