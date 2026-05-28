import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-4">ZAHAF-X</h3>
            <p className="text-gray-400 text-sm">
              Your one-stop shop for the latest electronics at the best prices.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Facebook">
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="Twitter">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors" aria-label="Instagram">
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-home mr-2"></i> Home</Link></li>
              <li><Link to="/products" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-shopping-bag mr-2"></i> Products</Link></li>
              <li><Link to="/cart" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-shopping-cart mr-2"></i> Cart</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-question-circle mr-2"></i> Help & Support</Link></li>
              <li><Link to="/returns" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-undo-alt mr-2"></i> Returns</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Policies</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/terms" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-file-contract mr-2"></i> Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-lock mr-2"></i> Privacy Policy</Link></li>
              <li><Link to="/shipping" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-truck mr-2"></i> Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-exchange-alt mr-2"></i> Returns & Refunds</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition-colors inline-block"><i className="fas fa-question-circle mr-2"></i> FAQ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-3">
                <i className="fas fa-envelope text-blue-400 w-4"></i>
                <a href="mailto:support@zahafx.com" className="hover:text-blue-400 transition-colors">
                  support@zahafx.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-phone-alt text-blue-400 w-4"></i>
                <a href="tel:+921234567890" className="hover:text-blue-400 transition-colors">
                  +92 123 4567890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <i className="fas fa-map-marker-alt text-blue-400 w-4 mt-0.5"></i>
                <span>Punjab, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ZAHAF-X. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Made for Electronics Lovers
             {/* with <i className="fas fa-heart text-red-500"></i> */}
              
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer