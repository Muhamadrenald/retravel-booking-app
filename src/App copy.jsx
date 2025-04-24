import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Footer from "./components/footer/Footer";
import Ticket from "./pages/ticket/Ticket";
import Detail from "./pages/ticket/detail/Detail";
import Checkout from "./pages/ticket/checkout/Checkout";
import Invoice from "./pages/ticket/invoice/Invoice";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <>
      <Router>
        {/* <main className="w-full flex flex-col bg-neutral-50 min-h-screen"> */}
        <main className="">
          {/* Navbar */}
          <Navbar />

          {/* Routing */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/bus-tickets" element={<Ticket />} />
            <Route path="/bus-tickets/payment" element={<Invoice />} />

            {/* Login */}
            <Route path="/login" element={<Login />} />
            {/* Register */}
            <Route path="/register" element={<Register />} />

            {/* Detail */}
            <Route path="/bus-tickets/detail" element={<Detail />} />

            {/* Protected Route */}
            <Route element={<ProtectedRoute />}>
              <Route path="/bus-tickets/checkout" element={<Checkout />} />
            </Route>
          </Routes>

          {/* Footer */}
          <Footer />
        </main>
      </Router>
    </>
  );
};

export default App;
