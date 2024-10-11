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
			<link href="https://fonts.font.im/css?family=Hanalei+Fill|Oleo+Script|Righteous|Roboto" rel="stylesheet">
			<script src="https://cdn.tailwindcss.com"></script>
            <title>Shorten It</title>
            <style>
                body { font-family: Righteous, PingFang SC, Fira Sans, sans-serif; background: #f2f2f2; }
                form { margin: 20px; }
                input[type="text"] { width: 300px; padding: 10px; }
                input[type="submit"] { padding: 10px; }
            </style>
        </head>
        <body class="w-screen h-screen flex flex-col">
            <h1 class="text-2xl font-extrabold mb-4 mt-4 mx-auto flex justify-center items-center font-semibold sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500" style="font-family: 'Oleo Script', cursive;">Shorten It</h1>
			<div class="w-full flex-1 px-8 py-24 sm:px-0">
				<form id="urlForm" class="mx-auto flex justify-center items-center md:flex">
					<input class="border border-gray-300 mr-2 p-0 rounded" name="longUrl" type="text" id="longUrl" placeholder="please input the long url" required/>
					<input type="submit" value="generate" class="bg-gray-800 hover:bg-black hover:cursor-pointer text-white font-bold py-2 px-4 rounded"/>
				</form>
				<div id="result" class="md:text-base flex flex-col justify-center items-center"></div>
			</div>
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
								document.getElementById('result').innerHTML = '<p>The original address already exists, short link：</p>  <a href="' + data.shortUrl + '" target="_blank" class="text-blue-500 hover:text-blue-700">' + data.shortUrl + '</a>' ;
						} else {
						 document.getElementById('result').innerHTML = 'short link：  <br> <a href="' + data.shortUrl + '"  class="text-blue-500 hover:text-blue-700">' + data.shortUrl + '</a>' ;
						}
					} else {
						document.getElementById('result').innerHTML = 'Error: ' + data.message;
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
