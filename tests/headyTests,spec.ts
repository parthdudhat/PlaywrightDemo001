import { chromium } from 'playwright';

async function headyTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Configurable inputs
  const city = "Mumbai";
  const checkInDate = "2025-08-10";
  const checkOutDate = "2025-08-15";

  // Construct search URL for Booking.com
  const url = `https://www.booking.com/searchresults.html?` +
    `ss=${encodeURIComponent(city)}` +
    `&checkin_year_month_monthday=${checkInDate}` +
    `&checkout_year_month_monthday=${checkOutDate}` +
    `&group_adults=2&group_children=1&age=1&no_rooms=1` +  // Infant = age 1
    `&selected_currency=INR` +
    `&nflt=class%3D5`; // Filter 5-star hotels

  console.log(`Navigating to: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000); // Wait for all hotels to load

  // Accept cookie banner if shown
  try {
    const acceptButton = await page.$('button:has-text("Accept")');
    if (acceptButton) {
      await acceptButton.click();
    }
  } catch (error) {
    console.warn("No cookie banner found.");
  }

  // Wait for hotel cards to appear
  await page.waitForSelector('[data-testid="property-card"]');

  // Extract hotel details
  const hotels = await page.$$eval('[data-testid="property-card"]', (cards) => {
    return cards.map(card => {
      const name = card.querySelector('[data-testid="title"]')?.textContent?.trim() || "";
      const ratingText = card.querySelector('[data-testid="review-score"]')?.textContent?.trim();
      const priceText = card.querySelector('[data-testid="price-and-discounted-price"]')?.textContent?.replace(/[^0-9]/g, "");

      return {
        name,
        rating: ratingText ? parseFloat(ratingText) : 0,
        price: priceText ? parseInt(priceText, 10) : 0,
      };
    }).filter(h => h.name && h.price > 0 && h.rating > 0);
  });

  // Sort by highest rating first, then lowest price
  const sorted = hotels.sort((a, b) => b.rating - a.rating || a.price - b.price);
  const topHotel = sorted[0];

  if (topHotel) {
    console.log("\n✅ Best 5-Star Hotel Found:");
    console.log(`🏨 Hotel: ${topHotel.name}`);
    console.log(`⭐ Rating: ${topHotel.rating}`);
    console.log(`💰 Price (INR for 5 nights): ₹${topHotel.price}`);
    console.log(`🔗 Website: Booking.com`);
  } else {
    console.log("\n⚠️ No matching hotels found.");
  }

  await browser.close();
}

headyTest();
