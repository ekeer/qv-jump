// 路由: /api-qq?qq=QQ号 → 跳转 QQ 个人名片
import { buildRedirect, buildErrorResponse, isValidUin } from './_lib.js';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const qq = (url.searchParams.get('qq') || '').trim();
  if (!qq) return buildErrorResponse('缺少 qq 参数');
  if (!isValidUin(qq)) return buildErrorResponse('qq 参数格式不正确（应为 4-14 位纯数字）');
  return buildRedirect(`mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}`);
}
export const onRequestPost = onRequestGet;
