import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers, FiShoppingBag, FiClock, FiPieChart, FiBarChart2 } from 'react-icons/fi';

const Home = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('today');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:3000/api/home?range=${timeRange}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate, timeRange]);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <p>Error: {error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
  
  if (!dashboardData) return (
    <div className="no-data-container">
      <p>No data available</p>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  );

  // Calculate percentage for menu items
  const totalMenuItems = dashboardData.menuProportion.data.reduce((sum, item) => sum + item.order_count, 0);
  const menuItemsWithPercentage = dashboardData.menuProportion.data.map(item => ({
    ...item,
    percentage: totalMenuItems > 0 ? Math.round((item.order_count / totalMenuItems) * 100) : 0
  }));

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>{dashboardData.storeInfo.name} Dashboard</h1>
          <div className="time-range-selector">
            <button 
              className={timeRange === 'today' ? 'active' : ''}
              onClick={() => setTimeRange('today')}
            >
              Today
            </button>
            <button 
              className={timeRange === 'week' ? 'active' : ''}
              onClick={() => setTimeRange('week')}
            >
              This Week
            </button>
            <button 
              className={timeRange === 'month' ? 'active' : ''}
              onClick={() => setTimeRange('month')}
            >
              This Month
            </button>
          </div>
        </div>
        <div className="header-right">
          <div className="current-period">
            <FiClock />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
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
            <p>{dashboardData.summaryStats.revenue.toLocaleString()} VND</p>
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
              <p>{dashboardData.netRevenue.value} {dashboardData.netRevenue.unit}</p>
              <span className={`trend ${dashboardData.netRevenue.trend}`}>
                {dashboardData.netRevenue.trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
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
              <h2><FiBarChart2 /> Revenue Overview</h2>
              <div className="chart-legend">
                <span className="legend-item current">Current Period</span>
                <span className="legend-item previous">Previous Period</span>
              </div>
            </div>
            <div className="bar-chart">
              {dashboardData.rushHour.data.map((hourData) => (
                <div key={hourData.hour} className="bar-group">
                  <div className="bar-wrapper">
                    <div 
                      className="bar current"
                      style={{ height: `${(hourData.order_count / Math.max(...dashboardData.rushHour.data.map(h => h.order_count))) * 70}%` }}
                      title={`${hourData.order_count} orders`}
                    ></div>
                  </div>
                  <div className="bar-wrapper">
                    <div 
                      className="bar previous"
                      style={{ height: `${(hourData.order_count / Math.max(...dashboardData.rushHour.data.map(h => h.order_count)) * 70) * 0.8}%` }}
                      title={`${Math.round(hourData.order_count * 0.8)} orders (previous)`}
                    ></div>
                  </div>
                  <span className="hour-label">{hourData.hour}:00</span>
                </div>
              ))}
            </div>
            <div className="chart-footer">
              <p>Peak hour: {dashboardData.rushHour.peakHour}:00 with {
                Math.max(...dashboardData.rushHour.data.map(h => h.order_count))
              } orders</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="recent-orders">
            <h2><FiShoppingBag /> Recent Orders</h2>
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

        {/* Right Column */}

      </main>

      {/* CSS Styles */}
      <style jsx>{`
        /* Base Styles */
        :root {
          --primary-color: #4a6bff;
          --secondary-color: #f8f9fa;
          --text-color: #333;
          --text-light: #777;
          --border-color: #e0e0e0;
          --success-color: #28a745;
          --danger-color: #dc3545;
          --warning-color: #ffc107;
          --info-color: #17a2b8;
          --white: #fff;
          --gray: #6c757d;
          --light-gray: #f8f9fa;
          --dark-gray: #343a40;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7fa;
          color: var(--text-color);
        }

        .dashboard {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          padding: 20px;
          max-width: 1600px;
          margin: 0 auto;
        }

        /* Header Styles */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-left h1 {
          font-size: 24px;
          color: var(--primary-color);
        }

        .time-range-selector {
          display: flex;
          gap: 10px;
        }

        .time-range-selector button {
          padding: 8px 16px;
          border: 1px solid var(--border-color);
          background: var(--white);
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .time-range-selector button.active {
          background: var(--primary-color);
          color: var(--white);
          border-color: var(--primary-color);
        }

        .current-period {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-light);
          font-size: 14px;
        }

        /* Summary Cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .card {
          background: var(--white);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(74, 107, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-color);
          font-size: 20px;
        }

        .revenue-card .card-icon {
          background: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
        }

        .card-content h3 {
          font-size: 14px;
          color: var(--text-light);
          margin-bottom: 5px;
        }

        .card-content p {
          font-size: 22px;
          font-weight: 600;
          color: var(--text-color);
        }

        .trend-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .trend.up {
          background: rgba(40, 167, 69, 0.1);
          color: var(--success-color);
        }

        .trend.down {
          background: rgba(220, 53, 69, 0.1);
          color: var(--danger-color);
        }

        /* Main Content */
        .dashboard-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 30px;
        }

        .content-left {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .content-right {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        /* Chart Container */
        .chart-container {
          background: var(--white);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .chart-header h2 {
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chart-legend {
          display: flex;
          gap: 15px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }

        .legend-item::before {
          content: '';
          display: block;
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-item.current::before {
          background: var(--primary-color);
        }

        .legend-item.previous::before {
          background: var(--gray);
        }

        .bar-chart {
          display: flex;
          height: 250px;
          align-items: flex-end;
          gap: 10px;
          padding: 20px 0;
        }

        .bar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .bar-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .bar {
          width: 12px;
          border-radius: 4px 4px 0 0;
          transition: height 0.5s ease;
        }

        .bar.current {
          background: var(--primary-color);
          margin-right: 2px;
        }

        .bar.previous {
          background: var(--gray);
          opacity: 0.7;
        }

        .hour-label {
          margin-top: 8px;
          font-size: 12px;
          color: var(--text-light);
        }

        .chart-footer {
          margin-top: 10px;
          font-size: 14px;
          color: var(--text-light);
          text-align: center;
        }

        /* Recent Orders */
        .recent-orders {
          background: var(--white);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .recent-orders h2 {
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .orders-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        th {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-light);
        }

        td {
          font-size: 14px;
        }

        tr:hover td {
          background: rgba(74, 107, 255, 0.05);
        }

        /* Menu Distribution */
        .menu-distribution {
          background: var(--white);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .menu-distribution h2 {
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .pie-chart {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          position: relative;
          margin: 0 auto 20px;
          background: var(--light-gray);
        }

        .pie-segment {
          position: absolute;
          width: 100%;
          height: 100%;
          clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 0);
          transform: rotate(calc(var(--rotation) * 1deg));
        }

        .pie-segment::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--color);
          clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 50%);
          transform: rotate(calc(var(--percentage) * 3.6deg));
        }

        .pie-center {
          position: absolute;
          width: 60%;
          height: 60%;
          background: var(--white);
          border-radius: 50%;
          top: 20%;
          left: 20%;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.1) inset;
        }

        .segment-label {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          font-size: 10px;
          font-weight: bold;
          color: var(--white);
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .pie-segment:hover .segment-label {
          opacity: 1;
        }

        .menu-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }

        .color-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .category-name {
          flex: 1;
        }

        .category-percentage {
          font-weight: 600;
          color: var(--text-color);
        }

        /* Top Orders */
        .top-orders {
          background: var(--white);
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .top-orders h2 {
          font-size: 18px;
          margin-bottom: 20px;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px;
          border-radius: 8px;
          background: var(--light-gray);
          transition: all 0.3s ease;
        }

        .order-item:hover {
          transform: translateX(5px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .order-rank {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--primary-color);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }

        .order-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .order-id {
          font-size: 14px;
          font-weight: 600;
        }

        .order-location {
          font-size: 12px;
          color: var(--text-light);
        }

        .order-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--primary-color);
        }

        /* Loading and Error States */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 20px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(74, 107, 255, 0.2);
          border-radius: 50%;
          border-top-color: var(--primary-color);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-container, .no-data-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 20px;
        }

        .error-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--danger-color);
          color: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: bold;
        }

        button {
          padding: 10px 20px;
          background: var(--primary-color);
          color: var(--white);
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        /* Responsive Styles */
        @media (max-width: 1200px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .summary-cards {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 576px) {
          .summary-cards {
            grid-template-columns: 1fr;
          }

          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .chart-legend {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;