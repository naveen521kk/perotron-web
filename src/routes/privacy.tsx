import { createFileRoute } from "@tanstack/react-router"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/privacy")({
    head: () => ({
        meta: [
            {
                title: "Privacy Policy — Perotron Web",
            },
            {
                name: "description",
                content:
                    "Privacy Policy for Perotron Web. Learn how we handle your data, our local-first browser-native processing model, and third-party services including Google Analytics, Google AdSense, and PostHog.",
            },
            // Open Graph
            {
                property: "og:title",
                content: "Privacy Policy — Perotron Web",
            },
            {
                property: "og:description",
                content:
                    "Privacy Policy for Perotron Web. Learn how we handle your data, our local-first browser-native processing model, and third-party services.",
            },
            { property: "og:type", content: "website" },
            // Twitter
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content: "Privacy Policy — Perotron Web",
            },
            {
                name: "twitter:description",
                content:
                    "Privacy Policy for Perotron Web. Learn how we handle your data, our local-first browser-native processing model, and third-party services.",
            },
        ],
        links: [{ rel: "canonical", href: "https://tools.naveenmk.me/privacy" }],
    }),
    component: RouteComponent,
})

const ExternalLink = ({
    href,
    children,
}: {
    href: string
    children: React.ReactNode
}) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline underline-offset-4"
    >
        {children}
    </a>
)

