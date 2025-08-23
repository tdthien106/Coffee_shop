// services/api.js
const BASE_URL = 'http://localhost:3000/api';

export const revenueAPI = {
  async getRevenueOverview(timeRange) {
    return fetchData(`${BASE_URL}/revenue/overview?timeRange=${timeRange}`);
  },

  async getPopularItems(timeRange) {
    return fetchData(`${BASE_URL}/revenue/popular-items?timeRange=${timeRange}`);
  },

  async getRevenueDistribution() {
    return fetchData(`${BASE_URL}/revenue/distribution`);
  },

  async getPeakHours() {
    return fetchData(`${BASE_URL}/revenue/peak-hours`);
  },

  async getKeyMetrics(timeRange) {
    return fetchData(`${BASE_URL}/revenue/metrics?timeRange=${timeRange}`);
  },

  async getRevenueByProduct(timeRange) {
    return fetchData(`${BASE_URL}/revenue/by-product?timeRange=${timeRange}`);
  }
};

const fetchData = async (url) => {
  try {
    console.log('Fetching:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.warn(`Expected JSON but got ${contentType}. Response:`, text.substring(0, 200));
      throw new Error(`Expected JSON but got ${contentType}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
};