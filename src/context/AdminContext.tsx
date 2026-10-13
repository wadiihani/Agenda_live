import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  loginAdmin: (passcode: string) => boolean;
  logoutAdmin: () => void;
}

const ADMIN_PASS = 'wydadac37';
const AUTH_KEY = 'rabat_co_admin_unlocked';

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  loginAdmin: () => false,
  logoutAdmin: () => {},
});

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem(AUTH_KEY) === 'true' ||
        localStorage.getItem(AUTH_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Listen to storage events across tabs or components
    const handleStorageChange = () => {
      const isUnlocked =
        sessionStorage.getItem(AUTH_KEY) === 'true' ||
        localStorage.getItem(AUTH_KEY) === 'true';
      setIsAdmin(isUnlocked);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loginAdmin = (passcode: string): boolean => {
    if (passcode.trim() === ADMIN_PASS) {
      try {
        sessionStorage.setItem(AUTH_KEY, 'true');
        localStorage.setItem(AUTH_KEY, 'true');
      } catch {}
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_KEY);
    } catch {}
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
