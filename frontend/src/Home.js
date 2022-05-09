//packages
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

//Components
import Navbar from "./Navbar";

//Styles
import "./styles/Home.css";

//icons
import { BsArrowLeft } from "react-icons/bs";

function Home() {
  const navigate = useNavigate();
  const signUpEmail = useRef();
  const signUpPass = useRef();
  const signInEmail = useRef();
  const signInPass = useRef();

  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log("User SignedIn ", user);
        const uid = user.uid;

        setCurrentUser(user);

        // ...
      } else {
        // User is signed out
        // ...
        // console.log("User signout");
        setCurrentUser(null);
      }
    });
  }, []);

  function handleSignUp() {
    createUserWithEmailAndPassword(
      auth,
      signUpEmail.current.value,
      signUpPass.current.value
    )
      .then((userCredentials) => {
        // console.log(userCredentials.user);
        // setCurrentUser(userCredentials.user.email);
        navigate("/user");
      })
      .catch((error) => {
        // console.log(error);
        // const errorCode = error.code;
        // const errorMessage = error.message;
        document.querySelector(".signup_error").innerHTML =
          "Error: " +
          error.message
            .replace("Firebase: Error (auth/", "")
            .replace(")", "")
            .replaceAll("-", " ");
        // ..
      });

    signUpEmail.current.value = "";
    signUpPass.current.value = "";
  }

  function handleSignIn() {
    signInWithEmailAndPassword(
      auth,
      signInEmail.current.value,
      signInPass.current.value
    )
      .then((userCredentials) => {
        // console.log(userCredentials.user);
        navigate("/user");
        // setCurrentUser(userCredentials.user.email);
      })
      .catch((error) => {
        // console.log(error);
        document.querySelector(".signin_error").innerHTML =
          "Error: " +
          error.message
            .replace("Firebase: Error (auth/", "")
            .replace(")", "")
            .replaceAll("-", " ");
      });

    signInEmail.current.value = "";
    signInPass.current.value = "";
  }

  function openAuthSection() {
    document.querySelector(".home_banner").style.width = "0";
    document.querySelector(".home_auth_section").style.width = "100%";
    document.querySelector(".home_auth_section").style.height = "100%";
  }

  function closeAuthSection() {
    document.querySelector(".home_banner").style.width = "100%";
    document.querySelector(".home_auth_section").style.width = "0";
    document.querySelector(".home_auth_section").style.height = "0";
  }

  return (
    <div className="home">
      <Navbar showGetStarted={true} openAuthSection={openAuthSection} />

      {/* <div
        style={{
          backgroundColor: "#0568fd",
          width: "500px",
          height: "500px",
          right: "0",
          bottom: "0",
          zIndex: "-1",
          position: "absolute",
        }}
      ></div>

      <div
        style={{
          backgroundColor: "#0568fd",
          width: "600px",
          height: "400px",
          borderTopRightRadius: "50px",
          borderBottomRightRadius: "50px",
          left: "0",
          bottom: "150px",
          zIndex: "-1",
          position: "absolute",
        }}
      ></div> */}

      <div className="home_content">
        {/* Introduction Banner */}
        <div className="home_banner">
          <div className="home_banner_text">
            <h1>The New Way of Pair Programming</h1>
            <p>
              Unleash the power of Pair Programming with our{" "}
              <span
                style={{
                  borderBottom: "1px solid black",
                  paddingBottom: "2px",
                }}
              >
                Robust IDE
              </span>{" "}
              and built in{" "}
              <span
                style={{
                  borderBottom: "1px solid black",
                  paddingBottom: "2px",
                }}
              >
                Video Chat
              </span>{" "}
              Feature.
            </p>
          </div>
          <div className="home_banner_img_container">
            <img src="/images/codelit_img_1.svg" />
          </div>

          <div>
            {currentUser !== null ? (
              <button
                onClick={() => {
                  navigate("/user");
                }}
              >
                Get Started
              </button>
            ) : (
              <button onClick={openAuthSection}>Sign In</button>
            )}
          </div>
        </div>

        {/* Authentication Section */}
        <div className="home_auth_section">
          <div className="home_auth_cards_container">
            <div className="home_auth_card">
              <p>Don't have an Account?</p>
              <input ref={signUpEmail} type="email" placeholder="email" />
              <input ref={signUpPass} type="password" placeholder="password" />
              <button onClick={handleSignUp}>Sign Up</button>

              <p className="signup_error error_message"></p>
            </div>

            <div className="home_auth_card">
              <p>Already have an account?</p>
              <input ref={signInEmail} type="email" placeholder="email" />
              <input ref={signInPass} type="password" placeholder="password" />
              <button onClick={handleSignIn}>Sign In</button>

              <p className="signin_error error_message"></p>
            </div>
          </div>
          <button className="home_auth_back" onClick={closeAuthSection}>
            <BsArrowLeft />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
