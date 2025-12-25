// ===================== GLOBAL SETTINGS =====================
window._ESP = true;
window._ESP_Sprites = ["Enemy", "Sprite1", "Boss"]; 

// --- NEUE SIZING MODI ---
// "dynamic" = Folgt den Scratch-Bounds (Standard)
// "static"  = Nutzt feste Werte (_StaticWidth / _StaticHeight)
// "resize"  = Berechnet Größe basierend auf Kostüm-Skalierung (sehr präzise)
window._SizeMode = "resize"; 

window._StaticWidth = 40;   // Nur für Modus "static"
window._StaticHeight = 60;  // Nur für Modus "static"

window._BoxPadding = 1.2;   // Puffer um den Sprite (1.0 = eng, 1.5 = locker)
window._OnlyVisibleOnScreen = true; 

// --- BOX SETTINGS ---
window._BoxType = "Corner";        
window._BoxColor = "#FF0000";      
window._BoxThickness = 1.5;         

// --- ÜBRIGE SETTINGS ---
window._Snaplines = true;
window._SnaplineColor = "#00FF00"; 
window._SnaplineOpacity = 0.4;     
window._Crosshair = true;
window._CrosshairSize = 8;
// ============================================================

(function() {
    const startESP = () => {
        const gameCanvas = document.querySelector("canvas");
        if (!gameCanvas || !window.vm || !window.renderer) {
            setTimeout(startESP, 500);
            return;
        }

        const old = document.getElementById("autosize-esp");
        if (old) old.remove();

        const overlay = document.createElement("canvas");
        overlay.id = "autosize-esp";
        overlay.style = "position:absolute; pointer-events:none; z-index:999999;";
        document.body.appendChild(overlay);
        const octx = overlay.getContext("2d");

        function update() {
            if (!gameCanvas) return false;
            const rect = gameCanvas.getBoundingClientRect();
            if (overlay.width !== rect.width || overlay.height !== rect.height) {
                overlay.width = rect.width;
                overlay.height = rect.height;
            }
            overlay.style.left = rect.left + "px";
            overlay.style.top = rect.top + "px";
            return true;
        }

        function draw() {
            requestAnimationFrame(draw);
            if (!window._ESP || !update()) { 
                octx.clearRect(0, 0, overlay.width, overlay.height); 
                return; 
            }

            octx.clearRect(0, 0, overlay.width, overlay.height);

            // Crosshair
            if (window._Crosshair) {
                const mx = overlay.width / 2, my = overlay.height / 2;
                octx.strokeStyle = window._CrosshairColor;
                octx.lineWidth = 1.5;
                octx.beginPath();
                octx.moveTo(mx - window._CrosshairSize, my); octx.lineTo(mx + window._CrosshairSize, my);
                octx.moveTo(mx, my - window._CrosshairSize); octx.lineTo(mx, my + window._CrosshairSize);
                octx.stroke();
            }

            window.vm.runtime.targets.forEach(target => {
                if (target.isStage || !target.visible) return;
                if (!window._ESP_Sprites.includes(target.sprite.name)) return;

                const screenPos = window.renderer.scratchToScreenPosition(target.x, target.y);
                const cx = screenPos[0], cy = screenPos[1];

                if (window._OnlyVisibleOnScreen) {
                    if (cx < 0 || cx > overlay.width || cy < 0 || cy > overlay.height) return;
                }

                let w, h;
                const scaleFactor = overlay.width / 480;

                // --- LOGIK FÜR AUTO-SIZING ---
                if (window._SizeMode === "static") {
                    w = window._StaticWidth * scaleFactor;
                    h = window._StaticHeight * scaleFactor;
                } 
                else if (window._SizeMode === "resize") {
                    // Nutzt die Kostüm-Größe + Scratch Size-Variable
                    const bounds = target.getBounds();
                    const costumeSize = target.size / 100;
                    w = Math.abs(bounds.right - bounds.left) * scaleFactor * costumeSize * window._BoxPadding;
                    h = Math.abs(bounds.top - bounds.bottom) * scaleFactor * costumeSize * window._BoxPadding;
                } 
                else { // "dynamic"
                    const bounds = target.getBounds();
                    w = Math.abs(bounds.right - bounds.left) * scaleFactor * window._BoxPadding;
                    h = Math.abs(bounds.top - bounds.bottom) * scaleFactor * window._BoxPadding;
                }

                const x = cx - w / 2, y = cy - h / 2;

                // Snaplines
                if (window._Snaplines) {
                    octx.strokeStyle = window._SnaplineColor;
                    octx.globalAlpha = window._SnaplineOpacity;
                    octx.beginPath(); octx.moveTo(overlay.width/2, overlay.height); octx.lineTo(cx, cy); octx.stroke();
                    octx.globalAlpha = 1.0;
                }

                // Box
                octx.strokeStyle = window._BoxColor;
                octx.lineWidth = window._BoxThickness;
                if (window._BoxType === "Corner") {
                    const l = w * 0.25;
                    octx.beginPath();
                    octx.moveTo(x, y+l); octx.lineTo(x, y); octx.lineTo(x+l, y);
                    octx.moveTo(x+w-l, y); octx.lineTo(x+w, y); octx.lineTo(x+w, y+l);
                    octx.moveTo(x, y+h-l); octx.lineTo(x, y+h); octx.lineTo(x+l, y+h);
                    octx.moveTo(x+w-l, y+h); octx.lineTo(x+w, y+h); octx.lineTo(x+w, y+h-l);
                    octx.stroke();
                } else {
                    octx.strokeRect(x, y, w, h);
                }

                // Name
                octx.fillStyle = window._BoxColor;
                octx.font = "bold 10px Arial";
                octx.textAlign = "center";
                octx.fillText(target.sprite.name, cx, y - 5);
            });
        }
        draw();
    };
    startESP();
    console.log("ESP V8: Sizing-Mode '" + window._SizeMode + "' geladen.");
})();
