import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Send } from 'lucide-react';

const ResendOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Use Vite environment variable
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Countdown timer for cooldown
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting again`);
      return;
    }
    
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      // ✅ Changed to resend-otp endpoint
      const response = await axios.post(
        `${API_URL}/api/auth/resend-otp`,
        { email }
      );
      
      if (response.data.success) {
        setMessage(response.data.message);
        setCooldown(60); // 60 seconds cooldown
        
        // Redirect to OTP verification page after 2 seconds
        setTimeout(() => {
          navigate('/verify-otp', { state: { email } });
        }, 2000);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      // Handle rate limiting (429 status)
      if (error.response?.status === 429) {
        const match = error.response.data.message.match(/(\d+) seconds/);
        if (match) {
          setCooldown(parseInt(match[1]));
        }
        setError(error.response.data.message);
      } else {
        setError(
          error.response?.data?.message || 'Failed to resend OTP. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Resend OTP
          </h2>
          
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a new OTP code.
          </p>
        </div>

        {message && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="mt-1 relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="you@example.com"
                disabled={cooldown > 0}
              />
              <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Sending...'
              ) : cooldown > 0 ? (
                `Wait ${cooldown}s to resend`
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Resend OTP
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResendOTP;