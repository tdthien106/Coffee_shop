import db from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Get date range (default to last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Calculate previous period dates (30 days before the current period)
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(startDate.getDate() - 30);
    const prevEndDate = new Date(startDate); // Previous period ends when current period starts

    // Format dates for SQL queries (PostgreSQL compatible format)
    const formatDate = (date) =>
      date.toISOString().slice(0, 19).replace("T", " ");
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    const prevStartDateStr = formatDate(prevStartDate);
    const prevEndDateStr = formatDate(prevEndDate);

    // ---------- SQL QUERIES (đã ép kiểu số) ----------
    const summaryQuery = `
      SELECT 
        COUNT(o.order_id)::int AS order_count,
        COALESCE(SUM(p.amount), 0)::bigint AS total_revenue,
        (SELECT COUNT(*)::int FROM employees WHERE end_date IS NULL AND position = 'Staff') AS staff_count
      FROM orders o
      LEFT JOIN payment p ON p.order_id = o.order_id
      WHERE o.create_time BETWEEN $1::timestamp AND $2::timestamp
    `;

    const netRevenueQuery = `
      WITH current_period AS (
        SELECT COALESCE(SUM(p.amount), 0)::bigint AS revenue
        FROM payment p
        JOIN orders o ON p.order_id = o.order_id
        WHERE p.payment_date BETWEEN $1::timestamp AND $2::timestamp
      ),
      previous_period AS (
        SELECT COALESCE(SUM(p.amount), 0)::bigint AS revenue
        FROM payment p
        JOIN orders o ON p.order_id = o.order_id
        WHERE p.payment_date BETWEEN $3::timestamp AND $4::timestamp
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

    const revenueOrdersQuery = `
      SELECT 
        o.order_id,
        'HCMUS - 227NVC' AS location,
        p.amount::bigint AS value
      FROM orders o
      JOIN payment p ON p.order_id = o.order_id
      WHERE o.create_time BETWEEN $1::timestamp AND $2::timestamp
      ORDER BY p.amount DESC
      LIMIT 5
    `;

    const rushHourQuery = `
      SELECT 
        EXTRACT(HOUR FROM o.create_time)::int AS hour,
        COUNT(*)::int AS order_count
      FROM orders o
      WHERE o.create_time BETWEEN $1::timestamp AND $2::timestamp
      GROUP BY hour
      ORDER BY hour
    `;

    const revenueByHourQuery = `
      SELECT 
        EXTRACT(HOUR FROM o.create_time)::int AS hour,
        COALESCE(SUM(p.amount), 0)::bigint AS revenue
      FROM orders o
      JOIN payment p ON p.order_id = o.order_id
      WHERE o.create_time BETWEEN $1::timestamp AND $2::timestamp
      GROUP BY hour
      ORDER BY hour
    `;

    const menuProportionQuery = `
      SELECT 
        m.category,
        COUNT(od.drink_id)::int AS order_count
      FROM order_detail od
      JOIN menu_item m ON od.drink_id = m.item_id
      JOIN orders o ON od.order_id = o.order_id
      WHERE o.create_time BETWEEN $1::timestamp AND $2::timestamp
      GROUP BY m.category
    `;

    const recentOrdersQuery = `
      SELECT 
        o.order_id,
        'HCMUS - 227NVC' AS location,
        p.amount::bigint AS value,
        o.create_time AS timestamp
      FROM orders o
      JOIN payment p ON p.order_id = o.order_id
      WHERE o.create_time BETWEEN $1::timestamp AND $2::timestamp
      ORDER BY o.create_time DESC
      LIMIT 5
    `;

    // ---------- EXECUTE ----------
    const [
      summaryResult,
      netRevenueResult,
      reserveResult,
      revenueOrdersResult,
      rushHourResult,
      menuProportionResult,
      recentOrdersResult,
      revenueByHourResult,
      previousRevenueByHourResult,
    ] = await Promise.all([
      db.query(summaryQuery, [startDateStr, endDateStr]),
      db.query(netRevenueQuery, [
        startDateStr,
        endDateStr,
        prevStartDateStr,
        prevEndDateStr,
      ]),
      db.query(
        "SELECT COALESCE(SUM(i.current_stock * i.unit_price), 0)::bigint AS reserve_value FROM ingredient i"
      ),
      db.query(revenueOrdersQuery, [startDateStr, endDateStr]),
      db.query(rushHourQuery, [startDateStr, endDateStr]),
      db.query(menuProportionQuery, [startDateStr, endDateStr]),
      db.query(recentOrdersQuery, [startDateStr, endDateStr]),
      db.query(revenueByHourQuery, [startDateStr, endDateStr]),
      db.query(revenueByHourQuery, [prevStartDateStr, prevEndDateStr]),
    ]);

    // ---------- JS SAFETY LAYER ----------
    const asNumber = (v) => Number(String(v).replace(/[^\d.-]/g, ""));

    const summaryRow = summaryResult.rows[0] || {};
    const netRow = netRevenueResult.rows[0] || {};

    const orders = asNumber(summaryRow.order_count || 0);
    const revenue = asNumber(summaryRow.total_revenue || 0);
    const staffs = asNumber(summaryRow.staff_count || 0);

    const currentRevenue = asNumber(netRow.current_revenue || 0);
    const previousRevenue = asNumber(netRow.previous_revenue || 0);
    const percentageChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Handle empty data cases
    const allHours = Array.from({ length: 24 }, (_, i) => i);

    // map revenue by hour (current vs previous)
    const revenueByHour = allHours.map((hour) => {
      const current = revenueByHourResult.rows.find((r) => r.hour === hour);
      const previous = previousRevenueByHourResult.rows.find(
        (r) => r.hour === hour
      );
      return {
        hour,
        currentRevenue: asNumber(current?.revenue || 0),
        previousRevenue: asNumber(previous?.revenue || 0),
      };
    });

    const rushHourData = allHours.map((hour) => {
      const existing = rushHourResult.rows.find((r) => r.hour === hour);
      return existing
        ? { hour: existing.hour, order_count: asNumber(existing.order_count) }
        : { hour, order_count: 0 };
    });

    const peakHour = rushHourData.reduce(
      (prev, curr) => (prev.order_count > curr.order_count ? prev : curr),
      { hour: 0, order_count: 0 }
    ).hour;

    // Calculate menu proportions with percentages
    const totalMenuItems = menuProportionResult.rows.reduce(
      (sum, item) => sum + asNumber(item.order_count),
      0
    );

    const menuProportionWithPercentage = menuProportionResult.rows.map(
      (item) => {
        const count = asNumber(item.order_count);
        return {
          ...item,
          order_count: count,
          percentage:
            totalMenuItems > 0 ? Math.round((count / totalMenuItems) * 100) : 0,
        };
      }
    );

    // ---------- RESPONSE ----------
    const response = {
      storeInfo: {
        name: "MAT COFFEE SHOP",
        currentStore: "HotMédecine",
        period: `${formatDate(startDate)} to ${formatDate(endDate)}`,
      },
      summaryStats: {
        orders,
        revenue,
        staffs,
      },
      netRevenue: {
        value: asNumber(netRow.current_revenue || 0),
        unit: "VND",
        trend: netRow.trend || "neutral",
        percentageChange,
      },
      reserveClassification: {
        value: asNumber(reserveResult.rows[0]?.reserve_value || 0) / 1_000_000,
        unit: "Million VND",
      },
      revenueOrders: revenueOrdersResult.rows.map((r) => ({
        ...r,
        value: asNumber(r.value),
      })),
      rushHour: {
        data: rushHourData,
        peakHour,
        unit: "Orders",
      },
      menuProportion: {
        data: menuProportionWithPercentage,
        unit: "Orders",
      },
      recentOrders: recentOrdersResult.rows.map((r) => ({
        ...r,
        value: asNumber(r.value),
      })),
      revenueByHour, // nếu frontend cần vẽ chart theo giờ
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
    });
  }
};
