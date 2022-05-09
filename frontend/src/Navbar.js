//packages
import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

//Components
import Logo from "./Logo";

//CSS
import "./styles/Navbar.css";

//Icons
import { IoClipboardSharp } from "react-icons/io5";

function Navbar(props) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
  }, []);

  function handleSignOut() {
    signOut(auth)
      .then(() => {
        // console.log("Signed Out");
      })
      .catch((err) => console.log(err));
  }

  return (
    <div
      className="navbar"
      style={{
        padding: props.padding,
        boxShadow: props.boxShadow,
        zIndex: props.zIndex,
      }}
    >
      {/* Logo */}
      {props.isProjectPage === true ? (
        <Logo isProjectPage={true} closeCamera={props.closeCamera} />
      ) : (
        <Logo />
      )}

      {/* Project Name (if it's project page) */}
      {props.ProjectName && (
        <div className="navbar_options_middle">
          <h3>{props.ProjectName}</h3>
        </div>
      )}

      {/* Sign In / Sign Out / Get Started*/}
      <div className="navbar_options">
        {props.showProjectOptions && (
          <div className="navbar_project_options">
            <div className="navbar_project_id">
              <button
                onClick={() => {
                  document
                    .querySelector(".navbar_pro_id_section")
                    .classList.toggle("hide");
                }}
              >
                Show Id
              </button>
              <p className="navbar_pro_id_section hide">
                <span className="pro_id">{props.projectID}</span>
                <span
                  className="copy_icon"
                  onClick={() => {
                    document
                      .querySelector(".navbar_pro_id_section")
                      .classList.toggle("hide");

                    navigator.clipboard.writeText(
                      document.querySelector(".pro_id").innerHTML
                    );
                  }}
                >
                  <IoClipboardSharp />
                </span>
              </p>
            </div>
            <button onClick={props.loadPrevCode}>Load Previous Code</button>
            <button onClick={props.saveProject}>Save</button>
          </div>
        )}
        {currentUser !== null && props.showGetStarted === true && (
          <button
            onClick={() => {
              navigate("/user");
            }}
            className="nav_get_started_button"
          >
            Get Started
          </button>
        )}

        {currentUser === null && (
          <button onClick={props.openAuthSection}>Sign In</button>
        )}

        {currentUser !== null && (
          <div
            onClick={() => {
              handleSignOut();
              if (props.isProjectPage === true) {
                props.closeCamera();
              }
            }}
            className="navbar_useroptions"
          >
            <p className="navbar_username">
              Hey,{"  "}
              <span>
                {currentUser?.email.substring(
                  0,
                  currentUser?.email.indexOf("@")
                )}
              </span>
            </p>
            <p className="navbar_signout">Sign Out</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
