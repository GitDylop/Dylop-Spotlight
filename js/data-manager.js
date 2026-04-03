const DB_NAME = "DylopSpotlightDB";
const STORE_NAME = "presentations";

async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("Nepavyko atidaryti IndexedDB");
    });
}

async function saveToDB(key, data) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(data, key);
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve();
        });
    } catch (err) {
        console.error("Išsaugojimo klaida:", err);
    }
}

async function loadFromDB(key) {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
        });
    } catch (err) {
        console.error("Užkrovimo klaida:", err);
        return null;
    }
}


async function exportAsDSPOT() {
    updateLocalSave();

    const zip = new JSZip();

    const presentationName = document.getElementById('project-title')?.value || "Untitled";

    try {
        const jsonData = JSON.stringify(await loadFromDB("current_project"), null, 2);
        zip.file("data.json", jsonData);
        const content = await zip.generateAsync({ type: "blob" });

        const url = URL.createObjectURL(content);
        const link = document.createElement("a");
        
        link.href = url;
        link.download = `${presentationName}.dspot`; 
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Exporting error:", error);
        alert("Failed to export .dspot file.");
    }
}


async function importFromDSPOT() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.dspot';

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const zip = await JSZip.loadAsync(file);
            const jsonFile = await zip.file("data.json").async("string");
            const data = JSON.parse(jsonFile);
            
            if (!data.content) throw new Error("Invalid format");

            await saveToDB("current_project", data);
            localStorage.setItem("data", JSON.stringify(data));
            
            location.reload(); 
        } catch (err) {
            console.error("Import error:", err);
            alert("Klaida: Failas sugadintas arba neteisingo formato.");
        }
    };
    input.click();
}