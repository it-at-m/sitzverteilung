function preventInput(regex: RegExp, event: KeyboardEvent) {
  if (
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    event.key.length !== 1
  ) {
    return;
  }

  if (!regex.test(event.key)) {
    event.preventDefault();
  }
}

export function checkNumberInput(event: KeyboardEvent) {
  preventInput(/^\d$/, event);
}
