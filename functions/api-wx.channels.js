// 路由: /api-wx.channels?username=视频号ID
// 功能: 跳转到微信视频号资料页
// 协议: weixin://channelsprofile?username=XXX
// 跳转方式: 302 直接重定向，零中间页

import { buildErrorResponse, isValidChannelsId } from './_lib.js';

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const username = (url.searchParams.get('username') || '').trim();

  if (!username) {
    return buildErrorResponse('缺少 username 参数');
  }
  if (!isValidChannelsId(username)) {
    return buildErrorResponse('username 参数格式不正确');
  }

  return Response.redirect(`weixin://channelsprofile?username=${encodeURIComponent(username)}`, 302);
}

export const onRequestPost = onRequestGet;
