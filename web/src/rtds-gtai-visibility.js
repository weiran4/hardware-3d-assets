// Mutating a reflected boolean attribute even to the same value can notify observers.
export function setGtaiMeterHidden(element, hidden) {
 if (element.hidden !== hidden) element.hidden = hidden;
}
