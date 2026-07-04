import { createFileRoute, Link } from "@tanstack/react-router"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/terms")({
    head: () => ({
        meta: [
            {
                title: "Terms of Use — Perotron Web",
            },
            {
                name: "description",
                content:
                    "Terms of Use for Perotron Web. Understand the conditions for using our open-source, browser-native tool platform, including disclaimers, limitations, and your responsibilities.",
            },
            // Open Graph
            {
                property: "og:title",
                content: "Terms of Use — Perotron Web",
            },
            {
                property: "og:description",
                content:
                    "Terms of Use for Perotron Web. Understand the conditions for using our open-source, browser-native tool platform.",
            },
            { property: "og:type", content: "website" },
            // Twitter
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content: "Terms of Use — Perotron Web",
            },
            {
                name: "twitter:description",
                content:
                    "Terms of Use for Perotron Web. Understand the conditions for using our open-source, browser-native tool platform.",
            },
        ],
        links: [{ rel: "canonical", href: "https://tools.naveenmk.me/terms" }],
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
                    Terms of Use
                </h1>
                <p className="text-sm text-muted-foreground">
                    Last updated: July 4, 2026
                </p>
            </div>

            <Separator />

            {/* Section 1 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    1. Acceptance
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    By accessing or using Perotron Web, you agree to these Terms of Use. If
                    you do not agree, you should discontinue use of the platform.
                </p>
            </section>

            <Separator />

            {/* Section 2 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    2. Description
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Perotron Web is an open-source browser-based platform providing
                    productivity, developer, document, security, media, and data-processing
                    tools. Most processing occurs locally within your browser.
                </p>
            </section>

            <Separator />

            {/* Section 3 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    3. License
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Unless otherwise stated, the website, source code, and documentation are
                    provided under the applicable open-source license published with the{" "}
                    <ExternalLink href="https://github.com/naveen521kk/perotron-web">
                        project repository
                    </ExternalLink>
                    . Third-party libraries remain subject to their own licenses.
                </p>
            </section>

            <Separator />

            {/* Section 4 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    4. User Responsibilities
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    You agree to:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                    <li className="leading-relaxed">Comply with applicable laws</li>
                    <li className="leading-relaxed">Use the platform responsibly</li>
                    <li className="leading-relaxed">
                        Avoid interfering with the operation of the service
                    </li>
                    <li className="leading-relaxed">
                        Avoid attempting unauthorized access
                    </li>
                    <li className="leading-relaxed">
                        Avoid introducing malicious software
                    </li>
                </ul>
            </section>

            <Separator />

            {/* Section 5 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    5. Local Processing
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Most Perotron tools process files locally. You remain solely responsible
                    for:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                    <li className="leading-relaxed">Your files and backups</li>
                    <li className="leading-relaxed">Verifying generated output</li>
                    <li className="leading-relaxed">
                        Ensuring suitability for your intended use
                    </li>
                </ul>
            </section>

            <Separator />

            {/* Section 6 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    6. No Warranty
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Perotron Web is provided &ldquo;AS IS&rdquo; and &ldquo;AS
                    AVAILABLE.&rdquo; To the fullest extent permitted by law, we disclaim all
                    warranties, including warranties of:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                    <li className="leading-relaxed">Merchantability</li>
                    <li className="leading-relaxed">Fitness for a particular purpose</li>
                    <li className="leading-relaxed">Non-infringement</li>
                    <li className="leading-relaxed">Uninterrupted availability</li>
                    <li className="leading-relaxed">Accuracy of generated results</li>
                </ul>
            </section>

            <Separator />

            {/* Section 7 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    7. Limitation of Liability
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    To the maximum extent permitted by law, Perotron and its contributors
                    shall not be liable for:
                </p>
                <ul className="list-disc pl-6 flex flex-col gap-1.5 text-muted-foreground text-sm md:text-base">
                    <li className="leading-relaxed">Data loss or business interruption</li>
                    <li className="leading-relaxed">Financial loss</li>
                    <li className="leading-relaxed">
                        Indirect or consequential damages
                    </li>
                    <li className="leading-relaxed">
                        Loss resulting from reliance on generated output
                    </li>
                    <li className="leading-relaxed">Corruption of files</li>
                    <li className="leading-relaxed">Browser incompatibilities</li>
                </ul>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Users should verify important results independently.
                </p>
            </section>

            <Separator />

            {/* Section 8 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    8. Third-Party Services
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    The platform may integrate third-party services including analytics,
                    advertising, external APIs, or community plugins. Use of those services is
                    subject to their own terms and privacy policies.
                </p>
            </section>

            <Separator />

            {/* Section 9 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    9. Future Features
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Future versions may include cloud synchronization, AI services, plugins,
                    workflow automation, user accounts, and marketplace integrations.
                    Additional terms may apply to such features.
                </p>
            </section>

            <Separator />

            {/* Section 10 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    10. Intellectual Property
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Perotron, its branding, logos, and website design may be protected by
                    applicable intellectual property laws. Open-source code remains licensed
                    according to the project&apos;s published license.
                </p>
            </section>

            <Separator />

            {/* Section 11 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    11. Community Plugins
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Community-developed plugins are the responsibility of their respective
                    authors. Perotron does not guarantee the quality, security, or correctness
                    of third-party plugins. Users install and use plugins at their own risk.
                </p>
            </section>

            <Separator />

            {/* Section 12 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    12. Termination
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    We may suspend or restrict access if users abuse the platform or attempt
                    to compromise its security.
                </p>
            </section>

            <Separator />

            {/* Section 13 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    13. Governing Law
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    These Terms shall be governed by the laws applicable in the jurisdiction
                    in which the project owner is established, unless otherwise required by
                    applicable consumer protection laws.
                </p>
            </section>

            <Separator />

            {/* Section 14 */}
            <section className="flex flex-col gap-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    14. Contact
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Questions regarding these Terms may be submitted through the project&apos;s
                    official{" "}
                    <ExternalLink href="https://github.com/naveen521kk/perotron-web">
                        GitHub repository
                    </ExternalLink>{" "}
                    or other contact methods listed on the website.
                </p>
            </section>

            <Separator />

            <p className="text-xs text-muted-foreground">
                See also:{" "}
                <Link
                    to="/privacy"
                    className="text-primary hover:underline underline-offset-4"
                >
                    Privacy Policy
                </Link>
            </p>
        </div>
    )
}
