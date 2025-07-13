
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

const stats = [
  {
    value: '150+',
    label: 'Cars',
    color: 'text-blue-600',
    delay: '0ms'
  },
  {
    value: '24/7',
    label: 'Service',
    color: 'text-orange-500',
    delay: '150ms'
  },
  {
    value: '5k+',
    label: 'Customers',
    color: 'text-green-600',
    delay: '300ms'
  }
];

export const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="px-4 py-2">
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`border-0 shadow-sm bg-white transform transition-all duration-500 ${
              isVisible ? 'animate-scale-in' : 'opacity-0 scale-95'
            }`}
            style={{ animationDelay: stat.delay }}
          >
            <CardContent className="p-3 text-center">
              <div className={`text-lg font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-gray-600 text-xs">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
