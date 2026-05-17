// PDF text extraction using `unpdf`, which bundles a pre-polyfilled pdf.js
// build that runs in serverless / edge runtimes without DOMMatrix (which is
// why the previous direct pdfjs-dist import was throwing "DOMMatrix is not
// defined" on Vercel).

import { extractText, getDocumentProxy } from "unpdf";

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const data = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(data);
  const { text } = await extractText(pdf, { mergePages: true });
  // unpdf returns text as string when mergePages is true, otherwise string[].
  const out = Array.isArray(text) ? text.join("\n\n") : text;
  return (out || "").trim();
}
