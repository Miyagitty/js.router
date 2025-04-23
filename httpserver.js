/*
 * @作者: kerwin
 * @公众号: 大前端私房菜
 */
var http = require("http")
var fs = require("fs")


function renderHtml(res,path){
    res.writeHead(200, { "Content-Type": "text/html;charset=utf8"})
    res.write(fs.readFileSync(path), "utf-8")
}

function renderJpeg(res,path){
    res.writeHead(200, { "Content-Type": "image/jpeg;charset=utf8"})
    res.write(fs.readFileSync(path), "utf-8")
}

function myroute(url,res){
    switch (url) {
        case "/home":
            renderHtml(res,"./index.html")
            break;
        
        case "/cat":
            renderJpeg(res,"./images/cat.jpeg")
            break;
            
        case "/dog":
            renderJpeg(res,"./images/dog.jpeg")
            break;
            
        case "/pigeon":
            renderJpeg(res,"./images/pigeon.jpeg")
            break;
        
        default:
            renderHtml(res,"./404.html")
            break;
    }

}


//创建服务器
http.createServer((req,res)=>{
    //req 接受浏览器传的参数 
    //res 返回渲染的内容

    //获取用户请求的路径（路由）
    const myURL = new URL(req.url, "http://127.0.0.1")

    var url=myURL.pathname
    myroute(url,res)


    res.end()
}).listen(3000,()=>{
    console.log("server start")
})