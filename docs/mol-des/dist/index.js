"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const canvas = document.getElementById('canvas');
const ctx = (() => {
    let possibleContext = canvas.getContext('2d');
    if (possibleContext)
        return possibleContext;
    else
        throw new Error('failed to get 2d contex');
})();
//1 = default draw
let action = 1;
let isPerfroming = false;
let startActionPos = { x: 0, y: 0 };
let endActionPos = { x: 0, y: 0 };
let atoms = [];
let tempAtoms = [];
function resize() {
    canvas.width = window.innerWidth + 1;
    let canvasTop = window.scrollY + canvas.getBoundingClientRect().top;
    canvas.height = window.innerHeight - canvasTop + 1;
}
window.addEventListener('resize', () => { resize(), refresh(); });
resize();
const buttons = [];
for (let i = 0; i < 4; i++) {
    buttons.push(document.getElementById("but" + i));
    buttons[i].addEventListener('mousedown', (e) => {
        e.preventDefault();
        buttons[action].style.backgroundColor = "rgb(50, 50, 50)";
        buttons[i].style.backgroundColor = "rgb(160, 40, 40)";
        action = i;
    });
}
buttons[1].style.backgroundColor = "rgb(160, 40, 40)";
function performAction() {
    if (action == 1) {
        const s = 45;
        let d = { x: endActionPos.x - startActionPos.x,
            y: endActionPos.y - startActionPos.y };
        tempAtoms = [tempAtoms[0]];
        tempAtoms[0].bonds = [];
        let ang = Math.atan(-d.x / d.y);
        let diag = { x: Math.cos(ang) * 30, y: Math.sin(ang) * 30 };
        let dist = Math.sqrt(d.x * d.x + d.y * d.y);
        for (let i = 1; i < dist / s; i++) {
            let p = { x: startActionPos.x + d.x * i / ((dist - dist % s) / s),
                y: startActionPos.y + d.y * i / ((dist - dist % s) / s) };
            tempAtoms[i - 1].bonds.push({ o: i, n: 1 });
            tempAtoms.push({ e: 'C', pos: p, bonds: [{ o: i - 1, n: 1 }] });
            //create zig-zag
            if (i % 2 == 1 && dist / s > 2) {
                let k = Math.sign(d.y) + Number(d.y == 0);
                tempAtoms[i].pos.x += diag.x * k;
                tempAtoms[i].pos.y += diag.y * k;
            }
        }
    }
    if (action == 2) {
        for (let i = 0; i < atoms.length; i++) {
            let dx = endActionPos.x - atoms[i].pos.x;
            let dy = endActionPos.y - atoms[i].pos.y;
            if (dx * dx + dy * dy > 25 * 25)
                continue;
            atoms.splice(i, 1);
            atoms.forEach(a => {
                for (let b = 0; b < a.bonds.length; b++) {
                    if (a.bonds[b].o == i) {
                        a.bonds.splice(b, 1);
                        b--;
                    }
                    else if (a.bonds[b].o > i)
                        a.bonds[b].o--;
                }
            });
            i--;
        }
    }
    refresh();
}
canvas.addEventListener('mousedown', (e) => {
    if (isPerfroming || e.button != 0)
        return;
    startActionPos = { x: e.offsetX, y: e.offsetY };
    endActionPos = { x: e.offsetX, y: e.offsetY };
    isPerfroming = true;
    if (action == 1) {
        tempAtoms.push({ pos: startActionPos, e: 'C', bonds: [] });
        refresh();
    }
    if (action == 2)
        performAction();
});
let lastCall = performance.now();
canvas.addEventListener('mousemove', (e) => {
    let now = performance.now();
    if (!isPerfroming || (now - lastCall) < 1000 / 60)
        return;
    lastCall = now;
    endActionPos = { x: e.offsetX, y: e.offsetY };
    performAction();
});
function finalizeAction() {
    return __awaiter(this, void 0, void 0, function* () {
        isPerfroming = false;
        if (action == 1) {
            let initAtoms = atoms.length;
            for (let a = 0; a < tempAtoms.length; a++) {
                tempAtoms[a].bonds.forEach((b) => { b.o += initAtoms; });
                atoms.push(tempAtoms[a]);
            }
            tempAtoms = [];
            refresh();
        }
        if (action == 2)
            refresh();
        else if (action == 3) {
            refresh();
            let x = Math.min(startActionPos.x, endActionPos.x);
            let y = Math.min(startActionPos.y, endActionPos.y);
            let w = Math.abs(endActionPos.x - startActionPos.x);
            let h = Math.abs(endActionPos.y - startActionPos.y);
            if (w == 0 || h == 0)
                return;
            let data = ctx.getImageData(x, y, w, h).data;
            for (let i = 0; i < data.length; i += 4) {
                let c = 255 - data[i] * (data[i + 3] / 255);
                data[i + 0] = c;
                data[i + 1] = c;
                data[i + 2] = c;
                data[i + 3] = 255;
            }
            const offscreenCanvas = new OffscreenCanvas(w, h);
            const offscreenCtx = offscreenCanvas.getContext("2d");
            if (!offscreenCtx) {
                console.log("failed to get offscreen context");
                return;
            }
            offscreenCtx.putImageData(new ImageData(data, w, h), 0, 0);
            try {
                const blob = yield offscreenCanvas.convertToBlob({ type: "image/png" });
                yield navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            }
            catch (err) {
                console.error("failed to copy image:", err);
            }
        }
    });
}
canvas.addEventListener('mouseup', (e) => {
    if (isPerfroming && e.button == 0)
        finalizeAction();
});
canvas.addEventListener('mouseenter', (e) => {
    if (isPerfroming && !(e.buttons % 2))
        finalizeAction();
});
function refresh() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "24px Arial";
    ctx.strokeStyle = "rgb(255, 255, 255)";
    drawAtoms(atoms);
    if (!isPerfroming)
        return;
    if (action == 1)
        drawAtoms(tempAtoms);
    if (action == 2) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.beginPath();
        ctx.arc(endActionPos.x, endActionPos.y, 25, 0, 2 * Math.PI);
        ctx.fill();
    }
    else if (action == 3) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = "rgb(255, 255, 255)";
        let w = endActionPos.x - startActionPos.x;
        let h = endActionPos.y - startActionPos.y;
        ctx.fillRect(startActionPos.x, startActionPos.y, w, h);
    }
}
function drawAtoms(as) {
    const subscripts = [
        "₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"
    ];
    as.forEach((a, i) => {
        if (a.e == 'C' && a.bonds.length < 2) {
            let txt, dx = ctx.measureText('C').width / 2;
            if (a.bonds.length == 1 && a.pos.x < as[a.bonds[0].o].pos.x) {
                txt = 'H' + subscripts[4 - a.bonds.length] + 'C';
                dx = ctx.measureText(txt).width - dx;
            }
            else
                txt = 'CH' + subscripts[4 - a.bonds.length];
            let size = ctx.measureText('C');
            ctx.fillText(txt, a.pos.x - dx, a.pos.y + 9);
        }
        else if (a.e != 'C') {
            let size = ctx.measureText(a.e);
            ctx.fillText(a.e, a.pos.x - size.width / 2, a.pos.y + 9);
        }
        for (let b = 0; b < a.bonds.length; b++) {
            if (i < a.bonds[b].o)
                continue;
            drawBond(a, as[a.bonds[b].o]);
        }
    });
}
function drawBond(a1, a2) {
    let { x: x1, y: y1 } = a1.pos;
    let { x: x2, y: y2 } = a2.pos;
    let ang = Math.atan((y2 - y1) / (x2 - x1));
    if (x2 < x1)
        ang = Math.PI + ang;
    if ((a1.e == 'C' && a1.bonds.length < 2) || a1.e != 'C') {
        x1 += 12 * Math.cos(ang);
        y1 += 12 * Math.sin(ang);
    }
    if ((a2.e == 'C' && a2.bonds.length < 2) || a2.e != 'C') {
        x2 -= 12 * Math.cos(ang);
        y2 -= 12 * Math.sin(ang);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
