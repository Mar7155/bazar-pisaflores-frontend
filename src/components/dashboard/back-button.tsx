"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export function BackButton() {
    const router = useRouter()
    return (
        <Button type="button" onClick={() => router.back()} variant="ghost" size="icon" asChild className="rounded-full shrink-0 border">
            <button>
                <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
        </Button>
    )
}

export default BackButton