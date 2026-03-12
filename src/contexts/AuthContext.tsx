'use client';

import { UserSyncNotification } from '@/components/auth/UserSyncNotification';
import { onAuthChange } from '@/firebase/auth';
import { auth } from '@/firebase/config';
import { UserService } from '@/services/auth/UserService';
import { User } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  modulosHabilitados: string[] | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  modulosHabilitados: null,
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSyncNotification, setShowSyncNotification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange(async firebaseUser => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const orgIdFromSession =
            typeof window !== 'undefined'
              ? sessionStorage.getItem('organization_id')
              : null;

          // First, ensure user exists in Firestore
          const response = await fetch('/api/users/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              organization_id: orgIdFromSession || undefined,
            }),
          });

          if (response.ok) {
            console.log(
              '[AuthContext] User record created/verified in Firestore'
            );
            // Show sync notification for new users
            const data = await response.json();
            if (data.message === 'Usuario creado exitosamente') {
              setShowSyncNotification(true);
            }
          } else if (response.status === 409) {
            // User already exists, this is fine
            console.log('[AuthContext] User already exists in Firestore');
          } else {
            console.error(
              '[AuthContext] Failed to create user record:',
              await response.text()
            );
          }

          // Fetch the full user data from Firestore
          const fullUser = await UserService.getById(firebaseUser.uid);
          setUser(fullUser);

          // Store organization_id in sessionStorage for components that need it
          // IMPORTANT: Super admins should NOT have an organization context
          if (fullUser?.organization_id && fullUser?.rol !== 'super_admin') {
            sessionStorage.setItem('organization_id', fullUser.organization_id);
            console.log(
              '[AuthContext] Organization ID stored:',
              fullUser.organization_id
            );
          } else if (fullUser?.rol === 'super_admin') {
            // Ensure super admins never have an organization_id in session
            sessionStorage.removeItem('organization_id');
            console.log(
              '[AuthContext] Super admin detected - organization_id cleared'
            );
          }

          // Create session cookie (httpOnly) via API
          try {
            const sessionResponse = await fetch('/api/auth/session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken }),
            });

            if (sessionResponse.ok) {
              console.log('[AuthContext] Session cookie created successfully');
            } else {
              console.error('[AuthContext] Failed to create session cookie');
            }
          } catch (sessionError) {
            console.error(
              '[AuthContext] Error creating session:',
              sessionError
            );
          }
        } catch (error) {
          console.error('[AuthContext] Error fetching user data:', error);
          setUser(null);
          // Clear session on error
          await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        }
      } else {
        setUser(null);
        // Clear session and sessionStorage when user logs out
        if (typeof document !== 'undefined') {
          sessionStorage.removeItem('organization_id');
          console.log('[AuthContext] Session and organization_id cleared');
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const modulosHabilitados = useMemo(
    () => user?.modulos_habilitados ?? null,
    [user]
  );

  const logout = async () => {
    try {
      // Call logout API to revoke session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      // Sign out from Firebase
      const { signOut } = await import('firebase/auth');
      await signOut(auth);

      // Clear sessionStorage
      if (typeof document !== 'undefined') {
        sessionStorage.removeItem('organization_id');
      }

      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, modulosHabilitados, logout }}>
      {children}
      <UserSyncNotification
        show={showSyncNotification}
        onComplete={() => setShowSyncNotification(false)}
      />
    </AuthContext.Provider>
  );
};
