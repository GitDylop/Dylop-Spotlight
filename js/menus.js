const eMenu = document.getElementById('editor-context');
const sMenu = document.getElementById('slidebar-context');
///////////////////////////////////////////////////////////////////////////////////////////
let targetElement = null;
///////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener('contextmenu', (e) => {
    eMenu.style.display = 'none';
    sMenu.style.display = 'none';
    e.preventDefault();
    targetElement = e.target;
    if (e.target.classList.contains('object')) {
        eMenu.style.display = 'block';
        eMenu.style.left = e.pageX + 'px';
        eMenu.style.top = e.pageY + 'px';
    }
    else if (e.target.classList.contains('slide')) {
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