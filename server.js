const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const multer = require('multer');

// 允许跨域请求
app.use(cors());
// 解析JSON请求体
app.use(express.json()); // 添加此行以解析JSON请求体
// 然后添加校验中间件
app.use('/api/products', (req, res, next) => {
  if (req.method === 'POST') {
    // 添加空对象兜底
    const { price } = req.body || {};
    if (price && isNaN(Number(price))) {
      return res.status(400).json({ error: '价格格式不正确' });
    }
  }
  next();
});
// 新增静态资源中间件
app.use('/images', express.static(path.join(__dirname, 'images')));
// 在所有路由之后添加
app.use((err, req, res, next) => {
  console.error('全局错误:', err);
  res.status(500).json({ error: '服务器内部错误' });
});


// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'images'))
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png']
    cb(null, allowedTypes.includes(file.mimetype))
  }
})

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

// 新增商品接口（放在商品列表接口之后，启动服务器之前）
app.post('/api/products', upload.single('image'), (req, res) => { // 添加multer中间件app.post('/api/products', upload.single('image'), (req, res) => {
  // 合并表单字段和上传文件信息
  const newProduct = {
    ...req.body,      // 获取表单文本字段
    image: req.file ? `/images/${req.file.filename}` : '/images/default.jpg'
  };

  // 调试日志（可查看完整数据）
  console.log('[FORM DATA]', {
    body: req.body,
    file: req.file
  });

  // 校验逻辑需要调整（因为表单字段是字符串）
  if (!newProduct.name || !newProduct.price) {
    return res.status(400).json({
      error: `缺少必填字段：${!newProduct.name ? 'name' : 'price'}`
    });
  }

  // 类型转换
  const fullProduct = {
    id: Math.max(...products.map(p => p.id)) + 1,
    name: newProduct.name,
    price: Number(newProduct.price),
    originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : Math.round(newProduct.price * 1.2),
    image: newProduct.image,
    sales: newProduct.sales ? Number(newProduct.sales) : 0,
    rating: newProduct.rating ? Number(newProduct.rating) : 0,
    stock: newProduct.stock ? Number(newProduct.stock) : 0,
    isHot: newProduct.isHot === 'true' // 表单传输的布尔值需要特殊处理
  };

  products.push(fullProduct);
  res.status(201).json(fullProduct);
});

// 更新商品接口
app.put('/api/products/:id', upload.single('image'), (req, res) => {
  const productId = Number(req.params.id); // 获取商品ID
  const updatedData = {
    ...req.body, // 获取表单字段
    image: req.file ? `/images/${req.file.filename}` : undefined // 处理上传文件
  };

  // 查找要更新的商品
  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ error: '商品未找到' });
  }

  // 更新商品信息
  const updatedProduct = {
    ...products[productIndex], // 保留原有字段
    ...updatedData,            // 覆盖新字段
    id: productId,             // 确保ID不变
    price: Number(updatedData.price), // 类型转换
    originalPrice: updatedData.originalPrice ? Number(updatedData.originalPrice) : undefined,
    sales: updatedData.sales ? Number(updatedData.sales) : products[productIndex].sales,
    rating: updatedData.rating ? Number(updatedData.rating) : products[productIndex].rating,
    stock: updatedData.stock ? Number(updatedData.stock) : products[productIndex].stock,
    isHot: updatedData.isHot === 'true' // 布尔值处理
  };

  // 更新内存中的商品数据
  products[productIndex] = updatedProduct;

  res.status(200).json(updatedProduct);
});

// 删除商品接口
app.delete('/api/products/:id', (req, res) => {
  const productId = Number(req.params.id);

  // 查找商品索引
  const productIndex = products.findIndex(p => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ error: '商品不存在' });
  }

  // 删除商品
  const [deletedProduct] = products.splice(productIndex, 1);

  res.status(200).json({
    message: '删除成功',
    deleted: deletedProduct
  });
});

// 启动服务器
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`商品数据端点：GET /api/products`);
  console.log(`生成测试数据 ${products.length} 条`);
});