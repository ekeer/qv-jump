// Cloudflare Workers 入口 —— 处理所有 /api-* 路由，其他请求交给静态资源
// 部署方式：Cloudflare Workers + Static Assets（wrangler deploy）
// 配置文件：wrangler.jsonc
//
// 路由逻辑与 functions/*.js (Pages Functions) 保持一致，复用 functions/_lib.js 的渲染函数。
// 这样 Pages 模式和 Workers 模式都能用，代码不重复。

import { renderJumpHtml, renderErrorHtml, isValidUin, isValidWechatId, isValidChannelsId } from '../functions/_lib.js';

const WX = { logo: '微信', brandColor: '#07c160', brandColorDark: '#06ad56' };

const JUMP_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff'
};

const ERROR_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store'
};

function jump(targetUrl, action, opts = {}) {
  return new Response(renderJumpHtml(targetUrl, action, opts), { status: 200, headers: JUMP_HEADERS });
}

function error(message, status = 400) {
  return new Response(renderErrorHtml(message), { status, headers: ERROR_HEADERS });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ---- QQ 接口 ----
    if (path === '/api-qq.qun') {
      const qun = (url.searchParams.get('qun') || '').trim();
      if (!qun) return error('缺少 qun 参数');
      if (!isValidUin(qun)) return error('qun 参数格式不正确（应为 4-14 位纯数字）');
      return jump(`mqqapi://card/show_pslcard?src_type=internal&version=1&card_type=group&uin=${qun}`, '打开群聊', { uin: `群号: ${qun}` });
    }

    if (path === '/api-qq.chat') {
      const qq = (url.searchParams.get('qq') || '').trim();
      if (!qq) return error('缺少 qq 参数');
      if (!isValidUin(qq)) return error('qq 参数格式不正确（应为 4-14 位纯数字）');
      return jump(`mqqwpa://im/chat?chat_type=wpa&uin=${qq}&version=1&src_type=web`, '发起临时会话', { uin: `QQ: ${qq}` });
    }

    if (path === '/api-qq') {
      const qq = (url.searchParams.get('qq') || '').trim();
      if (!qq) return error('缺少 qq 参数');
      if (!isValidUin(qq)) return error('qq 参数格式不正确（应为 4-14 位纯数字）');
      return jump(`mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}`, '查看名片', { uin: `QQ: ${qq}` });
    }

    // ---- 微信接口 ----
    if (path === '/api-wx') {
      const wx = (url.searchParams.get('wx') || '').trim();
      if (!wx) return error('缺少 wx 参数');
      if (!isValidWechatId(wx)) return error('微信号格式不正确（字母开头，6-20位，可含字母数字_-）');
      return jump(`weixin://addfriend/${wx}`, '添加微信好友', { uin: `微信号: ${wx}`, ...WX });
    }

    if (path === '/api-wx.pay') {
      const payUrl = (env && env.WXP_PAY_URL) || '';
      if (!payUrl) return error('收款码未配置：请在 Cloudflare 后台设置环境变量 WXP_PAY_URL（值为 wxp:// 开头的收款码链接）', 500);
      return jump(payUrl, '微信收款', WX);
    }

    if (path === '/api-wx.scan') {
      return jump('weixin://dl/scan', '微信扫一扫', WX);
    }

    if (path === '/api-wx.channels') {
      const username = (url.searchParams.get('username') || '').trim();
      if (!username) return error('缺少 username 参数');
      if (!isValidChannelsId(username)) return error('username 参数格式不正确');
      return jump(`weixin://channelsprofile?username=${encodeURIComponent(username)}`, '查看视频号', { uin: `视频号: ${username}`, ...WX });
    }

    // ---- 其他请求交给静态资源（index.html 等）----
    return env.ASSETS.fetch(request);
  }
};
