import { useState, useEffect, useRef } from "react";
import Aside from "../components/Aside";
import CodeEditor from "../components/CodeEditor";
import ACTIONS from "../Actions";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import { socketInit } from "../socket";
import { toast } from "react-toastify";

const Editor = () => {
  const [clients, setClients] = useState([]);
  const socketRef = useRef(null);
  const initialCodeRef = useRef();
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const socketErrorHandler = (err) => {
    console.log(err);
    toast.error("Couldn't connect to server, please try again later!");
    navigate("/");
  };

  useEffect(() => {
    const init = async () => {
      socketRef.current = await socketInit();

      //socket error handling
      socketRef.current.on("connect_error", (err) => socketErrorHandler(err));
      socketRef.current.on("connect_failed", (err) => socketErrorHandler(err));

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state.username) {
            toast.success(`${username} has joined the collaboration!`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.CODE_SYNC, {
            code: initialCodeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ username, socketId }) => {
        toast.success(`${username} has left the collaboration room!`);
        setClients((prevState) => {
          return prevState.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current.off(ACTIONS.JOIN);
      // socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.disconnect();
    };
  }, [roomId, location]);

  const syncCodeHandler = (code) => {
    initialCodeRef.current = code;
  };

  return (
    <div className="container-fluid editorWrapper">
      <div className="row">
        <Aside clients={clients} roomId={roomId} />
        <div className="col-md-10 p-0">
          <CodeEditor
            socketRef={socketRef}
            roomId={roomId}
            onSyncCode={syncCodeHandler}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
