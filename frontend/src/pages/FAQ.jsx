import { Link } from 'react-router-dom'
import { useState } from 'react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      q: "How do I track my order?",
      a: "Once your order is shipped, you will receive a tracking number via email. You can also track your order by logging into your account and visiting 'My Orders' section."
    },
    {
      q: "What payment methods do you accept?",
      a: "We currently accept Cash on Delivery (COD). Credit/Debit card payments will be available soon."
    },
    {
      q: "How long does shipping take?",
      a: "Orders are delivered within 2-5 business days depending on your location. Major cities: 2-3 days, other cities: 3-5 days."
    },
    {
      q: "Can I cancel my order?",
      a: "Yes, you can cancel your order within 24 hours of placing it. Contact our support team with your order number to cancel."
    },
    {
      q: "Do you offer warranty on products?",
      a: "Yes, all electronics come with manufacturer warranty. Warranty period varies by product (typically 1 year)."
    },
    {
      q: "How do I return a product?",
      a: "You can return products within 7 days of delivery. Please visit our Returns & Refunds page for detailed instructions."
    },
    {
      q: "Is my payment information secure?",
      a: "Yes, we use industry-standard SSL encryption to protect your payment information. We do not store your credit card details."
    },
    {
      q: "Do you ship internationally?",
      a: "Currently, we only ship within Pakistan. International shipping will be available in the future."
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-blue-500">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">FAQ</span>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 animate-fade-in-up">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h1>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-5 py-4 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center"
              >
                <span className="font-semibold text-gray-800">{faq.q}</span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-5 py-4 bg-white text-gray-600 border-t border-gray-200 animate-fade-in-up">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <Link 
            to="/" 
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FAQ