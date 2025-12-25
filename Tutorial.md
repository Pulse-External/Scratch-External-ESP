# 🛠️ Advanced Scratch/TurboWarp ESP System (V8)

A high-performance, lightweight, and highly customizable ESP (Extra Sensory Perception) overlay for Scratch-based games. This tool provides tactical visualization including bounding boxes, snaplines, and crosshairs.

---

## 🚀 Features

* **3 Sizing Modes**: Choose between `static`, `dynamic`, and `resize` for perfect box fitting.
* **Smart Filtering**: Automatically hides ESP for off-screen clones.
* **Precision Crosshair**: Customizable central aiming aid.
* **Snaplines**: Visual indicators connecting you to your targets.
* **Performance Optimized**: Low-latency rendering using HTML5 Canvas.

---

## 📥 How to use

1.  Open your favorite Scratch or TurboWarp game.
2.  Press `F12` to open the **Developer Tools**.
3.  Navigate to the **Console** tab.
4.  Paste the script (see code below) and press `Enter`.

---

## ⚙️ Configuration (Global Settings)

You can modify these variables directly in the console at any time:

| Variable | Description | Options |
| :--- | :--- | :--- |
| `window._SizeMode` | Calculation method for boxes. | `"resize"`, `"dynamic"`, `"static"` |
| `window._BoxType` | Visual style of the frame. | `"Corner"`, `"Full"` |
| `window._BoxColor` | Color of the ESP. | Hex (e.g., `"#FF0000"`) |
| `window._BoxPadding`| Margin around the sprite. | `1.0` to `2.0` |
| `window._Snaplines` | Toggle target lines. | `true` / `false` |
| `window._OnlyVisibleOnScreen`| Hide off-screen targets. | `true` / `false` |

---

## 📜 The Script

```javascript
// ===================== GLOBAL SETTINGS =====================
window._ESP = true;
window._ESP_Sprites = ["Enemy", "Sprite1", "Boss"]; 

window._SizeMode = "resize"; // "resize", "static", "dynamic"
window._StaticWidth = 40;   
window._StaticHeight = 60;  
window._BoxPadding = 1.2;   
window._OnlyVisibleOnScreen = true; 

window._BoxType = "Corner";        
window._BoxColor = "#FF0000";      
window._BoxThickness = 1.5;         

window._Snaplines = true;
window._SnaplineColor = "#00FF00"; 
window._SnaplineOpacity = 0.4;     

window._Crosshair = true;
window._CrosshairColor = "#FFFFFF"; 
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

                if (window._SizeMode === "static") {
                    w = window._StaticWidth * scaleFactor;
                    h = window._StaticHeight * scaleFactor;
                } else if (window._SizeMode === "resize") {
                    const bounds = target.getBounds();
                    const costumeSize = target.size / 100;
                    w = Math.abs(bounds.right - bounds.left) * scaleFactor * costumeSize * window._BoxPadding;
                    h = Math.abs(bounds.top - bounds.bottom) * scaleFactor * costumeSize * window._BoxPadding;
                } else {
                    const bounds = target.getBounds();
                    w = Math.abs(bounds.right - bounds.left) * scaleFactor * window._BoxPadding;
                    h = Math.abs(bounds.top - bounds.bottom) * scaleFactor * window._BoxPadding;
                }

                const x = cx - w / 2, y = cy - h / 2;

                if (window._Snaplines) {
                    octx.strokeStyle = window._SnaplineColor;
                    octx.globalAlpha = window._SnaplineOpacity;
                    octx.beginPath(); octx.moveTo(overlay.width/2, overlay.height); octx.lineTo(cx, cy); octx.stroke();
                    octx.globalAlpha = 1.0;
                }

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

                octx.fillStyle = window._BoxColor;
                octx.font = "bold 10px Arial";
                octx.textAlign = "center";
                octx.fillText(target.sprite.name, cx, y - 5);
            });
        }
        draw();
    };
    startESP();
})();
