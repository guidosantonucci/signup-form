import { test, expect } from '@playwright/test';
import { SignupPage, validUser, type SignupData } from './signup.page';
import invalidInputs from './data/invalid-inputs.json';

let signup: SignupPage;

test.beforeEach(async ({ page }) => {
  // Freeze "today" so age checks never become flaky as real time passes.
  await page.clock.setFixedTime(new Date('2026-06-15T12:00:00'));
  signup = new SignupPage(page);
  await signup.goto();
});

test('valid data creates the account @smoke', async () => {
  await signup.fill(validUser);
  await signup.submit.click();

  await expect(signup.success).toBeVisible();
  await expect(signup.success).toContainText('ada@example.com');
  await expect(signup.success).toBeFocused();
});

test('submitting an empty form flags every field and focuses the first one @smoke', async () => {
  await signup.submit.click();

  for (const field of Object.keys(validUser) as (keyof SignupData)[]) {
    await expect(signup.errorFor(field)).not.toBeEmpty();
  }
  await expect(signup.fullName).toBeFocused();
  await expect(signup.success).toBeHidden();
});

// Data-driven: every row in tests/data/invalid-inputs.json becomes its own test.
test.describe('field rules', () => {
  for (const { field, value, error } of invalidInputs) {
    test(`${field} = "${value}" → "${error}"`, async () => {
      const data = { ...validUser, [field]: value } as SignupData;
      if (field === 'password') data.confirmPassword = value;
      await signup.fill(data);
      await signup.submit.click();

      await expect(signup.errorFor(field as keyof SignupData)).toHaveText(error);
      await expect(signup.page.locator(`#${field}`)).toHaveAttribute('aria-invalid', 'true');
      await expect(signup.success).toBeHidden();
    });
  }
});

test.describe('confirm password', () => {
  test('must match the password', async () => {
    await signup.fill({ ...validUser, confirmPassword: 'Different1!' });
    await signup.submit.click();
    await expect(signup.errorFor('confirmPassword')).toHaveText('Passwords do not match');
  });

  test('error clears as soon as the passwords match', async () => {
    await signup.fill({ ...validUser, confirmPassword: 'Str0ng!Pas' });
    await signup.submit.click();
    await expect(signup.errorFor('confirmPassword')).toHaveText('Passwords do not match');

    await signup.confirmPassword.pressSequentially('s');
    await expect(signup.errorFor('confirmPassword')).toBeEmpty();
  });
});

test.describe('age gate (today frozen at 2026-06-15)', () => {
  const cases = [
    { birthDate: '2008-06-15', ok: true, note: 'turns 18 today' },
    { birthDate: '2008-06-16', ok: false, note: 'turns 18 tomorrow', error: 'You must be at least 18 years old' },
    { birthDate: '2026-06-16', ok: false, note: 'future date', error: 'Date of birth cannot be in the future' },
  ];
  for (const { birthDate, ok, note, error } of cases) {
    test(`${birthDate} (${note}) is ${ok ? 'accepted' : 'rejected'}`, async () => {
      await signup.fill({ ...validUser, birthDate });
      await signup.submit.click();
      if (ok) {
        await expect(signup.success).toBeVisible();
      } else {
        await expect(signup.errorFor('birthDate')).toHaveText(error!);
      }
    });
  }
});

test('country and terms are required', async () => {
  await signup.fill({ ...validUser, terms: false });
  await signup.country.selectOption('');
  await signup.submit.click();

  await expect(signup.errorFor('country')).toHaveText('Please select a country');
  await expect(signup.errorFor('terms')).toHaveText('You must accept the terms and conditions');
});

test('errors appear on blur, before submitting', async () => {
  await signup.email.fill('nope');
  await signup.email.blur();
  await expect(signup.errorFor('email')).toHaveText('Enter a valid email address');
});
