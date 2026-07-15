// 路由: /api-wx.channels?username=视频号ID → 视频号资料页
import { buildRedirect, buildErrorResponse, isValidChannelsId } from './_lib.js';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const username = (url.searchParams.get('username') || '').trim();
  if (!username) return buildErrorResponse('缺少 username 参数');
  if (!isValidChannelsId(username)) return buildErrorResponse('username 参数格式不正确');
  return buildRedirect(`weixin://channelsprofile?username=${encodeURIComponent(username)}`, context.request.headers.get('user-agent') || '');
}
export const onRequestPost = onRequestGet;
