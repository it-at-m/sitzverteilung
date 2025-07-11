export const FieldValidationRules = {
  Required: (value: string) =>
    (value !== null && value !== undefined && value !== "") ||
    "Das Feld ist ein Pflichtfeld.",
  IsUnique: (arr: string[]) => (value: string) =>
    arr.filter((val) => val.trim() === value.trim()).length < 2 ||
    "Es gibt andere Einträge mit identischem Wert.",
};

export const LimitConfiguration = {
  limitName: 45,
  limitGroups: 18,
  limitVotes: 99_999_999,
  limitCommitteeSize: 999,
};

function isIgnoreKey(event: KeyboardEvent) {
  return (
    event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1
  );
}

export function preventTooLongInput(
  input: string | undefined,
  limit: number,
  event: KeyboardEvent | ClipboardEvent
) {
  if (event instanceof KeyboardEvent) {
    if (input && !isIgnoreKey(event) && input.length >= limit) {
      // Allow input if text is selected (will be replaced)
      const target = event.target as HTMLInputElement;
      if (target && target.selectionStart !== target.selectionEnd) {
        return;
      }
      event.preventDefault();
    }
  } else if (event instanceof ClipboardEvent) {
    const pastedText = event.clipboardData?.getData("text");
    const target = event.target as HTMLInputElement;
    if (pastedText && target) {
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      const inputLength = input?.length ?? 0;
      const newLength = inputLength - (end - start) + pastedText.length;
      if (newLength > limit) {
        event.preventDefault();
      }
    }
  }
}
