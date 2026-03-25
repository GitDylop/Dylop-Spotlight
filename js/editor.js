// Values
let presentationMode = false;
let activeElement = null;
let offsetX, offsetY;
let scale = 0.55;
class Object {
    constructor({ id, type, x, y, width, height, background, color = "black", transform = "none"}) {
        this.id = id;
        this.type = type;
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 100;
        this.height = height || 100;
        this.background = background || "#ffffff";
        this.color = color;
        this.transform = transform;
    }
}
let eSlide = 0;
let pSlide = 0;
let initialRotation = 0;
let shiftKeyPressed = false;


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
    object.style.backgroundColor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
    // object.contentEditable = true;

    canvas.appendChild(object);

    updateLocalSave();
}

function createObjectFromData(data) {
    console.log(data);
    const canvas = document.getElementById('canvas');
    const object = document.createElement('div');
    object.className = 'object';
    
    object.style.position = 'absolute';
    object.style.left = data.x + 'px';
    object.style.top = data.y + 'px';
    object.style.width = data.width + 'px';
    object.style.height = data.height + 'px';
    object.style.backgroundColor = data.background;
    object.style.transform = data.transform;
    

    canvas.appendChild(object);
}

const editBox = document.getElementById('object-selection-box');
let lastObject = null;

document.addEventListener('mousedown', (e) => {
    if (presentationMode) {
        changeSlide('next');
    }
    else {
        editBox.style.display = 'none';

        if (e.target.classList.contains('object')) {
            activeElement = e.target;
            lastObject = activeElement;


            offsetX = e.clientX/scale - activeElement.offsetLeft;
            offsetY = e.clientY/scale - activeElement.offsetTop;


            const rect = activeElement.getBoundingClientRect();
            editBox.style.display = 'block';
            editBox.style.left = rect.left - 5 + 'px';
            editBox.style.top = rect.top - 5 + 'px';
            editBox.style.width = activeElement.offsetWidth*scale + 10 + 'px';
            editBox.style.height = activeElement.offsetHeight*scale + 10 + 'px';
        }
        if (e.target.classList.contains('osb-round-handle')) {
            activeElement = e.target;
            const side = activeElement.getAttribute('side');

            if (side === 'rotate') {
                const rect = lastObject.getBoundingClientRect();
                // Centras ekrano koordinatėmis (reikalingas Math.atan2 skaičiavimui)
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
                
                const dy = e.clientY - centerY;
                const dx = e.clientX - centerX;
                startAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                // Pasiimame esamą rotaciją iš style (jei yra)
                const style = lastObject.style.transform;
                const match = style.match(/rotate\(([^deg]+)deg\)/);
                initialRotation = match ? parseFloat(match[1]) : 0;
            }
            
            // Užfiksuojame būseną paspaudimo akimirką
            initialWidth = lastObject.offsetWidth;
            initialHeight = lastObject.offsetHeight;
            initialTop = lastObject.offsetTop;
            initialLeft = lastObject.offsetLeft;
            initialMouseX = e.clientX / scale; 
            initialMouseY = e.clientY / scale; 

            editBox.style.display = 'block';
        }
    }
});

let initialWidth, initialHeight, initialTop, initialLeft, initialMouseX, initialMouseY, centerX, centerY, startAngle;

