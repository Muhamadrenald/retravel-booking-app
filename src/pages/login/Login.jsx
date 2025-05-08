import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsEyeSlash, BsEye, BsGoogle } from "react-icons/bs";
import "./index.css"; // Import file CSS
import useAuthAPI from "../../hooks/useAuthAPI"; // Import custom hook

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Gunakan custom hook untuk API
  const { login, isLoading } = useAuthAPI();

  const togglePasswordView = () => setShowPassword(!showPassword);

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

  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah reload saat submit

    // Validasi email dan password sebelum melanjutkan
    if (!email) {
      setEmailError("Please enter a valid email.");
      return;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      return;
    }

    if (emailError) {
      return;
    }

    // Panggil fungsi login dari custom hook
    const isSuccess = await login(email, password);

    if (isSuccess) {
      console.log("Login successful, redirect handled by useAuthAPI");
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Left section with image - Increased width for more columns */}
      <div className="hidden md:block md:w-2/3 h-screen relative">
        <img
          src="/travel.jpg"
          alt="Travel image"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* <div className="absolute bottom-4 left-4 text-xs text-white">
          Photo by Muhamad Renald
        </div> */}
      </div>

      {/* Right section with login form - Reduced width */}
      <div className="w-full md:w-1/3 px-8 py-8 md:px-16 flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          {/* <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
            <h1 className="ml-2 text-xl font-bold">UI Unicorn</h1>
          </div> */}

          <h2 className="text-2xl font-bold mb-6">Nice to see you again</h2>

          <form className="flex flex-col w-full gap-5" onSubmit={handleLogin}>
            <div className="flex flex-col">
              <label className="text-sm mb-2">Login</label>
              <input
                type="email"
                placeholder="Email or phone number"
                className="w-full p-3 border border-gray-200 rounded-md bg-gray-50"
                value={email}
                onChange={(e) => validateEmail(e.target.value)}
                disabled={isLoading}
                required
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-500">{emailError}</p>
              )}
            </div>

            <div className="flex flex-col relative">
              <label className="text-sm mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full p-3 border border-gray-200 rounded-md bg-gray-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <div
                className="absolute right-3 top-10 cursor-pointer"
                onClick={togglePasswordView}
              >
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-red-500">{passwordError}</p>
              )}
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="mr-2"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label htmlFor="remember" className="text-sm">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-500">
                  Forgot password?
                </a>
              </div>
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
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              className="w-full p-3 flex items-center justify-center bg-gray-800 text-white rounded-md hover:bg-gray-900"
            >
              <BsGoogle className="mr-2" />
              Or sign in with Google
            </button>

            <div className="text-center mt-4">
              <span className="text-sm">Don't have an account? </span>
              <span
                className="text-sm text-blue-500 cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Sign up now
              </span>
            </div>
          </form>

          <div className="mt-16 text-center text-xs text-gray-500">
            © Muhamad Renald 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
