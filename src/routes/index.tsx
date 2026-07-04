import { createFileRoute, Link } from "@tanstack/react-router"
import { FileStack, Scissors, ShieldCheck, Code2 } from "lucide-react"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { lazy } from "react"

const FooterAdBanner = lazy(() =>
    import("@/components/ad-banner").then((mod) => ({
        default: mod.FooterAdBanner,
    }))
)

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            {
                title: "Perotron Web — Privacy-first Tools Powered by WebAssembly",
            },
            {
                name: "description",
                content:
                    "Merge PDFs, split PDFs, generate QR codes, and more — all inside your browser. No uploads, no accounts, no data sent to any server. Open source & free forever.",
            },
            // Open Graph
            {
                property: "og:title",
                content: "Perotron Web — Privacy-first Tools Powered by WebAssembly",
            },
            {
                property: "og:description",
                content:
                    "Merge PDFs, split PDFs, generate QR codes, and more — all inside your browser. No uploads, no accounts, no data sent to any server. Open source & free forever.",
            },
            { property: "og:type", content: "website" },
            // Twitter
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content: "Perotron Web — Privacy-first Tools Powered by WebAssembly",
            },
            {
                name: "twitter:description",
                content:
                    "Merge PDFs, split PDFs, generate QR codes, and more — all inside your browser. No uploads, no accounts, no data sent to any server. Open source & free forever.",
            },
        ],
        links: [{ rel: "canonical", href: "https://tools.naveenmk.me/" }],
    }),
    component: HomePage,
})

function HomePage() {
    return (
        <>
            <div className="flex w-full flex-1 flex-col items-center px-4">
                {/* ── Hero ─────────────────────────────────────────────── */}
                <section className="mx-auto flex w-full max-w-3xl animate-in flex-col items-center gap-6 pt-20 pb-12 text-center duration-700 fade-in slide-in-from-bottom-6">
                    <Badge
                        variant="secondary"
                        className="gap-1.5 px-3 py-1 text-xs font-semibold tracking-widest uppercase"
                    >
                        <span className="flex size-1.5 rounded-full bg-amber-500" />
                        Under active development
                    </Badge>

                    <h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-foreground md:text-[4rem]">
                        Perotron Web
                    </h1>

                    <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                        Privacy-first tools powered by WebAssembly. Your files
                        never leave your device.
                    </p>

                    {/* ── Trust strip — the signature element ── */}
                    <div className="mt-2 flex w-full flex-col items-center justify-center gap-0 overflow-hidden rounded-xl border border-border sm:flex-row sm:gap-0">
                        <TrustPillar
                            icon={<ShieldCheck className="size-4" />}
                            label="Zero data sent"
                            detail="Runs entirely in your browser"
                        />
                        <Separator
                            orientation="vertical"
                            className="my-auto hidden h-12 self-center sm:block"
                        />
                        <Separator
                            orientation="horizontal"
                            className="w-full sm:hidden"
                        />
                        <TrustPillar
                            icon={<Code2 className="size-4" />}
                            label="Open Source"
                            detail="GNU AGPLv3 licensed"
                        />
                        <Separator
                            orientation="vertical"
                            className="my-auto hidden h-12 self-center sm:block"
                        />
                        <Separator
                            orientation="horizontal"
                            className="w-full sm:hidden"
                        />
                        <TrustPillar
                            icon={<SiGithub className="size-4" />}
                            label="View the code"
                            detail="github.com/naveen521kk/perotron-web"
                            href="https://github.com/naveen521kk/perotron-web"
                        />
                    </div>
                </section>

                {/* ── Tools grid ───────────────────────────────────────── */}
                <section className="mx-auto w-full max-w-3xl pb-20">
                    <p className="mb-5 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Available tools
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <ToolCard
                            to="/merge"
                            icon={<FileStack className="size-6" />}
                            title="Merge PDF"
                            description="Combine multiple PDFs into one document. Arrange them in the order you need, then download."
                        />
                        <ToolCard
                            to="/split"
                            icon={<Scissors className="size-6" />}
                            title="Split PDF"
                            description="Extract individual pages or split a large PDF into separate files, all without uploading anything."
                        />
                    </div>
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        More tools coming soon.
                    </p>
                </section>
            </div>
            {/* ── Above-footer ad slot ── */}
            <FooterAdBanner />
        </>
    )
}

/* ── Sub-components ──────────────────────────────────────── */

function TrustPillar({
    icon,
    label,
    detail,
    href,
}: {
    icon: React.ReactNode
    label: string
    detail: string
    href?: string
}) {
    const inner = (
        <div className="flex flex-1 flex-col items-center gap-1 px-6 py-4 text-center">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {icon}
                {label}
            </div>
            <p className="text-xs text-muted-foreground">{detail}</p>
        </div>
    )

    if (href) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full flex-1 bg-card transition-colors hover:bg-muted"
            >
                {inner}
            </a>
        )
    }

    return <div className="flex w-full flex-1 bg-card">{inner}</div>
}

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
