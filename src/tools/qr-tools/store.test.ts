import { describe, it, expect, beforeEach } from "vitest"
import { useQrStore } from "./store"

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Reset helper                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

function resetStore() {
    useQrStore.getState().reset()
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Tests                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

describe("useQrStore", () => {
    beforeEach(resetStore)

    /* ── Initial state ───────────────────────────────────────────────────── */

    describe("initial state", () => {
        it("starts with contentType 'url'", () => {
            expect(useQrStore.getState().contentType).toBe("url")
        })

        it("starts with an empty url", () => {
            expect(useQrStore.getState().contentData.url.url).toBe("")
        })

        it("starts with default style — black dots on white background", () => {
            const { style } = useQrStore.getState()
            expect(style.dotColor).toBe("#000000")
            expect(style.backgroundColor).toBe("#ffffff")
        })

        it("starts with default error correction 'H'", () => {
            expect(useQrStore.getState().advanced.errorCorrection).toBe("H")
        })
    })

    /* ── setContentType ──────────────────────────────────────────────────── */

    describe("setContentType()", () => {
        it.each(["url", "text", "vcard", "whatsapp", "wifi"] as const)(
            "sets contentType to '%s'",
            (type) => {
                useQrStore.getState().setContentType(type)
                expect(useQrStore.getState().contentType).toBe(type)
            }
        )
    })

    /* ── updateContentData ───────────────────────────────────────────────── */

    describe("updateContentData()", () => {
        it("updates url data", () => {
            useQrStore.getState().updateContentData("url", { url: "https://example.com" })
            expect(useQrStore.getState().contentData.url.url).toBe("https://example.com")
        })

        it("updates text data", () => {
            useQrStore.getState().updateContentData("text", { text: "Hello!" })
            expect(useQrStore.getState().contentData.text.text).toBe("Hello!")
        })

        it("partially updates vcard data without clobbering other fields", () => {
            useQrStore.getState().updateContentData("vcard", { firstName: "John" })
            useQrStore.getState().updateContentData("vcard", { lastName: "Doe" })
            const { vcard } = useQrStore.getState().contentData
            expect(vcard.firstName).toBe("John")
            expect(vcard.lastName).toBe("Doe")
        })

        it("updates whatsapp phone", () => {
            useQrStore.getState().updateContentData("whatsapp", { phone: "+1234567890" })
            expect(useQrStore.getState().contentData.whatsapp.phone).toBe("+1234567890")
        })

        it("updates wifi ssid and password", () => {
            useQrStore.getState().updateContentData("wifi", { ssid: "MyNet", password: "secret" })
            const { wifi } = useQrStore.getState().contentData
            expect(wifi.ssid).toBe("MyNet")
            expect(wifi.password).toBe("secret")
        })

        it("does not affect other content types when updating one", () => {
            useQrStore.getState().updateContentData("url", { url: "https://example.com" })
            // text data should remain untouched
            expect(useQrStore.getState().contentData.text.text).toBe("")
        })
    })

    /* ── setStyle ────────────────────────────────────────────────────────── */

    describe("setStyle()", () => {
        it("patches dotColor without resetting other fields", () => {
            useQrStore.getState().setStyle({ dotColor: "#ff0000" })
            expect(useQrStore.getState().style.dotColor).toBe("#ff0000")
            expect(useQrStore.getState().style.backgroundColor).toBe("#ffffff")
        })

        it("patches multiple style fields at once", () => {
            useQrStore.getState().setStyle({ dotColor: "#ff0000", backgroundColor: "#000000" })
            expect(useQrStore.getState().style.dotColor).toBe("#ff0000")
            expect(useQrStore.getState().style.backgroundColor).toBe("#000000")
        })
    })

    /* ── setLogo ─────────────────────────────────────────────────────────── */

    describe("setLogo()", () => {
        it("sets logoSrc to null (no logo)", () => {
            useQrStore.getState().setLogo({ logoSrc: null })
            expect(useQrStore.getState().logo.logoSrc).toBeNull()
        })

        it("sets a custom logo data URL", () => {
            useQrStore.getState().setLogo({ logoSrc: "data:image/png;base64,abc" })
            expect(useQrStore.getState().logo.logoSrc).toBe("data:image/png;base64,abc")
        })

        it("patches logoSize without affecting logoSrc", () => {
            useQrStore.getState().setLogo({ logoSize: 0.3 })
            expect(useQrStore.getState().logo.logoSize).toBe(0.3)
            // logoSrc should remain at the default value
            expect(useQrStore.getState().logo.logoSrc).toBe("/qr-logos/perotron.svg")
        })
    })

    /* ── setAdvanced ─────────────────────────────────────────────────────── */

    describe("setAdvanced()", () => {
        it.each(["L", "M", "Q", "H"] as const)(
            "sets errorCorrection to '%s'",
            (level) => {
                useQrStore.getState().setAdvanced({ errorCorrection: level })
                expect(useQrStore.getState().advanced.errorCorrection).toBe(level)
            }
        )

        it("updates size", () => {
            useQrStore.getState().setAdvanced({ size: 600 })
            expect(useQrStore.getState().advanced.size).toBe(600)
        })

        it("updates margin", () => {
            useQrStore.getState().setAdvanced({ margin: 20 })
            expect(useQrStore.getState().advanced.margin).toBe(20)
        })
    })

    /* ── getQrData / buildQrString ───────────────────────────────────────── */

    describe("getQrData() — URL mode", () => {
        it("returns the URL when set", () => {
            useQrStore.getState().setContentType("url")
            useQrStore.getState().updateContentData("url", { url: "https://tools.naveenmk.me" })
            expect(useQrStore.getState().getQrData()).toBe("https://tools.naveenmk.me")
        })

        it("returns the fallback URL when url is empty", () => {
            useQrStore.getState().setContentType("url")
            useQrStore.getState().updateContentData("url", { url: "" })
            expect(useQrStore.getState().getQrData()).toBe("https://perotron.com")
        })
    })

    describe("getQrData() — text mode", () => {
        it("returns the text when set", () => {
            useQrStore.getState().setContentType("text")
            useQrStore.getState().updateContentData("text", { text: "Hello World" })
            expect(useQrStore.getState().getQrData()).toBe("Hello World")
        })

        it("returns 'Hello World' fallback when text is empty", () => {
            useQrStore.getState().setContentType("text")
            useQrStore.getState().updateContentData("text", { text: "" })
            expect(useQrStore.getState().getQrData()).toBe("Hello World")
        })
    })

    describe("getQrData() — vCard mode", () => {
        it("produces a valid vCard 3.0 string with all fields", () => {
            useQrStore.getState().setContentType("vcard")
            useQrStore.getState().updateContentData("vcard", {
                firstName: "Jane",
                lastName: "Doe",
                organization: "Acme",
                title: "Engineer",
                phone: "+1234567890",
                email: "jane@example.com",
                url: "https://jane.dev",
                address: "123 Main St, City",
            })
            const result = useQrStore.getState().getQrData()
            expect(result).toContain("BEGIN:VCARD")
            expect(result).toContain("VERSION:3.0")
            expect(result).toContain("N:Doe;Jane")
            expect(result).toContain("FN:Jane Doe")
            expect(result).toContain("ORG:Acme")
            expect(result).toContain("TITLE:Engineer")
            expect(result).toContain("TEL:+1234567890")
            expect(result).toContain("EMAIL:jane@example.com")
            expect(result).toContain("URL:https://jane.dev")
            expect(result).toContain("ADR:;;123 Main St, City")
            expect(result).toContain("END:VCARD")
        })

        it("omits optional fields when they are empty", () => {
            useQrStore.getState().setContentType("vcard")
            useQrStore.getState().updateContentData("vcard", {
                firstName: "Alice",
                lastName: "",
                organization: "",
                title: "",
                phone: "",
                email: "",
                url: "",
                address: "",
            })
            const result = useQrStore.getState().getQrData()
            expect(result).not.toContain("ORG:")
            expect(result).not.toContain("TITLE:")
            expect(result).not.toContain("TEL:")
            expect(result).not.toContain("EMAIL:")
            expect(result).not.toContain("URL:")
            expect(result).not.toContain("ADR:")
        })

        it("trims FN when only first name is provided", () => {
            useQrStore.getState().setContentType("vcard")
            useQrStore.getState().updateContentData("vcard", {
                firstName: "Solo",
                lastName: "",
                organization: "",
                title: "",
                phone: "",
                email: "",
                url: "",
                address: "",
            })
            const result = useQrStore.getState().getQrData()
            // "Solo " trimmed to "Solo"
            expect(result).toContain("FN:Solo")
            expect(result).not.toContain("FN:Solo ")
        })
    })

    describe("getQrData() — WhatsApp mode", () => {
        it("builds a WhatsApp link with phone only", () => {
            useQrStore.getState().setContentType("whatsapp")
            useQrStore.getState().updateContentData("whatsapp", { phone: "+1 (234) 567-890", message: "" })
            const result = useQrStore.getState().getQrData()
            // Non-digit chars stripped: 1234567890
            expect(result).toBe("https://wa.me/1234567890")
        })

        it("appends encoded message when provided", () => {
            useQrStore.getState().setContentType("whatsapp")
            useQrStore.getState().updateContentData("whatsapp", {
                phone: "1234567890",
                message: "Hello there!",
            })
            const result = useQrStore.getState().getQrData()
            expect(result).toBe("https://wa.me/1234567890?text=Hello%20there!")
        })

        it("returns bare link when phone is empty", () => {
            useQrStore.getState().setContentType("whatsapp")
            useQrStore.getState().updateContentData("whatsapp", { phone: "", message: "" })
            expect(useQrStore.getState().getQrData()).toBe("https://wa.me/")
        })

        it("strips all non-digit characters from phone number", () => {
            useQrStore.getState().setContentType("whatsapp")
            useQrStore.getState().updateContentData("whatsapp", {
                phone: "+(44) 7911 123456",
                message: "",
            })
            const result = useQrStore.getState().getQrData()
            expect(result).toBe("https://wa.me/447911123456")
        })
    })

    describe("getQrData() — WiFi mode", () => {
        it("builds a WPA WiFi string with password", () => {
            useQrStore.getState().setContentType("wifi")
            useQrStore.getState().updateContentData("wifi", {
                ssid: "HomeNetwork",
                password: "myPassword",
                encryption: "WPA",
                hidden: false,
            })
            const result = useQrStore.getState().getQrData()
            expect(result).toBe("WIFI:T:WPA;S:HomeNetwork;P:myPassword;H:false;;")
        })

        it("omits password for 'nopass' encryption", () => {
            useQrStore.getState().setContentType("wifi")
            useQrStore.getState().updateContentData("wifi", {
                ssid: "OpenNet",
                password: "ignored",
                encryption: "nopass",
                hidden: false,
            })
            const result = useQrStore.getState().getQrData()
            expect(result).not.toContain("P:")
            expect(result).toBe("WIFI:T:nopass;S:OpenNet;H:false;;")
        })

        it("marks hidden network correctly", () => {
            useQrStore.getState().setContentType("wifi")
            useQrStore.getState().updateContentData("wifi", {
                ssid: "SecretNet",
                password: "pwd",
                encryption: "WPA",
                hidden: true,
            })
            const result = useQrStore.getState().getQrData()
            expect(result).toContain("H:true")
        })

        it("falls back to 'MyNetwork' when ssid is empty", () => {
            useQrStore.getState().setContentType("wifi")
            useQrStore.getState().updateContentData("wifi", {
                ssid: "",
                password: "pwd",
                encryption: "WEP",
                hidden: false,
            })
            const result = useQrStore.getState().getQrData()
            expect(result).toContain("S:MyNetwork")
        })

        it("builds a WEP WiFi string correctly", () => {
            useQrStore.getState().setContentType("wifi")
            useQrStore.getState().updateContentData("wifi", {
                ssid: "OldNet",
                password: "wepkey",
                encryption: "WEP",
                hidden: false,
            })
            const result = useQrStore.getState().getQrData()
            expect(result).toBe("WIFI:T:WEP;S:OldNet;P:wepkey;H:false;;")
        })
    })

    /* ── reset ───────────────────────────────────────────────────────────── */

    describe("reset()", () => {
        it("restores contentType to 'url'", () => {
            useQrStore.getState().setContentType("wifi")
            useQrStore.getState().reset()
            expect(useQrStore.getState().contentType).toBe("url")
        })

        it("restores contentData to empty defaults", () => {
            useQrStore.getState().updateContentData("url", { url: "https://example.com" })
            useQrStore.getState().reset()
            expect(useQrStore.getState().contentData.url.url).toBe("")
        })

        it("restores default style", () => {
            useQrStore.getState().setStyle({ dotColor: "#ff0000" })
            useQrStore.getState().reset()
            expect(useQrStore.getState().style.dotColor).toBe("#000000")
        })

        it("restores default advanced options", () => {
            useQrStore.getState().setAdvanced({ size: 800, errorCorrection: "L" })
            useQrStore.getState().reset()
            expect(useQrStore.getState().advanced.size).toBe(400)
            expect(useQrStore.getState().advanced.errorCorrection).toBe("H")
        })

        it("restores default logo", () => {
            useQrStore.getState().setLogo({ logoSrc: null })
            useQrStore.getState().reset()
            expect(useQrStore.getState().logo.logoSrc).toBe("/qr-logos/perotron.svg")
        })
    })
})
