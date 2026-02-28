"use client";
import { createContext, useContext, useState } from "react";

const CustomerAddressContext = createContext(null);

export function CustomerAddressProvider({ children }) {
  const [version, setVersion] = useState(0);

  return (
    <CustomerAddressContext.Provider value={{
      version,
      bump: () => setVersion(v => v + 1)
    }}>
      {children}
    </CustomerAddressContext.Provider>
  );
}

export const useCustomerAddressSync = () => useContext(CustomerAddressContext);
