import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm";

const nameInput = document.getElementById("nameInput");
const photoInput = document.getElementById("photoInput");
const createBtn = document.getElementById("createBtn");
const statusBox = document.getElementById("status");
const photo = document.getElementById("studentPhoto");
const placeholder = document.getElementById("photoPlaceholder");
const cardName = document.getElementById("cardName");

const toDataURL = blob => new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(blob);
});

// name ko card ki width mein fit karta hai
function fitName() {
    let size = 46;
    cardName.style.fontSize = size + "px";
    while (cardName.scrollWidth > cardName.clientWidth && size > 18) {
        size -= 2;
        cardName.style.fontSize = size + "px";
    }
}

createBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const file = photoInput.files[0];

    if (!name || !file) {
        statusBox.textContent = "Please enter your name and upload a selfie.";
        return;
    }

    cardName.textContent = name;
    fitName();

    createBtn.disabled = true;
    statusBox.textContent = "Removing background... please wait (first time can take a minute)";

    let url;
    try {
        const blob = await removeBackground(file, {
            output: { format: "image/png" },
            progress: (key, cur, total) => {
                if (key.startsWith("fetch")) {
                    statusBox.textContent = "Loading AI model... " + Math.round(cur / total * 100) + "%";
                } else {
                    statusBox.textContent = "Removing background...";
                }
            }
        });
        url = await toDataURL(blob);
        statusBox.textContent = "Your card is ready!";
    } catch (err) {
        console.error(err);
        url = await toDataURL(file);
        statusBox.textContent = "Background removal failed, original photo used. Check internet and try again.";
    }

    photo.src = url;
    photo.style.display = "block";
    placeholder.style.display = "none";
    createBtn.disabled = false;
});

document.getElementById("downloadBtn").addEventListener("click", () => {
    html2canvas(document.getElementById("fresherCard"), { backgroundColor: null, scale: 2 })
        .then(canvas => {
            const a = document.createElement("a");
            a.download = "fresher-card.png";
            a.href = canvas.toDataURL("image/png");
            a.click();
        });
});