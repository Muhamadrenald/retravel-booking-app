import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[8ch]">
        {/* <div className="min-h-screen"> */}
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
