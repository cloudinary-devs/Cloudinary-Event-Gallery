import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from './firebase';
import './App.css'; // Import the CSS file
import { useEffect, useState } from "react";

const App = () => {
  const provider = new GoogleAuthProvider();
    const [user, setUser] = useState(null);
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {

            if (user) {
                setUser(user);
                window.location.href = '/profile';
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then(() => {
        window.location.href = '/profile'
      })
      .catch((error) => {
        console.error(error);
      });
  };


  return (
    <>
        { !user && 
            (
                <div className="eventography-app">
                    <h1>Welcome to <a href="eventographyapp.com">Eventography!</a></h1>
                    <p>Eventography helps you create and manage event image galleries effortlessly.</p>
                    <button onClick={()=>signInWithGoogle()}>Create Your Event Gallery</button>
                </div>
            )
        }
    </>
  );
};

export default App;