document.addEventListener('mousemove', (e) => {
    if (!activeElement) return;

    let x = e.clientX / scale - offsetX;
    let y = e.clientY / scale - offsetY;
    const w = activeElement.offsetWidth;
    const h = activeElement.offsetHeight;

    if (activeElement.classList.contains('object')) {

        // X
        if (Math.round((x - 960 + (w / 2)) / 32) * 32 === 0) x = 960 - (w / 2);
        if (Math.round(x / 32) * 32 === 0) x = 0;
        else if (Math.round((x + w) / 32) * 32 === 0) x = -w;
        else if (Math.round((x - 1920) / 32) * 32 === 0) x = 1920;
        else if (Math.round((x - 1920 + w) / 32) * 32 === 0) x = 1920 - w;

        // Y
        if (Math.round((y - 540 + (h / 2)) / 32) * 32 === 0) y = 540 - (h / 2);
        if (Math.round(y / 32) * 32 === 0) y = 0;
        else if (Math.round((y + h) / 32) * 32 === 0) y = -h;
        else if (Math.round((y - 1080) / 32) * 32 === 0) y = 1080;
        else if (Math.round((y - 1080 + h) / 32) * 32 === 0) y = 1080 - h;

        activeElement.style.left = x + 'px';
        activeElement.style.top = y + 'px';

        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();

        editBox.style.left = (canvasRect.left + x * scale - 5) + 'px';
        editBox.style.top = (canvasRect.top + y * scale - 5) + 'px';
        editBox.style.width = (w * scale + 10) + 'px';
        editBox.style.height = (h * scale + 10) + 'px';
    }
    else if (activeElement.classList.contains('osb-round-handle')) {
        const side = activeElement.getAttribute('side');
        const currentX = e.clientX / scale;
        const currentY = e.clientY / scale;
        const diffX = currentX - initialMouseX; 
        const diffY = currentY - initialMouseY; 

        const canvas = document.getElementById('canvas');
        const canvasRect = canvas.getBoundingClientRect();

        switch (side) {
            case 'tl': {
                let newWidth = initialWidth - diffX;
                let newHeight = initialHeight - diffY;
                let newTop = initialTop + diffY;
                let newLeft = initialLeft + diffX;

                if (Math.round(newTop / 32) * 32 === 0) {
                    newTop = 0;
                    newHeight = initialTop + initialHeight;
                }
                else if (Math.round((newTop - 1080) / 32) * 32 === 0) {
                    newTop = 1080;
                    newHeight = initialTop + initialHeight - 1080;
                }
                if (Math.round(newLeft / 32) * 32 === 0) {
                    newLeft = 0;
                    newWidth = initialLeft + initialWidth;
                }
                else if (Math.round((newLeft - 1920) / 32) * 32 === 0) {
                    newLeft = 1920;
                    newWidth = initialLeft + initialWidth - 1920;
                }

                if (newWidth < 10) {
                    newWidth = 10;
                    newLeft = initialLeft + (initialWidth - 10);
                }
                if (newHeight < 10) {
                    newHeight = 10;
                    newTop = initialTop + (initialHeight - 10);
                }

                lastObject.style.width = newWidth + 'px';
                lastObject.style.height = newHeight + 'px';
                lastObject.style.top = newTop + 'px';
                lastObject.style.left = newLeft + 'px';

                editBox.style.top = (canvasRect.top + newTop * scale - 5) + 'px';
                editBox.style.left = (canvasRect.left + newLeft * scale - 5) + 'px';
                editBox.style.width = (newWidth * scale + 10) + 'px';
                editBox.style.height = (newHeight * scale + 10) + 'px';
                break;
            }
            case 'tm': {
                let newWidth = initialWidth - diffX;
                let newHeight = initialHeight - diffY;
                let newTop = initialTop + diffY;
                let newLeft = initialLeft + diffX;

                if (Math.round(newTop / 32) * 32 === 0) {
                    newTop = 0;
                    newHeight = initialTop + initialHeight;
                }
                else if (Math.round((newTop - 1080) / 32) * 32 === 0) {
                    newTop = 1080;
                    newHeight = initialTop + initialHeight - 1080;
                }

                if (newHeight < 10) {
                    newHeight = 10;
                    newTop = initialTop + (initialHeight - 10);
                }

                lastObject.style.height = newHeight + 'px';
                lastObject.style.top = newTop + 'px';

                editBox.style.top = (canvasRect.top + newTop * scale - 5) + 'px';
                editBox.style.height = (newHeight * scale + 10) + 'px';
                break;
            }
            case 'tr': {
                let newWidth = initialWidth + diffX;
                let newHeight = initialHeight - diffY;
                let newTop = initialTop + diffY;

                if (Math.round(newTop / 32) * 32 === 0) {
                    newTop = 0;
                    newHeight = initialTop + initialHeight;
                }
                else if (Math.round((newTop - 1080) / 32) * 32 === 0) {
                    newTop = 1080;
                    newHeight = initialTop + initialHeight - 1080;
                }
                if (Math.round((lastObject.offsetLeft + newWidth - 1920) / 32) * 32 === 0) {
                    newWidth = 1920 - lastObject.offsetLeft;
                } else if (Math.round((lastObject.offsetLeft + newWidth) / 32) * 32 === 0) {
                    newWidth = -lastObject.offsetLeft; 
                }

                if (newWidth < 10) newWidth = 10;
                if (newHeight < 10) {
                    newHeight = 10;
                    newTop = initialTop + (initialHeight - 10);
                }

                lastObject.style.width = newWidth + 'px';
                lastObject.style.height = newHeight + 'px';
                lastObject.style.top = newTop + 'px';

                editBox.style.top = (canvasRect.top + newTop * scale - 5) + 'px';
                editBox.style.width = (newWidth * scale + 10) + 'px';
                editBox.style.height = (newHeight * scale + 10) + 'px';
                break;
            }
            case 'ml': {
                let newWidth = initialWidth - diffX;
                let newLeft = initialLeft + diffX;

                if (Math.round(newLeft / 32) * 32 === 0) {
                    newLeft = 0;
                    newWidth = initialLeft + initialWidth;
                }
                else if (Math.round((newLeft - 1920) / 32) * 32 === 0) {
                    newLeft = 1920;
                    newWidth = initialLeft + initialWidth - 1920;
                }

                if (newWidth < 10) {
                    newWidth = 10;
                    newLeft = initialLeft + (initialWidth - 10);
                }

                lastObject.style.width = newWidth + 'px';
                lastObject.style.left = newLeft + 'px';

                editBox.style.left = (canvasRect.left + newLeft * scale - 5) + 'px';
                editBox.style.width = (newWidth * scale + 10) + 'px';
                break;
            }
            case 'mr': {
                let newWidth = initialWidth + diffX;

                if (Math.round((lastObject.offsetLeft + newWidth - 1920) / 32) * 32 === 0) {
                    newWidth = 1920 - lastObject.offsetLeft;
                } else if (Math.round((lastObject.offsetLeft + newWidth) / 32) * 32 === 0) {
                    newWidth = -lastObject.offsetLeft; 
                }

                if (newWidth < 10) newWidth = 10;

                lastObject.style.width = newWidth + 'px';

                editBox.style.width = (newWidth * scale + 10) + 'px';
                break;
            }
            case 'bl': {
                let newWidth = initialWidth - diffX;
                let newLeft = initialLeft + diffX;
                let newHeight = initialHeight + diffY;

                if (Math.round((lastObject.offsetTop + newHeight - 1080) / 32) * 32 === 0) {
                    newHeight = 1080 - lastObject.offsetTop;
                } else if (Math.round((lastObject.offsetTop + newHeight) / 32) * 32 === 0) {
                    newHeight = -lastObject.offsetTop; 
                }
                if (Math.round(newLeft / 32) * 32 === 0) {
                    newLeft = 0;
                    newWidth = initialLeft + initialWidth;
                }
                else if (Math.round((newLeft - 1920) / 32) * 32 === 0) {
                    newLeft = 1920;
                    newWidth = initialLeft + initialWidth - 1920;
                }

                if (newHeight < 10) newHeight = 10; // Minimalus aukštis ||| TODO: make it flip if negative
                if (newWidth < 10) {
                    newWidth = 10;
                    newLeft = initialLeft + (initialWidth - 10);
                }

                lastObject.style.width = newWidth + 'px';
                lastObject.style.height = newHeight + 'px';
                lastObject.style.left = newLeft + 'px';

                editBox.style.left = (canvasRect.left + newLeft * scale - 5) + 'px';
                editBox.style.width = (newWidth * scale + 10) + 'px';
                editBox.style.height = (newHeight * scale + 10) + 'px';
                break;
            }
            case 'bm': {
                let newHeight = initialHeight + diffY;

                if (Math.round((lastObject.offsetTop + newHeight - 1080) / 32) * 32 === 0) {
                    newHeight = 1080 - lastObject.offsetTop;
                } else if (Math.round((lastObject.offsetTop + newHeight) / 32) * 32 === 0) {
                    newHeight = -lastObject.offsetTop; 
                }

                if (newHeight < 10) newHeight = 10; // Minimalus aukštis ||| TODO: make it flip if negative

                lastObject.style.height = newHeight + 'px';

                editBox.style.height = (newHeight * scale + 10) + 'px';
                break;
            }
            case 'br': {
                let newWidth = initialWidth + diffX;
                let newHeight = initialHeight + diffY;

                if (Math.round((lastObject.offsetTop + newHeight - 1080) / 32) * 32 === 0) {
                    newHeight = 1080 - lastObject.offsetTop;
                } else if (Math.round((lastObject.offsetTop + newHeight) / 32) * 32 === 0) {
                    newHeight = -lastObject.offsetTop; 
                }
                if (Math.round((lastObject.offsetLeft + newWidth - 1920) / 32) * 32 === 0) {
                    newWidth = 1920 - lastObject.offsetLeft;
                } else if (Math.round((lastObject.offsetLeft + newWidth) / 32) * 32 === 0) {
                    newWidth = -lastObject.offsetLeft; 
                }

                if (newHeight < 10) newHeight = 10; // Minimalus aukštis ||| TODO: make it flip if negative
                if (newWidth < 10) newWidth = 10;
                
                lastObject.style.width = newWidth + 'px';
                lastObject.style.height = newHeight + 'px';

                editBox.style.width = (newWidth * scale + 10) + 'px';
                editBox.style.height = (newHeight * scale + 10) + 'px';
                break;
            }
            case 'rotate': {
                const dy = e.clientY - centerY;
                const dx = e.clientX - centerX;
                
                // Dabartinis pelės kampas centro atžvilgiu
                const currentMouseAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                
                // Skirtumas tarp pradinio paspaudimo ir dabartinės vietos
                let rotation = initialRotation + (currentMouseAngle - startAngle);

                // Snapping: kas 15 laipsnių (labai patogu vartotojui)
                if (shiftKeyPressed) {
                    rotation = Math.round(rotation / 15) * 15;
                }

                // Pritaikome rotaciją abiem elementams
                lastObject.style.transform = `rotate(${rotation}deg)`;
                editBox.style.transform = `rotate(${rotation}deg)`;
                
                // Svarbu: kad rėmelis „nešokinėtų“, jo transform-origin turi būti centre
                // (Tai geriausia nustatyti CSS: #object-selection-box { transform-origin: center; })
                break;
            }
        }
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

    if (e.key === 'Shift') {
        shiftKeyPressed = true;
    }

    updateLocalSave();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
        shiftKeyPressed = false;
    }
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
            background: obj.style.backgroundColor,
            transform: obj.style.transform
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
                objectEl.style.transform = object.transform;
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