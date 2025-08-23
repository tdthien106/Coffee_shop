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

const Home = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("today");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:3000/api/home?range=${timeRange}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, timeRange]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );

  if (error)
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );

  if (!dashboardData)
    return (
      <div className="no-data-container">
        <p>No data available</p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );

  // Calculate percentage for menu items
  const totalMenuItems = dashboardData.menuProportion.data.reduce(
    (sum, item) => sum + item.order_count,
    0
  );
  const menuItemsWithPercentage = dashboardData.menuProportion.data.map(
    (item) => ({
      ...item,
      percentage:
        totalMenuItems > 0
          ? Math.round((item.order_count / totalMenuItems) * 100)
          : 0,
    })
  );

  // Lọc dữ liệu rushHour từ 6h đến 22h
  const filteredRushHourData = dashboardData.rushHour.data.filter(
    (hourData) => hourData.hour >= 6 && hourData.hour <= 22
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>{dashboardData.storeInfo.name} Dashboard</h1>
          <div className="time-range-selector">
            <button
              className={timeRange === "today" ? "active" : ""}
              onClick={() => setTimeRange("today")}
            >
              Today
            </button>
            <button
              className={timeRange === "week" ? "active" : ""}
              onClick={() => setTimeRange("week")}
            >
              This Week
            </button>
            <button
              className={timeRange === "month" ? "active" : ""}
              onClick={() => setTimeRange("month")}
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

      {/* Summary Cards */}
      <section className="summary-cards">
        <div className="card">
          <div className="card-icon">
            <FiShoppingBag />
          </div>
          <div className="card-content">
            <h3>Total Orders</h3>
            <p>{dashboardData.summaryStats.orders}</p>
          </div>
        </div>

        <div className="card revenue-card">
          <div className="card-icon">
            <FiDollarSign />
          </div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p>
              {dashboardData.summaryStats.revenue.toLocaleString("vi-VN", {
                minimumFractionDigits: 0, // không bắt buộc có số lẻ
                maximumFractionDigits: 0, // giới hạn không hiển thị số lẻ
              })}{" "}
              VND
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiUsers />
          </div>
          <div className="card-content">
            <h3>Active Staff</h3>
            <p>{dashboardData.summaryStats.staffs}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-icon">
            <FiTrendingUp />
          </div>
          <div className="card-content">
            <h3>Net Revenue</h3>
            <div className="trend-container">
              <p>
                {Number(dashboardData.netRevenue.value).toLocaleString("vi-VN")}{" "}
                {dashboardData.netRevenue.unit}
              </p>
              <span className={`trend ${dashboardData.netRevenue.trend}`}>
                {dashboardData.netRevenue.trend === "up" ? (
                  <FiTrendingUp />
                ) : (
                  <FiTrendingDown />
                )}
                {dashboardData.netRevenue.trend}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Left Column */}
        <div className="content-left">
          {/* Revenue Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h2>
                <FiBarChart2 /> Revenue Overview (6h - 22h)
              </h2>
              <div className="chart-legend">
                <span className="legend-item current">Current Period</span>
                <span className="legend-item previous">Previous Period</span>
              </div>
            </div>
            <div className="bar-chart">
              {filteredRushHourData.map((hourData) => (
                <div key={hourData.hour} className="bar-group">
                  <div className="bar-wrapper">
                    <div
                      className="bar current"
                      style={{
                        height: `${
                          (hourData.order_count /
                            Math.max(
                              ...filteredRushHourData.map((h) => h.order_count)
                            )) *
                          70
                        }%`,
                      }}
                      title={`${hourData.order_count} orders`}
                    ></div>
                  </div>
                  <div className="bar-wrapper">
                    <div
                      className="bar previous"
                      style={{
                        height: `${
                          (hourData.order_count /
                            Math.max(
                              ...filteredRushHourData.map((h) => h.order_count)
                            )) *
                          70 *
                          0.8
                        }%`,
                      }}
                      title={`${Math.round(
                        hourData.order_count * 0.8
                      )} orders (previous)`}
                    ></div>
                  </div>
                  <span className="hour-label">{hourData.hour}h</span>
                </div>
              ))}
            </div>
            <div className="chart-footer">
              <p>
                Peak hour: {dashboardData.rushHour.peakHour}:00 with{" "}
                {Math.max(...filteredRushHourData.map((h) => h.order_count))}{" "}
                orders
              </p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="recent-orders">
            <h2>
              <FiShoppingBag /> Recent Orders
            </h2>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Location</th>
                    <th>Value</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td>{order.location}</td>
                      <td>{order.value.toLocaleString()} VND</td>
                      <td>{new Date(order.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
