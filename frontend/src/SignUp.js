import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// --------------- firebase ---------------
import { auth } from "./firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

function SignUp() {
  const navigate = useNavigate();
  const signUpEmail = useRef();
  const signUpPass = useRef();
  const signInEmail = useRef();
  const signInPass = useRef();

  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User SignedIn ", user);
        const uid = user.uid;
        navigate("/home");

        // ...
      } else {
        // User is signed out
        // ...
        console.log("User signout");
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
        console.log(userCredentials.user);
        // setCurrentUser(userCredentials.user.email);
      })
      .catch((error) => {
        console.log(error);
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  }

  function handleSignIn() {
    signInWithEmailAndPassword(
      auth,
      signInEmail.current.value,
      signInPass.current.value
    )
      .then((userCredentials) => {
        console.log(userCredentials.user);
        // setCurrentUser(userCredentials.user.email);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleSignOut() {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("signed out");
        // setCurrentUser("No-Name");
      })
      .catch((error) => {
        // An error happened.
      });
  }

  return (
    <div>
      <div>
        {/* Signup features */}
        <input ref={signUpEmail} type="email" placeholder="email" />
        <input ref={signUpPass} type="password" placeholder="password" />
        <button onClick={handleSignUp}>Sign Up</button>
      </div>

      <br />

      <div>
        {/* SignIn features */}
        <input ref={signInEmail} type="email" placeholder="email" />
        <input ref={signInPass} type="password" placeholder="password" />
        <button onClick={handleSignIn}>Sign In</button>
      </div>

      <br />

      <div>
        <button onClick={handleSignOut}>SignOut</button>
      </div>

      <div>
        <h1>User: {currentUser}</h1>
        <button
          onClick={() => {
            console.log(auth.currentUser);
            setCurrentUser(auth.currentUser?.email);
          }}
        >
          See Current User
        </button>
      </div>
    </div>
  );
}

export default SignUp;
