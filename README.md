# qqjump

基于 **Cloudflare Pages Functions** 的 QQ / 微信协议跳转服务。一次部署，永久免费，全球 CDN 加速。

## 接口总览

### QQ 接口

| 路径 | 参数 | 功能 | 协议 |
| --- | --- | --- | --- |
| `/api-qq.qun` | `qun=群号` | 跳转到 QQ 群名片（可加群） | `mqqapi://card/show_pslcard?card_type=group` |
| `/api-qq.chat` | `qq=QQ号` | 发起临时会话 | `mqqwpa://im/chat?chat_type=wpa` |
| `/api-qq` | `qq=QQ号` | 跳转到 QQ 个人名片 | `mqqapi://card/show_pslcard` |

### 微信接口

| 路径 | 参数 | 功能 | 协议 |
| --- | --- | --- | --- |
| `/api-wx` | `wx=微信号` | 添加微信好友（预填号） | `weixin://addfriend/<微信号>` |
| `/api-wx.pay` | 无 | 微信个人收款码 | `wxp://f2f0...`（需配置环境变量） |
| `/api-wx.scan` | 无 | 唤起微信扫一扫 | `weixin://dl/scan` |
| `/api-wx.channels` | `username=视频号ID` | 跳转视频号资料页 | `weixin://channelsprofile?username=XXX` |

## 用法示例

假设部署后的域名为 `https://qqjump.example.dev`：

```bash
# QQ 跳群
https://qqjump.example.dev/api-qq.qun?qun=123456789

# QQ 临时会话
https://qqjump.example.dev/api-qq.chat?qq=10001

# QQ 个人名片
https://qqjump.example.dev/api-qq?qq=10001

# 微信加好友
https://qqjump.example.dev/api-wx?wx=abc123

# 微信收款码
https://qqjump.example.dev/api-wx.pay

# 微信扫一扫
https://qqjump.example.dev/api-wx.scan

# 视频号资料页
https://qqjump.example.dev/api-wx.channels?username=v2_xxx
```

直接把链接放到 HTML、Markdown、小红书主页、公众号菜单里，点击即可唤起对应客户端。

## 微信收款码配置

微信个人收款码是固定的 `wxp://` 加密链接，不能通过微信号动态生成，需要你自己提取：

1. 微信 → 我 → 服务 → 收付款 → 二维码收款
2. 点击"保存收款码"得到图片
3. 用二维码解码工具（微信扫一扫 / 草料二维码 / 在线解码网站）读出 `wxp://` 链接
4. 在 Cloudflare Pages 项目 Settings → Environment variables 添加变量 `WXP_PAY_URL`，值为该链接

配置后 `/api-wx.pay` 即可一键弹付款。**wxp:// 协议在微信内外浏览器中都能正常唤起**。

## ⚠️ 微信限制（重要）

| 协议 | 微信内置浏览器 | 外部浏览器 |
| --- | --- | --- |
| `weixin://`（加好友/扫一扫/视频号） | ❌ 被拦截 | ✅ 可唤起 |
| `wxp://`（收款码） | ✅ 可唤起 | ✅ 可唤起 |

- 微信不允许外部网页唤起自己的功能页，所以 `weixin://` 协议**仅在 Safari/Chrome/系统浏览器等外部浏览器中点击有效**
- 如果链接会被放在微信里打开（如公众号文章），加好友/扫一扫/视频号接口无效，需引导用户"在浏览器中打开"
- 收款码 `wxp://` 不受此限制，微信内外都能弹付款
- `weixin://addfriend/` 属非公开协议，不同微信版本表现可能不同，建议部署后实测

## 工作原理

1. 用户访问 `/api-xx?xxx=123`
2. Cloudflare Pages Function 校验参数
3. 返回极简 HTML，立即执行 `window.location.replace('协议://...')` 唤起客户端
4. 800ms 后尝试 `window.close()` 关闭残留窗口
5. 若浏览器拦截自动跳转，兜底显示"手动跳转"按钮

## "无残留"实现

- `window.location.replace` 替换历史记录，不留中间页
- `window.close()` 尝试关闭残留窗口
- `Referrer-Policy: no-referrer` 不泄露来源

## 部署

### 方式一：Git 连接（推荐）

1. 推送到 GitHub / GitLab
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
3. 构建配置：Framework preset 选 `None`，Build command 留空，Build output directory 填 `.`
4. Save and Deploy，几秒后访问 `https://<project>.pages.dev`
5. （可选）绑定自定义域名
6. （微信收款码）Settings → Environment variables 添加 `WXP_PAY_URL`

### 方式二：Wrangler CLI

```bash
npm install -g wrangler
wrangler login
cd qqjump
wrangler pages deploy .
```

### 本地预览

```bash
# 简易预览（无需 wrangler）
cd qqjump
node dev-preview.mjs

# 带微信收款码预览
WXP_PAY_URL="wxp://f2f0你的收款码" node dev-preview.mjs

# 或用 wrangler 完整预览
npx wrangler pages dev .
```

## 协议说明

| 协议 | 用途 | 备注 |
| --- | --- | --- |
| `mqqapi://card/show_pslcard?uin=QQ号` | QQ 个人名片 | 腾讯官方标准 |
| `mqqapi://card/show_pslcard?card_type=group&uin=群号` | QQ 群名片 | 加群入口 |
| `mqqwpa://im/chat?chat_type=wpa&uin=QQ号` | QQ 临时会话 | mqq 协议族 |
| `weixin://addfriend/<微信号>` | 微信加好友 | 非公开协议，需实测 |
| `weixin://dl/scan` | 微信扫一扫 | 仅外部浏览器 |
| `weixin://channelsprofile?username=XXX` | 视频号资料 | 仅外部浏览器 |
| `wxp://f2f0...` | 微信收款码 | 需提取，微信内外通用 |

> QQ 临时会话需目标 QQ 号开启了"允许陌生人临时会话"，否则跳转后无法发消息。

## 项目结构

```
qqjump/
├── functions/
│   ├── _lib.js                # 共享渲染函数 + 校验（不被路由）
│   ├── api-qq.js              # /api-qq          QQ 名片
│   ├── api-qq.qun.js          # /api-qq.qun      QQ 跳群
│   ├── api-qq.chat.js         # /api-qq.chat     QQ 临时会话
│   ├── api-wx.js              # /api-wx          微信加好友
│   ├── api-wx.pay.js          # /api-wx.pay      微信收款码
│   ├── api-wx.scan.js         # /api-wx.scan     微信扫一扫
│   └── api-wx.channels.js     # /api-wx.channels 微信视频号
├── dev-preview.mjs            # 本地预览服务器（不部署）
├── index.html                 # 主页（接口说明 + 在线测试）
├── _headers                   # Cloudflare Pages 全局响应头
├── package.json
├── .gitignore
└── README.md
```

## License

MIT
