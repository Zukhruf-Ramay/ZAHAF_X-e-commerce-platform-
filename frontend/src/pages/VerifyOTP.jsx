import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const email = location.state?.email || '';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email,
        otp
      });

      if (response.data.success) {
        setMessage('Email verified successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/resend-otp`, { email });
      
      if (response.data.success) {
        setMessage('New OTP sent! Please check your email.');
        setCooldown(60);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📧</span>
          </div>
          <h2 className="mt-4 text-2xl font-bold">Verify Your Email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a 6-digit verification code to:
          </p>
          <p className="font-medium text-gray-900">{email}</p>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form className="mt-6" onSubmit={handleVerify}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-center text-2xl tracking-widest px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="000000"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResendOTP}
            disabled={cooldown > 0}
            className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link to="/register" className="text-sm text-gray-600 hover:text-gray-700">
            ← Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;