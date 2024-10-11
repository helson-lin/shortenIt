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
	const shortUrlsLen = await SHORT_URLS.get('shortUrlsLen');
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
				<p id="websitesNUM" class="flex justify-center items-center py-2 text-base">Now have ${shortUrlsLen}s websites be Shorten</p>
				<form id="urlForm" class="mx-auto flex justify-center items-center md:flex">
					<input class="border border-gray-300 mr-2 p-0 rounded" name="longUrl" type="text" pattern="https?://.+" id="longUrl" placeholder="please input the long url" required/>
					<input type="submit" value="generate" class="bg-gray-800 hover:bg-black hover:cursor-pointer text-white font-bold py-2 px-4 rounded"/>
				</form>
				<div id="result" class="md:text-base flex flex-col justify-center items-center"></div>
			</div>
            <a href="https://github.com/helson-lin/shortenIt" class="github-corner" aria-label="View source on GitHub"><svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a><style>.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>
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
							document.getElementById('websitesNUM').innerHTML = 'Now have '+ data?.shortUrlsLen +'s websites be Shorten'
						} else {
						 	document.getElementById('result').innerHTML = 'short link：  <br> <a href="' + data.shortUrl + '"  class="text-blue-500 hover:text-blue-700">' + data.shortUrl + '</a>' ;
							document.getElementById('websitesNUM').innerHTML = 'Now have '+ data?.shortUrlsLen +'s websites be Shorten'
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
	function isValidURL(url) {
		var pattern = new RegExp('^(https?:\\/\\/)?'+ // 'http://' 或 'https://'
		  '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|'+ // 域名
		  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // 或者IP
		  '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*'+ // 端口和路径
		  '(\\?[;&a-zA-Z\\d%_.~+=-]*)?'+ // 查询字符串
		  '(\\#[-a-zA-Z\\d_]*)?$','i'); // 锚点
		return pattern.test(url);
	  }
    if (request.method === 'POST') {
        const body = await request.json();
        const longUrl = body.longUrl;
        if (!longUrl || !isValidURL(longUrl)) {
            return new Response(JSON.stringify({ message: 'Invalid URL' }), { status: 400 });
        }

        // 检查长链接是否已经存在
		let shortUrlsLen = await SHORT_URLS.get('shortUrlsLen');
        const existingShortUrl = await SHORT_URLS.get(longUrl);
        if (existingShortUrl) {
            return new Response(JSON.stringify({ shortUrl: existingShortUrl, have: true, shortUrlsLen: shortUrlsLen || 0 }), {
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

		// const shortUrlsLen = await SHORT_URLS.get('length');

        // 存储短链和长链接
        await SHORT_URLS.put(shortUrl, longUrl);
        // 将长链接和短链接的映射存入 KV
        await SHORT_URLS.put(longUrl, BASE_URL + shortUrl);
		shortUrlsLen = (shortUrlsLen ? Number(shortUrlsLen) : 0) + 1
		await SHORT_URLS.put('shortUrlsLen', shortUrlsLen);
        return new Response(JSON.stringify({ shortUrl: BASE_URL + shortUrl, have: false, shortUrlsLen }), {
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
