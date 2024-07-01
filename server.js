import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// import { createProxyMiddleware } from 'http-proxy-middleware';
import checkRateLimit from './proxyServer/cors-anywhere/lib/rate-limit.js';
import cors_proxy from './proxyServer/cors-anywhere/lib/cors-anywhere.js';

// __dirname 및 __filename 설정
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const appPort = process.env.PORT || 5000;

// Express 애플리케이션 생성
const app = express();

// 정적 파일 제공
app.use(express.static(path.join(__dirname, '/public')));

// 라우트 설정
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/index-domeggook.html'));
    
});

app.get('/domeggook', (req, res) => {
    console.log("/domeggook에 들어왔음");
    res.sendFile(path.join(__dirname, '/public/html/index-domeggook.html'));
});

app.get('/1688', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/html/index-1688.html'));
});

app.get('/health-check', (req, res) => {
    console.log("** health checking executed");
    res.sendStatus(200);
});

// 환경 변수에서 블랙리스트 및 화이트리스트 설정
function parseEnvList(env) {
    if (!env) {
        return [];
    }
    return env.split(',');
}

var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);

// 프록시 서버 생성
const proxy = cors_proxy.createServer({
    originBlacklist: originBlacklist,
    originWhitelist: originWhitelist,
    // requireHeader 옵션 제거 또는 수정
    // requireHeader: ['origin', 'x-requested-with'],
    checkRateLimit: checkRateLimit(process.env.CORSANYWHERE_RATELIMIT),
    removeHeaders: [
        'cookie',
        'cookie2',
        'x-request-start',
        'x-request-id',
        'via',
        'connect-time',
        'total-route-time',
    ],
    redirectSameOrigin: true,
    httpProxyOptions: {
        xfwd: false,
    },
});

// 프록시 미들웨어 설정
app.use('/proxy', (req, res) => {
    proxy.emit('request', req, res);
});

// 서버 시작
app.listen(appPort, () => {
    console.log(`Server is listening at http://localhost:${appPort}`);
});
