import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Event from './Event';
import Gallery from './Gallery';
import App from './App';
import Navbar from './Navbar';
import Profile from './Profile';
import { AuthProvider } from './AuthContext';

const router = createBrowserRouter([
  {
    path: "events/:id",
    element: <Event/>,
  },
  {
    path: "galleries/:id",
    element: <Gallery/>,
  },
  {
    path: "profile",
    element: <Profile />
  },
  {
    path: "/",
    element: <App/>,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Navbar />
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
