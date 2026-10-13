import React, { createContext, useContext, useState, useEffect } from 'react';

export interface OperativeProfile {
  name: string;
  department?: string;
  ip?: string;
  registeredAt?: string;
}

interface MemberContextType {
  member: OperativeProfile | null;
  clientIp: string;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  registerOperative: (name: string, department?: string) => Promise<boolean>;
  logoutOperative: () => void;
  isLoading: boolean;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'rabat_co_operative_profile';

export const MemberProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [member, setMember] = useState<OperativeProfile | null>(null);
  const [clientIp, setClientIp] = useState<string>('Detecting IP...');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and detect IP + member state
  useEffect(() => {
    let localSaved: OperativeProfile | null = null;
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        localSaved = JSON.parse(stored);
        setMember(localSaved);
      }
    } catch (e) {
      console.error('Failed to parse local operative profile', e);
    }

    // Call /api/me to get IP address and server-side association
    fetch('/api/me')
      .then((res) => {
        if (!res.ok) throw new Error('API me failed');
        return res.json();
      })
      .then((data) => {
        if (data.ip) {
          setClientIp(data.ip);
        }
        // If server already has a registered member for this IP and local has none, adopt it
        if (data.member && !localSaved) {
          setMember(data.member);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.member));
        } else if (localSaved && !data.member) {
          // Sync local member to server for this IP
          fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: localSaved.name,
              department: localSaved.department
            })
          }).catch(() => {});
        }
      })
      .catch((err) => {
        console.warn('Backend API not responding or running in pure static mode:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const registerOperative = async (name: string, department?: string): Promise<boolean> => {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    const newProfile: OperativeProfile = {
      name: trimmedName,
      department: (department || '').trim(),
      ip: clientIp,
      registeredAt: new Date().toISOString()
    };

    setMember(newProfile);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
    } catch {}

    // Send to server
    try {
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProfile.name,
          department: newProfile.department
        })
      });
    } catch (err) {
      console.warn('Failed to sync registration to server', err);
    }

    setIsAuthModalOpen(false);
    return true;
  };

  const logoutOperative = () => {
    setMember(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  };

  return (
    <MemberContext.Provider
      value={{
        member,
        clientIp,
        isAuthModalOpen,
        setIsAuthModalOpen,
        registerOperative,
        logoutOperative,
        isLoading
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

export const useMember = (): MemberContextType => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMember must be used within a MemberProvider');
  }
  return context;
};
