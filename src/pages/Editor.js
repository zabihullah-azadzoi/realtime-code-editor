import { useState, useEffect, useRef } from "react";
import Aside from "../components/Aside";
import CodeEditor from "../components/CodeEditor";
import ACTIONS from "../Actions";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { codeCompileHandler } from "../functions/editorFunctions";
import { Circles } from "react-loader-spinner";

import { socketInit } from "../socket";
import { toast } from "react-toastify";

const spinner = (
  <Circles
    height="35"
    width="35"
    color="#fff"
    ariaLabel="circles-loading"
    wrapperStyle={{}}
    wrapperClass=""
    visible={true}
  />
);

const Editor = () => {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("Your Output goes here.");
  const [isProcessing, setIsProcessing] = useState(false);
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

      socketRef.current.on(ACTIONS.OUTPUT_RECEIVED, (output) => {
        setOutput(output);
      });

      socketRef.current.on(ACTIONS.PROCESSING, (processing) => {
        console.log(processing);
        setIsProcessing(processing);
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ username, socketId }) => {
        toast.success(`${username} has left the collaboration room!`);
        setClients((prevState) => {
          return prevState.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off(ACTIONS.PROCESSING);
      socketRef.current.off(ACTIONS.OUTPUT_RECEIVED);
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.disconnect();
    };
  }, [roomId, location]);

  const syncCodeHandler = (code) => {
    initialCodeRef.current = code;
  };

  useEffect(() => {
    // Syncing the output
    if (socketRef.current === null || !output || !roomId) return;
    socketRef.current.emit(ACTIONS.OUTPUT_CHANGED, { output, roomId });

    return () => {
      socketRef.current.off(ACTIONS.OUTPUT_CHANGED);
    };
  }, [output, roomId]);

  useEffect(() => {
    // syncing the processing state
    if (socketRef.current === null || !roomId) return;
    socketRef.current.emit(ACTIONS.PROCESSING, { roomId, isProcessing });

    // return () => {
    //   socketRef.current.off(ACTIONS.PROCESSING);
    // };
  }, [roomId, isProcessing]);

  const runCodeHandler = () => {
    codeCompileHandler(
      initialCodeRef.current,
      getOutputHandler,
      setIsProcessing
    );
  };

  const getOutputHandler = (output) => {
    setOutput(output);
  };

  return (
    <div className="container-fluid editorWrapper">
      <div className="row">
        <Aside clients={clients} roomId={roomId} />
        <div className="col-md-10 p-0 editorContainer m-0">
          <div className="row" style={{ flex: 1 }}>
            <CodeEditor
              socketRef={socketRef}
              roomId={roomId}
              onSyncCode={syncCodeHandler}
              onGetOutput={getOutputHandler}
            />
          </div>
          <div className="row outputWindow m-0">
            <div className="d-flex p-0">
              <button
                onClick={runCodeHandler}
                className="runButton"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="d-flex justify-content-center align-items-center">
                    {spinner}
                  </div>
                ) : (
                  <FontAwesomeIcon icon={faPlay} className="text-light" />
                )}
              </button>
              <textarea className="outputTextarea" value={output} readOnly>
                output
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
