import { SignUp } from '@clerk/clerk-react'

const Register = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create Account
        </h2>
        <SignUp 
          routing="path" 
          path="/register"
          signInUrl="/login"
          afterSignUpUrl="/login"
        />
      </div>
    </div>
  )
}

export default Register