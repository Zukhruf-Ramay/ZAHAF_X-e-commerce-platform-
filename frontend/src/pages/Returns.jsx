import { Link } from 'react-router-dom'

const Returns = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-500">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Returns & Refunds</span>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Returns & Refunds</h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
        
        <p className="text-gray-500 text-sm mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Return Policy</h2>
            <p>We accept returns within 7 days of delivery. To be eligible for a return:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Item must be unused and in original packaging</li>
              <li>All tags and labels must be attached</li>
              <li>Proof of purchase is required</li>
              <li>Electronics must not show signs of use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Non-Returnable Items</h2>
            <p>The following items cannot be returned:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Opened or used electronics</li>
              <li>Items damaged by user</li>
              <li>Clearance or sale items</li>
              <li>Gift cards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Refund Process</h2>
            <p>Once we receive your return:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Inspection takes 2-3 business days</li>
              <li>Refunds processed within 5-7 business days</li>
              <li>Refund issued to original payment method</li>
              <li>You will receive email confirmation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Return Shipping</h2>
            <p>Customer is responsible for return shipping costs unless the item is defective or we made an error. We recommend using trackable shipping service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos of the damage. We will arrange for replacement or full refund including shipping.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Exchange Policy</h2>
            <p>We offer exchanges for same item in different size/color subject to availability. Contact support to initiate an exchange.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. How to Initiate a Return</h2>
            <p>Contact our support team at <a href="mailto:returns@electrostore.com" className="text-blue-500 hover:underline">returns@electrostore.com</a> with your order number and reason for return.</p>
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

export default Returns