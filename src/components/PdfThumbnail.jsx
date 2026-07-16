import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, FileText } from 'lucide-react';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PdfThumbnail = ({ url }) => {
  const [isError, setIsError] = useState(false);

  if (!url || isError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-[#121319]">
        <FileText size={32} className="mb-2 opacity-50" />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden flex justify-center relative">
      <style>{`
        .pdf-cover-page canvas {
          object-fit: cover !important;
          object-position: top center !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
      <Document
        file={url}
        className="w-full h-full"
        loading={
          <div className="flex h-full items-center justify-center w-full">
             <Loader2 size={24} className="animate-spin text-indigo-500/50" />
          </div>
        }
        error={() => {
          setIsError(true);
          return null;
        }}
      >
        <Page 
          pageNumber={1} 
          width={600} // Request high enough res for cover
          renderTextLayer={false} 
          renderAnnotationLayer={false}
          className="w-full h-full pdf-cover-page"
        />
      </Document>
    </div>
  );
};

export default PdfThumbnail;
