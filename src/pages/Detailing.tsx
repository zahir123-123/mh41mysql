import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from '@/components/booking/BookingModal';
import { Sparkles, Clock, CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { supabase } from "@/integrations/supabase/client";

export const Detailing = () => {
  const [services, setServices] = useState<any[]>([]);
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data: serviceData } = await supabase
        .from("detailing_services")
        .select("*, service_uuid")
        .order("id");
      setServices(serviceData || []);
      const { data: galleryData } = await supabase
        .from("detailing_gallery")
        .select("*")
        .limit(1)
        .single();
      if (galleryData) {
        setBeforeImage(galleryData.before_image_url || "");
        setAfterImage(galleryData.after_image_url || "");
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setBookingModalOpen(true);
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><span className="text-xl text-gray-400 animate-pulse">Loading...</span></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <Header />
      <div className="p-4 max-w-5xl mx-auto">
        {/* HERO */}
        <section className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center rounded-full shadow-lg bg-white p-2">
              <Sparkles className="h-9 w-9 text-pink-600" />
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Auto Detailing</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Professional car detailing services with stunning before &amp; after results</p>
        </section>

        {/* BEFORE/AFTER GALLERY */}
        {(beforeImage || afterImage) && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Before &amp; After Gallery</h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
              <Card className="flex-1 overflow-hidden shadow-md border-0">
                <div className="relative">
                  <img
                    src={beforeImage}
                    alt="Before detailing"
                    className="w-full h-56 object-cover object-center grayscale-[0.8] brightness-90"
                  />
                  <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-3 py-1 shadow">BEFORE</Badge>
                </div>
              </Card>
              <Card className="flex-1 overflow-hidden shadow-md border-0">
                <div className="relative">
                  <img
                    src={afterImage}
                    alt="After detailing"
                    className="w-full h-56 object-cover object-center"
                  />
                  <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs px-3 py-1 shadow">AFTER</Badge>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* SERVICES */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card
                key={service.id}
                className="bg-white/80 border-0 shadow hover:shadow-xl transition-all rounded-2xl flex flex-col"
                style={{ animation: `fadeInUp 0.6s cubic-bezier(0.21,1.02,0.73,1) ${index * 0.08}s both` }}
              >
                <CardHeader className="text-center pb-2 pt-4">
                  {service.photo && (
                    <img
                      src={service.photo}
                      alt={service.name}
                      className="w-full h-32 object-cover object-center rounded-xl mb-4"
                    />
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700">
                      <Clock className="h-3 w-3" />
                      {service.duration}
                    </Badge>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-pink-600">₹{service.price}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900 font-semibold">{service.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  <div className="space-y-2 mb-5">
                    {Array.isArray(service.features) && service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <Button
                      className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white font-semibold text-base shadow"
                      onClick={() => handleBookService(service)}
                    >
                      Book {service.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE */}
        <section className="mt-12 text-center">
          <div className="bg-gradient-to-r from-pink-100 to-blue-50 rounded-2xl p-7 shadow-md max-w-3xl mx-auto">
            <h3 className="font-bold text-pink-900 text-xl mb-3">Why Choose Our Detailing?</h3>
            <div className="flex flex-col md:flex-row justify-center items-center gap-5 text-base text-pink-800">
              <div className="flex items-center gap-2">
                <span className="text-pink-500 text-lg">✨</span>
                Professional-grade products
              </div>
              <div className="flex items-center gap-2">
                <span className="text-pink-500 text-lg">🏆</span>
                Certified detailing specialists
              </div>
              <div className="flex items-center gap-2">
                <span className="text-pink-500 text-lg">📸</span>
                Before/after documentation
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedService && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          serviceType="garage"
          serviceName={selectedService.name}
          servicePrice={selectedService.price}
          serviceId={selectedService.service_uuid}
        />
      )}

      <style>
        {`
        @keyframes fadeInUp {
          0% {opacity: 0; transform: translateY(24px);}
          100% {opacity: 1; transform: translateY(0);}
        }
        `}
      </style>
    </div>
  );
};