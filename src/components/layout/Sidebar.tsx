import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Menu, Car, Wrench, Droplets, Package, Zap, Settings, Truck,
  RotateCcw, Sparkles, Phone, MapPin, X
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const StickerBG = () => (
  <>
    <Car
      className="absolute top-3 left-5 w-12 h-12 text-white/60 drop-shadow-md pointer-events-none select-none animate-sticker-float"
      style={{ filter: 'blur(0.5px)' }}
    />
    <Droplets
      className="absolute top-36 left-0 w-10 h-10 text-cyan-200/70 drop-shadow pointer-events-none select-none animate-sticker-float2"
      style={{ filter: 'blur(0.7px)' }}
    />
    <Wrench
      className="absolute bottom-2 right-8 w-10 h-10 text-blue-200/35 drop-shadow pointer-events-none select-none animate-sticker-float3"
      style={{ filter: 'blur(0.5px)' }}
    />
  </>
);

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { icon: Car, label: 'Cars', href: '/cars' },
    { icon: Wrench, label: 'Garage', href: '/garage' },
    { icon: Droplets, label: 'Washing', href: '/washing' },
    { icon: Package, label: 'Products', href: '/products' },
    { icon: Zap, label: 'Foglight', href: '/foglight' },
    { icon: Settings, label: 'Engine Oil', href: '/engine-oil' },
    { icon: Truck, label: 'Pickup', href: '/pickup' },
    { icon: RotateCcw, label: 'Greasing', href: '/greasing' },
    { icon: Sparkles, label: 'Detailing', href: '/detailing' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full shadow-lg bg-white/80 hover:bg-blue-100 transition"
        >
          <Menu className="h-6 w-6 text-blue-700" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-80 p-0 bg-gradient-to-br from-slate-100 via-white to-blue-50 shadow-2xl border-0 rounded-r-3xl animate-slide-in backdrop-blur-md"
      >
        {/* Only one close button, transparent and modern */}
        <button
          aria-label="Close sidebar"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-30 flex items-center justify-center w-11 h-11 rounded-full bg-white/30 hover:bg-blue-100/70 transition shadow-lg border-0 outline-none focus:ring-2 focus:ring-blue-200 backdrop-blur-[2px]"
          style={{
            boxShadow: '0 2px 16px 0 rgba(24,44,90,0.09)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <X className="w-6 h-6 text-blue-800" />
        </button>
        <div className="flex flex-col h-full">
          {/* Company Banner */}
          <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white py-6 px-5 rounded-br-3xl shadow-xl overflow-hidden min-h-[150px]">
            <StickerBG />
            <div className="relative text-center z-10 flex flex-col items-center">
              <h1 className="text-3xl font-extrabold tracking-widest drop-shadow-xl">MH41</h1>
              <p className="text-cyan-100 font-mono animate-pulse mt-1">Service Hub</p>
              <div className="mt-4 flex flex-col gap-0.5 text-sm opacity-90">
                <span className="tracking-wide">Complete Auto Solutions</span>
                <span className="text-cyan-200 font-medium">Your Trusted Partner</span>
              </div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 bg-transparent">
            <ul className="flex flex-col gap-1">
              {navigationItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.href;
                const delay = isOpen ? `${index * 90 + 150}ms` : '0ms';
                return (
                  <li
                    key={index}
                    style={{ animationDelay: delay }}
                    className="sidebar-zoom-in group"
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-600/90 to-cyan-400/80 text-white shadow-lg'
                          : 'hover:bg-blue-50 hover:scale-[1.03] text-blue-800'
                        }
                      `}
                    >
                      <span
                        className={`
                          w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300
                          sidebar-icon-bounce
                          ${isActive
                            ? 'bg-white/20 text-white shadow-md scale-110'
                            : 'bg-cyan-100 text-blue-600 group-hover:bg-cyan-200'
                          }
                        `}
                      >
                        <IconComponent className="h-5 w-5" />
                      </span>
                      <span className={`
                        font-semibold text-base tracking-wide transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-blue-800 group-hover:text-blue-900'}
                      `}>
                        {item.label}
                      </span>
                      <span className="sidebar-bottom-line" />
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-cyan-300 rounded-r-lg animate-slide-indicator" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          {/* Contact Info */}
          <div className="px-5 pb-5 pt-3 bg-gradient-to-r from-white/80 via-blue-50/60 to-white/90 rounded-tl-3xl shadow-inner backdrop-blur-md">
            <a
              href="tel:+919370659449"
              className="flex items-center gap-3 text-blue-700 font-medium text-[15px] mb-1 hover:text-cyan-700 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Phone className="h-4 w-4 text-cyan-500" />
              <span className="tracking-wide underline underline-offset-2">+91 9370659449</span>
            </a>
            <div className="flex items-center gap-3 text-blue-700 font-medium text-[15px]">
              <MapPin className="h-4 w-4 text-cyan-500" />
              <span className="tracking-wide">Malegaon, Maharashtra</span>
            </div>
          </div>
        </div>
        <style>
          {`
            @keyframes slide-in {
              from { transform: translateX(-50px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            .animate-slide-in {
              animation: slide-in 0.5s cubic-bezier(.77,0,.175,1) both;
            }
            @keyframes sidebar-zoom-in {
              0% {
                opacity: 0;
                transform: scale(0.8) translateY(18px);
                filter: blur(4px);
              }
              75% {
                opacity: 1;
                filter: blur(0);
                transform: scale(1.08) translateY(-1px);
              }
              100% {
                opacity: 1;
                filter: blur(0);
                transform: scale(1) translateY(0);
              }
            }
            .sidebar-zoom-in {
              animation: sidebar-zoom-in 0.56s cubic-bezier(.55,1.52,.39,.91) both;
            }
            @keyframes icon-bounce-in {
              0% { transform: scale(0.7) rotate(-8deg);}
              60% { transform: scale(1.15) rotate(4deg);}
              85% { transform: scale(0.96) rotate(-2deg);}
              100% { transform: scale(1) rotate(0);}
            }
            .sidebar-icon-bounce {
              animation: icon-bounce-in 0.54s cubic-bezier(.55,1.52,.39,.91) both;
            }
            @keyframes slide-indicator {
              0% { left: -16px; opacity: 0;}
              70% { left: 0; opacity: 1;}
              100% { left: 0; opacity: 1;}
            }
            .animate-slide-indicator {
              animation: slide-indicator 0.4s cubic-bezier(.77,0,.175,1) both;
            }
            @keyframes sidebar-bottom-light {
              0% {
                width: 0;
                opacity: 0;
                left: 50%;
                background: linear-gradient(to right, #00eaff 0%, #3b82f6 100%);
                box-shadow: 0 0 0px #00eaff66;
              }
              60% {
                width: 80%;
                opacity: 1;
                left: 10%;
                box-shadow: 0 0 16px #00eaff99;
              }
              100% {
                width: 80%;
                opacity: 0.85;
                left: 10%;
                box-shadow: 0 0 4px #00eaff55;
              }
            }
            .sidebar-bottom-line {
              position: absolute;
              bottom: 7px;
              left: 50%;
              transform: translateX(-50%);
              height: 3px;
              border-radius: 6px;
              pointer-events: none;
              opacity: 0;
              width: 0;
            }
            .sidebar-zoom-in:hover .sidebar-bottom-line,
            .sidebar-zoom-in:focus .sidebar-bottom-line {
              animation: sidebar-bottom-light 0.56s cubic-bezier(.55,1.52,.39,.91) both;
            }
            /* Sticker float animations */
            @keyframes sticker-float {
              0%,100% { transform: translateY(0) rotate(-10deg);}
              50% { transform: translateY(8px) rotate(-13deg);}
            }
            .animate-sticker-float {
              animation: sticker-float 3.7s ease-in-out infinite;
            }
            @keyframes sticker-float2 {
              0%,100% { transform: translateY(0) rotate(12deg);}
              50% { transform: translateY(-8px) rotate(14deg);}
            }
            .animate-sticker-float2 {
              animation: sticker-float2 4.2s ease-in-out infinite;
            }
            @keyframes sticker-float3 {
              0%,100% { transform: translateY(0) rotate(12deg);}
              50% { transform: translateY(12px) rotate(14deg);}
            }
            .animate-sticker-float3 {
              animation: sticker-float3 4.6s ease-in-out infinite;
            }
          `}
        </style>
      </SheetContent>
    </Sheet>
  );
};