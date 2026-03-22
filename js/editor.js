// Values
let presentationMode = false;
let activeElement = null;
let offsetX, offsetY;
let scale = 0.55;
class Object {
    constructor({ id, type, x, y, width, height, background, color = "black" }) {
        this.id = id;
        this.type = type;
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 100;
        this.height = height || 100;
        this.background = background || "#ffffff";
        this.color = color;
    }
}
let eSlide = 0;
let pSlide = 0;


function newSlide() {
    // Sukuriame duomenų objektą naujai skaidrei
    const newSlideObj = {
        id: Date.now(), // Unikalus ID
        background: "white",
        objects: []
    };

    // Įterpiame į duomenų masyvą po dabartinės skaidrės
    slidesData.splice(eSlide + 1, 0, newSlideObj);

    // Vizualus skaidrės sukūrimas šoninėje juostoje (tavo esamas kodas)
    const slidesList = document.querySelectorAll('.slide');
    const current = slidesList[eSlide];
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `<p class="slide-number"></p>`;
    slide.onclick = () => openSlide(slide);
    
    current.after(slide);
    
    // Perjungiam aktyvią skaidrę
    openSlide(slide);
    refreshSlides();
    
    // Išvalome drobę naujai skaidrei
    document.getElementById('canvas').innerHTML = '';
    
    updateLocalSave();
}

function refreshSlides() {
    const slidesList = document.querySelectorAll('.slide');
    
    slidesList.forEach((s, index) => {
        s.querySelector('.slide-number').innerHTML = index + 1;
    });
}

function openSlide(self) {
    updateLocalSave();

    const slidesList = document.querySelectorAll('.slide');
    document.querySelectorAll('.slide').forEach(s => s.id = '');
    
    self.id = 'active-slide';
    
    eSlide = Array.from(document.querySelectorAll('.slide')).indexOf(self);

    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '';
    
    const currentData = slidesData[eSlide];
    if (currentData && currentData.objects) {
        currentData.objects.forEach(objData => {
            createObjectFromData(objData); 
        });
        canvas.style.backgroundColor = currentData.background || "white";
    }
}

function addObject() {
    const canvas = document.getElementById('canvas');
    const object = document.createElement('div');
    const objectEditor = document.createElement('div');
    object.className = 'object';
    objectEditor.className = 'object-editor';
    
    object.style.position = 'absolute';
    object.style.left = '810px';
    object.style.top = '390px';
    object.style.width = '300px';
    object.style.height = '300px';
    object.style.backgroundColor = '#0000ff';
    // object.contentEditable = true;

    canvas.appendChild(object);

    updateLocalSave();
}

function createObjectFromData(data) {
    console.log(data);
    const canvas = document.getElementById('canvas'); // Pridėta
    const object = document.createElement('div');
    object.className = 'object';
    
    object.style.position = 'absolute';
    object.style.left = data.x + 'px';
    object.style.top = data.y + 'px';
    object.style.width = data.width + 'px'; // Pakeista iš 300px
    object.style.height = data.height + 'px'; // Pakeista iš 300px
    object.style.backgroundColor = data.background; // Naudojame spalvą iš DB

    canvas.appendChild(object);
}

document.addEventListener('mousedown', (e) => {
    if (presentationMode) {
        changeSlide('next');
    }
    else {
        if (e.target.classList.contains('object')) {
            activeElement = e.target;

            offsetX = e.clientX/scale - activeElement.offsetLeft;
            offsetY = e.clientY/scale - activeElement.offsetTop;
        }
    }
});

document.addEventListener('mousemove', (e) => {
    if (!activeElement) return;

    let x = e.clientX/scale - offsetX;
    let y = e.clientY/scale - offsetY;
    let w = activeElement.offsetWidth;
    let h = activeElement.offsetHeight;

    const canvas = document.getElementById('canvas');
    const canvasRect = canvas.getBoundingClientRect();

    activeElement.style.left = x + 'px';
    activeElement.style.top = y + 'px';

    // X
    if (Math.round((x-960+(w/2)) / 32)*32 === 0) {
        activeElement.style.left = (960-(w/2)) +'px';
    }

    if (Math.round(x / 32)*32 === 0) {
        activeElement.style.left = '0px';
    }
    else if (Math.round((x+w) / 32)*32 === 0) {
        activeElement.style.left = -w + 'px';
    }
    else if (Math.round((x-1920) / 32)*32 === 0) {
        activeElement.style.left = '1920px';
    }
    else if (Math.round((x-1920+w) / 32)*32 === 0) {
        activeElement.style.left = (1920 - w) + 'px';
    }


    // Y
    if (Math.round((y-540+(h/2)) / 32)*32 === 0) {
        activeElement.style.top = (540-(h/2)) +'px';
    }

    if (Math.round(y / 32)*32 === 0) {
        activeElement.style.top = '0px';
    }
    else if (Math.round((y+h) / 32)*32 === 0) {
        activeElement.style.top = -h + 'px';
    }
    else if (Math.round((y-1080) / 32)*32 === 0) {
        activeElement.style.top = '1080px';
    }
    else if (Math.round((y-1080+h) / 32)*32 === 0) {
        activeElement.style.top = (1080 - h) + 'px';
    }
});

