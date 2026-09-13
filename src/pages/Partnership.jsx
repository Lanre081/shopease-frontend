export default function Partnership() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Partner With ShopEase</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore e-commerce investment and partnership opportunities with a growing Nigerian brand.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Partnership Model</h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          At ShopEase Store, we operate a transparent profit-and-loss-sharing partnership model tailored for e-commerce growth. This opportunity is designed for individuals looking to invest capital while we handle the day-to-day operations.
        </p>

        <div className="grid sm:grid-cols-2 gap-8 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="font-bold text-blue-900 mb-3 text-lg">Investor Role</h3>
            <ul className="space-y-2 text-blue-800">
              <li>• Provides capital for inventory and scaling</li>
              <li>• Bears the risk of capital loss</li>
              <li>• Receives agreed percentage of net profits</li>
            </ul>
          </div>
          <div className="bg-indigo-50 p-6 rounded-xl">
            <h3 className="font-bold text-indigo-900 mb-3 text-lg">ShopEase Role</h3>
            <ul className="space-y-2 text-indigo-800">
              <li>• Handles all daily operations and fulfillment</li>
              <li>• Bears operational losses</li>
              <li>• Provides regular business reporting</li>
            </ul>
          </div>
        </div>
        
        <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-200">
          <h4 className="font-bold text-yellow-900 mb-2">Important Notice</h4>
          <p className="text-sm text-yellow-800">
            This is a real business opportunity, not a guaranteed return investment. All business ventures carry risk. ShopEase Store does not offer guaranteed ROI packages. Our model is purely based on the performance of our e-commerce operations in the Nigerian market.
          </p>
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to learn more?</h3>
        <a 
          href="mailto:contact@shopeasestore.com?subject=Partnership Information Request"
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-hover shadow-sm"
        >
          Request Partnership Information
        </a>
      </div>
    </div>
  );
}
