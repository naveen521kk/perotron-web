import { createFileRoute, Link } from "@tanstack/react-router"
import {
    FileStack,
    Scissors,
    ShieldCheck,
    Code2,
    QrCode,
    // FileText,
    // Image as ImageIcon,
    // Terminal,
    // Database,
    // Briefcase,
    Lock,
    // Video,
    // Sparkles,
    // Wrench,
    // Download,
    Zap,
    WifiOff,
    FileDown,
    ArrowRight,
    ServerOff,
} from "lucide-react"
import { SiGithub } from "@icons-pack/react-simple-icons"
// import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
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
                content:
                    "Perotron Web — Privacy-first Tools Powered by WebAssembly",
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
                content:
                    "Perotron Web — Privacy-first Tools Powered by WebAssembly",
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
            <div className="flex w-full flex-1 flex-col items-center">
                {/* ── Hero ─────────────────────────────────────────────── */}
                <section className="mx-auto flex w-full max-w-4xl animate-in flex-col items-center gap-8 px-4 pt-24 pb-16 text-center">
                    <div className="space-y-4">
                        <h1 className="text-5xl leading-[1.1] font-bold tracking-tight text-foreground md:text-[5rem] lg:text-[5.5rem]">
                            Perotron Web
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                            Browser-native tools for developers, analysts, and
                            professionals. Fast, private, and built to work
                            entirely on your device.
                        </p>
                    </div>

                    <div className="mt-4 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
                        <Button
                            size="lg"
                            className="rounded-full px-8 font-semibold"
                            asChild
                        >
                            <a href="#tools">
                                Explore Tools{" "}
                                <ArrowRight className="ml-2 size-4" />
                            </a>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="rounded-full px-8"
                            asChild
                        >
                            <a
                                href="https://github.com/naveen521kk/perotron-web"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <SiGithub className="mr-2 size-4" />
                                GitHub
                            </a>
                        </Button>
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="size-4 text-primary" /> Runs
                            Locally
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Code2 className="size-4 text-primary" /> Open
                            Source
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Lock className="size-4 text-primary" /> Privacy
                            First
                        </div>
                        <div className="flex items-center gap-1.5">
                            <WifiOff className="size-4 text-primary" /> Works
                            Offline*
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FileDown className="size-4 text-primary" /> No File
                            Uploads
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground/60">
                        * Offline after installation or once resources are
                        cached.
                    </p>
                </section>

                {/* ── Optional Banner ─────────────────────────────────────────────── */}
                <section className="w-full border-y border-border/50 bg-primary/5 px-4 py-12 text-center">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="text-xl font-medium tracking-tight text-foreground md:text-2xl">
                            No uploads. No accounts. No subscriptions.
                            <br />
                            <span className="mt-2 inline-block font-semibold text-primary">
                                Just fast, private tools.
                            </span>
                        </h2>
                        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Perotron Web is a collection of browser-native tools
                            powered by modern Web technologies like WebAssembly.
                            Your files and data stay on your device—nothing is
                            uploaded unless you explicitly choose to.
                        </p>
                    </div>
                </section>

                {/* ── Why Perotron? ─────────────────────────────────────────────── */}
                <section className="mx-auto w-full max-w-6xl px-4 py-24">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight">
                            Why Perotron?
                        </h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard
                            icon={<ServerOff className="size-6" />}
                            title="Browser-Native"
                            description="Everything runs directly in your browser. No waiting for uploads. No server-side processing."
                        />
                        <FeatureCard
                            icon={<Lock className="size-6" />}
                            title="Privacy by Default"
                            description="Your documents, images, and data remain on your device. No hidden uploads or unnecessary tracking."
                        />
                        <FeatureCard
                            icon={<Zap className="size-6" />}
                            title="Fast"
                            description="Powered by WebAssembly and optimized for modern browsers. Desktop-class performance."
                        />
                        <FeatureCard
                            icon={<Code2 className="size-6" />}
                            title="Open Source"
                            description="Built in the open. Review the source, self-host or contribute new tools."
                        />
                    </div>
                </section>

                {/* ── Categories ─────────────────────────────────────────────── */}
                {/* <section
                    id="tools"
                    className="mx-auto w-full max-w-5xl scroll-m-20 px-4 py-12"
                >
                    <div className="mb-10 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight">
                            Categories
                        </h2>
                        <p className="text-muted-foreground">
                            Find the right tool for the job.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <CategoryBadge
                            icon={<FileText className="size-4" />}
                            label="Documents"
                        />
                        <CategoryBadge
                            icon={<ImageIcon className="size-4" />}
                            label="Images"
                        />
                        <CategoryBadge
                            icon={<Terminal className="size-4" />}
                            label="Developer"
                        />
                        <CategoryBadge
                            icon={<Database className="size-4" />}
                            label="Data"
                        />
                        <CategoryBadge
                            icon={<Briefcase className="size-4" />}
                            label="Business"
                        />
                        <CategoryBadge
                            icon={<Lock className="size-4" />}
                            label="Security"
                        />
                        <CategoryBadge
                            icon={<Video className="size-4" />}
                            label="Media"
                        />
                        <CategoryBadge
                            icon={<Sparkles className="size-4" />}
                            label="AI"
                        />
                        <CategoryBadge
                            icon={<Wrench className="size-4" />}
                            label="Utilities"
                        />
                    </div>
                </section> */}

                {/* ── Featured Tools ─────────────────────────────────────────────── */}
                <section className="mx-auto w-full max-w-5xl px-4 pb-24" id="tools">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight">
                            Featured Tools
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <ToolCard
                            to="/pdf/merge"
                            icon={<FileStack className="size-5" />}
                            title="PDF Merge"
                            description="Combine multiple PDFs into one document."
                        />
                        <ToolCard
                            to="/pdf/split"
                            icon={<Scissors className="size-5" />}
                            title="PDF Split"
                            description="Extract individual pages from a PDF."
                        />
                        <ToolCard
                            to="/qr/generator"
                            icon={<QrCode className="size-5" />}
                            title="QR Generator"
                            description="Create custom QR codes."
                        />
                    </div>
                </section>

                {/* ── Philosophy ─────────────────────────────────────────────── */}
                <section className="mx-auto w-full max-w-3xl px-4 py-24 text-center">
                    <h2 className="mb-6 text-3xl font-bold tracking-tight">
                        Designed for Local Computing
                    </h2>
                    <p className="text-lg leading-relaxed text-muted-foreground">
                        We believe powerful software doesn't always need a
                        server. Perotron Web brings modern computing directly
                        into your browser using WebAssembly, allowing you to
                        process documents, analyze data, transform files, and
                        build workflows while keeping control of your
                        information.
                    </p>
                </section>

                {/* ── Future Section ─────────────────────────────────────────────── */}
                {/* <section className="w-full border-y border-border bg-muted/30 px-4 py-24">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid items-center gap-16 md:grid-cols-2">
                            <div>
                                <h2 className="mb-4 text-3xl font-bold tracking-tight">
                                    More Than Online Tools
                                </h2>
                                <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                                    Perotron is evolving into a browser-native
                                    computing platform.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                <div className="flex items-center gap-3 font-medium text-foreground">
                                    <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                    Plugin ecosystem
                                </div>
                                <div className="flex items-center gap-3 font-medium text-foreground">
                                    <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                    Custom workflows
                                </div>
                                <div className="flex items-center gap-3 font-medium text-foreground">
                                    <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                    AI running locally
                                </div>
                                <div className="flex items-center gap-3 font-medium text-foreground">
                                    <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                    Browser automation
                                </div>
                                <div className="flex items-center gap-3 font-medium text-foreground">
                                    <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                    Developer SDK
                                </div>
                                <div className="flex items-center gap-3 font-medium text-foreground">
                                    <div className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                                    Desktop application
                                </div>
                            </div>
                        </div>
                    </div>
                </section> */}

                {/* ── PWA & Open Source ─────────────────────────────────────────────── */}
                {/* <section className="mx-auto w-full max-w-5xl px-4 py-24" id="install">
                    <div className="grid gap-8 md:grid-cols-2">
                        <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
                            <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                <Download className="size-6" />
                            </div>
                            <h3 className="text-2xl font-bold">
                                Install Once. Use Anywhere.
                            </h3>
                            <p className="leading-relaxed text-muted-foreground">
                                Install Perotron Web for instant access from
                                your desktop or home screen.
                            </p>
                            <ul className="mt-2 mb-4 space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-muted-foreground/50" />{" "}
                                    Launch like a native app
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-muted-foreground/50" />{" "}
                                    Offline support
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-muted-foreground/50" />{" "}
                                    Automatic updates
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-muted-foreground/50" />{" "}
                                    Fast startup
                                </li>
                            </ul>
                            <Button className="mt-auto" variant="secondary">
                                Install App
                            </Button>
                        </div>

                        <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
                            <div className="rounded-xl bg-primary/10 p-3 text-primary">
                                <SiGithub className="size-6" />
                            </div>
                            <h3 className="text-2xl font-bold">
                                Built Together
                            </h3>
                            <p className="leading-relaxed text-muted-foreground">
                                Perotron Web is open source. Whether you fix a
                                bug, build a new tool, or suggest an idea,
                                contributions are always welcome.
                            </p>
                            <div className="mt-auto flex flex-wrap gap-3 pt-4">
                                <Button asChild>
                                    <a
                                        href="https://github.com/naveen521kk/perotron-web"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        GitHub
                                    </a>
                                </Button>
                                <Button variant="outline" asChild>
                                    <a
                                        href="#"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Documentation
                                    </a>
                                </Button>
                                <Button variant="outline" asChild>
                                    <a
                                        href="https://github.com/naveen521kk/perotron-web/issues"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Report Issue
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section> */}
            </div>
            {/* ── Above-footer ad slot ── */}
            <FooterAdBanner />
        </>
    )
}

