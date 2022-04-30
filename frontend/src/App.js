import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Components
import Home from "./Home";
import UserScreen from "./UserScreen";
import Project from "./Project";

// Styles
import "./styles/App.css";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="user" element={<UserScreen />} />
          <Route path="project" element={<Project />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
