import mongoose from 'mongoose'
import Product from './models/Product.js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

// Load the fetched images
const imageData = JSON.parse(fs.readFileSync('productImages.json', 'utf8'))

// Helper to get images by product name
const getImages = (productName) => {
  const found = imageData.find(p => p.name === productName)
  if (found && found.images && found.images.length > 0) {
    return {
      images: found.images,
      mainImage: found.mainImage
    }
  }
  // Fallback images
  return {
    images: ["https://images.unsplash.com/photo-1592899677977-9e10f590e3c0?w=400"],
    mainImage: "https://images.unsplash.com/photo-1592899677977-9e10f590e3c0?w=400"
  }
}

const products = [
  // ========== MOBILES ==========
  {
    name: "iPhone 15 Pro Max",
    description: "Apple's most powerful iPhone with A17 Pro chip, titanium design, and 5x optical zoom. 6.7-inch Super Retina XDR display with ProMotion.",
    price: 349999,
    category: "Mobiles",
    stock: 15,
    brand: "Apple",
    ...getImages("iPhone 15 Pro Max"),
    specifications: { processor: "Apple A17 Pro", ram: "8GB", storage: "256GB", display: "6.7-inch Super Retina XDR, 120Hz", battery: "4422 mAh", camera: "48MP + 12MP + 12MP" }
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Latest Samsung flagship with 200MP camera, S Pen built-in, and 6.8-inch Dynamic AMOLED 2X display with 120Hz refresh rate.",
    price: 279999,
    category: "Mobiles",
    stock: 12,
    brand: "Samsung",
    ...getImages("Samsung Galaxy S24 Ultra"),
    specifications: { processor: "Snapdragon 8 Gen 3", ram: "12GB", storage: "256GB", display: "6.8-inch Dynamic AMOLED 2X, 120Hz", battery: "5000 mAh", camera: "200MP + 50MP + 12MP + 10MP" }
  },
  {
    name: "Google Pixel 8 Pro",
    description: "Google's AI-powered phone with Tensor G3 chip, 6.7-inch display, and best-in-class camera system.",
    price: 199999,
    category: "Mobiles",
    stock: 8,
    brand: "Google",
    ...getImages("Google Pixel 8 Pro"),
    specifications: { processor: "Google Tensor G3", ram: "12GB", storage: "128GB", display: "6.7-inch LTPO OLED, 120Hz", battery: "5050 mAh", camera: "50MP + 48MP + 48MP" }
  },
  {
    name: "OnePlus 12",
    description: "Flagship killer with Snapdragon 8 Gen 3, 100W fast charging, and Hasselblad camera system.",
    price: 159999,
    category: "Mobiles",
    stock: 20,
    brand: "OnePlus",
    ...getImages("OnePlus 12"),
    specifications: { processor: "Snapdragon 8 Gen 3", ram: "16GB", storage: "256GB", display: "6.82-inch AMOLED, 120Hz", battery: "5400 mAh", camera: "50MP + 64MP + 48MP" }
  },
  {
    name: "Nothing Phone 2",
    description: "Unique transparent design with Glyph interface, Snapdragon 8+ Gen 1 processor.",
    price: 89999,
    category: "Mobiles",
    stock: 25,
    brand: "Nothing",
    ...getImages("Nothing Phone 2"),
    specifications: { processor: "Snapdragon 8+ Gen 1", ram: "12GB", storage: "256GB", display: "6.7-inch OLED, 120Hz", battery: "4700 mAh", camera: "50MP + 50MP" }
  },
  {
    name: "Vivo X100 Pro",
    description: "Zeiss optics with 100x digital zoom, Dimensity 9300 processor, and 100W charging.",
    price: 179999,
    category: "Mobiles",
    stock: 7,
    brand: "Vivo",
    ...getImages("Vivo X100 Pro"),
    specifications: { processor: "MediaTek Dimensity 9300", ram: "16GB", storage: "512GB", display: "6.78-inch AMOLED, 120Hz", battery: "5400 mAh", camera: "50MP + 50MP + 50MP" }
  },
  {
    name: "Asus ROG Phone 8",
    description: "Gaming phone with 165Hz display, Snapdragon 8 Gen 3, and AirTrigger buttons.",
    price: 209999,
    category: "Mobiles",
    stock: 5,
    brand: "Asus",
    ...getImages("Asus ROG Phone 8"),
    specifications: { processor: "Snapdragon 8 Gen 3", ram: "16GB", storage: "512GB", display: "6.78-inch AMOLED, 165Hz", battery: "5500 mAh", camera: "50MP + 13MP + 5MP" }
  },
  {
    name: "iPhone 15 Plus",
    description: "Large screen iPhone with A16 Bionic chip, 48MP camera, and USB-C charging.",
    price: 219999,
    category: "Mobiles",
    stock: 20,
    brand: "Apple",
    ...getImages("iPhone 15 Plus"),
    specifications: { processor: "Apple A16 Bionic", ram: "6GB", storage: "128GB", display: "6.7-inch Super Retina XDR", battery: "4383 mAh", camera: "48MP + 12MP" }
  },

  // ========== LAPTOPS ==========
  {
    name: "MacBook Pro 14 M3 Pro",
    description: "Apple's professional laptop with M3 Pro chip, 14-inch Liquid Retina XDR display, and 18-hour battery life.",
    price: 399999,
    category: "Laptops",
    stock: 7,
    brand: "Apple",
    ...getImages("MacBook Pro 14 M3 Pro"),
    specifications: { processor: "Apple M3 Pro (11-core)", ram: "18GB", storage: "512GB SSD", display: "14.2-inch Liquid Retina XDR, 120Hz", battery: "72.4 Wh", graphics: "14-core GPU" }
  },
  {
    name: "Dell XPS 15",
    description: "Premium Windows laptop with Intel Core i9, 15.6-inch 3.5K OLED display, and NVIDIA RTX 4070 graphics.",
    price: 349999,
    category: "Laptops",
    stock: 5,
    brand: "Dell",
    ...getImages("Dell XPS 15"),
    specifications: { processor: "Intel Core i9-13900H", ram: "32GB", storage: "1TB SSD", display: "15.6-inch 3.5K OLED", battery: "86 Wh", graphics: "NVIDIA RTX 4070" }
  },
  {
    name: "HP Spectre x360",
    description: "2-in-1 convertible laptop with Intel Evo certification, 13.5-inch OLED display, and 16-hour battery.",
    price: 229999,
    category: "Laptops",
    stock: 10,
    brand: "HP",
    ...getImages("HP Spectre x360"),
    specifications: { processor: "Intel Core i7-1355U", ram: "16GB", storage: "1TB SSD", display: "13.5-inch 3K OLED touch", battery: "66 Wh", graphics: "Intel Iris Xe" }
  },
  {
    name: "Lenovo Legion 5 Pro",
    description: "Gaming laptop with AMD Ryzen 7, 16-inch 240Hz display, and NVIDIA RTX 4060 graphics.",
    price: 279999,
    category: "Laptops",
    stock: 6,
    brand: "Lenovo",
    ...getImages("Lenovo Legion 5 Pro"),
    specifications: { processor: "AMD Ryzen 7 7745HX", ram: "16GB", storage: "1TB SSD", display: "16-inch IPS, 240Hz", battery: "80 Wh", graphics: "NVIDIA RTX 4060" }
  },
  {
    name: "MacBook Air M2",
    description: "Ultra-portable laptop with M2 chip, 13.6-inch Liquid Retina display, and 18-hour battery.",
    price: 189999,
    category: "Laptops",
    stock: 15,
    brand: "Apple",
    ...getImages("MacBook Air M2"),
    specifications: { processor: "Apple M2", ram: "8GB", storage: "256GB SSD", display: "13.6-inch Liquid Retina", battery: "52.6 Wh", graphics: "8-core GPU" }
  },
  {
    name: "Microsoft Surface Laptop 5",
    description: "Premium Windows laptop with 13.5-inch PixelSense display and sleek aluminum design.",
    price: 199999,
    category: "Laptops",
    stock: 8,
    brand: "Microsoft",
    ...getImages("Microsoft Surface Laptop 5"),
    specifications: { processor: "Intel Core i7-1255U", ram: "16GB", storage: "512GB SSD", display: "13.5-inch PixelSense", battery: "47 Wh", graphics: "Intel Iris Xe" }
  },
  {
    name: "Razer Blade 14",
    description: "Compact gaming laptop with AMD Ryzen 9, NVIDIA RTX 4070, and QHD 240Hz display.",
    price: 349999,
    category: "Laptops",
    stock: 4,
    brand: "Razer",
    ...getImages("Razer Blade 14"),
    specifications: { processor: "AMD Ryzen 9 7940HS", ram: "16GB", storage: "1TB SSD", display: "14-inch QHD, 240Hz", battery: "68.1 Wh", graphics: "NVIDIA RTX 4070" }
  },

  // ========== ACCESSORIES ==========
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise cancellation headphones with 30-hour battery life and LDAC support.",
    price: 54999,
    category: "Accessories",
    stock: 30,
    brand: "Sony",
    ...getImages("Sony WH-1000XM5"),
    specifications: { type: "Over-ear", battery: "30 hours", connectivity: "Bluetooth 5.2", features: "Active Noise Cancellation, LDAC" }
  },
  {
    name: "Apple AirPods Pro 2",
    description: "Premium earbuds with Active Noise Cancellation, Transparency mode, and Personalized Spatial Audio.",
    price: 74999,
    category: "Accessories",
    stock: 40,
    brand: "Apple",
    ...getImages("Apple AirPods Pro 2"),
    specifications: { type: "In-ear", battery: "6 hours", connectivity: "Bluetooth 5.3", features: "ANC, Transparency, Spatial Audio" }
  },
  {
    name: "Logitech MX Master 3S",
    description: "Advanced wireless mouse with 8K DPI, silent clicks, and MagSpeed electromagnetic scrolling.",
    price: 15999,
    category: "Accessories",
    stock: 50,
    brand: "Logitech",
    ...getImages("Logitech MX Master 3S"),
    specifications: { type: "Wireless Mouse", sensor: "8K DPI", features: "Silent clicks, MagSpeed scroll", battery: "70 days" }
  },
  {
    name: "Razer BlackWidow V4 Pro",
    description: "Mechanical gaming keyboard with Razer Yellow switches, RGB lighting, and magnetic wrist rest.",
    price: 39999,
    category: "Accessories",
    stock: 15,
    brand: "Razer",
    ...getImages("Razer BlackWidow V4 Pro"),
    specifications: { type: "Mechanical Keyboard", switches: "Razer Yellow", features: "RGB, Wrist rest" }
  },
  {
    name: "Apple Watch Series 9",
    description: "Smartwatch with S9 chip, always-on Retina display, double tap gesture, and advanced health features.",
    price: 119999,
    category: "Accessories",
    stock: 25,
    brand: "Apple",
    ...getImages("Apple Watch Series 9"),
    specifications: { type: "Smartwatch", display: "Always-on Retina", battery: "18 hours", features: "ECG, Blood Oxygen, GPS" }
  },
  {
    name: "Samsung Galaxy Watch 6 Classic",
    description: "Premium smartwatch with rotating bezel, sapphire crystal glass, and advanced sleep tracking.",
    price: 89999,
    category: "Accessories",
    stock: 20,
    brand: "Samsung",
    ...getImages("Samsung Galaxy Watch 6 Classic"),
    specifications: { type: "Smartwatch", display: "Super AMOLED", battery: "40 hours", features: "Rotating bezel, Sleep tracking" }
  },
  {
    name: "Anker 737 Power Bank",
    description: "24,000mAh power bank with 140W output, smart digital display, and charges 2 laptops simultaneously.",
    price: 24999,
    category: "Accessories",
    stock: 30,
    brand: "Anker",
    ...getImages("Anker 737 Power Bank"),
    specifications: { capacity: "24000 mAh", output: "140W", ports: "2 USB-C, 1 USB-A", features: "Smart display" }
  },
  {
    name: "DJI Osmo Mobile 6",
    description: "Smartphone gimbal stabilizer with magnetic clamp, subject tracking, and foldable design.",
    price: 32999,
    category: "Accessories",
    stock: 12,
    brand: "DJI",
    ...getImages("DJI Osmo Mobile 6"),
    specifications: { type: "Gimbal", features: "Subject tracking, Foldable", battery: "6.5 hours" }
  },

  // ========== TABLETS ==========
  {
    name: "iPad Pro 12.9 M2",
    description: "Apple's most advanced iPad with M2 chip, Liquid Retina XDR display, and Apple Pencil hover support.",
    price: 299999,
    category: "Tablets",
    stock: 9,
    brand: "Apple",
    ...getImages("iPad Pro 12.9 M2"),
    specifications: { display: "12.9-inch Liquid Retina XDR", processor: "Apple M2", storage: "128GB", battery: "10 hours" }
  },
  {
    name: "Samsung Galaxy Tab S9 Ultra",
    description: "Giant 14.6-inch AMOLED tablet with Snapdragon 8 Gen 2, S Pen included, and IP68 water resistance.",
    price: 259999,
    category: "Tablets",
    stock: 7,
    brand: "Samsung",
    ...getImages("Samsung Galaxy Tab S9 Ultra"),
    specifications: { display: "14.6-inch Dynamic AMOLED", processor: "Snapdragon 8 Gen 2", storage: "256GB", battery: "11200 mAh" }
  },
  {
    name: "iPad Air 5 M1",
    description: "Powerful iPad with M1 chip, 10.9-inch Liquid Retina display, and 5G connectivity.",
    price: 179999,
    category: "Tablets",
    stock: 15,
    brand: "Apple",
    ...getImages("iPad Air 5 M1"),
    specifications: { display: "10.9-inch Liquid Retina", processor: "Apple M1", storage: "64GB", battery: "10 hours" }
  },
  {
    name: "Microsoft Surface Pro 9",
    description: "2-in-1 tablet with Intel Core i7, 13-inch PixelSense display, and Windows 11.",
    price: 239999,
    category: "Tablets",
    stock: 6,
    brand: "Microsoft",
    ...getImages("Microsoft Surface Pro 9"),
    specifications: { display: "13-inch PixelSense", processor: "Intel Core i7", storage: "256GB", battery: "15.5 hours" }
  }
]

async function addProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')
    
    // Clear existing products
    const deleted = await Product.deleteMany({})
    console.log(`🗑️ Cleared ${deleted.deletedCount} existing products`)
    
    // Insert new products
    const result = await Product.insertMany(products)
    console.log(`✅ ${result.length} products added successfully!`)
    
    console.log('\n📊 Product Categories:')
    const categories = [...new Set(result.map(p => p.category))]
    categories.forEach(cat => {
      const count = result.filter(p => p.category === cat).length
      console.log(`   - ${cat}: ${count} products`)
    })
    
    process.exit()
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

addProducts()