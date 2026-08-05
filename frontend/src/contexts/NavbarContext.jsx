import { createContext, useState } from 'react';

const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [showHamburger, setShowHamburger] = useState(false);
  return (
    <NavbarContext.Provider
      value={{
        showHamburger,
        setShowHamburger,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
};

export default NavbarContext;
