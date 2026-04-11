import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { ORDER_ACTIONS } from "../utils/orderflow";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";

interface IOrderProps {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const statusColor = (status: string) => {
  switch (status) {
    case "placed":
      return "bg-yellow-100 text-yellow-700";
    case "accepted":
      return "bg-orange-100 text-orange-700";
    case "preparing":
      return "bg-blue-100 text-blue-700";
    case "ready_for_rider":
      return "bg-indigo-100 text-indigo-700";
    case "picked_up":
      return "bg-purple-100 text-purple-700";
    case "delivered":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const OrderCard = ({ order, onStatusUpdate }: IOrderProps) => {
  const [loading, setLoading] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  const actions = ORDER_ACTIONS[order.status] || [];

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);
      await axios.put(
        `${restaurantService}/api/order/${order?._id}`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Order updated");
      onStatusUpdate?.();
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order.status !== "ready_for_rider") {
      setRetryVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [order.status]);

  return (
    <div className="rounded-2xl bg-white shadow-md p-4 space-y-4 border border-gray-100 hover:shadow-lg transition">
      {/* Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm font-semibold text-gray-800">
          Order #{order?._id.slice(-6)}
        </p>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusColor(order.status)}`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      {/* Items */}
      <div className="text-sm text-gray-600 space-y-1">
        {order.items.map((item, i) => (
          <p key={i} className="flex justify-between">
            <span>{item.name}</span>
            <span className="font-medium">x{item.quantity}</span>
          </p>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t pt-3 flex justify-between text-sm font-semibold text-gray-800">
        <span>Total</span>
        <span>₹{order.totalAmount}</span>
      </div>

      {/* Payment */}
      <p className="text-xs text-gray-500">
        Payment:{" "}
        <span className="font-medium capitalize">{order.paymentStatus}</span>
      </p>

      {/* Actions */}
      {order.paymentStatus === "paid" && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {actions.map((status) => (
            <button
              key={status}
              disabled={loading}
              onClick={() => updateStatus(status)}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 active:scale-95 disabled:opacity-50 transition"
            >
              {loading
                ? "Updating..."
                : `Mark as ${status.replaceAll("_", " ")}`}
            </button>
          ))}
        </div>
      )}

      {order.status === "ready_for_rider" && retryVisible && (
        <div className="p-2">
          <button
            className="w-full rounded-lg border border-[#E23744] py-2 text-xs font-semibold text-[#E23744] hover:bg-red-50 disabled:opacity-50"
            onClick={() => updateStatus("ready_for_rider")}
          >
            Retry Ready for Rider
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
