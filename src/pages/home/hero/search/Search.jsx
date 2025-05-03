import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TbArrowsExchange } from "react-icons/tb";
import { FaMapMarkerAlt, FaSearch, FaCalendarAlt } from "react-icons/fa";

const Search = () => {
  // State untuk menyimpan tanggal hari ini dalam format YYYY-MM-DD
  const [today, setToday] = useState("");

  // State untuk tanggal keberangkatan dan kepulangan
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Mengatur tanggal hari ini saat komponen dimuat
  useEffect(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    setToday(formattedDate);
    setDepartureDate(formattedDate);
    setReturnDate(formattedDate);
  }, []);

  // Fungsi untuk menangani perubahan tanggal keberangkatan
  const handleDepartureChange = (e) => {
    setDepartureDate(e.target.value);

    // Jika tanggal kepulangan lebih awal dari keberangkatan yang baru, sesuaikan
    if (returnDate < e.target.value) {
      setReturnDate(e.target.value);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -800 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -800 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className="w-full bg-neutral-50/20 border-2 border-neutral-300 shadow-lg rounded-xl p-5"
    >
      <div className="w-full flex flex-col md:flex-row items-start gap-5">
        {/* From and to input section */}
        <div className="w-full md:w-1/2 flex items-start gap-2 relative">
          {/* From with label */}
          <div className="w-1/2 flex flex-col items-start">
            <div className="text-sm font-medium text-neutral-700 mb-1 text-left">
              From
            </div>
            <div className="w-full h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
              <input
                type="text"
                placeholder="From..."
                className="flex-1 h-full border-none bg-transparent focus:outline-none"
              />
              <div className="w-5 h-5 text-neutral-400">
                <FaMapMarkerAlt className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* To with label */}
          <div className="w-1/2 flex flex-col items-start">
            <div className="text-sm font-medium text-neutral-700 mb-1 text-left">
              To
            </div>
            <div className="w-full h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-5 flex items-center gap-x-1 rounded-lg">
              <input
                type="text"
                placeholder="To..."
                className="flex-1 h-full border-none bg-transparent focus:outline-none"
              />
              <div className="w-5 h-5 text-neutral-400">
                <FaMapMarkerAlt className="w-full h-full" />
              </div>
            </div>
          </div>

          {/* Exchange button */}
          <button className="absolute w-11 h-6 top-1/2 left-1/2 -translate-x-1/2  translate-y-1 rounded-full flex items-center justify-center bg-primary">
            <TbArrowsExchange className="w-6 h-6 text-neutral-50" />
          </button>
        </div>

        {/* Date and button section */}
        <div className="w-full md:w-1/2 flex items-start gap-3">
          {/* Departure Date with label */}
          <div className="w-1/3 flex flex-col items-start">
            <div className="text-sm font-medium text-neutral-700 mb-1 text-left">
              Departure
            </div>
            <div className="w-full h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-3 flex items-center gap-x-1 rounded-lg">
              <input
                type="date"
                id="departure"
                min={today}
                value={departureDate}
                onChange={handleDepartureChange}
                className="flex-1 h-full border-none bg-transparent focus:outline-none"
              />
              {/* <div className="w-4 h-4 text-neutral-400">
                <FaCalendarAlt className="w-full h-full" />
              </div> */}
            </div>
          </div>

          {/* Return Date with label */}
          <div className="w-1/3 flex flex-col items-start">
            <div className="text-sm font-medium text-neutral-700 mb-1 text-left">
              Return
            </div>
            <div className="w-full h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-medium px-3 flex items-center gap-x-1 rounded-lg">
              <input
                type="date"
                id="return"
                min={departureDate}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="flex-1 h-full border-none bg-transparent focus:outline-none"
              />
              {/* <div className="w-4 h-4 text-neutral-400">
                <FaCalendarAlt className="w-full h-full" />
              </div> */}
            </div>
          </div>

          {/* Search button with empty label space */}
          <div className="w-1/3 flex flex-col items-start">
            <div className="text-sm font-medium text-transparent mb-1 text-left">
              &nbsp;
            </div>
            <button className="w-full h-13 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-lg text-base font-medium text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300 cursor-pointer">
              <FaSearch />
              Search
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Search;
