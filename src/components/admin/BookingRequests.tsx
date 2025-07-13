import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Phone, User, Calendar, Clock, Car, Package, Wrench } from 'lucide-react';
import { format } from 'date-fns';

type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export const BookingRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all bookings with OUTER JOIN on profiles (do NOT use !inner)
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles(id, full_name, phone, email),
          cars(name, model),
          products(name),
          services(name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: BookingStatus; adminNotes?: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status, 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['pending-bookings-count'] });
      toast({
        title: "Booking Updated",
        description: `Booking has been ${variables.status}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive"
      });
    }
  });

  const handleAccept = (bookingId: string) => {
    updateBookingMutation.mutate({ 
      id: bookingId, 
      status: 'accepted',
      adminNotes: 'Booking approved by admin'
    });
  };

  const handleReject = (bookingId: string) => {
    updateBookingMutation.mutate({ 
      id: bookingId, 
      status: 'rejected',
      adminNotes: 'Booking rejected by admin'
    });
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone || '9370659449'}`;
  };

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

  useEffect(() => {
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show ALL bookings (no status filter)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Booking Requests</h2>
        <Badge variant="outline">
          {bookings?.filter(b => b.status === 'pending').length || 0} Pending
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {bookings?.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getBookingTypeIcon(booking.booking_type)}
                  <CardTitle className="text-lg">
                    {booking.booking_type === 'rental' && (booking.cars?.name || 'Rental')}
                    {booking.booking_type === 'product' && (booking.products?.name || 'Product')}
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
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{booking.profiles?.full_name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{booking.profiles?.phone || 'No phone'}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCall(booking.profiles?.phone)}
                    className="ml-auto p-1 h-auto"
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {booking.booking_date ? format(new Date(booking.booking_date), 'MMM dd, yyyy') : 'No date'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{booking.booking_time || 'No time'}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="text-lg font-bold text-green-600">
                  ₹{booking.total_amount}
                </div>
                {booking.customer_notes && (
                  <p className="text-sm text-gray-600 mt-2">
                    Note: {booking.customer_notes}
                  </p>
                )}
              </div>

              {/* Show Accept/Reject only for pending */}
              {booking.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAccept(booking.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={updateBookingMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleReject(booking.id)}
                    variant="outline"
                    className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                    disabled={updateBookingMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!bookings || bookings.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600">Booking requests will appear here when customers make reservations.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};