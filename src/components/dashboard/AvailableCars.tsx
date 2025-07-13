import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CarCardLoader } from '@/components/ui/CarCardLoader';

export const AvailableCars = () => {
  const { data: cars = [], isLoading } = useQuery({
    queryKey: ['dashboard-available-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('id, name, model, price_per_day, rating, review_count, image_url, is_available')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    suspense: false,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Available Cars</h2>
        <Link to="/cars" className="text-blue-600 text-sm font-medium hover:text-blue-700">See All</Link>
      </div>
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <CarCardLoader key={i} />)
          : cars.length === 0
          ? (
            <div className="py-8 px-4 text-gray-500 text-center w-full">No cars available right now.</div>
          ) : (
            cars.map((car: any) => (
              <Link key={car.id} to={`/cars/${car.id}`} className="flex-shrink-0">
                <Card className="min-w-[180px] border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="relative">
                    <img
                      src={
                        car.image_url && typeof car.image_url === 'string' && car.image_url.trim()
                          ? car.image_url
                          : '/placeholder.jpg'
                      }
                      alt={car.name}
                      className="w-full h-28 object-cover rounded-t-lg"
                      loading="lazy"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${
                        car.is_available ? 'bg-green-500' : 'bg-red-500'
                      } text-white`}
                    >
                      {car.is_available ? 'Available' : 'Booked'}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{car.name}</h3>
                    <p className="text-gray-600 text-xs mb-2">{car.model}</p>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-xs font-medium">{car.rating}</span>
                        <span className="text-xs text-gray-500">({car.review_count ?? 0})</span>
                      </div>
                      <div className="text-blue-600 font-bold text-sm">
                        ₹{car.price_per_day}/day
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )
        }
      </div>
    </div>
  );
};