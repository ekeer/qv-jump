// 共享辅助函数 —— 文件名以 _ 开头，不会被 Cloudflare Pages 当作路由
// 同时被 functions/*.js (Cloudflare Pages) 和 dev-preview.mjs (本地预览) 复用

/**
 * 校验 QQ 号 / 群号：纯数字，4-14 位
 */
export function isValidUin(s) {
  return /^\d{4,14}$/.test(String(s));
}

/**
 * 校验微信号：字母开头，6-20 位，可含字母、数字、下划线、减号
 */
export function isValidWechatId(s) {
  return /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/.test(String(s));
}

/**
 * 校验视频号 username：非空，不含特殊字符
 */
export function isValidChannelsId(s) {
  return /^[a-zA-Z0-9_@.-]{1,64}$/.test(String(s));
}

/**
 * 渲染"立即跳转"页面 HTML
 * - 立即用 location.replace 唤起协议
 * - 800ms 后尝试 window.close() 关闭残留窗口
 * - 兜底显示"手动跳转"按钮
 *
 * @param {string} targetUrl - 协议 URL
 * @param {string} action - 操作描述（如 "打开群聊"）
 * @param {object} [opts]
 * @param {string} [opts.uin] - 回显的 QQ/群号/微信号
 * @param {string} [opts.logo='QQ'] - logo 文字
 * @param {string} [opts.brandColor='#12b7f5'] - 主题色
 * @param {string} [opts.brandColorDark='#0d8ad0'] - 主题深色
 * @returns {string} HTML
 */
