import { createFileRoute } from "@tanstack/react-router"
import {
    QrCode,
    Download,
    Upload,
    ImagePlus,
    X,
    Info,
    Palette,
    Settings2,
    Type,
    Link2,
    Wifi,
    MessageCircle,
    ContactRound,
    ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Slider } from "@/components/ui/slider"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQrStore } from "@/store/qr-store"
import type {
    ContentType,
    DotType,
    CornerSquareType,
    CornerDotType,
    ErrorCorrectionLevel,
    WifiEncryption,
} from "@/store/qr-store"
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import QRCodeStyling from "qr-code-styling"

/* ── Lazy-loaded ad components ─────────────────────────────────── */

const AdBanner = lazy(() =>
    import("@/components/ad-banner").then((m) => ({ default: m.AdBanner }))
)
const FooterAdBanner = lazy(() =>
    import("@/components/ad-banner").then((m) => ({
        default: m.FooterAdBanner,
    }))
)

/* ── Route ──────────────────────────────────────────────────────── */

export const Route = createFileRoute("/qr/generator")({
    head: () => ({
        meta: [
            {
                title: "QR Code Generator — Create Custom QR Codes | Perotron Web",
            },
            {
                name: "description",
                content:
                    "Generate free, custom QR codes for URLs, WiFi, vCards, WhatsApp, and plain text. Style with custom colors, dot shapes, and logos. Download as JPEG, PNG or SVG — all in your browser.",
            },
            {
                property: "og:title",
                content:
                    "QR Code Generator — Create Custom QR Codes | Perotron Web",
            },
            {
                property: "og:description",
                content:
                    "Generate free, custom QR codes for URLs, WiFi, vCards, WhatsApp, and plain text. Style with custom colors, dot shapes, and logos. Download as JPEG, PNG or SVG — all in your browser.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content:
                    "QR Code Generator — Create Custom QR Codes | Perotron Web",
            },
            {
                name: "twitter:description",
                content:
                    "Generate free, custom QR codes for URLs, WiFi, vCards, WhatsApp, and plain text. Style with custom colors, dot shapes, and logos. Download as JPEG, PNG or SVG — all in your browser.",
            },
        ],
        links: [
            {
                rel: "canonical",
                href: "https://tools.naveenmk.me/qr/generator",
            },
        ],
    }),
    component: QrGeneratorPage,
})

/* ── Constants ──────────────────────────────────────────────────── */

const DOT_TYPES: { value: DotType; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "dots", label: "Dots" },
    { value: "rounded", label: "Rounded" },
    { value: "extra-rounded", label: "Extra Round" },
    { value: "classy", label: "Classy" },
    { value: "classy-rounded", label: "Classy Round" },
]

const CORNER_SQUARE_TYPES: { value: CornerSquareType; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "dot", label: "Dot" },
    { value: "extra-rounded", label: "Rounded" },
]

const CORNER_DOT_TYPES: { value: CornerDotType; label: string }[] = [
    { value: "square", label: "Square" },
    { value: "dot", label: "Dot" },
]

const ERROR_CORRECTION_INFO: Record<
    ErrorCorrectionLevel,
    { label: string; detail: string }
> = {
    L: {
        label: "Low (7%)",
        detail: "Smallest QR code. Best when the code will always be displayed cleanly (screens, pristine prints).",
    },
    M: {
        label: "Medium (15%)",
        detail: "Good default. Handles minor scuffs and partial obstruction.",
    },
    Q: {
        label: "Quartile (25%)",
        detail: "Survives moderate damage. Use for printed materials that may get worn.",
    },
    H: {
        label: "High (30%)",
        detail: "Maximum resilience. Required when embedding a logo — the logo obscures part of the code.",
    },
}

const EXAMPLE_LOGOS = [
    { name: "GitHub", src: "/qr-logos/github.svg" },
    { name: "X", src: "/qr-logos/x-twitter.svg" },
    { name: "LinkedIn", src: "/qr-logos/linkedin.svg" },
    { name: "Instagram", src: "/qr-logos/instagram.svg" },
    { name: "YouTube", src: "/qr-logos/youtube.svg" },
    { name: "WhatsApp", src: "/qr-logos/whatsapp.svg" },
]

