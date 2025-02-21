import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function invariantResponse(condition: any, message?: string | (() => string), responseInit?: ResponseInit): asserts condition {

  if (!condition) {
    throw new Response(typeof message === 'function' ? message() : message || 'An invariant failed, please provide a message to explain why.', { status: 400, ...responseInit })
  }
}