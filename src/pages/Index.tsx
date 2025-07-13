import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { HeroBanner } from '@/components/dashboard/HeroBanner';
import { MainServiceCards } from '@/components/dashboard/MainServiceCards';
import { QuickServiceGrid } from '@/components/dashboard/QuickServiceGrid';
import { AvailableCars } from '@/components/dashboard/AvailableCars';
import { StatsSection } from '@/components/dashboard/StatsSection';
import { Header } from '@/components/layout/Header';
import { MenuBar } from '@/components/layout/MenuBar';
import { NewProductsSlider } from '@/components/dashboard/NewProductsSlider';

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pb-20">
        <HeroBanner />
        <StatsSection />
        <MainServiceCards />
        <QuickServiceGrid />
        <AvailableCars />
        <NewProductsSlider />
      </div>
      <MenuBar />
    </div>
  );
};

export default Index;
