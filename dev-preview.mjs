#!/usr/bin/env node
// 本地预览服务器 —— 无需安装 wrangler 即可完整测试全部 7 个跳转接口
// 用法: node dev-preview.mjs
// 然后访问 http://localhost:8788
//
// 微信收款码测试: WXP_PAY_URL="wxp://f2f0xxxx" node dev-preview.mjs
//
// 注意: 此文件仅用于本地开发预览，不会影响 Cloudflare Pages 部署。

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderJumpHtml, renderErrorHtml, isValidUin, isValidWechatId, isValidChannelsId } from './functions/_lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8788;

// 微信主题
const WX = { logo: '微信', brandColor: '#07c160', brandColorDark: '#06ad56' };

// ---------- QQ 接口 ----------
function handleQun(url) {
  const qun = (url.searchParams.get('qun') || '').trim();
  if (!qun) return { status: 400, body: renderErrorHtml('缺少 qun 参数') };
  if (!isValidUin(qun)) return { status: 400, body: renderErrorHtml('qun 参数格式不正确（应为 4-14 位纯数字）') };
  const target = `mqqapi://card/show_pslcard?src_type=internal&version=1&card_type=group&uin=${qun}`;
  return { status: 200, body: renderJumpHtml(target, '打开群聊', { uin: `群号: ${qun}` }) };
}

function handleChat(url) {
  const qq = (url.searchParams.get('qq') || '').trim();
  if (!qq) return { status: 400, body: renderErrorHtml('缺少 qq 参数') };
  if (!isValidUin(qq)) return { status: 400, body: renderErrorHtml('qq 参数格式不正确（应为 4-14 位纯数字）') };
  const target = `mqqwpa://im/chat?chat_type=wpa&uin=${qq}&version=1&src_type=web`;
  return { status: 200, body: renderJumpHtml(target, '发起临时会话', { uin: `QQ: ${qq}` }) };
}

function handleCard(url) {
  const qq = (url.searchParams.get('qq') || '').trim();
  if (!qq) return { status: 400, body: renderErrorHtml('缺少 qq 参数') };
  if (!isValidUin(qq)) return { status: 400, body: renderErrorHtml('qq 参数格式不正确（应为 4-14 位纯数字）') };
  const target = `mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}`;
  return { status: 200, body: renderJumpHtml(target, '查看名片', { uin: `QQ: ${qq}` }) };
}

// ---------- 微信接口 ----------
function handleWxAdd(url) {
  const wx = (url.searchParams.get('wx') || '').trim();
  if (!wx) return { status: 400, body: renderErrorHtml('缺少 wx 参数') };
  if (!isValidWechatId(wx)) return { status: 400, body: renderErrorHtml('微信号格式不正确（字母开头，6-20位）') };
  const target = `weixin://addfriend/${wx}`;
  return { status: 200, body: renderJumpHtml(target, '添加微信好友', { uin: `微信号: ${wx}`, ...WX }) };
}

function handleWxPay() {
  const payUrl = (process.env.WXP_PAY_URL || '').trim();
  if (!payUrl) {
    return { status: 500, body: renderErrorHtml('收款码未配置：请设置环境变量 WXP_PAY_URL（本地：WXP_PAY_URL="wxp://..." node dev-preview.mjs）') };
  }
  return { status: 200, body: renderJumpHtml(payUrl, '微信收款', WX) };
}

function handleWxScan() {
  return { status: 200, body: renderJumpHtml('weixin://dl/scan', '微信扫一扫', WX) };
}

function handleWxChannels(url) {
  const username = (url.searchParams.get('username') || '').trim();
  if (!username) return { status: 400, body: renderErrorHtml('缺少 username 参数') };
  if (!isValidChannelsId(username)) return { status: 400, body: renderErrorHtml('username 参数格式不正确') };
  const target = `weixin://channelsprofile?username=${encodeURIComponent(username)}`;
  return { status: 200, body: renderJumpHtml(target, '查看视频号', { uin: `视频号: ${username}`, ...WX }) };
}

// ---------- 路由 ----------
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    try {
      const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('无法读取 index.html: ' + e.message);
    }
    return;
  }

  let result = null;
  // QQ
  if (pathname === '/api-qq.qun') result = handleQun(url);
  else if (pathname === '/api-qq.chat') result = handleChat(url);
  else if (pathname === '/api-qq') result = handleCard(url);
  // 微信
  else if (pathname === '/api-wx') result = handleWxAdd(url);
  else if (pathname === '/api-wx.pay') result = handleWxPay();
  else if (pathname === '/api-wx.scan') result = handleWxScan();
  else if (pathname === '/api-wx.channels') result = handleWxChannels(url);

  if (result) {
    res.writeHead(result.status, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Referrer-Policy': 'no-referrer'
    });
    res.end(result.body);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  const base = `http://localhost:${PORT}`;
  const wxpStatus = process.env.WXP_PAY_URL ? '✓ 已配置' : '✗ 未配置 WXP_PAY_URL';
  console.log('');
  console.log('  QQ / 微信 跳转预览服务已启动 ✓');
  console.log('  ────────────────────────────────────────────');
  console.log('  【QQ】');
  console.log(`  跳群:       ${base}/api-qq.qun?qun=123456789`);
  console.log(`  临时会话:   ${base}/api-qq.chat?qq=10001`);
  console.log(`  个人名片:   ${base}/api-qq?qq=10001`);
  console.log('  【微信】');
  console.log(`  加好友:     ${base}/api-wx?wx=abc123`);
  console.log(`  收款码:     ${base}/api-wx.pay  (${wxpStatus})`);
  console.log(`  扫一扫:     ${base}/api-wx.scan`);
  console.log(`  视频号:     ${base}/api-wx.channels?username=v2_xxx`);
  console.log('  ────────────────────────────────────────────');
  console.log('  按 Ctrl+C 停止');
  console.log('');
});
