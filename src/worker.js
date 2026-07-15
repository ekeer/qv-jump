// Cloudflare Workers 入口 —— 处理所有 /api-* 路由，其他请求交给静态资源
// 部署方式：Cloudflare Workers + Static Assets（wrangler deploy）
// 跳转方式: 302 直接重定向，零中间页、零残留

import { renderErrorHtml, isValidUin, isValidWechatId, isValidChannelsId } from '../functions/_lib.js';

const ERROR_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store'
};

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
      return Response.redirect(`mqqapi://card/show_pslcard?src_type=internal&version=1&card_type=group&uin=${qun}`, 302);
    }

    if (path === '/api-qq.chat') {
      const qq = (url.searchParams.get('qq') || '').trim();
      if (!qq) return error('缺少 qq 参数');
      if (!isValidUin(qq)) return error('qq 参数格式不正确（应为 4-14 位纯数字）');
      return Response.redirect(`mqqwpa://im/chat?chat_type=wpa&uin=${qq}&version=1&src_type=web`, 302);
    }

    if (path === '/api-qq') {
      const qq = (url.searchParams.get('qq') || '').trim();
      if (!qq) return error('缺少 qq 参数');
      if (!isValidUin(qq)) return error('qq 参数格式不正确（应为 4-14 位纯数字）');
      return Response.redirect(`mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}`, 302);
    }

    // ---- 微信接口 ----
    if (path === '/api-wx') {
      const wx = (url.searchParams.get('wx') || '').trim();
      if (!wx) return error('缺少 wx 参数');
      if (!isValidWechatId(wx)) return error('微信号格式不正确（字母开头，6-20位，可含字母数字_-）');
      return Response.redirect(`weixin://addfriend/${wx}`, 302);
    }

    if (path === '/api-wx.pay') {
      const payUrl = (env && env.WXP_PAY_URL) || '';
      if (!payUrl) return error('收款码未配置：请在 Cloudflare 后台设置环境变量 WXP_PAY_URL（值为 wxp:// 开头的收款码链接）', 500);
      return Response.redirect(payUrl, 302);
    }

    if (path === '/api-wx.scan') {
      return Response.redirect('weixin://dl/scan', 302);
    }

    if (path === '/api-wx.channels') {
      const username = (url.searchParams.get('username') || '').trim();
      if (!username) return error('缺少 username 参数');
      if (!isValidChannelsId(username)) return error('username 参数格式不正确');
      return Response.redirect(`weixin://channelsprofile?username=${encodeURIComponent(username)}`, 302);
    }

    // ---- 其他请求交给静态资源（index.html 等）----
    return env.ASSETS.fetch(request);
  }
};
