import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Truck, MapPin, Clock, Phone } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

export const Pickup = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    pickupTime: '',
    serviceNeeded: '',
  })

  // Get address from coordinates using OpenStreetMap Nominatim
  const getAddressFromCoords = async (lat: number, lng: number) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    const res = await fetch(url)
    const data = await res.json()
    return data.display_name || `Lat: ${lat}, Lng: ${lng}`
  }

  const handleAutoLocate = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation Not Supported", description: "Your browser does not support geolocation.", variant: "destructive" })
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setCoords({ lat, lng })
        const address = await getAddressFromCoords(lat, lng)
        setFormData((old) => ({
          ...old,
          location: address,
        }))
      },
      () => {
        toast({ title: "Location Error", description: "Unable to retrieve your location.", variant: "destructive" })
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Save to pickup_bookings
    const { error } = await supabase.from("pickup_bookings").insert({
      user_id: user?.id || null,
      name: formData.name,
      phone: formData.phone,
      location: formData.location,
      latitude: coords?.lat,
      longitude: coords?.lng,
      pickup_time: formData.pickupTime,
      service_needed: formData.serviceNeeded,
      status: 'pending',
      tag: 'pickup'
    })

    if (!error) {
      // Notify admin
      await supabase.from("notifications").insert({
        user_id: user?.id,
        title: "Pickup Booking Submitted!",
        message: `Pickup scheduled by ${formData.name} for ${formData.pickupTime} (${formData.serviceNeeded}).`
      })
      toast({
        title: "Pickup Scheduled!",
        description: "Your pickup booking has been submitted. We'll contact you soon.",
      })
      setFormData({
        name: '',
        phone: '',
        location: '',
        pickupTime: '',
        serviceNeeded: '',
      })
      setCoords(null)
    } else {
      toast({ title: "Booking Failed", description: error.message, variant: "destructive" })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-4 max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Truck className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Pickup Service</h1>
          </div>
          <p className="text-gray-600">
            We'll come to you! Schedule a pickup for your vehicle
          </p>
        </div>

        <Card className="shadow-lg border-0 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-900">
              Book Pickup Service
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((old) => ({ ...old, name: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((old) => ({ ...old, phone: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Pickup Location
                  <Button type="button" onClick={handleAutoLocate} className="ml-2" size="sm">
                    Auto Locate
                  </Button>
                </Label>
                <Textarea
                  id="location"
                  placeholder="Enter your complete address"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((old) => ({ ...old, location: e.target.value }))
                  }
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupTime" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Preferred Pickup Time
                </Label>
                <Select
                  value={formData.pickupTime}
                  onValueChange={(value) =>
                    setFormData((old) => ({ ...old, pickupTime: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pickup time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (9 AM–12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12 PM–4 PM)</SelectItem>
                    <SelectItem value="evening">Evening (4 PM–7 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceNeeded">Service Needed</Label>
                <Select
                  value={formData.serviceNeeded}
                  onValueChange={(value) =>
                    setFormData((old) => ({ ...old, serviceNeeded: value }))
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="washing">Car Washing</SelectItem>
                    <SelectItem value="garage">Garage Service</SelectItem>
                    <SelectItem value="maintenance">
                      Regular Maintenance
                    </SelectItem>
                    <SelectItem value="repair">Repair Service</SelectItem>
                    <SelectItem value="inspection">
                      Vehicle Inspection
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                disabled={loading}
              >
                {loading ? "Scheduling..." : "Schedule Pickup"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Pickup Service Info
            </h3>
            <p className="text-sm text-blue-700">
              • Free pickup within 10 km radius
              <br />• Additional charges may apply for distant locations
              <br />• We'll call to confirm booking within 30 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}