// 路由: /api-wx.pay
// 功能: 跳转到微信个人收款（付款页）
// 协议: wxp://f2f0...
//
// 收款码链接需要从微信提取：
//   1. 微信 → 我 → 服务 → 收付款 → 二维码收款
//   2. 点击"保存收款码"得到图片
//   3. 用二维码解码工具（微信扫一扫/草料二维码/在线解码）读出 wxp:// 链接
//   4. 在 Cloudflare Pages 后台 → Settings → Environment variables
//      添加变量 WXP_PAY_URL，值为该 wxp:// 链接
//
// 特点: wxp:// 协议在微信内外浏览器中都能正常唤起付款（与 weixin:// 不同）。

import { buildJumpPage, buildErrorResponse } from './_lib.js';

export async function onRequestGet(context) {
  const { env } = context;
  const payUrl = (env && env.WXP_PAY_URL) || '';

  if (!payUrl) {
    return buildErrorResponse('收款码未配置：请在 Cloudflare Pages 后台设置环境变量 WXP_PAY_URL（值为 wxp:// 开头的收款码链接）', 500);
  }

  return buildJumpPage(payUrl, '微信收款', {
    logo: '微信',
    brandColor: '#07c160',
    brandColorDark: '#06ad56'
  });
}

export const onRequestPost = onRequestGet;
