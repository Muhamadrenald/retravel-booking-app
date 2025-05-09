import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_CONFIG } from "../../../api/config";
import Header from "../../../components/header/Header";
import Alert from "../../../components/alert/Alert";
import Table from "../../../components/table/Table";
import Pagination from "../../../components/pagination/Pagination";
import Modal from "../../../components/modal/Modal";
import Spinner from "../../../components/spinner/Spinner";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    profilePictureUrl: "",
    role: "user",
    password: "",
    passwordRepeat: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState(null);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to access this page.");

      const res = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ALL_USERS}`,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data && res.data.code === "200") {
        const rawData = Array.isArray(res.data.data) ? res.data.data : [];
        const normalizedUsers = rawData
          .filter((user) => user && typeof user === "object" && user.id)
          .map((user) => ({
            id: user.id,
            name: typeof user.name === "string" ? user.name : "",
            email: typeof user.email === "string" ? user.email : "",
            phoneNumber:
              typeof user.phoneNumber === "string" ? user.phoneNumber : "",
            profilePictureUrl:
              typeof user.profilePictureUrl === "string"
                ? user.profilePictureUrl
                : "",
            role: typeof user.role === "string" ? user.role : "user",
          }));
        setUsers(normalizedUsers);
      } else {
        throw new Error(res.data?.message || "Failed to fetch users.");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load users. Please try again."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (mode, user = null) => {
    setIsModalOpen(true);
    setIsEditMode(mode === "edit");
    setFormError(null);
    setSelectedFile(null);

    if (mode === "edit" && user) {
      setCurrentUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        profilePictureUrl: user.profilePictureUrl || "",
        role: user.role || "user",
        password: "",
        passwordRepeat: "",
      });
    } else {
      setCurrentUser(null);
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        profilePictureUrl: "",
        role: "user",
        password: "",
        passwordRepeat: "",
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentUser(null);
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      profilePictureUrl: "",
      role: "user",
      password: "",
      passwordRepeat: "",
    });
    setSelectedFile(null);
    setFormError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setFormError("Please select an image file (e.g., JPG, PNG).");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setFormError(null);
    }
  };

  const handleRegister = async () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.passwordRepeat.trim()
    ) {
      setFormError("Name, email, password, and confirm password are required.");
      return;
    }

    if (formData.password !== formData.passwordRepeat) {
      setFormError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setFormError(null);
      setSuccessMessage(null);

      let profilePictureUrl = formData.profilePictureUrl;
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", selectedFile);

        const token = localStorage.getItem("token");
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

        if (uploadResponse.data && uploadResponse.data.code === "200") {
          profilePictureUrl = uploadResponse.data.url;
          if (!profilePictureUrl)
            throw new Error("Image URL not found in response.");
        } else {
          throw new Error(
            uploadResponse.data?.message || "Failed to upload image."
          );
        }
      }

      const registerData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordRepeat: formData.passwordRepeat,
        phoneNumber: formData.phoneNumber || "",
        profilePictureUrl: profilePictureUrl || "",
        role: formData.role || "user",
      };

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`,
        registerData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.code === "200") {
        setSuccessMessage("User registered successfully!");
        fetchUsers();
        closeModal();
      } else {
        throw new Error(response.data?.message || "Failed to register user.");
      }
    } catch (err) {
      console.error("Failed to register user:", err);
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to register user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    try {
      setLoading(true);
      setFormError(null);
      setSuccessMessage(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to perform this action.");

      let profilePictureUrl = formData.profilePictureUrl;
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

        if (uploadResponse.data && uploadResponse.data.code === "200") {
          profilePictureUrl = uploadResponse.data.url;
          if (!profilePictureUrl)
            throw new Error("Image URL not found in response.");
        } else {
          throw new Error(
            uploadResponse.data?.message || "Failed to upload image."
          );
        }
      }

      const updatedProfileData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        profilePictureUrl: profilePictureUrl,
        userId: currentUser.id,
      };

      const profileResponse = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_PROFILE}`,
        updatedProfileData,
        {
          headers: {
            apiKey: API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (profileResponse.data && profileResponse.data.code === "200") {
        const currentUserData = users.find(
          (user) => user.id === currentUser.id
        );
        if (formData.role !== currentUserData.role) {
          const roleResponse = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_USER_ROLE(
              currentUser.id
            )}`,
            { role: formData.role },
            {
              headers: {
                apiKey: API_CONFIG.API_KEY,
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!(roleResponse.data && roleResponse.data.code === "200")) {
            throw new Error(
              roleResponse.data?.message || "Failed to update user role."
            );
          }
        }

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === currentUser.id
              ? { ...user, ...updatedProfileData, role: formData.role }
              : user
          )
        );
        setSuccessMessage("User updated successfully!");
        closeModal();
      } else {
        throw new Error(
          profileResponse.data?.message || "Failed to update profile."
        );
      }
    } catch (err) {
      console.error("Failed to update user:", err);
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditMode) {
      handleUpdateProfile();
    } else {
      handleRegister();
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const columns = [
    { key: "index", label: "#", className: "p-3 sm:p-4" },
    { key: "profile", label: "Profile", className: "p-3 sm:p-4" },
    { key: "name", label: "Name", className: "p-3 sm:p-4" },
    {
      key: "email",
      label: "Email",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    {
      key: "phone",
      label: "Phone",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    {
      key: "role",
      label: "Role",
      className: "hidden sm:table-cell p-3 sm:p-4",
    },
    { key: "actions", label: "Actions", className: "p-3 sm:p-4" },
  ];

  const renderRow = (user, index) => (
    <tr
      key={user.id}
      className="border-t hover:bg-gray-50 transition-colors duration-100"
    >
      <td className="p-3 sm:p-4 text-gray-700 text-xs sm:text-sm">
        {indexOfFirstUser + index + 1}
      </td>
      <td className="p-3 sm:p-4">
        <img
          src={
            user.profilePictureUrl?.trim()
              ? `${user.profilePictureUrl}?t=${Date.now()}`
              : "https://picsum.photos/200"
          }
          alt={user.name || "Profile"}
          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shadow-sm"
          onError={(e) => {
            e.target.src = "https://picsum.photos/200";
          }}
        />
      </td>
      <td className="p-3 sm:p-4 text-gray-800 text-xs sm:text-sm truncate max-w-[150px]">
        {user.name || "-"}
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4 text-gray-600 text-xs sm:text-sm truncate max-w-[150px]">
        {user.email || "-"}
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4 text-gray-600 text-xs sm:text-sm truncate max-w-[120px]">
        {user.phoneNumber || "-"}
      </td>
      <td className="hidden sm:table-cell p-3 sm:p-4 text-gray-600 capitalize text-xs sm:text-sm">
        {user.role || "-"}
      </td>
      <td className="p-3 sm:p-4">
        <button
          onClick={() => openModal("edit", user)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-1.5 rounded-md shadow-sm transition-all duration-200 text-xs sm:text-sm"
        >
          Edit
        </button>
      </td>
    </tr>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <Header
          title="Users Management"
          searchTerm={searchTerm}
          onSearchChange={(e) => setSearchTerm(e.target.value)}
          onAddClick={() => openModal("add")}
          addButtonText="Add New User"
        />
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
        <Alert type="error" message={error} onClose={() => setError(null)} />
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Table
              columns={columns}
              data={currentUsers}
              renderRow={renderRow}
              emptyMessage="No users found. Create a new user using the button above."
              searchTerm={searchTerm}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
        <Modal
          isOpen={isModalOpen}
          title={isEditMode ? "Edit User" : "Add New User"}
          onClose={closeModal}
          onSubmit={handleSubmit}
          isLoading={loading}
          submitText={isEditMode ? "Update" : "Create"}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter email"
                required
              />
            </div>
            {!isEditMode && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="passwordRepeat"
                    value={formData.passwordRepeat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200"
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base transition-all duration-200 capitalize"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 text-sm transition-all duration-200"
                  disabled={loading}
                />
                {loading && (
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                )}
              </div>
              {formData.profilePictureUrl || selectedFile ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Image Preview:
                  </p>
                  <div className="relative group rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={
                        selectedFile
                          ? URL.createObjectURL(selectedFile)
                          : formData.profilePictureUrl
                      }
                      alt="Profile preview"
                      className="w-full h-20 sm:h-24 object-cover"
                      onError={(e) => {
                        e.target.src = "https://picsum.photos/200";
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          {formError && (
            <div className="mt-4 sm:mt-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm sm:text-base">
              {formError}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UsersTable;
