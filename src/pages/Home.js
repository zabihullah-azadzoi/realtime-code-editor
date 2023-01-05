import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const generateIdHandler = () => {
    setRoomId(uuidv4());
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    if (roomId === "" || username === "") {
      return toast.error("Room ID and Username are required!");
    }
    navigate(`/editor/${roomId}`, { state: { username } });
    toast.success("New Room is created.");
  };

  return (
    <div className="homeWrapper d-flex justify-content-center flex-column">
      <div className="joinForm col-md-4 offset-md-4 p-3">
        <img className="w-50 mb-4" src="/logo.png" alt="app logo" />
        <form className="form clearfix" onSubmit={joinRoomHandler}>
          <label className="text-light mb-2">Paste invitation ROOM ID:</label>
          <input
            className="form-control mb-2 fw-bold"
            placeholder="ROOM ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            className="form-control mb-2 fw-bold"
            placeholder="USER NAME"
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="btn  btn-success mt-2 float-end">JOIN</button>
        </form>
        <p className="text-light mt-3 text-center">
          If you don't have an invitation then create{" "}
          <button
            href=""
            className="text-success newRoomAnchor"
            onClick={generateIdHandler}
          >
            new Room
          </button>
        </p>
      </div>
      <footer className="footer">
        <p>Made with {"\uD83D\uDC9B"} by Zabihullah Azadzoi</p>
      </footer>
    </div>
  );
};

export default Home;
