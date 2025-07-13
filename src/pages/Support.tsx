import { Phone, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { MenuBar } from '@/components/layout/MenuBar';

export const Support = () => {
  const handleCall = () => {
    window.location.href = 'tel:9370659449';
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi, I need help with MH41 Service Hub.");
    window.open(`https://wa.me/919370659449?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Center</h1>
            <p className="text-gray-600">We're here to help you 24/7</p>
          </div>

          <div className="space-y-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">Call Support</CardTitle>
                <p className="text-gray-600 text-sm">Speak directly with our support team</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleCall}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call 9370659449
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-900">WhatsApp Support</CardTitle>
                <p className="text-gray-600 text-sm">Chat with us on WhatsApp</p>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleWhatsApp}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Quick Tips</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Have your booking ID ready when calling</li>
                  <li>• WhatsApp support available 24/7</li>
                  <li>• Response time: Usually within 5 minutes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <MenuBar />
    </div>
  );
};