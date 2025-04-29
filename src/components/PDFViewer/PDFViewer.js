import React, { useState } from "react";
import { Document, Page } from "react-pdf";
import "./PDFViewer.css";

const PDFViewer = ({ document }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [tempPageNumber, setTempPageNumber] = useState(1);
    const [scale, setScale] = useState(1); // scale mặc định

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handlePageInputChange = (e) => {
        const inputPage = parseInt(e.target.value, 10);
        setTempPageNumber(isNaN(inputPage) ? "" : inputPage);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const page = Math.min(Math.max(tempPageNumber, 1), numPages);
            setPageNumber(page);
            setTempPageNumber(page);
        }
    };

    return (
        <div className='pdf-preview'>
            <div className='pdf-toolbar'>
                <button
                    onClick={() =>
                        setScale((prev) => Math.max(prev - 0.1, 0.5))
                    }
                >
                    -
                </button>
                <span>{(scale * 100).toFixed(0)}%</span>
                <button
                    onClick={() => setScale((prev) => Math.min(prev + 0.1, 3))}
                >
                    +
                </button>
            </div>

            <div className='pdf-container'>
                <Document file={document} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                </Document>
            </div>

            <div className='pdf-pagination'>
                <p>
                    Page{" "}
                    <input
                        style={{ width: "40px" }}
                        type='number'
                        min='1'
                        max={numPages}
                        value={tempPageNumber}
                        onChange={handlePageInputChange}
                        onKeyDown={handleKeyDown}
                    />{" "}
                    of {numPages}
                </p>
                <button
                    disabled={pageNumber <= 1}
                    onClick={() => {
                        const newPage = pageNumber - 1;
                        setPageNumber(newPage);
                        setTempPageNumber(newPage);
                    }}
                >
                    Previous
                </button>
                <button
                    disabled={pageNumber >= numPages}
                    onClick={() => {
                        const newPage = pageNumber + 1;
                        setPageNumber(newPage);
                        setTempPageNumber(newPage);
                    }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default PDFViewer;
