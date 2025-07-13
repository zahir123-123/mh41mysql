import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Star } from 'lucide-react';
import { BookingModal } from '@/components/booking/BookingModal';

export const EngineOil = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Fetch engine oil services from Supabase
  const { data: engineOilServices = [], isLoading } = useQuery({
    queryKey: ["engine-oil-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("engine_oil_services")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleBookService = (service: any) => {
    setSelectedService({
      ...service,
      serviceType: 'garage', // Must be a valid enum value in your bookings table
      totalPrice: service.price,
      serviceId: service.service_uuid, // Must be a UUID in your main services table
    });
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-4 max-w-5xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Engine Oil Services</h1>
          </div>
          <p className="text-gray-600">Choose the best oil service to boost your engine's life</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : engineOilServices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No engine oil services found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {engineOilServices.map((service: any, index: number) => (
              <Card
                key={service.id || index}
                className="hover:shadow-lg transition-all duration-300 border-0 shadow-md animate-scale-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Recommended
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                      <span className="text-sm font-medium">{service.rating}</span>
                      <span className="text-xs text-gray-500">({service.reviews})</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900">{service.name}</CardTitle>
                  <div className="text-2xl font-bold text-blue-600">₹{service.price}</div>
                </CardHeader>

                <CardContent className="pt-0">
                  {service.image_url && (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="w-full h-48 object-cover rounded mb-3"
                      style={{ background: "#f7f7f7", objectFit: "cover" }}
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}

                  <div className="space-y-2 mb-6">
                    {Array.isArray(service.features) && service.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleBookService(service)}
                  >
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedService && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          serviceType={selectedService.serviceType}
          serviceName={selectedService.name}
          servicePrice={selectedService.totalPrice}
          serviceId={selectedService.serviceId}
        />
      )}
    </div>
  );
};