const CONTENT_TABS: { value: ContentType; label: string; icon: React.ReactNode }[] = [
    { value: "url", label: "URL", icon: <Link2 className="size-3.5" /> },
    { value: "text", label: "Text", icon: <Type className="size-3.5" /> },
    { value: "wifi", label: "WiFi", icon: <Wifi className="size-3.5" /> },
    { value: "vcard", label: "vCard", icon: <ContactRound className="size-3.5" /> },
    { value: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="size-3.5" /> },
]

/* ── Main Page ──────────────────────────────────────────────────── */

function QrGeneratorPage() {
    return (
        <>
            <div className="flex w-full flex-1">
                {/* ── Main content ── */}
                <div className="flex flex-1 flex-col items-center px-4">
                    {/* ── Hero ── */}
                    <section className="mx-auto flex w-full max-w-4xl animate-in flex-col items-center gap-4 pt-12 pb-8 text-center duration-700 fade-in slide-in-from-bottom-6">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                            <QrCode className="size-7" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            QR Code Generator
                        </h1>
                        <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                            Create custom-styled QR codes for URLs, WiFi, contacts,
                            and more. Add your logo, pick your colors — download
                            instantly.
                        </p>
                    </section>

                    {/* ── Main layout ── */}
                    <section className="mx-auto w-full max-w-6xl animate-in pb-16 duration-500 fade-in slide-in-from-bottom-4">
                        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                            <div className="order-2 lg:order-1 lg:sticky lg:top-20 lg:self-start">
                                <PreviewPanel />
                            </div>
                            <div className="order-1 lg:order-2">
                                <ConfigPanel />
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── Right sidebar ad (lg+ only) ── */}
                <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col items-start gap-4 p-4 xl:flex lg:max-w-lg xl:w-1/4 2xl:w-1/3">
                    <Suspense fallback={null}>
                        <AdBanner
                            slot="3456430201"
                            format="auto"
                            responsive="true"
                            className="w-full"
                        />
                    </Suspense>
                </aside>
            </div>
            <FooterAdBanner />
        </>
    )
}

/* ── Config Panel ───────────────────────────────────────────────── */

