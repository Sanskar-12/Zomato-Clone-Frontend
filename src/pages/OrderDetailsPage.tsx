import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import axios from "axios";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { socket } = useSocket();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/single/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setOrder(data.order);
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch the order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
    };
  }, [socket]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading Order...</p>;
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">No Order Found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold">Order #{order?._id.slice(-6)}</h1>
      <div className="rounded-lg bg-blue-50 p-3 text-sm font-medium">
        Status: <span className="capitalize">{order.status}</span>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <h2 className="font-semibold">Items</h2>
        {order.items.map((item, index) => (
          <div className="flex justify-between text-sm" key={index}>
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>₹{item.price}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-1">
        <h2 className="font-semibold">Delivery Address</h2>
        <p className="text-sm text-gray-600">
          {order.deliveryAddress.formattedAddress}
        </p>
        <p className="text-sm text-gray-600">
          Mobile: {order.deliveryAddress.mobile}
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹{order.subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>₹{order.deliveryFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Platform Fee</span>
          <span>₹{order.platformFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total</span>
          <span>₹{order.totalAmount}</span>
        </div>
        <p className="text-xs text-gray-500">
          Payment Method: {order.paymentMethod}
        </p>
        <p className="text-xs text-gray-500">
          Payment Status: {order.paymentStatus}
        </p>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
