import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

class Config {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.validate();
  }

  validate() {
    const required = ['JWT_SECRET', 'MONGODB_URI'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length) {
      throw new Error(`Missing required env variables: ${missing.join(', ')}`);
    }
  }

  get isProduction() {
    return this.env === 'production';
  }

  get isDevelopment() {
    return this.env === 'development';
  }

  get frontendUrl() {
    if (this.isProduction) {
      return process.env.FRONTEND_URL || 'https://zahaf-x-e-commerce-platform.vercel.app';
    }
    return process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  get backendUrl() {
    if (this.isProduction) {
      return process.env.BACKEND_URL || 'https://zahafx-backend.onrender.com';
    }
    return `http://localhost:${process.env.PORT || 5000}`;
  }

  get apiUrl() {
    return `${this.backendUrl}/api`;
  }

  get corsOrigins() {
    const origins = [
      'http://localhost:5173',
      'http://localhost:3000',
      this.frontendUrl
    ];
    
    // Add additional origins from env if any
    if (process.env.EXTRA_CORS_ORIGINS) {
      origins.push(...process.env.EXTRA_CORS_ORIGINS.split(','));
    }
    
    return origins;
  }
}

export default new Config();