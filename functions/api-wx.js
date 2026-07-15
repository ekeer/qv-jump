// 路由: /api-wx?wx=微信号 → 微信加好友
import { buildRedirect, buildErrorResponse, isValidWechatId } from './_lib.js';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const wx = (url.searchParams.get('wx') || '').trim();
  if (!wx) return buildErrorResponse('缺少 wx 参数');
  if (!isValidWechatId(wx)) return buildErrorResponse('微信号格式不正确（字母开头，6-20位，可含字母数字_-）');
  return buildRedirect(`weixin://addfriend/${wx}`, context.request.headers.get('user-agent') || '');
}
export const onRequestPost = onRequestGet;
