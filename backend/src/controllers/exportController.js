import pool from '../config/db.js';

const queries = {
  order: `
    SELECT o.ordered_at::date AS day,
           COUNT(DISTINCT o.id) AS order_count,
           SUM(oi.qty) AS total_qty,
           SUM(oi.qty * oi.price) AS total_amount
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.status = 'paid'
      AND o.store_id = $1
      AND o.ordered_at::date BETWEEN $2 AND $3
    GROUP BY day
    ORDER BY day;
  `,
  dish: `
    SELECT oi.dish_id,
           d.name AS dish_name,
           SUM(oi.qty) AS qty_sold,
           SUM(oi.qty * oi.price) AS revenue
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN dishes d ON d.id = oi.dish_id
    WHERE o.status = 'paid'
      AND o.store_id = $1
      AND o.ordered_at::date BETWEEN $2 AND $3
    GROUP BY oi.dish_id, d.name
    ORDER BY revenue DESC;
  `,
  attendance: `
    SELECT a.employee_id,
           e.full_name,
           COUNT(*) AS shifts,
           ROUND(SUM(EXTRACT(EPOCH FROM (a.check_out - a.check_in)))/3600.0, 2) AS hours
    FROM attendance a
    JOIN employees e ON e.id = a.employee_id
    WHERE a.store_id = $1
      AND a.check_in::date BETWEEN $2 AND $3
    GROUP BY a.employee_id, e.full_name
    ORDER BY e.full_name;
  `,
  revenue: `
    WITH per_order AS (
      SELECT o.id,
             o.ordered_at::date AS day,
             SUM(oi.qty * oi.price) AS amount
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.status = 'paid'
        AND o.store_id = $1
        AND o.ordered_at::date BETWEEN $2 AND $3
      GROUP BY o.id, o.ordered_at::date
    )
    SELECT day,
           COUNT(*) AS orders,
           SUM(amount) AS revenue,
           ROUND(AVG(amount),0) AS avg_ticket
    FROM per_order
    GROUP BY day
    ORDER BY day;
  `
};

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = rows.map(row => headers.map(h => row[h]).join(','));
  return [headers.join(','), ...lines].join('\n');
}

export async function exportReport(req, res) {
  const { category, from, to, store_id } = req.body;
  if (!queries[category]) return res.status(400).json({ error: 'Invalid category' });

  try {
    const { rows } = await pool.query(queries[category], [store_id, from, to]);
    const csv = toCsv(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment(`${category}_report.csv`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}