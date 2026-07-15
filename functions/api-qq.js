// 路由: /api-qq?qq=QQ号
// 功能: 跳转到 QQ 个人名片
// 协议: mqqapi://card/show_pslcard
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

  return Response.redirect(`mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}`, 302);
}

export const onRequestPost = onRequestGet;
