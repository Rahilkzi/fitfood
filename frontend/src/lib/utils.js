import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines and merges Tailwind CSS classes intelligently.
 * @param  {...any} inputs - Class names or conditional expressions
 * @returns {string} - Final merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
