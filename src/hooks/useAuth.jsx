import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { getBusiness } from '../services/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session (also handles magic link hash in URL)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.error('Supabase auth error:', err);
      setLoading(false);
    });

    // Listen for auth changes — fires when magic link is clicked or OTP verified
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      
      // Prevent unnecessary React re-renders if the user is identical
      setUser((prev) => prev?.id === currentUser?.id ? prev : currentUser);
      setLoading(false);

      // ONLY run the navigation flow if it's a fresh SIGNED_IN event and they are on the root page
      if (event === 'SIGNED_IN' && currentUser) {
        const path = window.location.pathname;
        
        // If they are on any page other than the landing page, don't interrupt their session
        if (path !== '/') {
          return;
        }

        // Otherwise navigate based on whether they have a business profile
        try {
          const biz = await getBusiness(currentUser.id);
          navigate(biz ? '/dashboard' : '/onboard', { replace: true });
        } catch {
          navigate('/onboard', { replace: true });
        }
      }

      if (event === 'SIGNED_OUT') {
        navigate('/', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
