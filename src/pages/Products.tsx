import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Header } from '@/components/layout/Header'
import { MenuBar } from '@/components/layout/MenuBar'
import { BookingModal } from '@/components/booking/BookingModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Package, ShoppingCart } from 'lucide-react'

export const Products: React.FC = () => {
  const [search,    setSearch]    = useState('')
  const [sort,      setSort]      = useState<'new'|'priceAsc'|'priceDesc'>('new')
  const [selected,  setSelected]  = useState<any>(null)
  const [open,      setOpen]      = useState(false)

  // Fetch products & generate signed URL for each image (1h expiry)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error

      // for each product, turn its image_url path into a signed URL
      return Promise.all(
        data.map(async p => {
          if (!p.image_url) {
            return { ...p, display_url: '/placeholder.jpg' }
          }
          // If image_url is already a full URL, don't sign
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
    }
  })

  // Filter & sort
  const filtered = useMemo(() => {
    let arr = products.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'priceAsc')  arr = [...arr].sort((a,b)=>a.price - b.price)
    if (sort === 'priceDesc') arr = [...arr].sort((a,b)=>b.price - a.price)
    return arr
  }, [products, search, sort])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
          Loading products…
        </div>
        <MenuBar />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto p-6 pb-20">
        {/* Title + Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="inline-flex items-center gap-2 text-3xl font-bold">
            <Package className="h-8 w-8 text-indigo-600" />
            Products
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Input
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select onValueChange={(v)=>setSort(v as any)}>
              <SelectTrigger className="w-40">
                {sort === 'new' ? 'Newest'
                  : sort === 'priceAsc' ? 'Price ↑'
                  : 'Price ↓'}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Newest</SelectItem>
                <SelectItem value="priceAsc">Price: Low → High</SelectItem>
                <SelectItem value="priceDesc">Price: High → Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(p => (
            <Card key={p.id} className="group overflow-hidden rounded-lg shadow hover:shadow-lg transition">
              <CardHeader className="p-0">
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={p.display_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = '/placeholder.jpg' }}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{p.name}</CardTitle>
                  <Badge className="bg-indigo-100 text-indigo-700">
                    ₹{p.price.toFixed(2)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {p.description || 'No description available.'}
                </p>
                <div className="flex items-center justify-between mb-4">
                  {/* Always show 4.5 star */}
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm">4.5</span>
                  </div>
                  <Badge variant={p.stock_quantity > 0 ? 'default' : 'destructive'}>
                    {p.stock_quantity > 0 ? 'In Stock' : 'Sold Out'}
                  </Badge>
                </div>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => { setSelected(p); setOpen(true) }}
                  disabled={p.stock_quantity === 0}
                  icon={<ShoppingCart />}
                >
                  {p.stock_quantity > 0 ? 'Quick Buy' : 'Unavailable'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <MenuBar />

      {selected && (
        <BookingModal
          isOpen={open}
          onClose={() => setOpen(false)}
          serviceType="product"
          serviceName={selected.name}
          servicePrice={selected.price}
          productId={selected.id}
        />
      )}
    </div>
  )
}