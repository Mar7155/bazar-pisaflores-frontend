"use client"

import { pauseBusinessAction } from "@/actions/mutations";
import { Button } from "../ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

export default function PauseBusinessButton({ businessId }: { businessId: string }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="font-bold h-14 px-8 rounded-2xl w-full md:w-auto" >
                    Pausar Negocio
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Pausar Negocio</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que quieres pausar este negocio?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col gap-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button size="lg" variant="outline" onClick={() => pauseBusinessAction(businessId)}>Pausar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}