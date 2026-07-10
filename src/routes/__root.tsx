import { useEffect } from "react"
import {
    HeadContent,
    Scripts,
    createRootRoute,
    Link,
    Outlet,
    useLocation,
} from "@tanstack/react-router"
import { usePostHog } from "@posthog/react"
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
import { Toaster } from "sonner"
import { PostHogProvider } from "@posthog/react"
import { DefaultCatchBoundary } from "@/components/default-catch-boundary"
import { OfflineIndicator } from "@/components/offline-indicator"
import { registerSW } from "@/lib/register-sw"

const SITE_TITLE = "Perotron Web — Privacy-first tools powered by WebAssembly"
const SITE_DESCRIPTION =
    "Free, open-source privacy-first tools powered by WebAssembly. Merge PDFs, split PDFs, generate custom QR codes — all without uploading a single byte. Licensed under GNU AGPLv3."
const SITE_URL = "https://tools.naveenmk.me"
const SITE_IMAGE = "/banner.png"

const posthogOptions = {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    defaults: "2026-05-30",
    capture_exceptions: true,
    opt_out_capturing_by_default: import.meta.env.DEV,
    disable_persistence: import.meta.env.DEV,
} as const

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
                content: "Perotron Web",
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
            {
                rel: "canonical",
                href: "https://tools.naveenmk.me/",
            },
        ],
        scripts: import.meta.env.PROD
            ? [
                  // https://www.googletagmanager.com/gtag/js?id=G-F61KVD3XWG
                  {
                      async: true,
                      src: "https://www.googletagmanager.com/gtag/js?id=G-F61KVD3XWG",
                  },
                  // Google AdSense
                  {
                      async: true,
                      src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7183740147103241",
                      crossOrigin: "anonymous",
                  },
              ]
            : [],
    }),
    notFoundComponent: NotFoundPage,
    errorComponent: (props) => {
        return (
            <RootLayout>
                <DefaultCatchBoundary {...props} />
            </RootLayout>
        )
    },
    component: RootComponent,
})


function NotFoundPage() {
    const posthog = usePostHog()
    const pathname = useLocation({ select: (l) => l.pathname })

    useEffect(() => {
        posthog?.capture('page_not_found', { path: pathname })
    }, [pathname, posthog])

    return (
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
    )
}

function RootComponent() {
  return (
    <RootLayout>
      <Outlet />
    </RootLayout>
  )
}

const Logo = () => {
    return (
        <>
            <Image
                src={logoLight}
                alt="Perotron Web"
                width={40}
                height={40}
                className="block dark:hidden"
            />
            <Image
                src={logoDark}
                alt="Perotron Web"
                width={40}
                height={40}
                className="hidden dark:block"
            />
        </>
    )
}

function RootLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (import.meta.env.PROD) {
            registerSW()
        }
    }, [])

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <HeadContent />
                {import.meta.env.PROD && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-F61KVD3XWG');`,
                        }}
                    />
                )}
            </head>
            <body className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 google-anno-skip">
                <PostHogProvider
                    apiKey={import.meta.env.VITE_POSTHOG_PROJECT_TOKEN}
                    options={posthogOptions}
                >
                    <ThemeProvider defaultTheme="system" storageKey="theme">
                        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
                            <div className="container mx-auto flex h-14 items-center gap-6 px-4 md:px-6">
                                <Link
                                    to="/"
                                    className="flex shrink-0 items-center gap-2 text-base font-semibold transition-opacity hover:opacity-80"
                                >
                                    <Logo />
                                    <span className="tracking-tight">
                                        Perotron Web
                                    </span>
                                </Link>

                                <Separator
                                    orientation="vertical"
                                    className="my-auto hidden h-7 md:block"
                                />

                                <nav className="hidden items-center gap-5 md:flex">
                                    <Link
                                        to="/pdf"
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:font-medium [&.active]:text-foreground"
                                    >
                                        PDF Tools
                                    </Link>
                                    <Link
                                        to="/qr"
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:font-medium [&.active]:text-foreground"
                                    >
                                        QR Tools
                                    </Link>
                                </nav>

                                <div className="ml-auto flex items-center gap-2">
                                    <ModeToggle />
                                    <a
                                        href="https://github.com/naveen521kk/perotron-web"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            buttonVariants({
                                                variant: "ghost",
                                                size: "sm",
                                            }),
                                            "flex items-center justify-center gap-2 text-center text-xs"
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

                        <footer className="mt-auto border-t border-border bg-muted/40">
                            <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <Logo />
                                        <span className="font-semibold text-foreground">
                                            Perotron Web
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Compute locally. Work privately.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h4 className="font-medium text-foreground">
                                        Project & Platform
                                    </h4>
                                    <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                                        <a
                                            href="#tools"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Tools
                                        </a>
                                        {/* <Link to="/" className="hover:text-foreground transition-colors">Documentation</Link> */}
                                        <a
                                            href="https://github.com/naveen521kk/perotron-web"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            GitHub
                                        </a>
                                        <a
                                            href="https://github.com/naveen521kk/perotron-web/blob/main/CHANGELOG.md"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Changelog
                                        </a>
                                    </nav>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h4 className="font-medium text-foreground">
                                        Legal
                                    </h4>
                                    <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
                                        <Link
                                            to="/privacy"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Privacy Policy
                                        </Link>
                                        <Link
                                            to="/terms"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Terms of Use
                                        </Link>
                                        <a
                                            href="https://github.com/naveen521kk/perotron-web/blob/main/LICENSE"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            License
                                        </a>
                                    </nav>
                                </div>
                            </div>
                            <div className="container mx-auto border-t border-border/50 px-4 py-6 md:px-6">
                                <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                                    <p className="text-xs text-muted-foreground">
                                        &copy; {new Date().getFullYear()}{" "}
                                        <a
                                            href="https://www.naveenmk.me"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            Naveen M K
                                        </a>
                                        . Licensed under GNU AGPLv3.
                                    </p>
                                    <a
                                        href="https://github.com/naveen521kk/perotron-web/releases"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-mono text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
                                        aria-label={`Version ${__APP_VERSION__} — view changelog`}
                                    >
                                        v{__APP_VERSION__}
                                    </a>
                                </div>
                            </div>
                        </footer>
                        <Toaster richColors closeButton />
                        <OfflineIndicator />
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
                </PostHogProvider>
            </body>
        </html>
    )
}
