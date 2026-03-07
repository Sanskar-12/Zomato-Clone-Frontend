import axios from "axios";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../main";
import type { AppContextType, LocationData, User } from "../types";
import toast from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching Location...");

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setUser(data.user);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Please allow location to continue");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const { data } = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        );

        setLocation({
          latitude,
          longitude,
          formattedAddress: data.display_name || "current location",
        });

        setCity(
          data.address.city ||
            data.address.town ||
            data.address.village ||
            "Your Location",
        );
      } catch (error) {
        setLocation({
          latitude,
          longitude,
          formattedAddress: "current location",
        });

        setCity("Failed to load");
      }
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        setIsAuth,
        loading,
        setLoading,
        user,
        setUser,
        location,
        loadingLocation,
        city,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }

  return context;
};
