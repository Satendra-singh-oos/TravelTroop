import React, { useEffect, useState } from "react";
// import Perks from "../Perks";
// import PhotosUploader from "../PhotosUploader";
// import AccountNav from "../AccountNav";
import PhotosUploader from "../components/PhotosUploader";
import Perks from "../components/Perks";
import AccountNav from "../components/AccountNav";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";

const PlacesFormPage = () => {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [address, setAddres] = useState("");
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get("/places/" + id).then((response) => {
      const { data } = response;
      setTitle(data.title);
      setAddres(data.address);
      setAddedPhotos(data.photos);
      setDescription(data.description);
      setPerks(data.perks);
      setExtraInfo(data.extraInfo);
      setCheckIn(data.checkIn);
      setCheckOut(data.checkOut);
      setMaxGuests(data.maxGuests);
      setPrice(data.price);
    });
  }, [id]);

  const inputHeader = (text) => {
    return <h2 className="text-2xl mt-4">{text}</h2>;
  };

  const inputDescription = (text) => {
    return <p className="text-gray-500 text-sm">{text}</p>;
  };

  const preInput = (header, description) => {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  };

  const savePlace = async (e) => {
    e.preventDefault();
    const placeData = {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    };

    if (id) {
      //update
      await axios.put("/places", {
        id,
        ...placeData,
      });
      setRedirect(true);
    } else {
      //new place
      await axios.post("/places", {
        ...placeData,
      });
      // console.log(placeData);
      setRedirect(true);
    }
  };

  if (redirect) {
    return <Navigate to={"/account/places"} />;
  }
  return (
    <>
      <div>
        <AccountNav />
        <form onSubmit={savePlace}>
          {/* Title */}
          {preInput(
            "Title",
            " Title for your place, should be short and catch as in advertisment"
          )}
          <input
            type="text"
            placeholder="title , for example: Your lovely stay here in home. "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {/* Address */}

          {preInput("Address", "Address of this place")}
          <input
            type="text"
            placeholder="address"
            value={address}
            onChange={(e) => setAddres(e.target.value)}
          />

          {/* Photo's */}

          {preInput("Photos", "  Photos of your place(More Photos = better)")}
          <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

          {/* Description */}
          {preInput("Description", "Description of the place")}

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Perks */}

          {preInput("Perks", " select all the perks of your place")}
          <Perks selected={perks} onChange={setPerks} />

          {/* extraInfo */}
          {preInput(
            "Extra info",
            " Any Extra Information like house rules,etc.."
          )}

          <textarea
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
          />

          {/* checkIn CheckOut MaxGuests */}
          {preInput(
            "Check In & Out Times ,Max guests",
            "add check in and out times,remember to ahve some time widnow for cleaning of the room between guests.."
          )}

          <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="mt-2 -mb-1 ">Check in time</h3>
              <input
                type="text"
                placeholder="Check In Time (4:00PM-IST)"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div>
              <h3 className="mt-2 -mb-1 ">Check out time</h3>
              <input
                type="text"
                placeholder="Check Out Time (4:00AM-IST)"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <div>
              <h3 className="mt-2 -mb-1 ">Max Guest's</h3>
              <input
                type="number"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
              />
            </div>
            <div>
              <h3 className="mt-2 -mb-1 ">Price Per night</h3>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <button className="primary my-4">Submit</button>
        </form>
      </div>
    </>
  );
};

export default PlacesFormPage;
