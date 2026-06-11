const { test } = require('@playwright/test');
const { fakerEN: faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

test('Đăng ký 500 user với định dạng email .ic', async ({ page }) => {
    test.setTimeout(0); 

    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir); 
    const accountsFile = path.join(dataDir, 'accounts2.json');

    let accountsList = [];
    const interests = ['HEALTHY', 'SEAFOOD', 'FRUIT'];

    for (let i = 501; i <= 899; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;
        
        // Tạo email kiểu: john.doe.ic@gmail.com
        const email = `${firstName}.${lastName}.${i}.ic@gmail.com`.toLowerCase();
        const password = "Singalong1201";
        
        let userInterest = interests[i % 3];

        try {
            await page.goto('http://localhost:5173');

            // 1. Click Icon User (Cần check chính xác selector này trên web của bạn)
            await page.locator('nav, header').locator('.rounded-full.border, .user-icon, svg.lucide-user').last().click();

            // 2. Chuyển sang mode Register
            await page.getByText(/Join Now|Sign Up/i).click();

            // 3. Điền Form
            await page.waitForSelector('input[name="name"]');
            await page.fill('input[name="name"]', fullName);
            await page.fill('input[name="email"]', email);
            await page.fill('input[name="password"]', password);

            // 4. Submit
            await page.click('button:has-text("GET STARTED")');

            // 5. Đợi xác nhận thành công
            await page.waitForSelector('text=Account created!', { timeout: 8000 });
            
            accountsList.push({ fullName, email, password, interest: userInterest });
            fs.writeFileSync(accountsFile, JSON.stringify(accountsList, null, 2));
            
            console.log(` [${i}/500] [${userInterest}] Created: ${email}`);

        } catch (e) {
            console.log(` [${i}/500] Lỗi tại: ${email}. Có thể do UI lag hoặc trùng data.`);
        }

        // Cleanup cho vòng lặp sau
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.context().clearCookies();
    }
});