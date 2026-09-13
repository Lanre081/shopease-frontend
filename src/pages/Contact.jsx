import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Contact ShopEase</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We are here to help. Reach out to our customer support team for inquiries, support, and partnership requests.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Our Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Store / Office</h3>
                  <p className="mt-1 text-gray-600">
                    3 Ladejobi Street,<br />
                    Dele Kuti Estate,<br />
                    Ebute-Ipakodo, Ikorodu,<br />
                    Lagos, Nigeria.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Phone</h3>
                  <p className="mt-1 text-gray-600">0704-683-5621</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Email</h3>
                  <p className="mt-1 text-gray-600">contact@shopeasestore.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="tel:07046835621" 
              className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call Us
            </a>
            <a 
              href="https://wa.me/2347046835621?text=Hello%20ShopEase,%20I%20have%20an%20inquiry." 
              target="_blank" rel="noreferrer"
              className="flex-1 flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp Us
            </a>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea required rows="4" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"></textarea>
            </div>
            <button type="button" onClick={() => alert('Message functionality is a mockup in this demo.')} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
