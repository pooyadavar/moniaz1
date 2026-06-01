import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { PagePreview } from "../types/question";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const PDF_MIME = "application/pdf";
const IMAGE_MIME_PREFIX = "image/";

const canvasToJpegFile = (canvas: HTMLCanvasElement, name: string): Promise<File> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not render PDF page."));
          return;
        }
        resolve(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  });

const pdfToPages = async (file: File, startIndex: number): Promise<PagePreview[]> => {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pages: PagePreview[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context is not available.");

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;

    const jpegFile = await canvasToJpegFile(
      canvas,
      `${file.name.replace(/\.pdf$/i, "")}-page-${pageNum}.jpg`,
    );
    const previewUrl = URL.createObjectURL(jpegFile);
    pages.push({
      index: startIndex + pages.length,
      previewUrl,
      file: jpegFile,
      label: `${file.name} — صفحه ${pageNum}`,
    });
  }

  return pages;
};

export const filesToPages = async (files: File[]): Promise<PagePreview[]> => {
  const pages: PagePreview[] = [];

  for (const file of files) {
    if (file.type === PDF_MIME || file.name.toLowerCase().endsWith(".pdf")) {
      const pdfPages = await pdfToPages(file, pages.length);
      pages.push(...pdfPages);
      continue;
    }

    if (file.type.startsWith(IMAGE_MIME_PREFIX)) {
      const previewUrl = URL.createObjectURL(file);
      pages.push({
        index: pages.length,
        previewUrl,
        file,
        label: file.name,
      });
      continue;
    }

    throw new Error(`فرمت پشتیبانی‌نشده: ${file.name}`);
  }

  return pages;
};

export const revokePageUrls = (pages: PagePreview[]) => {
  pages.forEach((page) => URL.revokeObjectURL(page.previewUrl));
};
