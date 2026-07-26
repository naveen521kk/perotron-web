import { describe, it, expect, beforeEach } from "vitest"
import { useMergeStore } from "./merge"

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Helpers                                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

function makeFile(name: string, sizeBytes = 1024): File {
    return new File([new Uint8Array(sizeBytes)], name, { type: "application/pdf" })
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Tests                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

describe("useMergeStore", () => {
    // Reset Zustand store before each test to avoid cross-test pollution
    beforeEach(() => {
        useMergeStore.getState().clearAll()
    })

    /* ── Initial state ───────────────────────────────────────────────────── */

    describe("initial state", () => {
        it("starts with an empty files list", () => {
            expect(useMergeStore.getState().files).toEqual([])
        })
    })

    /* ── addFiles ────────────────────────────────────────────────────────── */

    describe("addFiles()", () => {
        it("adds a single file", () => {
            const file = makeFile("doc.pdf")
            useMergeStore.getState().addFiles([file])
            const { files } = useMergeStore.getState()
            expect(files).toHaveLength(1)
            expect(files[0].file).toBe(file)
        })

        it("assigns a unique string id to each added file", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf"), makeFile("b.pdf")])
            const { files } = useMergeStore.getState()
            expect(files[0].id).toBeTruthy()
            expect(files[1].id).toBeTruthy()
            expect(files[0].id).not.toBe(files[1].id)
        })

        it("appends files to existing list", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf")])
            useMergeStore.getState().addFiles([makeFile("b.pdf"), makeFile("c.pdf")])
            expect(useMergeStore.getState().files).toHaveLength(3)
        })

        it("handles an empty array without changing state", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf")])
            useMergeStore.getState().addFiles([])
            expect(useMergeStore.getState().files).toHaveLength(1)
        })
    })

    /* ── removeFile ──────────────────────────────────────────────────────── */

    describe("removeFile()", () => {
        it("removes the file with the matching id", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf"), makeFile("b.pdf")])
            const { files } = useMergeStore.getState()
            const idToRemove = files[0].id
            useMergeStore.getState().removeFile(idToRemove)
            const remaining = useMergeStore.getState().files
            expect(remaining).toHaveLength(1)
            expect(remaining[0].file.name).toBe("b.pdf")
        })

        it("is a no-op when the id does not exist", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf")])
            useMergeStore.getState().removeFile("nonexistent-id")
            expect(useMergeStore.getState().files).toHaveLength(1)
        })

        it("can remove all files one by one", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf"), makeFile("b.pdf")])
            const ids = useMergeStore.getState().files.map((f) => f.id)
            ids.forEach((id) => useMergeStore.getState().removeFile(id))
            expect(useMergeStore.getState().files).toHaveLength(0)
        })
    })

    /* ── reorderFiles ────────────────────────────────────────────────────── */

    describe("reorderFiles()", () => {
        it("moves a file from index 0 to index 2", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf"), makeFile("b.pdf"), makeFile("c.pdf")])
            useMergeStore.getState().reorderFiles(0, 2)
            const names = useMergeStore.getState().files.map((f) => f.file.name)
            expect(names).toEqual(["b.pdf", "c.pdf", "a.pdf"])
        })

        it("moves a file from last to first", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf"), makeFile("b.pdf"), makeFile("c.pdf")])
            useMergeStore.getState().reorderFiles(2, 0)
            const names = useMergeStore.getState().files.map((f) => f.file.name)
            expect(names).toEqual(["c.pdf", "a.pdf", "b.pdf"])
        })

        it("is a no-op when fromIndex equals toIndex", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf"), makeFile("b.pdf")])
            useMergeStore.getState().reorderFiles(0, 0)
            const names = useMergeStore.getState().files.map((f) => f.file.name)
            expect(names).toEqual(["a.pdf", "b.pdf"])
        })
    })

    /* ── sortByName ──────────────────────────────────────────────────────── */

    describe("sortByName()", () => {
        it("sorts files alphabetically ascending by default", () => {
            useMergeStore.getState().addFiles([makeFile("c.pdf"), makeFile("a.pdf"), makeFile("b.pdf")])
            useMergeStore.getState().sortByName()
            const names = useMergeStore.getState().files.map((f) => f.file.name)
            expect(names).toEqual(["a.pdf", "b.pdf", "c.pdf"])
        })

        it("sorts files alphabetically ascending when dir='asc'", () => {
            useMergeStore.getState().addFiles([makeFile("z.pdf"), makeFile("m.pdf"), makeFile("a.pdf")])
            useMergeStore.getState().sortByName("asc")
            const names = useMergeStore.getState().files.map((f) => f.file.name)
            expect(names).toEqual(["a.pdf", "m.pdf", "z.pdf"])
        })

        it("sorts files alphabetically descending when dir='desc'", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf"), makeFile("c.pdf"), makeFile("b.pdf")])
            useMergeStore.getState().sortByName("desc")
            const names = useMergeStore.getState().files.map((f) => f.file.name)
            expect(names).toEqual(["c.pdf", "b.pdf", "a.pdf"])
        })

        it("handles a list with a single file without throwing", () => {
            useMergeStore.getState().addFiles([makeFile("solo.pdf")])
            expect(() => useMergeStore.getState().sortByName()).not.toThrow()
        })

        it("is a no-op on an empty list", () => {
            expect(() => useMergeStore.getState().sortByName()).not.toThrow()
            expect(useMergeStore.getState().files).toHaveLength(0)
        })
    })

    /* ── sortBySize ──────────────────────────────────────────────────────── */

    describe("sortBySize()", () => {
        it("sorts files by size ascending by default", () => {
            useMergeStore.getState().addFiles([
                makeFile("big.pdf", 3000),
                makeFile("small.pdf", 500),
                makeFile("mid.pdf", 1500),
            ])
            useMergeStore.getState().sortBySize()
            const names = useMergeStore.getState().files.map((f) => f.file.name)
            expect(names).toEqual(["small.pdf", "mid.pdf", "big.pdf"])
        })

        it("sorts files by size descending when dir='desc'", () => {
            useMergeStore.getState().addFiles([
                makeFile("small.pdf", 500),
                makeFile("big.pdf", 3000),
                makeFile("mid.pdf", 1500),
            ])
            useMergeStore.getState().sortBySize("desc")
            const names = useMergeStore.getState().files.map((f) => f.file.name)
            expect(names).toEqual(["big.pdf", "mid.pdf", "small.pdf"])
        })

        it("handles files with the same size without throwing", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf", 1024), makeFile("b.pdf", 1024)])
            expect(() => useMergeStore.getState().sortBySize()).not.toThrow()
            expect(useMergeStore.getState().files).toHaveLength(2)
        })
    })

    /* ── clearAll ────────────────────────────────────────────────────────── */

    describe("clearAll()", () => {
        it("removes all files", () => {
            useMergeStore.getState().addFiles([makeFile("a.pdf"), makeFile("b.pdf")])
            useMergeStore.getState().clearAll()
            expect(useMergeStore.getState().files).toHaveLength(0)
        })

        it("is safe to call on an already-empty store", () => {
            expect(() => useMergeStore.getState().clearAll()).not.toThrow()
        })
    })
})