function ConfigPanel() {
    return (
        <div className="flex flex-col gap-0">
            <Accordion
                type="multiple"
                defaultValue={["content", "style", "logo", "advanced"]}
                className="w-full"
            >
                {/* ── Content Type ── */}
                <AccordionItem value="content">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Type className="size-4 text-muted-foreground" />
                            Content
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="h-auto">
                        <ContentSection />
                    </AccordionContent>
                </AccordionItem>

                {/* ── Style ── */}
                <AccordionItem value="style">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Palette className="size-4 text-muted-foreground" />
                            Style
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <StyleSection />
                    </AccordionContent>
                </AccordionItem>

                {/* ── Logo ── */}
                <AccordionItem value="logo">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <ImagePlus className="size-4 text-muted-foreground" />
                            Logo
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <LogoSection />
                    </AccordionContent>
                </AccordionItem>

                {/* ── Advanced ── */}
                <AccordionItem value="advanced">
                    <AccordionTrigger>
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4 text-muted-foreground" />
                            Advanced
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <AdvancedSection />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}

/* ── Content Section ────────────────────────────────────────────── */

function ContentSection() {
    const { contentType, setContentType } = useQrStore()
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const visibleButtons = isMobile
        ? ["url", "text"]
        : ["url", "text", "wifi"]

    const dropdownTabs = CONTENT_TABS.filter(
        (tab) => !visibleButtons.includes(tab.value)
    )

    const isActiveInDropdown = dropdownTabs.some(
        (tab) => tab.value === contentType
    )
    const activeDropdownTab = dropdownTabs.find(
        (tab) => tab.value === contentType
    )

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2" data-testid="content-type-tabs">
                {CONTENT_TABS.filter((tab) =>
                    visibleButtons.includes(tab.value)
                ).map((tab) => {
                    const isActive = contentType === tab.value
                    return (
                        <Button
                            key={tab.value}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            className="flex items-center gap-1.5 h-9"
                            onClick={() => setContentType(tab.value)}
                            data-testid={`content-tab-${tab.value}`}
                            data-active={isActive ? "true" : "false"}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </Button>
                    )
                })}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={isActiveInDropdown ? "default" : "outline"}
                            size="sm"
                            className="flex items-center gap-1.5 h-9"
                            data-testid="content-tab-more"
                        >
                            {isActiveInDropdown && activeDropdownTab ? (
                                <>
                                    {activeDropdownTab.icon}
                                    <span>{activeDropdownTab.label}</span>
                                </>
                            ) : (
                                <span>More</span>
                            )}
                            <ChevronDown className="size-3.5 opacity-60" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {dropdownTabs.map((tab) => (
                            <DropdownMenuItem
                                key={tab.value}
                                onClick={() => setContentType(tab.value)}
                                className="flex items-center gap-2 cursor-pointer"
                                data-testid={`content-tab-${tab.value}`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="mt-2" data-testid="content-form">
                {contentType === "url" && <UrlForm />}
                {contentType === "text" && <TextForm />}
                {contentType === "vcard" && <VCardForm />}
                {contentType === "whatsapp" && <WhatsAppForm />}
                {contentType === "wifi" && <WiFiForm />}
            </div>
        </div>
    )
}

/* ── Content Forms ──────────────────────────────────────────────── */

function UrlForm() {
    const data = useQrStore((s) => s.contentData.url)
    const update = useQrStore((s) => s.updateContentData)

    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="qr-url">URL</Label>
            <Input
                id="qr-url"
                type="url"
                placeholder="https://example.com"
                value={data.url}
                onChange={(e) => update("url", { url: e.target.value })}
            />
        </div>
    )
}

function TextForm() {
    const data = useQrStore((s) => s.contentData.text)
    const update = useQrStore((s) => s.updateContentData)

    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor="qr-text">Text</Label>
            <textarea
                id="qr-text"
                className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Enter your text here…"
                value={data.text}
                onChange={(e) => update("text", { text: e.target.value })}
            />
        </div>
    )
}

function VCardForm() {
    const data = useQrStore((s) => s.contentData.vcard)
    const update = useQrStore((s) => s.updateContentData)

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="vc-first">First Name</Label>
                    <Input
                        id="vc-first"
                        placeholder="John"
                        value={data.firstName}
                        onChange={(e) =>
                            update("vcard", { firstName: e.target.value })
                        }
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="vc-last">Last Name</Label>
                    <Input
                        id="vc-last"
                        placeholder="Doe"
                        value={data.lastName}
                        onChange={(e) =>
                            update("vcard", { lastName: e.target.value })
                        }
                    />
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="vc-org">Organization</Label>
                <Input
                    id="vc-org"
                    placeholder="Company Name"
                    value={data.organization}
                    onChange={(e) =>
                        update("vcard", { organization: e.target.value })
                    }
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="vc-title">Job Title</Label>
                <Input
                    id="vc-title"
                    placeholder="Software Engineer"
                    value={data.title}
                    onChange={(e) =>
                        update("vcard", { title: e.target.value })
                    }
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="vc-phone">Phone</Label>
                <Input
                    id="vc-phone"
                    type="tel"
                    placeholder="+1 234 567 890"
                    value={data.phone}
                    onChange={(e) =>
                        update("vcard", { phone: e.target.value })
                    }
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="vc-email">Email</Label>
                <Input
                    id="vc-email"
                    type="email"
                    placeholder="john@example.com"
                    value={data.email}
                    onChange={(e) =>
                        update("vcard", { email: e.target.value })
                    }
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="vc-url">Website</Label>
                <Input
                    id="vc-url"
                    type="url"
                    placeholder="https://example.com"
                    value={data.url}
                    onChange={(e) =>
                        update("vcard", { url: e.target.value })
                    }
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="vc-address">Address</Label>
                <Input
                    id="vc-address"
                    placeholder="123 Main St, City, Country"
                    value={data.address}
                    onChange={(e) =>
                        update("vcard", { address: e.target.value })
                    }
                />
            </div>
        </div>
    )
}

function WhatsAppForm() {
    const data = useQrStore((s) => s.contentData.whatsapp)
    const update = useQrStore((s) => s.updateContentData)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="wa-phone">Phone Number</Label>
                <Input
                    id="wa-phone"
                    type="tel"
                    placeholder="1234567890 (no + or spaces)"
                    value={data.phone}
                    onChange={(e) =>
                        update("whatsapp", { phone: e.target.value })
                    }
                />
                <p className="text-xs text-muted-foreground">
                    International format without + sign, dashes, or spaces.
                </p>
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="wa-msg">Pre-filled Message (optional)</Label>
                <Input
                    id="wa-msg"
                    placeholder="Hello! I'd like to know more…"
                    value={data.message}
                    onChange={(e) =>
                        update("whatsapp", { message: e.target.value })
                    }
                />
            </div>
        </div>
    )
}

