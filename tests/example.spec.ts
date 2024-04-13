import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/v1/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("Swag Labs");
});

test('get started link', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/v1/');

  // Click the get started link.

  await page.getByPlaceholder('Username').fill("standard_user");
  await page.getByPlaceholder('Password').fill("secret_sauce");

  await page.getByRole('button', { name: 'LOGIN' }).click();

  await expect(page).toHaveURL("https://www.saucedemo.com/v1/inventory.html");

  // Expects page to have a heading with the name of Installation.
  // await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
