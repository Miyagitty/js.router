var express = require('express');
const cors = require('cors');
var app = express();
const mysql2 = require("mysql2")

// 使用 cors 中间件
app.use(cors());
app.use(express.static('images'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const path = require('path')

//引入multer
const multer = require('multer');
// 1. 配置Multer存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads')) // 确保目录存在
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

// 1. 增强错误处理中间件
app.use((err, req, res, next) => {
    console.error('全局错误:', err.stack)
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : '服务器错误'
    })
})

// 2. 创建上传中间件
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('仅支持JPEG/PNG/GIF格式'))
        }
        cb(null, true)
    }
})

const records = [
    { id: '1', name: '邓瑞', web: 'dengruicode.com', address: '福州', date: '2023-06-20' },
    { id: '2', name: 'David', web: 'www.dengruicode.com', address: '福州', date: '2023-06-21' },
    { id: '3', name: 'Luna', web: 'dengruicode.com', address: '福州', date: '2023-06-22' },
    { id: '4', name: 'Lisa', web: 'www.dengruicode.com', address: '福州', date: '2023-06-22' },
    { id: '5', name: '李森光', web: 'www.localhost.com', address: '福州', date: '2025-04-17' }
];

function addRecord(arr, newName, newWeb, newDate, newAvatar, newAddress) {
    // 找出最大的 id 值
    let maxId = 0;
    arr.forEach(item => {
        const currentId = parseInt(item.id);
        if (currentId > maxId) {
            maxId = currentId;
        }
    });

    // 生成新的 id
    const newId = (maxId + 1).toString();

    // 创建新的记录
    const newRecord = {
        id: newId,
        name: newName,
        web: newWeb,
        date: newDate,
        address: newAddress,
        avatar: newAvatar
    };

    // 将新记录添加到数组中
    arr.push(newRecord);
    return arr;
}

// 删除用户接口
app.delete('/api/users/:id', (req, res) => {
    const id = req.params.id;
    const index = records.findIndex(item => item.id === id);
    if (index !== -1) {
        records.splice(index, 1);
        res.send({ ok: 1 });
    } else {
        res.status(404).send({ ok: 0 });
    }
});

// 3. 带错误处理的路由
app.put('/api/users/:id', upload.single('avatar'), (req, res) => {
    try {
        const id = req.params.id;
        const index = records.findIndex(item => item.id === id);

        if (index === -1) {
            return res.status(404).json({ ok: 0, message: "用户不存在" });
        }

        // 处理基础字段更新
        const updateData = {
            name: req.body.name || records[index].name,
            web: req.body.web || records[index].web,
            date: req.body.date || records[index].date,
            address: req.body.address || records[index].address
        };

        // 处理头像逻辑
        if (req.file) {
            updateData.avatar = `http://127.0.0.1:3000/uploads/${req.file.filename}`;
        } else if (req.body.removeAvatar === 'true') {
            updateData.avatar = null;
        } else {
            updateData.avatar = records[index].avatar; // 保留原头像
        }

        // 执行更新
        records[index] = { ...records[index], ...updateData };

        res.json({
            ok: 1,
            data: records[index]
        });

    } catch (error) {
        console.error('更新错误:', error);
        res.status(500).json({
            ok: 0,
            message: process.env.NODE_ENV === 'development'
                ? error.message
                : '服务器内部错误'
        });
    }
});

app.post('/api/uploads', upload.single("avatar"), function (req, res) {
    try {
        // 处理头像字段
        const avatar = req.file
            ? `http://127.0.0.1:3000/uploads/${req.file.filename}`
            : req.body.avatar || null; // 允许前端直接传URL

        // 字段验证（与前端的editForm结构对齐）
        const { name, web, date, address } = req.body;
        if (!name || !address) {
            return res.status(400).send({
                ok: 0,
                message: "姓名和地址为必填项"
            });
        }

        // 生成新记录
        addRecord(records,
            name,
            web || "",
            date || new Date().toISOString().split('T')[0],
            avatar,
            address
        );

        res.send({
            ok: 1,
            data: records[records.length - 1]
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            ok: 0,
            message: "服务器内部错误"
        });
    }
})

const config = getDBConfig();
const promisePool = mysql2.createPool(config).promise();

app.post('/api/login', async function (req, res) {
    let { username, password } = req.body;

    const [users] = await promisePool.query('SELECT * FROM students WHERE name = ? AND password = ?', [username, password]);
    if (users.length) {
        res.send({ ok: 200, message: '登录成功', token: username + '36' });
    } else {
        res.status(401).send({ ok: 401, message: '用户名或密码错误' });
    }
});

// 在已有配置中添加（放在其他静态资源之后）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', function (req, res) {
    res.send('hello world')
})

app.get('/api/users', function (req, res) {
    res.send(records)
})

app.listen(3000, () => {
    console.log("server start")
})

function getDBConfig() {
    return {
        host: '127.0.0.1',
        port: 3306,
        user: "root",
        password: "123456",
        database: "kerwin_test",
        connectionLimit: 1,
        charset: 'utf8_general_ci' // 指定客户端字符集
    }
}