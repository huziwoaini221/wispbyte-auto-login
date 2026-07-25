const puppeteer = require('puppeteer-core');

const EMAIL = process.env.WISPBYTE_EMAIL;
const PASSWORD = process.env.WISPBYTE_PASSWORD;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login() {
  console.log('开始自动登录 Wispbyte...');
  console.log('时间:', new Date().toISOString());
  
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log('正在访问登录页面...');
    await page.goto('https://wispbyte.com/client/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    // 等待 Cloudflare 挑战完成
    console.log('等待页面加载 (Cloudflare)...');
    await sleep(5000);
    
    // 刷新页面，可能 Cloudflare 已通过
    console.log('刷新页面...');
    await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);
    
    // 检查当前页面
    console.log('当前 URL:', page.url());
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 如果还在 Cloudflare 页面，继续等待
    if (title.includes('challenge') || title.includes('Just a moment') || title.includes('blocked')) {
      console.log('Cloudflare 挑战中，等待...');
      await sleep(10000);
      await page.reload({ waitUntil: 'networkidle2', timeout: 30000 });
      await sleep(5000);
    }
    
    // 尝试等待输入框出现
    console.log('等待登录表单...');
    try {
      await page.waitForSelector('input[type="email"], input[name="email"], input[placeholder*="email"], input[placeholder*="Email"]', { 
        timeout: 30000 
      });
    } catch (e) {
      // 输出页面内容帮助调试
      const html = await page.content();
      console.log('页面内容前500字符:', html.substring(0, 500));
      throw new Error('找不到登录输入框');
    }
    
    console.log('正在输入登录信息...');
    
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email"], input[placeholder*="Email"]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    
    if (emailInput && passwordInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type(EMAIL, { delay: 30 });
      
      await passwordInput.click({ clickCount: 3 });
      await passwordInput.type(PASSWORD, { delay: 30 });
      
      console.log('正在点击登录按钮...');
      
      const loginButton = await page.$('button[type="submit"], input[type="submit"]');
      if (loginButton) {
        await loginButton.click();
      } else {
        await page.keyboard.press('Enter');
      }
      
      await page.waitForNavigation({ 
        waitUntil: 'networkidle2',
        timeout: 30000 
      }).catch(() => {
        console.log('导航超时，继续检查...');
      });
      
      const currentUrl = page.url();
      console.log('当前页面:', currentUrl);
      
      if (!currentUrl.includes('login')) {
        console.log('登录成功！');
        
        console.log('正在访问服务器列表...');
        await page.goto('https://wispbyte.com/client/servers', { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });
        
        console.log('服务器列表页面已访问');
        console.log('续期操作完成！');
        
        return true;
      } else {
        console.log('登录失败，请检查账号密码');
        return false;
      }
    } else {
      console.log('找不到输入框');
      return false;
    }
    
  } catch (error) {
    console.error('发生错误:', error.message);
    return false;
  } finally {
    await browser.close();
    console.log('浏览器已关闭');
  }
}

login().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('脚本执行失败:', err);
  process.exit(1);
});
