let pdfDoc = null;
let currentPage = 1;
let scale = 1.5;
let isDragging = false;
let startX, startY;
let currentX = 0,
    currentY = 0;

const uploadPdf = document.getElementById('upload-pdf');
const pdfViewer = document.getElementById('pdf-viewer');
const pdfContainer = document.getElementById('pdf-container');
const zoomSlider = document.getElementById('zoom-slider');
const zoomValue = document.getElementById('zoom-value');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const fullscreenExitBtn = document.getElementById('fullscreen-exit-btn');
const fullscreenPrevBtn = document.getElementById('fullscreen-prev-btn');
const fullscreenNextBtn = document.getElementById('fullscreen-next-btn');
const pageNum = document.getElementById('page-num');

uploadPdf.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = function (e) {
            loadPDF(e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        alert('Por favor, selecione um arquivo PDF válido.');
    }
});

function loadPDF(url) {
    pdfjsLib.getDocument(url).promise.then(function (pdf) {
        pdfDoc = pdf;
        currentPage = 1;
        renderPage(currentPage);
    });
}

function renderPage(pageNumNow) {
    if (!pdfDoc) return;

    pdfDoc.getPage(pageNumNow).then(function (page) {
        const viewport = page.getViewport({
            scale: scale
        });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        pdfViewer.innerHTML = '';
        pdfViewer.appendChild(canvas);

        page.render({
            canvasContext: context,
            viewport: viewport
        });

        pageNum.textContent = `Página: ${currentPage} de ${pdfDoc.numPages}`;
    });
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPage(currentPage);
    }
}

function goToNextPage() {
    if (pdfDoc && currentPage < pdfDoc.numPages) {
        currentPage++;
        renderPage(currentPage);
    }
}

zoomSlider.addEventListener('input', function () {
    scale = parseFloat(this.value);
    zoomValue.textContent = `Zoom: ${Math.round(scale * 100)}%`;
    renderPage(currentPage);
});

prevPageBtn.addEventListener('click', goToPrevPage);
nextPageBtn.addEventListener('click', goToNextPage);
fullscreenPrevBtn.addEventListener('click', goToPrevPage);
fullscreenNextBtn.addEventListener('click', goToNextPage);

fullscreenBtn.addEventListener('click', function () {
    if (pdfContainer.requestFullscreen) {
        pdfContainer.requestFullscreen();
    }
});

fullscreenExitBtn.addEventListener('click', function () {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
});

pdfViewer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - currentX;
    startY = e.pageY - currentY;
    pdfViewer.style.cursor = 'grabbing';
});

pdfViewer.addEventListener('mousemove', (e) => {
    if (isDragging) {
        currentX = e.pageX - startX;
        currentY = e.pageY - startY;
        pdfViewer.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
});

pdfViewer.addEventListener('mouseup', () => {
    isDragging = false;
    pdfViewer.style.cursor = 'grab';
});

pdfViewer.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (e.deltaY < 0) {
        scale += 0.1;
    } else {
        scale -= 0.1;
    }
    scale = Math.min(Math.max(scale, 0.5), 3); // limita entre 0.5x e 3x
    zoomSlider.value = scale;
    zoomValue.textContent = `Zoom: ${Math.round(scale * 100)}%`;
    renderPage(currentPage);
});

document.addEventListener('keydown', function (e) {
    if (!pdfDoc) return;
    if (e.key === 'ArrowLeft') {
        goToPrevPage();
    } else if (e.key === 'ArrowRight') {
        goToNextPage();
    }
});

document.addEventListener('fullscreenchange', function () {
    if (document.fullscreenElement) {
        fullscreenExitBtn.style.display = 'block';
        document.body.classList.add('fullscreen');
    } else {
        fullscreenExitBtn.style.display = 'none';
        document.body.classList.remove('fullscreen');
        pdfViewer.style.transform = 'translate(0px, 0px)';
        currentX = 0;
        currentY = 0;
    }
});