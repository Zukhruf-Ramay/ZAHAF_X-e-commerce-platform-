import { useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const Profile = () => {
  const { user, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const [name, setName] = useState(user?.fullName || '')
  const [updating, setUpdating] = useState(false)

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      // Update profile in Clerk
      await user?.update({ firstName: name.split(' ')[0], lastName: name.split(' ').slice(1).join(' ') })
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Update failed')
    } finally {
      setUpdating(false)
    }
  }

  if (!isSignedIn) {
    return <div className="text-center py-20">Please login <Link to="/login" className="text-blue-500">Login</Link></div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg px-4 py-2" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input type="email" value={user?.primaryEmailAddress?.emailAddress || ''} disabled className="w-full border rounded-lg px-4 py-2 bg-gray-50" />
          </div>
          <button type="submit" disabled={updating} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        <hr className="my-6" />
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
          <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            Logout from all devices
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile