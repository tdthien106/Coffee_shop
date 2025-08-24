import pool from '../config/db.js';

const revenueModel = {
  // Lấy tổng quan doanh thu theo khoảng thời gian
  getRevenueOverview: async (timeRange) => {
    let query = '';
    
    switch(timeRange) {
      case 'today':
        query = `
          SELECT 
            EXTRACT(HOUR FROM o.create_time) as hour,
            COALESCE(SUM(p.amount), 0) as revenue
          FROM orders o
          LEFT JOIN payment p ON o.payment_id = p.payment_id
          WHERE DATE(o.create_time) = CURRENT_DATE
          GROUP BY EXTRACT(HOUR FROM o.create_time)
          ORDER BY hour;
        `;
        break;
      case 'thisWeek':
        query = `
          SELECT 
            EXTRACT(DOW FROM o.create_time) as day_of_week,
            CASE EXTRACT(DOW FROM o.create_time)
              WHEN 0 THEN 'Sun'
              WHEN 1 THEN 'Mon'
              WHEN 2 THEN 'Tue'
              WHEN 3 THEN 'Wed'
              WHEN 4 THEN 'Thu'
              WHEN 5 THEN 'Fri'
              WHEN 6 THEN 'Sat'
            END as day_name,
            COALESCE(SUM(p.amount), 0) as revenue
          FROM orders o
          LEFT JOIN payment p ON o.payment_id = p.payment_id
          WHERE EXTRACT(WEEK FROM o.create_time) = EXTRACT(WEEK FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM o.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)
          GROUP BY EXTRACT(DOW FROM o.create_time), day_name
          ORDER BY day_of_week;
        `;
        break;
      case 'thisMonth':
        query = `
          SELECT 
            EXTRACT(WEEK FROM o.create_time) as week_number,
            'Week ' || EXTRACT(WEEK FROM o.create_time) as week_name,
            COALESCE(SUM(p.amount), 0) as revenue
          FROM orders o
          LEFT JOIN payment p ON o.payment_id = p.payment_id
          WHERE EXTRACT(MONTH FROM o.create_time) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM o.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)
          GROUP BY EXTRACT(WEEK FROM o.create_time)
          ORDER BY week_number;
        `;
        break;
      default:
        throw new Error('Invalid time range');
    }
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Lấy các món phổ biến
  getPopularItems: async (timeRange) => {
    let timeCondition = '';
    
    switch(timeRange) {
      case 'today':
        timeCondition = 'AND DATE(o.create_time) = CURRENT_DATE';
        break;
      case 'thisWeek':
        timeCondition = 'AND EXTRACT(WEEK FROM o.create_time) = EXTRACT(WEEK FROM CURRENT_DATE) AND EXTRACT(YEAR FROM o.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)';
        break;
      case 'thisMonth':
        timeCondition = 'AND EXTRACT(MONTH FROM o.create_time) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM o.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)';
        break;
    }
    
    const query = `
      SELECT 
        mi.name as item_name,
        SUM(od.quantity) as sold_count
      FROM order_detail od
      JOIN orders o ON od.order_id = o.order_id
      JOIN menu_item mi ON od.drink_id = mi.item_id
      WHERE o.status = 'completed'
      ${timeCondition}
      GROUP BY mi.name
      ORDER BY sold_count DESC
      LIMIT 10;
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Lấy phân phối doanh thu theo kênh
  getRevenueDistribution: async () => {
    // Giả định có trường payment_method trong bảng payment
    const query = `
      SELECT 
        p.method as channel,
        COALESCE(SUM(p.amount), 0) as revenue
      FROM payment p
      JOIN orders o ON p.order_id = o.order_id
      WHERE o.status = 'completed'
      GROUP BY p.method
      ORDER BY revenue DESC;
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Lấy giờ cao điểm
  getPeakHours: async () => {
    const query = `
      SELECT 
        EXTRACT(HOUR FROM o.create_time) as hour,
        COUNT(DISTINCT o.order_id) as customer_count
      FROM orders o
      WHERE o.status = 'completed'
        AND o.create_time >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM o.create_time)
      ORDER BY hour;
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Lấy các chỉ số chính - ĐÃ SỬA LỖI TRÙNG LẶP
  getKeyMetrics: async (timeRange) => {
    let timeCondition = '';
    let subqueryTimeCondition = '';
    
    switch(timeRange) {
      case 'today':
        timeCondition = 'AND DATE(o.create_time) = CURRENT_DATE';
        subqueryTimeCondition = 'AND DATE(o2.create_time) = CURRENT_DATE';
        break;
      case 'thisWeek':
        timeCondition = 'AND EXTRACT(WEEK FROM o.create_time) = EXTRACT(WEEK FROM CURRENT_DATE) AND EXTRACT(YEAR FROM o.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)';
        subqueryTimeCondition = 'AND EXTRACT(WEEK FROM o2.create_time) = EXTRACT(WEEK FROM CURRENT_DATE) AND EXTRACT(YEAR FROM o2.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)';
        break;
      case 'thisMonth':
        timeCondition = 'AND EXTRACT(MONTH FROM o.create_time) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM o.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)';
        subqueryTimeCondition = 'AND EXTRACT(MONTH FROM o2.create_time) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM o2.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)';
        break;
    }
    
    const query = `
      SELECT 
        COALESCE(SUM(p.amount), 0) as total_revenue,
        COALESCE(SUM(od.quantity), 0) as total_items_sold,
        COALESCE(AVG(p.amount), 0) as avg_order_value,
        (
          SELECT mi.name
          FROM order_detail od2
          JOIN orders o2 ON od2.order_id = o2.order_id
          JOIN menu_item mi ON od2.drink_id = mi.item_id
          WHERE o2.status = 'completed'
          ${subqueryTimeCondition}
          GROUP BY mi.name
          ORDER BY SUM(od2.quantity) DESC
          LIMIT 1
        ) as best_seller,
        (
          SELECT SUM(od2.quantity)
          FROM order_detail od2
          JOIN orders o2 ON od2.order_id = o2.order_id
          JOIN menu_item mi ON od2.drink_id = mi.item_id
          WHERE o2.status = 'completed'
          ${subqueryTimeCondition}
          GROUP BY mi.name
          ORDER BY SUM(od2.quantity) DESC
          LIMIT 1
        ) as sold_count
      FROM orders o
      LEFT JOIN payment p ON o.payment_id = p.payment_id
      LEFT JOIN order_detail od ON o.order_id = od.order_id
      WHERE o.status = 'completed'
      ${timeCondition};
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows[0] || {};
    } catch (error) {
      throw error;
    }
  },

  // Lấy doanh thu theo sản phẩm
  getRevenueByProduct: async (timeRange) => {
    let timeCondition = '';
    
    switch(timeRange) {
      case 'today':
        timeCondition = 'AND DATE(o.create_time) = CURRENT_DATE';
        break;
      case 'thisWeek':
        timeCondition = 'AND EXTRACT(WEEK FROM o.create_time) = EXTRACT(WEEK FROM CURRENT_DATE) AND EXTRACT(YEAR FROM o.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)';
        break;
      case 'thisMonth':
        timeCondition = 'AND EXTRACT(MONTH FROM o.create_time) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM o.create_time) = EXTRACT(YEAR FROM CURRENT_DATE)';
        break;
    }
    
    const query = `
      SELECT 
        mi.name as product,
        SUM(od.quantity) as sold,
        SUM(od.total) as revenue
      FROM order_detail od
      JOIN orders o ON od.order_id = o.order_id
      JOIN menu_item mi ON od.drink_id = mi.item_id
      WHERE o.status = 'completed'
      ${timeCondition}
      GROUP BY mi.name
      ORDER BY revenue DESC;
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
};

export default revenueModel;