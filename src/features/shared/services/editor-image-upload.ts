/**
 * Rich editor images are embedded in the HTML (data URL) in the browser only.
 * No separate upload API — images are sent when you save the page (hero, blog, …)
 * inside the rich text fields (description, title, etc.).
 */
export async function uploadEditorImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read image file"));
    reader.readAsDataURL(file);
  });
}
