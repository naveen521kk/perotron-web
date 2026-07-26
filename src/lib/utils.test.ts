import { describe, it, expect } from "vitest"
import { cn } from "./utils"

describe("cn()", () => {
    it("returns an empty string when called with no arguments", () => {
        expect(cn()).toBe("")
    })

    it("returns a single class unchanged", () => {
        expect(cn("foo")).toBe("foo")
    })

    it("joins multiple classes with a space", () => {
        expect(cn("foo", "bar", "baz")).toBe("foo bar baz")
    })

    it("handles undefined / null / false values without adding them", () => {
        expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar")
    })

    it("handles conditional object syntax from clsx", () => {
        expect(cn({ active: true, hidden: false })).toBe("active")
    })

    it("handles mixed array and string inputs", () => {
        expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz")
    })

    // tailwind-merge conflict resolution
    it("resolves conflicting Tailwind padding classes (last wins)", () => {
        expect(cn("p-4", "p-8")).toBe("p-8")
    })

    it("resolves conflicting Tailwind text-size classes (last wins)", () => {
        expect(cn("text-sm", "text-lg")).toBe("text-lg")
    })

    it("preserves non-conflicting Tailwind classes", () => {
        const result = cn("text-sm", "font-bold")
        expect(result).toContain("text-sm")
        expect(result).toContain("font-bold")
    })

    it("handles conditional classes via object syntax combined with string", () => {
        const isActive = true
        const isDisabled = false
        expect(cn("btn", { "btn-active": isActive, "btn-disabled": isDisabled })).toBe(
            "btn btn-active"
        )
    })

    it("resolves conflicting background colour classes", () => {
        expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500")
    })

    it("handles empty strings gracefully", () => {
        expect(cn("", "foo", "")).toBe("foo")
    })
})
