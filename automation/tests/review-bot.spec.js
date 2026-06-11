const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

function generateRecommedReview(itemName, rating) {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const feelings = [`Pretty happy with this ${itemName}`, `${itemName} was better than I expected`, `Not bad at all, actually quite decent`, `Honestly surprised by how good this ${itemName} is`, `First time trying this ${itemName} and it’s solid`];
    const details = ["texture feels fresh", "taste is clean and not weird", "doesn’t feel like frozen stuff", "smells natural when cooking", "not too dry, just right"];
    const usage = ["used it for a quick dinner", "threw it into a simple stir fry", "worked well in my salad", "cooked it with some garlic, turned out nice", "just pan-fried it, super easy"];
    const cons = ["price is a bit high tho", "wish the portion was bigger", "had to use it quickly", "packaging could be better", "not always available"];
    const recommends = ["would buy again", "definitely recommend trying", "might get this again next time", "worth a try imo", "good option if you’re into clean food"];

    const structures = [
        () => `${pick(feelings)}. ${pick(details)}. ${pick(recommends)}.`,
        () => `${pick(usage)} and yeah, ${pick(details)}. ${pick(recommends)}.`,
        () => `${pick(feelings)} — ${pick(usage)}. ${pick(details)}.`,
        () => `${pick(details)}. ${pick(usage)}. ${pick(recommends)}.`,
        () => `${pick(feelings)}. ${pick(cons)}. ${pick(recommends)}.`,
    ];

    let review = pick(structures)();
    if (rating === 5) review += ` really impressed.`;
    else if (rating === 4) review += ` pretty good overall.`;
    else review += ` it's okay, nothing special.`;

    if (Math.random() < 0.2) review = review.toLowerCase();
    if (Math.random() < 0.15) review = review.replace("really", "realy").replace("pretty", "prety");
    if (Math.random() < 0.2) review += pick([" 👍", " !", " .", " 🔥"]);

    return review;
}

