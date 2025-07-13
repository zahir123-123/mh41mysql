import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, X } from 'lucide-react';

export const ManageProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: '',
    gallery_images: [''],
  });

  // fetch all products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Manage signed URLs for product images
  const [adminImageUrls, setAdminImageUrls] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    if (!products || products.length === 0) return;
    let isMounted = true;
    (async () => {
      const urls: { [id: string]: string } = {};
      await Promise.all(
        products.map(async (prod: any) => {
          try {
            if (!prod.image_url) {
              urls[prod.id] = '/placeholder.jpg';
            } else if (prod.image_url.startsWith('http')) {
              urls[prod.id] = prod.image_url;
            } else {
              const { data: signed } = await supabase
                .storage
                .from('cars')
                .createSignedUrl(prod.image_url, 60 * 60);
              urls[prod.id] = signed?.signedUrl || '/placeholder.jpg';
            }
          } catch {
            urls[prod.id] = '/placeholder.jpg';
          }
        })
      );
      if (isMounted) setAdminImageUrls(urls);
    })();
    return () => { isMounted = false };
  }, [products]);

  // upsert mutations
  const upsertProduct = useMutation({
    mutationFn: (payload: any) => {
      const query = editingProduct
        ? supabase.from('products').update(payload).eq('id', editingProduct.id)
        : supabase.from('products').insert([payload]);
      return query;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast({ title: editingProduct ? 'Product Updated' : 'Product Created' });
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => supabase.from('products').delete().eq('id', id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast({ title: 'Product Deleted' });
    }
  });

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      image_url: '',
      gallery_images: [''],
    });
    setEditingProduct(null);
    setShowForm(false);
  }

  function onEdit(product: any) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      image_url: product.image_url || '',
      gallery_images: product.gallery_images || [''],
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity, 10),
      image_url: formData.image_url || null,
      gallery_images: formData.gallery_images.filter(Boolean),
    };
    upsertProduct.mutate(payload);
  }

  if (isLoading) return <p className="text-center py-12">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Products</h2>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2" /> {editingProduct ? 'Edit Product' : 'Add Product'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={e => setFormData(fd => ({ ...fd, name: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData(fd => ({ ...fd, price: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Stock Quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={e => setFormData(fd => ({ ...fd, stock_quantity: e.target.value }))}
                  required
                />
              </div>
              <Textarea
                placeholder="Description"
                rows={3}
                value={formData.description}
                onChange={e => setFormData(fd => ({ ...fd, description: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    className="w-full h-48 object-cover rounded mb-2"
                    alt="Cover"
                    onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                  />
                )}
                <Input
                  placeholder="Paste image URL here"
                  value={formData.image_url}
                  onChange={e => setFormData(fd => ({ ...fd, image_url: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images (URLs)</label>
                {formData.gallery_images.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    {url && (
                      <img
                        src={url}
                        className="w-16 h-16 object-cover rounded"
                        alt="Gallery"
                        onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                      />
                    )}
                    <Input
                      placeholder="Paste gallery image URL"
                      value={url}
                      onChange={e => setFormData(fd => {
                        const arr = [...fd.gallery_images];
                        arr[i] = e.target.value;
                        return { ...fd, gallery_images: arr };
                      })}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setFormData(fd => ({ ...fd, gallery_images: [...fd.gallery_images, ''] }))
                  }
                >
                  + Add Gallery Image
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={upsertProduct.isLoading}>
                  <Save className="mr-2" /> Save
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="mr-2" /> Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List of Products */}
      {products.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="text-center py-12">
            <h3>No products yet</h3>
            <p>Add your first product to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(prod => (
            <Card key={prod.id} className="hover:shadow-lg">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{prod.name}</CardTitle>
                    <p className="text-sm text-gray-600">₹{prod.price}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600"
                    onClick={() => deleteProduct.mutate(prod.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <img
                  src={adminImageUrls[prod.id] || '/placeholder.jpg'}
                  className="w-full h-48 object-cover rounded mb-2"
                  alt={prod.name}
                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                />
                <p className="text-sm text-gray-600 mb-2">{prod.description}</p>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => onEdit(prod)}>
                    <Plus className="mr-1 transform rotate-45" /> Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};