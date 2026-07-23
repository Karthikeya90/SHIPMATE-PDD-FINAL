// List of common disposable/temporary email domains
const DISPOSABLE_DOMAINS = new Set([
  'yopmail.com',
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'disposablemail.com',
  'sharklasers.com',
  'grr.la',
  'getairmail.com',
  'mailcatch.com',
  'dropmail.me'
]);

export function isOriginalEmail(email: string): boolean {
  try {
    const domain = email.split('@')[1].toLowerCase();
    
    // Check if the domain is in our blocklist of disposable emails
    if (DISPOSABLE_DOMAINS.has(domain)) {
      return false;
    }
    
    // Additional checks can be added here (e.g., regex for valid structure)
    return true;
  } catch (error) {
    return false;
  }
}
