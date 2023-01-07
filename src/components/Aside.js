import Avatar from "react-avatar";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Aside = ({ clients, roomId }) => {
  const navigate = useNavigate();

  const copyRoomIdHandler = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    }
  };

  const leaveRoomHandler = () => {
    navigate("/");
    toast.success("You left the collaborating room!");
  };

  return (
    <div className="col-md-2 aside d-flex flex-column">
      <img src="/logo.png" alt="logo" className="w-100 mt-3 mb-3" />
      <hr />

      <p className="font-weight-bold">Connected Geeks</p>
      <div
        style={{
          flex: 1,
        }}
      >
        <div
          className="d-flex flex-wrap justify-content-between"
          style={{ gap: "1.5rem" }}
        >
          {clients.map((client) => {
            return (
              <div
                className="d-flex flex-column mt-2 align-items-center"
                key={client.socketId}
              >
                <Avatar round={"15px"} name={client.username} size={55} />
                <span>{client.username}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className=" mb-3 ">
        <button className="btn btn-light w-100" onClick={copyRoomIdHandler}>
          Copy Room ID
        </button>
        <button
          className="btn btn-success w-100 mt-3"
          onClick={leaveRoomHandler}
        >
          Leaves
        </button>
      </div>
    </div>
  );
};

export default Aside;
