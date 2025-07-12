import React from "react";

// Simple toast context and provider
interface ToastContextType {
  success: (title: string, message: string) => void;
  error: (title: string, message: string) => void;
}

const ToastContext = React.createContext<ToastContextType>({
  success: () => {},
  error: () => {},
});

export const useToast = () => React.useContext(ToastContext);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const success = (title: string, message: string) => {
    console.log(`✅ ${title}: ${message}`);
  };

  const error = (title: string, message: string) => {
    console.error(`❌ ${title}: ${message}`);
  };

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
    </ToastContext.Provider>
  );
};