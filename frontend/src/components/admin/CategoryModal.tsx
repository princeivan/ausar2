import { useState, useEffect } from "react";
import Modal from "../../components/ui/modal";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const CategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: CategoryModalProps) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSlug(initialData.slug || "");
      setDescription(initialData.description || "");
      setIsActive(initialData.is_active);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setIsActive(true);
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit({ name, slug, description, is_active: isActive });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">
        {initialData ? "Edit" : "Add"} Category
      </h2>
      <div className="space-y-3">
        <Input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <Input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mr-2"
            />
            Active
          </label>
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSubmit}>{initialData ? "Update" : "Add"}</Button>
      </div>
    </Modal>
  );
};

export default CategoryModal;
