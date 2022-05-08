//packages
import { useNavigate } from "react-router-dom";

//CSS
import "./styles/Logo.css";

function Logo(props) {
  const navigate = useNavigate();

  return (
    <div
      className="logo"
      onClick={() => {
        navigate("/");
        if (props.isProjectPage === true) {
          props.closeCamera();
        }
      }}
    >
      <h1>
        <span style={{ fontWeight: "800" }}>Code</span>
        <span style={{ fontWeight: "200" }}>Lit</span>
      </h1>
    </div>
  );
}

export default Logo;
