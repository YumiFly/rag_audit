import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
from PIL import Image
from reportlab.pdfgen import canvas

async def html_to_pdf(html_path, output_pdf_path, viewport_width=1280):
    # 启动 Playwright 浏览器
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(
            viewport={"width": viewport_width, "height": 1000},
            device_scale_factor=2  # 提高分辨率
        )
        page = await context.new_page()
        
        # 打开本地 HTML 文件
        file_url = Path(html_path).resolve().as_uri()
        await page.goto(file_url)
        
        # 获取整个页面高度
        height = await page.evaluate("() => document.body.scrollHeight")
        await page.set_viewport_size({"width": viewport_width, "height": height})

        # 截图为高质量 JPEG
        screenshot_path = "output_fullpage.jpg"
        await page.screenshot(path=screenshot_path, type='jpeg', quality=100, full_page=True)
        print(f"✅ HTML 页面已截图为：{screenshot_path}")

        await browser.close()

        # 将图片转为高清 PDF
        img = Image.open(screenshot_path)
        width, height = img.size
        c = canvas.Canvas(output_pdf_path, pagesize=(width, height))
        c.drawInlineImage(screenshot_path, 0, 0, width, height)
        c.showPage()
        c.save()
        print(f"✅ 已保存高清 PDF：{output_pdf_path}")

        # 清理截图
        Path(screenshot_path).unlink()

# 示例调用
if __name__ == "__main__":
    html_file = "tina_introduce.html"         # 你的本地 HTML 文件路径
    output_pdf = "result.pdf"          # 输出 PDF 文件名
    asyncio.run(html_to_pdf(html_file, output_pdf))