function WiFiForm() {
    const data = useQrStore((s) => s.contentData.wifi)
    const update = useQrStore((s) => s.updateContentData)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                <Input
                    id="wifi-ssid"
                    placeholder="MyWiFiNetwork"
                    value={data.ssid}
                    onChange={(e) =>
                        update("wifi", { ssid: e.target.value })
                    }
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="wifi-pass">Password</Label>
                <Input
                    id="wifi-pass"
                    type="password"
                    placeholder="••••••••"
                    value={data.password}
                    onChange={(e) =>
                        update("wifi", { password: e.target.value })
                    }
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>Encryption</Label>
                <Select
                    value={data.encryption}
                    onValueChange={(v) =>
                        update("wifi", {
                            encryption: v as WifiEncryption,
                        })
                    }
                >
                    <SelectTrigger id="wifi-enc">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="WPA">WPA/WPA2</SelectItem>
                        <SelectItem value="WEP">WEP</SelectItem>
                        <SelectItem value="nopass">None (Open)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <input
                    id="wifi-hidden"
                    type="checkbox"
                    className="size-4 rounded border border-input accent-primary"
                    checked={data.hidden}
                    onChange={(e) =>
                        update("wifi", { hidden: e.target.checked })
                    }
                />
                <Label htmlFor="wifi-hidden" className="text-sm">
                    Hidden network
                </Label>
            </div>
        </div>
    )
}

/* ── Style Section ──────────────────────────────────────────────── */

