import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from '@/components/booking/BookingModal';
import { Zap, Clock, CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';

export const Foglight = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);

  // Fetch logged-in user from Supabase Auth
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ? { id: data.user.id } : null);
    };
    fetchUser();
  }, []);

  // Fetch foglight services from Supabase
  const { data: services = [], isLoading } = useQuery({
    queryKey: ['foglights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('foglights')
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-8 w-8 text-yellow-600" />
            <h1 className="text-3xl font-bold text-gray-900">Foglight Installation</h1>
          </div>
          <p className="text-gray-600">Professional foglight installation services for better visibility</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No foglight services found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service: any, index: number) => (
              <Card key={service.id || index} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                {/* IMAGE TOP SECTION */}
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={service.image_url || '/placeholder.jpg'}
                    alt={service.name}
                    className="w-full h-full object-cover"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg'; }}
                  />
                </div>
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.duration}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">₹{service.price}</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900">{service.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {Array.isArray(service.features) && service.features.length > 0 && service.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
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

      {selectedService && user && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          serviceType="garage" // Use a valid enum value for your service_type column, e.g. "garage"
          serviceName={selectedService.name} // Pass the actual product/service name
          servicePrice={selectedService.price}
          serviceId={selectedService.service_uuid} // use service_uuid for foreign key!
          user={user}
        />
      )}
      {selectedService && !user && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow text-center">
            Please log in to book a service.
            <Button className="mt-4" onClick={() => setBookingModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};