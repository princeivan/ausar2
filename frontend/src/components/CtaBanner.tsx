import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

const CtaBanner = () => {
  return (
    <div className="bg-gradient-to-r from-brand-blue to-blue-700 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Brand Your Products?
        </h2>
        <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
          Start creating custom branded products that make your business stand
          out. Get high-quality merchandise with your unique branding today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white text-brand-blue hover:bg-gray-100"
          >
            <Link to="/products">Browse Products</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-black border-white hover:bg-white/10"
          >
            <Link to="/custom-branding">Request a Quote</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CtaBanner;
