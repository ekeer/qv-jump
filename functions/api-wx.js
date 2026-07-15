// 路由: /api-wx?wx=微信号
// 功能: 跳转到微信"添加好友"页面（预填微信号）
// 协议: weixin://addfriend/<微信号>
// 跳转方式: 302 直接重定向，零中间页

import { buildErrorResponse, isValidWechatId } from './_lib.js';

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const wx = (url.searchParams.get('wx') || '').trim();

  if (!wx) {
    return buildErrorResponse('缺少 wx 参数');
  }
  if (!isValidWechatId(wx)) {
    return buildErrorResponse('微信号格式不正确（字母开头，6-20位，可含字母数字_-）');
  }

  return Response.redirect(`weixin://addfriend/${wx}`, 302);
}

export const onRequestPost = onRequestGet;
