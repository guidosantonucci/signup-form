import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { SignupPage, validUser } from './signup.page';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('accessibility', () => {
  test('page has no WCAG 2.1 AA violations on load @smoke', async ({ page }) => {
    await new SignupPage(page).goto();
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('page has no violations while showing errors', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.submit.click();
    await expect(signup.errorFor('fullName')).not.toBeEmpty();

    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('error messages are linked to their inputs', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.submit.click();

    // A screen reader announces the error together with the field name.
    await expect(signup.email).toHaveAccessibleDescription(/Email is required/);
    await expect(signup.password).toHaveAccessibleDescription(/Password is required/);
  });

  test('the whole form can be completed with the keyboard only', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit skips some controls on Tab by default');
    const signup = new SignupPage(page);
    await signup.goto();

    await signup.fullName.focus();
    await page.keyboard.type(validUser.fullName);
    await page.keyboard.press('Tab');
    await expect(signup.email).toBeFocused();
    await page.keyboard.type(validUser.email);
    await page.keyboard.press('Tab');
    await expect(signup.password).toBeFocused();
    await page.keyboard.type(validUser.password);
    await page.keyboard.press('Tab');
    await expect(signup.confirmPassword).toBeFocused();
    await page.keyboard.type(validUser.confirmPassword);
    await page.keyboard.press('Tab');
    await expect(signup.birthDate).toBeFocused();
    await signup.birthDate.fill(validUser.birthDate); // native date pickers differ per browser
    await signup.country.focus();
    await signup.country.selectOption({ label: validUser.country });
    await page.keyboard.press('Tab');
    await expect(signup.terms).toBeFocused();
    await page.keyboard.press('Space');
    await page.keyboard.press('Tab');
    await expect(signup.submit).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(signup.success).toBeVisible();
  });
});
