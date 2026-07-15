// 路由: /api-wx.scan
// 功能: 唤起微信扫一扫
// 协议: weixin://dl/scan
//
// 注意: weixin:// 协议在微信内置浏览器中会被拦截，仅在外部浏览器有效。

import { buildJumpPage } from './_lib.js';

export async function onRequestGet(context) {
  const target = 'weixin://dl/scan';
  return buildJumpPage(target, '微信扫一扫', {
    logo: '微信',
    brandColor: '#07c160',
    brandColorDark: '#06ad56'
  });
}

export const onRequestPost = onRequestGet;
