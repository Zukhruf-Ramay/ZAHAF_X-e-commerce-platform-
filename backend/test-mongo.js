import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('=== Testing MongoDB Connection ===');
console.log('URI exists:', !!MONGODB_URI);

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}

// Mask password for logging
const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:***@');
console.log('Connecting to:', maskedUri);

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully to MongoDB Atlas!');
    console.log('📊 Database name:', mongoose.connection.db.databaseName);
    console.log('🔌 Connection state:', mongoose.connection.readyState);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.error('\n💡 Fix: Wrong username or password');
      console.error('   Username: admin');
      console.error('   Password: admin123 (check if correct)');
    }
    if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.error('\n💡 Fix: Cannot reach MongoDB Atlas');
      console.error('   Check your internet connection');
    }
    if (error.message.includes('SSL')) {
      console.error('\n💡 Fix: SSL connection problem');
    }
    if (error.message.includes('timed out')) {
      console.error('\n💡 Fix: Network issue. Check IP whitelist in Atlas');
      console.error('   Go to Atlas → Network Access → Add IP: 0.0.0.0/0');
    }
    return false;
  }
}

testConnection();