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
let products = Array(40).fill().map((_, i) => ({
  id: i + 1,
  name: `天选${5 + Math.floor(i / 10)}pro`,
  price: Math.floor(Math.random() * (10000 - 3000) + 3000),
  originalPrice: Math.floor(Math.random() * (15000 - 5000) + 5000),
  image: `/images/${(i % 5) + 1}.jpg`,
  sales: Math.floor(Math.random() * 1000),
  rating: Number((Math.random() * 3 + 2).toFixed(1)),
  stock: Math.floor(Math.random() * 50),
  isHot: Math.random() > 0.7
}));

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