function StyleSection() {
    const { style, setStyle } = useQrStore()

    return (
        <div className="flex flex-col gap-5">
            {/* Dot Type */}
            <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                    Dot Shape
                </Label>
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={style.dotType}
                    onValueChange={(v) => {
                        if (v) setStyle({ dotType: v as DotType })
                    }}
                    className="flex flex-wrap"
                    data-testid="dot-type-toggle"
                >
                    {DOT_TYPES.map((dt) => (
                        <ToggleGroupItem
                            key={dt.value}
                            value={dt.value}
                            className="text-xs"
                            data-testid={`dot-type-${dt.value}`}
                        >
                            {dt.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            {/* Dot Color */}
            <ColorPickerField
                label="Dot Color"
                value={style.dotColor}
                onChange={(c) => setStyle({ dotColor: c })}
                testId="dot-color"
            />

            <Separator />

            {/* Corner Square */}
            <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                    Corner Square Shape
                </Label>
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={style.cornerSquareType}
                    onValueChange={(v) => {
                        if (v)
                            setStyle({
                                cornerSquareType: v as CornerSquareType,
                            })
                    }}
                    className="flex flex-wrap"
                    data-testid="corner-square-toggle"
                >
                    {CORNER_SQUARE_TYPES.map((ct) => (
                        <ToggleGroupItem
                            key={ct.value}
                            value={ct.value}
                            className="text-xs"
                            data-testid={`corner-square-${ct.value}`}
                        >
                            {ct.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <ColorPickerField
                label="Corner Square Color"
                value={style.cornerSquareColor}
                onChange={(c) => setStyle({ cornerSquareColor: c })}
                testId="corner-square-color"
            />

            <Separator />

            {/* Corner Dot */}
            <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                    Corner Dot Shape
                </Label>
                <ToggleGroup
                    type="single"
                    variant="outline"
                    value={style.cornerDotType}
                    onValueChange={(v) => {
                        if (v)
                            setStyle({ cornerDotType: v as CornerDotType })
                    }}
                    className="flex flex-wrap"
                    data-testid="corner-dot-toggle"
                >
                    {CORNER_DOT_TYPES.map((cd) => (
                        <ToggleGroupItem
                            key={cd.value}
                            value={cd.value}
                            className="text-xs"
                            data-testid={`corner-dot-${cd.value}`}
                        >
                            {cd.label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>
            </div>

            <ColorPickerField
                label="Corner Dot Color"
                value={style.cornerDotColor}
                onChange={(c) => setStyle({ cornerDotColor: c })}
                testId="corner-dot-color"
            />

            <Separator />

            {/* Background Color */}
            <ColorPickerField
                label="Background"
                value={style.backgroundColor}
                onChange={(c) => setStyle({ backgroundColor: c })}
                testId="background-color"
            />
        </div>
    )
}

/* ── Logo Section ───────────────────────────────────────────────── */

function LogoSection() {
    const { logo, setLogo, advanced, setAdvanced } = useQrStore()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return

            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file.")
                return
            }

            const reader = new FileReader()
            reader.onload = () => {
                setLogo({ logoSrc: reader.result as string })
                // Auto-upgrade error correction when adding a logo
                if (advanced.errorCorrection !== "H") {
                    setAdvanced({ errorCorrection: "H" })
                    toast.info(
                        "Error correction set to High — required for logos to remain scannable."
                    )
                }
            }
            reader.readAsDataURL(file)
        },
        [setLogo, setAdvanced, advanced.errorCorrection]
    )

    const selectExampleLogo = useCallback(
        (src: string) => {
            setLogo({ logoSrc: src })
            if (advanced.errorCorrection !== "H") {
                setAdvanced({ errorCorrection: "H" })
                toast.info(
                    "Error correction set to High — required for logos to remain scannable."
                )
            }
        },
        [setLogo, setAdvanced, advanced.errorCorrection]
    )

    const removeLogo = useCallback(() => {
        setLogo({ logoSrc: null })
        if (fileInputRef.current) fileInputRef.current.value = ""
    }, [setLogo])

    return (
        <div className="flex flex-col gap-4">
            {/* Upload */}
            <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                    Custom Logo
                </Label>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-1.5"
                        data-testid="logo-upload-btn"
                    >
                        <Upload className="size-3.5" />
                        Upload
                    </Button>
                    {logo.logoSrc && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeLogo}
                            className="gap-1.5 text-destructive hover:text-destructive"
                            data-testid="logo-remove-btn"
                        >
                            <X className="size-3.5" />
                            Remove
                        </Button>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    data-testid="logo-file-input"
                />
            </div>

            {/* Example logos */}
            <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">
                    Or pick an example
                </Label>
                <div className="grid grid-cols-6 gap-2" data-testid="example-logos">
                    {EXAMPLE_LOGOS.map((ex) => (
                        <TooltipProvider key={ex.name}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectExampleLogo(ex.src)
                                        }
                                        className={`flex items-center justify-center rounded-lg border p-2.5 transition-all hover:bg-muted ${
                                            logo.logoSrc === ex.src
                                                ? "border-primary bg-primary/10"
                                                : "border-border"
                                        }`}
                                        data-testid={`logo-example-${ex.name.toLowerCase()}`}
                                        data-selected={logo.logoSrc === ex.src ? "true" : "false"}
                                    >
                                        <img
                                            src={ex.src}
                                            alt={ex.name}
                                            className="size-5 dark:invert"
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>{ex.name}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </div>

            {/* Logo size + margin */}
            {logo.logoSrc && (
                <>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">
                                Logo Size
                            </Label>
                            <span className="text-xs tabular-nums text-muted-foreground" data-testid="logo-size-value">
                                {Math.round(logo.logoSize * 100)}%
                            </span>
                        </div>
                        <Slider
                            min={15}
                            max={50}
                            step={1}
                            value={[Math.round(logo.logoSize * 100)]}
                            onValueChange={([v]) =>
                                setLogo({ logoSize: v / 100 })
                            }
                            data-testid="logo-size-slider"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">
                                Logo Margin
                            </Label>
                            <span className="text-xs tabular-nums text-muted-foreground" data-testid="logo-margin-value">
                                {logo.logoMargin}px
                            </span>
                        </div>
                        <Slider
                            min={0}
                            max={20}
                            step={1}
                            value={[logo.logoMargin]}
                            onValueChange={([v]) =>
                                setLogo({ logoMargin: v })
                            }
                            data-testid="logo-margin-slider"
                        />
                    </div>
                </>
            )}
        </div>
    )
}

/* ── Advanced Section ───────────────────────────────────────────── */

function AdvancedSection() {
    const { advanced, setAdvanced } = useQrStore()

    return (
        <div className="flex flex-col gap-5">
            {/* Error Correction */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                        Error Correction Level
                    </Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="size-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                Higher error correction makes the QR code more
                                resilient to damage but increases its density.
                                Use High (H) when embedding a logo.
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <RadioGroup
                    value={advanced.errorCorrection}
                    onValueChange={(v) =>
                        setAdvanced({
                            errorCorrection: v as ErrorCorrectionLevel,
                        })
                    }
                    className="flex flex-col gap-2"
                    data-testid="error-correction-group"
                >
                    {(
                        Object.entries(ERROR_CORRECTION_INFO) as [
                            ErrorCorrectionLevel,
                            { label: string; detail: string },
                        ][]
                    ).map(([key, info]) => (
                        <label
                            key={key}
                            htmlFor={`ec-${key}`}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5 hover:bg-muted"
                            data-testid={`ec-label-${key}`}
                        >
                            <RadioGroupItem
                                value={key}
                                id={`ec-${key}`}
                                className="mt-0.5"
                            />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium">
                                    {info.label}
                                </span>
                                <span className="text-xs leading-relaxed text-muted-foreground">
                                    {info.detail}
                                </span>
                            </div>
                        </label>
                    ))}
                </RadioGroup>
            </div>

            <Separator />

            {/* QR Size */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                        QR Code Size
                    </Label>
                    <span className="text-xs tabular-nums text-muted-foreground" data-testid="qr-size-value">
                        {advanced.size}px
                    </span>
                </div>
                <Slider
                    min={200}
                    max={1000}
                    step={50}
                    value={[advanced.size]}
                    onValueChange={([v]) => setAdvanced({ size: v })}
                    data-testid="qr-size-slider"
                />
            </div>

            {/* Quiet Zone */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">
                        Quiet Zone (Margin)
                    </Label>
                    <span className="text-xs tabular-nums text-muted-foreground" data-testid="qr-margin-value">
                        {advanced.margin}px
                    </span>
                </div>
                <Slider
                    min={0}
                    max={50}
                    step={5}
                    value={[advanced.margin]}
                    onValueChange={([v]) => setAdvanced({ margin: v })}
                    data-testid="qr-margin-slider"
                />
            </div>
        </div>
    )
}

/* ── Preview Panel ──────────────────────────────────────────────── */

function PreviewPanel() {
    const store = useQrStore()
    const qrRef = useRef<HTMLDivElement>(null)
    const qrInstanceRef = useRef<QRCodeStyling | null>(null)
    const [isReady, setIsReady] = useState(false)

    // Build the QR data string
    const qrData = store.getQrData()

    // Create/update QR code instance
    useEffect(() => {
        const options = {
            width: store.advanced.size,
            height: store.advanced.size,
            data: qrData,
            margin: store.advanced.margin,
            type: "canvas" as const,
            dotsOptions: {
                type: store.style.dotType,
                color: store.style.dotColor,
            },
            cornersSquareOptions: {
                type: store.style.cornerSquareType,
                color: store.style.cornerSquareColor,
            },
            cornersDotOptions: {
                type: store.style.cornerDotType,
                color: store.style.cornerDotColor,
            },
            backgroundOptions: {
                color: store.style.backgroundColor,
            },
            qrOptions: {
                errorCorrectionLevel: store.advanced.errorCorrection,
            },
            imageOptions: {
                hideBackgroundDots: true,
                imageSize: store.logo.logoSize,
                margin: store.logo.logoMargin,
                crossOrigin: "anonymous" as const,
            },
            ...(store.logo.logoSrc ? { image: store.logo.logoSrc } : {}),
        }

        if (!qrInstanceRef.current) {
            qrInstanceRef.current = new QRCodeStyling(options)
            if (qrRef.current) {
                qrRef.current.innerHTML = ""
                qrInstanceRef.current.append(qrRef.current)
            }
            setIsReady(true)
        } else {
            qrInstanceRef.current.update(options)
        }
    }, [
        qrData,
        store.style,
        store.logo,
        store.advanced,
    ])

    const handleDownload = useCallback(
        (ext: "png" | "jpeg" | "svg") => {
            if (!qrInstanceRef.current) return
            qrInstanceRef.current.download({
                name: "qr-code",
                extension: ext,
            })
            toast.success(
                `QR code downloaded as ${ext.toUpperCase()}`
            )
        },
        []
    )

    return (
        <div className="flex w-full flex-col items-center gap-6" data-testid="preview-panel">
            {/* Preview card */}
            <Card className="flex w-full items-center justify-center overflow-hidden p-8">
                <div
                    ref={qrRef}
                    className="flex items-center justify-center [&>canvas]:max-w-full [&>canvas]:h-auto"
                    data-testid="qr-canvas-container"
                />
                {!isReady && (
                    <div className="flex size-64 items-center justify-center text-muted-foreground" data-testid="qr-loading-placeholder">
                        <QrCode className="size-16 animate-pulse opacity-30" />
                    </div>
                )}
            </Card>

            {/* Download buttons */}
            <div className="flex w-full flex-col gap-3">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Download
                </p>
                <div className="flex flex-wrap gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="w-full gap-2" data-testid="download-image-btn">
                                <Download className="size-4" />
                                Download as Image
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => handleDownload("png")} data-testid="download-png">
                                PNG
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload("jpeg")} data-testid="download-jpeg">
                                JPEG
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="outline"
                        onClick={() => handleDownload("svg")}
                        className="w-full gap-2"
                        data-testid="download-svg-btn"
                    >
                        <Download className="size-4" />
                        SVG
                    </Button>
                </div>
            </div>

            {/* Info badge */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3" data-testid="privacy-badge">
                <Badge variant="secondary" className="text-xs">
                    Client-side
                </Badge>
                <p className="text-xs text-muted-foreground">
                    Your data stays in your browser.
                </p>
            </div>
        </div>
    )
}

/* ── Reusable color picker ──────────────────────────────────────── */

function ColorPickerField({
    label,
    value,
    onChange,
    testId,
}: {
    label: string
    value: string
    onChange: (color: string) => void
    testId?: string
}) {
    return (
        <div className="flex items-center gap-3" data-testid={testId ? `color-field-${testId}` : undefined}>
            <div className="relative">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="size-8 cursor-pointer appearance-none rounded-md border border-border bg-transparent p-0.5"
                    data-testid={testId ? `color-picker-${testId}` : undefined}
                />
            </div>
            <div className="flex flex-col gap-0.5">
                <Label className="text-xs text-muted-foreground">
                    {label}
                </Label>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-7 w-24 font-mono text-xs uppercase"
                    maxLength={7}
                    data-testid={testId ? `color-input-${testId}` : undefined}
                />
            </div>
        </div>
    )
}
