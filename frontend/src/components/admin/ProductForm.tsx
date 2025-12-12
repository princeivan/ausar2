// components/admin/ProductForm.tsx
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import api from "../../../api";
import { Product } from "../../context/StoreContext";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  old_price: z.string().optional().nullable(),
  new_price: z.string().min(1, "New price is required"),
  countInStock: z.string().min(1, "Stock count is required"),
  category: z.string().min(1, "Category is required"),
  // image optional for edit; required for create — enforce in code below
  image: z.any().optional(),
  brand: z.string().optional(),
  is_active: z.boolean().optional(),
  rating: z.number().optional(),
  numReviews: z.number().optional(),
  specs: z.any().optional(),
  best_seller: z.boolean().optional(),
  flash_sale: z.boolean().optional(),
  flash_sale_price: z.string().optional(),
  flash_sale_end: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | undefined;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      old_price: product?.old_price?.toString() || "",
      new_price: product?.new_price?.toString() || "",
      countInStock: product?.countInStock?.toString() || "0",
      category: product?.category?.id?.toString() || "",
      image: undefined,
      brand: product?.brand || "",
      is_active: product?.is_active ?? true,
      rating: product?.rating ?? 0,
      numReviews: product?.numReviews ?? 0,
      specs: product?.specs ?? "",
      best_seller: product?.best_seller ?? false,
      flash_sale: product?.flash_sale ?? false,
      flash_sale_price: product?.flash_sale_price ?? "",
      flash_sale_end: product?.flash_sale_end || "",
    },
  });

  useEffect(() => {
    fetchCategories();
    // show existing image on edit
    if (product?.image) setImagePreview(product.image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories/");
      setCategories(response.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
      console.error("Error fetching categories:", error);
    }
  };

  const handleImageChange = (files?: FileList | null) => {
    if (!files || files.length === 0) {
      form.setValue("image", undefined);
      setImagePreview(product?.image || null);
      return;
    }
    const file = files[0];
    form.setValue("image", files); // keep FileList to match previous patterns
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submit = async (values: ProductFormValues) => {
    // Validate image presence for create
    if (!product) {
      const hasImage =
        values.image instanceof FileList &&
        (values.image as FileList).length > 0;
      if (!hasImage) {
        toast.error("Image is required for new product");
        return;
      }
    }

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("title", values.title);
      fd.append("description", values.description);
      if (values.old_price) fd.append("old_price", String(values.old_price));
      fd.append("new_price", String(values.new_price));
      fd.append("countInStock", String(values.countInStock));
      fd.append("category_id", values.category);

      // image (FileList) -> append first file
      if (
        values.image &&
        values.image instanceof FileList &&
        values.image.length > 0
      ) {
        fd.append("image", (values.image as FileList)[0]);
      }

      if (values.brand) fd.append("brand", values.brand);
      fd.append("is_active", String(values.is_active ?? true));
      fd.append("rating", String(values.rating ?? 0));
      fd.append("numReviews", String(values.numReviews ?? 0));

      // specs: if object -> stringify, else append string
      if (values.specs && typeof values.specs === "object") {
        fd.append("specs", JSON.stringify(values.specs));
      } else if (values.specs) {
        fd.append("specs", String(values.specs));
      }

      fd.append("best_seller", String(values.best_seller ?? false));
      fd.append("flash_sale", String(values.flash_sale ?? false));
      if (values.flash_sale_price)
        fd.append("flash_sale_price", values.flash_sale_price);

      if (values.flash_sale_end) {
        // if datetime-local provided, convert to ISO
        const iso = new Date(values.flash_sale_end).toISOString();
        fd.append("flash_sale_end", iso);
      }

      if (product) {
        await api.put(`/api/admin/products/${product.id}/`, fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated successfully");
      } else {
        await api.post("/api/admin/products/", fd, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error(
        product ? "Failed to update product" : "Failed to create product"
      );
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        className="space-y-6"
        encType="multipart/form-data"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter product title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="old_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="new_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="countInStock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Count</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    {...field}
                  >
                    <option value="">Select a category</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>
                Product Image {product ? "(leave empty to keep current)" : "*"}
              </FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files)}
                />
              </FormControl>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specs (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='e.g. {"color": "red", "size": "M"}'
                  className="min-h-[100px]"
                  {...field}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      field.onChange(parsed);
                    } catch {
                      field.onChange(e.target.value);
                    }
                  }}
                  value={
                    typeof field.value === "string"
                      ? field.value
                      : JSON.stringify(field.value ?? "", null, 2)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : product
              ? "Update Product"
              : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
