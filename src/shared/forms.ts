// A form that refuses and then sits still looks like a button that does
// nothing, because the field it disliked may be well off the screen. Moving
// there says what is wrong without a banner and without pushing anything down.
export function focusFirstInvalid(order: readonly string[], errors: Record<string, unknown>): void {
  const first = order.find((field) => errors[field] !== undefined);

  if (first === undefined) {
    return;
  }

  const control = document.getElementById(first);

  if (control === null) {
    return;
  }

  control.focus();

  // focus() already brings the control into view. This only centres it, and it
  // is missing from enough environments that it cannot be relied on: letting it
  // throw here would take the whole refusal down with it.
  control.scrollIntoView?.({ block: 'center' });
}
