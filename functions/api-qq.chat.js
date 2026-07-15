// 路由: /api-qq.chat?qq=QQ号
// 功能: 发起 QQ 临时会话（WPA）
// 协议: mqqwpa://im/chat?chat_type=wpa
// 跳转方式: 302 直接重定向，零中间页

import { buildErrorResponse, isValidUin } from './_lib.js';

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const qq = (url.searchParams.get('qq') || '').trim();

  if (!qq) {
    return buildErrorResponse('缺少 qq 参数');
  }
  if (!isValidUin(qq)) {
    return buildErrorResponse('qq 参数格式不正确（应为 4-14 位纯数字）');
  }

  return Response.redirect(`mqqwpa://im/chat?chat_type=wpa&uin=${qq}&version=1&src_type=web`, 302);
}

export const onRequestPost = onRequestGet;
