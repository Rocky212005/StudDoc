const urlParams = new URLSearchParams(window.location.search);
const file = urlParams.get("file");

const url = `/uploads/${file}`;

const pdfjsLib = window["pdfjs-dist/build/pdf"];
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://mozilla.github.io/pdf.js/build/pdf.worker.js";

let pdfDoc = null,
    pageNum = 1,
    scale = 1.5,
    canvas = document.getElementById("pdf-render"),
    ctx = canvas.getContext("2d");

const renderPage = (num) => {
    pdfDoc.getPage(num).then((page) => {
        let viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        let renderContext = {
            canvasContext: ctx,
            viewport: viewport,
        };

        page.render(renderContext);

        document.getElementById("page-num").textContent = num;
    });
};

// Load the PDF
pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
    pdfDoc = pdfDoc_;
    document.getElementById("page-count").textContent = pdfDoc.numPages;
    renderPage(pageNum);
});

// Button controls
document.getElementById("prev-page").addEventListener("click", () => {
    if (pageNum <= 1) return;
    pageNum--;
    renderPage(pageNum);
});

document.getElementById("next-page").addEventListener("click", () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPage(pageNum);
});
