// 路由: /api-qq.qun?qun=群号 → 跳转 QQ 群名片
import { buildRedirect, buildErrorResponse, isValidUin } from './_lib.js';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const qun = (url.searchParams.get('qun') || '').trim();
  if (!qun) return buildErrorResponse('缺少 qun 参数');
  if (!isValidUin(qun)) return buildErrorResponse('qun 参数格式不正确（应为 4-14 位纯数字）');
  return buildRedirect(`mqqwpa://im/chat?chat_type=group&uin=${qun}`);
}
export const onRequestPost = onRequestGet;
