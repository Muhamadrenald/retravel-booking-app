import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_CONFIG } from "../../api/config";
import Alert from "../../components/alert/Alert";
import Modal from "../../components/modal/Modal";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Determine if user is admin for success message
  const isAdmin = user?.role === "admin";

  // Define labels for all users
  const labels = {
    title: "My Profile",
    subtitle: "Manage your profile information",
    name: "Name",
    email: "Email",
    phoneNumber: "Phone Number",
    role: "Role",
    editButton: "Edit Profile",
    modalTitle: "Edit Profile",
    submitButton: "Save Changes",
    cancelButton: "Cancel",
    profilePicture: "Profile Picture",
    deletePicture: "Delete Profile Picture",
    noDataTitle: "No profile data",
    noDataMessage: "Please login to view your profile",
    loginButton: "Login",
  };

  // Fetch current user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) throw new Error(labels.noDataMessage);

        const response = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CURRENT_USER}`,
          {
            headers: {
              apiKey: API_CONFIG.API_KEY,
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.code === "200") {
          const userData = response.data.data;
          console.log("User data:", userData); // Debug: Check API data
          // Validate role
          const validRoles = ["user", "admin"];
          if (!userData.role || !validRoles.includes(userData.role)) {
            console.warn(
              `Invalid or missing role: ${
                userData.role || "none"
              }. Defaulting to 'user'.`
            );
            userData.role = "user";
          }
          setUser(userData);
          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            phoneNumber: userData.phoneNumber || "",
            role: userData.role,
          });
        } else {
          throw new Error(
            response.data.message || "Failed to fetch user data."
          );
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        let errorMessage = "Failed to load profile.";
        if (err.response) {
          if (err.response.status === 401) {
            localStorage.removeItem("token");
            // window.location.href = "/login";
            errorMessage = "Session expired. Please login again.";
          } else if (err.response.status === 404) {
            errorMessage = "User endpoint not found.";
          } else {
            errorMessage =
              err.response.data.message || "An unknown error occurred.";
          }
        } else {
          errorMessage = err.message || "Network error.";
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [labels.noDataMessage]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = ${value}`); // Debug: Log input changes
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection for profile picture
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file (e.g., JPG, PNG).");
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  // Handle delete profile picture
  const handleDeletePicture = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem("token");
      if (!token)
        throw new Error("Please login to delete your profile picture.");

      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        profilePictureUrl: "",
      };

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}`,
        updateData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.code === "200") {
        setUser((prev) => ({ ...prev, profilePictureUrl: "" }));
        setSuccessMessage("Profile picture deleted successfully!");
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error(
          response.data.message || "Failed to delete profile picture."
        );
      }
    } catch (err) {
      console.error("Error deleting profile picture:", err);
      let errorMessage = "Failed to delete profile picture.";
      if (err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          errorMessage = "Session expired. Please login again.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Invalid data.";
        } else if (err.response.status === 404) {
          errorMessage = "Profile update endpoint not found.";
        } else {
          errorMessage = err.response.data.message || "An error occurred.";
        }
      } else {
        errorMessage = err.message || "Network error.";
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission to update profile and role
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to update your profile.");
      if (!user?.id) throw new Error("User ID not found.");

      console.log("Submitting form with data:", formData); // Debug: Log form data

      let profilePictureUrl = user?.profilePictureUrl || "";
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", selectedFile);

        const uploadResponse = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_IMAGE}`,
          formDataUpload,
          {
            headers: {
              apiKey: API_CONFIG.API_KEY,
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadResponse.data?.code === "200") {
          profilePictureUrl =
            uploadResponse.data.data?.url ||
            uploadResponse.data.url ||
            uploadResponse.data.data?.imageUrl;
          if (!profilePictureUrl) throw new Error("Image URL not found.");
        } else {
          throw new Error(
            uploadResponse.data.message || "Failed to upload image."
          );
        }
      }

      // Update profile data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        profilePictureUrl,
      };

      console.log("Updating profile with:", updateData); // Debug: Log profile update data

      const profileResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}`,
        updateData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (profileResponse.data?.code !== "200") {
        throw new Error(
          profileResponse.data.message || "Failed to update profile."
        );
      }

      // Update role if role has changed
      let roleUpdated = false;
      if (formData.role !== user?.role) {
        console.log("Attempting to update role to:", formData.role); // Debug: Log role update attempt
        console.log(
          "Role update endpoint:",
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER_ROLE(
            user.id
          )}`
        ); // Debug: Log endpoint
        console.log("Role update payload:", {
          user_id: user.id,
          role: formData.role,
        }); // Debug: Log payload

        const roleResponse = await axios.post(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER_ROLE(
            user.id
          )}`,
          { user_id: user.id, role: formData.role },
          {
            headers: {
              apiKey: API_CONFIG.API_KEY,
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Role update response:", roleResponse.data); // Debug: Log role update response

        if (roleResponse.data?.code === "200") {
          roleUpdated = true;
        } else {
          throw new Error(
            roleResponse.data.message || "Failed to update role."
          );
        }
      }

      // Update user state
      setUser((prev) => ({
        ...prev,
        ...updateData,
        role: formData.role,
      }));
      setSuccessMessage(
        roleUpdated
          ? "Profile and role updated successfully!"
          : "Profile updated successfully!"
      );
      setIsModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error updating profile:", err);
      let errorMessage = "Failed to update profile.";
      if (err.response) {
        if (err.response.status === 401) {
          localStorage.removeItem("token");
          // window.location.href = "/login";
          errorMessage = "Session expired. Please login again.";
        } else if (err.response.status === 400) {
          errorMessage = err.response.data.message || "Invalid data.";
        } else if (err.response.status === 404) {
          errorMessage = "Profile or role update endpoint not found.";
        } else {
          errorMessage = err.response.data.message || "An error occurred.";
        }
      } else {
        errorMessage = err.message || "Network error.";
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear alert messages
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Format role for display
  const formatRole = (role) =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : "Not available";

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {labels.title}
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
            {labels.subtitle}
          </p>

          {successMessage && (
            <Alert
              type="success"
              message={successMessage}
              onClose={clearMessages}
            />
          )}
          {error && (
            <Alert type="error" message={error} onClose={clearMessages} />
          )}

          {loading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : !user ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {labels.noDataTitle}
              </h2>
              <p className="text-gray-500 mb-4 text-sm sm:text-base">
                {labels.noDataMessage}
              </p>
              <a
                href="/login"
                className="inline-block px-5 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm"
              >
                {labels.loginButton}
              </a>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex-shrink-0">
                  <img
                    src={user.profilePictureUrl || "https://picsum.photos/200"}
                    alt="Profile Picture"
                    className="w-full h-full object-cover rounded-full border border-gray-200"
                    onError={(e) => {
                      e.target.src = "https://picsum.photos/200";
                    }}
                  />
                </div>
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-sm text-gray-600">
                        {labels.name}
                      </p>
                      <p className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {user.name || "Not available"}
                      </p>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-sm text-gray-600">
                        {labels.email}
                      </p>
                      <p className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {user.email || "Not available"}
                      </p>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-sm text-gray-600">
                        {labels.phoneNumber}
                      </p>
                      <p className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {user.phoneNumber || "Not available"}
                      </p>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs sm:text-sm text-gray-600">
                        {labels.role}
                      </p>
                      <p className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {formatRole(user.role)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 sm:mt-6 px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
                  >
                    {labels.editButton}
                  </button>
                </div>
              </div>
            </div>
          )}

          <Modal
            isOpen={isModalOpen}
            title={labels.modalTitle}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedFile(null);
              setPreviewUrl(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitText={labels.submitButton}
          >
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm sm:text-base font-medium text-gray-900"
                >
                  {labels.name}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full h-10 sm:h-12 rounded-lg border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 break-words"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm sm:text-base font-medium text-gray-900"
                >
                  {labels.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full h-10 sm:h-12 rounded-lg border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 break-words"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm sm:text-base font-medium text-gray-900"
                >
                  {labels.phoneNumber}
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="mt-1 block w-full h-10 sm:h-12 rounded-lg border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 break-words"
                  placeholder="Example: +6281234567890"
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm sm:text-base font-medium text-gray-900"
                >
                  {labels.role}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={user?.role !== "admin"}
                  className="mt-1 block w-full h-10 sm:h-12 rounded-lg border-2 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="profilePicture"
                  className="block text-sm sm:text-base font-medium text-gray-900"
                >
                  {labels.profilePicture}
                </label>
                {previewUrl && (
                  <div className="mt-2 rounded-lg shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Profile Picture Preview"
                      className="w-full max-h-48 sm:max-h-64 object-contain rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="mt-2 block w-full text-sm sm:text-base text-gray-500 file:mr-3 file:py-2 file:px-3 sm:file:mr-4 sm:file:py-2 sm:file:px-4 file:rounded-lg file:border-0 file:text-sm sm:file:text-base file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {user?.profilePictureUrl && (
                  <button
                    type="button"
                    onClick={handleDeletePicture}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm sm:text-base font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 w-full sm:w-auto"
                    disabled={isSubmitting}
                  >
                    {labels.deletePicture}
                  </button>
                )}
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Profile;
