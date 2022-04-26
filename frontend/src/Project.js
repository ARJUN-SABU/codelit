import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Peer from "peerjs";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

//Components
import Logo from "./Logo";

//CSS
import "./styles/Project.css";

//Icons
import { FiMinus, FiPlus } from "react-icons/fi";
import {
  BsFillMicFill,
  BsFillMicMuteFill,
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
} from "react-icons/bs";

function Project() {
  const divider = useRef();
  const socket = io("http://localhost:3001");
  // const socket = io("https://code-lit.herokuapp.com/");

  const mySocketId = useRef();
  const friendSocketId = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const peer = new Peer(`${location.state.myPeerId}`);
  // const peer = new Peer();
  const [myPeerId, setMyPeerId] = useState("");
  const friendPeerId = useRef();
  const myVideo = useRef();
  const friendVideo = useRef();

  const stream_1 = useRef(null);
  const stream_2 = useRef(null);
  const stream_3 = useRef(null);

  const [muted, setMuted] = useState(true);
  const [videoPlay, setVideoPlay] = useState(true);

  const [fireStoreUID, setFireStoreUID] = useState("");

  useEffect(() => {
    window.onpopstate = (e) => {
      //onpopstate is fired when the history changes
      //when the back button is pressed, so I manually close
      //the camera as it wasn't closing on its own.
      console.log("back-button-pressed");
      stream_1.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User SignedIn ", user);
        // console.log(user.uid);
        const uid = user.uid;
        setFireStoreUID(uid);

        if (location.state.loadProject == true) {
          let docRef = doc(db, uid, location.state.projectName);
          getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
              console.log("Document data:", docSnap.data());
              document.querySelector(".html_code").value =
                docSnap.data().html_code;
              document.querySelector(".css_code").value =
                docSnap.data().css_code;
              document.querySelector(".js_code").value = docSnap.data().js_code;

              displayOutput();
            } else {
              // doc.data() will be undefined in this case
              console.log("No such document!");
            }
          });
        }
        // ...
      } else {
        // User is signed out
        // ...
        console.log("User signout");
        navigate("/");
      }
    });
  }, []);

  // async function loadDoc(uid) {
  //   let docRef = doc(db, uid, location.state.projectName);
  //   let docSnap = await getDoc(docRef);
  //   return docSnap;
  // }

  //--------------------Logic for handling simultaneous code editing by 2 participants--------------------
  useEffect(() => {
    socket.on("place-key", (data) => {
      let textBox = document.querySelector(`.${data.textBoxName}`);
      let content = textBox.value;
      let position = textBox.selectionStart;

      let idx = 0;
      if (data.cursorPositionFromStart < position) {
        idx = data.cursorPositionFromStart;
      } else {
        idx = content.length - data.cursorPositionFromEnd;
      }

      let new_content = "";

      if (data.key == "Backspace") {
        if (data.rangeStart != data.rangeEnd) {
          new_content =
            content.substring(0, data.rangeStart) +
            content.substring(data.rangeEnd);
          textBox.value = new_content;
          if (data.rangeEnd < position) {
            let diff = data.rangeEnd - data.rangeStart;
            textBox.setSelectionRange(position - diff, position - diff);
          } else if (position >= data.rangeStart && position <= data.rangeEnd) {
            textBox.setSelectionRange(data.rangeStart, data.rangeStart);
          } else {
            //if data.rangeStart > position
            textBox.setSelectionRange(position, position);
          }
        } else {
          new_content = content.substring(0, idx - 1) + content.substring(idx);
          textBox.value = new_content;
          if (data.cursorPositionFromStart < position) {
            textBox.setSelectionRange(position - 1, position - 1);
          } else {
            textBox.setSelectionRange(position, position);
          }
        }
      } else {
        if (data.key == "Tab") {
          new_content =
            content.substring(0, idx) + "  " + content.substring(idx);
          textBox.value = new_content;
          if (data.cursorPositionFromStart < position) {
            textBox.setSelectionRange(position + 2, position + 2);
          } else {
            textBox.setSelectionRange(position, position);
          }
        } else if (data.key == "Enter") {
          new_content =
            content.substring(0, idx) + "\n" + content.substring(idx);
          textBox.value = new_content;
          if (data.cursorPositionFromStart < position) {
            textBox.setSelectionRange(position + 1, position + 1);
          } else {
            textBox.setSelectionRange(position, position);
          }
        } else {
          new_content =
            content.substring(0, idx) + data.key + content.substring(idx);
          textBox.value = new_content;
          if (data.cursorPositionFromStart < position) {
            textBox.setSelectionRange(position + 1, position + 1);
          } else {
            textBox.setSelectionRange(position, position);
          }
        }
      }

      displayOutput();
    });

    socket.on("handle-paste", (data) => {
      // let textBox = document.querySelector("textarea");
      let textBox = document.querySelector(`.${data.textBoxName}`);

      let content = textBox.value;
      let position = textBox.selectionStart;

      let new_content =
        content.substring(0, data.rangeStart) +
        data.body +
        content.substring(data.rangeEnd);
      textBox.value = new_content;

      if (data.rangeEnd < position) {
        //first selection from data.rangeStart to data.rangeEnd
        //will be removed from the content, so my current position will
        //shift backward by (data.rangeEnd - data.rangeStart). Then,
        //at rangeEnd, new content of length data.body.length will be
        //added, so my cursor will move ahead by the much amount.
        let idx =
          position - (data.rangeEnd - data.rangeStart) + data.body.length;
        textBox.setSelectionRange(idx, idx);
      } else if (position >= data.rangeStart && position <= data.rangeEnd) {
        let idx = data.rangeStart + data.body.length;
        textBox.setSelectionRange(idx, idx);
      } else {
        //if data.rangeStart > position
        //then, my cursor won't change
        textBox.setSelectionRange(position, position);
      }

      displayOutput();
    });

    socket.on("load-code", (data) => {
      let html = document.querySelector(".html_code");
      let css = document.querySelector(".css_code");
      let js = document.querySelector(".js_code");

      html.value = data.html_code;
      css.value = data.css_code;
      js.value = data.js_code;

      displayOutput();
    });
  }, []);

  let keyMap = {};
  function handleKeyDown(event) {
    // let textBox = document.querySelector("textarea");
    let textBox = event.target;

    let start = textBox.selectionStart;
    let end = textBox.selectionEnd;
    let n = textBox.value.length;

    keyMap[event.key] = event.type == "keydown";

    if (
      event.key == "Shift" ||
      event.key == "CapsLock" ||
      event.key == "ArrowLeft" ||
      event.key == "ArrowUp" ||
      event.key == "ArrowDown" ||
      event.key == "ArrowRight" ||
      event.key == "Escape" ||
      event.key == "Delete" ||
      event.key == "Control" ||
      event.key == "Alt" ||
      event.key == "Meta" ||
      (event.keyCode >= 112 && event.keyCode <= 123) ||
      (event.keyCode >= 144 && event.keyCode <= 145)
    ) {
      return;
    }

    if ((keyMap["Control"] || keyMap["Meta"]) && keyMap["v"]) {
      //paste event is handled separately
      return;
    }

    if ((keyMap["Control"] || keyMap["Meta"]) && keyMap["c"]) {
      return;
    }

    if ((keyMap["Control"] || keyMap["Meta"]) && keyMap["r"]) {
      //referesh event
      return;
    }

    if ((keyMap["Control"] || keyMap["Meta"]) && keyMap["a"]) {
      return;
    }

    if ((keyMap["Control"] || keyMap["Meta"]) && keyMap["x"]) {
      return;
    }
    if ((keyMap["Control"] || keyMap["Meta"]) && keyMap["z"]) {
      event.preventDefault();
      // console.log(
      //   (event.clipboardData || window.clipboardData).getData("text")
      // );
      return;
    }

    if (event.key == "Tab") {
      event.preventDefault();
      let newContent =
        textBox.value.substring(0, start) +
        "  " +
        textBox.value.substring(start);

      textBox.value = newContent;
      textBox.setSelectionRange(start + 2, start + 2);
    }

    socket.emit("place-key", {
      cursorPositionFromStart: start,
      cursorPositionFromEnd: n - start,
      rangeStart: start,
      rangeEnd: end,
      key: event.key,
      textBoxName: textBox.classList[0],
      friendSocketId: friendSocketId.current,
    });
  }

  function handleKeyUp(event) {
    keyMap[event.key] = event.type == "keydown";
    // console.log(keyMap);
  }

  function handlePaste(event) {
    // let textBox = document.querySelector("textarea");
    let textBox = event.target;

    let data = {
      rangeStart: textBox.selectionStart,
      rangeEnd: textBox.selectionEnd,
      body: (event.clipboardData || window.clipboardData).getData("text"),
      textBoxName: textBox.classList[0],
      friendSocketId: friendSocketId.current,
    };

    // console.log(data);

    socket.emit("handle-paste", data);
  }

  function handleCut(event) {
    // let textBox = document.querySelector("textarea");
    let textBox = event.target;

    let start = textBox.selectionStart;
    let end = textBox.selectionEnd;
    let n = textBox.value.length;

    if (start != end) {
      //then only cut operation should be performed as a backspace operation
      //otherwise single characters will be deleted each time ctrl + x is pressed.
      socket.emit("place-key", {
        cursorPositionFromStart: start,
        cursorPositionFromEnd: n - start,
        rangeStart: start,
        rangeEnd: end,
        key: "Backspace",
        textBoxName: textBox.classList[0],
        friendSocketId: friendSocketId.current,
      });
    }
  }

  //--------------------Logic For Resizable Coding Window Layout------------
  function handleMouseDownCol(event) {
    divider.current = event.target;
    document.addEventListener("mousemove", handleMouseMoveCol);
    document.addEventListener("mouseup", handleMouseUpCol);
  }

  function handleMouseMoveCol(event) {
    //disable clickable nature of the iframe as when the pointer
    //moves over the iframe object, since the iframe is a separate
    //document itself, therefore, our mousemove event stops working
    //so, when, movement starts, make the pointerEvents none for the
    //iframe, and when the mouoseup happens in our root document,
    //make that iframe clickable again, that is enable all the pointer
    //events.
    document.querySelector("iframe").style.pointerEvents = "none";

    let new_x = event.clientX;
    let prev_x = divider.current._clientX || event.clientX;

    //we are just making and setting a new property called _clientX
    //in the current divider to store the new x coordinate.
    divider.current._clientX = new_x;

    let diff = new_x - prev_x;

    let sib_1 = divider.current.previousElementSibling;
    let sib_2 = divider.current.nextElementSibling;

    // console.log(sib_1.offsetWidth, sib_2);

    if (diff < 0) {
      //left movement
      let width = Math.round(sib_1.offsetWidth + diff);
      //shrink sibling 1 to only (width)px width
      //and grow sibling 2, so that it takes as much space as available.
      sib_1.style.flex = `0 ${width < 10 ? 0 : width}px`;
      sib_2.style.flex = `1 0`;
    } else {
      //right movement
      let width = Math.round(sib_2.offsetWidth - diff);
      sib_2.style.flex = `0 ${width < 10 ? 0 : width}px`;
      sib_1.style.flex = `1 0`;
    }
  }

  function handleMouseUpCol() {
    document.querySelector("iframe").style.pointerEvents = "auto";
    document.removeEventListener("mousemove", handleMouseMoveCol);
    document.removeEventListener("mouseup", handleMouseUpCol);
  }

  function handleMouseDownRow(event) {
    divider.current = event.target;
    divider.current._clientY = null;
    document.addEventListener("mousemove", handleMouseMoveRow);
    document.addEventListener("mouseup", handleMouseUpRow);
  }

  function handleMouseMoveRow(event) {
    let new_y = event.clientY;
    let prev_y = divider.current._clientY || event.clientY;

    //we are just making and setting a new property called _clientX
    //in the current divider to store the new x coordinate.
    divider.current._clientY = new_y;

    let diff = new_y - prev_y;

    let sib_1 = divider.current.previousElementSibling;
    let sib_2 = divider.current.nextElementSibling;

    //before moving the divider between sib_1 & sib_2
    //first fix the height of the 3rd sibling
    //that is shrink to a fixed height first.
    if (sib_1.classList.contains("project_left_top")) {
      let bottom_box = document.querySelector(".project_left_bottom");
      let fixed_height = Math.round(bottom_box.offsetHeight);
      bottom_box.style.flex = `0 ${fixed_height}px`;
    } else if (sib_1.classList.contains("project_left_middle")) {
      let top_box = document.querySelector(".project_left_top");
      let fixed_top_height = Math.round(top_box.offsetHeight);
      console.log(fixed_top_height);
      top_box.style.flex = `0 ${fixed_top_height}px`;
    }

    //now change the heights of sib_1 and sib_2.
    if (diff < 0) {
      //top movement
      let height = Math.round(sib_1.offsetHeight + diff);
      //shrink sibling 1 to only (width)px width
      //and grow sibling 2, so that it takes as much space as available.
      sib_1.style.flex = `0 ${height < 10 ? 0 : height}px`;
      sib_2.style.flex = `1 0`;
    } else {
      //bottom movement
      let height = Math.round(sib_2.offsetHeight - diff);
      sib_2.style.flex = `0 ${height < 10 ? 0 : height}px`;
      sib_1.style.flex = `1 0`;
    }
  }

  function handleMouseUpRow() {
    document.removeEventListener("mousemove", handleMouseMoveRow);
    document.removeEventListener("mouseup", handleMouseUpRow);
  }

  //to display the code output on the iframe
  //every time some code change takes place
  function displayOutput() {
    let html = document.querySelector(".html_code");
    let css = document.querySelector(".css_code");
    let js = document.querySelector(".js_code");

    var iframe = document.querySelector("iframe").contentWindow.document;

    // console.log(js.value);

    iframe.open();
    iframe.writeln(
      html.value +
        "<style>" +
        css.value +
        "</style>" +
        "<script>" +
        js.value +
        "</script>"
    );
    iframe.close();

    //also store the code done so far in the local storage
    localStorage.setItem("html_code", html.value);
    localStorage.setItem("css_code", css.value);
    localStorage.setItem("js_code", js.value);
  }

  //--------------------Logic for Video Chat using Peer.js--------------------
  useEffect(() => {
    socket.on("my-socket-id", (data) => {
      mySocketId.current = data.socketId;
    });

    peer.on("open", (id) => {
      setMyPeerId(id);
    });

    //start my video:
    let getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    startVideo();

    //if we are getting a call
    peer.on("call", function (call) {
      getUserMedia(
        { video: true, audio: true },
        function (stream) {
          call.answer(stream); // Answer the call with an A/V stream.
          stream_2.current = stream;
          call.on("stream", function (remoteStream) {
            // Show stream in some video/canvas element.
            friendVideo.current.srcObject = remoteStream;
            friendVideo.current.play();
          });
        },
        function (err) {
          console.log("Failed to get local stream", err);
        }
      );
    });

    peer.on("connection", function (conn) {
      conn.on("open", function () {
        // Receive Friend's socket id
        conn.on("data", function (data) {
          console.log("Received", data);
          // setFriendSocketId(data);
          console.log(data);
          friendSocketId.current = data;
        });

        // Send your socket id
        conn.send({
          socketId: mySocketId.current,
          code: {
            html_code: document.querySelector(".html_code").value,
            css_code: document.querySelector(".css_code").value,
            js_code: document.querySelector(".js_code").value,
          },
        });
        // conn.send("Hello2");
      });
    });
  }, []);

  useEffect(() => {
    // console.log(location);

    //If we are joining a collaboration session
    connectAndCallPeer();
  }, []);

  function connectAndCallPeer() {
    if (location.state.collaborate === true) {
      friendPeerId.current = location.state.friendPeerId;

      //establish connection with the peer for data transfer.
      setTimeout(() => {
        let conn = peer.connect(`${location.state.friendPeerId}`);
        conn.on("open", function () {
          // Receive messages, i.e, receive the friend's socket id here.
          conn.on("data", function (data) {
            console.log("Received", data);
            // setFriendSocketId(data);
            console.log(data);
            friendSocketId.current = data.socketId;

            let html = document.querySelector(".html_code");
            let css = document.querySelector(".css_code");
            let js = document.querySelector(".js_code");

            html.value = data.code.html_code;
            css.value = data.code.css_code;
            js.value = data.code.js_code;

            displayOutput();
          });

          // Send your socket id
          conn.send(mySocketId.current);
          // conn.send("Hello1");
        });
      }, 1000);

      setTimeout(() => {
        // call the peer
        let getMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia;
        getMedia(
          { video: true, audio: true },
          function (stream) {
            stream_3.current = stream;
            var call = peer.call(`${location.state.friendPeerId}`, stream);
            call.on("stream", function (remoteStream) {
              // Show stream in some video/canvas element.

              friendVideo.current.srcObject = remoteStream;
              friendVideo.current.play();
            });
          },
          function (err) {
            console.log("Failed to get local stream", err);
          }
        );
      }, 1000);
    }
  }

  function startVideo() {
    let getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    getUserMedia(
      { video: true, audio: false },
      function (stream) {
        myVideo.current.srcObject = stream;
        myVideo.current.play();
        stream_1.current = stream;
      },
      function (err) {
        console.log("Failed to get local stream", err);
      }
    );
  }

  function handleVideoPlayPause() {
    if (myVideo.current.paused) {
      setVideoPlay(true);
      myVideo.current.play();
      // startVideo();
      // connectAndCallPeer();
      stream_1.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = true));
      stream_2.current
        ?.getVideoTracks()
        .forEach((track) => (track.enabled = true));
      stream_3.current
        ?.getVideoTracks()
        .forEach((track) => (track.enabled = true));
    } else {
      setVideoPlay(false);
      myVideo.current.pause();
      // stream_1.current.getTracks().forEach((track) => track.stop());
      // stream_2.current?.getTracks().forEach((track) => track.stop());
      // stream_3.current?.getTracks().forEach((track) => track.stop());

      stream_1.current
        .getVideoTracks()
        .forEach((track) => (track.enabled = false));
      stream_2.current
        ?.getVideoTracks()
        .forEach((track) => (track.enabled = false));
      stream_3.current
        ?.getVideoTracks()
        .forEach((track) => (track.enabled = false));
    }
  }

  function handleMuteUnmute() {
    if (muted) {
      setMuted(false);
      stream_1.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = true));
      stream_2.current
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = true));
      stream_3.current
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = true));
    } else {
      setMuted(true);
      stream_1.current
        .getAudioTracks()
        .forEach((track) => (track.enabled = false));
      stream_2.current
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = false));
      stream_3.current
        ?.getAudioTracks()
        .forEach((track) => (track.enabled = false));
    }
  }

  function loadPrevCode() {
    let html = document.querySelector(".html_code");
    let css = document.querySelector(".css_code");
    let js = document.querySelector(".js_code");

    html.value = localStorage.getItem("html_code");
    css.value = localStorage.getItem("css_code");
    js.value = localStorage.getItem("js_code");

    displayOutput();

    socket.emit("load-code", {
      html_code: localStorage.getItem("html_code"),
      css_code: localStorage.getItem("css_code"),
      js_code: localStorage.getItem("js_code"),
      friendSocketId: friendSocketId.current,
    });
  }

  function hideAndShowVideo(option) {
    if (option == 0) {
      document.querySelector(".project_peers").style.height = "0";
      document.querySelector(".project_peers_parent").style.overflowY =
        "hidden";
    } else {
      document.querySelector(".project_peers").style.height = "200px";
      document.querySelector(".project_peers_parent").style.overflowY =
        "initial";
    }
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

  async function saveProject() {
    await setDoc(doc(db, fireStoreUID, `${location.state.projectName}`), {
      html_code: document.querySelector(".html_code").value,
      css_code: document.querySelector(".css_code").value,
      js_code: document.querySelector(".js_code").value,
    });
  }
  return (
    <div className="project">
      <nav className="">
        <Logo />
        <p>{location.state.projectName}</p>
        <p>{myPeerId}</p>
        <button
          onClick={() => {
            console.log("My SOcket Id: ", mySocketId.current);
            console.log("Friend SOcket Id: ", friendSocketId.current);
          }}
        >
          See Socket IDs
        </button>
        <button onClick={loadPrevCode}>Load Previous Code</button>

        {/* <div>
          <button onClick={handleVideoPlayPause}>Play/Pause Video</button>
          <button onClick={handleMuteUnmute}>Mute/Unmute</button>
        </div> */}

        <button onClick={saveProject}>Save</button>
        <button onClick={handleSignOut}>SignOut</button>
      </nav>
      <div className="project_container">
        <div className="project_left">
          <div onMouseDown={handleMouseDownRow} className="top_divider"></div>
          <div className="project_left_top">
            <textarea
              className="html_code"
              onInput={displayOutput}
              onCut={handleCut}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
            />
          </div>
          <div onMouseDown={handleMouseDownRow} className="row_divider"></div>
          <div className="project_left_middle">
            <textarea
              className="css_code"
              onInput={displayOutput}
              onCut={handleCut}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
            />
          </div>
          <div onMouseDown={handleMouseDownRow} className="row_divider"></div>
          <div className="project_left_bottom">
            <textarea
              className="js_code"
              onInput={displayOutput}
              onCut={handleCut}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
            />
          </div>
        </div>

        <div onMouseDown={handleMouseDownCol} className="col_divider"></div>

        <div className="project_right">
          <iframe></iframe>
        </div>
      </div>

      <div className="project_peers_parent">
        <div className="project_peers_options">
          <div>
            <button onClick={() => hideAndShowVideo(0)}>
              <FiMinus />
            </button>
            <button onClick={() => hideAndShowVideo(1)}>
              <FiPlus />
            </button>
          </div>
          <div>
            <button onClick={handleVideoPlayPause}>
              {videoPlay ? (
                <BsFillCameraVideoFill />
              ) : (
                <BsFillCameraVideoOffFill />
              )}
            </button>
            <button onClick={handleMuteUnmute}>
              {muted ? <BsFillMicFill /> : <BsFillMicMuteFill />}
            </button>
          </div>
        </div>
        <div className="project_peers">
          <video muted ref={myVideo} style={{ backgroundColor: "red" }}></video>

          <video ref={friendVideo} style={{ backgroundColor: "blue" }}></video>
        </div>
      </div>
    </div>
  );
}

export default Project;
