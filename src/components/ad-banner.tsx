import { useEffect } from "react"
import { cn } from "@/lib/utils"

declare global {
    interface Window {
        adsbygoogle: { push: (obj: object) => void } & object[]
    }
}

interface AdBannerProps {
    /** Google AdSense ad slot ID */
    slot: string
    /** Ad format — defaults to "auto" */
    format?: string
    /** Ad layout (e.g. "in-article") */
    // layout?: string
    /** Ad layout key */
    // layoutKey?: string
    /** Whether to enable full-width responsive */
    responsive?: string
    /** Publisher client ID — defaults to your publisher ID */
    client?: string
    /** Extra classes for the outer container */
    className?: string
}

/**
 * AdBanner renders a Google AdSense display ad inside a clearly-marked
 * dashed border container. When an ad blocker is detected (the <ins> stays
 * empty), a fallback message is shown instead.
 *
 * Replace the placeholder `slot` values with real slot IDs from AdSense:
 *   - SLOT_ABOVE_FOOTER
 *   - SLOT_RIGHT_SIDEBAR
 *   - SLOT_LEFT_SIDEBAR
 */
export function AdBanner({
    slot,
    format = "auto",
    // layout,
    // layoutKey,
    responsive = "true",
    client = "ca-pub-7183740147103241",
    className,
}: AdBannerProps) {
    useEffect(() => {
        try {
            const adsbygoogle = window.adsbygoogle || []
            adsbygoogle.push({})
        } catch (e) {
            console.error("[AdBanner] adsbygoogle.push failed:", e)
        }
    }, [])

    return (
        <div className={cn("ad-banner-container", className)}>
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client={client}
                data-ad-slot={slot}
                data-ad-format={format}
                // data-ad-layout={layout}
                // data-ad-layout-key={layoutKey}
                data-full-width-responsive={responsive}
            />
            {/* Shown when the <ins> is empty (ad blocker active) */}
            <p className="ad-fallback">
                Please disable your ad blocker to support us 🙏
            </p>
        </div>
    )
}

export function FooterAdBanner() {
    return (
        <div className="container mx-auto my-4 w-full px-4 md:px-6">
            <AdBanner slot="9666615332" format="auto" responsive="true" />
        </div>
    )
}
