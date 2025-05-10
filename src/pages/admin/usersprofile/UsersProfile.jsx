import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";

const UsersProfile = () => {
  const { API_BASE_URL, getAuthToken } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/all-user`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });

        if (response.data && response.data.data) {
          setUsers(response.data.data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, [API_BASE_URL, getAuthToken]);

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_BASE_URL}/update-user-role/${selectedUser.id}`,
        { role: selectedRole },
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      if (response.data && response.data.status === "success") {
        // Update the local users state
        const updatedUsers = users.map((user) => {
          if (user.id === selectedUser.id) {
            return { ...user, role: selectedRole };
          }
          return user;
        });

        setUsers(updatedUsers);
        setShowModal(false);
      }
      setLoading(false);
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("Failed to update user role. Please try again.");
      setLoading(false);
    }
  };

  // Open role update modal
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowModal(true);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner-border text-indigo-600" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-700">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          User Management
        </h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-center">Role</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      <div className="mr-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-700 text-white flex items-center justify-center font-medium">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span>{user.email}</span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`py-1 px-3 rounded-full text-xs ${
                        user.role === "admin"
                          ? "bg-purple-200 text-purple-800"
                          : "bg-green-200 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span
                      className={`py-1 px-3 rounded-full text-xs ${
                        user.isActive
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      <button
                        onClick={() => openRoleModal(user)}
                        className="transform hover:text-purple-500 hover:scale-110 transition duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for role update */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Update User Role</h3>
            <div className="mb-4">
              <p>
                <span className="font-medium">User:</span> {selectedUser.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {selectedUser.email}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Role
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={handleRoleChange}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersProfile;
