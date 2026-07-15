#!/usr/bin/env node
// 本地预览服务器 —— 极简 JS 跳转（与生产环境一致）
// 用法: node dev-preview.mjs
// 微信收款码: WXP_PAY_URL="wxp://f2f0xxxx" node dev-preview.mjs

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderErrorHtml, isValidUin, isValidWechatId, isValidChannelsId } from './functions/_lib.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8788;

function redir(targetUrl) {
  let url = targetUrl;
  if (url.startsWith('mqqapi://') && !url.includes('source=')) {
    url += '&source=qrcode';
  }
  const json = JSON.stringify(url);
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"></head><body><script>(function(){var u=${json};var inApp=/QQ\\/|MQQBrowser|MicroMessenger/.test(navigator.userAgent);if(inApp){var f=document.createElement('iframe');f.style.display='none';f.src=u;document.body.appendChild(f);setTimeout(function(){try{f.parentNode.removeChild(f)}catch(e){}},2000)}else{try{location.replace(u)}catch(e){location.href=u}}})()</script></body></html>`;
  return { status: 200, body: html };
}
function err(msg, status = 400) { return { status, body: renderErrorHtml(msg) }; }

// ---- QQ ----
function handleQun(url) {
  const qun = (url.searchParams.get('qun') || '').trim();
  if (!qun) return err('缺少 qun 参数');
  if (!isValidUin(qun)) return err('qun 参数格式不正确（应为 4-14 位纯数字）');
  return redir(`mqqapi://card/show_pslcard?src_type=internal&version=1&card_type=group&uin=${qun}`);
}
function handleChat(url) {
  const qq = (url.searchParams.get('qq') || '').trim();
  if (!qq) return err('缺少 qq 参数');
  if (!isValidUin(qq)) return err('qq 参数格式不正确（应为 4-14 位纯数字）');
  return redir(`mqqwpa://im/chat?chat_type=wpa&uin=${qq}&version=1&src_type=web`);
}
function handleCard(url) {
  const qq = (url.searchParams.get('qq') || '').trim();
  if (!qq) return err('缺少 qq 参数');
  if (!isValidUin(qq)) return err('qq 参数格式不正确（应为 4-14 位纯数字）');
  return redir(`mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}`);
}

// ---- 微信 ----
function handleWxAdd(url) {
  const wx = (url.searchParams.get('wx') || '').trim();
  if (!wx) return err('缺少 wx 参数');
  if (!isValidWechatId(wx)) return err('微信号格式不正确（字母开头，6-20位）');
  return redir(`weixin://addfriend/${wx}`);
}
function handleWxPay() {
  const payUrl = (process.env.WXP_PAY_URL || '').trim();
  if (!payUrl) return err('收款码未配置：请设置环境变量 WXP_PAY_URL', 500);
  return redir(payUrl);
}
function handleWxScan() { return redir('weixin://dl/scan'); }
function handleWxChannels(url) {
  const username = (url.searchParams.get('username') || '').trim();
  if (!username) return err('缺少 username 参数');
  if (!isValidChannelsId(username)) return err('username 参数格式不正确');
  return redir(`weixin://channelsprofile?username=${encodeURIComponent(username)}`);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    try {
      const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('无法读取 index.html: ' + e.message);
    }
    return;
  }

  let result = null;
  if (pathname === '/api-qq.qun') result = handleQun(url);
  else if (pathname === '/api-qq.chat') result = handleChat(url);
  else if (pathname === '/api-qq') result = handleCard(url);
  else if (pathname === '/api-wx') result = handleWxAdd(url);
  else if (pathname === '/api-wx.pay') result = handleWxPay();
  else if (pathname === '/api-wx.scan') result = handleWxScan();
  else if (pathname === '/api-wx.channels') result = handleWxChannels(url);

  if (result) {
    res.writeHead(result.status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(result.body);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  const base = `http://localhost:${PORT}`;
  const wxp = process.env.WXP_PAY_URL ? '✓' : '✗';
  console.log(`\n  QQ/微信跳转预览 ✓ (JS location.replace)\n  ─────────────────────────────\n  跳群:     ${base}/api-qq.qun?qun=123456789\n  临时会话: ${base}/api-qq.chat?qq=10001\n  名片:     ${base}/api-qq?qq=10001\n  加好友:   ${base}/api-wx?wx=abc123\n  收款码:   ${base}/api-wx.pay  (${wxp})\n  扫一扫:   ${base}/api-wx.scan\n  视频号:   ${base}/api-wx.channels?username=v2_xxx\n  ─────────────────────────────\n  Ctrl+C 停止\n`);
});
