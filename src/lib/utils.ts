import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUUIDCryptoNumber(): string {
  const uuid = uuidv4()
  const uuidNumber = uuid.replace(/[^0-9]/g, '').substring(0, 10)
  return uuidNumber.padStart(10, '0')
}
