const { test, expect, chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('Dat hang tu dong - Chon cong thuc Veggies & Thanh toan COD', async () => {
    test.setTimeout(0); // Chạy không giới hạn thời gian cho danh sách dài

    const dataDir = path.join(__dirname, '../data');
    const accountsFile = path.join(dataDir, 'accounts.json');

    if (!fs.existsSync(accountsFile)) {
        console.error('Không tìm thấy file accounts.json!');
        return;
    }

    const originalAccounts = JSON.parse(fs.readFileSync(accountsFile, 'utf8'));
    const totalOriginal = originalAccounts.length;

    // ====================================================
    // LOGIC CHUẨN: GÁN INDEX GỐC VÀ LỌC TỪ NICK 500 TRỞ XUỐNG
    // ====================================================
    const accountsWithIndex = originalAccounts.map((user, idx) => ({
        ...user,
        realIndex: idx + 1 // Nick đầu tiên là 1, nick cuối cùng là totalOriginal
    }));

    // Lọc lấy các nick có realIndex <= 500, sau đó ĐẢO NGƯỢC để chạy từ 500 về 1
    const accountsList = accountsWithIndex
        .filter(user => user.realIndex <= 399)
        .reverse();

    const streets = [
        'Tran Dai Nghia', 'Le Duan', 'Nguyen Van Linh', 'Dien Bien Phu',
        'Hai Ba Trung', 'Cach Mang Thang Tam', 'Bui Vien', 'Nguyen Hue',
        'Phan Chu Trinh', 'Lye Tu Trong', 'Hoang Dieu', 'Tran Hung Dao'
    ];

    console.log(`🚀 Bắt đầu chiến dịch COD từ nick 500 lùi về trước...`);
    console.log(`📦 Tổng số tài khoản sẽ chạy: ${accountsList.length}`);

    const BATCH_SIZE = 10; // Chạy mỗi đợt 10 browser để tránh quá tải máy
    const isHeaded = process.env.HEADED !== 'false';

    for (let b = 0; b < accountsList.length; b += BATCH_SIZE) {
        const batch = accountsList.slice(b, b + BATCH_SIZE);

        const browser = await chromium.launch({
            headless: !isHeaded,
            slowMo: isHeaded ? 200 : 100 // Thêm trễ nhỏ để React nhận kịp sự kiện click
        });

        for (let i = 0; i < batch.length; i++) {
            const user = batch[i];
            
            // Bỏ qua nick 499 (nếu bạn muốn)
            if (user.realIndex === 499) {
                console.log(`[BỎ QUA] USER [499/${totalOriginal}]: ${user.email}`);
                continue;
            }

            // Tạo một context hoàn toàn mới (Xóa sạch Session/Cookie của nick trước)
            const context = await browser.newContext({
                viewport: { width: 1280, height: 720 }
            });
            const page = await context.newPage();

            console.log(`\n👉 [Danh sách gốc: ${user.realIndex}/${totalOriginal}] Đang xử lý: ${user.email}`);

            try {
                // ====================================================
                // 1. ĐĂNG NHẬP
                // ====================================================
                await page.goto('http://localhost:5173/');
                await page.waitForLoadState('networkidle');

                const userIcon = page.locator('nav .lucide-user, header .lucide-user').first();
                await userIcon.waitFor({ state: 'visible', timeout: 5000 });
                await userIcon.click();
                await page.waitForTimeout(800); // Chờ modal/dropdown đăng nhập mở hẳn ra

                await page.fill('input[name="email"]', user.email);
                await page.fill('input[name="password"]', user.password);
                await page.click('button:has-text("SIGN IN")');
                
                // Đợi chuyển trạng thái sau đăng nhập
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1500); 

                // ====================================================
                // 2. CHỌN RECIPE VÀ THÊM VÀO GIỎ
                // ====================================================
                console.log('   ↳ Di chuyển tới trang Recipes...');
                await page.goto('http://localhost:5173/all-recipes');
                await page.waitForLoadState('networkidle');

                const firstRecipe = page.locator('.grid a, .card, [class*="RecipeCard"]').first();
                await firstRecipe.waitFor({ state: 'visible', timeout: 7000 });
                await firstRecipe.scrollIntoViewIfNeeded();
                await page.waitForTimeout(500);
                
                console.log('   ↳ Click chọn Recipe đầu tiên...');
                await firstRecipe.click();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1500); // Chờ React render xong trang chi tiết recipe

                // Tìm và click ADD ALL TO CART của Veggies
                console.log('   ↳ Thêm nguyên liệu Veggies vào giỏ...');
                const VeggiesSection = page.locator('div, section').filter({ hasText: /Available In Veggies/i }).last();
                const addAllBtn = VeggiesSection.locator('button:has-text("ADD ALL TO CART")').first();
                
                await addAllBtn.waitFor({ state: 'visible', timeout: 5000 });
                await addAllBtn.scrollIntoViewIfNeeded();
                await addAllBtn.click();
                await page.waitForTimeout(1500); // Đợi API thêm vào giỏ hàng load xong

                // ====================================================
                // 3. GIỎ HÀNG & CHECKOUT (ĐÃ ĐƯỢC SỬA LỖI TRONG SUỐT)
                // ====================================================
                console.log('   ↳ Mở giỏ hàng...');
                const cartIcon = page.locator('nav .lucide-shopping-bag, header .lucide-shopping-bag').last();
                await cartIcon.scrollIntoViewIfNeeded();
                await cartIcon.click();
                
                // QUAN TRỌNG: Đợi giỏ hàng render ổn định các item trước khi quét nút checkout
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1500); 

                console.log('   ↳ Tiến hành tìm và click Checkout...');
                // Bộ selector quét mọi trường hợp viết hoa/viết thường/thẻ a/thẻ button của nút checkout
                const checkoutBtn = page.locator('button:has-text("CONTINUE TO CHECKOUT"), a:has-text("CONTINUE TO CHECKOUT"), button:has-text("Checkout")').first();
                
                try {
                    await checkoutBtn.waitFor({ state: 'visible', timeout: 8000 });
                    await checkoutBtn.scrollIntoViewIfNeeded();
                    await page.waitForTimeout(500);
                    // Dùng force: true để ép click kể cả khi nút đang bị animation/overlay che khuất nhẹ
                    await checkoutBtn.click({ force: true });
                } catch (checkoutError) {
                    console.log('   ⚠️ Giao diện lỗi không bấm được nút Checkout, thực hiện nhảy thẳng URL...');
                    // Fallback (Phương án dự phòng): Nếu UI bị kẹt, ép browser nhảy thẳng trang điền thông tin
                    await page.goto('http://localhost:5173/checkout');
                }
                
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(1500);

                // ====================================================
                // 4. ĐIỀN THÔNG TIN VẬN CHUYỂN (SHIPPING)
                // ====================================================
                console.log('   ↳ Điền thông tin giao hàng...');
                const fullNameInput = page.locator('input[name="fullName"]');
                await fullNameInput.waitFor({ state: 'visible', timeout: 8000 });

                const randomStreet = streets[Math.floor(Math.random() * streets.length)];
                const randomAddress = `${Math.floor(Math.random() * 250) + 1}, Duong ${randomStreet}`;
                const shippingSection = page.locator('div:has-text("Shipping Information")');

                await fullNameInput.fill(user.fullName || 'Nguyen Van A');
                await shippingSection.locator('input[name="email"]').fill(user.email);
                await shippingSection.locator('input[name="phone"]').fill(user.phone || '0912345678');
                await shippingSection.locator('input[name="address"]').fill(randomAddress);

                // Chọn Tỉnh
                console.log('   ↳ Chọn Tỉnh/Thành phố...');
                const provinceSelect = shippingSection.locator('select[name="provinceId"]');
                await provinceSelect.selectOption('201');
                await page.waitForTimeout(1000); // Chờ API District load xong dữ liệu dựa trên Tỉnh

                // Chọn Huyện
                console.log('   ↳ Chọn Quận/Huyện...');
                const districtSelect = shippingSection.locator('select[name="districtId"]');
                await expect(districtSelect).toBeEnabled({ timeout: 15000 });
                await districtSelect.selectOption({ index: 1 });
                await page.waitForTimeout(1000); // Chờ API Ward load xong dữ liệu dựa trên Huyện

                // Chọn Xã/Phường
                console.log('   ↳ Chọn Phường/Xã...');
                const wardSelect = shippingSection.locator('select[name="wardCode"]');
                await expect(wardSelect).toBeEnabled({ timeout: 15000 });
                await wardSelect.selectOption({ index: 1 });
                await page.waitForTimeout(1500); 

                // Nhấn nút Tiếp tục qua phần thanh toán
                await page.getByRole('button', { name: 'Continue' }).click();
                await page.waitForTimeout(1000);

                // ====================================================
                // 5. THANH TOÁN COD & HOÀN TẤT
                // ====================================================
                console.log('   ↳ Chọn phương thức COD...');
                const codPaymentOption = page.locator('div:has-text("Cash on Delivery (COD)")').last();
                await codPaymentOption.click();
                await page.waitForTimeout(800);

                // Tiếp tục đến trang Review đơn hàng trước khi chốt
                await page.getByRole('button', { name: 'Continue' }).click();
                await page.waitForTimeout(1500);

                // Ấn Đặt hàng
                console.log('   ↳ Đang nhấn Đặt hàng (Place Order)...');
                const placeOrderBtn = page.getByRole('button', { name: 'Place Order' });
                await placeOrderBtn.scrollIntoViewIfNeeded();
                await placeOrderBtn.click();

                // Kiểm tra URL trang đặt hàng thành công
                await expect(page).toHaveURL(/success/, { timeout: 45000 });
                console.log(`🎉 ✅ ĐẶT HÀNG COD THÀNH CÔNG: ${user.email}`);

            } catch (error) {
                console.error(`❌ 🛠 LỖI TẠI USER ${user.email}:`, error.message);
                await page.screenshot({ path: `failed_user_${user.realIndex}.png`, fullPage: true });
            } finally {
                // ====================================================
                // LOGOUT & DỌN DẸP TUYỆT ĐỐI (TRÁNH LỖI PHIÊN CŨ CHO USER TIẾP THEO)
                // ====================================================
                try {
                    console.log('   ↳ Đang tiến hành dọn dẹp và đăng xuất trên giao diện...');
                    await page.goto('http://localhost:5173/');
                    await page.waitForLoadState('networkidle');

                    const logoutBtn = page.locator('text=Log Out, text=Logout, text=Đăng xuất, button:has-text("Log out")').first();
                    if (await logoutBtn.isVisible()) {
                        await logoutBtn.click();
                        await page.waitForTimeout(1000);
                    }
                } catch (logoutError) {
                    // Bỏ qua nếu giao diện không tìm thấy nút logout
                }

                // Ép xóa Cookie cứng từ lõi Playwright và đóng trang tab
                await context.clearCookies();
                await page.close();
                await context.close();
                console.log(`   🧹 Đã dọn dẹp bộ nhớ cookie. Sẵn sàng cho tài khoản tiếp theo.`);
            }
        }

        await browser.close();
        console.log('\n----------------------------------------------------');
        console.log('📦 ĐÃ HOÀN THÀNH MỘT BATCH BROWSER. TỰ ĐỘNG CHUYỂN ĐỢT TIẾP THEO...');
        console.log('----------------------------------------------------');
    }

    console.log('🏁 CHIẾN DỊCH ĐẶT HÀNG TỰ ĐỘNG HOÀN THÀNH 100%!');
});