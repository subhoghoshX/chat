import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserId() {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "tempuser_" + crypto.randomUUID();
    localStorage.setItem("userId", userId);
  }
  return userId;
}
