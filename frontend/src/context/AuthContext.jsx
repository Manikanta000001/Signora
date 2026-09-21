import { createContext, useEffect, useState } from "react";

import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../utils/tokenStorage";

import {
  loginDeveloper,
  refreshDeveloperToken,
  getDeveloperProfile,
  exchangeDeveloperOAuth,
  signupDeveloper,
  updateDeveloperProfile,
} from "../api/developerAuth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessTokenState] = useState(
    getAccessToken()
  );

  const [developer, setDeveloper] = useState(null);

  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(accessToken);

  useEffect(() => {
    const restore = async () => {
      const token = getAccessToken();
      const refresh = getRefreshToken();
      if (!token && !refresh) {
        setLoading(false);
        return;
      }
      try {
        let restoredAccessToken = null;
        const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
        if (payload && payload.exp * 1000 > Date.now()) {
          setAccessTokenState(token);
          restoredAccessToken = token;
        } else if (refresh) {
          const data = await refreshDeveloperToken(refresh);
          setTokens({ access: data.access });
          setAccessTokenState(data.access);
          restoredAccessToken = data.access;
        } else {
          clearTokens();
        }
        // Profile display data must not invalidate a restored JWT session. The
        // token is the session credential; this request is supplementary UI data.
        if (restoredAccessToken) {
          try {
            const profile = await getDeveloperProfile();
            setDeveloper(profile.user);
          } catch {
            setDeveloper(null);
          }
        }
      } catch {
        clearTokens();
        setAccessTokenState(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (credentials) => {
    const data = await loginDeveloper(credentials);

    // Backend returns only:
    // {
    //   access: "...",
    //   refresh: "..."
    // }

    setTokens({
      access: data.access,
      refresh: data.refresh,
    });

    setAccessTokenState(data.access);
    setDeveloper(data.user ?? null);

    return data;
  };

  const signup = async (userData) => {
    const data = await signupDeveloper(userData);

    if (data.access && data.refresh) {
      setTokens({
        access: data.access,
        refresh: data.refresh,
      });

      setAccessTokenState(data.access);
      setDeveloper(data.user ?? null);
    }

    return data;
  };

  const logout = () => {
    clearTokens();

    setAccessTokenState(null);
    setDeveloper(null);
  };

  const updateProfile = async (profile) => {
    const data = await updateDeveloperProfile(profile);
    setDeveloper(data.user);
    return data;
  };

  const completeOAuthLogin = async (code) => {
    const data = await exchangeDeveloperOAuth(code);
    setTokens({ access: data.access, refresh: data.refresh });
    setAccessTokenState(data.access);
    setDeveloper(data.user);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        developer,
        accessToken,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        completeOAuthLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
