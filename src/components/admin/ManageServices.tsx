import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, X, Edit } from 'lucide-react';

export const ManageServices = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '', // <-- Added duration field here
    features: [''],
    image_url: ''
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('type', 'garage')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const { error } = await supabase
        .from('services')
        .insert([{
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration: serviceData.duration, // <-- Save duration in db
          type: 'garage',
          features: serviceData.features.filter(f => f.trim() !== ''),
          image_url: serviceData.image_url
        }]);
      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setShowAddForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', price: '', duration: '', features: [''], image_url: '' });
      toast({ title: "Service Created", description: "New service has been added successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create service", variant: "destructive" });
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const { error } = await supabase
        .from('services')
        .update({
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          duration: serviceData.duration, // <-- Save duration in db
          features: serviceData.features.filter(f => f.trim() !== ''),
          image_url: serviceData.image_url
        })
        .eq('id', serviceData.id);
      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setEditingId(null);
      setShowAddForm(false);
      setFormData({ name: '', description: '', price: '', duration: '', features: [''], image_url: '' });
      toast({ title: "Service Updated", description: "Service has been updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update service", variant: "destructive" });
    }
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast({ title: "Service Deleted", description: "Service has been deleted successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
    }
  });

  // Feature input handlers
  const handleFeatureChange = (index: number, value: string) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData({ ...formData, features: updated });
  };

  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const handleRemoveFeature = (index: number) => {
    const updated = [...formData.features];
    updated.splice(index, 1);
    setFormData({ ...formData, features: updated.length ? updated : [''] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateServiceMutation.mutate({
        ...formData,
        id: editingId,
        price: parseFloat(formData.price)
      });
    } else {
      createServiceMutation.mutate({
        ...formData,
        price: parseFloat(formData.price)
      });
    }
  };

  const startEditing = (service:any) => {
    setEditingId(service.id);
    setShowAddForm(true);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: service.price ? String(service.price) : '',
      duration: service.duration || '', // <-- set duration here
      features: Array.isArray(service.features) && service.features.length ? service.features : [''],
      image_url: service.image_url || '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Garage Services</h2>
        <Button onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ name: '', description: '', price: '', duration: '', features: [''], image_url: '' })}} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {(showAddForm || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Service" : "Add New Garage Service"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Service Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  required
                />
                <Input
                  placeholder="Time Required (e.g. 30 mins, 1 hour)"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  required
                />
              </div>
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <Input
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
              />
              {/* Features Dynamic List */}
              <div>
                <label className="block font-medium mb-1">Features</label>
                <div className="space-y-2">
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder={`Feature ${idx + 1}`}
                        value={feature}
                        onChange={e => handleFeatureChange(idx, e.target.value)}
                        required
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-red-500"
                          aria-label="Remove feature"
                        >
                          &times;
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddFeature}
                    className="mt-2"
                  >
                    + Add Feature
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? "Save Changes" : "Save Service"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); setFormData({ name: '', description: '', price: '', duration: '', features: [''], image_url: '' }) }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service: any) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    {service.duration ? `Time Required: ${service.duration}` : "No time specified"}
                  </div>
                </div>
                <Badge variant={service.is_active ? "default" : "secondary"}>
                  {service.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {service.image_url && (
                <img 
                  src={service.image_url} 
                  alt={service.name}
                  className="w-full h-32 object-cover rounded"
                />
              )}
              <div className="text-xl font-bold text-green-600">
                ₹{service.price}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => startEditing(service)}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  disabled={!!editingId}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => deleteServiceMutation.mutate(service.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  disabled={deleteServiceMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!services?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600">Add your first service to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};