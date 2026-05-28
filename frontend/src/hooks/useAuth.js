import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const auth = useAuthContext();
  return {
    ...auth,
    isLoggedIn: auth.isAuthenticated,
    isAdminUser: auth.isAdmin,
    userName: auth.user?.name,
    userEmail: auth.user?.email,
  };
};