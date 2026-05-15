import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/clerk-react'
import { toast } from 'react-toastify'

const ManageProducts = () => {
  const { user, isSignedIn } = useUser()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  
  // Form state with multiple images and specifications
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    images: [''],
    mainImage: '',
    brand: '',
    model: '',
    specifications: {
      processor: '',
      ram: '',
      storage: '',
      display: '',
      battery: '',
      camera: ''
    },
    features: ['']
  })

  const fetchProducts = useCallback(async () => {
    const res = await axios.get('http://localhost:5000/api/products')
    setProducts(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isSignedIn && user) {
      queueMicrotask(() => {
        void fetchProducts()
      })
    }
  }, [isSignedIn, user, fetchProducts])

  // Image handlers
  const addImageField = () => {
    setForm({ ...form, images: [...form.images, ''] })
  }

  const removeImageField = (index) => {
    const newImages = form.images.filter((_, i) => i !== index)
    setForm({ ...form, images: newImages })
  }

  const updateImageUrl = (index, value) => {
    const newImages = [...form.images]
    newImages[index] = value
    setForm({ ...form, images: newImages })
  }

  // Features handlers
  const addFeatureField = () => {
    setForm({ ...form, features: [...form.features, ''] })
  }

  const removeFeatureField = (index) => {
    const newFeatures = form.features.filter((_, i) => i !== index)
    setForm({ ...form, features: newFeatures })
  }

  const updateFeature = (index, value) => {
    const newFeatures = [...form.features]
    newFeatures[index] = value
    setForm({ ...form, features: newFeatures })
  }

  // ✅ FIXED: Use Clerk ID instead of Bearer token
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const clerkId = user?.id  // Get Clerk user ID
      
      // Filter out empty images and features
      const submitData = {
        ...form,
        images: form.images.filter(img => img.trim() !== ''),
        features: form.features.filter(f => f.trim() !== ''),
        price: Number(form.price),
        stock: Number(form.stock)
      }
      
      if (editing) {
        await axios.put(`http://localhost:5000/api/products/${editing._id}`, submitData, {
          headers: { 
            'X-Clerk-ID': clerkId,
            'Content-Type': 'application/json'
          }
        })
        toast.success('Product updated!')
      } else {
        await axios.post('http://localhost:5000/api/products', submitData, {
          headers: { 
            'X-Clerk-ID': clerkId,
            'Content-Type': 'application/json'
          }
        })
        toast.success('Product added!')
      }
      fetchProducts()
      setShowForm(false)
      setEditing(null)
      resetForm()
    } catch (err) {
      console.error('Submit error:', err)
      toast.error(err.response?.data?.message || 'Operation failed!')
    }
  }

  const resetForm = () => {
    setForm({
      name: '', description: '', price: '', category: '', stock: '', image: '',
      images: [''],
      mainImage: '',
      brand: '', model: '',
      specifications: {
        processor: '', ram: '', storage: '', display: '', battery: '', camera: ''
      },
      features: ['']
    })
  }

  const handleEdit = (product) => {
    setEditing(product)
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      stock: product.stock || '',
      image: product.image || '',
      images: product.images?.length ? product.images : [''],
      mainImage: product.mainImage || '',
      brand: product.brand || '',
      model: product.model || '',
      specifications: {
        processor: product.specifications?.processor || '',
        ram: product.specifications?.ram || '',
        storage: product.specifications?.storage || '',
        display: product.specifications?.display || '',
        battery: product.specifications?.battery || '',
        camera: product.specifications?.camera || ''
      },
      features: product.features?.length ? product.features : ['']
    })
    setShowForm(true)
  }

  // ✅ FIXED: Use Clerk ID in delete request
  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        const clerkId = user?.id
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { 'X-Clerk-ID': clerkId }
        })
        toast.success('Product deleted!')
        fetchProducts()
      } catch (err) {
        console.error('Delete error:', err)
        toast.error(err.response?.data?.message || 'Delete failed!')
      }
    }
  }

  if (loading) return <p className="text-center mt-10">Loading...</p>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); resetForm() }} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Product' : 'Add Product'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Basic Info */}
              <input type="text" placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full border p-2 rounded"/>
              <textarea placeholder="Description" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-2 rounded"/>
              
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Price (Rs.)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="w-full border p-2 rounded"/>
                <input type="text" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border p-2 rounded"/>
                <input type="number" placeholder="Stock" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border p-2 rounded"/>
                <input type="text" placeholder="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full border p-2 rounded"/>
                <input type="text" placeholder="Model" value={form.model} onChange={e => setForm({...form, model: e.target.value})} className="w-full border p-2 rounded"/>
              </div>

              {/* Multiple Images Section */}
              <div className="border-t pt-3 mt-2">
                <label className="font-semibold block mb-2">Product Images (Multiple)</label>
                {form.images.map((img, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Image URL ${idx + 1}`}
                      value={img}
                      onChange={(e) => updateImageUrl(idx, e.target.value)}
                      className="flex-1 border p-2 rounded"
                    />
                    {idx > 0 && (
                      <button type="button" onClick={() => removeImageField(idx)} className="bg-red-500 text-white px-3 rounded">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addImageField} className="text-blue-500 text-sm">
                  + Add Another Image
                </button>
              </div>

              {/* Main Image */}
              <div>
                <label className="font-semibold block mb-1">Main/Thumbnail Image</label>
                <input
                  type="text"
                  placeholder="Main image URL (used in product cards)"
                  value={form.mainImage}
                  onChange={e => setForm({ ...form, mainImage: e.target.value })}
                  className="w-full border p-2 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">If not provided, first image will be used</p>
              </div>

              {/* Specifications */}
              <div className="border-t pt-3 mt-2">
                <label className="font-semibold block mb-2">Specifications</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Processor" value={form.specifications.processor} onChange={e => setForm({...form, specifications: {...form.specifications, processor: e.target.value}})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="RAM" value={form.specifications.ram} onChange={e => setForm({...form, specifications: {...form.specifications, ram: e.target.value}})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Storage" value={form.specifications.storage} onChange={e => setForm({...form, specifications: {...form.specifications, storage: e.target.value}})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Display" value={form.specifications.display} onChange={e => setForm({...form, specifications: {...form.specifications, display: e.target.value}})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Battery" value={form.specifications.battery} onChange={e => setForm({...form, specifications: {...form.specifications, battery: e.target.value}})} className="border p-2 rounded text-sm"/>
                  <input type="text" placeholder="Camera" value={form.specifications.camera} onChange={e => setForm({...form, specifications: {...form.specifications, camera: e.target.value}})} className="border p-2 rounded text-sm"/>
                </div>
              </div>

              {/* Features */}
              <div className="border-t pt-3 mt-2">
                <label className="font-semibold block mb-2">Key Features</label>
                {form.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder={`Feature ${idx + 1}`}
                      value={feature}
                      onChange={(e) => updateFeature(idx, e.target.value)}
                      className="flex-1 border p-2 rounded"
                    />
                    {idx > 0 && (
                      <button type="button" onClick={() => removeFeatureField(idx)} className="bg-red-500 text-white px-3 rounded">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addFeatureField} className="text-blue-500 text-sm">
                  + Add Feature
                </button>
              </div>

              {/* Backward compatibility image field */}
              <input type="text" placeholder="Single Image URL (optional)" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full border p-2 rounded hidden"/>

              <div className="flex gap-2 mt-4">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">{editing ? 'Update' : 'Save'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Image</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className="border-t">
                <td className="px-4 py-3">
                  <img 
                    src={product.mainImage || (product.images?.[0]) || product.image || 'https://via.placeholder.com/40'} 
                    alt="" 
                    className="w-10 h-10 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.brand || '-'}</td>
                <td className="px-4 py-3">Rs. {product.price?.toLocaleString()}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleEdit(product)} className="text-blue-500 hover:underline mr-3">Edit</button>
                  <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageProducts