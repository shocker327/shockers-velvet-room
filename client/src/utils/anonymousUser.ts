const USER_ID_KEY = 'velvet-suite-user-id';

export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

const AGE_VERIFIED_KEY = 'velvet-suite-age-verified';

export function isAgeVerified(): boolean {
  return localStorage.getItem(AGE_VERIFIED_KEY) === 'true';
}

export function setAgeVerified(): void {
  localStorage.setItem(AGE_VERIFIED_KEY, 'true');
}
