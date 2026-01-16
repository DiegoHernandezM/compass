import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewer({ url }) {
  console.log("PDFVIEWER MONTADO ✅", url);
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(600);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        height: "100%",
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: 8,
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 2,
          alignItems: "center",
        }}
      >
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </button>
        <span>
          {page} / {numPages ?? "-"}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(numPages ?? p, p + 1))}
        >
          Siguiente
        </button>
      </div>

      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(e) => console.error("PDF load error:", e)}
      >
        <Page pageNumber={page} width={Math.min(width, 900)} />
      </Document>
    </div>
  );
}
