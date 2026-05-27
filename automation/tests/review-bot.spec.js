const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

// --- KHO ĐẠN REVIEW SIÊU ĐA DẠNG & CHI TIẾT (3-5 SAO) ---
// function generateRecommedReview(itemName, rating) {
//   const reviews = {
//     5: [
//       `The quality of this ${itemName} is outstanding. It arrived still chilled and the flavor is incredibly vibrant. Definitely a premium selection from Veganic Mart!`,
//       `I've tried many places but this ${itemName} is on another level. So fresh, crisp, and clearly organic. My whole family loved it!`,
//       `Absolutely blown away by the freshness of the ${itemName}. It's hard to find this kind of quality online these days. 10/10 would recommend.`,
//       `Fast delivery and the ${itemName} is perfect. You can tell it was harvested recently. A staple in my weekly healthy meal prep.`,
//       `Exactly what I was looking for! High-quality ${itemName}, tastes amazing, and the eco-friendly packaging is a huge plus.`,
//       `The ${itemName} is so succulent and full of flavor. It's rare to get such high-standard organic produce delivered to your door.`,
//       `Five stars for the ${itemName}! The texture is perfect and it's noticeably fresher than what I find at the local supermarket.`
//     ],
//     4: [
//       `Really good ${itemName}. The flavor is great and it looks very healthy. It arrived a bit smaller than expected but the taste made up for it.`,
//       `Solid choice for organic ${itemName}. Everything was fresh and handled with care. Will be adding this to my regular cart.`,
//       `Tastes much better than the commercial versions. The ${itemName} is very clean, though I wish the delivery window was a bit narrower.`,
//       `Great quality ${itemName} overall. It's fresh and delicious. I'm very satisfied with the purchase and the service provided.`,
//       `The ${itemName} is quite good and fresh. It fits perfectly into my vegan diet. Good value for the money spent.`,
//       `Satisfied with the ${itemName}. It's very fresh and was packaged well to prevent any bruising during transit.`,
//       `Good stuff! This ${itemName} made my salad taste much better. Consistent quality that I've come to expect here.`
//     ],
//     3: [
//       `The ${itemName} is okay. It's fresh enough to eat but some parts were slightly bruised. Average experience for the price.`,
//       `Decent quality ${itemName}. It does the job for my daily meals, but I've had fresher ones in previous orders.`,
//       `The product is fine, but it took a while to get here. The ${itemName} is standard quality, nothing too impressive but not bad either.`,
//       `It's an average ${itemName}. It's healthy and clean, just wished it had a bit more flavor. Okay for a quick purchase.`,
//       `Acceptable ${itemName}. It arrived on time, but the size was a bit inconsistent. It's fine for basic cooking.`,
//       `Not the best ${itemName} I've had, but definitely not the worst. It's usable but I might try a different brand next time.`,
//       `The ${itemName} is fair. It's organic so I appreciate that, but the appearance wasn't as great as the photos.`
//     ]
//   };
//   const options = reviews[rating] || reviews[5];
//   return options[Math.floor(Math.random() * options.length)];
// }
// function generateRecommedReview(itemName, rating) {
//   const openers = [
//     "Honestly,",
//     "Not gonna lie,",
//     "From my experience,",
//     "After trying this,",
//     "I have to say,",
//     "Surprisingly,",
//   ];

//   const positives = [
//     `the ${itemName} is really fresh`,
//     `this ${itemName} tastes very natural and clean`,
//     `the quality of this ${itemName} is impressive`,
//     `this ${itemName} feels properly organic`,
//     `the texture of the ${itemName} is very good`,
//     `this ${itemName} is better than what I usually buy`,
//   ];

//   const useCases = [
//     "I used it for my meals and it worked great",
//     "it fits perfectly into my daily diet",
//     "I added it to my salad and it made a difference",
//     "great for meal prep",
//     "my family actually enjoyed it",
//     "works well for quick cooking",
//   ];

//   const packaging = [
//     "packaging was neat and secure",
//     "it arrived in good condition",
//     "delivery was smooth and everything stayed fresh",
//     "well packed, no damage",
//     "looked fresh right out of the box",
//   ];

