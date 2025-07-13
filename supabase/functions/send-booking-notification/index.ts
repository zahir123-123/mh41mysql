
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      bookingId, 
      serviceName, 
      customerName, 
      customerEmail, 
      bookingDate, 
      bookingTime, 
      totalAmount 
    } = await req.json();

    // Create notification for admin users
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (adminProfiles && adminProfiles.length > 0) {
      const notifications = adminProfiles.map(admin => ({
        user_id: admin.id,
        title: 'New Booking Request',
        message: `${customerName} has requested a booking for ${serviceName} on ${bookingDate} at ${bookingTime}. Amount: ₹${totalAmount}`
      }));

      await supabase
        .from('notifications')
        .insert(notifications);
    }

    console.log('Admin notifications sent for booking:', bookingId);

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error sending booking notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
