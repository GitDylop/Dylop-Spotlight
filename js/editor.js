// Values
let presentationMode = false;
let activeElement = null;
let offsetX, offsetY;
let scale = 0.55;
let eSlide = 0;
let pSlide = 0;
let initialRotation = 0;
let shiftKeyPressed = false;
let isDataLoaded = false;

async function resetTheEditor() {
    if (!confirm("Ar tikrai norite sukurti naują projektą? Visi nesaugoti pakeitimai bus ištrinti.")) return;

    localStorage.clear();

    try {
        const db = await openDB();
        
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
            console.log("Duomenų bazė išvalyta.");
            location.reload();
        };

        clearRequest.onerror = () => {
            console.error("Klaida valant duomenis.");
            location.reload();
        };

    } catch (err) {
        console.error("Nepavyko pasiekti DB trynimui:", err);
        location.reload();
    }
}


function newSlide() {
    const newSlideObj = {
        id: Date.now(),
        background: "white",
        objects: []
    };

    slidesData.splice(eSlide + 1, 0, newSlideObj);

    const slidesList = document.querySelectorAll('.slide');
    const current = slidesList[eSlide];
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `<p class="slide-number"></p>`;
    slide.onclick = () => openSlide(slide);
    
    current.after(slide);
    
    openSlide(slide);
    refreshSlides();
    
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
    if (isDataLoaded) updateLocalSave();

    document.querySelectorAll('.slide').forEach(s => s.id = '');
    self.id = 'active-slide';
    
    const allSlides = Array.from(document.querySelectorAll('.slide'));
    eSlide = allSlides.indexOf(self);

    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '';
    
    const currentData = slidesData[eSlide];
    if (currentData) {
        canvas.style.backgroundColor = currentData.background || "white";
        if (currentData.objects) {
            currentData.objects.forEach(objData => createObjectFromData(objData));
        }
    }
}

function renderFullSlideList() {
    const slidebar = document.getElementById('slides-list');
    if (!slidebar) return;

    slidebar.innerHTML = '';

    console.log(slidesData);
    slidesData.forEach((slideObj, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = 'slide';
        
        if (index === eSlide) {
            slideEl.id = 'active-slide';
        }

        slideEl.innerHTML = `<p class="slide-number">${index + 1}</p>`;
        
        slideEl.onclick = () => openSlide(slideEl);
        
        slidebar.appendChild(slideEl);
    });
}


function addObject(type) {
    const canvas = document.getElementById('canvas');
    const object = document.createElement('div');
    const objectEditor = document.createElement('div');
    object.className = 'object';
    objectEditor.className = 'object-editor';

    const bg_color = document.getElementById('bg-color-selector').value;
    const txt_color = document.getElementById('txt-color-selector').value;
    const font_size = document.getElementById('font-size-input').value;
    // const font = document.getElementById('font-selector').value;
    // const bo_color = document.getElementById('bo-color-selector').value;

    object.style.position = 'absolute';
    object.style.display = 'flex';
    object.style.alignItems = 'center'; 
    object.style.justifyContent = 'center';
    object.style.flexDirection = 'column';
    object.style.left = '810px';
    object.style.top = '390px';
    object.style.alignItems = 'center';
    object.style.textAlign = 'center';
    object.style.fontSize = font_size + 'px';
    object.style.color = txt_color;

    switch (type) {
        case 'rect':
            object.style.width = '300px';
            object.style.height = '300px';
            object.style.backgroundColor = bg_color;
            break;
        case 'textfield':
            object.style.width = '300px';
            object.style.height = '30px';
            object.style.backgroundColor = 'transparent';
            object.innerHTML = 'Text';
            break;
    }

    canvas.appendChild(object);

    updateLocalSave();
}

function addImageFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            createImageObject(event.target.result);
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function createImageObject(src) {
    const canvas = document.getElementById('canvas');
    
    const img = new Image();
    img.src = src;

    img.onload = function() {
        const obj = document.createElement('div');
        obj.className = 'object image-object';
        
        obj.style.position = 'absolute';
        obj.style.left = '100px';
        obj.style.top = '100px';

        let width = img.naturalWidth;
        let height = img.naturalHeight;

        obj.style.width = width + 'px';
        obj.style.height = height + 'px';
        
        obj.style.backgroundImage = `url(${src})`;
        
        obj.dataset.src = src; 

        canvas.appendChild(obj);
        updateLocalSave();
    };

    img.onerror = function() {
        console.error("Nepavyko užkrauti paveikslėlio iš: " + src);
    };
}





