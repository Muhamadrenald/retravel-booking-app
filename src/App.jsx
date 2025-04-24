import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Ticket from "./pages/ticket/Ticket";
import Detail from "./pages/ticket/detail/Detail";
import Checkout from "./pages/ticket/checkout/Checkout";
import Invoice from "./pages/ticket/invoice/Invoice";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          {/* Auth routes - tanpa navbar dan footer */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main routes - dengan navbar dan footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/bus-tickets" element={<Ticket />} />
            <Route path="/bus-tickets/detail" element={<Detail />} />
            <Route path="/bus-tickets/payment" element={<Invoice />} />

            {/* Protected Route */}
            <Route element={<ProtectedRoute />}>
              <Route path="/bus-tickets/checkout" element={<Checkout />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer /> {/* Untuk react-toastify */}
      </Router>
    </>
  );
};

export default App;
