// controllers/revenueController.js
import pool from '../config/db.js';

// Get revenue overview data
export const getRevenueOverview = async (req, res) => {
  try {
    const { timeRange } = req.query;
    console.log('getRevenueOverview called with timeRange:', timeRange);
    
    let query;
    switch(timeRange) {
      case 'today':
        query = `
          SELECT 
            EXTRACT(HOUR FROM o.create_time) as hour,
            COALESCE(SUM(p.amount), 0) as revenue
          FROM orders o
          LEFT JOIN payment p ON o.order_id = p.order_id
          WHERE DATE(o.create_time) = CURRENT_DATE
          AND o.status = 'completed'
          GROUP BY EXTRACT(HOUR FROM o.create_time)
          ORDER BY hour
        `;
        break;
      case 'thisWeek':
        query = `
          SELECT 
            EXTRACT(DOW FROM o.create_time) as day_of_week,
            TO_CHAR(o.create_time, 'Dy') as day_name,
            COALESCE(SUM(p.amount), 0) as revenue
          FROM orders o
          LEFT JOIN payment p ON o.order_id = p.order_id
          WHERE o.create_time >= DATE_TRUNC('week', CURRENT_DATE)
          AND o.status = 'completed'
          GROUP BY EXTRACT(DOW FROM o.create_time), TO_CHAR(o.create_time, 'Dy')
          ORDER BY day_of_week
        `;
        break;
      case 'thisMonth':
        query = `
          SELECT 
            EXTRACT(WEEK FROM o.create_time) as week_number,
            CONCAT('Week ', EXTRACT(WEEK FROM o.create_time) - EXTRACT(WEEK FROM DATE_TRUNC('month', CURRENT_DATE)) + 1) as week_name,
            COALESCE(SUM(p.amount), 0) as revenue
          FROM orders o
          LEFT JOIN payment p ON o.order_id = p.order_id
          WHERE o.create_time >= DATE_TRUNC('month', CURRENT_DATE)
          AND o.status = 'completed'
          GROUP BY EXTRACT(WEEK FROM o.create_time)
          ORDER BY week_number
        `;
        break;
      default:
        return res.status(400).json({ error: 'Invalid time range' });
    }
    
    console.log('Executing query:', query);
    const result = await pool.query(query);
    console.log('Query result:', result.rows);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching revenue overview:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get popular items data
export const getPopularItems = async (req, res) => {
  try {
    const { timeRange } = req.query;
    console.log('getPopularItems called with timeRange:', timeRange);
    
    let dateCondition = '';
    switch(timeRange) {
      case 'today':
        dateCondition = "AND DATE(o.create_time) = CURRENT_DATE";
        break;
      case 'thisWeek':
        dateCondition = "AND o.create_time >= DATE_TRUNC('week', CURRENT_DATE)";
        break;
      case 'thisMonth':
        dateCondition = "AND o.create_time >= DATE_TRUNC('month', CURRENT_DATE)";
        break;
    }
    
    const query = `
      SELECT 
        d.name as item_name,
        COUNT(od.order_detail_id) as sold_count,
        COALESCE(SUM(od.total), 0) as revenue
      FROM order_detail od
      JOIN drink d ON od.drink_id = d.drink_id
      JOIN orders o ON od.order_id = o.order_id
      WHERE o.status = 'completed'
      ${dateCondition}
      GROUP BY d.name
      ORDER BY sold_count DESC
      LIMIT 5
    `;
    
    console.log('Executing query:', query);
    const result = await pool.query(query);
    console.log('Query result:', result.rows);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching popular items:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get revenue distribution by channel
export const getRevenueDistribution = async (req, res) => {
  try {
    console.log('getRevenueDistribution called');
    
    const query = `
      SELECT 
        'In-store' as channel,
        COUNT(*) as order_count,
        COALESCE(SUM(p.amount), 0) as revenue
      FROM orders o
      LEFT JOIN payment p ON o.order_id = p.order_id
      WHERE o.status = 'completed'
      AND o.create_time >= DATE_TRUNC('month', CURRENT_DATE)
      
      UNION ALL
      
      SELECT 
        'Online' as channel,
        COUNT(*) as order_count,
        COALESCE(SUM(p.amount), 0) as revenue
      FROM orders o
      LEFT JOIN payment p ON o.order_id = p.order_id
      WHERE o.status = 'completed'
      AND o.create_time >= DATE_TRUNC('month', CURRENT_DATE)
      AND p.method != 'cash'
    `;
    
    const result = await pool.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching revenue distribution:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get peak hours data
export const getPeakHours = async (req, res) => {
  try {
    console.log('getPeakHours called');
    
    const query = `
      SELECT 
        EXTRACT(HOUR FROM o.create_time) as hour,
        COUNT(*) as customer_count
      FROM orders o
      WHERE o.status = 'completed'
      AND o.create_time >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM o.create_time)
      ORDER BY hour
    `;
    
    const result = await pool.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching peak hours:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get key metrics (total revenue, items sold, average order value, best seller)
export const getKeyMetrics = async (req, res) => {
  try {
    const { timeRange } = req.query;
    console.log('getKeyMetrics called with timeRange:', timeRange);
    
    let dateCondition = '';
    switch(timeRange) {
      case 'today':
        dateCondition = "AND DATE(o.create_time) = CURRENT_DATE";
        break;
      case 'thisWeek':
        dateCondition = "AND o.create_time >= DATE_TRUNC('week', CURRENT_DATE)";
        break;
      case 'thisMonth':
        dateCondition = "AND o.create_time >= DATE_TRUNC('month', CURRENT_DATE)";
        break;
    }
    
    // Simplified query to avoid complex CTE issues
    const metricsQuery = `
      SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COUNT(od.order_detail_id) as total_items_sold
      FROM orders o
      LEFT JOIN payment p ON o.order_id = p.order_id
      LEFT JOIN order_detail od ON o.order_id = od.order_id
      WHERE o.status = 'completed'
      ${dateCondition}
    `;
    
    const bestSellerQuery = `
      SELECT 
        d.name as item_name,
        COUNT(od.order_detail_id) as sold_count
      FROM order_detail od
      JOIN drink d ON od.drink_id = d.drink_id
      JOIN orders o ON od.order_id = o.order_id
      WHERE o.status = 'completed'
      ${dateCondition}
      GROUP BY d.name
      ORDER BY sold_count DESC
      LIMIT 1
    `;

    
    const [metricsResult, bestSellerResult] = await Promise.all([
      pool.query(metricsQuery),
      pool.query(bestSellerQuery)
    ]);
    
    const metrics = metricsResult.rows[0] || {};
    const bestSeller = bestSellerResult.rows[0] || {};
    
    const response = {
      total_revenue: parseFloat(metrics.total_revenue) || 0,
      total_items_sold: parseInt(metrics.total_items_sold) || 0,
      avg_order_value: metrics.total_orders > 0 
        ? parseFloat(metrics.total_revenue) / parseInt(metrics.total_orders) 
        : 0,
      best_seller: bestSeller.item_name || 'No data',
      sold_count: parseInt(bestSeller.sold_count) || 0
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching key metrics:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Get revenue by product
export const getRevenueByProduct = async (req, res) => {
  try {
    const { timeRange } = req.query;
    console.log('getRevenueByProduct called with timeRange:', timeRange);
    
    let dateCondition = '';
    switch(timeRange) {
      case 'today':
        dateCondition = "AND DATE(o.create_time) = CURRENT_DATE";
        break;
      case 'thisWeek':
        dateCondition = "AND o.create_time >= DATE_TRUNC('week', CURRENT_DATE)";
        break;
      case 'thisMonth':
        dateCondition = "AND o.create_time >= DATE_TRUNC('month', CURRENT_DATE)";
        break;
    }
    
    const query = `
      SELECT 
        d.name as product,
        COUNT(od.order_detail_id) as sold,
        COALESCE(SUM(od.total), 0) as revenue
      FROM order_detail od
      JOIN drink d ON od.drink_id = d.drink_id
      JOIN orders o ON od.order_id = o.order_id
      WHERE o.status = 'completed'
      ${dateCondition}
      GROUP BY d.name
      ORDER BY revenue DESC
    `;
    
    const result = await pool.query(query);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching revenue by product:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};