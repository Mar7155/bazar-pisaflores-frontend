"use client"

import { deleteBusinessAction } from "@/actions/mutations";
import { Button } from "../ui/button";

export default function DeleteBusinessButton({ businessId }: { businessId: string }) {
    return (
        <Button size="lg" variant="outline" onClick={() => deleteBusinessAction(businessId)} className="font-bold h-14 px-8 rounded-2xl w-full md:w-auto" >
            Eliminar Negocio
        </Button>
    );
}