function RouteComponent() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl flex flex-col gap-6 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                    Privacy Policy
                </h1>
                <p className="text-sm text-muted-foreground">
                    Last updated: July 4, 2026
                </p>
            </div>

            <Separator />

            {/* Section 1 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    1. Introduction
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Welcome to{" "}
                    <strong className="text-foreground font-semibold">Perotron Web</strong>{" "}
                    (&ldquo;Perotron&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or
                    &ldquo;us&rdquo;).
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Perotron Web is an open-source, browser-native platform that provides
                    document, developer, data, security, and productivity tools. Our design
                    philosophy is:
                </p>
                <div className="border-l-4 border-primary/50 bg-primary/5 px-4 py-3 rounded-r-md">
                    <p className="text-sm md:text-base text-foreground font-semibold italic">
                        Compute locally. Work privately.
                    </p>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Most processing performed by Perotron Web occurs entirely within your web
                    browser. Whenever possible, files and data remain on your device and are
                    never transmitted to our servers.
                </p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    This Privacy Policy explains what information we collect, how we use it,
                    and your rights.
                </p>
            </section>

            <Separator />

            {/* Section 2 */}
            <section className="flex flex-col gap-5">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    2. What We Collect
                </h2>

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                        A. Information You Provide
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        Most Perotron tools do not require you to create an account. Unless
                        explicitly stated for a particular feature, we do not collect:
                    </p>
                    <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                        <li className="leading-relaxed">Uploaded files</li>
                        <li className="leading-relaxed">
                            Document contents, images, PDFs, or spreadsheets
                        </li>
                        <li className="leading-relaxed">Passwords or encryption keys</li>
                        <li className="leading-relaxed">Generated output</li>
                    </ul>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        These remain on your device during processing.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                        B. Usage Analytics
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        We use analytics services to understand how Perotron Web is used and to
                        improve performance and usability. This may include information such as:
                    </p>
                    <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                        <li className="leading-relaxed">Pages visited and tools used</li>
                        <li className="leading-relaxed">
                            Browser type, operating system, and screen resolution
                        </li>
                        <li className="leading-relaxed">Language preferences</li>
                        <li className="leading-relaxed">
                            Approximate geographic region (derived from IP by analytics providers)
                        </li>
                        <li className="leading-relaxed">
                            Referrer information and session duration
                        </li>
                        <li className="leading-relaxed">
                            Interaction events, feature usage, and performance metrics
                        </li>
                        <li className="leading-relaxed">
                            Crash reports and anonymous identifiers
                        </li>
                    </ul>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        Analytics providers may collect IP addresses as part of providing their
                        services, although they may process, truncate, or anonymize them
                        according to their own policies.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                        C. Tool Metrics
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        Some tools may collect non-content operational metrics to improve
                        functionality. Examples include:
                    </p>
                    <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                        <li className="leading-relaxed">Number of pages in a PDF and file size</li>
                        <li className="leading-relaxed">
                            Processing duration and memory usage
                        </li>
                        <li className="leading-relaxed">Processing success or failure</li>
                        <li className="leading-relaxed">Browser performance and tool version</li>
                    </ul>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        We do not intentionally collect the contents of your documents for
                        analytics.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                        D. Local Storage
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        Perotron stores information locally on your device using browser storage
                        technologies, including IndexedDB, Local Storage, Cache Storage, and
                        Service Workers. These may be used for recent tools, favorites, settings,
                        theme preferences, offline functionality, and cached application assets.
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        This data remains on your device unless you clear your browser storage.
                    </p>
                </div>
            </section>

            <Separator />

            {/* Section 3 */}
            <section className="flex flex-col gap-5">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    3. Analytics and Third-Party Services
                </h2>

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                        Google Analytics
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        We use{" "}
                        <ExternalLink href="https://policies.google.com/technologies/partner-sites">
                            Google Analytics
                        </ExternalLink>{" "}
                        to understand website traffic, user engagement, and improve the
                        platform. Google may collect information in accordance with its own
                        privacy policies.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-foreground">
                        Google AdSense
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        Some pages may display advertisements served by{" "}
                        <ExternalLink href="https://policies.google.com/technologies/partner-sites">
                            Google AdSense
                        </ExternalLink>
                        . Google and its partners may use cookies or similar technologies to
                        personalize advertising and measure ad performance. Users may manage ad
                        personalization through{" "}
                        <ExternalLink href="https://adssettings.google.com/">
                            Google&apos;s Ad Settings
                        </ExternalLink>
                        .
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold text-foreground">PostHog</h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        We use{" "}
                        <ExternalLink href="https://posthog.com/privacy">
                            PostHog
                        </ExternalLink>{" "}
                        for product analytics and performance monitoring. PostHog helps us
                        understand which tools are used, application performance, feature
                        adoption, browser compatibility, anonymous usage patterns, and
                        operational metrics (such as PDF page count or processing duration).
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        PostHog is configured to send analytics through <ExternalLink href="https://www.cloudflare.com/trust-hub/">Cloudflare</ExternalLink> as a reverse
                        proxy. Analytics data is ultimately processed using PostHog&apos;s
                        United States cloud infrastructure.
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        We do not intentionally send document contents or file data to PostHog.
                    </p>
                </div>
            </section>

            <Separator />

            {/* Section 4 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    4. Cookies
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Perotron and our third-party providers may use cookies or similar
                    technologies for:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                    <li className="leading-relaxed">Analytics</li>
                    <li className="leading-relaxed">Remembering preferences</li>
                    <li className="leading-relaxed">
                        Authentication
                    </li>
                    <li className="leading-relaxed">
                        Advertising, security, and fraud prevention
                    </li>
                </ul>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    You can control cookies through your browser settings. Disabling certain
                    cookies may affect some functionality.
                </p>
            </section>

            <Separator />

            {/* Section 5 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    5. File Processing
                </h2>
                <div className="border-l-4 border-primary/50 bg-primary/5 px-4 py-3 rounded-r-md">
                    <p className="text-sm md:text-base text-foreground font-semibold italic">
                        Your files should stay on your device whenever possible.
                    </p>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Most tools process files entirely within your browser using technologies
                    such as:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                    <li className="leading-relaxed">WebAssembly (WASM) and Pyodide</li>
                    <li className="leading-relaxed">DuckDB WASM and ONNX Runtime Web</li>
                    <li className="leading-relaxed">Browser APIs</li>
                </ul>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Files are generally not uploaded to our servers for processing. If a future
                    tool requires cloud processing or an external API, that tool will clearly
                    disclose this before any data is transmitted.
                </p>
            </section>

            <Separator />

            {/* Section 6 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    6. Data Retention
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Analytics providers retain data according to their own retention policies.
                    Locally stored preferences remain on your device until you remove them or
                    clear your browser data.
                </p>
            </section>

            <Separator />

            {/* Section 7 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    7. International Data Transfers
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Some analytics and advertising providers may process data outside your
                    country of residence. In particular:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                    <li className="leading-relaxed">
                        PostHog analytics are processed in the United States.
                    </li>
                    <li className="leading-relaxed">
                        Google services may process information in multiple jurisdictions.
                    </li>
                </ul>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Where applicable, these providers use mechanisms intended to safeguard
                    international data transfers.
                </p>
            </section>

            <Separator />

            {/* Section 8 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    8. Security
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    We use reasonable technical and organizational measures to protect the
                    platform, including:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                    <li className="leading-relaxed">HTTPS encryption</li>
                    <li className="leading-relaxed">Cloudflare security services</li>
                    <li className="leading-relaxed">
                        Content Security Policy where applicable
                    </li>
                    <li className="leading-relaxed">
                        Browser sandboxing and local processing whenever possible
                    </li>
                </ul>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    No method of transmission or storage is completely secure.
                </p>
            </section>

            <Separator />

            {/* Section 9 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    9. Children&apos;s Privacy
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Perotron Web is not directed toward children under the age required by
                    applicable law to consent to data processing.
                </p>
            </section>

            <Separator />

            {/* Section 10 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    10. Open Source
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Perotron Web is an open-source project. Source code is publicly available,
                    allowing anyone to inspect how the platform operates.
                </p>
            </section>

            <Separator />

            {/* Section 11 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    11. Changes to This Policy
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time. Material changes will
                    be reflected by updating the &ldquo;Last updated&rdquo; date.
                </p>
            </section>

            <Separator />

            {/* Section 12 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    12. Contact
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Questions regarding this Privacy Policy may be submitted through:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                    <li className="leading-relaxed">
                        <ExternalLink href="https://github.com/naveen521kk/perotron-web/issues">
                            GitHub Issues
                        </ExternalLink>
                    </li>
                    <li className="leading-relaxed">
                        The project&apos;s official contact methods listed on the website
                    </li>
                </ul>
            </section>
        </div>
    )
}
