import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import { Box, Paper, IconButton, Typography, Tooltip } from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewer({ url }) {
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
  {/* Toolbar */}
  <Box
    sx={{
      position: "sticky",
      top: 0,
      zIndex: 999,
      bgcolor: "background.paper",
      borderBottom: "1px solid",
      borderColor: "divider",
      py: 1,
      px: 1.5,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <Paper
      elevation={2}
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Tooltip title="Página anterior">
        <span>
          <IconButton
            size="small"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <NavigateBeforeIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Typography variant="body2" sx={{ minWidth: 84, textAlign: "center" }}>
        {page} / {numPages ?? "-"}
      </Typography>

      <Tooltip title="Página siguiente">
        <span>
          <IconButton
            size="small"
            onClick={() => setPage((p) => Math.min(numPages ?? p, p + 1))}
            disabled={numPages ? page >= numPages : true}
          >
            <NavigateNextIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Paper>
  </Box>

  {/* PDF */}
  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
    <Document
      file={url}
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      onLoadError={(e) => console.error("PDF load error:", e)}
      loading={<Typography sx={{ p: 2 }}>Cargando PDF...</Typography>}
    >
      <Page pageNumber={page} width={Math.min(width, 900)} />
    </Document>
  </Box>
</div>
  );
}
