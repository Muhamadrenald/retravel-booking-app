import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

const MainLayout = () => {
  const location = useLocation();
  console.log("MainLayout rendered, path:", location.pathname); // Debug log

  useEffect(() => {
    console.log("MainLayout useEffect, current path:", location.pathname); // Debug log
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[8ch]">
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default MainLayout;
