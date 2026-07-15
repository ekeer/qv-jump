// 路由: /api-qq?qq=QQ号
// 功能: 跳转到 QQ 个人名片
// 协议: mqqapi://card/show_pslcard

import { buildJumpPage, buildErrorResponse, isValidUin } from './_lib.js';

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

  // QQ 个人名片
  const target = `mqqapi://card/show_pslcard?src_type=internal&version=1&uin=${qq}`;
  return buildJumpPage(target, '查看名片', { uin: `QQ: ${qq}` });
}

// 同时支持 POST（方便表单提交场景）
export const onRequestPost = onRequestGet;
