export function formatDate(dateString?: string): string {
  if (!dateString) return '--';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? '--'
    : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export function formatTime(timeString?: string): string {
  if (!timeString) return '--';
  const date = new Date(timeString);
  return isNaN(date.getTime())
    ? '--'
    : date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
} 