import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  CheckCircle,
  X,
  Calendar,
  Check,
  XCircle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/Header';

export const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query notifications for user
  const {
    data: notifications,
    isLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      await refetchNotifications();
      toast({
        title: 'Marked as read',
        description: 'All unread notifications have been marked as read.',
      });
      window.location.reload(); // Force refresh for badge update everywhere
    },
  });

  // Mark as read (single)
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      await refetchNotifications();
      window.location.reload(); // Force refresh for badge update everywhere
    },
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      await refetchNotifications();
      toast({
        title: 'Notification deleted',
        description: 'The notification has been removed.',
      });
    },
  });

  // Delete all notifications for user
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      await refetchNotifications();
      toast({
        title: 'All notifications deleted',
        description: 'All notifications have been removed.',
      });
    },
  });

  // Real-time updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
          refetchNotifications();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, refetchNotifications]);

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;
  const hasNotifications = notifications && notifications.length > 0;

  // Enhanced notification card color and icon
  function getCardStyleAndIcon(type: string, is_read: boolean) {
    switch (type) {
      case 'booking_confirmed':
        return {
          card: is_read
            ? 'border-green-100 bg-green-50'
            : 'border-green-300 bg-green-100 shadow-green-100/40 shadow-xl',
          icon: (
            <CheckCircle className="h-6 w-6 text-green-600 drop-shadow-lg" />
          ),
        };
      case 'booking_rejected':
        return {
          card: is_read
            ? 'border-red-100 bg-red-50'
            : 'border-red-300 bg-red-100 shadow-red-100/40 shadow-xl',
          icon: (
            <XCircle className="h-6 w-6 text-red-600 drop-shadow-lg" />
          ),
        };
      case 'booking_request':
      default:
        return {
          card: is_read
            ? 'border-blue-100 bg-blue-50'
            : 'border-blue-300 bg-blue-100 shadow-blue-100/40 shadow-xl',
          icon: (
            <Bell className="h-6 w-6 text-blue-600 drop-shadow-lg" />
          ),
        };
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Header />
      <div className="p-4 max-w-2xl mx-auto">
        {/* Heading row with actions on right */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-6 border-b border-blue-100 pb-3">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600 animate-bounce" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 text-base">All your booking requests & confirmations</p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0 ml-auto">
            {hasNotifications && (
              <Button
                variant="outline"
                size="sm"
                className="border-red-400 text-red-700 hover:bg-red-100 transition"
                onClick={() => deleteAllMutation.mutate()}
                disabled={deleteAllMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete all
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="border-blue-400 text-blue-700 hover:bg-blue-100 transition"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all as read ({unreadCount})
              </Button>
            )}
          </div>
        </div>
        {isLoading ? (
          <div className="flex flex-col items-center mt-12">
            <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-2" />
            <div className="text-lg text-gray-600">Loading notifications...</div>
          </div>
        ) : !notifications?.length ? (
          <Card className="bg-gradient-to-r from-blue-100 to-green-100 border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-600">
                You'll see notifications here when you make or receive booking requests.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {notifications.map((notification) => {
              const type =
                notification.type ||
                (notification.title?.toLowerCase().includes('confirm')
                  ? 'booking_confirmed'
                  : notification.title?.toLowerCase().includes('reject')
                  ? 'booking_rejected'
                  : 'booking_request');
              const { card, icon } = getCardStyleAndIcon(type, notification.is_read);

              return (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-2xl ${card} border-2`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex gap-4 items-center">
                      <div className="flex flex-col items-center">
                        {icon}
                        {!notification.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 animate-pulse"></span>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                          {notification.title}
                        </CardTitle>
                        <p className="text-gray-700 leading-relaxed text-base mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(
                              new Date(notification.created_at),
                              'MMM dd, yyyy - h:mm a'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-end gap-2 pt-1">
                    {!notification.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-400 text-blue-700 hover:bg-blue-100 transition"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark as read
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-400 text-red-700 hover:bg-red-100 transition"
                      onClick={() => deleteNotificationMutation.mutate(notification.id)}
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};