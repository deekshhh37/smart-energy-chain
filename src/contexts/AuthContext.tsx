import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  displayName: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  displayName: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isLocalDev = import.meta.env.DEV;
  const devUser = isLocalDev
    ? ({ id: 'local-user', email: 'local@dev.test', app_metadata: {}, user_metadata: {}, aud: 'authenticated' } as unknown as User)
    : null;

  const [user, setUser] = useState<User | null>(devUser);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(isLocalDev);
  const [loading, setLoading] = useState<boolean>(!isLocalDev);
  const [displayName, setDisplayName] = useState<string | null>(isLocalDev ? 'Dev User' : null);

  useEffect(() => {
    if (isLocalDev) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch role
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);
          setIsAdmin(roles?.some((r) => r.role === "admin") ?? false);

          // Fetch profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("user_id", session.user.id)
            .single();
          setDisplayName(profile?.display_name ?? session.user.email ?? null);
        } else {
          setIsAdmin(false);
          setDisplayName(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, displayName, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
