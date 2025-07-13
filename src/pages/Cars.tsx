import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookingModal } from '@/components/booking/BookingModal';
import { Header } from '@/components/layout/Header';
import { MenuBar } from '@/components/layout/MenuBar';
import {
  Car as CarIcon,
  Star,
  Users,
  Fuel,
  Settings,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Cars = () => {
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // REMOVE .eq('is_available', true) TO SHOW ALL CARS
  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['rental-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 p-4 pb-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <CarIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Premium Car Rentals</h1>
          </div>
          <p className="text-gray-600">Choose from our fleet of premium vehicles for your journey</p>
        </div>

        {isLoading ? (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2">
                <CarIcon className="h-6 w-6 text-blue-700 animate-pulse" />
                <span className="text-xl font-bold text-blue-700">MH41 Cars</span>
              </div>
              <p className="text-gray-500 mt-1">Fetching latest cars for you...</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white shadow-md animate-pulse">
                  <div className="relative h-40 rounded-t bg-gray-200 flex items-center justify-center">
                    <CarIcon className="h-10 w-10 text-gray-400" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded"></div>
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="h-3 w-16 bg-gray-100 rounded"></div>
                      <div className="h-3 w-20 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <Link to={`/cars/${car.id}`} key={car.id}>
                <Card
                  className="hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={
                        car.image_url && typeof car.image_url === 'string' && car.image_url.trim()
                          ? car.image_url
                          : '/placeholder.jpg'
                      }
                      alt={car.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                    <Badge
                      className={`absolute top-3 right-3 ${
                        car.is_available ? 'bg-green-500' : 'bg-red-500'
                      } text-white`}
                    >
                      {car.is_available ? 'Available' : 'Booked'}
                    </Badge>
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium">{car.rating}</span>
                      <span className="text-xs text-gray-500">({car.review_count})</span>
                    </div>
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-gray-900">{car.name}</CardTitle>
                        <p className="text-gray-600 text-sm">{car.model}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ₹{car.price_per_day}
                        </div>
                        <p className="text-xs text-gray-500">per day</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{car.capacity} seats</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" />
                        <span>{car.fuel_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>{car.transmission}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{car.engine_size}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!car.is_available}
                      onClick={e => {
                        e.preventDefault();
                        setSelectedCar(car);
                        setBookingModalOpen(true);
                      }}
                    >
                      {car.is_available ? 'Book Now' : 'Not Available'}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Why Choose Our Car Rental?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-700">
              <div>🚗 Premium fleet</div>
              <div>🛡️ Full insurance</div>
              <div>🔧 24/7 support</div>
              <div>📍 Free delivery</div>
            </div>
          </div>
        </div>
      </div>

      <MenuBar />

      {selectedCar && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          serviceType="rental"
          serviceName={`${selectedCar.name} ${car.model}`}
          servicePrice={selectedCar.price_per_day}
          carId={selectedCar.id}
        />
      )}
    </div>
  );
};