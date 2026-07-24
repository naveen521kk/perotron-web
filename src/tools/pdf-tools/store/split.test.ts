import { describe, it, expect, beforeEach } from "vitest"
import { useSplitStore } from "./split"

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helper                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

function makeFile(name = "doc.pdf", sizeBytes = 2048): File {
    return new File([new Uint8Array(sizeBytes)], name, { type: "application/pdf" })
}

function resetStore() {
    useSplitStore.getState().clear()
    // Also reset mode/unit fields that `clear()` does not touch
    useSplitStore.setState({
        splitMode: "ranges",
        rangeMode: "fixed",
        fixedChunkSize: 1,
        pageSpec: "",
        maxSizeValue: 5,
        sizeUnit: "MB",
    })
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Tests                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

describe("useSplitStore", () => {
    beforeEach(resetStore)

    /* ── Initial state ───────────────────────────────────────────────────── */

    describe("initial state", () => {
        it("has no file loaded", () => {
            expect(useSplitStore.getState().splitFile).toBeNull()
        })

        it("defaults splitMode to 'ranges'", () => {
            expect(useSplitStore.getState().splitMode).toBe("ranges")
        })

        it("defaults rangeMode to 'fixed'", () => {
            expect(useSplitStore.getState().rangeMode).toBe("fixed")
        })

        it("defaults fixedChunkSize to 1", () => {
            expect(useSplitStore.getState().fixedChunkSize).toBe(1)
        })

        it("starts with one empty custom range", () => {
            const { customRanges } = useSplitStore.getState()
            expect(customRanges).toHaveLength(1)
            expect(customRanges[0].start).toBe("")
            expect(customRanges[0].end).toBe("")
        })

        it("defaults pageSpec to empty string", () => {
            expect(useSplitStore.getState().pageSpec).toBe("")
        })

        it("defaults maxSizeValue to 5", () => {
            expect(useSplitStore.getState().maxSizeValue).toBe(5)
        })

        it("defaults sizeUnit to 'MB'", () => {
            expect(useSplitStore.getState().sizeUnit).toBe("MB")
        })
    })

    /* ── setFile ─────────────────────────────────────────────────────────── */

    describe("setFile()", () => {
        it("stores the file and pageCount", () => {
            const file = makeFile()
            useSplitStore.getState().setFile(file, 10)
            const { splitFile } = useSplitStore.getState()
            expect(splitFile).not.toBeNull()
            expect(splitFile!.file).toBe(file)
            expect(splitFile!.pageCount).toBe(10)
        })

        it("resets customRanges to a single empty range", () => {
            // Add extra ranges first
            useSplitStore.getState().addCustomRange()
            useSplitStore.getState().addCustomRange()
            expect(useSplitStore.getState().customRanges).toHaveLength(3)

            useSplitStore.getState().setFile(makeFile(), 5)
            expect(useSplitStore.getState().customRanges).toHaveLength(1)
        })

        it("resets pageSpec when a new file is loaded", () => {
            useSplitStore.getState().setPageSpec("1-3")
            useSplitStore.getState().setFile(makeFile(), 5)
            expect(useSplitStore.getState().pageSpec).toBe("")
        })
    })

    /* ── clear ───────────────────────────────────────────────────────────── */

    describe("clear()", () => {
        it("sets splitFile back to null", () => {
            useSplitStore.getState().setFile(makeFile(), 5)
            useSplitStore.getState().clear()
            expect(useSplitStore.getState().splitFile).toBeNull()
        })

        it("resets pageSpec", () => {
            useSplitStore.getState().setPageSpec("2-5")
            useSplitStore.getState().clear()
            expect(useSplitStore.getState().pageSpec).toBe("")
        })

        it("resets customRanges to a single empty range", () => {
            useSplitStore.getState().addCustomRange()
            useSplitStore.getState().clear()
            expect(useSplitStore.getState().customRanges).toHaveLength(1)
        })
    })

    /* ── setSplitMode ────────────────────────────────────────────────────── */

    describe("setSplitMode()", () => {
        it.each(["ranges", "pages", "size"] as const)("sets splitMode to '%s'", (mode) => {
            useSplitStore.getState().setSplitMode(mode)
            expect(useSplitStore.getState().splitMode).toBe(mode)
        })
    })

    /* ── setRangeMode ────────────────────────────────────────────────────── */

    describe("setRangeMode()", () => {
        it.each(["fixed", "custom"] as const)("sets rangeMode to '%s'", (mode) => {
            useSplitStore.getState().setRangeMode(mode)
            expect(useSplitStore.getState().rangeMode).toBe(mode)
        })
    })

    /* ── setFixedChunkSize ───────────────────────────────────────────────── */

    describe("setFixedChunkSize()", () => {
        it("sets a valid chunk size", () => {
            useSplitStore.getState().setFixedChunkSize(5)
            expect(useSplitStore.getState().fixedChunkSize).toBe(5)
        })

        it("clamps the value to a minimum of 1 for zero input", () => {
            useSplitStore.getState().setFixedChunkSize(0)
            expect(useSplitStore.getState().fixedChunkSize).toBe(1)
        })

        it("clamps the value to a minimum of 1 for negative input", () => {
            useSplitStore.getState().setFixedChunkSize(-10)
            expect(useSplitStore.getState().fixedChunkSize).toBe(1)
        })

        it("accepts large values without clamping", () => {
            useSplitStore.getState().setFixedChunkSize(1000)
            expect(useSplitStore.getState().fixedChunkSize).toBe(1000)
        })
    })

    /* ── addCustomRange ──────────────────────────────────────────────────── */

    describe("addCustomRange()", () => {
        it("appends a new empty range", () => {
            useSplitStore.getState().addCustomRange()
            expect(useSplitStore.getState().customRanges).toHaveLength(2)
        })

        it("new range has empty start and end", () => {
            useSplitStore.getState().addCustomRange()
            const last = useSplitStore.getState().customRanges.at(-1)!
            expect(last.start).toBe("")
            expect(last.end).toBe("")
        })

        it("assigns a unique id to the new range", () => {
            useSplitStore.getState().addCustomRange()
            const ids = useSplitStore.getState().customRanges.map((r) => r.id)
            const unique = new Set(ids)
            expect(unique.size).toBe(ids.length)
        })
    })

    /* ── removeCustomRange ───────────────────────────────────────────────── */

    describe("removeCustomRange()", () => {
        it("removes the range with the matching id", () => {
            useSplitStore.getState().addCustomRange() // now 2 ranges
            const { customRanges } = useSplitStore.getState()
            const idToRemove = customRanges[0].id
            useSplitStore.getState().removeCustomRange(idToRemove)
            expect(useSplitStore.getState().customRanges).toHaveLength(1)
            expect(useSplitStore.getState().customRanges[0].id).not.toBe(idToRemove)
        })

        it("is a no-op when id does not exist", () => {
            useSplitStore.getState().removeCustomRange("fake-id")
            expect(useSplitStore.getState().customRanges).toHaveLength(1)
        })
    })

    /* ── updateCustomRange ───────────────────────────────────────────────── */

    describe("updateCustomRange()", () => {
        it("updates the 'start' field of the correct range", () => {
            const { customRanges } = useSplitStore.getState()
            const id = customRanges[0].id
            useSplitStore.getState().updateCustomRange(id, "start", "2")
            expect(useSplitStore.getState().customRanges[0].start).toBe("2")
        })

        it("updates the 'end' field of the correct range", () => {
            const { customRanges } = useSplitStore.getState()
            const id = customRanges[0].id
            useSplitStore.getState().updateCustomRange(id, "end", "7")
            expect(useSplitStore.getState().customRanges[0].end).toBe("7")
        })

        it("does not affect other ranges", () => {
            useSplitStore.getState().addCustomRange() // now 2 ranges
            const ranges = useSplitStore.getState().customRanges
            useSplitStore.getState().updateCustomRange(ranges[0].id, "start", "1")
            // Second range should remain untouched
            expect(useSplitStore.getState().customRanges[1].start).toBe("")
        })

        it("is a no-op when id does not match any range", () => {
            useSplitStore.getState().updateCustomRange("ghost-id", "start", "5")
            // Original range remains unchanged
            expect(useSplitStore.getState().customRanges[0].start).toBe("")
        })
    })

    /* ── setPageSpec ─────────────────────────────────────────────────────── */

    describe("setPageSpec()", () => {
        it("sets the page spec string", () => {
            useSplitStore.getState().setPageSpec("1,3-5,8")
            expect(useSplitStore.getState().pageSpec).toBe("1,3-5,8")
        })

        it("allows an empty string", () => {
            useSplitStore.getState().setPageSpec("1-5")
            useSplitStore.getState().setPageSpec("")
            expect(useSplitStore.getState().pageSpec).toBe("")
        })
    })

    /* ── setMaxSizeValue ─────────────────────────────────────────────────── */

    describe("setMaxSizeValue()", () => {
        it("sets a positive value", () => {
            useSplitStore.getState().setMaxSizeValue(10)
            expect(useSplitStore.getState().maxSizeValue).toBe(10)
        })

        it("clamps negative values to 0", () => {
            useSplitStore.getState().setMaxSizeValue(-5)
            expect(useSplitStore.getState().maxSizeValue).toBe(0)
        })

        it("allows 0", () => {
            useSplitStore.getState().setMaxSizeValue(0)
            expect(useSplitStore.getState().maxSizeValue).toBe(0)
        })
    })

    /* ── setSizeUnit ─────────────────────────────────────────────────────── */

    describe("setSizeUnit()", () => {
        it.each(["KB", "MB"] as const)("sets sizeUnit to '%s'", (unit) => {
            useSplitStore.getState().setSizeUnit(unit)
            expect(useSplitStore.getState().sizeUnit).toBe(unit)
        })
    })
})
