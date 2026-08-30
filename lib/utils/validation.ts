export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export interface PasswordCheck {
  valid: boolean;
  message: string;
}

/** Contraseña segura: mínimo 8 caracteres, con al menos una letra y un número. */
export function isValidPassword(password: string): PasswordCheck {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe incluir letras y números.' };
  }
  return { valid: true, message: '' };
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
