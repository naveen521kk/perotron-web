import { DefaultCatchBoundary } from "@/components/react/default-catch-boundary"
import { TooltipProvider } from "@/components/react/ui/tooltip"

export function DefaultProviders({ children }: { children: React.ReactNode }) {
    return (
        <DefaultCatchBoundary>
            <TooltipProvider>{children}</TooltipProvider>
        </DefaultCatchBoundary>
    )
}
