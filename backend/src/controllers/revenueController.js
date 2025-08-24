import revenueModel  from '../models/revenueModel.js';

const revenueController = {
  // Lấy tổng quan doanh thu
  getRevenueOverview: async (req, res) => {
    try {
      const { timeRange } = req.query;
      
      if (!['today', 'thisWeek', 'thisMonth'].includes(timeRange)) {
        return res.status(400).json({ error: 'Invalid time range' });
      }
      
      const data = await revenueModel.getRevenueOverview(timeRange);
      res.json(data);
    } catch (error) {
      console.error('Error in getRevenueOverview:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Lấy các món phổ biến
  getPopularItems: async (req, res) => {
    try {
      const { timeRange } = req.query;
      
      if (!['today', 'thisWeek', 'thisMonth'].includes(timeRange)) {
        return res.status(400).json({ error: 'Invalid time range' });
      }
      
      const data = await revenueModel.getPopularItems(timeRange);
      res.json(data);
    } catch (error) {
      console.error('Error in getPopularItems:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Lấy phân phối doanh thu
  getRevenueDistribution: async (req, res) => {
    try {
      const data = await revenueModel.getRevenueDistribution();
      res.json(data);
    } catch (error) {
      console.error('Error in getRevenueDistribution:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Lấy giờ cao điểm
  getPeakHours: async (req, res) => {
    try {
      const data = await revenueModel.getPeakHours();
      res.json(data);
    } catch (error) {
      console.error('Error in getPeakHours:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Lấy các chỉ số chính
  getKeyMetrics: async (req, res) => {
    try {
      const { timeRange } = req.query;
      
      if (!['today', 'thisWeek', 'thisMonth'].includes(timeRange)) {
        return res.status(400).json({ error: 'Invalid time range' });
      }
      
      const data = await revenueModel.getKeyMetrics(timeRange);
      res.json(data);
    } catch (error) {
      console.error('Error in getKeyMetrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Lấy doanh thu theo sản phẩm
  getRevenueByProduct: async (req, res) => {
    try {
      const { timeRange } = req.query;
      
      if (!['today', 'thisWeek', 'thisMonth'].includes(timeRange)) {
        return res.status(400).json({ error: 'Invalid time range' });
      }
      
      const data = await revenueModel.getRevenueByProduct(timeRange);
      res.json(data);
    } catch (error) {
      console.error('Error in getRevenueByProduct:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default revenueController;