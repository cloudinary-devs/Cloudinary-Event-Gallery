import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Outlet } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import App from "./App";
import Navbar from "./Navbar";
import { AuthProvider } from "./AuthContext";

const router = createBrowserRouter([
  {
    element: (
      <>
        <Navbar />
        <Outlet />
      </>
    ),
    children: [
      { path: "/", element: <App /> },
      // Split per route so guests opening an event link from a QR code on
      // mobile data only download the page they need.
      { path: "profile", lazy: async () => ({ Component: (await import("./Profile")).default }) },
      { path: "events/:id", lazy: async () => ({ Component: (await import("./Event")).default }) },
      { path: "galleries/:id", lazy: async () => ({ Component: (await import("./Gallery")).default }) },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
