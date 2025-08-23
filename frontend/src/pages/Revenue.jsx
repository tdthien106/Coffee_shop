import { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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
} from 'chart.js';
import { revenueAPI } from '../services/api.js';
import '../styles/Revenue.css'

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

const CoffeeShopRevenue = () => {
  const [timeRange, setTimeRange] = useState('thisWeek');
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });
  const [popularItemsData, setPopularItemsData] = useState({ labels: [], datasets: [] });
  const [distributionData, setDistributionData] = useState({ labels: [], datasets: [] });
  const [hourlyData, setHourlyData] = useState({ labels: [], datasets: [] });
  const [keyMetrics, setKeyMetrics] = useState({});
  const [productRevenue, setProductRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const primaryColor = '#1D7DE2';
  const secondaryColors = [
    '#4A96E9', '#7AB2EF', '#A3CBF5', '#1560BD'
  ];

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

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
        byProduct
      ] = await Promise.all([
        revenueAPI.getRevenueOverview(timeRange).catch(() => []),
        revenueAPI.getPopularItems(timeRange).catch(() => []),
        revenueAPI.getRevenueDistribution().catch(() => []),
        revenueAPI.getPeakHours().catch(() => []),
        revenueAPI.getKeyMetrics(timeRange).catch(() => ({})),
        revenueAPI.getRevenueByProduct(timeRange).catch(() => [])
      ]);

      // Process data với kiểm tra an toàn
      setRevenueData(processRevenueData(revenueOverview || [], timeRange));
      setPopularItemsData(processPopularItemsData(popularItems || []));
      setDistributionData(processDistributionData(distribution || []));
      setHourlyData(processHourlyData(peakHours || []));
      setKeyMetrics(metrics || {});
      setProductRevenue(byProduct || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Data processing functions với kiểm tra an toàn
  const processRevenueData = (data, range) => {
    if (!Array.isArray(data)) return { labels: [], datasets: [] };
    
    let labels, datasetData;
    
    switch(range) {
      case 'today':
        labels = data.map(item => `${item.hour}:00`);
        datasetData = data.map(item => item.revenue || 0);
        break;
      case 'thisWeek':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        datasetData = Array.isArray(data) ? data.map(item => item.revenue || 0) : Array(7).fill(0);
        break;
      case 'thisMonth':
        labels = data.map(item => item.week_name || 'Week');
        datasetData = data.map(item => item.revenue || 0);
        break;
      default:
        labels = [];
        datasetData = [];
    }

    return {
      labels,
      datasets: [{
        label: 'Revenue',
        data: datasetData,
        backgroundColor: primaryColor,
        borderRadius: 5,
        barPercentage: 0.6,
      }]
    };
  };

  const processPopularItemsData = (data) => {
    if (!Array.isArray(data)) return { labels: [], datasets: [] };
    
    const topItems = data.slice(0, 5);
    return {
      labels: topItems.map(item => item.item_name || 'Item'),
      datasets: [{
        data: topItems.map(item => item.sold_count || 0),
        backgroundColor: [
          primaryColor,
          ...secondaryColors.slice(0, 4)
        ],
        borderWidth: 0,
        borderRadius: 5,
        hoverOffset: 10
      }]
    };
  };

  const processDistributionData = (data) => {
    if (!Array.isArray(data)) return { labels: [], datasets: [] };
    
    return {
      labels: data.map(item => item.channel || 'Channel'),
      datasets: [{
        data: data.map(item => item.revenue || 0),
        backgroundColor: [
          primaryColor,
          ...secondaryColors.slice(0, 2)
        ],
        borderWidth: 0,
        borderRadius: 5,
        hoverOffset: 10
      }]
    };
  };

  const processHourlyData = (data) => {
    if (!Array.isArray(data)) return { labels: [], datasets: [] };
    
    return {
      labels: data.map(item => `${item.hour}:00`),
      datasets: [{
        label: 'Customers',
        data: data.map(item => item.customer_count || 0),
        borderColor: primaryColor,
        backgroundColor: 'rgba(29, 125, 226, 0.1)',
        tension: 0.3,
        fill: true
      }]
    };
  };

  const chartOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: function(value) {
            return value + ' ';
          }
        }
      },
      x: {
        grid: { display: false }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15
        }
      }
    }
  };

  const hourlyOptions = {
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  if (loading) {
    return (
      <div className="coffee-revenue-container">
        <div className="loading-indicator">
          <div className="coffee-spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coffee-revenue-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchAllData} className="retry-btn">
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="coffee-revenue-container">
      {/* Header và time selector giữ nguyên */}
      <div className="coffee-revenue-header">
        <div className="header-content">
          <h1><i className="fas fa-coffee"></i>Revenue Statistics</h1>
          <p>Track store revenue and performance</p>
        </div>
        <div className="time-selector">
          {['today', 'thisWeek', 'thisMonth'].map((range) => (
            <button
              key={range}
              className={timeRange === range ? 'active' : ''}
              onClick={() => setTimeRange(range)}
            >
              {range === 'today' ? 'Today' : range === 'thisWeek' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="coffee-revenue-content">
        {/* Metrics Grid với data thực */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="card-content">
              <h3>TOTAL REVENUE</h3>
              <div className="value">{keyMetrics.total_revenue?.toFixed(0) || '0'} đ</div>
              <div className="trend positive">
                <i className="fas fa-arrow-up"></i> 8.5% vs previous period
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="card-content">
              <h3>ITEMS SOLD</h3>
              <div className="value">{keyMetrics.total_items_sold || '0'}</div>
              <div className="trend positive">
                <i className="fas fa-arrow-up"></i> 5.2% vs previous period
              </div>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="card-content">
              <h3>AVERAGE ORDER VALUE</h3>
              <div className="value">{keyMetrics.avg_order_value?.toFixed(0) || '0'} đ</div>
              <div className="trend positive">
                <i className="fas fa-arrow-up"></i> 3.1% vs previous period
              </div>
            </div>
          </div>

          <div className="metric-card">
            <div className="card-content">
              <h3>BEST SELLER</h3>
              <div className="value">{keyMetrics.best_seller || 'N/A'}</div>
              <div className="trend">
                {keyMetrics.sold_count ? `${keyMetrics.sold_count} sold` : 'No data'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Charts với data thực */}
        <div className="charts-container">
          <div className="chart-card main-chart">
            <div className="chart-header">
              <h2>Revenue Overview</h2>
            </div>
            <div className="chart-container">
              <Bar data={revenueData} options={chartOptions} />
            </div>
          </div>
          
          <div className="chart-card">
            <div className="chart-header">
              <h2>Popular Items</h2>
            </div>
            <div className="chart-container">
              <Doughnut data={popularItemsData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-card">
            <div className="chart-header">
              <h2>Peak Hours</h2>
            </div>
            <div className="chart-container">
              <Line data={hourlyData} options={hourlyOptions} />
            </div>
          </div>
          
          <div className="chart-card">
            <div className="chart-header">
              <h2>Revenue Distribution</h2>
            </div>
            <div className="chart-container">
              <Doughnut data={distributionData} options={doughnutOptions} />
            </div>
          </div>
        </div>
        
        {/* Table với data thực */}
        <div className="revenue-table">
          <div className="table-header">
            <h2>Revenue by Product</h2>
            <button className="export-btn">
              <i className="fas fa-download"></i> Export Report
            </button>
          </div>
          
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
                    <div className="menu-item">
                      {item.product}
                    </div>
                  </td>
                  <td>{item.sold}</td>
                  <td>{item.revenue?.toFixed(2)}M VNĐ</td>
                  <td>
                    {((item.revenue / keyMetrics.total_revenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoffeeShopRevenue;