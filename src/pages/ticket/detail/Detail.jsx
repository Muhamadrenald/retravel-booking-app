import React from "react";
import TopLayout from "../../../layouts/toppage/TopLayout";
import RootLayout from "../../../layouts/RootLayout";
import { Link } from "react-router-dom";
import WarningAlert from "../../../components/alertmessage/WarningAlert";
import BusSeat from "./seat/busseat/BusSeat";
import ToggleBtn from "../../../components/togglebtn/ToggleBtn";
import Amenities from "./amenities/Amenities";
import ReservationPolicy from "./reservationpolicy/ReservationPolicy";
import BusImage from "./busimage/BusImage";

const Detail = () => {
  // show the warning message box
  const message = (
    <>
      One individual only can book 10 seats. If you want to book more than 10
      seats, Please{" "}
      <Link to={"/support-team"} className="text-yellow-700 font-medium">
        Contact our support team
      </Link>
      .
    </>
  );

  return (
    <div className="w-full space-y-12 pb-16">
      {/*Top Layout  */}
      <TopLayout
        bgImg={
          "https://cdn.pixaby.com/photo/2020/09/21/11/41/bus-5589826_1280.jpg"
        }
        title={"Bus Details"}
      />

      <RootLayout className="space-y-12 w-full pb-16">
        {/* seat layout and selection action detail */}
        <div className="w-full space-y-8">
          {/* Warning Message */}
          <WarningAlert message={message} />

          {/* Seat Layout */}
          <BusSeat />
        </div>

        {/* Bus Detail */}
        <div className="w-full flex items-center justify-center flex-col gap-8 text-center">
          {/* Short Description */}
          <p className="text-base text-neutral-500 font-normal text-justify">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vel
            repudiandae accusamus magni excepturi in consectetur cumque suscipit
            a nobis facere? Lorem ipsum dolor sit amet consectetur adipisicing
            elit. Sunt vel rem esse quia praesentium! Tenetur dicta magnam
            perferendis rerum impedit.
            <span className="text-lg text-neutral-600 font-medium ml-2">
              Want to see more about the bus?
            </span>
          </p>

          {/* Button */}
          <div className="w-full flex items-center justify-center gap-6 flex-col">
            <ToggleBtn
              buttonText={"See Bus Details"}
              buttonTextHidden={"Hide Bus Details"}
            >
              <div className="w-full space-y-10">
                {/* reservation policy and amenities */}
                <div className="w-full grid grid-cols-7 gap-20">
                  {/* Amenities */}
                  <Amenities />

                  {/* Reservation Policy */}
                  <ReservationPolicy />
                </div>

                {/* bus images */}
                <BusImage />
              </div>
            </ToggleBtn>
          </div>
        </div>
      </RootLayout>
    </div>
  );
};

export default Detail;
