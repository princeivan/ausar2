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
  price: z.string().min(1, "Price is required"),
  new_price: z.string().min(1, "New price is required"),
  countInStock: z.string().min(1, "Stock count is required"),
  category: z.string().min(1, "Category is required"),
  image: z.any().refine((file) => file instanceof FileList && file.length > 0, {
    message: "Image is required",
  }),
  brand: z.string(),
  is_active: z.boolean(),
  rating: z.number(),
  numReviews: z.number(),
  specs: z.string(),
  best_seller: z.boolean(),
  flash_sale: z.boolean(),
  flash_sale_price: z.string(),
  flash_sale_end: z.string(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      price: product?.old_price?.toString() || "",
      new_price: product?.new_price?.toString() || "",
      countInStock: product?.countInStock?.toString() || "",
      category: product?.category?.id.toString() || "",
      image: null,
      brand: product?.brand || "",
      is_active: product?.is_active ?? true,
      rating: product?.rating ?? 0,
      numReviews: product?.numReviews ?? 0,
      specs: product?.specs.toString() || "",
      best_seller: product?.best_seller ?? false,
      flash_sale: product?.flash_sale ?? false,
      flash_sale_price: product?.flash_sale_price ?? "",
      flash_sale_end: product?.flash_sale_end || "",
    },
  });

  useEffect(() => {
    fetchCategories();
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

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true);
      const productData = {
        ...data,
        price: parseFloat(data.price),
        new_price: parseFloat(data.new_price),
        countInStock: parseInt(data.countInStock),
      };

      if (product) {
        await api.put(`/api/admin/products/${product.id}/`, productData, {
          withCredentials: true,
        });
        toast.success("Product updated successfully");
      } else {
        await api.post("/api/admin/products/", productData, {
          withCredentials: true,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Original Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter original price"
                    {...field}
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
                    placeholder="Enter new price"
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
                  <Input
                    type="number"
                    placeholder="Enter stock count"
                    {...field}
                  />
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
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    field.onChange(e.target.files);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Is Active</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="best_seller"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Best Seller</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="flash_sale"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Flash Sale</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("flash_sale") && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="flash_sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flash Sale Price</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter flash sale price"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="flash_sale_end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flash Sale End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      placeholder="Enter flash sale end date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
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
                      // allow temporary invalid input
                      field.onChange(e.target.value);
                    }
                  }}
                  value={
                    typeof field.value === "string"
                      ? field.value
                      : JSON.stringify(field.value, null, 2)
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
