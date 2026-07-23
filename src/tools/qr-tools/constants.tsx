import type {
    ContentType,
    DotType,
    CornerSquareType,
    CornerDotType,
    ErrorCorrectionLevel,
} from "./store"
import { Link2, Wifi, MessageCircle, ContactRound, Type } from "lucide-react"

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
    { name: "Perotron", src: "/qr-logos/perotron.svg" },
    { name: "GitHub", src: "/qr-logos/github.svg" },
    { name: "X", src: "/qr-logos/x-twitter.svg" },
    { name: "LinkedIn", src: "/qr-logos/linkedin.svg" },
    { name: "Instagram", src: "/qr-logos/instagram.svg" },
    { name: "YouTube", src: "/qr-logos/youtube.svg" },
    { name: "WhatsApp", src: "/qr-logos/whatsapp.svg" },
]

const CONTENT_TABS: {
    value: ContentType
    label: string
    icon: React.ReactNode
}[] = [
    { value: "url", label: "URL", icon: <Link2 className="size-3.5" /> },
    { value: "text", label: "Text", icon: <Type className="size-3.5" /> },
    { value: "wifi", label: "WiFi", icon: <Wifi className="size-3.5" /> },
    {
        value: "vcard",
        label: "vCard",
        icon: <ContactRound className="size-3.5" />,
    },
    {
        value: "whatsapp",
        label: "WhatsApp",
        icon: <MessageCircle className="size-3.5" />,
    },
]

export {
    DOT_TYPES,
    CORNER_SQUARE_TYPES,
    CORNER_DOT_TYPES,
    ERROR_CORRECTION_INFO,
    EXAMPLE_LOGOS,
    CONTENT_TABS,
}
