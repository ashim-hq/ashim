import { useEffect, useState } from "react";

interface AuthState {
  loading: boolean;
  authEnabled: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    authEnabled: false,
    isAuthenticated: false,
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        // Check if auth is enabled
        const configRes = await fetch("/api/v1/config/auth");
        const config = await configRes.json();

        if (!config.authEnabled) {
          setState({ loading: false, authEnabled: false, isAuthenticated: true });
          return;
        }

        // Auth is enabled — check if we have a valid session
        const token = localStorage.getItem("stirling-token");
        if (!token) {
          setState({ loading: false, authEnabled: true, isAuthenticated: false });
          return;
        }

        const sessionRes = await fetch("/api/auth/session", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (sessionRes.ok) {
          setState({ loading: false, authEnabled: true, isAuthenticated: true });
        } else {
          localStorage.removeItem("stirling-token");
          setState({ loading: false, authEnabled: true, isAuthenticated: false });
        }
      } catch {
        // Can't reach API — assume no auth needed (dev mode)
        setState({ loading: false, authEnabled: false, isAuthenticated: true });
      }
    }

    checkAuth();
  }, []);

  return state;
}
