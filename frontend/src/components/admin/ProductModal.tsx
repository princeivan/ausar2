// components/admin/ProductModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ProductForm from "./ProductForm";
import { Product } from "../../context/StoreContext";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | undefined;
  onSuccess: () => void;
}

const ProductModal = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl p-4 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <ProductForm
          product={product}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
