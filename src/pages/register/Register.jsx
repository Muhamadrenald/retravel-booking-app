import { MdAlternateEmail, MdPerson } from "react-icons/md";
import {
  FaFingerprint,
  FaRegEye,
  FaRegEyeSlash,
  FaPhone,
  FaUsersCog,
} from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="flex items-center justify-center w-full h-screen login-page register-page">
      <div className="w-[90%] max-w-sm md:max-w-md lg:max-w-md p-5 bg-gray-900 flex-col flex items-center gap-3 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <img src="/travel.png" alt="logo" className="w-[50px]" />
          <span className="text-2xl font-bold text-primary">ReTravel</span>
        </div>
        <h1 className="text-lg font-semibold md:text-xl">Create an Account</h1>
        <p className="text-xs text-center text-gray-500 md:text-sm">
          Already have an account?
          <span
            className="text-white cursor-pointer"
            onClick={() => navigate("/login")}
          >
            {" "}
            Login
          </span>
        </p>

        <form className="flex flex-col w-full gap-3" onSubmit={handleRegister}>
          {/* Input Name */}
          <div className="flex flex-col w-full">
            <div className="flex items-center w-full gap-2 p-2 bg-gray-800 rounded-xl">
              <MdPerson />
              <input
                type="text"
                placeholder="Full Name"
                className="w-full text-sm bg-transparent border-0 outline-none md:text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Input Email */}
          <div className="flex flex-col w-full">
            <div className="flex items-center w-full gap-2 p-2 bg-gray-800 rounded-xl">
              <MdAlternateEmail />
              <input
                type="email"
                placeholder="Email address"
                className="w-full text-sm bg-transparent border-0 outline-none md:text-base"
                value={email}
                onChange={(e) => validateEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            {emailError && (
              <p className="mt-1 text-xs text-red-500">{emailError}</p>
            )}
          </div>

          {/* Input Phone */}
          <div className="flex flex-col w-full">
            <div className="flex items-center w-full gap-2 p-2 bg-gray-800 rounded-xl">
              <FaPhone />
              <input
                type="tel"
                placeholder="Phone Number (e.g. +628123456789)"
                className="w-full text-sm bg-transparent border-0 outline-none md:text-base"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="flex flex-col w-full">
            <div className="flex items-center w-full gap-2 p-2 bg-gray-800 rounded-xl">
              <FaUsersCog />
              <select
                className="w-full text-sm bg-transparent border-0 outline-none md:text-base"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
                required
              >
                <option value="user" className="bg-gray-800">
                  User
                </option>
                <option value="admin" className="bg-gray-800">
                  Admin
                </option>
              </select>
            </div>
          </div>

          {/* Input Password */}
          <div className="flex flex-col w-full">
            <div className="relative flex items-center w-full gap-2 p-2 bg-gray-800 rounded-xl">
              <FaFingerprint />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full text-sm bg-transparent border-0 outline-none md:text-base"
                value={password}
                onChange={(e) => validatePassword(e.target.value)}
                disabled={isLoading}
                required
              />
              {showPassword ? (
                <FaRegEyeSlash
                  className="absolute cursor-pointer right-5"
                  onClick={togglePasswordView}
                />
              ) : (
                <FaRegEye
                  className="absolute cursor-pointer right-5"
                  onClick={togglePasswordView}
                />
              )}
            </div>
            {passwordError && (
              <p className="mt-1 text-xs text-red-500">{passwordError}</p>
            )}
          </div>

          {/* Input Confirm Password */}
          <div className="flex flex-col w-full">
            <div className="relative flex items-center w-full gap-2 p-2 bg-gray-800 rounded-xl">
              <FaFingerprint />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full text-sm bg-transparent border-0 outline-none md:text-base"
                value={passwordRepeat}
                onChange={(e) => validatePasswordRepeat(e.target.value)}
                disabled={isLoading}
                required
              />
              {showConfirmPassword ? (
                <FaRegEyeSlash
                  className="absolute cursor-pointer right-5"
                  onClick={toggleConfirmPasswordView}
                />
              ) : (
                <FaRegEye
                  className="absolute cursor-pointer right-5"
                  onClick={toggleConfirmPasswordView}
                />
              )}
            </div>
            {passwordRepeatError && (
              <p className="mt-1 text-xs text-red-500">{passwordRepeatError}</p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full p-2 mt-3 text-sm rounded-xl md:text-base cursor-pointer ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
