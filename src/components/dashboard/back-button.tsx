"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import Link from "next/link"

export function BackButton({ businessId, path }: { businessId: string, path?: string }) {
    return (
        <Button type="button" variant="ghost" size="icon" asChild className="rounded-full shrink-0 border">
            <Link href={`${path || "/dashboard/businesses/"}${businessId}`}><ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" /></Link>
        </Button>
    )
}

export default BackButton