import { useState } from 'react';
import { api } from '../services/api';

export default function Reseller() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
    location: '',
    businessName: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.submitResellerApplication(formData);
      setSuccess(true);
      setFormData({
        fullName: '', email: '', phone: '', whatsapp: '', location: '', businessName: '', experience: ''
      });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Become a ShopEase Reseller</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Join our growing network of successful resellers across Nigeria. Partner with us to deliver quality products to your customers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Partner With Us?</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-green-500 mr-3">✓</span>
              <p className="text-gray-700"><strong>Promotional Materials:</strong> Get access to high-quality product images and marketing resources.</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-green-500 mr-3">✓</span>
              <p className="text-gray-700"><strong>Sales Strategies:</strong> Learn from our proven e-commerce experience.</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-green-500 mr-3">✓</span>
              <p className="text-gray-700"><strong>Discounts on Purchases:</strong> Enjoy exclusive reseller pricing to maximize your margins.</p>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-green-500 mr-3">✓</span>
              <p className="text-gray-700"><strong>Dedicated Support:</strong> Step-by-step guidance to help you grow your business.</p>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Apply Now</h3>
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
              Application submitted successfully! Our team will contact you shortly.
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (State/City) *</label>
                <input type="text" name="location" required value={formData.location} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name (if any)</label>
              <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-commerce Experience</label>
              <textarea name="experience" rows="3" value={formData.experience} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover disabled:opacity-70 transition-colors">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