/* ── Sub-components ──────────────────────────────────────── */

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode
    title: string
    description: string
}) {
    return (
        <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                </div>
                <CardTitle>{title}</CardTitle>
                {/* <CardDescription className="mt-2 text-base leading-relaxed">
                    {description}
                </CardDescription> */}
            </CardHeader>
            <CardContent>{description}</CardContent>
        </Card>
    )
}

// function CategoryBadge({
//     icon,
//     label,
// }: {
//     icon: React.ReactNode
//     label: string
// }) {
//     return (
//         <Badge
//             variant="secondary"
//             className="cursor-pointer gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
//         >
//             {icon}
//             {label}
//         </Badge>
//     )
// }

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
    // If it's a placeholder link, render a div instead of a Link to avoid router errors,
    // or just render an anchor. We'll use Link if it starts with /, otherwise an anchor or div.
    const isPlaceholder = to === "#"

    const inner = (
        <Card className="h-full animate-in transition-all duration-200 fade-in slide-in-from-bottom-4 hover:border-primary/40 hover:shadow-lg">
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
    )

    if (isPlaceholder) {
        return (
            <div
                className="group cursor-not-allowed opacity-60 outline-none"
                title="Coming Soon"
            >
                {inner}
            </div>
        )
    }

    return (
        <Link to={to} className="group outline-none">
            {inner}
        </Link>
    )
}
