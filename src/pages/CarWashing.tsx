import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from '@/components/booking/BookingModal';
import { Header } from '@/components/layout/Header';
import { MenuBar } from '@/components/layout/MenuBar';
import { Droplets, Clock, CheckCircle } from 'lucide-react';

export const CarWashing = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Fetch washing services from Supabase
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["washing-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('washing_services')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      <Header />
      {/* Modern Glassy Hero Section */}
      <div className="max-w-2xl mx-auto px-2">
        <div className="relative flex flex-col items-center justify-center my-8">
          <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-200 via-white to-cyan-100 rounded-3xl opacity-60 scale-105" />
          <div className="relative z-10 flex flex-col items-center py-8 px-4 rounded-3xl shadow-xl bg-white/80 backdrop-blur-md w-full">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="h-10 w-10 text-blue-600 drop-shadow-lg" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight drop-shadow">
                Car Washing Services
              </h1>
            </div>
            <p className="bg-white/70 border border-cyan-100 px-4 py-1 rounded-full text-cyan-700 font-medium text-base sm:text-lg shadow-sm mt-2">
              Professional car washing and detailing services
            </p>
          </div>
        </div>
      </div>

      <div className="p-2 sm:p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading…</div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No washing services found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any, index: number) => (
                <Card
                  key={service.id || index}
                  className="transition-transform duration-300 hover:scale-[1.025] hover:shadow-xl border-0 shadow-md rounded-xl overflow-hidden bg-white/90 backdrop-blur-md"
                >
                  <div className="relative">
                    <img
                      src={service.image_url || '/placeholder.jpg'}
                      alt={service.name}
                      className="w-full h-40 object-cover rounded-t-xl"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        {service.duration}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="text-lg font-bold text-blue-600 bg-white/90 rounded px-2 py-1 shadow-sm">
                        ₹{service.price}
                      </div>
                    </div>
                  </div>
                  <CardHeader className="text-center pb-3 pt-2">
                    <CardTitle className="text-lg sm:text-xl text-blue-900 font-bold">{service.name}</CardTitle>
                    <p className="text-gray-600 text-xs sm:text-sm">{service.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      {Array.isArray(service.features) &&
                        service.features.map((feature: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 rounded-lg font-semibold tracking-wide"
                      onClick={() => handleBookService(service)}
                    >
                      Book {service.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <MenuBar />

      {selectedService && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          serviceType="washing"
          serviceName={selectedService.name}
          servicePrice={selectedService.price}
          serviceId={selectedService.service_uuid} // use service_uuid for foreign key booking
        />
      )}
      <style>
        {`
          .drop-shadow-lg {
            filter: drop-shadow(0 2px 8px rgba(59,130,246,0.17));
          }
        `}
      </style>
    </div>
  );
};