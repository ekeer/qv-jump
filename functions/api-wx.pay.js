// 路由: /api-wx.pay → 微信收款码
import { buildRedirect, buildErrorResponse } from './_lib.js';

export async function onRequestGet(context) {
  const payUrl = (context.env && context.env.WXP_PAY_URL) || '';
  if (!payUrl) return buildErrorResponse('收款码未配置：请在 Cloudflare 后台设置环境变量 WXP_PAY_URL', 500);
  return buildRedirect(payUrl, context.request.headers.get('user-agent') || '');
}
export const onRequestPost = onRequestGet;
