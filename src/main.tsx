import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";
import { BrowserRouter } from "react-router-dom";

export const authService = "http://localhost:4000";
export const restaurantService = "http://localhost:4001";
export const utilsService = "http://localhost:4002";
export const realtimeService = "http://localhost:4003";
export const riderService = "http://localhost:4004";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AppProvider>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </AppProvider>
      <Toaster />
    </GoogleOAuthProvider>
  </StrictMode>,
);
