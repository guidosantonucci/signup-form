import { test, expect } from '@playwright/test';
import { SignupPage } from './signup.page';

const strengthCases = [
  { password: 'abc', label: 'Weak' },
  { password: 'abcdefgh', label: 'Weak' },
  { password: 'Abcdefgh', label: 'Weak' },
  { password: 'Abcdefg1', label: 'Fair' },
  { password: 'Abcdef1!', label: 'Good' },
  { password: 'Abcdefgh123!', label: 'Strong' },
];

test.describe('password strength meter', () => {
  for (const { password, label } of strengthCases) {
    test(`"${password}" is rated ${label}`, async ({ page }) => {
      const signup = new SignupPage(page);
      await signup.goto();
      await signup.password.fill(password);
      await expect(signup.strength).toHaveText(label);
    });
  }

  test('clearing the password resets the meter', async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.password.fill('Abcdefgh123!');
    await signup.password.clear();
    await expect(signup.strength).toHaveText('—');
  });
});
