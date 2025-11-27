// src/Pages/register.jsx
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
//import logo from "..assets/logo.png";
import logo from "../../../assets/logo.png";

// If you DO have this library installed, uncomment the next line:
// import { parsePhoneNumberFromString } from "libphonenumber-js";


// Your axios instance (keep your path as-is)
import api from "../../../../utils/api";

const BRAND = {
  primary: "#D4AF37",
  primaryDark: "#A8841A",
  primarySoft: "#FFF4CF",
  ink: "#0F172A",
};

// Country data with flags and codes
const countries = [
  { code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+91', flag: '🇮🇳', name: 'India' },
  { code: '+1', flag: '🇺🇸', name: 'United States' },
  { code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+61', flag: '🇦🇺', name: 'Australia' },
  { code: '+86', flag: '🇨🇳', name: 'China' },
  { code: '+81', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+49', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', flag: '🇫🇷', name: 'France' },
  { code: '+39', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', flag: '🇪🇸', name: 'Spain' },
  { code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { code: '+47', flag: '🇳🇴', name: 'Norway' },
  { code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { code: '+43', flag: '🇦🇹', name: 'Austria' },
  { code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+30', flag: '🇬🇷', name: 'Greece' },
  { code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { code: '+7', flag: '🇷🇺', name: 'Russia' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { code: '+1', flag: '🇨🇦', name: 'Canada' },
  { code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+220', flag: '🇬🇲', name: 'Gambia' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritania' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+224', flag: '🇬🇳', name: 'Guinea' },
  { code: '+225', flag: '🇨🇮', name: 'Ivory Coast' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+229', flag: '🇧🇯', name: 'Benin' },
  { code: '+230', flag: '🇲🇺', name: 'Mauritius' },
  { code: '+231', flag: '🇱🇷', name: 'Liberia' },
  { code: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: '+235', flag: '🇹🇩', name: 'Chad' },
  { code: '+236', flag: '🇨🇫', name: 'Central African Republic' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroon' },
  { code: '+238', flag: '🇨🇻', name: 'Cape Verde' },
  { code: '+239', flag: '🇸🇹', name: 'Sao Tome and Principe' },
  { code: '+240', flag: '🇬🇶', name: 'Equatorial Guinea' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+242', flag: '🇨🇬', name: 'Republic of the Congo' },
  { code: '+243', flag: '🇨🇩', name: 'Democratic Republic of the Congo' },
  { code: '+244', flag: '🇦🇴', name: 'Angola' },
  { code: '+245', flag: '🇬🇼', name: 'Guinea-Bissau' },
  { code: '+246', flag: '🇮🇴', name: 'British Indian Ocean Territory' },
  { code: '+247', flag: '🇦🇨', name: 'Ascension Island' },
  { code: '+248', flag: '🇸🇨', name: 'Seychelles' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+252', flag: '🇸🇴', name: 'Somalia' },
  { code: '+253', flag: '🇩🇯', name: 'Djibouti' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+257', flag: '🇧🇮', name: 'Burundi' },
  { code: '+258', flag: '🇲🇿', name: 'Mozambique' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
  { code: '+262', flag: '🇷🇪', name: 'Reunion' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },
  { code: '+264', flag: '🇳🇦', name: 'Namibia' },
  { code: '+265', flag: '🇲🇼', name: 'Malawi' },
  { code: '+266', flag: '🇱🇸', name: 'Lesotho' },
  { code: '+267', flag: '🇧🇼', name: 'Botswana' },
  { code: '+268', flag: '🇸🇿', name: 'Eswatini' },
  { code: '+269', flag: '🇰🇲', name: 'Comoros' },
  { code: '+290', flag: '🇸🇭', name: 'Saint Helena' },
  { code: '+291', flag: '🇪🇷', name: 'Eritrea' },
  { code: '+297', flag: '🇦🇼', name: 'Aruba' },
  { code: '+298', flag: '🇫🇴', name: 'Faroe Islands' },
  { code: '+299', flag: '🇬🇱', name: 'Greenland' },
  { code: '+350', flag: '🇬🇮', name: 'Gibraltar' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+373', flag: '🇲🇩', name: 'Moldova' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+376', flag: '🇦🇩', name: 'Andorra' },
  { code: '+377', flag: '🇲🇨', name: 'Monaco' },
  { code: '+378', flag: '🇸🇲', name: 'San Marino' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia and Herzegovina' },
  { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
  { code: '+500', flag: '🇫🇰', name: 'Falkland Islands' },
  { code: '+501', flag: '🇧🇿', name: 'Belize' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+507', flag: '🇵🇦', name: 'Panama' },
  { code: '+508', flag: '🇵🇲', name: 'Saint Pierre and Miquelon' },
  { code: '+509', flag: '🇭🇹', name: 'Haiti' },
  { code: '+590', flag: '🇬🇵', name: 'Guadeloupe' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+592', flag: '🇬🇾', name: 'Guyana' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+594', flag: '🇬🇫', name: 'French Guiana' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+596', flag: '🇲🇶', name: 'Martinique' },
  { code: '+597', flag: '🇸🇷', name: 'Suriname' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+599', flag: '🇧🇶', name: 'Caribbean Netherlands' },
  { code: '+670', flag: '🇹🇱', name: 'East Timor' },
  { code: '+672', flag: '🇦🇶', name: 'Antarctica' },
  { code: '+673', flag: '🇧🇳', name: 'Brunei' },
  { code: '+674', flag: '🇳🇷', name: 'Nauru' },
  { code: '+675', flag: '🇵🇬', name: 'Papua New Guinea' },
  { code: '+676', flag: '🇹🇴', name: 'Tonga' },
  { code: '+677', flag: '🇸🇧', name: 'Solomon Islands' },
  { code: '+678', flag: '🇻🇺', name: 'Vanuatu' },
  { code: '+679', flag: '🇫🇯', name: 'Fiji' },
  { code: '+680', flag: '🇵🇼', name: 'Palau' },
  { code: '+681', flag: '🇼🇫', name: 'Wallis and Futuna' },
  { code: '+682', flag: '🇨🇰', name: 'Cook Islands' },
  { code: '+683', flag: '🇳🇺', name: 'Niue' },
  { code: '+684', flag: '🇦🇸', name: 'American Samoa' },
  { code: '+685', flag: '🇼🇸', name: 'Samoa' },
  { code: '+686', flag: '🇰🇮', name: 'Kiribati' },
  { code: '+687', flag: '🇳🇨', name: 'New Caledonia' },
  { code: '+688', flag: '🇹🇻', name: 'Tuvalu' },
  { code: '+689', flag: '🇵🇫', name: 'French Polynesia' },
  { code: '+690', flag: '🇹🇰', name: 'Tokelau' },
  { code: '+691', flag: '🇫🇲', name: 'Micronesia' },
  { code: '+692', flag: '🇲🇭', name: 'Marshall Islands' },
  { code: '+850', flag: '🇰🇵', name: 'North Korea' },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+853', flag: '🇲🇴', name: 'Macau' },
  { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
  { code: '+856', flag: '🇱🇦', name: 'Laos' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+975', flag: '🇧🇹', name: 'Bhutan' },
  { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' }
];

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Safe phone validation that works with OR without libphonenumber-js
function validatePhoneWithLib(phone) {
  try {
    // If the lib is installed AND imported, use the robust check
    // eslint-disable-next-line no-undef
    if (typeof parsePhoneNumberFromString === "function") {
      // eslint-disable-next-line no-undef
      const p = parsePhoneNumberFromString(phone);
      if (!p) return { valid: false };
      return { valid: p.isValid(), formatted: p.formatInternational(), country: p.country };
    }
  } catch (_) {
    // fall through to simple regex below
  }
  // Fallback: simple regex (not perfect, but avoids crashes when lib isn't present)
  return { valid: /^\+?[0-9()\s-]{7,}$/.test(phone) };
}

function passwordStrength(pw) {
  let score = 0;
  if (!pw || pw.length < 8) return { score, label: "Too short" };
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Very weak", "Weak", "Okay", "Good", "Strong"];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [isDemoFilled, setIsDemoFilled] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+94', flag: '🇱🇰', name: 'Sri Lanka' });
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState(countries);

  const pwStrength = useMemo(() => passwordStrength(form.password), [form.password]);
  const pwPercent = Math.round((pwStrength.score / 4) * 100);

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: null })); // clear per-field error on change
    
    // Reset demo state when user manually changes any field
    if (isDemoFilled) {
      setIsDemoFilled(false);
    }
  }

  function fillDemoData() {
    // Demo data for auto-filling the user registration form
    const demoUsers = [
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        password: "DemoPass123",
        passwordConfirm: "DemoPass123",
        phone: "+94 77 123 4567"
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@example.com",
        password: "SecurePass456",
        passwordConfirm: "SecurePass456",
        phone: "+94 76 987 6543"
      },
      {
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@example.com",
        password: "TestUser789",
        passwordConfirm: "TestUser789",
        phone: "+94 75 555 1234"
      }
    ];

    // Randomly select a demo user
    const randomDemo = demoUsers[Math.floor(Math.random() * demoUsers.length)];
    
    setForm({
      firstName: randomDemo.firstName,
      lastName: randomDemo.lastName,
      email: randomDemo.email,
      password: randomDemo.password,
      passwordConfirm: randomDemo.passwordConfirm,
      phone: randomDemo.phone,
    });
    
    // Set country for demo data
    setSelectedCountry({ code: '+94', flag: '🇱🇰', name: 'Sri Lanka' });

    // Clear any existing errors
    setErrors({});

    // Set demo state
    setIsDemoFilled(true);

    // Show success message
    toast.success("Demo data filled! You can modify any fields before submitting.");
  }

  function clientValidate() {
    const e = {};
    const firstName = (form.firstName || "").trim();
    const lastName = (form.lastName || "").trim();
    const email = (form.email || "").trim();
    const phone = (form.phone || "").trim();
    const password = form.password;
    const passwordConfirm = form.passwordConfirm;

    if (!firstName) e.firstName = "First name is required";
    if (!lastName) e.lastName = "Last name is required";

    if (!email) e.email = "Email is required";
    else if (!validateEmail(email)) e.email = "Enter a valid email address";

    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    else {
      if (!/[A-Z]/.test(password)) e.password = "Include at least one uppercase letter";
      else if (!/[0-9]/.test(password)) e.password = "Include at least one number";
    }

    if (!passwordConfirm) e.passwordConfirm = "Please confirm your password";
    else if (password !== passwordConfirm) e.passwordConfirm = "Passwords do not match";

    if (phone) {
      const fullPhone = `${selectedCountry.code} ${phone}`;
      const ph = validatePhoneWithLib(fullPhone);
      if (!ph.valid) e.phone = "Enter a valid phone number";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function mapServerErrors(resp) {
    const result = {};
    const d = resp?.data;
    if (d?.errors && typeof d.errors === "object") Object.assign(result, d.errors);

    if (resp?.status === 409) {
      // Handle email conflicts
      if (d?.email) result.email = d.email;
      else if (d?.message && /email/i.test(d.message)) result.email = d.message;
      else if (d?.message && /email/i.test(d.message)) result.email = d.message;
      
      // Handle phone conflicts
      if (d?.message && /phone/i.test(d.message)) result.phone = "This phone number is already registered";
      else if (d?.errors?.phone) result.phone = d.errors.phone;
      
      // Default email error if no specific field error
      if (!result.email && !result.phone) {
        result.email = d?.message || "Email already in use";
      }
    }

    if (!Object.keys(result).length && d?.message) {
      if (/email/i.test(d.message)) result.email = d.message;
      else if (/phone/i.test(d.message)) result.phone = d.message;
      else result.general = d.message;
    }
    return result;
  }

  async function submit(ev) {
    ev.preventDefault();

    if (!clientValidate()) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        password: form.password,
        phone: form.phone ? `${selectedCountry.code} ${form.phone.trim()}` : undefined,
      };

      const res = await api.post("/user/register", payload);

      toast.success(res?.data?.message || "Account created — please log in");
      setTimeout(() => navigate("/login", { replace: true }), 700);
    } catch (err) {
      const resp = err?.response;
      if (!resp) {
        toast.error("Cannot reach server. Check backend URL.");
        setLoading(false);
        return;
      }

      const mapped = mapServerErrors(resp);
      setErrors((s) => ({ ...s, ...mapped }));

      if (resp.data?.message && !mapped.general && !mapped.email && !mapped.phone && !mapped.password) {
        toast.error(resp.data.message);
      } else if (!Object.keys(mapped).length) {
        toast.error("Registration failed. Please check the form.");
      }

      // Handle specific conflict errors
      if (resp.status === 409) {
        if (resp.data?.message && /phone/i.test(resp.data.message) && !mapped.phone) {
          setErrors((s) => ({ ...s, phone: "This phone number is already registered" }));
        } else if (resp.data?.message && /email/i.test(resp.data.message) && !mapped.email) {
          setErrors((s) => ({ ...s, email: resp.data.message }));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left / Branding */}
        <div className="hidden md:flex flex-col justify-between rounded-3xl bg-white shadow-lg border p-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              {/* ✅ Logo from public */}
             <img src={logo} alt="logo" className="h-14 w-14 object-contain rounded-full" />
              <div>
                <h2 className="text-2xl font-extrabold" style={{ color: BRAND.ink }}>
                  Hasthi Safari Cottage
                </h2>
                <p className="text-sm text-gray-600">Create your account and start booking</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <p>Member benefits</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Member-only discounts</li>
                <li>Easy booking & cancellations</li>
                <li>Manage reservations and preferences</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            © {new Date().getFullYear()} Hasthi Safari Cottage — Built with care.
          </div>
        </div>

        {/* Right / Form */}
        <form onSubmit={submit} className="bg-white rounded-3xl p-8 shadow-lg border" noValidate>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* ✅ Same logo path */}
               <img src={logo} alt="logo" className="h-14 w-14 object-contain rounded-full" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold" style={{ color: BRAND.ink }}>
                    Create an account
                  </h3>
                  {isDemoFilled && (
                    <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: BRAND.primary, color: 'white' }}>
                      Demo Data
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">Enter details to begin — it's quick and free.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fillDemoData}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors"
                style={{ backgroundColor: BRAND.primary }}
                onMouseEnter={(e) => e.target.style.backgroundColor = BRAND.primaryDark}
                onMouseLeave={(e) => e.target.style.backgroundColor = BRAND.primary}
              >
                Demo Fill
              </button>
              <div className="text-sm">
                <Link to="/login" className="text-sm font-medium" style={{ color: BRAND.primaryDark }}>
                  Already have an account?
                </Link>
              </div>
            </div>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">First name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none ${
                  errors.firstName ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="Asha"
                aria-invalid={!!errors.firstName}
                autoComplete="given-name"
              />
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none ${
                  errors.lastName ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="Kumar"
                aria-invalid={!!errors.lastName}
                autoComplete="family-name"
              />
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
              className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none ${
                errors.email ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="Choose a strong password"
                aria-invalid={!!errors.password}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm rounded-md"
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{ color: BRAND.primaryDark, backgroundColor: BRAND.primarySoft }}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    style={{
                      width: `${pwPercent}%`,
                      height: "100%",
                      background:
                        pwStrength.score >= 3 ? BRAND.primary : pwStrength.score === 2 ? "#f59e0b" : "#ef4444",
                    }}
                    className="transition-all"
                  />
                </div>
                <div className="text-gray-500">{pwStrength.label}</div>
              </div>

              {errors.password && <div className="text-red-600">{errors.password}</div>}
            </div>
          </div>

          {/* Confirm password */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              name="passwordConfirm"
              type={showPw ? "text" : "password"}
              value={form.passwordConfirm}
              onChange={(e) => setField("passwordConfirm", e.target.value)}
              className={`mt-1 w-full rounded-md border px-3 py-2 focus:outline-none ${
                errors.passwordConfirm ? "border-red-400" : "border-gray-200"
              }`}
              placeholder="Repeat password"
              aria-invalid={!!errors.passwordConfirm}
              autoComplete="new-password"
            />
            {errors.passwordConfirm && <p className="text-xs text-red-600 mt-1">{errors.passwordConfirm}</p>}
          </div>

          {/* Phone with Country Code */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Phone (optional)</label>
            <div className="flex gap-2">
              {/* Country Code Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCountryPicker(!showCountryPicker)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-sm font-medium">{selectedCountry.code}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Country Dropdown */}
                {showCountryPicker && (
                  <div className="absolute top-full left-0 z-50 w-64 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search countries..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => {
                          const search = e.target.value.toLowerCase();
                          setFilteredCountries(countries.filter(country => 
                            country.name.toLowerCase().includes(search) || 
                            country.code.includes(search)
                          ));
                        }}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {countries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setShowCountryPicker(false);
                            setFilteredCountries(countries);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
                        >
                          <span className="text-lg">{country.flag}</span>
                          <span className="text-sm font-medium">{country.code}</span>
                          <span className="text-sm text-gray-600">{country.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Phone Number Input */}
              <input
                name="phone"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                className={`flex-1 rounded-md border px-3 py-2 focus:outline-none ${
                  errors.phone ? "border-red-400" : "border-gray-200"
                }`}
                placeholder="77 123 4567"
                aria-invalid={!!errors.phone}
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            {!errors.phone && form.phone && (
              <p className="text-xs text-gray-400 mt-1">Full number: {selectedCountry.code} {form.phone}</p>
            )}
          </div>

          {/* Submit */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold shadow disabled:opacity-60"
              style={{
                backgroundImage: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.primaryDark} 100%)`,
              }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-sm text-gray-500">
            By creating an account you agree to our{" "}
            <Link to="/policies" className="text-indigo-700 underline">
              Terms & Privacy
            </Link>
            . Already a member? <Link to="/login" className="font-medium">Sign in</Link>.
          </div>
        </form>
      </div>
    </div>
  );
}
