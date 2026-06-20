import {
    HeadContent,
    Scripts,
    createRootRoute,
    Link,
} from "@tanstack/react-router"
import { ThemeProvider } from "@/components/theme-provider"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { SiGithub } from "@icons-pack/react-simple-icons"
import { Separator } from "@/components/ui/separator"
import { Image } from "@unpic/react"
import logoLight from "@/assets/logo-light.svg"
import logoDark from "@/assets/logo-dark.svg"

import appCss from "../styles.css?url"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const SITE_TITLE = "Naveen's Tools — Browser-based utilities, zero data sent"
const SITE_DESCRIPTION =
    "Free, open-source browser utilities by Naveen. Merge and split PDFs without uploading a single byte. Licensed under GNU GPLv3."
const SITE_URL = "https://tools.naveenmk.me"
const SITE_IMAGE = "/banner.png"

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: SITE_TITLE,
            },
            {
                name: "description",
                content: SITE_DESCRIPTION,
            },
            {
                name: "image",
                content: SITE_IMAGE,
            },
            {
                name: "og:image",
                content: SITE_IMAGE,
            },
            {
                name: "og:title",
                content: SITE_TITLE,
            },
            {
                name: "og:description",
                content: SITE_DESCRIPTION,
            },
            {
                name: "og:type",
                content: "website",
            },
            {
                name: "og:url",
                content: SITE_URL,
            },
            {
                name: "twitter:image",
                content: SITE_IMAGE,
            },
            {
                name: "twitter:card",
                content: "summary_large_image",
            },
            {
                name: "twitter:url",
                content: SITE_URL,
            },
            {
                name: "apple-mobile-web-app-title",
                content: "Naveen's Tools",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
            {
                rel: "icon",
                type: "image/png",
                href: "/favicon-96x96.png",
                sizes: "96x96",
            },
            {
                rel: "icon",
                type: "image/svg+xml",
                href: "/favicon.svg",
            },
            {
                rel: "shortcut icon",
                type: "image/ico",
                href: "/favicon.ico",
            },
            {
                rel: "icon",
                type: "image/png",
                href: "/apple-touch-icon.png",
                sizes: "180x180",
            },
            {
                rel: "manifest",
                href: "/site.webmanifest",
            },
        ],
    }),
    notFoundComponent: () => (
        <main className="container mx-auto p-4 pt-16 text-center">
            <h1 className="mb-4 text-4xl font-bold">404</h1>
            <p className="text-muted-foreground">That page doesn't exist.</p>
            <Link
                to="/"
                className="mt-8 inline-block text-primary hover:underline"
            >
                Back to tools
            </Link>
        </main>
    ),
    shellComponent: RootDocument,
})

const Logo = () => {
    return (
        <>
            <Image
                src={logoLight}
                alt="Naveen's Tools"
                width={40}
                height={40}
                className="block dark:hidden"
            />
            <Image
                src={logoDark}
                alt="Naveen's Tools"
                width={40}
                height={40}
                className="hidden dark:block"
            />
        </>
    )
}

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20">
                <ThemeProvider defaultTheme="system" storageKey="theme">
                    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
                        <div className="container mx-auto flex h-14 items-center gap-6 px-4 md:px-6">
                            <Link
                                to="/"
                                className="flex shrink-0 items-center gap-2 text-base font-semibold transition-opacity hover:opacity-80"
                            >
                                <Logo />
                                <span className="tracking-tight">
                                    Naveen's Tools
                                </span>
                            </Link>

                            <Separator
                                orientation="vertical"
                                className="my-auto hidden h-7 md:block"
                            />

                            <nav className="hidden items-center gap-5 md:flex">
                                <Link
                                    to="/merge"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:font-medium [&.active]:text-foreground"
                                >
                                    Merge PDF
                                </Link>
                                <Link
                                    to="/split"
                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:font-medium [&.active]:text-foreground"
                                >
                                    Split PDF
                                </Link>
                            </nav>

                            <div className="ml-auto flex items-center gap-2">
                                <ModeToggle />
                                <a
                                    href="https://github.com/naveen521kk/tools"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        buttonVariants({
                                            variant: "ghost",
                                            size: "sm",
                                        }),
                                        "flex items-center gap-2 justify-center text-center text-xs"
                                    )}
                                    aria-label="View source on GitHub"
                                >
                                    <SiGithub
                                        className="size-5"
                                        title="Open Github"
                                    />
                                </a>
                            </div>
                        </div>
                    </header>

                    <main className="flex flex-1 flex-col">{children}</main>

                    <footer className="mt-auto border-t border-border">
                        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:px-6">
                            <div className="flex items-center gap-2">
                                <Logo />
                                <span>Naveen's Tools</span>
                                <Separator
                                    orientation="vertical"
                                    className="h-3.5 my-auto"
                                />
                                <span>Licensed under GNU GPLv3</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex size-1.5 shrink-0 rounded-full bg-green-500" />
                                <span>
                                    All processing happens in your browser — no
                                    data is ever sent to a server.
                                </span>
                            </div>
                        </div>
                    </footer>
                </ThemeProvider>

                <TanStackDevtools
                    config={{
                        position: "bottom-right",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                    ]}
                />
                <Scripts />
            </body>
        </html>
    )
}
