import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ProductForm from "./ProductForm";
import { Product } from "../../context/StoreContext";

type FormDataType = {
  title: string;
  description: string;
  image: string;
  brand: string;
  category: string;
  new_price: string;
  old_price: string;
  countInStock: string;
};
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
      <DialogContent className="max-w-2xl">
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
