import React from "react";
import TicketCard from "../../../components/ticket/TicketCard";
import { FaBus } from "react-icons/fa";
import { GrRefresh } from "react-icons/gr";

const SearchResult = () => {
  return (
    <div className="w-full col-span-3 space-y-10 pt-11">
      <div className="space-y-6">
        <TicketCard
          icon={FaBus}
          busName={"Juragan Deluxe"}
          routeFrom={"Jakarta"}
          routeTo={"Yogyakarta"}
          arrivalTime={"09.00 AM"}
          departureTime={"10.00 AM"}
          price={"1.000.000"}
          availableSeats={"5"}
        />

        <TicketCard
          icon={FaBus}
          busName={"Juragan Deluxe"}
          routeFrom={"Yogyakarta"}
          routeTo={"Jakarta"}
          arrivalTime={"09.00 AM"}
          departureTime={"10.00 AM"}
          price={"1.000.000"}
          availableSeats={"5"}
        />

        <TicketCard
          icon={FaBus}
          busName={"VIP Deluxe"}
          routeFrom={"Jakarta"}
          routeTo={"Bali"}
          arrivalTime={"09.00 AM"}
          departureTime={"10.00 AM"}
          price={"1.000.000"}
          availableSeats={"5"}
        />

        <TicketCard
          icon={FaBus}
          busName={"VIP Deluxe"}
          routeFrom={"Bali"}
          routeTo={"Jakarta"}
          arrivalTime={"09.00 AM"}
          departureTime={"10.00 AM"}
          price={"1.000.000"}
          availableSeats={"5"}
        />

        <TicketCard
          icon={FaBus}
          busName={"Premium Deluxe"}
          routeFrom={"Palembang"}
          routeTo={"Yogyakarta"}
          arrivalTime={"09.00 AM"}
          departureTime={"10.00 AM"}
          price={"1.000.000"}
          availableSeats={"5"}
        />

        <TicketCard
          icon={FaBus}
          busName={"Premium Deluxe"}
          routeFrom={"Jakarta"}
          routeTo={"Palembang"}
          arrivalTime={"09.00 AM"}
          departureTime={"10.00 AM"}
          price={"1.000.000"}
          availableSeats={"5"}
        />
      </div>

      <div className="w-full flex items-center justify-center">
        <button className="w-fit px-8 py-3 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-xl text-base font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300">
          <GrRefresh />
          Load More
        </button>
      </div>
    </div>
  );
};

export default SearchResult;
