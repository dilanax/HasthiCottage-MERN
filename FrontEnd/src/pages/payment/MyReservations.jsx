import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Pencil, XCircle, CalendarPlus } from "lucide-react";

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user reservations
  const fetchReservations = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/reservations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setReservations(data.reservations || []);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // Cancel reservation
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      await axios.patch(
        `http://localhost:5000/api/reservations/${id}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Reservation cancelled");
      fetchReservations(); // refresh list
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to cancel");
    }
  };

  // Update reservation
  const handleUpdate = (id) => {
    navigate(`/reservations/update/${id}`);
  };

  // Navigate to make reservation
  const handleNewReservation = () => {
    navigate("/reserve/start");
  };

  if (loading) return <div className="py-10 text-center">Loading reservations...</div>;

  return (
    <div className="max-w-5xl p-6 mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">My Reservations</h1>
        <button
          onClick={handleNewReservation}
          className="flex items-center gap-2 bg-[#d3af37] text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
        >
          <CalendarPlus size={18} />
          Make Reservation
        </button>
      </div>

      {reservations.length === 0 ? (
        <div className="text-gray-600">No reservations found.</div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((res) => (
            <div
              key={res._id}
              className="bg-[#f0f0f0] rounded-lg p-4 shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-[#0a0a0a]">
                  {res.guest?.firstName} {res.guest?.lastName}
                </p>
                <p className="text-sm text-gray-700">
                  {new Date(res.checkIn).toLocaleDateString()} →{" "}
                  {new Date(res.checkOut).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      res.status === "cancelled" ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {res.status}
                  </span>
                </p>
                <p className="text-sm text-gray-700">Total: {res.totalAmount} {res.currency}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(res._id)}
                  className="flex items-center gap-1 px-3 py-1 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  <Pencil size={16} />
                  Update
                </button>
                <button
                  onClick={() => handleCancel(res._id)}
                  disabled={res.status === "cancelled"}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg ${
                    res.status === "cancelled"
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
