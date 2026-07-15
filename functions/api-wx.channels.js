// 路由: /api-wx.channels?username=视频号ID
// 功能: 跳转到微信视频号资料页
// 协议: weixin://channelsprofile?username=XXX
//
// 视频号 ID 获取方式：
//   在微信视频号里打开自己的主页 → 右上角"..." → 复制链接
//   链接中 username= 后面的字符串即为视频号 ID（通常以 v2_ 或 found_ 开头）
//
// 注意: weixin:// 协议在微信内置浏览器中会被拦截，仅在外部浏览器有效。

import { buildJumpPage, buildErrorResponse, isValidChannelsId } from './_lib.js';

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

  const target = `weixin://channelsprofile?username=${encodeURIComponent(username)}`;
  return buildJumpPage(target, '查看视频号', {
    uin: `视频号: ${username}`,
    logo: '微信',
    brandColor: '#07c160',
    brandColorDark: '#06ad56'
  });
}

export const onRequestPost = onRequestGet;
