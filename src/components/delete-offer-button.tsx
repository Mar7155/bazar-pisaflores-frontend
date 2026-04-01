"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteFlashOfferAction } from "@/actions/mutations";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteOfferButtonProps {
  businessId: string;
  offerId: string;
}

export function DeleteOfferButton({ businessId, offerId }: DeleteOfferButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteFlashOfferAction(businessId, offerId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Oferta eliminada correctamente.");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error al eliminar la oferta:", error);
      toast.error("Hubo un error al eliminar la oferta.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="py-3 text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-red-600 w-full"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            ¿Confirmar eliminación?
          </DialogTitle>
          <DialogDescription className="py-2 text-base">
            Esta acción eliminará permanentemente la oferta relámpago. **Esta acción no se puede deshacer.**
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="rounded-xl font-bold"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 rounded-xl font-bold"
          >
            {isDeleting ? (
              <>
                <Trash2 className="w-4 h-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Eliminar Oferta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
