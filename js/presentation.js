function enterPresentationMode() {
    pSlide = 0;
    loadPresentationSlide();

    const presentModeParent = document.getElementById('presentation-mode');
    const header = document.getElementById('header');
    const editor = document.getElementById('editor');

    editor.style.display = 'none';
    header.style.display = 'none';
    presentModeParent.style.display = 'block';

    document.fullscreenEnabled = true;
    document.documentElement.requestFullscreen();
    presentationMode = true;
}

function exitPresentationMode() {
    document.fullscreenEnabled = false;
    document.exitFullscreen();

    const presentModeParent = document.getElementById('presentation-mode');
    const header = document.getElementById('header');
    const editor = document.getElementById('editor');

    editor.style.display = 'flex';
    header.style.display = 'flex';
    presentModeParent.style.display = 'none';
    presentationMode = false;
}

let slidesData = JSON.parse(localStorage.getItem("data")) || [
    { id: Date.now(), background: "white", objects: [] }
];


function loadPresentationSlide() {
    // 1. Pasiimame duomenis iš localStorage per tavo loadLocalSave funkciją
    const fullData = loadLocalSave();
    
    // 2. Nustatome, kur yra skaidrių masyvas (content lauke arba tiesiogiai)
    const slides = (fullData && fullData.content) ? fullData.content : (Array.isArray(fullData) ? fullData : []);
    
    const presentParent = document.getElementById('presentation-mode');
    
    // Išvalome drobę ir paruošiame pabaigos pranešimą (End of Presentation)
    presentParent.innerHTML = '<p id="EOP">Prezentacijos pabaiga. Spauskite ESC arba pelę, kad išeitumėte.</p>';

    // 3. Paimame dabartinę skaidrę pagal pSlide indeksą
    const slide = slides[pSlide];

    if (slide) {
        const slideEl = document.createElement('div');
        slideEl.className = 'presentation-slide active';
        slideEl.style.width = '100vw';
        slideEl.style.height = '100vh';
        slideEl.style.position = 'relative';
        slideEl.style.overflow = 'hidden';
        slideEl.style.background = slide.background || "white";

        slide.objects.forEach(object => {
            const objectEl = document.createElement('div');
            objectEl.className = 'present-object';
            
            objectEl.style.position = 'absolute';
            objectEl.style.display = 'flex';
            objectEl.style.width = object.width + 'px';
            objectEl.style.height = object.height + 'px';
            objectEl.style.left = object.x + 'px';
            objectEl.style.top = object.y + 'px';
            
            objectEl.style.backgroundColor = object.background;
            objectEl.style.backgroundImage = object.backgroundImage;
            objectEl.style.backgroundSize = 'contain';
            objectEl.style.backgroundRepeat = 'no-repeat';
            objectEl.style.color = object.color;
            objectEl.style.transform = object.transform;
            
            objectEl.style.justifyContent = object.textHAlign || 'center';
            objectEl.style.alignItems = object.textVAlign || 'center';
            objectEl.style.fontSize = object.fontSize;
            objectEl.style.fontFamily = object.font;
            
            objectEl.innerHTML = object.content;

            slideEl.appendChild(objectEl);
        });

        presentParent.appendChild(slideEl);
    }
}

function changeSlide(dir) {
    if (dir === 'prev') {
        if (pSlide > 0) {
            pSlide--;
        }
    }
    else if (dir === 'next') {
        if (pSlide < slidesData.length) {
            pSlide++;
        }
        else {
            exitPresentationMode();
        }
    }
    loadPresentationSlide();
}