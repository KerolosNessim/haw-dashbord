const INVOICE_PRINT_STYLES = `
  @page { size: A4; margin: 12mm; }
  html, body {
    margin: 0;
    padding: 0;
    background: #fff;
    font-family: system-ui, "Segoe UI", Tahoma, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  [data-print-hide] { display: none !important; }
  .invoice-print-root {
    box-shadow: none !important;
    border-radius: 0 !important;
    max-width: none !important;
    width: 100% !important;
    overflow: visible !important;
  }
  .invoice-print-root table { page-break-inside: avoid; }
  .invoice-print-root tr { page-break-inside: avoid; }
  @media print {
    body { background: #fff; }
    .invoice-print-root { margin: 0 auto; }
  }
`;

function collectPageStyles(): string {
  const chunks: string[] = [INVOICE_PRINT_STYLES];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        chunks.push(rule.cssText);
      }
    } catch {
      // Skip cross-origin stylesheets
    }
  }

  return chunks.join("\n");
}

function collectStyleMarkup(): string {
  const links = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  )
    .map((link) => {
      const href = link.href;
      if (!href) return "";
      return `<link rel="stylesheet" href="${href}" />`;
    })
    .filter(Boolean)
    .join("\n");

  const inline = Array.from(document.querySelectorAll("style"))
    .map((el) => el.outerHTML)
    .join("\n");

  return `${links}\n${inline}`;
}

function prepareInvoiceClone(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.add("invoice-print-root");
  clone.querySelectorAll("[data-print-hide]").forEach((el) => el.remove());

  clone.querySelectorAll("img").forEach((img) => {
    const raw = img.getAttribute("src") ?? img.src;
    if (!raw || raw.startsWith("data:")) return;
    try {
      img.setAttribute("src", new URL(raw, window.location.href).href);
    } catch {
      /* keep original src */
    }
  });

  return clone;
}

function buildPrintDocument(bodyHtml: string, title: string): string {
  const baseHref = new URL(import.meta.env.BASE_URL || "/", window.location.href).href;
  const styles = collectPageStyles();

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <base href="${baseHref}" />
  <title>${title}</title>
  ${collectStyleMarkup()}
  <style>${styles}</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

function waitForImages(doc: Document, onReady: () => void) {
  const images = Array.from(doc.images);
  if (images.length === 0) {
    onReady();
    return;
  }

  let loaded = 0;
  const done = () => {
    loaded += 1;
    if (loaded >= images.length) onReady();
  };

  for (const img of images) {
    if (img.complete) done();
    else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  }
}

export function downloadInvoiceHtml(element: HTMLElement, filename: string) {
  const clone = prepareInvoiceClone(element);
  const doc = buildPrintDocument(clone.outerHTML, filename);

  const blob = new Blob([doc], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function printInvoiceElement(element: HTMLElement, title = "Invoice") {
  const clone = prepareInvoiceClone(element);
  const html = buildPrintDocument(clone.outerHTML, title);

  const iframe = document.createElement("iframe");
  iframe.setAttribute(
    "style",
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;",
  );
  iframe.setAttribute("title", title);
  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = frameWindow?.document;
  if (!frameWindow || !frameDoc) {
    iframe.remove();
    return;
  }

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 500);
  };

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const triggerPrint = () => {
    waitForImages(frameDoc, () => {
      window.setTimeout(() => {
        frameWindow.focus();
        frameWindow.print();
        cleanup();
      }, 150);
    });
  };

  if (frameDoc.readyState === "complete") {
    triggerPrint();
  } else {
    iframe.addEventListener("load", triggerPrint, { once: true });
  }
}
