import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { WifiOff, Wifi } from "lucide-react"

/**
 * Offline/online status indicator using Sonner toasts.
 * Shows a notification when the user goes offline or comes back online.
 */
export function OfflineIndicator() {
    const isInitialMount = useRef(true)

    useEffect(() => {
        // Skip the initial mount to avoid a flash of "online" toast on page load
        const timer = setTimeout(() => {
            isInitialMount.current = false
        }, 1000)

        function handleOffline() {
            if (isInitialMount.current) return
            toast.info("You're offline — everything still works!", {
                id: "offline-status",
                duration: 5000,
                icon: <WifiOff className="size-4" />,
            })
        }

        function handleOnline() {
            if (isInitialMount.current) return
            toast.success("You're back online", {
                id: "offline-status",
                duration: 3000,
                icon: <Wifi className="size-4" />,
            })
        }

        window.addEventListener("offline", handleOffline)
        window.addEventListener("online", handleOnline)

        return () => {
            clearTimeout(timer)
            window.removeEventListener("offline", handleOffline)
            window.removeEventListener("online", handleOnline)
        }
    }, [])

    // This component renders nothing — it only triggers toasts
    return null
}
