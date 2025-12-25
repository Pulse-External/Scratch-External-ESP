// ===================== GLOBAL ESP SETTINGS =====================
window._ESP = true;              
window._IncludeClones = true;    
window._OnlyClones = false;      
window._Color = "#FF0000";       
window._BoxType = "Corner";      
window._BoxFilled = false;       
window._BoxStatic = false;       
window._OnlyVisibleOnScreen = true;  

window._ESP_Sprites = [
    "Sprite1",
    "Sprite2",
    "Enemy",
    "Boss"
];
// ================================================================

(function() {
    if (!window.vm || !window.renderer) return;

    const gameCanvas = document.querySelector("canvas");
    if (!gameCanvas) return;

    const overlay = document.createElement("canvas");
    overlay.style.position = "absolute";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = 999999;
    document.body.appendChild(overlay);
    const octx = overlay.getContext("2d");

    function updateOverlayPos() {
        const rect = gameCanvas.getBoundingClientRect();
        overlay.style.left = rect.left + "px";
        overlay.style.top = rect.top + "px";
        overlay.width = rect.width;
        overlay.height = rect.height;
    }

    updateOverlayPos();
    window.addEventListener("resize", updateOverlayPos);
    window.addEventListener("scroll", updateOverlayPos);

    const renderer = window.renderer;
    const vm = window.vm;

    function drawCornerESP(x, y, w, h) {
        const len = Math.min(w, h) * 0.25;
        octx.strokeStyle = window._Color;
        octx.lineWidth = 2;
        octx.beginPath();

        octx.moveTo(x, y); octx.lineTo(x + len, y);
        octx.moveTo(x, y); octx.lineTo(x, y + len);

        octx.moveTo(x + w, y); octx.lineTo(x + w - len, y);
        octx.moveTo(x + w, y); octx.lineTo(x + w, y + len);

        octx.moveTo(x, y + h); octx.lineTo(x + len, y + h);
        octx.moveTo(x, y + h); octx.lineTo(x, y + h - len);

        octx.moveTo(x + w, y + h); octx.lineTo(x + w - len, y + h);
        octx.moveTo(x + w, y + h); octx.lineTo(x + w, y + h - len);

        octx.stroke();
    }

    function drawESP() {
        requestAnimationFrame(drawESP);

        // Wenn ESP deaktiviert ist, Overlay leeren
        if (!window._ESP) {
            octx.clearRect(0, 0, overlay.width, overlay.height);
            return;
        }

        updateOverlayPos();
        octx.clearRect(0, 0, overlay.width, overlay.height);

        vm.runtime.targets.forEach(target => {
            if (target.isStage) return;               
            if (!target.visible) return;
            if (typeof target.x !== "number" || typeof target.y !== "number") return;
            if (!window._IncludeClones && target.isOriginal === false) return;
            if (window._OnlyClones && target.isOriginal !== false) return;
            if (!window._ESP_Sprites.includes(target.sprite.name)) return;

            const bounds = target.getBounds();
            if (!bounds || (bounds.right - bounds.left <= 0) || (bounds.top - bounds.bottom <= 0)) return;

            const [cx, cy] = renderer.scratchToScreenPosition(target.x, target.y);

            if (window._OnlyVisibleOnScreen) {
                if (cx + bounds.right < 0 || cx - bounds.left > overlay.width) return;
                if (cy + bounds.bottom < 0 || cy - bounds.top > overlay.height) return;
            }

            let w = Math.abs(bounds.right - bounds.left) * 1.75;
            let h = Math.abs(bounds.top - bounds.bottom) * 1.5;

            if (window._BoxStatic) { w = 80; h = 100; }

            w *= overlay.width / renderer.defaultWidth;
            h *= overlay.height / renderer.defaultHeight;

            const x = cx - w / 2;
            const y = cy - h / 2;

            if (window._BoxFilled) {
                octx.globalAlpha = 0.25;
                octx.fillStyle = window._Color;
                octx.fillRect(x, y, w, h);
                octx.globalAlpha = 1;
            }

            if (window._BoxType === "Full") {
                octx.strokeStyle = window._Color;
                octx.lineWidth = 2;
                octx.strokeRect(x, y, w, h);
            }

            if (window._BoxType === "Corner") {
                drawCornerESP(x, y, w, h);
            }
        });
    }
    
    drawESP();
    console.log("External ESP | PulseExternal");
})();
