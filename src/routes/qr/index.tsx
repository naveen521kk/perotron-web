import { createFileRoute, Link } from "@tanstack/react-router"
import { QrCode, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"

export const Route = createFileRoute("/qr/")({
    head: () => ({
        meta: [
            {
                title: "QR Code Tools — Generate Custom QR Codes Free | Perotron Web",
            },
            {
                name: "description",
                content:
                    "Free, privacy-first QR code tools. Generate custom QR codes for URLs, WiFi, vCards, WhatsApp, and more — styled with your own colors, dot shapes, and logos. Everything runs in your browser.",
            },
            {
                property: "og:title",
                content:
                    "QR Code Tools — Generate Custom QR Codes Free | Perotron Web",
            },
            {
                property: "og:description",
                content:
                    "Free, privacy-first QR code tools. Generate custom QR codes for URLs, WiFi, vCards, WhatsApp, and more — styled with your own colors, dot shapes, and logos. Everything runs in your browser.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content:
                    "QR Code Tools — Generate Custom QR Codes Free | Perotron Web",
            },
            {
                name: "twitter:description",
                content:
                    "Free, privacy-first QR code tools. Generate custom QR codes for URLs, WiFi, vCards, WhatsApp, and more — styled with your own colors, dot shapes, and logos. Everything runs in your browser.",
            },
        ],
        links: [{ rel: "canonical", href: "https://tools.naveenmk.me/qr" }],
    }),
    component: QrIndexPage,
})

function QrIndexPage() {
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
                    QR Code Tools
                </h1>

                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                    Generate custom, stylish QR codes entirely in your browser.
                    Your data never leaves your device — no servers, no
                    tracking.
                </p>
            </section>

            {/* ── Tools grid ───────────────────────────────────────── */}
            <section className="mx-auto w-full max-w-3xl pb-20">
                <p className="mb-5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Available QR tools
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                    <ToolCard
                        to="/qr/generator"
                        icon={<QrCode className="size-6" />}
                        title="QR Code Generator"
                        description="Create custom QR codes with your own colors, styles, and logos. Support for URLs, WiFi, vCards, WhatsApp, and more."
                    />
                </div>
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    More QR tools coming soon.
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
