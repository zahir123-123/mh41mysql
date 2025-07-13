import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, X, Edit } from 'lucide-react';

export const ManageFoglights = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    image_url: '',
    features: ['']
  });

  // fetch foglight services
  const { data: foglights = [], isLoading } = useQuery({
    queryKey: ['admin-foglights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('foglights')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const upsertFoglight = useMutation({
    mutationFn: async (payload: any) => {
      if (payload.id) {
        // update
        const { error } = await supabase.from('foglights').update(payload).eq('id', payload.id);
        if (error) throw error;
      } else {
        // insert (omit id)
        const { id, ...insertPayload } = payload;
        const { error } = await supabase.from('foglights').insert([insertPayload]);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['admin-foglights']);
      toast({ title: variables.id ? 'Foglight Updated' : 'Foglight Created' });
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  });

  const deleteFoglight = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('foglights').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-foglights']);
      toast({ title: 'Foglight Deleted' });
    }
  });

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      image_url: '',
      features: ['']
    });
    setEditing(null);
    setShowForm(false);
  }

  function onEdit(item: any) {
    setEditing(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      duration: item.duration || '',
      image_url: item.image_url || '',
      features: Array.isArray(item.features) && item.features.length ? item.features : ['']
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...editing && { id: editing.id }, // include id if editing
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: formData.duration,
      image_url: formData.image_url,
      features: formData.features.filter(f => f && f.trim() !== '')
    };
    upsertFoglight.mutate(payload);
  }

  // Feature input handlers
  const handleFeatureChange = (i: number, value: string) => {
    setFormData(fd => {
      const arr = [...fd.features];
      arr[i] = value;
      return { ...fd, features: arr };
    });
  };
  const handleAddFeature = () => {
    setFormData(fd => ({ ...fd, features: [...fd.features, ''] }));
  };
  const handleRemoveFeature = (i: number) => {
    setFormData(fd => {
      const arr = [...fd.features];
      arr.splice(i, 1);
      return { ...fd, features: arr.length ? arr : [''] };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Foglights</h2>
        <Button
          onClick={() => { setShowForm(true); setEditing(null); setFormData({ name: '', description: '', price: '', duration: '', image_url: '', features: [''] }); }}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          <Plus className="mr-2" /> Add Foglight
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Foglight' : 'Add New Foglight'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={e => setFormData(fd => ({ ...fd, name: e.target.value }))}
                required
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={e => setFormData(fd => ({ ...fd, description: e.target.value }))}
                rows={2}
              />
              <Input
                placeholder="Price"
                type="number"
                value={formData.price}
                onChange={e => setFormData(fd => ({ ...fd, price: e.target.value }))}
                required
              />
              <Input
                placeholder="Duration (e.g. 2 hours)"
                value={formData.duration}
                onChange={e => setFormData(fd => ({ ...fd, duration: e.target.value }))}
              />
              <Input
                placeholder="Image URL"
                value={formData.image_url}
                onChange={e => setFormData(fd => ({ ...fd, image_url: e.target.value }))}
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Features</label>
                {formData.features.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-1">
                    <Input
                      placeholder={`Feature ${i + 1}`}
                      value={f}
                      onChange={e => handleFeatureChange(i, e.target.value)}
                    />
                    {formData.features.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="text-red-500"
                        onClick={() => handleRemoveFeature(i)}
                      >
                        &times;
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleAddFeature}
                  className="mt-1"
                >
                  + Add Feature
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={upsertFoglight.isLoading}>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {foglights.map((item: any) => (
          <Card key={item.id} className="hover:shadow-lg">
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>{item.name}</CardTitle>
                  <p className="text-sm text-gray-600">₹{item.price}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600"
                  onClick={() => deleteFoglight.mutate(item.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {item.image_url && (
                <img
                  src={item.image_url}
                  className="w-full h-48 object-cover rounded mb-2"
                  alt={item.name}
                />
              )}
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              {Array.isArray(item.features) && item.features.length > 0 && (
                <ul className="mb-2 list-disc pl-5 text-xs text-gray-500">
                  {item.features.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                  <Edit className="mr-1" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};