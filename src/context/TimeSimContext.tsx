import React, { createContext, useContext, useState } from 'react';

interface TimeSimContextType {
  simulatedTime: string | null; // ISO string or null for real-time
  setSimulatedTime: (iso: string | null) => void;
  isSimModalOpen: boolean;
  setIsSimModalOpen: (open: boolean) => void;
}

const TimeSimContext = createContext<TimeSimContextType>({
  simulatedTime: null,
  setSimulatedTime: () => {},
  isSimModalOpen: false,
  setIsSimModalOpen: () => {},
});

export const TimeSimProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);

  return (
    <TimeSimContext.Provider value={{ simulatedTime, setSimulatedTime, isSimModalOpen, setIsSimModalOpen }}>
      {children}
    </TimeSimContext.Provider>
  );
};

export const useTimeSim = () => useContext(TimeSimContext);
