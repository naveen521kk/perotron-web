import { useEffect, type ReactNode } from "react"
import {
    ErrorBoundary,
    getErrorMessage,
    type FallbackProps,
} from "react-error-boundary"
import { captureClientException } from "@/lib/posthog"
import { Button, buttonVariants } from "@/components/react/ui/button"

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    const isRoot =
        typeof window !== "undefined" && window.location.pathname === "/"

    console.error("DefaultCatchBoundary Error:", error)

    useEffect(() => {
        captureClientException(error as Error, {
            message: getErrorMessage(error),
        })
    }, [error])

    return (
        <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 p-4">
            <div className="text-center">
                <h2 className="text-lg font-semibold">Something went wrong</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {getErrorMessage(error)}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={resetErrorBoundary}>Try Again</Button>
                {isRoot ? (
                    <a
                        href="/"
                        className={buttonVariants({ variant: "secondary" })}
                    >
                        Go to Home
                    </a>
                ) : (
                    <Button
                        variant="secondary"
                        onClick={(e) => {
                            e.preventDefault()
                            window.history.back()
                        }}
                    >
                        Go Back
                    </Button>
                )}
            </div>
        </div>
    )
}

export function DefaultCatchBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
        </ErrorBoundary>
    )
}
