// Authentication Context and Hooks
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "./api";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const response = await api.getCurrentUser();
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem("accessToken");
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      const response = await api.login(email, password);
      const { accessToken, user: userData } = response.data;

      localStorage.setItem("accessToken", accessToken);
      setUser(userData);

      router.push("/dashboard");
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function logout() {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
      router.push("/login");
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

// Protected route wrapper
export function withAuth(Component) {
  return function ProtectedRoute(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push("/login");
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null;
    }

    return <Component {...props} />;
  };
}
