import { Card, CardContent } from '@/components/ui/card';
import { Car, Droplets, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: Car,
    title: 'Rent Car',
    subtitle: '$500+',
    link: '/cars',
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    textColor: 'text-white'
  },
  {
    icon: Droplets,
    title: 'Washing',
    subtitle: '$30+',
    link: '/car-washing',
    bgColor: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
    textColor: 'text-white'
  },
  {
    icon: Wrench,
    title: 'Garage',
    subtitle: '24/7',
    link: '/garage-services',
    bgColor: 'bg-gradient-to-br from-orange-400 to-orange-500',
    textColor: 'text-white'
  }
];

export const MainServiceCards = () => {
  return (
    <div className="px-4 py-3">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Our Services</h2>
      <div className="grid grid-cols-3 gap-2">
        {services.map((service, index) => {
          const IconComponent = service.icon;
          return (
            <Link key={index} to={service.link}>
              <Card
                className={`
                  ${service.bgColor} border-0 shadow-lg transition-all duration-300 transform hover:scale-105
                  relative overflow-hidden
                `}
              >
                {/* Continuous Shine Effect */}
                <span
                  className="pointer-events-none absolute top-0 left-0 w-full h-full z-20"
                  style={{
                    background: 'linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)',
                    transform: 'translateX(-100%)',
                    animation: 'shine-move 4s linear infinite'
                  }}
                />
                <CardContent className="p-3 text-center relative z-30">
                  <IconComponent className={`h-6 w-6 ${service.textColor} mx-auto mb-2`} />
                  <h3 className={`font-semibold ${service.textColor} text-xs mb-1`}>{service.title}</h3>
                  <p className={`${service.textColor} text-xs opacity-90`}>{service.subtitle}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <div className="flex justify-center space-x-1 mt-3">
        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
      </div>
      {/* Keyframes for shine animation */}
      <style>
        {`
        @keyframes shine-move {
          0% {
            transform: translateX(-100%);
          }
          60% {
            transform: translateX(120%);
          }
          100% {
            transform: translateX(120%);
          }
        }
        `}
      </style>
    </div>
  );
};