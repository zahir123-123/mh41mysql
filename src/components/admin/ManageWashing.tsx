import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, X, Droplets, Clock, Image as ImageIcon } from 'lucide-react';

export const ManageWashing = () => {
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

  // Fetch washing services
  const { data: washingServices = [], isLoading } = useQuery({
    queryKey: ['admin-washing'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('washing_services')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const upsertService = useMutation({
    mutationFn: async ({
      payload,
      editingItem,
    }: {
      payload: any;
      editingItem: any;
    }) => {
      if (editingItem) {
        const { error } = await supabase
          .from('washing_services')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('washing_services')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['admin-washing']);
      toast({
        title: variables.editingItem
          ? 'Washing Service Updated'
          : 'Washing Service Created',
      });
      resetForm();
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('washing_services')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-washing']);
      toast({ title: 'Washing Service Deleted' });
    },
  });

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      image_url: '',
      features: [''],
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
      features: item.features || [''],
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration: formData.duration,
      image_url: formData.image_url,
      features: formData.features.filter(Boolean),
    };
    upsertService.mutate({ payload, editingItem: editing });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Droplets className="h-6 w-6 text-blue-600" /> Manage Washing Services
        </h2>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({
              name: '',
              description: '',
              price: '',
              duration: '',
              image_url: '',
              features: [''],
            });
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2" /> Add Service
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editing ? 'Edit Washing Service' : 'Add New Washing Service'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={e =>
                  setFormData(fd => ({ ...fd, name: e.target.value }))
                }
                required
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={e =>
                  setFormData(fd => ({
                    ...fd,
                    description: e.target.value,
                  }))
                }
                rows={2}
              />
              <Input
                placeholder="Price"
                type="number"
                value={formData.price}
                onChange={e =>
                  setFormData(fd => ({ ...fd, price: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Duration (e.g. 30 minutes)"
                value={formData.duration}
                onChange={e =>
                  setFormData(fd => ({ ...fd, duration: e.target.value }))
                }
                required
              />
              <Input
                placeholder="Image URL"
                value={formData.image_url}
                onChange={e =>
                  setFormData(fd => ({ ...fd, image_url: e.target.value }))
                }
              />
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Features
                </label>
                {formData.features.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-1">
                    <Input
                      placeholder={`Feature ${i + 1}`}
                      value={f}
                      onChange={e =>
                        setFormData(fd => {
                          const arr = [...fd.features];
                          arr[i] = e.target.value;
                          return { ...fd, features: arr };
                        })
                      }
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  onClick={() =>
                    setFormData(fd => ({
                      ...fd,
                      features: [...fd.features, ''],
                    }))
                  }
                >
                  + Add Feature
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={upsertService.isLoading}>
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
        {washingServices.map((item: any) => (
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
                  onClick={() => deleteService.mutate(item.id)}
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
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="flex items-center gap-2 mb-2">
                <Badge className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {item.duration}
                </Badge>
                <Badge variant="secondary">{item.description}</Badge>
              </div>
              {Array.isArray(item.features) && item.features.length > 0 && (
                <ul className="mb-2 list-disc pl-5 text-xs text-gray-500">
                  {item.features.map((f: string, i: number) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                  <Plus className="mr-1 transform rotate-45" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};