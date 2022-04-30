import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

//components
import Navbar from "./Navbar";

//CSS
import "./styles/UserScreen.css";

//icons
import { AiFillDelete } from "react-icons/ai";

function UserScreen(props) {
  const friendPeerId = useRef("");
  const projectName = useRef("");
  const collabProjectName = useRef("");
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState("");

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User SignedIn ", user);
        const uid = user.uid;
        setCurrentUserId(uid);

        // ...
      } else {
        // User is signed out
        // ...
        console.log("User signout");
        navigate("/");
      }
    });
  }, []);

  async function loadProjects() {
    let projects_container = document.querySelector(".projects_container");

    let querySnapshot = await getDocs(collection(db, currentUserId));
    let allProjects = [];
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      allProjects.push(doc.id);
    });

    setProjects(allProjects);
  }

  async function handleDeleteProject(doc_id) {
    await deleteDoc(doc(db, currentUserId, doc_id));
    loadProjects();
  }

  return (
    <div className="user_screen">
      <Navbar showGetStarted={false} />

      <div className="user_screen_content">
        {/* Left Section */}
        <div className="user_screen_left">
          {/* Start a New Project */}
          <div className="user_screen_left_card user_screen_left_new">
            <p>Start a new Project</p>
            <input ref={projectName} placeholder="Project Name"></input>
            <button
              onClick={() => {
                console.log(projectName.current.value);
                if (projectName.current.value != "") {
                  navigate(`/project`, {
                    state: {
                      myPeerId: uuidv4(),
                      collaborate: false,
                      loadProject: false,
                      friendPeerId: "",
                      projectName: projectName.current.value,
                    },
                  });
                }
              }}
            >
              New
            </button>
          </div>
          {/* Collaborate With a Friend */}
          <div className="user_screen_left_card user_screen_left_collab">
            <p>Collaborate with a friend</p>
            <input
              ref={friendPeerId}
              type="text"
              placeholder="Enter Friend's ID"
            ></input>
            <input ref={collabProjectName} placeholder="Project Name"></input>
            <button
              onClick={() => {
                if (
                  friendPeerId.current.value != "" &&
                  collabProjectName.current.value != ""
                )
                  navigate(`/project`, {
                    state: {
                      myPeerId: uuidv4(),
                      collaborate: true,
                      loadProject: false,
                      friendPeerId: `${friendPeerId.current.value}`,
                      projectName: collabProjectName.current.value,
                    },
                  });
              }}
            >
              Collaborate
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="user_screen_right">
          <button onClick={loadProjects}>Load Existing Project</button>
          <div className="user_screen_right_projects">
            {projects.map((project, idx) => (
              <div key={idx} className="user_screen_project">
                <p
                  onClick={() => {
                    navigate(`/project`, {
                      state: {
                        myPeerId: uuidv4(),
                        collaborate: false,
                        loadProject: true,
                        friendPeerId: "",
                        projectName: project,
                      },
                    });
                  }}
                >
                  {project}
                </p>
                <span onClick={() => handleDeleteProject(project)}>
                  {<AiFillDelete />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 
      <div>
        
      </div> */}
    </div>
  );
}

export default UserScreen;
