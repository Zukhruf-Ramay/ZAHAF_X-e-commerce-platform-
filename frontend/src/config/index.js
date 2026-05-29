class Config {
  constructor() {
    this.env = import.meta.env.MODE;
  }

  get isProduction() {
    return this.env === 'production';
  }

  get isDevelopment() {
    return this.env === 'development';
  }

  get apiUrl() {
    if (this.isProduction) {
      return import.meta.env.VITE_API_URL || 'https://zahafx-backend.onrender.com';
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  get frontendUrl() {
    if (this.isProduction) {
      return window.location.origin;
    }
    return 'http://localhost:5173';
  }

  get wsUrl() {
    return this.apiUrl.replace('http', 'ws');
  }
}

export default new Config();