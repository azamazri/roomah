/**
 * Date Utilities for Roomah
 * Handle date operations, age calculation, timezone
 */

/**
 * Calculate age from birth date
 * Returns age in years
 */
export function calculateAge(birthDate: Date | string | null): number {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format date to Indonesian format
 * Example: "17 September 2025"
 */
export function formatDateIndonesian(date: Date | string | null): string {
  if (!date) return "N/A";
  
  const d = new Date(date);
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format date for database (YYYY-MM-DD)
 */
export function formatDateForDB(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Get age range label
 * Used for filters: 17-22, 23-27, 28-32, 33+
 */
export function getAgeRangeLabel(age: number): string {
  if (age < 17) return "< 17";
  if (age <= 22) return "17-22";
  if (age <= 27) return "23-27";
  if (age <= 32) return "28-32";
  if (age <= 35) return "33-35";
  return "35+";
}

/**
 * Check if user meets minimum age requirement (17 years)
 */
export function meetsMinimumAge(birthDate: Date | string | null): boolean {
  const age = calculateAge(birthDate);
  return age >= 17;
}

/**
 * Format datetime for display
 * Example: "Selasa, 17 September 2025 17:00"
 */
export function formatDateTimeIndonesian(date: Date | string | null): string {
  if (!date) return "N/A";
  
  const d = new Date(date);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  const dayName = days[d.getDay()];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${dayName}, ${day} ${month} ${year} ${hours}:${minutes}`;
}

/**
 * Check if date is expired (for taaruf requests - 7 days)
 */
export function isExpired(date: Date | string, daysToExpire: number = 7): boolean {
  const d = new Date(date);
  const expiryDate = new Date(d.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
  return new Date() > expiryDate;
}
