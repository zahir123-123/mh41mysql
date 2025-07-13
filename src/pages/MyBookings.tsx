import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Car, Package, Wrench, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { Header } from '@/components/layout/Header';
import { MenuBar } from '@/components/layout/MenuBar';

export const MyBookings = () => {
  const { user } = useAuth();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          cars(name, model, image_url),
          products(name),
          services(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingTypeIcon = (type: string) => {
    switch (type) {
      case 'rental': return <Car className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      default: return <Wrench className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 max-w-4xl mx-auto w-full pt-4 pb-20 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, idx) => (
              <Card key={idx} className="animate-pulse bg-white">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gray-200" />
                      <div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-20 rounded bg-gray-200" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                    <div className="h-3 w-16 bg-gray-100 rounded" />
                  </div>
                  <div className="h-4 w-24 bg-gray-100 rounded mb-1" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !bookings?.length ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">Your booking history will appear here once you make a reservation.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getBookingTypeIcon(booking.booking_type)}
                      <CardTitle className="text-lg">
                        {booking.booking_type === 'rental' && booking.cars?.name}
                        {booking.booking_type === 'product' && booking.products?.name}
                        {booking.booking_type === 'garage' && 'Garage Service'}
                        {booking.booking_type === 'washing' && 'Car Washing'}
                        {booking.booking_type === 'pickup' && 'Pickup Service'}
                      </CardTitle>
                      {/* Show "Pickup" tag if this is a pickup booking */}
                      {booking.booking_type === 'pickup' && (
                        <Badge className="bg-blue-100 text-blue-800 ml-2">Pickup</Badge>
                      )}
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {booking.booking_date ? format(new Date(booking.booking_date), 'MMM dd, yyyy') : 'No date'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{booking.booking_time || 'No time'}</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{booking.total_amount}
                      </div>
                      {booking.customer_notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          Note: {booking.customer_notes}
                        </p>
                      )}
                      {booking.admin_notes && (
                        <p className="text-sm text-blue-600 mt-1">
                          Admin: {booking.admin_notes}
                        </p>
                      )}
                    </div>
                    <a
                      href="tel:9370659449"
                      className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-blue-600 hover:to-sky-500 text-white px-4 py-2 rounded-md shadow-md font-semibold transition-colors duration-150"
                      title="Call Now"
                      style={{ minWidth: 120, justifyContent: 'center' }}
                    >
                      <Phone className="h-4 w-4" />
                      <span className="font-medium text-sm">Call Now</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <MenuBar />
    </div>
  );
};