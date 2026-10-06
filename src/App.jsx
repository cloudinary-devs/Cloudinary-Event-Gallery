import "./App.css";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";

const App = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const start = async () => {
    await signInWithGoogle();
    navigate("/profile");
  };

  return (
    <div className="eventography-app">
      <h1>
        Welcome to <a href="https://eventographyapp.com/">Eventography!</a>
      </h1>
      <p>Eventography helps you create and manage event image galleries effortlessly.</p>
      <button onClick={start}>Create Your Event Gallery</button>
    </div>
  );
};

export default App;
