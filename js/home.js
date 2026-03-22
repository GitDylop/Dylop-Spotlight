function loadMainMenu() {
    const docList = document.getElementById("document-list");
    for (let i = 0; i < 10; i++) {
        const docButton = document.createElement("div");
        docButton.className = "document-list-button";
        docButton.innerHTML = `
            <img src="">
            <h1>Document ${i + 1}</h1>
            <p>Last edited: Today</p>
        `;
        docList.appendChild(docButton);
    }
}

window.onload = loadMainMenu;