import { create } from "zustand"

export interface PdfFile {
    /** Stable unique ID for dnd-kit key */
    id: string
    file: File
}

interface MergeState {
    files: PdfFile[]
    addFiles: (newFiles: File[]) => void
    removeFile: (id: string) => void
    reorderFiles: (fromIndex: number, toIndex: number) => void
    sortByName: (dir?: "asc" | "desc") => void
    sortBySize: (dir?: "asc" | "desc") => void
    clearAll: () => void
}

let _counter = 0
function makeId() {
    return `pdf-${Date.now()}-${_counter++}`
}

export const useMergeStore = create<MergeState>((set) => ({
    files: [],

    addFiles: (newFiles) =>
        set((state) => ({
            files: [
                ...state.files,
                ...newFiles.map((f) => ({ id: makeId(), file: f })),
            ],
        })),

    removeFile: (id) =>
        set((state) => ({
            files: state.files.filter((f) => f.id !== id),
        })),

    reorderFiles: (fromIndex, toIndex) =>
        set((state) => {
            const files = [...state.files]
            const [moved] = files.splice(fromIndex, 1)
            files.splice(toIndex, 0, moved)
            return { files }
        }),

    sortByName: (dir = "asc") =>
        set((state) => ({
            files: [...state.files].sort((a, b) => {
                const cmp = a.file.name.localeCompare(b.file.name)
                return dir === "asc" ? cmp : -cmp
            }),
        })),

    sortBySize: (dir = "asc") =>
        set((state) => ({
            files: [...state.files].sort((a, b) => {
                const cmp = a.file.size - b.file.size
                return dir === "asc" ? cmp : -cmp
            }),
        })),

    clearAll: () => set({ files: [] }),
}))
