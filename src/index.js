// 短链生成的字符集
const CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

// 生成短链的长度
const SHORT_URL_LENGTH = 6;

// 生成随机短链
function generateShortUrl() {
    let shortUrl = '';
    for (let i = 0; i < SHORT_URL_LENGTH; i++) {
        shortUrl += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    return shortUrl;
}

// 生成 HTML 页面
async function generateHtml() {
    return `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
			<script src="https://cdn.tailwindcss.com"></script>
            <title>Shorten It</title>
            <style>
                body { font-family: Arial, sans-serif; }
                form { margin: 20px; }
                input[type="text"] { width: 300px; padding: 10px; }
                input[type="submit"] { padding: 10px; }
            </style>
        </head>
        <body>
            <h1 class="text-2xl font-bold mb-4 mt-4 mx-auto flex justify-center items-center">短链接生成器</h1>
            <form id="urlForm" class="mx-auto flex justify-center items-center">
                <input class="" type="text" id="longUrl" placeholder="输入长链接" required class="mr-2 border border-gray-300 p-2 rounded"/>
                <input type="submit" value="生成短链接" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"/>
            </form>
            <div id="result"></div>
            <script>
                document.getElementById('urlForm').onsubmit = async (e) => {
                    e.preventDefault();
                    const longUrl = document.getElementById('longUrl').value;
                    const response = await fetch('/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ longUrl })
                    });
                    const data = await response.json();
					if (response.ok) {
						if (data.have) {
								document.getElementById('result').innerHTML = '原地址已存在，短链接: <a href="' + data.shortUrl + '">' + data.shortUrl + '</a>' ;
						} else {
						 document.getElementById('result').innerHTML = '短链接: <a href="' + data.shortUrl + '">' + data.shortUrl + '</a>' ;
						}
					} else {
						document.getElementById('result').innerHTML = '错误: ' + data.message;
					}
                };
            </script>
        </body>
        </html>
    `;
}

// 处理请求
async function handleRequest(request) {
    const url = new URL(request.url);
    const BASE_URL = `${url.protocol}//${url.host}/`; // 自动识别服务的域名

    if (request.method === 'POST') {
        const body = await request.json();
        const longUrl = body.longUrl;

        if (!longUrl) {
            return new Response(JSON.stringify({ message: 'Invalid URL' }), { status: 400 });
        }

        // 检查长链接是否已经存在
        const existingShortUrl = await SHORT_URLS.get(longUrl);
        if (existingShortUrl) {
            return new Response(JSON.stringify({ shortUrl: existingShortUrl, have: true }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // 生成短链并存储
        let shortUrl;
        let existingUrl;

        // 确保短链唯一
        do {
            shortUrl = generateShortUrl();
            existingUrl = await SHORT_URLS.get(shortUrl);
        } while (existingUrl);

        // 存储短链和长链接
        await SHORT_URLS.put(shortUrl, longUrl);
        // 将长链接和短链接的映射存入 KV
        await SHORT_URLS.put(longUrl, BASE_URL + shortUrl);

        return new Response(JSON.stringify({ shortUrl: BASE_URL + shortUrl, have: false }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } else {
        // 返回 HTML 页面
        return new Response(await generateHtml(), {
            headers: { 'Content-Type': 'text/html' },
        });
    }
}

// 处理短链的重定向
async function handleRedirect(request) {
    const url = new URL(request.url);
    const shortPath = url.pathname.slice(1); // 获取路径部分
    const longUrl = await SHORT_URLS.get(shortPath);

    // 重定向到原始 URL
    if (longUrl) {
        return Response.redirect(longUrl, 302);
    } else {
        return new Response('Not Found', { status: 404 });
    }
}

// 事件监听器
addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (event.request.method === 'GET' && url.pathname !== '/') {
        event.respondWith(handleRedirect(event.request));
    } else {
        event.respondWith(handleRequest(event.request));
    }
});
