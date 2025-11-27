// src/pages/reservations/RoomsSelect.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useReservation } from "../../components/reservations/reservationContext.js";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import RoomTypePackageCard from "../../components/reservations/RoomTypePackageCard.jsx";
import { toast } from "react-hot-toast";
import { getAvailableRooms } from "../../api/rooms";

const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

// Prefer env, fall back to localhost
const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const PACKAGES_API_URL = `${BASE}/api/room_package`;

// --- helpers ---
const humanizeKey = (s = "") => s.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

// Coerce perks into an array of strings for rendering later
function normalizePerks(perks) {
  if (Array.isArray(perks)) return perks;
  if (perks && typeof perks === "object") {
    return Object.entries(perks)
      .filter(([, v]) => !!v)
      .map(([k]) => humanizeKey(k));
  }
  if (typeof perks === "string" && perks.trim()) {
    return perks.split(/[;|,]\s*/).filter(Boolean);
  }
  return [];
}

// Pick a consistent pricePerNight + currency from various backend shapes
function normalizePrice(pkg) {
  // Try common fields in order
  const candidates = [
    ["nightlyPrice", pkg?.nightlyPrice],
    ["pricePerNight", pkg?.pricePerNight],
    ["priceLKR", pkg?.priceLKR],
    ["priceUSD", pkg?.priceUSD],
    ["price", pkg?.price],
  ];

  let price = 0;
  let sourceKey = "";
  for (const [key, val] of candidates) {
    const n = Number(val);
    if (!Number.isNaN(n) && n > 0) {
      price = n;
      sourceKey = key;
      break;
    }
  }

  // Currency guess
  let currency = "LKR";
  if (sourceKey.toLowerCase().includes("usd")) currency = "USD";

  return { pricePerNight: price, currency };
}

// Build a normalized package object the app can rely on
function normalizePackage(p, roomDetails) {
  const { pricePerNight, currency } = normalizePrice(p);
  return {
    ...p,
    roomDetails,
    // enforce presence of these fields:
    pricePerNight,
    nightlyPrice: pricePerNight, // keep both for downstream compatibility
    currency: p.currency || currency || "LKR",
    perks: normalizePerks(p.perks),
    // convenience: readable title if missing
    title:
      p.title ||
      p.name ||
      (roomDetails?.roomType
        ? humanizeKey(roomDetails.roomType.replace(/-/g, " "))
        : "Room Package"),
  };
}

