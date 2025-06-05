function isIgnoreKey(event: KeyboardEvent) {
  return (
    event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1
  );
}

export function checkNumberInput(event: KeyboardEvent) {
  if (!isIgnoreKey(event) && !/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}

export function checkInputLength(
  input: string | undefined,
  limit: number,
  event: KeyboardEvent
) {
  if (input && !isIgnoreKey(event) && input.length >= limit) {
    event.preventDefault();
  }
}
