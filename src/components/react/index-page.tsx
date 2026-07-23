import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/react/ui/card"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/react/ui/button"
import { SiGithub } from "@icons-pack/react-simple-icons"
import {
    ServerOff,
    Lock,
    Zap,
    Code2,
    FileStack,
    Scissors,
    QrCode,
} from "lucide-react"
import { cn } from "@/lib/utils"

const icons = {
    "server-off": ServerOff,
    lock: Lock,
    zap: Zap,
    "code-2": Code2,
    "file-stack": FileStack,
    scissors: Scissors,
    "qr-code": QrCode,
}

export function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: keyof typeof icons
    title: string
    description: string
}) {
    const IconComponent = icons?.[icon]
    return (
        <Card className="border-none bg-transparent shadow-none">
            <CardHeader>
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {IconComponent ? (
                        <IconComponent className="size-6" />
                    ) : null}
                </div>
                <CardTitle>{title}</CardTitle>
                {/* <CardDescription className="mt-2 text-base leading-relaxed">
                    {description}
                </CardDescription> */}
            </CardHeader>
            <CardContent>{description}</CardContent>
        </Card>
    )
}

// function CategoryBadge({
//     icon,
//     label,
// }: {
//     icon: React.ReactNode
//     label: string
// }) {
//     return (
//         <Badge
//             variant="secondary"
//             className="cursor-pointer gap-2 px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
//         >
//             {icon}
//             {label}
//         </Badge>
//     )
// }

export function ToolCard({
    to,
    icon,
    title,
    description,
    iconClassNames,
}: {
    to: string
    icon: keyof typeof icons
    title: string
    description: string
    iconClassNames?: string
}) {
    // If it's a placeholder link, render a div instead of a Link to avoid router errors,
    // or just render an anchor. We'll use Link if it starts with /, otherwise an anchor or div.
    const isPlaceholder = to === "#"
    const IconComponent = icons?.[icon]

    const inner = (
        <Card className="h-full animate-in transition-all duration-200 fade-in slide-in-from-bottom-4 hover:border-primary/40 hover:shadow-lg">
            <CardHeader className="flex flex-col gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                    {IconComponent ? (
                        <IconComponent
                            className={cn("size-5", iconClassNames)}
                        />
                    ) : null}
                </div>
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-lg font-semibold transition-colors group-hover:text-primary">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                        {description}
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
    )

    if (isPlaceholder) {
        return (
            <div
                className="group cursor-not-allowed opacity-60 outline-none"
                title="Coming Soon"
            >
                {inner}
            </div>
        )
    }

    return (
        <a href={to} className="group outline-none">
            {inner}
        </a>
    )
}

export function HeroButtons() {
    return (
        <>
            <Button
                size="lg"
                className="rounded-full px-8 font-semibold"
                asChild
            >
                <a href="#tools">
                    Explore Tools <ArrowRight className="ml-2 size-4" />
                </a>
            </Button>
            <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8"
                asChild
            >
                <a
                    href="https://github.com/naveen521kk/perotron-web"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <SiGithub className="mr-2 size-4" />
                    GitHub
                </a>
            </Button>
        </>
    )
}
