// 路由: /api-qq.chat?qq=QQ号 → QQ 临时会话
import { buildRedirect, buildErrorResponse, isValidUin } from './_lib.js';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const qq = (url.searchParams.get('qq') || '').trim();
  if (!qq) return buildErrorResponse('缺少 qq 参数');
  if (!isValidUin(qq)) return buildErrorResponse('qq 参数格式不正确（应为 4-14 位纯数字）');
  return buildRedirect(`mqqwpa://im/chat?chat_type=wpa&uin=${qq}&version=1&src_type=web`, context.request.headers.get('user-agent') || '');
}
export const onRequestPost = onRequestGet;
