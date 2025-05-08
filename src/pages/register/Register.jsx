import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsEyeSlash, BsEye } from "react-icons/bs";
import { MdPerson, MdAlternateEmail } from "react-icons/md";
import { FaPhone, FaUsersCog } from "react-icons/fa";
import "./index.css";
import useAuthAPI from "../../hooks/useAuthAPI";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [passwordRepeatError, setPasswordRepeatError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("user"); // Default role to "user"
  const navigate = useNavigate();

  // Gunakan custom hook untuk API
  const { register, isLoading } = useAuthAPI();

  const togglePasswordView = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordView = () =>
    setShowConfirmPassword(!showConfirmPassword);

  // Validasi email saat input berubah
  const validateEmail = (value) => {
    if (!value.includes("@")) {
      setEmailError("Please include '@' in the email address.");
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError("Invalid email format.");
    } else {
      setEmailError(""); // Reset error jika valid
    }
    setEmail(value);
  };

  // Validasi password
  const validatePassword = (value) => {
    setPassword(value);
    if (value.length < 6) {
      setPasswordError("Password should be at least 6 characters.");
    } else {
      setPasswordError("");
    }

    // Validasi kembali password confirmation
    if (passwordRepeat && value !== passwordRepeat) {
      setPasswordRepeatError("Passwords don't match.");
    } else if (passwordRepeat) {
      setPasswordRepeatError("");
    }
  };

  // Validasi password confirmation
  const validatePasswordRepeat = (value) => {
    setPasswordRepeat(value);
    if (value !== password) {
      setPasswordRepeatError("Passwords don't match.");
    } else {
      setPasswordRepeatError("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); // Mencegah reload saat submit

    // Validasi semua field sebelum submit
    if (!name.trim()) {
      return;
    }

    if (!email || emailError) {
      setEmailError("Please enter a valid email.");
      return;
    }

    if (!password || passwordError) {
      setPasswordError("Please enter a valid password.");
      return;
    }

    if (!passwordRepeat || passwordRepeatError) {
      setPasswordRepeatError("Please confirm your password.");
      return;
    }

    if (password !== passwordRepeat) {
      setPasswordRepeatError("Passwords don't match.");
      return;
    }

    // Membuat objek data pengguna dengan role
    const userData = {
      name,
      email,
      password,
      passwordRepeat,
      phoneNumber: phoneNumber || "+628123456789",
      profilePictureUrl:
        "https://ui-avatars.com/api/?name=" + encodeURIComponent(name),
      role, // Tambahkan role ke data registrasi
    };

    // Panggil fungsi register dari custom hook
    const isSuccess = await register(userData);

    if (isSuccess) {
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Left section with image - Full height with gradient overlay */}
      <div className="hidden md:block md:w-3/5 relative min-h-screen">
        <div className="absolute inset-0">
          <img
            src="/travel.jpg"
            alt="Travel image"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for professional look if image doesn't fill */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>
        </div>
        {/* <div className="absolute bottom-4 left-4 text-xs text-white">
          Photo by Muhamad Renald
        </div> */}
      </div>

      {/* Right section with registration form - Adjusted width and padding */}
      <div className="w-full md:w-2/5 px-8 py-10 md:px-12 flex items-start justify-center">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6">Create an Account</h2>

          <form
            className="flex flex-col w-full gap-4"
            onSubmit={handleRegister}
          >
            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-3 pl-10 border border-gray-200 rounded-md bg-gray-50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <MdPerson className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full p-3 pl-10 border border-gray-200 rounded-md bg-gray-50"
                  value={email}
                  onChange={(e) => validateEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <MdAlternateEmail className="absolute left-3 top-3.5 text-gray-400" />
              </div>
              {emailError && (
                <p className="mt-1 text-xs text-red-500">{emailError}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full p-3 pl-10 border border-gray-200 rounded-md bg-gray-50"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={isLoading}
                />
                <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Role Selection */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Account Type</label>
              <div className="relative">
                <select
                  className="w-full p-3 pl-10 border border-gray-200 rounded-md bg-gray-50 appearance-none"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <FaUsersCog className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full p-3 pl-10 border border-gray-200 rounded-md bg-gray-50"
                  value={password}
                  onChange={(e) => validatePassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <div className="absolute left-3 top-3.5 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.5 11.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm1.5 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
                    <path d="M7 2a1 1 0 0 1 2 0v1h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3V2z" />
                  </svg>
                </div>
                <div
                  className="absolute right-3 top-3.5 cursor-pointer"
                  onClick={togglePasswordView}
                >
                  {showPassword ? (
                    <BsEyeSlash className="text-gray-400" />
                  ) : (
                    <BsEye className="text-gray-400" />
                  )}
                </div>
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-red-500">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col">
              <label className="text-sm mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full p-3 pl-10 border border-gray-200 rounded-md bg-gray-50"
                  value={passwordRepeat}
                  onChange={(e) => validatePasswordRepeat(e.target.value)}
                  disabled={isLoading}
                  required
                />
                <div className="absolute left-3 top-3.5 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.5 11.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm1.5 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
                    <path d="M7 2a1 1 0 0 1 2 0v1h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3V2z" />
                  </svg>
                </div>
                <div
                  className="absolute right-3 top-3.5 cursor-pointer"
                  onClick={toggleConfirmPasswordView}
                >
                  {showConfirmPassword ? (
                    <BsEyeSlash className="text-gray-400" />
                  ) : (
                    <BsEye className="text-gray-400" />
                  )}
                </div>
              </div>
              {passwordRepeatError && (
                <p className="mt-1 text-xs text-red-500">
                  {passwordRepeatError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full p-3 mt-4 text-white font-medium rounded-md ${
                isLoading
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center mt-4">
              <span className="text-sm">Already have an account? </span>
              <span
                className="text-sm text-blue-500 cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Sign in
              </span>
            </div>
          </form>

          <div className="mt-8 text-center text-xs text-gray-500">
            © Muhamad Renald 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
