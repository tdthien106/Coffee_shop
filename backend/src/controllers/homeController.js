import db from '../config/db.js';

export const getDashboardStats = async (req, res) => {
  try {
    // Get date range (default to last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Format dates for SQL queries
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Query for summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(o.order_id) AS order_count,
        COALESCE(SUM(p.amount), 0) AS total_revenue,
        (SELECT COUNT(*) FROM employees WHERE end_date IS NULL AND position = 'Staff') AS staff_count
      FROM orders o
      LEFT JOIN payment p ON o.payment_id = p.payment_id
      WHERE o.create_time BETWEEN $1 AND $2
    `;
    // Query for net revenue (with trend calculation)
    const netRevenueQuery = `
      WITH current_period AS (
        SELECT COALESCE(SUM(p.amount), 0) AS revenue
        FROM payment p
        JOIN orders o ON p.order_id = o.order_id
        WHERE p.payment_date BETWEEN $1 AND $2
      ),
      previous_period AS (
        SELECT COALESCE(SUM(p.amount), 0) AS revenue
        FROM payment p
        JOIN orders o ON p.order_id = o.order_id
        WHERE p.payment_date BETWEEN $3 AND $4
      )
      SELECT 
        cp.revenue AS current_revenue,
        pp.revenue AS previous_revenue,
        CASE 
          WHEN cp.revenue > pp.revenue THEN 'up'
          WHEN cp.revenue < pp.revenue THEN 'down'
          ELSE 'neutral'
        END AS trend
      FROM current_period cp, previous_period pp
    `;

    // Query for reserve classification (assuming this is about inventory value)
    const reserveQuery = `
      SELECT COALESCE(SUM(i.current_stock * i.unit_price), 0) AS reserve_value
      FROM ingredient i
    `;

    // Query for revenue orders (top orders by value)
    const revenueOrdersQuery = `
      SELECT 
        o.order_id,
        'HCMUS - 227NVC' AS location,  -- Hardcoded for now, could be from store table
        p.amount AS value
      FROM orders o
      JOIN payment p ON o.payment_id = p.payment_id
      WHERE o.create_time BETWEEN $1 AND $2
      ORDER BY p.amount DESC
      LIMIT 5
    `;

    // Query for rush hour analysis
    const rushHourQuery = `
      SELECT 
        EXTRACT(HOUR FROM o.create_time) AS hour,
        COUNT(*) AS order_count
      FROM orders o
      WHERE o.create_time BETWEEN $1 AND $2
      GROUP BY hour
      ORDER BY hour
    `;

    // Query for menu proportion
    const menuProportionQuery = `
      SELECT 
        m.category,
        COUNT(od.drink_id) AS order_count
      FROM order_detail od
      JOIN menu_item m ON od.drink_id = m.item_id
      JOIN orders o ON od.order_id = o.order_id
      WHERE o.create_time BETWEEN $1 AND $2
      GROUP BY m.category
    `;

    // Query for recent orders
    const recentOrdersQuery = `
      SELECT 
        o.order_id,
        'HCMUS - 227NVC' AS location,  -- Hardcoded for now
        p.amount AS value,
        o.create_time AS timestamp
      FROM orders o
      JOIN payment p ON o.payment_id = p.payment_id
      WHERE o.create_time BETWEEN $1 AND $2
      ORDER BY o.create_time DESC
      LIMIT 5
    `;

    // Calculate previous period dates (30 days before the current period)
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 30);
    const prevEndDate = new Date(startDate);
    const prevStartDateStr = prevStartDate.toISOString().split('T')[0];
    const prevEndDateStr = prevEndDate.toISOString().split('T')[0];

    // Execute all queries
    const [
      summaryResult,
      netRevenueResult,
      reserveResult,
      revenueOrdersResult,
      rushHourResult,
      menuProportionResult,
      recentOrdersResult
    ] = await Promise.all([
      db.query(summaryQuery, [startDateStr, endDateStr]),
      db.query(netRevenueQuery, [startDateStr, endDateStr, prevStartDateStr, prevEndDateStr]),
      db.query(reserveQuery),
      db.query(revenueOrdersQuery, [startDateStr, endDateStr]),
      db.query(rushHourQuery, [startDateStr, endDateStr]),
      db.query(menuProportionQuery, [startDateStr, endDateStr]),
      db.query(recentOrdersQuery, [startDateStr, endDateStr])
    ]);

    // Find peak hour from rush hour data
    const rushHourData = rushHourResult.rows;
    let peakHour = null;
    if (rushHourData.length > 0) {
      peakHour = rushHourData.reduce((prev, current) => 
        (prev.order_count > current.order_count) ? prev : current
      ).hour;
    }

    // Format the response
    const response = {
      storeInfo: {
        name: "MAT COFFEE SHOP",
        currentStore: "HotMédecine",
        period: "30 days"
      },
      summaryStats: {
        orders: summaryResult.rows[0]?.order_count || 0,
        revenue: summaryResult.rows[0]?.total_revenue || 0,
        staffs: summaryResult.rows[0]?.staff_count || 0
      },
      netRevenue: {
        value: (netRevenueResult.rows[0]?.current_revenue || 0) / 1000000, // Convert to million VND
        unit: "Million VND",
        trend: netRevenueResult.rows[0]?.trend || "neutral"
      },
      reserveClassification: {
        value: (reserveResult.rows[0]?.reserve_value || 0) / 1000000, // Convert to million VND
        unit: "Million VND"
      },
      revenueOrders: revenueOrdersResult.rows.map(row => ({
        location: row.location,
        orderId: row.order_id,
        value: row.value
      })),
      rushHour: {
        data: rushHourData,
        peakHour: peakHour,
        unit: "Port"
      },
      menuProportion: {
        data: menuProportionResult.rows,
        unit: "Port"
      },
      recentOrders: recentOrdersResult.rows.map(row => ({
        orderId: row.order_id,
        location: row.location,
        value: row.value,
        timestamp: row.timestamp
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};