export function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (!local || !domain) return email;
  
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
  
    const first = local[0];
    const last = local[local.length - 1];
  
    const middleMask = "*".repeat(local.length - 2);
  
    return `${first}${middleMask}${last}@${domain}`;
  }
  