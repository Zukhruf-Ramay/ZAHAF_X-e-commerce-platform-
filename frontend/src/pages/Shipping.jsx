import { Link } from 'react-router-dom'

const Shipping = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-500">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Shipping Policy</span>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Shipping Policy</h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
        
        <p className="text-gray-500 text-sm mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Processing Time</h2>
            <p>Orders are processed within 1-2 business days after payment confirmation. You will receive a confirmation email once your order is shipped.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Delivery Time</h2>
            <p>Estimated delivery times:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><strong>Major Cities (Karachi, Lahore, Islamabad):</strong> 2-3 business days</li>
              <li><strong>Other Cities:</strong> 3-5 business days</li>
              <li><strong>Remote Areas:</strong> 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Shipping Charges</h2>
            <p>Free shipping on orders above Rs. 50,000. For orders below Rs. 50,000, a flat shipping fee of Rs. 499 applies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Order Tracking</h2>
            <p>Once your order is shipped, you will receive a tracking number via email. You can track your order on our website under "My Orders" section.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. International Shipping</h2>
            <p>Currently, we only ship within Pakistan. International shipping will be available soon.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Delivery Issues</h2>
            <p>If you experience any delivery issues, please contact our support team within 7 days of the expected delivery date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Contact</h2>
            <p>For shipping inquiries: <a href="mailto:shipping@electrostore.com" className="text-blue-500 hover:underline">shipping@electrostore.com</a></p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t">
          <Link to="/" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Shipping