//   const recommendations = [
//     "would definitely buy again",
//     "highly recommend this",
//     "worth trying",
//     "I’ll order this again",
//     "solid choice overall",
//     "good option for healthy eating",
//   ];

//   const negatives = [
//     "but the size was a bit smaller than expected",
//     "though delivery was slightly slow",
//     "but a few pieces weren’t perfect",
//     "just wish it had a bit more flavor",
//     "not as impressive as I expected",
//     "quality could be more consistent",
//   ];

//   const closers = [
//     "",
//     "overall happy with it",
//     "still a decent purchase",
//     "not bad at all",
//     "acceptable for the price",
//   ];

//   function pick(arr) {
//     return arr[Math.floor(Math.random() * arr.length)];
//   }

//   // ===== BUILD SENTENCE =====
//   let review = `${pick(openers)} ${pick(positives)}. ${pick(useCases)}. ${pick(packaging)}.`;

//   if (rating === 5) {
//     review += ` ${pick(recommendations)}!`;
//   } else if (rating === 4) {
//     review += ` ${pick(recommendations)}, ${pick(negatives)}.`;
//   } else {
//     review += ` ${pick(negatives)}. ${pick(closers)}.`;
//   }

//   // ===== RANDOM BIẾN THỂ NHẸ =====
//   if (Math.random() < 0.2) {
//     review += " 👍";
//   }

//   if (Math.random() < 0.1) {
//     review = review.replace("the", "teh"); // fake typo nhẹ
//   }

//   if (Math.random() < 0.1) {
//     review = review.charAt(0).toLowerCase() + review.slice(1); // viết thường đầu câu
//   }

//   return review;
// }
function generateRecommedReview(itemName, rating) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // 1. Cảm nhận thực tế (giống người dùng thật)
  const feelings = [
    `Pretty happy with this ${itemName}`,
    `${itemName} was better than I expected`,
    `Not bad at all, actually quite decent`,
    `Honestly surprised by how good this ${itemName} is`,
    `First time trying this ${itemName} and it’s solid`,
  ];

  // 2. Chi tiết nhỏ (tạo cảm giác real)
  const details = [
    "texture feels fresh",
    "taste is clean and not weird",
    "doesn’t feel like frozen stuff",
    "smells natural when cooking",
    "not too dry, just right",
  ];

  // 3. Cách dùng (natural hơn, ít “AI wording”)
  const usage = [
    "used it for a quick dinner",
    "threw it into a simple stir fry",
    "worked well in my salad",
    "cooked it with some garlic, turned out nice",
    "just pan-fried it, super easy",
  ];

  // 4. Nhược điểm nhẹ (quan trọng để giống người thật)
  const cons = [
    "price is a bit high tho",
    "wish the portion was bigger",
    "had to use it quickly",
    "packaging could be better",
    "not always available",
  ];

  // 5. Recommend kiểu casual
  const recommends = [
    "would buy again",
    "definitely recommend trying",
    "might get this again next time",
    "worth a try imo",
    "good option if you’re into clean food",
  ];

  // ===== STRUCTURES (đa dạng hơn, ngắn hơn) =====
  const structures = [
    () => `${pick(feelings)}. ${pick(details)}. ${pick(recommends)}.`,
    () => `${pick(usage)} and yeah, ${pick(details)}. ${pick(recommends)}.`,
    () => `${pick(feelings)} — ${pick(usage)}. ${pick(details)}.`,
    () => `${pick(details)}. ${pick(usage)}. ${pick(recommends)}.`,
    () => `${pick(feelings)}. ${pick(cons)}. ${pick(recommends)}.`,
  ];

  let review = pick(structures)();

  // ===== rating logic =====
  if (rating === 5) {
    review += ` really impressed.`;
  } else if (rating === 4) {
    review += ` pretty good overall.`;
  } else {
    review += ` it's okay, nothing special.`;
  }

  // ===== HUMANIZATION =====

  // viết thường random
  if (Math.random() < 0.2) review = review.toLowerCase();

  // thêm typo nhẹ
  if (Math.random() < 0.15) {
    review = review.replace("really", "realy").replace("pretty", "prety");
  }

  // thêm emoji nhẹ (giống mobile user)
  if (Math.random() < 0.2) {
    review += pick([" 👍", " !", " .", " 🔥"]);
  }

  return review;
}