let activeMenu = null;
function showMenu(self) {
    activeMenu = self.querySelector('.tb-dropdown') || self.querySelector('.h-dropdown');
    activeMenu.style.display = 'block';
}

function hideMenu() {
    if (activeMenu) {
        activeMenu.style.display = 'none';
    }
}

function createObjectFromData(data) {
    const canvas = document.getElementById('canvas');
    const obj = document.createElement('div');
    obj.className = 'object';
    
    obj.style.position = 'absolute';
    obj.style.width = data.width + 'px';
    obj.style.height = data.height + 'px';
    obj.style.left = data.x + 'px';
    obj.style.top = data.y + 'px';
    obj.style.backgroundColor = data.background;
    obj.style.backgroundImage = data.backgroundImage;
    obj.style.color = data.color;
    obj.style.transform = data.transform;
    obj.style.fontSize = data.fontSize;
    obj.style.fontFamily = data.font;
    obj.style.justifyContent = data.textHAlign;
    obj.style.alignItems = data.textVAlign;
    obj.style.display = 'flex';
    
    obj.innerHTML = data.content;
    obj.setAttribute('spellcheck', 'false');

    canvas.appendChild(obj);
}

const editBox = document.getElementById('object-selection-box');
let lastObject = null;

async function updateLocalSave() {
    if (!isDataLoaded) return;

    const activeSlideEl = document.getElementById('active-slide');
    if (!activeSlideEl) return;

    const objects = document.querySelectorAll('.object');
    const currentObjects = Array.from(objects).map((obj, index) => {
        let w = parseInt(obj.style.width) || obj.offsetWidth;
        let h = parseInt(obj.style.height) || obj.offsetHeight;

        return {
            id: index,
            x: parseInt(obj.style.left) || 0,
            y: parseInt(obj.style.top) || 0,
            width: w > 0 ? w : 300,
            height: h > 0 ? h : 300,
            background: obj.style.backgroundColor,
            backgroundImage: obj.style.backgroundImage,
            color: obj.style.color,
            transform: obj.style.transform,
            content: obj.innerHTML,
            textHAlign: obj.style.justifyContent,
            textVAlign: obj.style.alignItems,
            fontSize: obj.style.fontSize,
            font: obj.style.fontFamily
        };
    });

    if (!slidesData[eSlide]) {
        slidesData[eSlide] = { id: Date.now(), background: "white", objects: [] };
    }
    
    slidesData[eSlide].objects = currentObjects;
    slidesData[eSlide].background = document.getElementById('canvas').style.backgroundColor;

    const fullProject = {
        title: document.getElementById('project-title')?.value || "Untitled",
        author: "Dovydas",
        content: slidesData
    };

    localStorage.setItem("data", JSON.stringify(fullProject));
    await saveToDB("current_project", fullProject);
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


function changeFontSize(action) {
    if (!lastObject) return;

    let currentSize = parseInt(lastObject.style.fontSize) || 
                      parseInt(window.getComputedStyle(lastObject).fontSize) || 32;
    let newSize;

    if (action === 'increase') {
        newSize = currentSize + 2;
    } else if (action === 'decrease') {
        newSize = currentSize - 2;
    }

    if (newSize) {
        lastObject.style.fontSize = newSize + 'px';
        fontSizeInput.value = newSize;
        updateLocalSave();
    }
}

window.onload = async () => {
    let savedData = await loadFromDB("current_project");

    if (savedData) {
        if (savedData.content && Array.isArray(savedData.content)) {
            slidesData = savedData.content;
            if (document.getElementById('project-title')) {
                document.getElementById('project-title').value = savedData.title || "Untitled";
            }
        } else if (Array.isArray(savedData)) {
            slidesData = savedData;
        }
    }

    if (!slidesData || slidesData.length === 0) {
        slidesData = [{ id: Date.now(), background: "white", objects: [] }];
    }

    renderFullSlideList(); 

    const firstSlideEl = document.querySelector('.slide');
    if (firstSlideEl) {
        openSlide(firstSlideEl);
    }

    setTimeout(() => { isDataLoaded = true; }, 100);
};