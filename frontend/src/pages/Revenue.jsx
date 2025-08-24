import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiShoppingBag,
  FiClock,
  FiPieChart,
  FiBarChart2,
} from "react-icons/fi";

import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { revenueAPI } from "../services/api.js";
import "../styles/Revenue.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Revenue = () => {
  // ====== STATE (giữ nguyên logic) ======
  const [timeRange, setTimeRange] = useState("thisWeek");
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
  const [popularItemsData, setPopularItemsData] = useState({
    labels: [],
    datasets: [],
  });
  const [distributionData, setDistributionData] = useState({
    labels: [],
    datasets: [],
  });
  const [hourlyData, setHourlyData] = useState({ labels: [], datasets: [] });
  const [keyMetrics, setKeyMetrics] = useState({});
  const [productRevenue, setProductRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  // giữ đúng màu như bản gốc
  const primaryColor = "#1D7DE2";
  const secondaryColors = ["#4A96E9", "#7AB2EF", "#A3CBF5", "#1560BD"];

  // theo format: có useNavigate (không thay đổi hành vi)
  const navigate = useNavigate();

  // ====== EFFECT (fetch theo timeRange) ======
  useEffect(() => {
    fetchAllData();
  }, [timeRange, navigate, refreshTrigger]);

  // ====== FETCH (giữ nguyên logic Promise.all + fallback an toàn) ======
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        revenueOverview,
        popularItems,
        distribution,
        peakHours,
        metrics,
        byProduct,
      ] = await Promise.all([
        revenueAPI.getRevenueOverview(timeRange).catch(() => []),
        revenueAPI.getPopularItems(timeRange).catch(() => []),
        revenueAPI.getRevenueDistribution().catch(() => []),
        revenueAPI.getPeakHours().catch(() => []),
        revenueAPI.getKeyMetrics(timeRange).catch(() => ({})),
        revenueAPI.getRevenueByProduct(timeRange).catch(() => []),
      ]);

      setRevenueData(processRevenueData(revenueOverview || [], timeRange));
      setPopularItemsData(processPopularItemsData(popularItems || []));
      setDistributionData(processDistributionData(distribution || []));
      setHourlyData(processHourlyData(peakHours || []));
      setKeyMetrics(metrics || {});
      setProductRevenue(byProduct || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ====== PROCESSORS (y nguyên logic) ======
  const processRevenueData = (data, range) => {
    if (!Array.isArray(data)) return { labels: [], datasets: [] };

    let labels, datasetData;

    switch (range) {
      case "today":
        labels = data.map((item) => `${item.hour}:00`);
        datasetData = data.map((item) => item.revenue || 0);
        break;
      case "thisWeek":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        datasetData = Array.isArray(data)
          ? data.map((item) => item.revenue || 0)
          : Array(7).fill(0);
        break;
      case "thisMonth":
        labels = data.map((item) => item.week_name || "Week");
        datasetData = data.map((item) => item.revenue || 0);
        break;
      default:
        labels = [];
        datasetData = [];
    }

    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: datasetData,
          backgroundColor: primaryColor,
          borderRadius: 5,
          barPercentage: 0.6,
        },
      ],
    };
  };

  const processPopularItemsData = (data) => {
    if (!Array.isArray(data)) return { labels: [], datasets: [] };
    const topItems = data.slice(0, 5);
    return {
      labels: topItems.map((item) => item.item_name || "Item"),
      datasets: [
        {
          data: topItems.map((item) => item.sold_count || 0),
          backgroundColor: [primaryColor, ...secondaryColors.slice(0, 4)],
          borderWidth: 0,
          borderRadius: 5,
          hoverOffset: 10,
        },
      ],
    };
  };

  const processDistributionData = (data) => {
    if (!Array.isArray(data)) return { labels: [], datasets: [] };
    return {
      labels: data.map((item) => item.channel || "Channel"),
      datasets: [
        {
          data: data.map((item) => item.revenue || 0),
          backgroundColor: [primaryColor, ...secondaryColors.slice(0, 2)],
          borderWidth: 0,
          borderRadius: 5,
          hoverOffset: 10,
        },
      ],
    };
  };

  const processHourlyData = (data) => {
    if (!Array.isArray(data)) return { labels: [], datasets: [] };
    return {
      labels: data.map((item) => `${item.hour}:00`),
      datasets: [
        {
          label: "Customers",
          data: data.map((item) => item.customer_count || 0),
          borderColor: primaryColor,
          backgroundColor: "rgba(29, 125, 226, 0.1)",
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  // ====== CHART OPTIONS (giữ nguyên) ======
  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          callback: function (value) {
            return value + " ";
          },
        },
      },
      x: { grid: { display: false } },
    },
    plugins: { legend: { display: false } },
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { position: "bottom", labels: { boxWidth: 12, padding: 15 } },
    },
  };

  const hourlyOptions = {
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0, 0, 0, 0.05)" } },
      x: { grid: { display: false } },
    },
  };

  // ====== UI STATES (theo format mẫu) ======
  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button onClick={fetchAllData}>Retry</button>
      </div>
    );

  // ====== RENDER ======
  return (
    <div className="dashboard">
      {/* Header (format giống mẫu) */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>
            <FiPieChart /> Revenue Dashboard
          </h1>
          <div className="time-range-selector">
            <button
              className={timeRange === "today" ? "active" : ""}
              onClick={() => setTimeRange("today")}
            >
              Today
            </button>
            <button
              className={timeRange === "thisWeek" ? "active" : ""}
              onClick={() => setTimeRange("thisWeek")}
            >
              This Week
            </button>
            <button
              className={timeRange === "thisMonth" ? "active" : ""}
              onClick={() => setTimeRange("thisMonth")}
            >
              This Month
            </button>
          </div>
        </div>
        <div className="header-right">
          <div className="current-period">
            <FiClock />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Summary Cards (dùng keyMetrics thực) */}
      <section className="summary-cards">
        <div className="card revenue-card">
          <div className="card-icon">
            <FiDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p>
    {keyMetrics.total_revenue !== undefined && keyMetrics.total_revenue !== null
                    ? keyMetrics.total_revenue.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      })
                    : "0 ₫"}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiShoppingBag />
          </div>
          <div className="card-content">
            <h3>Items Sold</h3>
            <p>{keyMetrics.total_items_sold || 0}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiUsers />
          </div>
          <div className="card-content">
            <h3>Avg Order Value</h3>
            <p>
              {(keyMetrics.avg_order_value || 0).toLocaleString("vi-VN", {
                maximumFractionDigits: 0,
              })}{" "}
              VND
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiTrendingUp />
          </div>
          <div className="card-content">
            <h3>Best Seller</h3>
            <div className="trend-container">
              <p>{keyMetrics.best_seller || "N/A"}</p>
              <span className="trend">
                {keyMetrics.sold_count ? `${keyMetrics.sold_count} sold` : "--"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="dashboard-content">
        <div className="content-left">
          {/* Revenue Overview */}
          <div className="chart-container">
            <div className="chart-header">
              <h2>
                <FiBarChart2 /> Revenue Overview
              </h2>
            </div>
            <div className="chart-body">
              <div className="chart-inner">
                <Bar data={revenueData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="chart-container">
            <div className="chart-header">
              <h2>
                <FiClock /> Peak Hours
              </h2>
            </div>
            <div className="chart-body">
              <div className="chart-inner">
                <Line data={hourlyData} options={hourlyOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="content-right">
       

          {/* Revenue Distribution */}
          <div className="chart-container">
            <div className="chart-header">
              <h2>Revenue Distribution</h2>
            </div>
            <div className="chart-body">
              <div className="chart-inner">
                <Doughnut data={distributionData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Table: Revenue by Product (giữ nguyên tính toán) */}
      <section className="chart-container revenue-table">
        <div className="table-header">
          <h2>Revenue by Product</h2>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Sold</th>
                <th>Revenue</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {productRevenue.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="menu-item">{item.product}</div>
                  </td>
                  <td>{item.sold}</td>
                  <td>
                    {(item.revenue || 0).toFixed(2)}
                    M&nbsp;VNĐ
                  </td>
                  <td>
                    {keyMetrics.total_revenue
                      ? (
                          ((item.revenue || 0) / keyMetrics.total_revenue) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Revenue;
