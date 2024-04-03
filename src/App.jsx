import './App.css'; // Import the CSS file
import { useEffect } from "react";
import { useAuth } from './AuthContext';

const App = () => {
  const {user, signInWithGoogle} = useAuth();
    useEffect(() => {
      if (user) {
          window.location.href = '/profile';
      }
    }, [user]);

  return (
    <>
        { !user && 
            (
                <div className="eventography-app">
                    <h1>Welcome to <a href="eventographyapp.com">Eventography!</a></h1>
                    <p>Eventography helps you create and manage event image galleries effortlessly.</p>
                    <button onClick={signInWithGoogle}>Create Your Event Gallery</button>
                </div>
            )
        }
    </>
  );
};

export default App;