export function renderJumpHtml(targetUrl, action, opts = {}) {
  const uin = opts.uin ? escapeHtml(opts.uin) : '';
  const json = JSON.stringify(targetUrl);
  const logo = opts.logo ? escapeHtml(opts.logo) : 'QQ';
  const brand = opts.brandColor || '#12b7f5';
  const brandDark = opts.brandColorDark || '#0d8ad0';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="referrer" content="no-referrer">
<title>正在${escapeHtml(action)}…</title>
<style>
:root { --brand: ${brand}; --brand-dark: ${brandDark}; }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: 100%; }
body {
  background: #f5f6f8;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #1f2329;
  -webkit-font-smoothing: antialiased;
}
.wrap {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}
.card {
  background: #fff;
  border-radius: 18px;
  padding: 34px 28px 26px;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 6px 28px rgba(0,0,0,0.06);
}
.logo {
  width: 60px; height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.title { font-size: 17px; font-weight: 600; margin-bottom: 6px; }
.uin { font-size: 13px; color: var(--brand); margin-bottom: 8px; word-break: break-all; }
.desc { font-size: 13px; color: #8a8f99; line-height: 1.6; }
.btn {
  display: inline-block;
  margin-top: 20px;
  padding: 11px 26px;
  background: var(--brand);
  color: #fff;
  border-radius: 999px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: transform .15s ease, box-shadow .15s ease;
}
.btn:active { transform: scale(0.97); }
.tip { margin-top: 16px; font-size: 12px; color: #c0c4cc; }
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="logo">${logo}</div>
    <div class="title">正在${escapeHtml(action)}…</div>
    ${uin ? `<div class="uin">${uin}</div>` : ''}
    <div class="desc">已尝试唤起客户端，请查看弹窗</div>
    <a class="btn" href="${escapeAttr(targetUrl)}">手动${escapeHtml(action)}</a>
    <div class="tip">若未自动跳转，请点击上方按钮</div>
  </div>
</div>
<script>
(function() {
  var u = ${json};
  try { window.location.replace(u); }
  catch(e) { window.location.href = u; }
  setTimeout(function() {
    try { window.close(); } catch(e) {}
  }, 800);
})();
</script>
</body>
</html>`;
}

/**
 * 渲染错误页面 HTML
 */
export function renderErrorHtml(message) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>参数错误</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f8;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
  color: #1f2329;
  padding: 24px;
  text-align: center;
}
.box {
  background: #fff;
  border-radius: 18px;
  padding: 30px 26px;
  max-width: 360px;
  width: 100%;
  box-shadow: 0 6px 28px rgba(0,0,0,0.06);
}
.icon { font-size: 38px; margin-bottom: 12px; }
.msg { font-size: 15px; font-weight: 500; margin-bottom: 4px; }
.hint { font-size: 12px; color: #c0c4cc; margin-top: 10px; line-height: 1.6; }
</style>
</head>
<body>
<div class="box">
  <div class="icon">⚠️</div>
  <div class="msg">${escapeHtml(message)}</div>
  <div class="hint">请检查链接参数是否完整</div>
</div>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* Cloudflare Pages Response 包装                                      */
/* ------------------------------------------------------------------ */

export function buildJumpPage(targetUrl, action, opts = {}) {
  return new Response(renderJumpHtml(targetUrl, action, opts), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export function buildErrorResponse(message, status = 400) {
  return new Response(renderErrorHtml(message), {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

/**
 * 跳转：根据 UA 返回不同页面
 * - QQ/微信内置浏览器：返回导航页（引导在浏览器打开）
 * - 外部浏览器：极简 JS location.replace
 */
export function buildRedirect(targetUrl, ua = '') {
  const inApp = /QQ\/|MQQBrowser|MicroMessenger/.test(ua);
  if (inApp) return buildGuidePage(targetUrl);
  return buildQuickRedirect(targetUrl);
}

function buildQuickRedirect(targetUrl) {
  let url = targetUrl;
  if (url.startsWith('mqqapi://') && !url.includes('source=')) url += '&source=qrcode';
  const json = JSON.stringify(url);
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"></head><body><script>try{location.replace(${json})}catch(e){location.href=${json}}</script></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Referrer-Policy': 'no-referrer' } });
}

function buildGuidePage(targetUrl) {
  const json = JSON.stringify(targetUrl);
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="referrer" content="no-referrer"><title>需要在浏览器中打开</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:linear-gradient(180deg,#f0f4f8,#e8eef5);min-height:100vh;color:#1f2329;-webkit-font-smoothing:antialiased}.c{max-width:420px;margin:0 auto;padding:40px 24px;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}.ic{width:88px;height:88px;border-radius:24px;background:linear-gradient(135deg,#4facfe,#00c6fb);display:flex;align-items:center;justify-content:center;margin-bottom:28px;box-shadow:0 12px 32px rgba(79,172,254,.3)}.ic svg{width:44px;height:44px}h1{font-size:22px;font-weight:700;margin-bottom:10px;text-align:center}.d{font-size:14px;color:#8a8f99;line-height:1.6;text-align:center;margin-bottom:32px}.s{width:100%;background:#fff;border-radius:16px;padding:24px 20px;margin-bottom:24px;box-shadow:0 4px 20px rgba(0,0,0,.04)}.st{display:flex;align-items:flex-start;gap:14px;margin-bottom:18px}.st:last-child{margin-bottom:0}.n{width:28px;height:28px;border-radius:50%;background:#4facfe;color:#fff;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0}.t{font-size:14px;line-height:1.6;padding-top:4px}.t b{color:#4facfe}.b{width:100%;padding:14px;background:#1f2329;color:#fff;border:none;border-radius:14px;font-size:15px;font-weight:600;cursor:pointer;transition:transform .15s}.b:active{transform:scale(.97)}.b.ok{background:#07c160}.tip{font-size:12px;color:#c0c4cc;margin-top:16px;text-align:center}</style></head><body><div class="c"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></div><h1>需要在浏览器中打开</h1><p class="d">当前应用内不支持直接跳转<br>请在系统浏览器中打开本页面</p><div class="s"><div class="st"><div class="n">1</div><div class="t">点击右上角 <b>···</b> 按钮</div></div><div class="st"><div class="n">2</div><div class="t">选择 <b>「在浏览器打开」</b></div></div><div class="st"><div class="n">3</div><div class="t">页面将自动跳转到对应功能</div></div></div><button class="b" id="cp">复制链接</button><p class="tip">或复制链接后粘贴到浏览器地址栏</p></div><script>setTimeout(function(){try{location.replace(${json})}catch(e){}},500);document.getElementById('cp').addEventListener('click',function(){navigator.clipboard.writeText(location.href).then(function(){var b=document.getElementById('cp');b.textContent='\u2713 \u5df2\u590d\u5236\uff0c\u53bb\u6d4f\u89c8\u5668\u7c98\u8d34';b.classList.add('ok')})})</script></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Referrer-Policy': 'no-referrer' } });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}
