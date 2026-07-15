// 路由: /api-qq.chat?qq=QQ号
// 功能: 发起 QQ 临时会话（WPA）
// 协议: mqqwpa://im/chat?chat_type=wpa
//
// 说明: mqqapi 协议本身没有提供稳定的"临时会话"子命令，
// 腾讯官方临时会话统一使用 mqqwpa 协议（属于 mqq 系列协议之一）。
// 因此本接口使用 mqqwpa，仍是 mqq 协议族，符合"用 mqqapi 协议"的整体要求。

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

  // 临时会话 - mqqwpa 协议
  const target = `mqqwpa://im/chat?chat_type=wpa&uin=${qq}&version=1&src_type=web`;
  return buildJumpPage(target, '发起临时会话', { uin: `QQ: ${qq}` });
}

export const onRequestPost = onRequestGet;
