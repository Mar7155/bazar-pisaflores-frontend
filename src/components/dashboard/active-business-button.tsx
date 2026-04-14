"use client"

import { activeBusinessAction } from "@/actions/mutations";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export default function ActiveBusinessButton({ businessId }: { businessId: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="lg" variant="default" className="font-bold h-14 px-8 rounded-2xl w-full md:w-auto" >
                    Activar Negocio
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Activar Negocio</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que quieres activar este negocio?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col gap-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button size="lg" variant="default" onClick={() => activeBusinessAction(businessId)} className="font-bold h-14 px-8 rounded-2xl w-full md:w-auto" >
                        Activar Negocio
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}