import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from '@/components/booking/BookingModal';
import { Header } from '@/components/layout/Header';
import { MenuBar } from '@/components/layout/MenuBar';
import { Wrench, Clock, CheckCircle } from 'lucide-react';

export const GarageServices = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Fetch garage services from Supabase
  const { data: services, isLoading } = useQuery({
    queryKey: ['garage-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('type', 'garage')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Sticky, compact header */}
      <div className="sticky top-0 z-30 w-full transition-all duration-500">
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-6 bg-white/95 backdrop-blur-md shadow-sm rounded-b-2xl border-b border-blue-50">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-blue-100 rounded-full h-8 w-8">
              <Wrench className="h-5 w-5 text-blue-700" />
            </span>
            <span className="font-extrabold text-lg text-blue-900 tracking-tight">Garage Services</span>
          </div>
          <span className="hidden xs:inline-block bg-cyan-100/80 text-cyan-800 text-xs font-medium px-3 py-1 rounded-full">
            Vehicle maintenance & repair
          </span>
        </div>
      </div>

      {/* Main content */}
      <div>
        <div className="p-2 sm:p-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4 sm:p-6">
                      <div className="h-40 sm:h-44 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : services && services.length > 0 ? (
                services.map((service: any) => (
                  <Card
                    key={service.id}
                    className="hover:shadow-lg transition-all duration-300 border-0 shadow-md rounded-xl overflow-hidden bg-white"
                  >
                    {/* Image section with top overlays */}
                    <div className="relative">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-full h-40 sm:h-44 object-cover rounded-t-xl"
                        />
                      ) : (
                        <div className="w-full h-40 sm:h-44 bg-gray-200 flex items-center justify-center text-gray-400 rounded-t-xl">
                          No Image
                        </div>
                      )}
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs sm:text-sm">
                          <Clock className="h-3 w-3" />
                          {service.duration || 'N/A'}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <div className="text-base sm:text-xl font-bold text-blue-600 bg-white/90 rounded px-2 py-1 shadow-sm">
                          ₹{service.price}
                        </div>
                      </div>
                    </div>
                    <CardHeader className="text-center pb-3 pt-2">
                      <CardTitle className="text-base sm:text-xl text-gray-900">{service.name}</CardTitle>
                      <p className="text-gray-600 text-xs sm:text-sm">{service.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                        {Array.isArray(service.features) &&
                          service.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 sm:gap-3">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base py-2 sm:py-2.5 rounded-lg"
                        onClick={() => handleBookService(service)}
                      >
                        Book {service.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
                    <p className="text-gray-600">Add your first service to get started.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <MenuBar />

      {selectedService && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          serviceType="garage"
          serviceName={selectedService.name}
          servicePrice={selectedService.price}
          serviceId={selectedService.id}
        />
      )}

      <style>
        {`
        @media (max-width: 400px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
          .xs\\:inline-block {
            display: none !important;
          }
        }
        .animate-spin-slow {
          animation: spin 2.3s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg);}
        }
        `}
      </style>
    </div>
  );
};