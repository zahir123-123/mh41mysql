import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Removed the "AUTO PARTS" banner, now only three banners
  const slides = [
    { type: "image", src: "/assets/car-banner.jpg", alt: "Car Banner" },
    { type: "image", src: "/assets/car-wash.png", alt: "Car Wash" },
    {
      type: "garage",
      src: "/assets/garagebanner.jpg",
      alt: "Garage Service Banner",
      pretitle: "Expert Bike & Car Service",
      title: "GARAGE SERVICE CENTER",
      subtitle: "All repairs under one roof"
    }
  ];

  // Aspect ratio: 3:1 (height is 33.33% of width)
  const aspectRatioPercent = 33.33;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative mx-4 mt-2 rounded-xl overflow-hidden transition-all duration-500">
      {/* Aspect ratio box */}
      <div className="relative w-full" style={{ paddingTop: `${aspectRatioPercent}%` }}>
        <div className="absolute inset-0 w-full h-full">
          {slides[currentSlide].type === "image" && (
            <img
              src={slides[currentSlide].src}
              alt={slides[currentSlide].alt}
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}
          {slides[currentSlide].type === "garage" && (
            <div className="relative w-full h-full">
              <img
                src={slides[currentSlide].src}
                alt={slides[currentSlide].alt}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Overlay with pretitle, title, and subtitle on the left */}
              <div className="absolute inset-0 flex items-center bg-black/30">
                <div className="ml-8 md:ml-12">
                  <div className="text-white/80 text-xs md:text-sm font-semibold mb-1 uppercase tracking-widest drop-shadow">
                    {slides[currentSlide].pretitle}
                  </div>
                  <div className="text-white text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                    {slides[currentSlide].title}
                  </div>
                  <div className="text-white/90 text-sm md:text-lg drop-shadow">
                    {slides[currentSlide].subtitle}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Arrow Button */}
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 z-10 bg-white/50 hover:bg-white/80 transition-colors rounded-full p-2 flex items-center justify-center shadow"
            style={{ backdropFilter: 'blur(4px)' }}
            aria-label="Next Banner"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>

          {/* Dots */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex space-x-2 z-10">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;