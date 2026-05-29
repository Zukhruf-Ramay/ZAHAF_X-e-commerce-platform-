import axios from 'axios'
import fs from 'fs'

// Replace with your actual Unsplash Access Key
const UNSPLASH_ACCESS_KEY = 'Co6rXr6l6aOXrdAZ_qPhku3snCEKTSJe5idm3RUEGYU'

// List of products with their search terms
const productsToFetch = [
  { name: "iPhone 15 Pro Max", search: "iPhone 15 Pro Max" },
  { name: "Samsung Galaxy S24 Ultra", search: "Samsung Galaxy S24 Ultra" },
  { name: "Google Pixel 8 Pro", search: "Google Pixel 8 Pro" },
  { name: "OnePlus 12", search: "OnePlus 12" },
  { name: "Xiaomi 14 Ultra", search: "Xiaomi 14 Ultra" },
  { name: "Nothing Phone 2", search: "Nothing Phone 2" },
  { name: "Motorola Edge 50 Ultra", search: "Motorola phone" },
  { name: "Vivo X100 Pro", search: "Vivo phone" },
  { name: "Asus ROG Phone 8", search: "gaming phone" },
  { name: "iPhone 15 Plus", search: "iPhone 15" },
  { name: "MacBook Pro 14 M3 Pro", search: "MacBook Pro" },
  { name: "Dell XPS 15", search: "Dell XPS" },
  { name: "HP Spectre x360", search: "HP laptop" },
  { name: "Lenovo Legion 5 Pro", search: "gaming laptop" },
  { name: "MacBook Air M2", search: "MacBook Air" },
  { name: "Asus Zenbook 14 OLED", search: "Asus Zenbook" },
  { name: "Microsoft Surface Laptop 5", search: "Microsoft Surface" },
  { name: "Acer Swift Go 14", search: "Acer laptop" },
  { name: "Razer Blade 14", search: "Razer Blade" },
  { name: "LG Gram 17", search: "LG laptop" },
  { name: "Sony WH-1000XM5", search: "Sony headphones" },
  { name: "Apple AirPods Pro 2", search: "AirPods Pro" },
  { name: "Bose QuietComfort Ultra", search: "Bose headphones" },
  { name: "Samsung Galaxy Buds2 Pro", search: "Samsung earbuds" },
  { name: "Logitech MX Master 3S", search: "Logitech mouse" },
  { name: "Razer BlackWidow V4 Pro", search: "Razer keyboard" },
  { name: "Apple Watch Series 9", search: "Apple Watch" },
  { name: "Samsung Galaxy Watch 6 Classic", search: "Samsung Watch" },
  { name: "Anker 737 Power Bank", search: "power bank" },
  { name: "DJI Osmo Mobile 6", search: "DJI gimbal" },
  { name: "iPad Pro 12.9 M2", search: "iPad Pro" },
  { name: "Samsung Galaxy Tab S9 Ultra", search: "Samsung tablet" },
  { name: "iPad Air 5 M1", search: "iPad Air" },
  { name: "Microsoft Surface Pro 9", search: "Surface Pro" },
  { name: "Google Pixel Watch 2", search: "Pixel Watch" }
]

async function fetchProductImages() {
  const results = []
  
  for (const product of productsToFetch) {
    console.log(`Fetching images for: ${product.name}...`)
    
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: product.search,
          per_page: 3,
          orientation: 'squarish'
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      })
      
      const images = response.data.results.map(img => img.urls.small)
      
      results.push({
        name: product.name,
        searchTerm: product.search,
        images: images,
        mainImage: images[0] || null
      })
      
      console.log(`  ✅ Found ${images.length} images`)
      
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`)
      results.push({
        name: product.name,
        searchTerm: product.search,
        images: [],
        mainImage: null
      })
    }
    
    // Wait a bit to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Save results to file
  fs.writeFileSync('productImages.json', JSON.stringify(results, null, 2))
  console.log('\n✅ Saved to productImages.json')
}

fetchProductImages()