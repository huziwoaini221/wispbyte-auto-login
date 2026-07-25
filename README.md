# Wispbyte Auto Login

Wispbyte Free Plan 自动续期工具。

## 功能

- 每 12 天自动登录 Wispbyte，保持账户活跃
- 使用 Puppeteer 模拟浏览器登录
- 通过 GitHub Actions 免费运行

## 设置步骤

### 1. 创建 GitHub 仓库

1. 登录 GitHub
2. 点击右上角 `+` → `New repository`
3. 仓库名：`wispbyte-auto-login`
4. 选择 `Public`（免费账户只能用 public 仓库运行 Actions）
5. 点击 `Create repository`

### 2. 上传代码

```bash
cd wispbyte-auto-login
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/wispbyte-auto-login.git
git push -u origin main
```

### 3. 添加 Secrets

1. 进入仓库 → `Settings` → `Secrets and variables` → `Actions`
2. 点击 `New repository secret`
3. 添加：
   - Name: `WISPBYTE_EMAIL`
   - Secret: 你的 Wispbyte 登录邮箱
4. 再添加：
   - Name: `WISPBYTE_PASSWORD`
   - Secret: 你的 Wispbyte 密码

### 4. 启用 Actions

1. 进入仓库 → `Actions` 标签
2. 点击 `I understand my workflows, go ahead and enable them`
3. 完成！

## 工作原理

- GitHub Actions 每 12 天自动运行一次
- Puppeteer 打开 Wispbyte 登录页面
- 自动输入账号密码并登录
- 访问服务器列表页面，完成续期

## 手动触发

1. 进入仓库 → `Actions`
2. 选择 `Wispbyte Auto Login`
3. 点击 `Run workflow`

## 注意事项

- 仓库必须是 **Public**，免费账户才能使用 Actions
- 确保 Secrets 中的账号密码正确
- 如果登录失败，会发送通知邮件
