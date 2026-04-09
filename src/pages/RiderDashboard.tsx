import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import axios from "axios";
import { riderService } from "../main";

export interface IRider {
  _id: string;
  picture: string;
  phoneNumber: string;
  aadharNumber: string;
  drivingLicenseNumber: string;
  isVerified: boolean;
  isAvailable: boolean;
}

const RiderDashboard = () => {
  const { user } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myProfile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(data.riderAccount || null);
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch the profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access required");
      return;
    }

    setToggling(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailable: !profile?.isAvailable,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        toast.success(
          profile?.isAvailable ? "You are offline" : "You are online",
        );
        fetchProfile();
      } catch (error: any) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setToggling(false);
      }
    });
  };

  useEffect(() => {
    if (user?.role === "rider") {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center text-gray-500 justify-center">
        You are not registered as a rider
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center text-gray-500 justify-center">
        Loading Rider Details...
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return <div>sdf</div>;
};

export default RiderDashboard;
