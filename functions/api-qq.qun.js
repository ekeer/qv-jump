// 路由: /api-qq.qun?qun=群号
// 功能: 跳转到 QQ 群名片（可申请加群）
// 协议: mqqapi://card/show_pslcard?card_type=group
// 跳转方式: 302 直接重定向，零中间页

import { buildErrorResponse, isValidUin } from './_lib.js';

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const qun = (url.searchParams.get('qun') || '').trim();

  if (!qun) {
    return buildErrorResponse('缺少 qun 参数');
  }
  if (!isValidUin(qun)) {
    return buildErrorResponse('qun 参数格式不正确（应为 4-14 位纯数字）');
  }

  return Response.redirect(`mqqapi://card/show_pslcard?src_type=internal&version=1&card_type=group&uin=${qun}`, 302);
}

export const onRequestPost = onRequestGet;
