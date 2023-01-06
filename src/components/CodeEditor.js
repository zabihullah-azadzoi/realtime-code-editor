import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import ACTIONS from "../Actions";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/runmode/colorize";

const CodeEditor = ({ socketRef, roomId, onSyncCode }) => {
  let codeMirrorRef = useRef(null);
  useEffect(() => {
    const codeMirror = async () => {
      codeMirrorRef.current = CodeMirror.fromTextArea(
        document.getElementById("textArea"),
        {
          lineNumbers: true,
          mode: { name: "javascript", json: true },
          theme: "material",
          autoCloseTags: true,
          autoCloseBrackets: true,
          colorize: true,
          lineWrapping: true,
        }
      );

      // listening for code mirror's changes using ref hook
      codeMirrorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onSyncCode(code);

        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
        }
      });
    };

    codeMirror();
  }, []);

  // syncing the receiving code
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !codeMirrorRef.current) return;
    socket.on(ACTIONS.CODE_CHANGE, (code) => {
      codeMirrorRef.current.setValue(code);
    });

    // syncing the existing code after joining
    socket.on(ACTIONS.CODE_SYNC, (code) => {
      if (code !== null) {
        codeMirrorRef.current.setValue(code);
      }
    });

    return () => {
      socket.off(ACTIONS.CODE_CHANGE);
      socket.off(ACTIONS.CODE_SYNC);
    };
  }, [socketRef.current]);

  return <textarea id="textArea" className="codeMirror"></textarea>;
};

export default CodeEditor;
