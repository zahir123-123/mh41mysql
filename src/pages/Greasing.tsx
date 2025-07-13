import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw, MapPin, Clock, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Header } from '@/components/layout/Header' // ✅ Add this line

export const Greasing = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header /> {/* ✅ Consistent header placement */}

      <div className="p-4 max-w-2xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <RotateCcw className="h-8 w-8 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">Greasing Service</h1>
          </div>
        </div>

        <Card className="shadow-lg border-0 animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-10 w-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Service Available at Garage Only
              </h2>
              <p className="text-gray-600 mb-6">
                Our professional greasing service is available at our fully equipped garage facility.
                We use high-quality lubricants and have specialized equipment for comprehensive vehicle greasing.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">What's Included:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Chassis lubrication</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Ball joint greasing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Suspension components</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Drive shaft maintenance</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link to="/garage">
                <Button className="w-full bg-gray-600 hover:bg-gray-700 py-3">
                  Visit Garage Services
                </Button>
              </Link>

              <Link to="/pickup">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-600 hover:bg-gray-50 py-3"
                >
                  Schedule Pickup Service
                </Button>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Location Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>1-2 Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Call for Quote</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
