import React from "react";
import RootLayout from "../../../layouts/RootLayout";
import TopSearchCard from "../../../components/topsearch/TopSearchCard";

const TopSearch = () => {
  return (
    <RootLayout className="space-y-8 md:space-y-12 px-4 md:px-0">
      {/* Tag */}
      <div className="w-full flex items-center justify-center text-center">
        <h1 className="text-2xl md:text-3xl text-neutral-800 font-bold">
          Top Search <span className="text-primary">Routes</span>
        </h1>
      </div>

      {/* Top Search tickets routes Card */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <TopSearchCard
          routeFrom={"Jakarta"}
          routeTo={"Yogyakarta"}
          timeDuration={"1 Hours"}
          price={"1.000.000"}
        />
        <TopSearchCard
          routeFrom={"Yogyakarta"}
          routeTo={"Jakarta"}
          timeDuration={"1 Hours"}
          price={"1.000.000"}
        />
        <TopSearchCard
          routeFrom={"Jakarta"}
          routeTo={"Bali"}
          timeDuration={"2 Hours"}
          price={"2.000.000"}
        />
        <TopSearchCard
          routeFrom={"Bali"}
          routeTo={"Jakarta"}
          timeDuration={"2 Hours"}
          price={"2.000.000"}
        />
        <TopSearchCard
          routeFrom={"Aceh"}
          routeTo={"Yogyakarta"}
          timeDuration={"3 Hours"}
          price={"3.000.000"}
        />
        <TopSearchCard
          routeFrom={"Yogyakarta"}
          routeTo={"Aceh"}
          timeDuration={"3 Hours"}
          price={"3.000.000"}
        />
      </div>
    </RootLayout>
  );
};

export default TopSearch;
