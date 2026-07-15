// 路由: /api-wx.scan → 微信扫一扫
import { buildRedirect } from './_lib.js';

export async function onRequestGet(context) {
  return buildRedirect('weixin://dl/scan', context.request.headers.get('user-agent') || '');
}
export const onRequestPost = onRequestGet;
