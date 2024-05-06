// context/EssayContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EssayContextType {
  essay: string;
  setEssay: (essay: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
}

const EssayContext = createContext<EssayContextType | undefined>(undefined);

export const EssayProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [essay, setEssay] = useState<string>('');
  const [topic, setTopic] = useState<string>('');

  return (
    <EssayContext.Provider value={{ essay, setEssay, topic, setTopic }}>
      {children}
    </EssayContext.Provider>
  );
};

export const useEssay = () => {
  const context = useContext(EssayContext);
  if (context === undefined) {
    throw new Error('useEssay must be used within an EssayProvider');
  }
  return context;
};
