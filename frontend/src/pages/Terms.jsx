import { Link } from 'react-router-dom'

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-500">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Terms & Conditions</span>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Terms & Conditions</h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
        
        <p className="text-gray-500 text-sm mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using ZAHAF_X website, you accept and agree to be bound by these Terms & Conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Products & Pricing</h2>
            <p>All products displayed on ZAHAF_X are subject to availability. Prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Orders & Payments</h2>
            <p>All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason including product availability, pricing errors, or suspected fraud.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Shipping & Delivery</h2>
            <p>Delivery times are estimates only. We are not responsible for delays caused by shipping carriers or customs. Risk of loss passes to you upon delivery.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Returns & Refunds</h2>
            <p>Please refer to our Return Policy for detailed information about returns and refunds. Items must be returned within 7 days of delivery in original condition.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Account Responsibility</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Intellectual Property</h2>
            <p>All content on this website including text, graphics, logos, images is the property of ZAHAF_X and protected by copyright laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Limitation of Liability</h2>
            <p>ZAHAF_X shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@electrostore.com" className="text-blue-500 hover:underline">support@electrostore.com</a></p>
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

export default Terms