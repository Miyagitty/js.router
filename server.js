const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

// 允许跨域请求
app.use(cors());
// 新增静态资源中间件
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.json());

// 内存存储的商品数据
let products = [
  {
    id: 1,
    name: "机械革命无界14",
    price: 3499,
    originalPrice: 3799,
    image: "/images/1.jpg",
    sales: 856,
    rating: 4.5,
    stock: 42,
    isHot: true
  },
  {
    id: 2,
    name: "华硕天选5pro",
    price: 8699,
    originalPrice: 9999,
    image: "/images/2.jpg",
    sales: 723,
    rating: 4.3,
    stock: 35,
    isHot: false
  },
  {
    id: 3,
    name: "联想拯救者Y9000X",
    price: 8999,
    originalPrice: 9999,
    image: "/images/3.jpg",
    sales: 921,
    rating: 4.7,
    stock: 28,
    isHot: true
  },
  {
    id: 4,
    name: "联想小新YOGA14",
    price: 4499,
    originalPrice: 4999,
    image: "/images/4.jpg",
    sales: 838,
    rating: 4.7,
    stock: 35,
    isHot: true
  },
  {
    id: 5,
    name: "联想Y9000P",
    price: 9499,
    originalPrice: 10999,
    image: "/images/5.jpg",
    sales: 666,
    rating: 4.6,
    stock: 66,
    isHot: true
  }, {
    id: 6,
    name: "X1Carbon",
    price: 4899,
    originalPrice: 5599,
    image: "/images/6.jpg",
    sales: 623,
    rating: 4.8,
    stock: 12,
    isHot: false
  }, {
    id: 7,
    name: "联想小新YOGA Air14s骁龙",
    price: 9999,
    image: "/images/7.jpg",
    sales: 665,
    rating: 4.1,
    stock: 45,
    isHot: false
  }, {
    id: 8,
    name: "联想THinkBook16Pro",
    price: 5499,
    originalPrice: 6999,
    image: "/images/8.jpg",
    sales: 888,
    rating: 4.8,
    stock: 88,
    isHot: true
  }, {
    id: 9,
    name: "联想THinkPadT14sAI2024",
    price: 11999,
    image: "/images/9.jpg",
    sales: 60,
    rating: 3.7,
    stock: 30,
    isHot: false
  }, {
    id: 10,
    name: "联想小新YOGA",
    price: 4999,
    image: "/images/10.jpg",
    sales: 606,
    rating: 4.7,
    stock: 80,
    isHot: true
  },
];

// 商品列表接口
app.get('/api/products', (req, res) => {
  const {
    page = 1,
    pageSize = 8,
    sortBy = 'sales',
    minPrice = 0,
    maxPrice = 100000
  } = req.query;

  // 深拷贝避免污染原始数据
  let filtered = JSON.parse(JSON.stringify(products));

  // 价格过滤
  filtered = filtered.filter(p =>
    p.price >= Number(minPrice) &&
    p.price <= Number(maxPrice)
  );

  // 排序逻辑
  switch (sortBy) {
    case 'sales':
      filtered.sort((a, b) => b.sales - a.sales);
      break;
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
  }

  // 调整分页算法
  const start = (page - 1) * pageSize;
  const end = start + Number(pageSize);
  const result = filtered.slice(start, end);

  res.json({
    total: filtered.length,
    products: result
  });
});

// 启动服务器
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`商品数据端点：GET /api/products`);
  console.log(`生成测试数据 ${products.length} 条`);
});