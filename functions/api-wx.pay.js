// 路由: /api-wx.pay
// 功能: 跳转到微信个人收款（付款页）
// 协议: wxp://f2f0...
// 跳转方式: 302 直接重定向，零中间页

import { buildErrorResponse } from './_lib.js';

export async function onRequestGet(context) {
  const { env } = context;
  const payUrl = (env && env.WXP_PAY_URL) || '';

  if (!payUrl) {
    return buildErrorResponse('收款码未配置：请在 Cloudflare 后台设置环境变量 WXP_PAY_URL（值为 wxp:// 开头的收款码链接）', 500);
  }

  return Response.redirect(payUrl, 302);
}

export const onRequestPost = onRequestGet;
