"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteImageAction } from "@/actions/mutations";
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

interface DeleteImageButtonProps {
  businessId: string;
  productId?: string;
  imageId: string;
  entityType: 'business' | 'product';
  onSuccess?: () => void;
}

export function DeleteImageButton({ businessId, productId, imageId, entityType, onSuccess }: DeleteImageButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteImageAction(businessId, productId, imageId, entityType);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Imagen eliminada.");
        if (onSuccess) onSuccess();
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      toast.error("Error al eliminar la imagen.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          type="button"
          className="bg-red-500 text-white p-2 text-xs rounded-full hover:scale-110 transition-transform shadow-lg"
          aria-label="Eliminar Imagen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive font-bold">
            <AlertTriangle className="w-5 h-5" />
            ¿Eliminar esta imagen?
          </DialogTitle>
          <DialogDescription className="py-2">
            La imagen se borrará permanentemente de nuestros servidores.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="rounded-xl flex-1 h-10"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl flex-1 h-10"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
