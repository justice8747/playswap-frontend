import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="bg-[#0D0D0D] min-h-screen text-white flex flex-col font-sans selection:bg-[#1DB954] selection:text-black">
      <Navbar />
      {/* Top spacing to account for fixed header */}
      <div className="flex-grow pt-16 flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
