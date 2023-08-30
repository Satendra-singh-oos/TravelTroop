import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import AddressLink from "../AddressLink";
// import PlaceGallery from "../PlaceGallery";
import BookingDates from "../components/BookingDates";
import AddressLink from "../components/AddressLink";
import PlaceGallery from "../components/PlaceGallery";

const BookingPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  useEffect(() => {
    if (id) {
      axios.get("/bookings").then((response) => {
        const foundBooking = response.data.find(({ _id }) => _id === id);
        if (foundBooking) {
          setBooking(foundBooking);
        }
      });
    }
  }, [id]);

  if (!booking) {
    return "";
  }

  return (
    <div className="my-8">
      <h1 className="text-3xl">{booking.place.title}</h1>
      <AddressLink className="my-2 block">{booking.place.address}</AddressLink>
      <div className="bg-gray-200 p-6 my-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-4">Your Booking Information</h2>
          <BookingDates booking={booking} />
        </div>
        <div className="bg-primary p-6 text-white rounded-2xl">
          <div>Total Price</div>
          <div className="text-3xl">₹ {booking.price}</div>
        </div>
      </div>
      <PlaceGallery place={booking.place} />

      <div className="my-4 ">
        <h2 className="font-semibold text-2xl">Description</h2>
        {booking.place.description}
      </div>

      <div className="bg-white -mx-8 px-8 py-8 border-t">
        <div>
          <h2 className="font-semibold text-2xl">Extra Info</h2>
        </div>
        <div className="mb-4 mt-1 text-sm text-gray-700 leading-5">
          {booking.place.extraInfo}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
