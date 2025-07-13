import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Package, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { BookingModal } from '@/components/booking/BookingModal'

export const NewProductsSlider: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = React.useState<any>(null);
  const [open, setOpen] = React.useState(false);
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['dashboard-new-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, stock_quantity, image_url, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10)
      if (error) throw error

      return Promise.all(
        (data || []).map(async p => {
          if (!p.image_url) {
            return { ...p, display_url: '/placeholder.jpg' }
          }
          if (p.image_url.startsWith('http')) {
            return { ...p, display_url: p.image_url }
          }
          const { data: signed, error: e2 } = await supabase
            .storage
            .from('cars')
            .createSignedUrl(p.image_url, 60 * 60)
          if (e2 || !signed?.signedUrl) {
            return { ...p, display_url: '/placeholder.jpg' }
          }
          return { ...p, display_url: signed.signedUrl }
        })
      )
    },
    staleTime: 1000 * 60 * 5,
  })

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">New Products</h2>
        </div>
        <Link to="/products" className="text-blue-600 text-sm font-medium hover:text-blue-700">See All</Link>
      </div>
      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="min-w-[180px] border-0 shadow-md animate-pulse bg-gray-100 h-56" />
            ))
          : products.length === 0
          ? (
            <div className="py-8 px-4 text-gray-500 text-center w-full">No new products right now.</div>
          ) : (
            products.map((product: any) => (
              <Card key={product.id} className="min-w-[180px] max-w-[180px] border-0 shadow-md hover:shadow-lg transition-all duration-300 flex-shrink-0 bg-white">
                <div className="relative">
                  <img
                    src={product.display_url}
                    alt={product.name}
                    className="w-full h-28 object-cover rounded-t-lg"
                    loading="lazy"
                    onError={e => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg'
                    }}
                  />
                  <Badge
                    className={`absolute top-2 right-2 ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'} text-white`}
                  >
                    {product.stock_quantity > 0 ? 'In Stock' : 'Sold Out'}
                  </Badge>
                </div>
                <CardContent className="p-3 flex flex-col gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2 whitespace-nowrap overflow-hidden text-ellipsis">{product.description || 'No description'}</p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs">4.5</span>
                    </div>
                    <div className="text-blue-600 font-bold text-sm">
                      ₹{product.price?.toFixed(2)}
                    </div>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow font-semibold text-sm py-2"
                    disabled={product.stock_quantity === 0}
                    onClick={() => { setSelected(product); setOpen(true); }}
                  >
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    {product.stock_quantity > 0 ? 'Quick Buy' : 'Unavailable'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )
        }
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition">
          <img src="/assets/car-wash.png" alt="Car Wash" className="h-16 mb-3" />
          <div className="font-bold text-blue-700 text-lg mb-1">Special Offers</div>
          <div className="text-gray-600 text-sm">Check out our latest discounts and deals on car services and products!</div>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition">
          <img src="/assets/garagebanner.jpg" alt="Garage" className="h-16 mb-3 rounded" />
          <div className="font-bold text-indigo-700 text-lg mb-1">Why Choose Us?</div>
          <div className="text-gray-600 text-sm">Trusted by 5,000+ customers. 24/7 support. Premium quality guaranteed.</div>
        </div>
        <div className="rounded-2xl bg-white shadow-lg p-6 flex flex-col items-center text-center hover:shadow-xl transition">
          <img src="/assets/car-banner.jpg" alt="Banner" className="h-16 mb-3 rounded" />
          <div className="font-bold text-pink-700 text-lg mb-1">New Arrivals</div>
          <div className="text-gray-600 text-sm">Explore the latest products and services added to our platform.</div>
        </div>
      </div>
      <BookingModal
        isOpen={open}
        onClose={() => setOpen(false)}
        serviceType="product"
        serviceName={selected?.name || ''}
        servicePrice={selected?.price || 0}
        productId={selected?.id}
      />
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </div>
  );
};