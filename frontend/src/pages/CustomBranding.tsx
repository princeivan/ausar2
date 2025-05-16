import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { BrandingUpload } from "../components/checkout/BrandingUpload";
import { toast } from "sonner";
import { Steps } from "../components/checkout/Steps";
import { ShoppingBag, Upload, CheckCircle, Truck, Package } from "lucide-react";
import api from "../../api";

const CustomBranding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    projectDetails: "",
    budget: "",
    timeline: "",
  });
  const [brandingInstructions, setBrandingInstructions] = useState("");
  const [brandingFiles, setBrandingFiles] = useState<File[]>([]);

  const steps = [
    { id: 1, name: "Project Details" },
    { id: 2, name: "Upload Design" },
    { id: 3, name: "Contact Info" },
  ];

  const brandingProcess = [
    {
      icon: <ShoppingBag className="h-6 w-6 text-brand-blue" />,
      title: "Select your products",
      description: "Browse our catalog and choose the items you want to brand.",
    },
    {
      icon: <Upload className="h-6 w-6 text-brand-blue" />,
      title: "Upload your design",
      description: "Submit your logo or artwork, or work with our design team.",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-brand-blue" />,
      title: "Review and approve",
      description: "We'll send you digital proofs to review before production.",
    },
    {
      icon: <Package className="h-6 w-6 text-brand-blue" />,
      title: "Production",
      description: "Your order goes into production once approved.",
    },
    {
      icon: <Truck className="h-6 w-6 text-brand-blue" />,
      title: "Delivery",
      description:
        "Your branded products are carefully packaged and delivered to your doorstep.",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("first_name", formData.firstName);
    data.append("last_name", formData.lastName);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("company", formData.company);
    data.append("project_details", formData.projectDetails);
    data.append("budget", formData.budget);
    data.append("timeline", formData.timeline);
    data.append("branding_instructions", brandingInstructions);
    brandingFiles.forEach((file) => {
      data.append(`branding_files`, file);
    });
    try {
      await api.post("/api/submit-branding/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Quote request submitted! We'll contact you shortly.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        projectDetails: "",
        budget: "",
        timeline: "",
      });
    } catch (error: any) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
      console.error("Validation Errors:", error.response?.data);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Custom Branding Services</h1>
      <p className="text-gray-600 mb-8">
        Get your products branded with your logo and design
      </p>

      <div className="mb-8">
        <Steps currentStep={currentStep} steps={steps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  1. Project Details
                </h2>
                <p className="text-gray-600 mb-6">
                  Tell us about your branding project and what you're looking
                  for.
                </p>

                <div className="mb-4">
                  <Label htmlFor="projectDetails">Project Description</Label>
                  <Textarea
                    id="projectDetails"
                    name="projectDetails"
                    value={formData.projectDetails}
                    onChange={handleInputChange}
                    placeholder="Describe your project, quantity needed, type of products, etc."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="budget">Estimated Budget</Label>
                    <Input
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeline">Desired Timeline</Label>
                    <Input
                      id="timeline"
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleInputChange}
                      placeholder="When do you need this by?"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={nextStep}>Continue to Upload Design</Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  2. Upload Your Design
                </h2>
                <p className="text-gray-600 mb-6">
                  Upload your logo or artwork for custom branding. Our design
                  team will review and create digital proofs for your approval.
                </p>

                <BrandingUpload
                  files={brandingFiles}
                  setFiles={setBrandingFiles}
                  brandingInstructions={brandingInstructions}
                  setBrandingInstructions={setBrandingInstructions}
                />

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button onClick={nextStep}>Continue to Contact Info</Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <form onSubmit={handleSubmit}>
                <h2 className="text-xl font-semibold mb-4">
                  3. Contact Information
                </h2>
                <p className="text-gray-600 mb-6">
                  Provide your contact details so we can reach out with a custom
                  quote.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button type="submit">Submit Request</Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Process Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-lg font-bold mb-4">Our Branding Process</h2>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="space-y-4 text-sm">
                {brandingProcess.map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="bg-white border border-brand-blue rounded-full p-2 mr-3 mt-0.5">
                      {step.icon}
                    </div>
                    <div>
                      <span className="font-medium">{step.title}</span>
                      <p className="text-gray-500">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-medium text-amber-800 mb-2">
                Looking for ready-made products?
              </h3>
              <p className="text-sm text-amber-700 mb-4">
                Browse our catalog of high-quality products that can be
                purchased without custom branding.
              </p>
              <Button asChild variant="outline" className="w-full" size="sm">
                <a href="/products">Shop Products</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomBranding;
