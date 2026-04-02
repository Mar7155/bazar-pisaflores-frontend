"use client"

import { pauseBusinessAction } from "@/actions/mutations";
import { Button } from "../ui/button";

export default function PauseBusinessButton({ businessId }: { businessId: string }) {
    return (
        <Button size="lg" variant="outline" onClick={() => pauseBusinessAction(businessId)} className="font-bold h-14 px-8 rounded-2xl w-full md:w-auto" >
            Pausar Negocio
        </Button>
    );
}