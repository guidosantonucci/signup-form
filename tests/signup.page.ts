import { type Page, type Locator, expect } from '@playwright/test';

export type SignupData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string; // YYYY-MM-DD
  country: string; // visible label, e.g. "Argentina"
  terms: boolean;
};

export const validUser: SignupData = {
  fullName: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'Str0ng!Pass',
  confirmPassword: 'Str0ng!Pass',
  birthDate: '1990-12-10',
  country: 'Argentina',
  terms: true,
};

/** Locators are built from labels and roles (what a user sees), not from CSS. */
export class SignupPage {
  readonly page: Page;
  readonly fullName: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly confirmPassword: Locator;
  readonly birthDate: Locator;
  readonly country: Locator;
  readonly terms: Locator;
  readonly submit: Locator;
  readonly strength: Locator;
  readonly success: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullName = page.getByLabel('Full name');
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Password', { exact: true });
    this.confirmPassword = page.getByLabel('Confirm password');
    this.birthDate = page.getByLabel('Date of birth');
    this.country = page.getByLabel('Country');
    this.terms = page.getByLabel('I accept the terms and conditions');
    this.submit = page.getByRole('button', { name: 'Create account' });
    this.strength = page.getByTestId('strength-label');
    this.success = page.getByRole('region', { name: 'Welcome aboard!' });
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  }

  /** Error text for a field, found through its aria-describedby link. */
  errorFor(field: keyof SignupData): Locator {
    return this.page.locator(`#${field}-error`);
  }

  async fill(data: Partial<SignupData>) {
    if (data.fullName !== undefined) await this.fullName.fill(data.fullName);
    if (data.email !== undefined) await this.email.fill(data.email);
    if (data.password !== undefined) await this.password.fill(data.password);
    if (data.confirmPassword !== undefined) await this.confirmPassword.fill(data.confirmPassword);
    if (data.birthDate !== undefined) await this.birthDate.fill(data.birthDate);
    if (data.country !== undefined) await this.country.selectOption({ label: data.country });
    if (data.terms !== undefined) await this.terms.setChecked(data.terms);
  }
}