test("Veganic Mart: Deep Review Campaign", async ({ browser }) => {
  test.setTimeout(0);
  const dataDir = path.join(__dirname, "../data");
  const accountsFile = path.join(dataDir, "accounts.json");

  if (!fs.existsSync(accountsFile)) {
    return console.error("❌ Thiếu file accounts.json");
  }

  const allAccounts = JSON.parse(fs.readFileSync(accountsFile, "utf-8"));
  // Chỉnh sửa đoạn slice tùy theo nhu cầu test
  const testAccounts = allAccounts.slice(240, 500);

  console.log(`🚀 Bắt đầu chạy tool cho ${testAccounts.length} tài khoản...`);

  for (const acc of testAccounts) {
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      console.log(`\n👤 USER: ${acc.email}`);
      await page.goto("http://localhost:5173/");

      // --- BƯỚC 1: LOGIN ---
      await page
        .locator("nav .lucide-user, header .lucide-user")
        .first()
        .click();
      await page.fill('input[name="email"]', acc.email);
      await page.fill('input[name="password"]', acc.password);
      await page.click('button:has-text("SIGN IN")');
      await page.waitForTimeout(2000);

      // --- BƯỚC 2: VÀO TRANG ORDER & LỌC DELIVERED ---
      await page.goto("http://localhost:5173/orders");
      await page.waitForLoadState("networkidle");

      const deliveredFilterBtn = page
        .locator('button:has-text("Delivered")')
        .first();
      if (await deliveredFilterBtn.isVisible()) {
        await deliveredFilterBtn.click();
        await page.waitForTimeout(1000);
      }

      // --- BƯỚC 3: ĐẾM SỐ LƯỢNG SẢN PHẨM ---
      let productCount = await page
        .locator('.group\\/item:has(button:has-text("Review"))')
        .count();
      console.log(`📦 Tìm thấy ${productCount} món có thể review.`);

      // --- BƯỚC 4: LẶP ĐỂ REVIEW ---
      for (let i = 0; i < productCount; i++) {
        // Reset state để tránh lỗi DOM Stale
        await page.goto("http://localhost:5173/orders");
        await page.waitForLoadState("networkidle");
        await page.locator('button:has-text("Delivered")').first().click();
        await page.waitForTimeout(1000);

        const currentItem = page
          .locator('.group\\/item:has(button:has-text("Review"))')
          .nth(i);

        // --- [FIX] LẤY TÊN PRODUCT CHUẨN ---
        // Nhắm vào thẻ p có class font-bold bên trong group/item
        const rawName = await currentItem
          .locator("p.font-bold")
          .first()
          .innerText();
        const itemName = rawName.trim();

        const randomRating = Math.floor(Math.random() * 3) + 3;

        console.log(`  📝 Reviewing: ${itemName} | Rating: ${randomRating}⭐`);

        const reviewBtn = currentItem.locator('button:has-text("Review")');
        await reviewBtn.scrollIntoViewIfNeeded();
        await reviewBtn.click();

        // --- BƯỚC 5: FORM REVIEW ---
        await page.waitForURL("**/product/*");
        await page.waitForLoadState("networkidle");

        const textarea = page.locator(
          'textarea[placeholder*="How do you feel"]',
        );
        await textarea.waitFor({ state: "attached" });

        // Click chọn sao
        const stars = page.locator("button:has(.lucide-star)");
        if ((await stars.count()) >= 5) {
          await stars.nth(randomRating - 1).click();
          await page.waitForTimeout(500);
        }

        // Điền comment
        const reviewText = generateRecommedReview(itemName, randomRating);
        await textarea.fill(reviewText);

        // Submit (Tìm button submit trong form)
        await page.locator('form button[type="submit"]').click();
        console.log(`      ✅ Đã post review!`);

        await page.waitForTimeout(2000);
      }
    } catch (err) {
      console.error(`❌ Lỗi ở User ${acc.email}: ${err.message}`);
    } finally {
      await context.close();
    }
  }
  console.log("\n✨ CHIẾN DỊCH HOÀN TẤT!");
});
