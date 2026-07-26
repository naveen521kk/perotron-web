import { DefaultCatchBoundary } from "@/components/react/default-catch-boundary"
import { TooltipProvider } from "@/components/react/ui/tooltip"
import { E2EErrorTrigger } from "@/components/react/e2e-error-trigger"

export function DefaultProviders({ children }: { children: React.ReactNode }) {
    return (
        <DefaultCatchBoundary>
            {/* Renders a keyboard shortcut (Ctrl+Shift+Alt+E) in E2E builds only
                that throws a React error so Playwright can test the error boundary. */}
            <E2EErrorTrigger />
            <TooltipProvider>{children}</TooltipProvider>
        </DefaultCatchBoundary>
    )
}
