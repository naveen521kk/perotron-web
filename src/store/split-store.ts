import { create } from "zustand"

export interface SplitFile {
    file: File
    pageCount: number
}

export type SplitMode = "ranges" | "pages" | "size"
export type RangeMode = "fixed" | "custom"
export type SizeUnit = "KB" | "MB"

export interface CustomRange {
    id: string
    start: string
    end: string
}

interface SplitState {
    /** The uploaded PDF file (null = upload screen) */
    splitFile: SplitFile | null
    /** Active split mode tab */
    splitMode: SplitMode
    /** Ranges sub-mode */
    rangeMode: RangeMode
    /** Pages per chunk for fixed range mode */
    fixedChunkSize: number
    /** Custom ranges list */
    customRanges: CustomRange[]
    /** Page specification string (e.g. "1,3-5,8") */
    pageSpec: string
    /** Max file size value */
    maxSizeValue: number
    /** Max file size unit */
    sizeUnit: SizeUnit

    /* Actions */
    setFile: (file: File, pageCount: number) => void
    clear: () => void
    setSplitMode: (mode: SplitMode) => void
    setRangeMode: (mode: RangeMode) => void
    setFixedChunkSize: (size: number) => void
    addCustomRange: () => void
    removeCustomRange: (id: string) => void
    updateCustomRange: (id: string, field: "start" | "end", value: string) => void
    setPageSpec: (spec: string) => void
    setMaxSizeValue: (value: number) => void
    setSizeUnit: (unit: SizeUnit) => void
}

let _counter = 0
function makeRangeId() {
    return `range-${Date.now()}-${_counter++}`
}

const initialRanges: CustomRange[] = [
    { id: makeRangeId(), start: "", end: "" },
]

export const useSplitStore = create<SplitState>((set) => ({
    splitFile: null,
    splitMode: "ranges",
    rangeMode: "fixed",
    fixedChunkSize: 1,
    customRanges: initialRanges,
    pageSpec: "",
    maxSizeValue: 5,
    sizeUnit: "MB",

    setFile: (file, pageCount) =>
        set({
            splitFile: { file, pageCount },
            // Reset custom ranges when a new file is loaded
            customRanges: [{ id: makeRangeId(), start: "", end: "" }],
            pageSpec: "",
        }),

    clear: () =>
        set({
            splitFile: null,
            customRanges: [{ id: makeRangeId(), start: "", end: "" }],
            pageSpec: "",
        }),

    setSplitMode: (mode) => set({ splitMode: mode }),
    setRangeMode: (mode) => set({ rangeMode: mode }),
    setFixedChunkSize: (size) => set({ fixedChunkSize: Math.max(1, size) }),

    addCustomRange: () =>
        set((state) => ({
            customRanges: [
                ...state.customRanges,
                { id: makeRangeId(), start: "", end: "" },
            ],
        })),

    removeCustomRange: (id) =>
        set((state) => ({
            customRanges: state.customRanges.filter((r) => r.id !== id),
        })),

    updateCustomRange: (id, field, value) =>
        set((state) => ({
            customRanges: state.customRanges.map((r) =>
                r.id === id ? { ...r, [field]: value } : r
            ),
        })),

    setPageSpec: (spec) => set({ pageSpec: spec }),
    setMaxSizeValue: (value) => set({ maxSizeValue: Math.max(0, value) }),
    setSizeUnit: (unit) => set({ sizeUnit: unit }),
}))
