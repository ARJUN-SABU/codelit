import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Components
import SignUp from "./SignUp";
import Home from "./Home";
import Project from "./Project";

// Styles
import "./styles/App.css";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<SignUp />} />
          <Route path="home" element={<Home />} />
          <Route path="project" element={<Project />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
