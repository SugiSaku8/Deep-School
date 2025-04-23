export function Poid(userId: string, timestamp: string): string {
  return `${userId}_${timestamp}`;
}