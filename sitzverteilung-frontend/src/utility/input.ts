function isIgnoreKey(event: KeyboardEvent) {
  return (
    event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1
  );
}

export function preventNonNumericInput(event: KeyboardEvent) {
  if (!isIgnoreKey(event) && !/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

export function preventTooLongInput(
  input: string | undefined,
  limit: number,
  event: KeyboardEvent
) {
  if (input && !isIgnoreKey(event) && input.length >= limit) {
    // Allow input if text is selected (will be replaced)
    const target = event.target as HTMLInputElement;
    if (target && target.selectionStart !== target.selectionEnd) {
      return;
    }
    event.preventDefault();
  }
}
