<h2 align="center">Shorten It</h2>
<p align="center">Cloudflare Managed Deployment</p>
<p align="center">Disclaimer: All risks arising from the use of this project are borne by the user. We are not responsible for any direct, indirect, incidental, special or consequential damages resulting from the use of this project, including but not limited to loss of profits, data loss or other economic losses.
Limitation of Liability: To the maximum extent permitted by applicable law, project authors and contributors shall not be liable for any losses resulting from the use or inability to use this project.</p>


## Deployment

Before you begin, ensure you have Node.js and npm installed on your machine.

And you should create a kv namespace named `SHORT_URLS` in cloudflare dashboard, make sure have saved the kv namespace id.

![DEMO](https://file.helson-lin.cn/Cloudflare%20_%20Web%20Performance%20%26%20Security.jpg)

1. Fork the repository.
2. Clone the repository to your local machine.
3. replace the kv_namespaces id in wrangler.toml with your own.
4. `npm install` to install dependencies.
5. `npm run dev` to start the development server, and open the project in your browser to test the server.
6. `npm run deploy` to build the project.


## Disclaimers

All risks arising from the use of this project shall be borne by the user. We are not responsible for any direct, indirect, incidental, special or consequential damages resulting from the use of this project, including but not limited to loss of profits, data loss or other economic losses.
Limitation of Liability: To the maximum extent permitted by applicable law, project authors and contributors shall not be liable for any losses resulting from the use or inability to use this project.


## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International Public License. See the [LICENSE](./LICENSE) file for details.
