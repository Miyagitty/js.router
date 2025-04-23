var express = require('express');
const cors = require('cors');
var app = express();

// 使用 cors 中间件
app.use(cors());
app.use(express.static('images'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//引入multer
const multer = require('multer')
const upload = multer({ dest: 'images/uploads/' })

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

app.delete('/api/users', (req, res) => {
    const id = req.params.id;
    const index = records.findIndex(item => item.id === id);
    if (index !== -1) {
        records.splice(index, 1);
        res.send({ ok: 1 });
    } else {
        res.status(404).send({ ok: 0 });
    }
});

app.put('/api/users', (req, res) => {
    const id = req.params.id;
    const index = records.findIndex(item => item.id === id);
    if (index !== -1) {
        records[index] = { ...records[index], ...req.body };
        res.send({ ok: 1 });
    } else {
        res.status(404).send({ ok: 0 });
    }
});

app.post('/api/uploads', upload.single("avatar"), function (req, res) {
    const avatar = req.file ? `http://127.0.0.1:3000/uploads/${req.file.filename}` : `http://127.0.0.1:3000/default.png`
    const { username, password, date, address } = req.body;
    addRecord(records, username, password, date, avatar, address);
    res.send({
        ok: 1
    })

})

app.get('/', function (req, res) {
    res.send('hello world')
})

app.get('/api/users', function (req, res) {
    res.send(records)
})

app.listen(3000, () => {
    console.log("server start")
})