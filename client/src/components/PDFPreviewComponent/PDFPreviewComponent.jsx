import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import pdfWorker from '../../../node_modules/pdfjs-dist/build/pdf.worker.entry';

const PDFPreviewComponent = ({ file }) => {
    if (!file) {
        return <div>No PDF file provided.</div>;
    }

    const fileUrl = URL.createObjectURL(file); // Tạo URL tạm thời từ đối tượng file
    return (
        <div style={{ height: '300px', width: '100%' }}>
            <Worker workerUrl={pdfWorker}>
                <Viewer fileUrl={fileUrl} />
            </Worker>
        </div>
    );
};

export default PDFPreviewComponent;
