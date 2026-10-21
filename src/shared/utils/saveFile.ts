// Hands a file the page already holds to the browser's own download.
export function saveFile(file: Blob, name: string) {
  const address = URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = address;
  link.download = name;
  link.click();
  URL.revokeObjectURL(address);
}
