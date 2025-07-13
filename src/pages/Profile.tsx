import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, MapPin, Phone, Mail, Edit, Plus, Home, Building, Save, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { MenuBar } from '@/components/layout/MenuBar';

export const Profile = () => {
  const { user, profile, isAdmin, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const savedAddressCardRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: user?.email || ''
  });

  // Load addresses from database (demo: if you have a fetch, replace this with query)
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      address: 'Malegaon, Maharashtra 423203',
      icon: Home
    },
    {
      id: 2,
      type: 'Office',
      address: 'Nashik Road, Nashik 422101',
      icon: Building
    }
  ]);
  const [editAddressId, setEditAddressId] = useState<number | null>(null);
  const [editAddressData, setEditAddressData] = useState({ type: '', address: '' });

  const [newAddress, setNewAddress] = useState({
    type: '',
    address: ''
  });

  // Shine effect handler
  const handleManageAddressShine = () => {
    if (savedAddressCardRef.current) {
      savedAddressCardRef.current.classList.add('shine');
      setTimeout(() => {
        savedAddressCardRef.current?.classList.remove('shine');
      }, 1200);
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    const { error } = await updateProfile({
      full_name: editData.full_name,
      phone: editData.phone,
      updated_at: new Date().toISOString()
    });
    if (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  // Add address (to supabase if table exists)
  const handleAddAddress = async () => {
    if (newAddress.type && newAddress.address) {
      // Optional: Insert into database
      let dbId = addresses.length + 1;
      if (user?.id) {
        const { data, error } = await supabase
          .from('addresses')
          .insert([{ user_id: user.id, type: newAddress.type, address: newAddress.address }])
          .select('id');
        if (!error && data && data.length) dbId = data[0].id;
      }
      const newAddr = {
        id: dbId,
        type: newAddress.type,
        address: newAddress.address,
        icon: newAddress.type.toLowerCase() === 'home' ? Home : Building
      };
      setAddresses([...addresses, newAddr]);
      setNewAddress({ type: '', address: '' });
      toast({
        title: "Address Added",
        description: "New address has been added successfully.",
      });
    }
  };

  // Edit address (open dialog)
  const openEditAddress = (address: any) => {
    setEditAddressId(address.id);
    setEditAddressData({ type: address.type, address: address.address });
  };

  // Save edited address (and in supabase)
  const handleSaveAddressEdit = async () => {
    setAddresses(addr =>
      addr.map(a =>
        a.id === editAddressId
          ? {
              ...a,
              type: editAddressData.type,
              address: editAddressData.address,
              icon: editAddressData.type.toLowerCase() === 'home' ? Home : Building
            }
          : a
      )
    );
    if (editAddressId && user?.id) {
      await supabase
        .from('addresses')
        .update({
          type: editAddressData.type,
          address: editAddressData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', editAddressId)
        .eq('user_id', user.id);
    }
    setEditAddressId(null);
    toast({
      title: "Address Updated",
      description: "Address updated successfully.",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Header />
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 md:p-6 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">My Profile</h1>
            <p className="text-sm text-blue-100">Manage your account settings</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-3 md:p-4 space-y-4 md:space-y-6 -mt-2 md:-mt-4 flex-1">
        {/* Profile Info Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardContent className="p-4 md:p-8">
            <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
              <div className="relative">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-blue-200">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg md:text-xl">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  {profile?.full_name || 'User'}
                </h2>
                <p className="text-sm md:text-base text-gray-600 truncate">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-2 md:px-3 py-1 rounded-full mt-2 font-medium">
                    ✨ Admin Account
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="border-blue-200 hover:bg-blue-50 flex-shrink-0"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              </Button>
            </div>

            {!isEditing ? (
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {profile?.phone || '+91 98765 43210'}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium truncate">{user?.email}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editData.full_name}
                    onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email (Read Only)</Label>
                  <Input
                    id="email"
                    value={editData.email}
                    disabled
                    className="bg-gray-100 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancelEdit} variant="outline" className="flex-1 text-sm">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Addresses - Premium Design */}
        <Card ref={savedAddressCardRef} className="shadow-xl border-0 bg-white/95 backdrop-blur transition-[box-shadow] duration-700">
          <CardHeader className="pb-3 md:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                Saved Addresses
              </CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-50 text-xs md:text-sm">
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4">
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address_type">Address Type</Label>
                      <Input
                        id="address_type"
                        value={newAddress.type}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value }))}
                        placeholder="e.g., Home, Office, Other"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_text">Address</Label>
                      <Input
                        id="address_text"
                        value={newAddress.address}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter full address"
                      />
                    </div>
                    <Button onClick={handleAddAddress} className="w-full bg-blue-600 hover:bg-blue-700">
                      Add Address
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {addresses.map((address) => {
              const IconComponent = address.icon;
              return (
                <div key={address.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-blue-100">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm md:text-base">{address.type}</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{address.address}</p>
                  </div>
                  <Dialog open={editAddressId === address.id} onOpenChange={v => { if (!v) setEditAddressId(null); }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100 flex-shrink-0" onClick={() => openEditAddress(address)}>
                        <Edit className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_address_type">Address Type</Label>
                          <Input
                            id="edit_address_type"
                            value={editAddressData.type}
                            onChange={e => setEditAddressData(prev => ({ ...prev, type: e.target.value }))}
                            placeholder="Type"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_address_text">Address</Label>
                          <Input
                            id="edit_address_text"
                            value={editAddressData.address}
                            onChange={e => setEditAddressData(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Address"
                          />
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleSaveAddressEdit}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Address
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions - Premium Design */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-blue-50 border-blue-200 text-sm"
              onClick={handleManageAddressShine}
            >
              <MapPin className="h-4 w-4 mr-3 text-blue-600" />
              Manage Addresses
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-green-50 border-green-200 text-sm"
              onClick={() => navigate('/support')}
            >
              <Phone className="h-4 w-4 mr-3 text-green-600" />
              Contact Support
            </Button>
            {isAdmin && (
              <Link to="/admin" className="w-full">
                <Button variant="outline" className="w-full justify-start hover:bg-purple-50 border-purple-200 text-sm">
                  <Building className="h-4 w-4 mr-3 text-purple-600" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
      <MenuBar />
      {/* Shine effect CSS */}
      <style>{`
        .shine {
          box-shadow: 0 0 0 4px #60a5fa, 0 0 16px 8px #bae6fd, 0 0 32px 16px #2563eb60 !important;
          transition: box-shadow 0.7s;
        }
      `}</style>
    </div>
  );
};