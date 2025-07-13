
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, Droplets, Package, Zap, Settings, Truck, RotateCcw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const quickServices = [
  {
    icon: Wrench,
    title: 'Garage',
    link: '/garage-services',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    delay: '0ms'
  },
  {
    icon: Droplets,
    title: 'Washing',
    link: '/car-washing',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    delay: '100ms'
  },
  {
    icon: Package,
    title: 'Products',
    link: '/products',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    delay: '200ms'
  },
  {
    icon: Zap,
    title: 'Foglight',
    link: '/foglight',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    delay: '300ms'
  },
  {
    icon: Settings,
    title: 'Engine Oil',
    link: '/engine-oil',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    delay: '400ms'
  },
  {
    icon: Truck,
    title: 'Pickup',
    link: '/pickup',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    delay: '500ms'
  },
  {
    icon: RotateCcw,
    title: 'Greasing',
    link: '/greasing',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    delay: '600ms'
  },
  {
    icon: Sparkles,
    title: 'Detailing',
    link: '/detailing',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    delay: '700ms'
  }
];

export const QuickServiceGrid = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-4 gap-2">
        {quickServices.map((service, index) => {
          const IconComponent = service.icon;
          return (
            <Link key={index} to={service.link}>
              <Card 
                className={`border-0 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 ${
                  isVisible ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: service.delay }}
              >
                <CardContent className="p-2 text-center">
                  <div className={`w-8 h-8 ${service.bgColor} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                    <IconComponent className={`h-4 w-4 ${service.color}`} />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{service.title}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
