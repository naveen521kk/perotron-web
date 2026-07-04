import { create } from "zustand"

/* ── Content-type discriminated data ─────────────────────────────── */

export type ContentType = "url" | "text" | "vcard" | "whatsapp" | "wifi"

export interface UrlData {
    url: string
}

export interface TextData {
    text: string
}

export interface VCardData {
    firstName: string
    lastName: string
    organization: string
    title: string
    phone: string
    email: string
    url: string
    address: string
}

export interface WhatsAppData {
    phone: string
    message: string
}

export type WifiEncryption = "WPA" | "WEP" | "nopass"

export interface WifiData {
    ssid: string
    password: string
    encryption: WifiEncryption
    hidden: boolean
}

export type ContentDataMap = {
    url: UrlData
    text: TextData
    vcard: VCardData
    whatsapp: WhatsAppData
    wifi: WifiData
}

/* ── Style types ─────────────────────────────────────────────────── */

export type DotType =
    | "square"
    | "dots"
    | "rounded"
    | "extra-rounded"
    | "classy"
    | "classy-rounded"

export type CornerSquareType = "square" | "dot" | "extra-rounded"
export type CornerDotType = "square" | "dot"
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H"

export interface QrStyleOptions {
    dotType: DotType
    dotColor: string
    cornerSquareType: CornerSquareType
    cornerSquareColor: string
    cornerDotType: CornerDotType
    cornerDotColor: string
    backgroundColor: string
}

export interface QrLogoOptions {
    /** Data URL for user-uploaded, or path string for built-in logos */
    logoSrc: string | null
    logoSize: number
    logoMargin: number
}

export interface QrAdvancedOptions {
    errorCorrection: ErrorCorrectionLevel
    size: number
    margin: number
}

/* ── Store shape ─────────────────────────────────────────────────── */

interface QrState {
    contentType: ContentType
    contentData: ContentDataMap

    style: QrStyleOptions
    logo: QrLogoOptions
    advanced: QrAdvancedOptions

    setContentType: (type: ContentType) => void
    updateContentData: <T extends ContentType>(
        type: T,
        data: Partial<ContentDataMap[T]>
    ) => void

    setStyle: (patch: Partial<QrStyleOptions>) => void
    setLogo: (patch: Partial<QrLogoOptions>) => void
    setAdvanced: (patch: Partial<QrAdvancedOptions>) => void

    /** Resolve current content data into a QR-encodable string */
    getQrData: () => string

    reset: () => void
}

/* ── Defaults ────────────────────────────────────────────────────── */

const defaultContentData: ContentDataMap = {
    url: { url: "" },
    text: { text: "" },
    vcard: {
        firstName: "",
        lastName: "",
        organization: "",
        title: "",
        phone: "",
        email: "",
        url: "",
        address: "",
    },
    whatsapp: { phone: "", message: "" },
    wifi: { ssid: "", password: "", encryption: "WPA", hidden: false },
}

const defaultStyle: QrStyleOptions = {
    dotType: "square",
    dotColor: "#000000",
    cornerSquareType: "square",
    cornerSquareColor: "#000000",
    cornerDotType: "square",
    cornerDotColor: "#000000",
    backgroundColor: "#ffffff",
}

const defaultLogo: QrLogoOptions = {
    logoSrc: null,
    logoSize: 0.4,
    logoMargin: 5,
}

const defaultAdvanced: QrAdvancedOptions = {
    errorCorrection: "M",
    size: 400,
    margin: 10,
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function buildQrString(type: ContentType, data: ContentDataMap): string {
    switch (type) {
        case "url":
            return data.url.url || "https://example.com"

        case "text":
            return data.text.text || "Hello World"

        case "vcard": {
            const v = data.vcard
            const lines = [
                "BEGIN:VCARD",
                "VERSION:3.0",
                `N:${v.lastName};${v.firstName}`,
                `FN:${v.firstName} ${v.lastName}`.trim(),
            ]
            if (v.organization) lines.push(`ORG:${v.organization}`)
            if (v.title) lines.push(`TITLE:${v.title}`)
            if (v.phone) lines.push(`TEL:${v.phone}`)
            if (v.email) lines.push(`EMAIL:${v.email}`)
            if (v.url) lines.push(`URL:${v.url}`)
            if (v.address) lines.push(`ADR:;;${v.address}`)
            lines.push("END:VCARD")
            return lines.join("\n")
        }

        case "whatsapp": {
            const w = data.whatsapp
            const phone = w.phone.replace(/[^0-9]/g, "")
            if (!phone) return "https://wa.me/"
            const base = `https://wa.me/${phone}`
            return w.message
                ? `${base}?text=${encodeURIComponent(w.message)}`
                : base
        }

        case "wifi": {
            const f = data.wifi
            const ssid = f.ssid || "MyNetwork"
            const parts = [`WIFI:T:${f.encryption}`, `S:${ssid}`]
            if (f.encryption !== "nopass" && f.password) {
                parts.push(`P:${f.password}`)
            }
            parts.push(`H:${f.hidden}`)
            return parts.join(";") + ";;"
        }
    }
}

/* ── Store ────────────────────────────────────────────────────────── */

export const useQrStore = create<QrState>((set, get) => ({
    contentType: "url",
    contentData: structuredClone(defaultContentData),

    style: { ...defaultStyle },
    logo: { ...defaultLogo },
    advanced: { ...defaultAdvanced },

    setContentType: (type) => set({ contentType: type }),

    updateContentData: (type, data) =>
        set((state) => ({
            contentData: {
                ...state.contentData,
                [type]: { ...state.contentData[type], ...data },
            },
        })),

    setStyle: (patch) =>
        set((state) => ({ style: { ...state.style, ...patch } })),

    setLogo: (patch) =>
        set((state) => ({
            logo: { ...state.logo, ...patch },
        })),

    setAdvanced: (patch) =>
        set((state) => ({
            advanced: { ...state.advanced, ...patch },
        })),

    getQrData: () => {
        const s = get()
        return buildQrString(s.contentType, s.contentData)
    },

    reset: () =>
        set({
            contentType: "url",
            contentData: structuredClone(defaultContentData),
            style: { ...defaultStyle },
            logo: { ...defaultLogo },
            advanced: { ...defaultAdvanced },
        }),
}))
