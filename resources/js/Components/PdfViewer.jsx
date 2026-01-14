import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);

  return (
    <div style={{ height: "100%", overflow: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ display: "flex", gap: 8, padding: 8, position: "sticky", top: 0, background: "white", zIndex: 1 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
        <span>{page} / {numPages ?? "-"}</span>
        <button onClick={() => setPage(p => Math.min(numPages ?? p, p + 1))}>Siguiente</button>
      </div>

      <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
        <Page pageNumber={page} />
      </Document>
    </div>
  );
}