document.addEventListener('mouseup', () => {
    if (activeElement) {
        activeElement = null;
    }

    updateLocalSave();
});

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

document.addEventListener('fullscreenchange', (e) => {
    if (!document.fullscreenElement) {
        exitPresentationMode();
    }
});

document.addEventListener('keydown', (e) => {
    if (presentationMode) {
        if (e.key === 'Escape') {
            exitPresentationMode();
        }

        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'a' || e.key === 'w') {
            changeSlide('prev');
        }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'd' || e.key === 's' || e.key === ' ') {
            changeSlide('next');
        }
    }

    updateLocalSave();
});

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

function updateLocalSave() {
    // 1. Randame aktyvią skaidrę HTML'e
    const activeSlideEl = document.getElementById('active-slide');
    if (!activeSlideEl) return;

    // 2. Surinkime visus objektus iš drobės (canvas)
    const objects = document.querySelectorAll('.object');
    const currentObjects = Array.from(objects).map((obj, index) => {
        // 1. Pirmiausia bandome gauti stiliaus reikšmę (ji dažniausiai prieinama iškart)
        let w = parseInt(obj.style.width) || obj.offsetWidth;
        let h = parseInt(obj.style.height) || obj.offsetHeight;

        // 2. Jei vis tiek 0 (nesąmonė), naudojame tavo numatytąjį 300px
        if (w <= 0) w = 300;
        if (h <= 0) h = 300;

        return {
            id: index,
            x: parseInt(obj.style.left) || 0,
            y: parseInt(obj.style.top) || 0,
            width: w,
            height: h,
            background: obj.style.backgroundColor
        };
});

    // 3. Atnaujiname duomenis mūsų kintamajame slidesData
    // eSlide yra tavo dabartinis indeksas
    if (!slidesData[eSlide]) {
        slidesData[eSlide] = { id: Date.now(), background: "white", objects: [] };
    }
    
    slidesData[eSlide].objects = currentObjects;
    slidesData[eSlide].background = document.getElementById('canvas').style.backgroundColor;

    // 4. Saugome visą MASYVĄ į localStorage
    localStorage.setItem("data", JSON.stringify(slidesData));
}


function loadLocalSave() {
    const data = localStorage.getItem("data");
    if (!data) {
        console.warn("No local save data found.");
        return [];
    }

    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Error parsing local save data:", e);
        return [];
    }
}


function loadPresentationSlide() {
    const slidesData = loadLocalSave();
    const presentParent = document.getElementById('presentation-mode');
    presentParent.innerHTML = '<p id="EOP">This is the end of the presentation. Press ESC or change slide again to exit.</p>';

    slidesData.forEach((slide, index) => {
        if (index === pSlide) {
            const slideEl = document.createElement('div');
            slideEl.className = 'present-slide';
            if (index === 0) {
                slideEl.id = 'current-present-slide';
            } else {
                slideEl.id = '';
            }
            slideEl.style.background = slide.background;
            slide.objects.forEach(object => {
                const objectEl = document.createElement('div');
                objectEl.className = 'present-object';
                objectEl.style.width = object.width + 'px';
                objectEl.style.height = object.height + 'px';
                objectEl.style.left = object.x + 'px';
                objectEl.style.top = object.y + 'px';
                objectEl.style.backgroundColor = object.background;
                slideEl.appendChild(objectEl);
            });
            presentParent.appendChild(slideEl);
        }
    });
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


///////////////////////////////////////////////////////////////////////////////////////////
const eMenu = document.getElementById('editor-context');
const sMenu = document.getElementById('slidebar-context');
let targetElement = null; // Čia saugosime, ant ko paspaudėme

document.addEventListener('contextmenu', (e) => {
    eMenu.style.display = 'none';
    sMenu.style.display = 'none';
    e.preventDefault();
    if (e.target.classList.contains('object')) {
        targetElement = e.target;

        eMenu.style.display = 'block';
        eMenu.style.left = e.pageX + 'px';
        eMenu.style.top = e.pageY + 'px';
    }
    else if (e.target.classList.contains('slide')) {
        targetElement = e.target;

        sMenu.style.display = 'block';
        sMenu.style.left = e.pageX + 'px';
        sMenu.style.top = e.pageY + 'px';
    }
});

document.addEventListener('click', () => {
    eMenu.style.display = 'none';
    sMenu.style.display = 'none';
});

function deleteObject() {
    if (targetElement) {
        targetElement.remove();
        updateLocalSave();
    }
}
///////////////////////////////////////////////////////////////////////////////////////////

window.onload = () => {
    localStorage.clear();
    slidesData = [{ id: Date.now(), background: "white", objects: [] }];
    eSlide = 0;
}