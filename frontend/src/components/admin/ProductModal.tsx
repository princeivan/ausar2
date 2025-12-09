import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ProductForm from "./ProductForm";
import { Product } from "../../context/StoreContext";
import { FormDataType } from "../../pages/admin/AdminProductsPage";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const ProductModal = ({ open, onOpenChange, product }: ProductModalProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl p-4 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm
          product={product}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