export default function RoomsSelect() {
  const navigate = useNavigate();
  const { update } = useReservation();
  const { checkIn, checkOut } = useParams();

  const [rooms, setRooms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const topRef = useRef(null);
  const continueButtonRef = useRef(null);

  const params = useMemo(() => {
    const q = [];
    if (checkIn) q.push(`checkIn=${encodeURIComponent(checkIn)}`);
    if (checkOut) q.push(`checkOut=${encodeURIComponent(checkOut)}`);
    return q.length ? `?${q.join("&")}` : "";
  }, [checkIn, checkOut]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1) available rooms for given dates
        let roomsData;
        try {
          roomsData = await getAvailableRooms();
        } catch (error) {
          console.error('Error fetching available rooms:', error);
          setError('Failed to load available rooms. Please try again.');
          return;
        }
        
        // Debug: Log the structure of roomsData (development only)
        if (import.meta.env.DEV) {
          console.log('Full roomsData response:', roomsData);
          console.log('roomsData.data type:', typeof roomsData.data);
          console.log('roomsData.data is array:', Array.isArray(roomsData.data));
          console.log('roomsData.data contents:', roomsData.data);
          console.log('roomsData.data.data type:', typeof roomsData.data?.data);
          console.log('roomsData.data.data is array:', Array.isArray(roomsData.data?.data));
        }

        // Handle different response structures and ensure we have an array
        let roomsArray = [];
        if (roomsData && roomsData.data) {
          if (Array.isArray(roomsData.data)) {
            // Direct array in data property
            roomsArray = roomsData.data;
          } else if (roomsData.data.rooms && Array.isArray(roomsData.data.rooms)) {
            // Nested rooms property
            roomsArray = roomsData.data.rooms;
          } else if (roomsData.data.data && Array.isArray(roomsData.data.data)) {
            // Double nested data property
            roomsArray = roomsData.data.data;
          } else if (roomsData.data.items && Array.isArray(roomsData.data.items)) {
            // Items property
            roomsArray = roomsData.data.items;
          } else {
            // If data is an object, try to find any array property
            const possibleArrays = Object.values(roomsData.data).filter(Array.isArray);
            if (possibleArrays.length > 0) {
              roomsArray = possibleArrays[0];
            }
          }
        } else if (Array.isArray(roomsData)) {
          // Direct array response
          roomsArray = roomsData;
        }
        
        if (import.meta.env.DEV) {
          console.log('Final roomsArray:', roomsArray);
        }
        
        const roomMap = roomsArray.reduce((acc, r) => {
          acc[r.room_id] = r;
          return acc;
        }, {});

        // 2) packages (active)
        const packagesRes = await fetch(`${PACKAGES_API_URL}?active=true`, { headers });
        if (!packagesRes.ok) throw new Error(`Failed to load packages: ${packagesRes.statusText}`);
        const packagesData = await packagesRes.json();

        // Some backends return {items}, others {data}; support both
        const rawPackages = packagesData.items || packagesData.data || [];

        // 3) join + normalize so each package has pricePerNight, currency, perks[]
        const enhanced = rawPackages
          .filter((p) => {
            // Check if room exists and has availability
            const room = roomMap[p.roomId];
            return room && room.availableCount > 0;
          })
          .map((p) => normalizePackage(p, roomMap[p.roomId]))
          .filter((p) => p.roomDetails);

        // 4) group by room type for UI
        const grouped = enhanced.reduce((acc, pkg) => {
          const type = pkg.roomDetails.roomType || "unknown";
          (acc[type] ||= []).push(pkg);
          return acc;
        }, {});

        if (!mounted) return;
        setRooms(grouped);
      } catch (e) {
        if (mounted) {
          console.error(e);
          setError(`Failed to load data: ${e.message}`);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params]);

  const handlePackageSelect = (pkg) => {
    if (!isValidObjectId(pkg._id)) {
      toast.error("Invalid package selected. Please try again.");
      return;
    }

    // pkg is already normalized (has pricePerNight, currency, perks[])
    setSelectedPackage(pkg);
    // Persist normalized package into context so Summary can use its price
    update({
      packageId: pkg._id,
      selectedPackage: {
        _id: pkg._id,
        title: pkg.title,
        pricePerNight: pkg.pricePerNight,
        nightlyPrice: pkg.pricePerNight, // for older readers
        currency: pkg.currency || "LKR",
        perks: pkg.perks || [],
        roomId: pkg.roomId,
        roomDetails: pkg.roomDetails,
      },
    });

    
    // Show hint and scroll to continue button when room is selected
    setShowHint(true);
    setTimeout(() => {
      continueButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    
    // Hide hint after 5 seconds
    setTimeout(() => setShowHint(false), 5000);
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Floating Hint */}
      {showHint && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-[#d3af37] to-[#b8941f] text-white px-6 py-4 rounded-lg shadow-xl border border-white/20 max-w-sm ring-2 ring-[#d3af37]/30">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">Room selected!</p>
                <p className="text-xs opacity-90">Scroll down to continue to guest details</p>
              </div>
              <button 
                onClick={() => setShowHint(false)}
                className="flex-shrink-0 ml-2 text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div ref={topRef} className="px-4 pt-8 pb-6 mx-auto w-full">
        <div className="px-6 py-6 bg-white border border-gray-200 shadow-lg rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#d3af37] to-[#b8941f] rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">🏨</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0a0a0a]">Select Your Room</h1>
              <p className="mt-1 text-[#0a0a0a]/70">
                Choose from our available room types and packages. Use arrow keys or swipe to browse options.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-12 mx-auto w-full flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-[#d3af37]" />
                <div className="absolute inset-0 w-12 h-12 animate-pulse">
                  <div className="h-full w-full rounded-full border-2 border-[#d3af37]/20"></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-[#0a0a0a]">Loading rooms and packages</p>
                <p className="text-sm text-[#0a0a0a]/60">Finding the best options for your stay...</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="flex items-start gap-3 px-4 py-4 mb-6 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                <div className="w-5 h-5 text-red-500 mt-0.5">⚠️</div>
                <div>
                  <p className="font-medium">Unable to load rooms</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {!Object.keys(rooms).length && !error ? (
              <div className="p-12 text-center bg-white border border-gray-200 shadow-sm rounded-xl">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                  <span className="text-2xl">🏨</span>
                </div>
                <p className="mb-2 text-xl font-medium text-[#0a0a0a]">No rooms available</p>
                <p className="text-[#0a0a0a]/70 mb-4">Try different dates or check back later.</p>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-[#0a0a0a] transition-colors hover:bg-gray-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go back to dates
                </button>
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                {Object.entries(rooms).map(([roomType, pkgs]) => (
                  <div key={roomType} className="transform transition-transform hover:scale-[1.01] duration-200">
                    <RoomTypePackageCard
                      roomType={roomType}
                      packages={pkgs}
                      onPackageSelect={handlePackageSelect}
                      selectedPackageId={selectedPackage?._id}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div ref={continueButtonRef} className="mx-auto mt-10 w-full mt-auto">
              <div className="flex flex-col gap-4 px-6 py-6 bg-white border border-gray-200 shadow-lg sm:flex-row sm:items-center sm:justify-between rounded-xl">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-6 py-3 text-[#0a0a0a] transition-all hover:bg-gray-50 hover:border-gray-400 active:scale-98"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to dates
                </button>

                <button
                  onClick={() => selectedPackage && navigate("/reserve/guest")}
                  disabled={!selectedPackage}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 font-semibold transition-all duration-200 ${
                    selectedPackage
                      ? "bg-gradient-to-r from-[#d3af37] to-[#b8941f] text-[#0a0a0a] hover:shadow-lg hover:scale-105 active:scale-98 ring-4 ring-[#d3af37]/50 shadow-xl animate-pulse"
                      : "cursor-not-allowed bg-gray-300 text-[#0a0a0a]/60"
                  }`}
                >
                  Continue to guest details
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {selectedPackage && (
                <div className="px-6 py-4 mt-4 border border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <span className="text-sm text-green-600">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Package selected successfully!
                      </p>
                      <p className="text-xs text-green-700">
                        {selectedPackage.roomDetails.roomType
                          ?.replace(/-/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}{" "}
                        • Room ID: {selectedPackage.roomId} •{" "}
                        {selectedPackage.currency || "USD"} {Intl.NumberFormat().format(selectedPackage.pricePerNight || 0)} / night
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
