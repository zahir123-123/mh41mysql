import { useState } from 'react';
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
import { Plus, Edit, Trash2, Save, X, Image, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = ["Available", "Booked"];
const CAR_BRANDS = [
  "Toyota", "Honda", "Hyundai", "Maruti Suzuki", "Tata", "Mahindra", "Kia", "Volkswagen",
  "Ford", "Renault", "Nissan", "Skoda", "Mercedes-Benz", "BMW", "Audi", "MG", "Chevrolet", "Fiat", "Jeep", "Lexus", "Jaguar"
];
const CONDITION_OPTIONS = ["Good", "Showroom Like", "Awesome"];
const FUEL_OPTIONS = ["Petrol", "Diesel", "Gas"];
const TRANSMISSION_OPTIONS = ["Manual", "Automatic"];
const AC_OPTIONS = ["Available", "Not Available"];

// Prefilled driver details
const DEFAULT_DRIVER = {
  name: 'Default Driver',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  rating: '4.9',
  experience: '5 years',
  licence_expiry: '2030-12-31',
  bio: 'Experienced professional driver with a clean record.',
  verified: true,
  age: '35'
};

export const ManageCars = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [showDriverForm, setShowDriverForm] = useState(false); // Now hidden by default
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    year: '',
    price_per_day: '',
    capacity: '',
    fuel_type: FUEL_OPTIONS[0],
    transmission: TRANSMISSION_OPTIONS[0],
    location: '',
    number: '',
    condition: CONDITION_OPTIONS[0],
    tank_capacity: '',
    ac: AC_OPTIONS[0],
    type: CAR_BRANDS[0],
    image_url: '',
    gallery_images: [''],
    status: STATUS_OPTIONS[0],
    driver: { ...DEFAULT_DRIVER }
  });

  // Query all cars (no filter)
  const { data: cars, isLoading } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('id, name, model, year, price_per_day, capacity, fuel_type, transmission, image_url, status, is_available')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    }
  });

  // Create car (with error handling)
  const createCar = useMutation({
    mutationFn: async (c: any) => {
      const gallery_images = Array.isArray(c.gallery_images)
        ? c.gallery_images.filter((url) => Boolean(url && url.trim()))
        : [];
      // Only include driver if user has opened and filled the form
      const driver = showDriverForm && c.driver && c.driver.name.trim()
        ? c.driver
        : null;
      const { error } = await supabase.from('cars').insert([
        {
          ...c,
          year: parseInt(c.year, 10),
          price_per_day: parseFloat(c.price_per_day),
          capacity: parseInt(c.capacity, 10),
          gallery_images,
          driver,
          status: c.status,
          is_available: c.status === "Available"
        }
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cars']);
      queryClient.invalidateQueries(['dashboard-available-cars']);
      toast({ title: 'Car Added' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error Saving Car',
        description: error.message || 'Could not save car',
        variant: "destructive"
      });
    }
  });

  // Update car (status and is_available can be toggled from card)
  const updateCar = useMutation({
    mutationFn: async ({ id, data }: any) => {
      const gallery_images = Array.isArray(data.gallery_images)
        ? data.gallery_images.filter((url) => Boolean(url && url.trim()))
        : [];
      const driver = showDriverForm && data.driver && data.driver.name.trim()
        ? data.driver
        : null;
      const { error } = await supabase.from('cars').update({
        ...data,
        year: parseInt(data.year, 10),
        price_per_day: parseFloat(data.price_per_day),
        capacity: parseInt(data.capacity, 10),
        gallery_images,
        driver,
        status: data.status,
        is_available: data.status === "Available"
      }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cars']);
      queryClient.invalidateQueries(['dashboard-available-cars']);
      toast({ title: 'Car Updated' });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error Updating Car',
        description: error.message || 'Could not update car',
        variant: "destructive"
      });
    }
  });

  // Update car status only (quick inline edit)
  const updateCarStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('cars')
      .update({ status, is_available: status === 'Available' })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error Updating Status', description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries(['admin-cars']);
    queryClient.invalidateQueries(['dashboard-available-cars']);
    toast({ title: `Car marked as ${status}` });
  };

  const deleteCar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-cars']);
      queryClient.invalidateQueries(['dashboard-available-cars']);
      toast({ title: 'Car Deleted' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deleting Car',
        description: error.message || 'Could not delete car',
        variant: "destructive"
      });
    }
  });

  function resetForm() {
    setFormData({
      name: '',
      model: '',
      year: '',
      price_per_day: '',
      capacity: '',
      fuel_type: FUEL_OPTIONS[0],
      transmission: TRANSMISSION_OPTIONS[0],
      location: '',
      number: '',
      condition: CONDITION_OPTIONS[0],
      tank_capacity: '',
      ac: AC_OPTIONS[0],
      type: CAR_BRANDS[0],
      image_url: '',
      gallery_images: [''],
      status: STATUS_OPTIONS[0],
      driver: { ...DEFAULT_DRIVER }
    });
    setEditingCar(null);
    setShowForm(false);
    setShowDriverForm(false);
  }

  function onEdit(car: any) {
    setEditingCar(car);
    setFormData({
      name: car.name || '',
      model: car.model || '',
      year: String(car.year || ''),
      price_per_day: String(car.price_per_day || ''),
      capacity: String(car.capacity || ''),
      fuel_type: car.fuel_type || FUEL_OPTIONS[0],
      transmission: car.transmission || TRANSMISSION_OPTIONS[0],
      location: car.location || '',
      number: car.number || '',
      condition: car.condition || CONDITION_OPTIONS[0],
      tank_capacity: car.tank_capacity || '',
      ac: car.ac || AC_OPTIONS[0],
      type: car.type || CAR_BRANDS[0],
      image_url: car.image_url || '',
      gallery_images: Array.isArray(car.gallery_images) && car.gallery_images.length
        ? car.gallery_images
        : [''],
      status: car.status || STATUS_OPTIONS[0],
      driver:
        car.driver && typeof car.driver === 'object'
          ? car.driver
          : { ...DEFAULT_DRIVER }
    });
    setShowForm(true);
    setShowDriverForm(!!(car.driver && typeof car.driver === 'object'));
  }

  function handleGalleryImageUrlChange(idx: number, value: string) {
    setFormData(prev => {
      const arr = [...prev.gallery_images];
      arr[idx] = value;
      return { ...prev, gallery_images: arr };
    });
  }

  function handleAddGalleryUrl() {
    setFormData(prev => ({
      ...prev,
      gallery_images: [...(prev.gallery_images || []), '']
    }));
  }

  function handleRemoveGalleryUrl(idx: number) {
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== idx)
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...formData };
    if (editingCar) updateCar.mutate({ id: editingCar.id, data: payload });
    else createCar.mutate(payload);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Cars</h2>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2" /> {editingCar ? 'Edit Car' : 'Add Car'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-blue-500 mr-2" />
          <span className="text-blue-600 font-medium">Loading cars…</span>
        </div>
      ) : null}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCar ? 'Edit Car' : 'Add New Car'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Car Name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Company"
                  value={formData.model}
                  onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  required
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="Year"
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Price / day"
                  type="number"
                  step="0.01"
                  value={formData.price_per_day}
                  onChange={e => setFormData(prev => ({ ...prev, price_per_day: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Capacity (Seats)"
                  type="number"
                  value={formData.capacity}
                  onChange={e => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Status</label>
                <select
                  className="w-full border rounded px-2 py-2"
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Location"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
              <Input
                placeholder="Main Number (e.g. MH12-AB1234)"
                value={formData.number}
                onChange={e => setFormData(prev => ({ ...prev, number: e.target.value }))}
              />
              <div className="grid md:grid-cols-4 gap-4">
                <select
                  className="w-full border rounded px-2 py-2"
                  value={formData.type}
                  onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  {CAR_BRANDS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <select
                  className="w-full border rounded px-2 py-2"
                  value={formData.fuel_type}
                  onChange={e => setFormData(prev => ({ ...prev, fuel_type: e.target.value }))}
                >
                  {FUEL_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <select
                  className="w-full border rounded px-2 py-2"
                  value={formData.transmission}
                  onChange={e => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                >
                  {TRANSMISSION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <select
                  className="w-full border rounded px-2 py-2"
                  value={formData.ac}
                  onChange={e => setFormData(prev => ({ ...prev, ac: e.target.value }))}
                >
                  {AC_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <select
                  className="w-full border rounded px-2 py-2"
                  value={formData.condition}
                  onChange={e => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                >
                  {CONDITION_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <Input
                  placeholder="Tank Capacity (L)"
                  value={formData.tank_capacity}
                  onChange={e => setFormData(prev => ({ ...prev, tank_capacity: e.target.value }))}
                />
                <Input
                  placeholder="Cover Image URL (Main)"
                  value={formData.image_url}
                  onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                />
              </div>
              {/* Gallery images by URL */}
              <div>
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <Image className="w-4 h-4"/>
                  Sub Images URLs
                </div>
                {(formData.gallery_images || []).map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <Input
                      placeholder={`Sub Image URL #${idx + 1}`}
                      value={url}
                      onChange={e => handleGalleryImageUrlChange(idx, e.target.value)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      type="button"
                      onClick={() => handleRemoveGalleryUrl(idx)}
                      tabIndex={-1}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" type="button" onClick={handleAddGalleryUrl}>
                  + Add Image URL
                </Button>
              </div>
              {/* Driver Info Add/Edit */}
              <div className="mt-6">
                {!showDriverForm ? (
                  <Button onClick={() => setShowDriverForm(true)} size="sm" variant="outline" type="button">
                    {formData.driver.name ? "Edit Driver Info" : "+ Add Driver Info"}
                  </Button>
                ) : (
                  <div className="border rounded p-3 bg-blue-50/50 mb-2">
                    <div className="grid md:grid-cols-3 gap-4">
                      <Input
                        placeholder="Driver Name"
                        value={formData.driver.name}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            driver: { ...prev.driver, name: e.target.value }
                          }))
                        }
                      />
                      <Input
                        placeholder="Driver Photo URL"
                        value={formData.driver.avatar}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            driver: { ...prev.driver, avatar: e.target.value }
                          }))
                        }
                      />
                      <Input
                        placeholder="Driver Rating"
                        type="number"
                        step="0.1"
                        value={formData.driver.rating}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            driver: { ...prev.driver, rating: e.target.value }
                          }))
                        }
                      />
                      <Input
                        placeholder="Experience (years)"
                        value={formData.driver.experience}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            driver: { ...prev.driver, experience: e.target.value }
                          }))
                        }
                      />
                      <Input
                        placeholder="License Expiry"
                        value={formData.driver.licence_expiry}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            driver: { ...prev.driver, licence_expiry: e.target.value }
                          }))
                        }
                      />
                      <Input
                        placeholder="Driver Age"
                        type="number"
                        value={formData.driver.age}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            driver: { ...prev.driver, age: e.target.value }
                          }))
                        }
                      />
                      <Textarea
                        placeholder="Driver Bio"
                        rows={2}
                        value={formData.driver.bio}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            driver: { ...prev.driver, bio: e.target.value }
                          }))
                        }
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!formData.driver.verified}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              driver: { ...prev.driver, verified: e.target.checked }
                            }))
                          }
                        />
                        Verified
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" type="button" onClick={() => setShowDriverForm(false)}>
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit" disabled={createCar.isLoading || updateCar.isLoading}>
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
        {cars?.map(car => (
          <Card key={car.id} className="hover:shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{car.name}</CardTitle>
                  <p className="text-sm text-gray-600">{car.model} • {car.year}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`rounded px-3 py-1 font-semibold text-xs shadow 
                    ${car.is_available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {car.is_available ? 'Available' : 'Booked'}
                  </span>
                  <select
                    className="mt-1 border rounded px-2 py-1 text-xs"
                    value={car.status}
                    onChange={e => updateCarStatus(car.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {car.image_url && (
                <img src={car.image_url} className="w-full h-32 object-cover rounded mb-2" />
              )}
              <div className="text-lg font-bold">₹{car.price_per_day}/day</div>
              <div className="text-sm text-gray-600">
                {car.capacity} seats • {car.fuel_type} • {car.transmission}
              </div>
              <div className="flex gap-2 justify-end mt-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(car)}>
                  <Edit className="mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-600"
                  onClick={() => deleteCar.mutate(car.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!cars?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <h3>No cars yet</h3>
            <p>Add your first car to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};