import React, { useCallback, useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./TextEditor.css";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],
  ["link", "image", "video", "formula"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];
const TextEditor = () => {
  const { id: docId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const SET_INTERVAL = 2000;
  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);
  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.once("load-document", (documents) => {
      quill.setContents(documents);
      quill.enable()
    });
    socket.emit("get-document", docId);
  }, [socket, quill, docId]);
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta) => {
      console.log(delta, "receive changes");
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);
  useEffect(() => {
    if (socket == null || quill == null) return;
    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SET_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null);

    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      modules: {
        toolbar: toolbarOptions,
      },
      theme: "snow",
    });
    q.disable()
    q.setText("Loading...")
    setQuill(q);
  }, []);

  return <div ref={wrapperRef} className="container"></div>;
};

export default TextEditor;
