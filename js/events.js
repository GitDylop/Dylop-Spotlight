document.addEventListener('mousedown', (e) => {
    if (presentationMode) {
        changeSlide('next');
    }
    else {
        const isClickingActiveObject = (e.target === lastObject && editBox.style.display === 'block');
        const protectedClasses = ['toolbar', 'h-dropdown', 'h-dropdown-item'];

        if (e.target.classList.contains('object')) {
            if (isClickingActiveObject) {
                e.target.contentEditable = true;
                e.target.focus();
                activeElement = null; 
                return;
            }

            activeElement = e.target;
            lastObject = activeElement;
            
            document.querySelectorAll('.object').forEach(obj => obj.contentEditable = false);

            offsetX = e.clientX / scale - activeElement.offsetLeft;
            offsetY = e.clientY / scale - activeElement.offsetTop;

            const rect = activeElement.getBoundingClientRect();
            editBox.style.display = 'block';
            editBox.style.left = rect.left - 5 + 'px';
            editBox.style.top = rect.top - 5 + 'px';
            editBox.style.width = activeElement.offsetWidth * scale + 10 + 'px';
            editBox.style.height = activeElement.offsetHeight * scale + 10 + 'px';
            
            editBox.style.transform = activeElement.style.transform || "rotate(0deg)";


            const bg_selector = document.getElementById('bg-color-selector');
            const txt_selector = document.getElementById('txt-color-selector');
            const fs_selector = document.getElementById('font-size-input');
            bg_selector.value = activeElement.style.backgroundColor;
            txt_selector.value = activeElement.style.color;
            fs_selector.value = activeElement.style.fontSize.replace('px', '');
        }
        else if (e.target.classList.contains('osb-round-handle')) {
            activeElement = e.target;
            const side = activeElement.getAttribute('side');

            if (side === 'rotate') {
                const rect = lastObject.getBoundingClientRect();
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
                const dy = e.clientY - centerY;
                const dx = e.clientX - centerX;
                startAngle = Math.atan2(dy, dx) * (180 / Math.PI);
                const style = lastObject.style.transform;
                const match = style.match(/rotate\(([^deg]+)deg\)/);
                initialRotation = match ? parseFloat(match[1]) : 0;
            }
            
            initialWidth = lastObject.offsetWidth;
            initialHeight = lastObject.offsetHeight;
            initialTop = lastObject.offsetTop;
            initialLeft = lastObject.offsetLeft;
            initialMouseX = e.clientX / scale; 
            initialMouseY = e.clientY / scale; 

            editBox.style.display = 'block';
        }
        else {
            const isProtected = protectedClasses.some(className => e.target.closest(`.${className}`));
            
            const isToolbar = document.getElementById('toolbar').contains(e.target);

            if (!isProtected && !isToolbar) {
                editBox.style.display = 'none';
                activeElement = null;
                lastObject = null;
                
                document.querySelectorAll('.object').forEach(obj => obj.contentEditable = false);
                hideMenu();
            }
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


const colorPickers = document.querySelectorAll('input[type="color"]');

colorPickers.forEach(picker => {
    picker.addEventListener('input', (e) => {
        if (!lastObject) return;

        const newBackgroundColor = document.getElementById('bg-color-selector').value;
        const newTextColor = document.getElementById('txt-color-selector').value;
        
        lastObject.style.backgroundColor = newBackgroundColor;
        lastObject.style.color = newTextColor;
    });

    picker.addEventListener('change', () => {
        updateLocalSave();
    });
});


const fontSizeInput = document.getElementById('font-size-input');

fontSizeInput.addEventListener('input', () => {
    if (!lastObject) return;
    
    let val = fontSizeInput.value;
    
    if (val < 1) val = 1; 

    lastObject.style.fontSize = val + 'px';
    
    updateLocalSave();
});


const projectTitle = document.getElementById('project-title');

projectTitle.addEventListener('input', () => {
    if (projectTitle.value.length > 0) {

    }
    
    updateLocalSave();
});