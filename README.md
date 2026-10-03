# 认识一下 · 自我介绍转盘

一个无需安装依赖的前端互动页面，适合从 PPT 中点击链接后进行团队自我介绍或课堂破冰。

## 本地使用

直接双击 `index.html` 即可打开。为获得最稳定的浏览器体验，也可以在当前目录运行：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

## 放进 PPT

1. 将本项目部署到任意静态网站托管服务（GitHub Pages、Netlify、Vercel 等）。
2. 复制部署后的网址。
3. 在 PowerPoint 中选中文字或按钮，按 `Ctrl + K`，粘贴网址。

## 修改话题

所有 12 个话题都在 `app.js` 顶部的 `topics` 数组中，可直接修改标题、颜色、图标、介绍和引导问题。
