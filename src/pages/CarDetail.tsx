import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingModal } from "@/components/booking/BookingModal";
import { Header } from "@/components/layout/Header";
import {
  Star, Share2, Users, Fuel, Calendar,
  Settings, BadgeCheck, X, Phone, Snowflake
} from "lucide-react";

// For copying to clipboard
function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

function FadeImage({ src, alt, className = "", ...rest }: { src: string, alt?: string, className?: string, [x: string]: any }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      className={`transition-opacity duration-300 ease-in-out ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      onLoad={() => setLoaded(true)}
      draggable={false}
      style={{ userSelect: "none" }}
      {...rest}
    />
  );
}

export const CarDetail = () => {
  const { id } = useParams();
  const [tab, setTab] = useState<"about" | "gallery" | "driver">("about");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [mainIdx, setMainIdx] = useState(0);
  const [fullScreenImg, setFullScreenImg] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Detect id type: crude check for UUID
  const isUuid = id && id.length > 10;
  const carIdQuery = isUuid ? id : Number(id);

  const { data: car, isLoading, isError } = useQuery({
    queryKey: ["car", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", carIdQuery)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Phone dialer handler
  const dialNumber = () => {
    window.open("tel:9370659449");
  };

  // --- Share Logic ---
  const currentUrl = typeof window !== "undefined"
    ? window.location.origin + `/cars/${id ?? ""}`
    : `/cars/${id ?? ""}`;

  const handleShare = () => {
    setShareOpen(true);
  };

  const handleCopyLink = () => {
    copyToClipboard(currentUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1200);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent("Check out this car: " + currentUrl)}`, "_blank");
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: car?.name || "Car",
          text: `Check out this car on our app!`,
          url: currentUrl,
        });
      } catch (e) { /* ignore cancel */ }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }
  if (isError || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Car Not Found</h1>
          <p className="text-gray-500 text-sm">The car you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Prepare images
  let images: string[] = [];
  if (Array.isArray(car.gallery_images) && car.gallery_images.length > 0) {
    images = car.gallery_images.filter(Boolean);
  }
  if (!images.length && car.image_url) {
    images = [car.image_url];
  }
  if (!images.length) {
    images = ["/placeholder.jpg"];
  }
  const subImages = Array(5).fill(0).map((_, i) => images[i] || images[0] || "/placeholder.jpg");
  const moreImagesCount = images.length > 5 ? images.length - 5 : 0;
  const mainImage = images[mainIdx] || images[0] || "/placeholder.jpg";

  // Driver data
  const driver = {
    name: car.driver_name || "Rahul Sharma",
    avatar: car.driver_avatar || "https://randomuser.me/api/portraits/men/32.jpg",
    age: car.driver_age || 28,
    experience: car.driver_experience || 5,
    rating: car.driver_rating || 4.9,
    licence_expiry: car.driver_licence_expiry || "2028-06-15",
    bio: car.driver_bio || "Professional driver with 5 years of experience. Provides safe and comfortable rides with excellent knowledge of local routes.",
    tags: [
      "Safe Driving",
      "Experienced"
    ]
  };

  // Air conditioning
  const hasAirConditioning = Array.isArray(car.features)
    ? car.features.some(f => f.toLowerCase().includes("air conditioning") || f.toLowerCase().includes("a/c"))
    : true;

  const carSpecs = [
    { label: "Year", value: car.year || "2021", icon: Calendar },
    { label: "Seater", value: car.capacity || "5", icon: Users },
    { label: "Tank", value: car.tank_capacity ? `${car.tank_capacity} L` : "60 L", icon: Fuel },
    { label: "Number", value: car.number || "MH41-1234", icon: BadgeCheck },
    { label: "Condition", value: car.condition || "Excellent", icon: Settings },
    {
      label: "A/C",
      value: hasAirConditioning ? "Available" : "No A/C",
      icon: Snowflake,
      custom: true,
      available: hasAirConditioning
    }
  ];
  const features = Array.isArray(car.features) ? car.features : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex flex-col relative overscroll-none">
      {/* Header */}
      <Header />

      {/* Images */}
      <div className="flex flex-col items-center bg-white rounded-b-3xl shadow p-2 pb-6">
        <div className="relative w-full max-w-sm mx-auto mb-2">
          {/* Shining effect for main image */}
          <span className="main-image-shine absolute inset-0 z-10 pointer-events-none"></span>
          {/* Rating tag top left on image */}
          <div className="absolute top-2 left-2 z-20">
            <span className="flex items-center gap-1 px-2 py-[2px] bg-blue-700/90 text-white rounded-full font-semibold text-xs shadow-lg backdrop-blur-sm select-none">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" fill="currentColor" />
              {car.rating || 4.5}
            </span>
          </div>
          <FadeImage
            src={mainImage}
            alt={car.name}
            className="w-full h-48 md:h-72 object-contain rounded-2xl shadow-xl bg-gradient-to-b from-blue-100 to-white cursor-pointer relative"
            onClick={() => setFullScreenImg(mainIdx)}
          />
          {/* Dots */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block w-2 h-2 rounded-full ${idx === mainIdx ? "bg-blue-600" : "bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-2 justify-center">
          {subImages.map((img, idx) =>
            <div
              key={idx}
              className={`rounded-lg border-2 shadow cursor-pointer transition-all duration-200 
                ${mainIdx === idx ? "border-blue-600 scale-105" : "border-gray-200 opacity-70 hover:opacity-100"}
              `}
              onClick={() => setMainIdx(idx)}
            >
              <FadeImage
                src={img}
                alt={`Car sub ${idx + 1}`}
                className="w-14 h-14 object-cover rounded-lg"
              />
            </div>
          )}
          {moreImagesCount > 0 && (
            <div
              className="w-14 h-14 bg-blue-50 text-blue-700 flex items-center justify-center rounded-lg font-bold text-lg border-2 border-blue-200 shadow"
              onClick={() => setTab("gallery")}
            >+{moreImagesCount}</div>
          )}
        </div>
      </div>

      {/* Car name & brand tag, call & share */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-1 bg-white relative" style={{ minHeight: "2.7em" }}>
        <span className="flex items-center">
          <span
            className="px-1 py-[1px] text-[8px] font-bold tracking-widest bg-blue-100 text-blue-700 rounded shadow border border-blue-200 uppercase select-none"
            style={{
              letterSpacing: "0.1em",
              minWidth: "2.2em",
              marginRight: "0.55em",
              display: "inline-block"
            }}
          >
            {car.type || "SUV"}
          </span>
          <span
            className="text-lg font-bold text-gray-900 leading-none"
            style={{
              lineHeight: "1.1",
              display: "inline-block"
            }}
          >
            {car.name}
          </span>
        </span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:bg-blue-50"
            aria-label="Call"
            onClick={dialNumber}
          >
            <Phone className="h-5 w-5 call-shake" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-600 hover:bg-blue-50"
            aria-label="share"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-5 mt-1 border-b border-gray-200 bg-white sticky top-[106px] z-20">
        {[
          { label: "About", key: "about" },
          { label: "Gallery", key: "gallery" },
          { label: "Driver", key: "driver" }
        ].map(tabInfo => (
          <button
            key={tabInfo.key}
            onClick={() => setTab(tabInfo.key as typeof tab)}
            className={`flex-1 py-3 text-center font-semibold transition
              ${tab === tabInfo.key ? "border-b-2 border-blue-600 text-blue-700" : "text-gray-500"}
            `}
          >
            {tabInfo.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 px-5 py-4 bg-white rounded-b-3xl shadow mb-28">
        {tab === "about" && (
          <>
            {/* Car specification */}
            <div className="mb-6">
              <div className="font-semibold text-gray-800 mb-2">Specification</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {carSpecs.map(({ label, value, icon: Icon, custom, available }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2 rounded-lg p-3 shadow-sm border
                      ${custom && label === "A/C"
                        ? available
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-100 border-gray-200 opacity-60"
                        : "bg-blue-50 border-blue-100"
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${custom && label === "A/C" ? "text-blue-700" : "text-blue-600"}`} />
                    <div>
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className="font-medium text-gray-800">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Features */}
            {features.length > 0 && (
              <div>
                <div className="font-semibold text-gray-800 mb-2">Features</div>
                <div className="flex flex-wrap gap-2">
                  {features.map((f: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-blue-50 text-blue-700 border border-blue-100">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "gallery" && (
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`car gallery ${i + 1}`}
                className="w-28 h-28 object-cover rounded-xl shadow cursor-pointer transition-transform hover:scale-105"
                onClick={() => setFullScreenImg(i)}
                draggable={false}
                style={{ userSelect: "none" }}
              />
            ))}
          </div>
        )}

        {tab === "driver" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow driver-shine-card overflow-hidden relative">
              {/* Shine effect */}
              <div className="driver-shine-anim pointer-events-none" />
              <img
                src={driver.avatar}
                alt={driver.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-300 shadow-lg mb-3"
              />
              <h3 className="text-xl font-bold text-gray-900">{driver.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" fill="currentColor" />
                <span className="font-semibold text-gray-800">{driver.rating}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  {driver.experience} years experience
                </span>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                {driver.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-green-100 text-green-700 border border-green-200">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-3 text-gray-700 text-sm">{driver.bio}</div>
              <div className="flex justify-center gap-8 mt-4">
                <div className="text-center">
                  <div className="font-semibold text-blue-900">Age</div>
                  <div className="text-gray-800">{driver.age} yrs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-900">License Expiry</div>
                  <div className="text-gray-800">{driver.licence_expiry}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed left-0 right-0 bottom-0 bg-white p-0 z-30 shadow-xl border-t">
        <div className="flex items-center justify-between max-w-md mx-auto px-4 py-3 gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-blue-800 font-semibold mb-1 tracking-widest uppercase">Price</span>
            <span className="text-[2.1rem] font-black text-blue-800 drop-shadow-sm tracking-tight leading-none">
              ₹{car.price_per_day}
              <span className="text-base font-bold text-gray-700">/day</span>
            </span>
          </div>
          <Button
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-blue-600 hover:to-green-500 text-white px-10 py-3 font-extrabold rounded-2xl shadow-xl text-lg transition-all scale-105 hover:scale-110 border-none outline-none focus:ring-2 focus:ring-blue-300"
            onClick={() => setBookingModalOpen(true)}
            style={{ letterSpacing: "0.03em", minWidth: 140 }}
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullScreenImg !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center"
          onClick={() => setFullScreenImg(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white bg-black/50"
            onClick={e => { e.stopPropagation(); setFullScreenImg(null); }}
          >
            <X className="h-7 w-7" />
          </Button>
          <img
            src={images[fullScreenImg]}
            alt="Full image"
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl animate-fade-in"
            draggable={false}
            style={{ userSelect: "none" }}
          />
          <div className="flex gap-2 mt-4">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`preview ${i + 1}`}
                className={`w-14 h-14 rounded border-2 cursor-pointer mx-1 ${i === fullScreenImg ? "border-blue-500" : "border-transparent opacity-70 hover:opacity-100"}`}
                onClick={e => { e.stopPropagation(); setFullScreenImg(i); }}
                draggable={false}
                style={{ userSelect: "none" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          serviceType="rental"
          serviceName={`${car.name} ${car.model}`}
          servicePrice={car.price_per_day}
          carId={car.id}
        />
      )}
      <style>{`
        .animate-fade-in {
          animation: fadeInImg 0.35s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeInImg {
          from { opacity: 0; transform: scale(0.96);}
          to { opacity: 1; transform: scale(1);}
        }
        .driver-shine-card {
          position: relative;
          overflow: hidden;
        }
        .driver-shine-anim {
          pointer-events: none;
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            120deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.8) 30%,
            rgba(255,255,255,0.1) 60%,
            rgba(255,255,255,0) 100%
          );
          opacity: 0.5;
          transform: translateX(-100%) skewX(-20deg);
          animation: shine-sweep 2.5s linear infinite;
          z-index: 10;
        }
        @keyframes shine-sweep {
          0% {
            transform: translateX(-120%) skewX(-20deg);
            opacity: 0.7;
          }
          60% {
            opacity: 0.7;
          }
          80% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(120%) skewX(-20deg);
            opacity: 0;
          }
        }
        .main-image-shine {
          pointer-events: none;
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 1.5rem;
          overflow: hidden;
        }
        .main-image-shine::before {
          content: "";
          position: absolute;
          top: -60%;
          left: -40%;
          width: 180%;
          height: 200%;
          background: linear-gradient(
            120deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.7) 20%,
            rgba(255,255,255,0.1) 60%,
            rgba(255,255,255,0) 100%
          );
          transform: translateX(-100%) skewX(-20deg);
          animation: main-shine 2.5s linear infinite;
          opacity: .6;
          border-radius: 1.5rem;
        }
        @keyframes main-shine {
          0% {
            transform: translateX(-120%) skewX(-20deg);
            opacity: 0.7;
          }
          60% {
            opacity: 0.7;
          }
          80% {
            opacity: 0.4;
          }
          100% {
            transform: translateX(120%) skewX(-20deg);
            opacity: 0;
          }
        }
        .call-shake {
          animation: call-shake 2s infinite;
          will-change: transform;
        }
        @keyframes call-shake {
          0% { transform: rotate(0deg);}
          5% { transform: rotate(-12deg);}
          10% { transform: rotate(12deg);}
          15% { transform: rotate(-8deg);}
          20% { transform: rotate(8deg);}
          25% { transform: rotate(-4deg);}
          30% { transform: rotate(4deg);}
          35% { transform: rotate(0deg);}
          100% { transform: rotate(0deg);}
        }
      `}</style>
    </div>
  );
};