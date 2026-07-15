// 路由: /api-wx.scan → 微信扫一扫
import { buildRedirect } from './_lib.js';

export async function onRequestGet() {
  return buildRedirect('weixin://dl/scan');
}
export const onRequestPost = onRequestGet;
