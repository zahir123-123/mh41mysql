import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar, Car, Package, Wrench, Users, Zap, Settings, Droplets, Sparkles, Bell
} from "lucide-react";

import { BookingRequests } from "@/components/admin/BookingRequests";
import { ManageServices } from "@/components/admin/ManageServices";
import { ManageProducts } from "@/components/admin/ManageProducts";
import { ManageCars } from "@/components/admin/ManageCars";
import { ManageFoglights } from "@/components/admin/ManageFoglights";
import { ManageEngineOil } from "@/components/admin/ManageEngineOil";
import { ManageWashing } from "@/components/admin/ManageWashing";
import { ManageDetailing } from "@/components/admin/ManageDetailing";

// Live metrics queries
function useDashboardMetrics() {
  const { data: totalBookings = null, isLoading: loadingBookings } = useQuery({
    queryKey: ["dashboard-total-bookings"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  const { data: carsAvailable = null, isLoading: loadingCars } = useQuery({
    queryKey: ["dashboard-cars-available"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("cars")
        .select("id", { count: "exact", head: true })
        .eq("is_available", true);
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  const { data: products = null, isLoading: loadingProducts } = useQuery({
    queryKey: ["dashboard-products"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  const { data: services = null, isLoading: loadingServices } = useQuery({
    queryKey: ["dashboard-services"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("services")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  const { data: totalUsers = null, isLoading: loadingUsers } = useQuery({
    queryKey: ["dashboard-users"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  return {
    totalBookings, carsAvailable, products, services, totalUsers,
    isLoading: loadingBookings || loadingCars || loadingProducts || loadingServices || loadingUsers,
  };
}

export const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<
    'bookings' | 'services' | 'products' | 'cars' | 'foglights' | 'engineoil' | 'washing' | 'detailing'
  >('bookings');

  // Live metrics
  const {
    totalBookings,
    carsAvailable,
    products,
    services,
    totalUsers,
    isLoading: metricsLoading,
  } = useDashboardMetrics();

  // Graph points (example)
  const graphPoints = [
    [3, 6, 4, 7, 5, 8, 6, 7],
    [7, 9, 8, 10, 10, 12, 11, 10],
    [2, 2, 3, 4, 4, 5, 6, 7],
    [8, 8, 7, 9, 10, 10, 9, 10],
    [0, 1, 1, 1, 1, 1, 1, 1],
  ];

  // Server count for pending bookings
  const { data: bookingsCount = 0 } = useQuery({
    queryKey: ["pending-bookings-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isAdmin,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-bookings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["pending-bookings-count"] });
        }
      )
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [isAdmin, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181d27] via-[#303a4a] to-[#2d1361]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const stripMetrics = [
    {
      label: "Total Bookings",
      value: metricsLoading ? "..." : totalBookings,
      color: "from-cyan-400 to-blue-600",
      icon: <Calendar className="w-5 h-5 text-cyan-400" />,
      graph: graphPoints[0],
    },
    {
      label: "Cars Available",
      value: metricsLoading ? "..." : carsAvailable,
      color: "from-green-300 to-green-700",
      icon: <Car className="w-5 h-5 text-green-500" />,
      graph: graphPoints[1],
    },
    {
      label: "Products",
      value: metricsLoading ? "..." : products,
      color: "from-purple-400 to-pink-500",
      icon: <Package className="w-5 h-5 text-purple-400" />,
      graph: graphPoints[2],
    },
    {
      label: "Services",
      value: metricsLoading ? "..." : services,
      color: "from-orange-300 to-orange-500",
      icon: <Wrench className="w-5 h-5 text-orange-400" />,
      graph: graphPoints[3],
    },
    {
      label: "Total Users",
      value: metricsLoading ? "..." : totalUsers,
      color: "from-blue-300 to-indigo-500",
      icon: <Users className="w-5 h-5 text-blue-500" />,
      graph: graphPoints[4],
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#22223b] via-[#181d27] to-[#191924]">
      {/* Neon Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-44 w-[480px] h-[300px] rounded-full bg-[#36e2ef]/20 blur-3xl animate-blob-morph" />
        <div className="absolute -bottom-48 -right-28 w-[500px] h-[300px] rounded-full bg-[#ffa3fd]/20 blur-3xl animate-blob-morph2" />
      </div>
      {/* Header (make sure your Header/profile popover is fixed/absolute, not in main flex/grid row) */}
      <div className="relative z-20">
        <Header />
      </div>
      {/* Main Content */}
      <div className="relative z-10 px-2 py-4 max-w-md mx-auto w-full">
        {/* Animated Graph Cards Marquee */}
        <div className="overflow-x-hidden mb-8 relative hide-scrollbar">
          <div
            className="flex gap-4 animate-marquee whitespace-nowrap will-change-transform"
            style={{
              animationDuration: "24s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          >
            {[...Array(2)].flatMap((_, idx) =>
              stripMetrics.map((m, i) => (
                <div
                  key={m.label + idx}
                  className={`
                    min-w-[160px] max-w-[170px] mx-1 px-3 py-3 rounded-2xl shadow-lg
                    bg-gradient-to-br ${m.color}
                    border border-white/10
                    flex flex-col items-center justify-center
                    relative
                    glass-morphic
                  `}
                  style={{
                    backdropFilter: "blur(12px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(12px) saturate(1.4)",
                  }}
                >
                  <div className="absolute top-2 right-2 opacity-15 pointer-events-none">
                    <div
                      className={`rounded-full w-10 h-10 bg-gradient-to-br ${m.color} blur-lg`}
                    />
                  </div>
                  <div className="flex items-center gap-1 mb-2 z-10">{m.icon}<span className="text-sm text-white/90 font-semibold">{m.label}</span></div>
                  <span className="font-extrabold text-3xl text-white mb-1 drop-shadow animate-countup">
                    {m.value}
                  </span>
                  <svg width="64" height="26" viewBox="0 0 64 26" fill="none" className="block">
                    <polyline
                      points={m.graph.map((v, i) => `${i * 9},${26 - v * 2.2}`).join(" ")}
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0 0 4px #fff8)" }}
                    />
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>
        {/* Tabs Row */}
        <Tabs value={tab} onValueChange={v => setTab(v as any)} className="space-y-4">
          <TabsList className="flex justify-between bg-[#1f2232]/80 border border-white/10 rounded-2xl shadow-lg p-1 backdrop-blur-lg relative overflow-hidden overflow-x-auto hide-scrollbar scrollbar-thin scrollbar-thumb-[#303a4a] scrollbar-track-transparent">
            {[
              {
                key: "bookings",
                label: "Bookings",
                icon: <Bell className="h-5 w-5" />, // Use bell icon for bookings
                color: "from-[#36e2ef] to-[#2fffd7]",
              },
              {
                key: "services",
                label: "Services",
                icon: <Wrench className="h-5 w-5 text-orange-400" />,
                color: "from-[#fdff90] to-[#ffba7d]",
              },
              {
                key: "products",
                label: "Products",
                icon: <Package className="h-5 w-5 text-purple-400" />,
                color: "from-[#ffa3fd] to-[#b2bfff]",
              },
              {
                key: "cars",
                label: "Cars",
                icon: <Car className="h-5 w-5 text-green-500" />,
                color: "from-[#ccff90] to-[#37e28a]",
              },
              {
                key: "foglights",
                label: "Foglights",
                icon: <Zap className="h-5 w-5 text-yellow-500" />,
                color: "from-yellow-200 to-yellow-400",
              },
              {
                key: "engineoil",
                label: "Engine Oil",
                icon: <Settings className="h-5 w-5 text-blue-500" />,
                color: "from-blue-200 to-blue-400",
              },
              {
                key: "washing",
                label: "Washing",
                icon: <Droplets className="h-5 w-5 text-cyan-500" />,
                color: "from-cyan-100 to-cyan-400",
              },
              {
                key: "detailing",
                label: "Detailing",
                icon: <Sparkles className="h-5 w-5 text-pink-500" />,
                color: "from-pink-100 to-pink-400",
              },
            ].map((tabOpt) => (
              <TabsTrigger
                key={tabOpt.key}
                value={tabOpt.key}
                className={`
                  relative z-10 flex flex-col items-center justify-center px-2 py-2
                  rounded-xl
                  text-xs font-semibold transition-all duration-200
                  group
                  data-[state=active]:bg-gradient-to-tr
                  data-[state=active]:${tabOpt.color}
                  data-[state=active]:text-white
                  data-[state=active]:scale-105
                  hover:text-white hover:bg-white/10
                `}
                style={{
                  minWidth: 70,
                  minHeight: 56,
                }}
              >
                {/* Responsive: On small screens, show only bell icon for bookings */}
                {tabOpt.key === "bookings" ? (
                  <span className="flex flex-col items-center">
                    <span className="relative">
                      <Bell className="h-5 w-5" />
                      {bookingsCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] px-1 animate-pulse">
                          {bookingsCount}
                        </span>
                      )}
                    </span>
                    <span className="hidden sm:inline mt-1">{tabOpt.label}</span>
                  </span>
                ) : (
                  <>
                    <span className="mb-1 group-data-[state=active]:animate-icon-ripple">{tabOpt.icon}</span>
                    <span>{tabOpt.label}</span>
                  </>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="rounded-2xl bg-white/80 border border-white/30 p-3 min-h-[170px] mt-2 shadow-lg backdrop-blur-[8px]">
            <TabsContent value="bookings" className="mt-0">
              <BookingRequests />
            </TabsContent>
            <TabsContent value="services" className="mt-0">
              <ManageServices />
            </TabsContent>
            <TabsContent value="products" className="mt-0">
              <ManageProducts />
            </TabsContent>
            <TabsContent value="cars" className="mt-0">
              <ManageCars />
            </TabsContent>
            <TabsContent value="foglights" className="mt-0">
              <ManageFoglights />
            </TabsContent>
            <TabsContent value="engineoil" className="mt-0">
              <ManageEngineOil />
            </TabsContent>
            <TabsContent value="washing" className="mt-0">
              <ManageWashing />
            </TabsContent>
            <TabsContent value="detailing" className="mt-0">
              <ManageDetailing />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      {/* Animations + Hide scrollbar CSS */}
      <style>
        {`
        .glass-morphic {
          background: inherit;
          box-shadow: 0 4px 32px 0 rgba(31,34,50,0.09), 0 2px 8px 0 rgba(47,255,215,0.09);
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 24s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .hide-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          background: transparent !important;
        }
        .animate-blob-morph {
          animation: blobMorph 10s ease-in-out infinite alternate;
        }
        @keyframes blobMorph {
          0%   { transform: scale(1) translateY(0px) translateX(0px);}
          100% { transform: scale(1.14) translateY(15px) translateX(30px);}
        }
        .animate-blob-morph2 {
          animation: blobMorph2 13s ease-in-out infinite alternate;
        }
        @keyframes blobMorph2 {
          0%   { transform: scale(1) translateY(0px) translateX(0px);}
          100% { transform: scale(1.11) translateY(-22px) translateX(-28px);}
        }
        .group-data\\[state\\=active\\]\\:animate-icon-ripple[data-state="active"] {
          animation: iconRipple 0.5s cubic-bezier(.4,0,.2,1) 1;
        }
        @keyframes iconRipple {
          0% { filter: drop-shadow(0 0 0px #fff); }
          50% { filter: drop-shadow(0 0 12px #fff); }
          100% { filter: drop-shadow(0 0 0px #fff); }
        }
        .animate-countup {
          animation: countUp 1.1s cubic-bezier(.4,0,.2,1) 1;
        }
        @keyframes countUp {
          0% { opacity: 0; transform: translateY(10px) scale(0.8);}
          65% { opacity: 1; transform: translateY(-2px) scale(1.06);}
          100% { opacity: 1; transform: none;}
        }
        `}
      </style>
    </div>
  );
};