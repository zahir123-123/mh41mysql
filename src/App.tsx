import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Cars } from "./pages/Cars";
import { CarDetail } from "./pages/CarDetail";
import { GarageServices } from "./pages/GarageServices";
import { CarWashing } from "./pages/CarWashing";
import { Products } from "./pages/Products";
import { Profile } from "./pages/Profile";
import { MyBookings } from "./pages/MyBookings";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Notifications } from "./pages/Notifications";
import { Support } from "./pages/Support";
import NotFound from "./pages/NotFound";
import { Pickup } from "./pages/Pickup";
import { EngineOil } from "./pages/EngineOil"; // ✅ Named import
import { Greasing } from "./pages/Greasing";
import { Detailing } from "./pages/Detailing";
import { Foglight } from "./pages/Foglight";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/cars/:id" element={<CarDetail />} />
            <Route path="/garage-services" element={<GarageServices />} />
            <Route path="/car-washing" element={<CarWashing />} />
            <Route path="/products" element={<Products />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/support" element={<Support />} />
            <Route path="/pickup" element={<Pickup />} />
            <Route path="/engine-oil" element={<EngineOil />} /> {/* ✅ Fixed */}
            <Route path="/greasing" element={<Greasing />} />
            <Route path="/detailing" element={<Detailing />} />
            <Route path="/foglight" element={<Foglight />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
