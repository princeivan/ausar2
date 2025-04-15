import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "We've received your message and will get back to you soon!",
    });
    // Reset form
    e.currentTarget.reset();
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-brand-blue text-center">
          Contact Us
        </h1>
        <p className="text-gray-700 text-center max-w-2xl mx-auto mb-12">
          Have questions about our products or branding services? We're here to
          help! Fill out the form below or use our contact information to get in
          touch.
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Get In Touch
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <Input id="name" name="name" placeholder="Your name" required />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="How can we help you?"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-brand-blue hover:bg-blue-700"
              >
                Send Message
              </Button>
            </form>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">
              Contact Information
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="text-brand-blue mt-1 mr-3 h-5 w-5" />
                  <div>
                    <h3 className="font-medium text-gray-800">Our Location</h3>
                    <p className="text-gray-600">
                      123 Kocha, Suite 456
                    </p>
                    <p className="text-gray-600">Nairobi,Kenya</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-brand-blue mt-1 mr-3 h-5 w-5" />
                  <div>
                    <h3 className="font-medium text-gray-800">Phone</h3>
                    <p className="text-gray-600">+254 (7) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="text-brand-blue mt-1 mr-3 h-5 w-5" />
                  <div>
                    <h3 className="font-medium text-gray-800">Email</h3>
                    <p className="text-gray-600">info@ausarcreative.com</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Business Hours
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-700">Monday - Friday:</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-700">Saturday:</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-700">Sunday:</span>
                  <span className="font-medium">Closed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
