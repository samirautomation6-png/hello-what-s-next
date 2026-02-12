import { createContext, useContext, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
}

const AdminContext = createContext<AdminContextType>({ isAdmin: false });

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children, isAdmin }: { children: ReactNode; isAdmin: boolean }) {
  return (
    <AdminContext.Provider value={{ isAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}
