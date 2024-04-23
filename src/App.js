import React from "react";
import {
  Route,
  Routes,
  BrowserRouter as Router,
  Navigate,
} from "react-router-dom";
import "./App.css";
import TextEditor from "./components/TextEditor.js";
import { v4 as uuidv4 } from 'uuid';
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={`/document/${uuidv4()}`} />}></Route>
          <Route
            path="/document/:id"
            element={<TextEditor></TextEditor>}
          ></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
