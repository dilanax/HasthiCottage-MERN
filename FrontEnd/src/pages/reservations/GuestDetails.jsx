// src/pages/reservations/GuestDetails.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useReservation } from "../../components/reservations/reservationContext.js";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import "react-phone-number-input/style.css";

// ✅ Added for flags & country labels
import en from "react-phone-number-input/locale/en.json";

const ME_URL = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/user/me`;

// Custom CountrySelect component for phone country codes
const CountrySelect = ({ value, onChange, labels, ...rest }) => (
  <select
    {...rest}
    value={value}
    onChange={(event) => onChange(event.target.value || undefined)}
  >
    <option value="">{labels['International']}</option>
    {getCountries().map((country) => (
      <option key={country} value={country}>
        {labels[country]} +{getCountryCallingCode(country)}
      </option>
    ))}
  </select>
);

// Custom UserCountrySelect component for user's country (without calling codes)
const UserCountrySelect = ({ value, onChange, labels, ...rest }) => (
  <select
    {...rest}
    value={value}
    onChange={(event) => onChange(event.target.value || undefined)}
  >
    <option value="">Select your country</option>
    {getCountries().map((country) => (
      <option key={country} value={labels[country]}>
        {labels[country]}
      </option>
    ))}
  </select>
);

export default function GuestDetails() {
  const navigate = useNavigate();
  const { reservation, update } = useReservation();

  // Custom styles for phone input
  const phoneInputStyles = `
    .phone-input-custom {
      --PhoneInputCountryFlag-height: 1.2em;
      --PhoneInputCountrySelectArrow-color: #d3af37;
      --PhoneInput-color--focus: #d3af37;
    }
    
    .phone-input-custom .PhoneInputInput {
      border: 1px solid #d1d5db;
      border-radius: 0.75rem;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5rem;
      width: 100%;
      outline: none;
      transition: all 0.2s;
    }
    
    .phone-input-custom .PhoneInputInput:focus {
      border-color: #d3af37;
      box-shadow: 0 0 0 2px rgba(211, 175, 55, 0.2);
    }
    
    .phone-input-custom .PhoneInputCountrySelect {
      border: 1px solid #d1d5db;
      border-radius: 0.75rem 0 0 0.75rem;
      padding: 0.5rem;
      background: white;
      border-right: none;
    }
    
    .phone-input-custom .PhoneInputCountrySelect:focus {
      border-color: #d3af37;
    }
    
    .phone-input-error .PhoneInputInput,
    .phone-input-error .PhoneInputCountrySelect {
      border-color: #ef4444;
      background-color: #fef2f2;
    }
    
    .phone-input-success .PhoneInputInput,
    .phone-input-success .PhoneInputCountrySelect {
      border-color: #10b981;
      background-color: #f0fdf4;
    }
  `;

  // Guard: if user didn't pick package/dates, send back to start
  useEffect(() => {
    if (!reservation?.packageId || !reservation?.checkIn || !reservation?.checkOut) {
      navigate("/reserve/start");
    }
  }, [reservation, navigate]);

  // Start form with reservation.guest if present, else empty
  const [form, setForm] = useState(() => ({
    firstName: reservation?.guest?.firstName || "",
    lastName: reservation?.guest?.lastName || "",
    email: reservation?.guest?.email || "",
    phone: reservation?.guest?.phone || "",
    country: reservation?.guest?.country || "", // User's country
    countryCode: reservation?.guest?.countryCode || "LK", // Phone country code
    phoneNumber: reservation?.guest?.phoneNumber || "",
  }));

  const [loading, setLoading] = useState(false);
  const [prefillError, setPrefillError] = useState("");
  const [errors, setErrors] = useState({});

  // Prefill user info if logged in
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Only prefill if we don't have any user data yet
      if (!form.email || !form.firstName || !form.lastName || !form.phoneNumber) {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            setLoading(true);
            setPrefillError("");
            const res = await fetch(ME_URL, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
              const response = await res.json();
              if (mounted && response) {
                if (import.meta.env.DEV) {
                  console.log("User profile data:", response);
                }
                const me = response.user || response; // Handle both response structures
                if (import.meta.env.DEV) {
                  console.log("Extracted user data:", me);
                }
                let phoneData = { countryCode: "LK", phoneNumber: "" };
                if (me.phone) {
                  if (import.meta.env.DEV) {
                    console.log("User phone number:", me.phone);
                  }
                  try {
                    const phoneStr = me.phone.toString();
                    if (import.meta.env.DEV) {
                      console.log("Phone string:", phoneStr);
                    }
                    
                      if (phoneStr.startsWith("+")) {
                        // International format: +94XXXXXXXXX
                        // Check common country codes first for better performance
                        const commonCountries = ['LK', 'IN', 'US', 'GB', 'AU', 'CA', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI'];
                        const allCountries = getCountries();
                        
                        // Try common countries first
                        for (const country of commonCountries) {
                          const callingCode = getCountryCallingCode(country);
                          if (phoneStr.startsWith(`+${callingCode}`)) {
                            phoneData = {
                              countryCode: country,
                              phoneNumber: phoneStr.substring(`+${callingCode}`.length),
                            };
                            if (import.meta.env.DEV) {
                              console.log("✅ Parsed phone data (international format):", phoneData);
                            }
                            break;
                          }
                        }
                        
                        // If not found in common countries, check all countries
                        if (phoneData.phoneNumber === "") {
                          for (const country of allCountries) {
                            const callingCode = getCountryCallingCode(country);
                            if (phoneStr.startsWith(`+${callingCode}`)) {
                              phoneData = {
                                countryCode: country,
                                phoneNumber: phoneStr.substring(`+${callingCode}`.length),
                              };
                              if (import.meta.env.DEV) {
                                console.log("✅ Parsed phone data (international format):", phoneData);
                              }
                              break;
                            }
                          }
                        }
                      if (phoneData.phoneNumber === "") {
                        if (import.meta.env.DEV) {
                          console.warn("❌ Could not parse international phone number, phoneData:", phoneData);
                        }
                      }
                    } else {
                      // Local format: assume Sri Lanka if no country code
                      if (import.meta.env.DEV) {
                        console.log("📱 Local phone format detected, assuming Sri Lanka");
                      }
                      phoneData = {
                        countryCode: "LK", // Default to Sri Lanka
                        phoneNumber: phoneStr,
                      };
                      if (import.meta.env.DEV) {
                        console.log("✅ Parsed phone data (local format):", phoneData);
                      }
                    }
                  } catch (e) {
                    console.warn("Could not parse phone number:", e);
                  }
                } else {
                  if (import.meta.env.DEV) {
                    console.log("❌ No phone number in user profile");
                  }
                }

                setForm((f) => {
                  const newFormData = {
                    ...f,
                    firstName: me.firstName || f.firstName,
                    lastName: me.lastName || f.lastName,
                    email: me.email || f.email,
                    phone: me.phone || f.phone,
                    country: me.country || f.country,
                    countryCode: phoneData.countryCode || f.countryCode,
                    phoneNumber: phoneData.phoneNumber || f.phoneNumber,
                  };
                  if (import.meta.env.DEV) {
                    console.log("Setting form data:", newFormData);
                  }
                  return newFormData;
                });
              }
            } else {
              if (mounted) setPrefillError("Could not auto-fill from server profile (using fallback).");
            }
          } catch (err) {
            console.warn("Profile fetch failed:", err);
            if (mounted) setPrefillError("Could not auto-fill from server profile (using fallback).");
          } finally {
            mounted && setLoading(false);
          }
        }

        // localStorage fallback
        if (mounted) {
          const raw = localStorage.getItem("user");
          if (raw) {
            try {
              const u = JSON.parse(raw);
              if (import.meta.env.DEV) {
                console.log("LocalStorage user data:", u);
              }
              let phoneData = { countryCode: "LK", phoneNumber: "" };
              if (u.phone) {
                if (import.meta.env.DEV) {
                  console.log("LocalStorage phone number:", u.phone);
                }
                try {
                  const phoneStr = u.phone.toString();
                  if (phoneStr.startsWith("+")) {
                    // International format: +94XXXXXXXXX
                    const countries = getCountries();
                    for (const country of countries) {
                      const callingCode = getCountryCallingCode(country);
                      if (phoneStr.startsWith(`+${callingCode}`)) {
                        phoneData = {
                          countryCode: country,
                          phoneNumber: phoneStr.substring(`+${callingCode}`.length),
                        };
                        console.log("Parsed localStorage phone data (international):", phoneData);
                        break;
                      }
                    }
                  } else {
                    // Local format: assume Sri Lanka if no country code
                    console.log("📱 LocalStorage local phone format detected, assuming Sri Lanka");
                    phoneData = {
                      countryCode: "LK", // Default to Sri Lanka
                      phoneNumber: phoneStr,
                    };
                    console.log("Parsed localStorage phone data (local):", phoneData);
                  }
                } catch (e) {
                  console.warn("Could not parse phone number:", e);
                }
              }

              setForm((f) => ({
                ...f,
                firstName: u.firstName || f.firstName,
                lastName: u.lastName || f.lastName,
                email: u.email || f.email,
                phone: u.phone || f.phone,
                country: u.country || f.country,
                countryCode: phoneData.countryCode || f.countryCode,
                phoneNumber: phoneData.phoneNumber || f.phoneNumber,
              }));
            } catch {
              if (!prefillError) setPrefillError("Could not auto-fill profile (using fallback).");
            }
          }
        }
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update reservation as user edits
  useEffect(() => {
    const combinedPhone = getCombinedPhone();
    update({
      guest: {
        ...form,
        phone: combinedPhone,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Combine phone with country code
  const getCombinedPhone = () => {
    if (form.countryCode && form.phoneNumber) {
      try {
        const callingCode = getCountryCallingCode(form.countryCode);
        return `+${callingCode}${form.phoneNumber}`;
      } catch {
        return form.phone || "";
      }
    }
    return form.phone || "";
  };

  // Validation functions
  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    else if (form.firstName.trim().length < 2) newErrors.firstName = "First name must be at least 2 characters";

    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    else if (form.lastName.trim().length < 2) newErrors.lastName = "Last name must be at least 2 characters";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Please enter a valid email address";

    if (!form.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (form.phoneNumber.length < 7) newErrors.phoneNumber = "Please enter a valid phone number";

    if (!form.country.trim()) newErrors.country = "Country is required";

    if (!form.countryCode) newErrors.countryCode = "Phone country code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (key, value) => {
    const newErrors = { ...errors };
    if (value && value.trim()) delete newErrors[key];
    else newErrors[key] = `${key.replace(/([A-Z])/g, " $1")} is required`;
    setErrors(newErrors);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validate()) return alert("Please fix the highlighted fields before continuing.");
    navigate("/reserve/summary");
  };

  const label = (t) => (
    <label className="block mb-1 text-sm font-medium" style={{ color: "#0a0a0a" }}>
      {t} <span className="text-red-600">*</span>
    </label>
  );

  return (
    <div className="flex flex-col flex-1">
      <style>{phoneInputStyles}</style>
      <h1 className="mb-6 text-2xl font-semibold md:text-3xl">Your personal info</h1>

      {prefillError && (
        <div className="px-3 py-2 mb-4 text-sm border rounded-lg border-amber-300 bg-amber-50">
          {prefillError}
        </div>
      )}

      <form onSubmit={handleNext} className="flex flex-col flex-1 p-6 space-y-5 bg-white shadow rounded-2xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            {label("First Name")}
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              onBlur={(e) => validateField("firstName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:ring-2 ${
                errors.firstName
                  ? "border-red-500 bg-red-50"
                  : form.firstName
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300"
              }`}
            />
          </div>

          <div>
            {label("Last Name")}
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              onBlur={(e) => validateField("lastName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-xl focus:ring-2 ${
                errors.lastName
                  ? "border-red-500 bg-red-50"
                  : form.lastName
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        <div>
          {label("Email Address")}
          <input
            type="email"
            value={form.email}
            disabled
            className="w-full px-3 py-2 border rounded-xl bg-neutral-100 text-neutral-600"
            title="Email comes from your account and cannot be changed here"
          />
        </div>

        <div>
          {label("Country")}
          <UserCountrySelect
            value={form.country}
            onChange={(value) => {
              set("country", value);
              validateField("country", value);
            }}
            labels={en}
            className={`w-full px-3 py-2 border outline-none rounded-xl focus:ring-2 ${
              errors.country
                ? "border-red-500 bg-red-50"
                : form.country
                ? "border-green-500 bg-green-50"
                : "border-gray-300"
            }`}
            style={{ fontSize: "16px" }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            {label("Phone Country Code")}
            {/* Country selector with calling codes */}
            <CountrySelect
              value={form.countryCode}
              onChange={(value) => {
                set("countryCode", value);
                validateField("countryCode", value);
              }}
              labels={en}
              className={`w-full px-3 py-2 border outline-none rounded-xl focus:ring-2 ${
                errors.countryCode
                  ? "border-red-500 bg-red-50"
                  : form.countryCode
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300"
              }`}
              style={{ fontSize: "16px" }}
            />
          </div>

          <div className="md:col-span-2">
            {label("Mobile Number")}
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              onBlur={(e) => validateField("phoneNumber", e.target.value)}
              placeholder="Enter mobile number"
              className={`w-full px-3 py-2 border rounded-xl focus:ring-2 ${
                errors.phoneNumber
                  ? "border-red-500 bg-red-50"
                  : form.phoneNumber
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        <div className="pt-2 mt-auto">
          <button
            type="submit"
            className="w-full px-6 py-3 font-medium md:w-auto rounded-xl"
            style={{ background: "#d3af37", color: "#0a0a0a" }}
          >
            Next step
          </button>
        </div>
      </form>
    </div>
  );
}

function ValidTick() {
  return (
    <span className="absolute p-1 -translate-y-1/2 border rounded-full right-2 top-1/2 border-emerald-300 bg-emerald-50">
      <Check className="w-4 h-4 text-emerald-700" />
    </span>
  );
}
