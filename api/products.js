const express = require('express');
const router = express.Router();

// Danh sách sản phẩm đồ uống
const products = [
  {
    id: 1,
    name: "Cà phê",
    description: "Cà phê đen nguyên chất, thơm ngon đậm đà",
    price: 15000,
    category: "Cà phê"
  },
  {
    id: 2,
    name: "Cà phê sữa",
    description: "Cà phê pha với sữa đặc, ngọt ngào quyến rũ",
    price: 20000,
    category: "Cà phê"
  },
  {
    id: 3,
    name: "Tung tung tung sahur",
    description: "Thức uống đặc biệt cho mùa lễ hội",
    price: 25000,
    category: "Đặc biệt"
  },
  {
    id: 4,
    name: "Tralalero tralala",
    description: "Thức uống sảng khoái với hương vị trái cây nhiệt đới",
    price: 30000,
    category: "Nước ép"
  }
];

// Lấy tất cả sản phẩm
router.get('/', (req, res) => {
  res.json(products);
});

// Lấy sản phẩm theo ID
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
  res.json(product);
});

// Tìm kiếm sản phẩm theo tên
router.get('/search/:name', (req, res) => {
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(req.params.name.toLowerCase())
  );
  res.json(filteredProducts);
});

module.exports = router;