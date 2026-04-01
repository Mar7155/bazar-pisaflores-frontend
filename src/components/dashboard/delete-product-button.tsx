"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteProductAction } from "@/actions/mutations";
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

interface DeleteProductButtonProps {
  businessId: string;
  productId: string;
  productName: string;
}

export function DeleteProductButton({ businessId, productId, productName }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteProductAction(businessId, productId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Producto eliminado correctamente.");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      toast.error("Hubo un error al eliminar el producto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 gap-2 font-bold shadow-sm">
          <Trash2 className="w-4 h-4" />
          Eliminar Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive font-black text-xl">
            <AlertTriangle className="w-6 h-6" />
            ¿Eliminar "{productName}"?
          </DialogTitle>
          <DialogDescription className="py-2 text-base font-medium">
            Esta acción eliminará permanentemente el producto y todas sus imágenes asociadas. **Esta acción no se puede deshacer.**
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="rounded-xl font-bold h-11"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-2 rounded-xl font-bold h-11 shadow-lg shadow-red-500/20"
          >
            {isDeleting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Eliminando...</>
            ) : (
              <><Trash2 className="w-4 h-4" /> Confirmar Eliminación</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
