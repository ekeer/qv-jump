// 路由: /api-wx?wx=微信号
// 功能: 跳转到微信"添加好友"页面（预填微信号）
// 协议: weixin://addfriend/<微信号>
//
// 注意:
// 1. weixin:// 协议在微信内置浏览器中会被拦截，仅在外部浏览器（Safari/Chrome/系统浏览器）有效。
// 2. 此协议属非公开接口，不同微信版本表现可能不同，建议部署后实测。
// 3. 需对方微信号开启了"可通过微信号搜索"才能搜到。

import { buildJumpPage, buildErrorResponse, isValidWechatId } from './_lib.js';

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

  const target = `weixin://addfriend/${wx}`;
  return buildJumpPage(target, '添加微信好友', {
    uin: `微信号: ${wx}`,
    logo: '微信',
    brandColor: '#07c160',
    brandColorDark: '#06ad56'
  });
}

export const onRequestPost = onRequestGet;
