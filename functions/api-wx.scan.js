// 路由: /api-wx.scan
// 功能: 唤起微信扫一扫
// 协议: weixin://dl/scan
// 跳转方式: 302 直接重定向，零中间页

export async function onRequestGet() {
  return Response.redirect('weixin://dl/scan', 302);
}

export const onRequestPost = onRequestGet;
