import React, { useState, useEffect, useRef } from "react";
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

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, []);

  // syncing the receiving code
  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on(ACTIONS.CODE_CHANGE, (code) => {
      codeMirrorRef.current.setValue(code);
    });

    // syncing the existing code after joining
    socketRef.current.on(ACTIONS.CODE_SYNC, (code) => {
      codeMirrorRef.current.setValue(code);
    });
  }, [socketRef.current]);

  return <textarea id="textArea" className="codeMirror"></textarea>;
};

export default CodeEditor;
