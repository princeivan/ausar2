import { useState, useEffect, useRef } from "react";

interface CarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({
  items,
  autoPlay = false,
  interval = 5000,
  showControls = true,
  showIndicators = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at 1 due to the prepended clone
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = items.length;
  const extendedItems = [items[totalItems - 1], ...items, items[0]];

  // AutoPlay Effect
  useEffect(() => {
    if (autoPlay) {
      timeoutRef.current = setTimeout(() => {
        goToNext();
      }, interval);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, autoPlay, interval]);

  // Infinite loop reset
  useEffect(() => {
    if (currentIndex === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalItems);
      }, 500);
    } else if (currentIndex === totalItems + 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1);
      }, 500);
    } else {
      setIsTransitioning(true);
    }
  }, [currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index + 1);
  };

  return (
    <div className="relative overflow-hidden w-full">
      <div
        className={`flex ${
          isTransitioning ? "transition-transform duration-500 ease-in-out" : ""
        }`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {extendedItems.map((item, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
            aria-hidden={index !== currentIndex}
            role="group"
            aria-label={`Slide ${index} of ${totalItems}`}
          >
            {/* Ensures images inside item scale properly */}
            <div className="w-full h-full aspect-video flex items-center justify-center bg-black/5 overflow-hidden">
              <div className="w-full h-full object-cover">{item}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      {showControls && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            ❮
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75"
            onClick={goToNext}
            aria-label="Next slide"
          >
            ❯
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`h-3 w-3 rounded-full transition-colors ${
                index + 1 === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => goToIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
