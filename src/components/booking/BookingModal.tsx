import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, MessageSquare, User, Phone, MapPin } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'garage' | 'washing' | 'product' | 'rental';
  serviceName: string;
  servicePrice: number;
  serviceId?: string;
  carId?: string;
  productId?: string;
}

export const BookingModal = ({
  isOpen,
  onClose,
  serviceType,
  serviceName,
  servicePrice,
  serviceId,
  carId,
  productId
}: BookingModalProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    customer_name: profile?.full_name || '',
    booking_date: '',
    booking_time: '',
    customer_notes: '',
    contact_number: profile?.phone || ''
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      if (!user) throw new Error('User not authenticated');

      // For 'rental', booking_time is null and location is pickup location
      // For others, location is null and booking_time is valid time string
      const booking_time =
        serviceType === 'rental'
          ? null
          : bookingData.booking_time
            ? bookingData.booking_time.length === 5
              ? bookingData.booking_time + ':00'
              : bookingData.booking_time
            : null;
      const location = serviceType === 'rental' ? bookingData.booking_time : null;

      // --- FAST INSERT: Only insert, don't select the whole row ---
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          booking_type: serviceType,
          service_id: serviceId || null,
          service_name: serviceName, // <-- Always insert the actual service name!
          car_id: carId || null,
          product_id: productId || null,
          booking_date: bookingData.booking_date,
          booking_time,
          location,
          customer_notes: bookingData.customer_notes,
          total_amount: servicePrice,
          status: 'pending'
        });

      if (error) {
        console.error('Booking error:', error);
        throw error;
      }

      // Update profile if customer provided name/phone
      if (bookingData.customer_name || bookingData.contact_number) {
        const updateData: any = {};
        if (bookingData.customer_name && !profile?.full_name) {
          updateData.full_name = bookingData.customer_name;
        }
        if (bookingData.contact_number && !profile?.phone) {
          updateData.phone = bookingData.contact_number;
        }
        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);
        }
      }

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Booking Submitted Successfully!',
          message: `Your booking for ${serviceName} has been submitted and is pending admin approval. You will be notified once it's confirmed.`
        });

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Booking Submitted! 🎉",
        description: "Your booking request has been sent to admin for approval.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['pending-bookings-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onClose();
      setFormData({ 
        customer_name: profile?.full_name || '',
        booking_date: '', 
        booking_time: '', 
        customer_notes: '',
        contact_number: profile?.phone || ''
      });
    },
    onError: (error: any) => {
      console.error('Booking mutation error:', error);
      let errorMessage = "There was an error submitting your booking. Please try again.";
      if (error.message?.includes('authentication')) {
        errorMessage = "Please sign in to make a booking.";
      } else if (error.message?.includes('violates row-level security')) {
        errorMessage = "Authentication required. Please sign in to make a booking.";
      } else if (error.code === 'PGRST116') {
        errorMessage = "Database connection error. Please try again.";
      }
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a booking.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.customer_name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name for the booking.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.contact_number.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your contact number for the booking.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.booking_date || !formData.booking_time) {
      toast({
        title: "Missing Information",
        description: serviceType === 'rental'
          ? "Please enter pickup location and date for your booking."
          : "Please select both date and time for your booking.",
        variant: "destructive"
      });
      return;
    }
    // Validate date is not in the past
    const selectedDate = new Date(formData.booking_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast({
        title: "Invalid Date",
        description: "Please select a future date for your booking.",
        variant: "destructive"
      });
      return;
    }
    createBookingMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Book {serviceName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Your Name *
            </Label>
            <Input
              id="customer_name"
              type="text"
              value={formData.customer_name}
              onChange={(e) => handleInputChange('customer_name', e.target.value)}
              placeholder="Enter your full name"
              required
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_number" className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              Contact Number *
            </Label>
            <Input
              id="contact_number"
              type="tel"
              value={formData.contact_number}
              onChange={(e) => handleInputChange('contact_number', e.target.value)}
              placeholder="Enter your contact number"
              required
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="booking_date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Preferred Date *
            </Label>
            <Input
              id="booking_date"
              type="date"
              value={formData.booking_date}
              onChange={(e) => handleInputChange('booking_date', e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          {serviceType === 'rental' ? (
            <div className="space-y-2">
              <Label htmlFor="pickup_location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Pickup Location *
              </Label>
              <Input
                id="pickup_location"
                type="text"
                value={formData.booking_time}
                onChange={(e) => handleInputChange('booking_time', e.target.value)}
                placeholder="Enter pickup location"
                required
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="booking_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Preferred Time *
              </Label>
              <Input
                id="booking_time"
                type="time"
                value={formData.booking_time}
                onChange={(e) => handleInputChange('booking_time', e.target.value)}
                required
                className="border-blue-200 focus:border-blue-400"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="customer_notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="customer_notes"
              placeholder="Any special requirements or notes..."
              value={formData.customer_notes}
              onChange={(e) => handleInputChange('customer_notes', e.target.value)}
              rows={3}
              className="border-blue-200 focus:border-blue-400"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};