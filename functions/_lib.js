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
 * 极简跳转：无 UI，只有一行 JS location.replace
 * 比 302 重定向在 APP 内置浏览器（QQ/微信）里兼容性更好
 * - location.replace 不留浏览器历史记录
 * - 无引导页 UI，页面瞬间跳转，用户看不到中间页
 */
export function buildRedirect(targetUrl) {
  const json = JSON.stringify(targetUrl);
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="referrer" content="no-referrer"><script>location.replace(${json})</script></head><body></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Referrer-Policy': 'no-referrer'
    }
  });
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
