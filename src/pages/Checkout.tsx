import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import { BiCreditCard, BiLoader } from "react-icons/bi";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subtotal, quantity, location, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        setAddresses(data.addresses || []);
      } catch (error) {
        console.log(error);
        toast.error("Error fetching Addresses");
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddresses();
  }, [cart]);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Your Cart is Empty</p>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subtotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subtotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!location?.latitude || !location.longitude) {
      return;
    }
    if (!selectedAddressId) return null;
    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
          distance: getDistanceKm(
            location.latitude,
            location.longitude,
            restaurant.autoLocation.coordinates[1],
            restaurant.autoLocation.coordinates[0],
          ),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      return data;
    } catch (error) {
      console.log(error);
      toast.error("Failed to create Order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createOrder("razorpay");

      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Zomato",
        description: "Food Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            toast.success("Payment Successful");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            console.log(error);
            toast.error("Payment Verification failed");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      fetchCart();
    } catch (error) {
      console.log(error);
      toast.error("Payment failed, Please refresh the page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");

      if (!order) return;

      console.log("Stripe checkout", order);
      fetchCart();
    } catch (error) {
      console.log(error);
      toast.error("Payment failed, Please refresh the page");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold">{restaurant.name}</h2>
        <p className="text-sm text-gray-500">
          {restaurant.autoLocation.formattedAddress}
        </p>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Delivery Address</h3>
        {loadingAddress ? (
          <p className="text-sm text-gray-500">Loading addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-gray-500">
            No Address found. Please add one
          </p>
        ) : (
          addresses.map((address) => (
            <label
              key={address._id}
              className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition ${
                selectedAddressId === address?._id
                  ? "border-[#E23744] bg-red-50"
                  : "bg-gray-50"
              }`}
            >
              <input
                type="radio"
                checked={selectedAddressId === address?._id}
                onChange={() => setSelectedAddressId(address?._id)}
              />
              <div>
                <p className="text-sm font-medium">
                  {address?.formattedAddress}
                </p>
                <p className="text-xs text-gray-500">{address?.mobile}</p>
              </div>
            </label>
          ))
        )}
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-4">
        <h3 className="font-semibold">Order Summary</h3>
        {cart?.map((cartItem: ICart) => {
          const item = cartItem?.itemId as IMenuItem;
          return (
            <div className="flex justify-between text-sm" key={cartItem?._id}>
              <span>
                {item?.name} x {cartItem?.quantity}
              </span>
              <span>₹{item.price * cartItem.quantity}</span>
            </div>
          );
        })}
        <hr />
        <div className="flex justify-between text-sm">
          <span>Items ({quantity})</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Platform Fee</span>
          <span>₹{platformFee}</span>
        </div>

        {subtotal < 250 && (
          <p className="text-xs text-gray-500">
            Add Item worth ₹{250 - subtotal} more to get Free delivery
          </p>
        )}
        <div className="flex justify-between text-base font-semibold border-t pt-2">
          <span>Grand Total</span>
          <span>₹{grandTotal}</span>
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="font-semibold">Payment Method</h3>
        <button
          disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
          onClick={payWithRazorpay}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2D7FF9] py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
        >
          {loadingRazorpay ? (
            <BiLoader size={18} className="animate-spin" />
          ) : (
            <BiCreditCard size={18} />
          )}
          Pay With Razorpay
        </button>
      </div>
    </div>
  );
};

export default Checkout;
