import { HeroBanner } from '@/components/dashboard/HeroBanner';
import { MainServiceCards } from '@/components/dashboard/MainServiceCards';
import { StatsSection } from '@/components/dashboard/StatsSection';
import { QuickServiceGrid } from '@/components/dashboard/QuickServiceGrid';
import { AvailableCars } from '@/components/dashboard/AvailableCars';
import { NewProductsSlider } from '@/components/dashboard/NewProductsSlider';

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroBanner />
      <MainServiceCards />
      <StatsSection />
      <QuickServiceGrid />
      <AvailableCars />
      <NewProductsSlider />
    </div>
  );
};