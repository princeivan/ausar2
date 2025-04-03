import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { toast } from "sonner";

export const BrandingUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [brandingInstructions, setBrandingInstructions] = useState("");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 3) {
        toast.error("You can upload a maximum of 3 files");
        return;
      }

      // Create preview URLs for the new files
      const newPreviewUrls = newFiles.map((file) => URL.createObjectURL(file));

      setFiles([...files, ...newFiles]);
      setPreviewUrls([...previewUrls, ...newPreviewUrls]);

      toast.success("Files uploaded successfully");
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const newPreviewUrls = [...previewUrls];

    // Revoke the URL to free memory
    URL.revokeObjectURL(newPreviewUrls[index]);

    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);

    setFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  return (
    <div className="space-y-6">
      <div>
        <label
          htmlFor="branding-instructions"
          className="block font-medium mb-2"
        >
          Branding Instructions
        </label>
        <Textarea
          id="branding-instructions"
          placeholder="Describe how you want your logo/brand to appear on the products. Include details about placement, size, colors, etc."
          value={brandingInstructions}
          onChange={(e) => setBrandingInstructions(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div>
        <label className="block font-medium mb-2">
          Upload Logo or Artwork Files (Up to 3 files)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*,.pdf,.ai,.psd,.eps"
            onChange={handleFileChange}
            multiple
          />
          <Button variant="outline" asChild className="mb-2">
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </label>
          </Button>
          <p className="text-sm text-gray-500">
            Accepted formats: JPG, PNG, PDF, AI, PSD, EPS
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Uploaded Files</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative">
                  {file.type.startsWith("image/") ? (
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={previewUrls[index]}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-800 mb-2">What happens next?</h3>
        <p className="text-sm text-amber-700">
          After you place your order, our design team will review your files and
          create digital proofs showing how your branding will look on the
          products. We'll email these proofs to you for approval before starting
          production.
        </p>
      </div>
    </div>
  );
};
