import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import axios from "axios";
import { API_CONFIG } from "../../../api/config";
import {
  FiDollarSign,
  FiActivity,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import { BsGraphUp } from "react-icons/bs";
import { MdOutlineTask } from "react-icons/md";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const StatCard = ({ icon, label, value, subtext }) => (
  <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
    <div className="text-white bg-blue-500 p-3 rounded-xl text-lg">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
      {subtext && <p className="text-xs text-green-600 mt-1">{subtext}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { apiKey: API_CONFIG.API_KEY };
        const [resStats, resLine, resBar, resPie] = await Promise.all([
          axios.get(`${API_CONFIG.BASE_URL}/dashboard-stats`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}/dashboard-line`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}/dashboard-bar`, { headers }),
          axios.get(`${API_CONFIG.BASE_URL}/dashboard-pie`, { headers }),
        ]);
        setStats(resStats.data);
        setLineData(resLine.data);
        setBarData(resBar.data);
        setPieData(resPie.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Main Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={<FiDollarSign />}
          label="Earnings"
          value={`$${stats.earnings}`}
        />
        <StatCard
          icon={<BsGraphUp />}
          label="Spend This Month"
          value={`$${stats.spendThisMonth}`}
        />
        <StatCard
          icon={<FiShoppingBag />}
          label="Sales"
          value={`$${stats.sales}`}
          subtext="+23% since last month"
        />
        <StatCard
          icon={<FiDollarSign />}
          label="Your Balance"
          value={`$${stats.balance}`}
        />
        <StatCard
          icon={<MdOutlineTask />}
          label="New Tasks"
          value={stats.newTasks}
        />
        <StatCard
          icon={<FiActivity />}
          label="Total Projects"
          value={stats.totalProjects}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-4 shadow-md lg:col-span-2">
          <h2 className="font-semibold mb-2">Total Spent</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4F46E5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="font-semibold mb-2">Weekly Revenue</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="day" />
              <Tooltip />
              <Bar dataKey="value" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traffic & Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="font-semibold mb-2">Daily Traffic</h2>
          <p className="text-2xl font-bold">{stats.visitors} Visitors</p>
          <p className="text-green-600 mt-1">+{stats.visitorGrowth}%</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="font-semibold mb-2">Your Pie Chart</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={60} label>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
