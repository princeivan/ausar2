import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import HeroImage from "../assets/water_bottle.png";
import HeroImage2 from "../assets/water_bottle2.png";
import HeroImage3 from "../assets/water_bottle3.png";
import HeroImage4 from "../assets/mugs.png";
import HeroImage5 from "../assets/mug2.png";
import HeroImage6 from "../assets/mug3.png";
import HeroImage7 from "../assets/caps.png";
import Carousel from "./Carousel";

const Hero = () => {
  return (
    <div className="relative bg-gradient-to-r from-brand-blue to-blue-700 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Elevate Your Brand with Customized Products
            </h1>
            <p className="text-lg md:text-xl opacity-90">
              Transform ordinary products into powerful brand ambassadors.
              Showcase your logo and identity on premium merchandise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="text-white text-brand-blue hover:bg-gray-100 font-semibold"
              >
                <Link to="/products">Shop Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-black hover:bg-white/10"
              >
                <Link to="/custom-branding">Custom Branding</Link>
              </Button>
            </div>
          </div>
          <div className=" md:block">
            {/* <img
              src={HeroImage}
              alt="Branded Products"
              className="rounded-lg shadow-2xl  w-2xl  object-cover"
            /> */}
            <Carousel
              items={[
                <img
                  src={HeroImage}
                  alt="First slide"
                  className="w-full size-72"
                />,
                <img
                  src={HeroImage2}
                  alt="Second slide"
                  className="w-full size-72 "
                />,
                <img
                  src={HeroImage3}
                  alt="Third slide"
                  className="w-full size-72"
                />,
                <img
                  src={HeroImage4}
                  alt="Third slide"
                  className="w-full size-80"
                />,
                <img
                  src={HeroImage5}
                  alt="Third slide"
                  className="w-full size-80"
                />,
                <img
                  src={HeroImage6}
                  alt="Third slide"
                  className="w-full size-80"
                />,
                <img
                  src={HeroImage7}
                  alt="Third slide"
                  className="w-full size-60"
                />,
              ]}
              autoPlay
              interval={3000}
            />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default Hero;
