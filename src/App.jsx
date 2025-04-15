import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/home/Home";
import About from "./pages/about/About";

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
          </Routes>
          {/* Footer */}
        </main>
      </Router>
    </>
  );
};

export default App;
