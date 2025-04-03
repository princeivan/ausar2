import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-brand-blue">
          About Ausar Creative
        </h1>

        <div className="mb-12">
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
            alt="BrandifyShop Team"
            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md mb-6"
          />

          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Our Story
          </h2>
          <p className="text-gray-700 mb-4">
            Founded in 2020, Ausar Creative was created with a simple mission:
            to help businesses of all sizes create high-quality branded
            merchandise without the complexity and high costs traditionally
            associated with custom product branding.
          </p>
          <p className="text-gray-700 mb-4">
            Our team of design and production experts has over 10 years of
            combined experience in custom product branding. We've worked with
            global corporations, small local businesses, and everything in
            between.
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-brand-blue">
                Quality
              </h3>
              <p className="text-gray-700">
                We never compromise on the quality of our products or printing
                techniques. Your brand deserves the best.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-brand-blue">
                Innovation
              </h3>
              <p className="text-gray-700">
                We continuously explore new printing technologies and
                eco-friendly materials to stay ahead.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-brand-blue">
                Sustainability
              </h3>
              <p className="text-gray-700">
                We're committed to reducing our environmental impact through
                responsible sourcing and production.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Our Process
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700 pl-4">
            <li className="pl-2">
              <span className="font-medium text-brand-blue">
                Select your products
              </span>{" "}
              - Browse our catalog and choose the items you want to brand.
            </li>
            <li className="pl-2">
              <span className="font-medium text-brand-blue">
                Upload your design
              </span>{" "}
              - Submit your logo or artwork, or work with our design team.
            </li>
            <li className="pl-2">
              <span className="font-medium text-brand-blue">
                Review and approve
              </span>{" "}
              - We'll send you digital proofs to review before production.
            </li>
            <li className="pl-2">
              <span className="font-medium text-brand-blue">Production</span> -
              Your order goes into production once approved.
            </li>
            <li className="pl-2">
              <span className="font-medium text-brand-blue">Delivery</span> -
              Your branded products are carefully packaged and delivered to your
              doorstep.
            </li>
          </ol>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Ready to brand your products?
          </h2>
          <Button asChild size="lg" className="bg-brand-blue hover:bg-blue-700">
            <Link to="/products">Browse Our Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