test("Veggies Mart: Full Automation Campaign", async ({ browser }) => {
    test.setTimeout(0); 
    const dataDir = path.join(__dirname, "../data");
    const accountsFile = path.join(dataDir, "accounts2.json");
    const allAccounts = JSON.parse(fs.readFileSync(accountsFile, "utf-8"));
    const testAccounts = allAccounts.slice(50, 300);

    for (const acc of testAccounts) {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 } 
        });
        const page = await context.newPage();
        
        try {
            console.log(`\n👤 User: ${acc.email}`);
            
            await page.goto("http://localhost:5173/orders");
            await page.waitForLoadState("domcontentloaded");

            // --- BƯỚC 1: ĐĂNG NHẬP ---
            const userIcon = page.locator("nav .lucide-user").first();
            await userIcon.waitFor({ state: "visible" });
            await userIcon.click();
            
            await page.fill('input[name="email"]', acc.email);
            await page.fill('input[name="password"]', acc.password);
            await page.click('button:has-text("SIGN IN")');
            
            await page.waitForURL("**/orders", { timeout: 10000 });
            await page.waitForTimeout(1000); // Chờ React sync state đăng nhập

            // --- BƯỚC 2: FILTER STATUS: DELIVERED ĐỂ ĐẾM ĐƠN ---
            const deliveredBtn = page.locator('button:has-text("DELIVERED"), button:has-text("Delivered")').first();
            await deliveredBtn.waitFor({ state: "visible" });
            await deliveredBtn.click();
            
            // Chờ tải danh sách đơn hàng lần đầu ổn định trên DOM
            const detailsLinks = page.locator('a[href^="/order/"]');
            await detailsLinks.first().waitFor({ state: "attached", timeout: 5000 }).catch(() => {});
            await page.waitForTimeout(1000); 

            let orderCount = await detailsLinks.count();
            console.log(`📦 Tìm thấy ${orderCount} đơn hàng "DELIVERED".`);

            // --- BƯỚC 3: DUYỆT TỪNG ĐƠN HÀNG (OUTER LOOP) ---
            for (let i = 0; i < orderCount; i++) {
                try {
                    // Nếu từ đơn thứ 2 trở đi, chủ động ép bot reload lại trang gốc để làm sạch DOM
                    if (i > 0) {
                        await page.goto("http://localhost:5173/orders");
                        await page.locator('button:has-text("DELIVERED"), button:has-text("Delivered")').first().click();
                        await page.waitForTimeout(1000);
                    }
                    
                    // Lấy locator tươi mới theo index đơn hàng
                    const currentOrderBtn = page.locator('a[href^="/order/"]').nth(i);
                    await currentOrderBtn.scrollIntoViewIfNeeded();
                    await currentOrderBtn.click({ force: true });
                    
                    await page.waitForURL("**/order/*");
                    await page.waitForTimeout(1200); // Chờ API trả thông tin chi tiết đơn hàng

                    // Cuộn xuống đáy để ép React render bung hết danh sách món ăn
                    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                    await page.waitForTimeout(800); 

                    // Gom mảng URL review độc nhất của toàn bộ sản phẩm trong đơn này
                    const reviewLinksLocator = page.locator('a[href*="#reviews"], a:has-text("Review Item")');
                    const totalLinks = await reviewLinksLocator.count();
                    const targetHrefs = [];

                    for (let k = 0; k < totalLinks; k++) {
                        const href = await reviewLinksLocator.nth(k).getAttribute("href");
                        if (href && !targetHrefs.includes(href)) {
                            targetHrefs.push(href);
                        }
                    }

                    console.log(`  🛒 Đơn hàng [${i + 1}/${orderCount}] có ${targetHrefs.length} mặt hàng.`);

                    // --- BƯỚC 4: SEEDING BẰNG URL ĐƯỜNG THẲNG (INNER LOOP) ---
                    for (const reviewHref of targetHrefs) {
                        try {
                            const randomRating = Math.floor(Math.random() * 3) + 3; 
                            
                            // 🚀 ĐI THẲNG URL: Khỏi click nút Back làm loạn vị trí DOM, triệt tiêu hẳn bệnh đơ món cuối
                            const targetProductUrl = reviewHref.startsWith("http") ? reviewHref : `http://localhost:5173${reviewHref}`;
                            await page.goto(targetProductUrl);
                            
                            await page.waitForURL("**/product/*", { timeout: 10000 });
                            await page.waitForTimeout(1000); // Đợi form review hiển thị hoàn chỉnh

                            // Trích xuất tên sản phẩm trực tiếp tại trang chi tiết cho chuẩn
                            let itemName = "Product";
                            try {
                                itemName = (await page.locator("h1, h2, .product-title").first().innerText()).trim();
                            } catch (_) {}

                            console.log(`     Đang mở màn hình Review: ${itemName} | Chọn: ${randomRating}⭐`);

                            const textarea = page.locator('form textarea');
                            await textarea.scrollIntoViewIfNeeded();
                            await textarea.waitFor({ state: "visible", timeout: 5000 });

                            // Chọn số sao
                            const targetStar = page.locator(`.review-stars-group button[data-star-index="${randomRating}"]`);
                            if (await targetStar.count() > 0) {
                                await targetStar.click();
                            }

                            // Tạo nội dung text ngẫu nhiên và fill
                            const reviewText = generateRecommedReview(itemName, randomRating);
                            await textarea.fill(reviewText);

                            // Submit review
                            const submitBtn = page.locator('form button[type="submit"], button:has-text("Post Review"), button:has-text("Update")').first();
                            await submitBtn.click();
                            
                            // Chờ API xử lý ghi nhận vào DB xong, dùng timeout tĩnh thay vì networkidle để tránh treo ngầm
                            await page.waitForTimeout(1500); 
                            
                            console.log(`        ✅ Đã seeding xong món: ${itemName}`);

                        } catch (itemErr) {
                            console.error(`    ⚠️ Thất bại khi xử lý sản phẩm (${reviewHref}): ${itemErr.message}`);
                        }
                    }
                } catch (orderErr) {
                    console.error(`  ⚠️ Lỗi phát sinh tại đơn hàng thứ ${i + 1}: ${orderErr.message}`);
                }
            }
        } catch (err) {
            console.error(`❌ Lỗi hệ thống cấp Account ${acc.email}: ${err.message}`);
        } finally {
            await page.close();
            await context.close();
        }
    }
    console.log("\n✨ CHIẾN DỊCH VÉT SẠCH REVIEW TỪNG ĐƠN ĐÃ HOÀN TẤT MỸ MÃN!");
});