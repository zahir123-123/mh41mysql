
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authAPI, authUtils } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  role: string;
}

interface Session {
  user: User;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is admin based on profile role
  const isAdmin = profile?.role === 'admin' || 
                  user?.email === 'admin@autohub.com' || 
                  user?.email === 'admin@gmail.com' ||
                  user?.email?.includes('admin');

  useEffect(() => {
    let isMounted = true;

    // Check for existing token and validate it
    const checkAuth = async () => {
      try {
        const token = authUtils.getToken();
        if (token && authUtils.isAuthenticated()) {
          // Validate token by fetching profile
          const profileData = await authAPI.getProfile();
          if (isMounted) {
            setProfile(profileData);
            setUser({
              id: profileData.id,
              email: profileData.email,
              role: profileData.role
            });
            setSession({
              user: {
                id: profileData.id,
                email: profileData.email,
                role: profileData.role
              }
            });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Token is invalid, remove it
        authUtils.removeToken();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      
      if (response.token) {
        authUtils.setToken(response.token);
        
        // Fetch user profile
        const profileData = await authAPI.getProfile();
        setProfile(profileData);
        setUser({
          id: profileData.id,
          email: profileData.email,
          role: profileData.role
        });
        setSession({
          user: {
            id: profileData.id,
            email: profileData.email,
            role: profileData.role
          }
        });

        toast({
          title: "Welcome back!",
          description: "Successfully signed in to AutoHub",
        });

        return { error: null };
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await authAPI.register({ 
        email, 
        password, 
        full_name: fullName 
      });
      
      if (response.token) {
        authUtils.setToken(response.token);
        
        // Fetch user profile
        const profileData = await authAPI.getProfile();
        setProfile(profileData);
        setUser({
          id: profileData.id,
          email: profileData.email,
          role: profileData.role
        });
        setSession({
          user: {
            id: profileData.id,
            email: profileData.email,
            role: profileData.role
          }
        });

        toast({
          title: "Account Created!",
          description: "Welcome to AutoHub!",
        });

        return { error: null };
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    authUtils.removeToken();
    setUser(null);
    setSession(null);
    setProfile(null);
    
    toast({
      title: "Signed Out",
      description: "Successfully signed out of AutoHub",
    });
  };

  const updateProfile = async (updateData: any) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      await authAPI.updateProfile(updateData);
      
      // Refresh profile data
      const profileData = await authAPI.getProfile();
      setProfile(profileData);
      
      return { error: null };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      isAdmin,
      signIn,
      signUp,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
