import { useEffect, useState } from 'react';
import './Profile.css'; // Import the CSS file
import { auth, db } from './firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import QRCodeGenerator from './QRCodeGenerator';

const Profile = () => {
  // State for input fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventHashtag, setEventHashtag] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
  
      if (user) {
        const docRef = doc(db, "events", user.uid);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          setEventTitle(docSnap.data().eventTitle);
          setEventHashtag(docSnap.data().eventHashtag);
        } else {
          console.log("No such document!");
        }
      } else {
        window.location.href = "/"
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Dummy data for disabled input fields
  const link = window.location.hostname;

  // Function to handle saving data
  const handleSave = async() => {
    if (!user) return;
    try {
      await setDoc(doc(collection(db, "events"), user.uid), {
        eventLink: `${link}/events/${user.uid}`,
        email: user.email,
        eventTitle: eventTitle,
        eventHashtag: eventHashtag,
        paid: true,
        backgroundEventImage: '',
        eventFontColor: '',
        buttonsFontColor: '',
        eventLogo: '',
        uid: user.uid
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  // Function to copy the content of the event link input field to the clipboard
  const copyEventLink = () => {
    navigator.clipboard.writeText(`https://${link}/events/${user.uid}`);
  };

  return (
    <div className='profile'>
      <h1>Eventography</h1>
      {user && (
        <div className="profile-container">
          <div>
            <label htmlFor="eventTitle">Event Title:</label>
            <input
              type="text"
              id="eventTitle"
              value={eventTitle || ''}
              onChange={(e) => setEventTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="eventHashtag">Event Hashtag:</label>
            <input
              type="text"
              id="eventHashtag"
              value={`${eventHashtag}` || ''} 
              onChange={(e) => setEventHashtag(`${e.target.value}`)}
            />
          </div>
          <button className="save" onClick={handleSave}>Save</button>
          <div className="buttons">
            <button onClick={copyEventLink}>Copy Event Link</button>
            <button onClick={()=> window.location.href =`/events/${user.uid}`}>Go To Event</button>
          </div>
          <QRCodeGenerator url={`https://${link}/events/${user.uid}`} />
        </div>
      ) }
    </div>
  );
};

export default Profile;
