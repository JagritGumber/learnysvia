import { authClient } from "../utils/auth-client";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
}

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession();

  const user = session?.user || null;
  const isLoading = isPending;
  const isAuthenticated = !!session?.user;

  const signOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    signOut,
    error,
  };
}
