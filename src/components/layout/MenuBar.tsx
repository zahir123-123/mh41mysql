
import { Link, useLocation } from 'react-router-dom';
import { Home, Car, Calendar, MessageCircle, User } from 'lucide-react';

export const MenuBar = () => {
  const location = useLocation();

  const menuItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      active: location.pathname === '/'
    },
    {
      icon: Calendar,
      label: 'Bookings',
      path: '/my-bookings',
      active: location.pathname === '/my-bookings'
    },
    {
      icon: Car,
      label: 'Cars',
      path: '/cars',
      active: location.pathname === '/cars'
    },
    {
      icon: MessageCircle,
      label: 'Support',
      path: '/support',
      active: location.pathname === '/support'
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      active: location.pathname === '/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 shadow-lg">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  item.active 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
