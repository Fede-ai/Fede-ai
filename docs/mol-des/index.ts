const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = (() => {
	let possibleContext = canvas.getContext('2d');

	if (possibleContext)
		return possibleContext;
	else
		throw new Error('failed to get 2d contex');
})();

type Point = { x: number, y: number };
type Bond = { o: number, n: number };
type Atom = { pos: Point, e: string, bonds: Bond[] };

//1 = default draw
let action: number = 1;
let isPerfroming: boolean = false;
let startActionPos: Point = { x: 0, y: 0};
let endActionPos: Point = { x: 0, y: 0};

let atomSelected: number = -1;
let bondSelected = { a1: -1, a2: -1 }

let atoms: Atom[] = [];
let indexTemp: number = -1;
let branchingOff = -1, branchingInto = -1;

function resize() {
	canvas.width = window.innerWidth + 1;
	let canvasTop = window.scrollY + canvas.getBoundingClientRect().top;
	canvas.height = window.innerHeight - canvasTop + 1;
}
window.addEventListener('resize', () => { resize(), refresh() });
resize();

const buttons: HTMLDivElement[] = [];
for (let i = 0; i < 6; i++) {
	buttons.push(document.getElementById("but" + i) as HTMLDivElement);
	buttons[i].addEventListener('mousedown', (e) => {
		e.preventDefault();
		buttons[action].style.backgroundColor = "rgb(50, 50, 50)";
		buttons[i].style.backgroundColor = "rgb(160, 40, 40)"
		action = i;
	})
}
buttons[1].style.backgroundColor = "rgb(160, 40, 40)";

function performAction() {
	if (action == 0) {
		if (atomSelected != -1 && atomSelected < atoms.length) {
			atoms[atomSelected].pos = endActionPos;
		}
		else {

		}
	}
	if (action == 1) {
		const s: number = 45;
		let d: Point = { x: endActionPos.x - startActionPos.x, 
			y: endActionPos.y - startActionPos.y };

		atoms = atoms.slice(0, indexTemp);
		//remove bonds that branchingOff makes with a temporary atom
		//or with the atom that it is branchingInto
		for (let b = 0; b < atoms[branchingOff].bonds.length; b++) {
			if (atoms[branchingOff].bonds[b].o >= indexTemp ||
				atoms[branchingOff].bonds[b].o == branchingInto) {
				atoms[branchingOff].bonds.splice(b, 1);
				break;
			}
		}
		//do the same but for the branchingInto atom
		if (branchingInto != -1) {
			for (let b = 0; b < atoms[branchingInto].bonds.length; b++) {
				if (atoms[branchingInto].bonds[b].o >= indexTemp || 
					atoms[branchingInto].bonds[b].o == branchingOff) {
					atoms[branchingInto].bonds.splice(b, 1);
					break;
				}
			}
		}

		let ang = Math.atan(-d.x/d.y);
		let diag: Point = { x: Math.cos(ang)*30, y: Math.sin(ang)*30 }

		let dist = Math.sqrt(d.x*d.x + d.y*d.y);
		for (let i = 1; i < dist / s; i++) {
			let p: Point = { x: startActionPos.x + d.x * i / ((dist - dist % s) / s), 
				y: startActionPos.y + d.y * i / ((dist - dist % s) / s) }
			
			if (i == 1) {
				atoms[branchingOff].bonds.push({ o: indexTemp, n: 0 });
				atoms.push({ e: 'C', pos: p, bonds: [{o: branchingOff, n: 0}]})
			} else {
				atoms[indexTemp + i - 2].bonds.push({ o: indexTemp + i - 1, n: 0 });
				atoms.push({ e: 'C', pos: p, bonds: [{o: indexTemp + i - 2, n: 0}]})
			}
			
			//create zig-zag
			if (i % 2 == 1 && dist / s > 2) {
				let k = Math.sign(d.y) + Number(d.y == 0);
				atoms[indexTemp + i - 1].pos.x += diag.x * k;
				atoms[indexTemp + i - 1].pos.y += diag.y * k;
			}
		}			

		//branch into
		if (atomSelected != -1 && atomSelected != branchingOff) {
			branchingInto = atomSelected;
			//connect directly without creating any atom
			if (dist / s < 1) {
				atoms[branchingOff].bonds.push({ o: branchingInto, n: 0 });
				atoms[branchingInto].bonds.push({ o: branchingOff, n: 0 });
			}
			//an atom was created but a direct connection is needed instead
			else if (dist / s < 2) {
				atoms.pop()
				atoms[branchingOff].bonds[atoms[branchingOff].bonds.length - 1].o = branchingInto;
				atoms[branchingInto].bonds.push({ o: branchingOff, n: 0 });
			} 
			//some atoms were created (erase one to create connection)
			else {
				atoms.pop()
				atoms[atoms.length - 1].bonds[1].o = branchingInto;
				atoms[branchingInto].bonds.push({ o: atoms.length - 1, n: 0 });
			}
		}
	}
	if (action == 2) {
		for (let i = 0; i < atoms.length; i++) {
			let dx = endActionPos.x - atoms[i].pos.x;
			let dy = endActionPos.y - atoms[i].pos.y;
			if (dx*dx + dy*dy > 25*25)
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
			})
			i--;
		}
	}
	if (action == 5 && bondSelected.a1 != -1) {
		let {a1, a2} = bondSelected;
		for (let b = 0; b < atoms[a1].bonds.length; b++) {
			if (atoms[a1].bonds[b].o == a2) {
				atoms[a1].bonds[b].n = (atoms[a1].bonds[b].n + 1) % 3;
				break;
			}
		}
		for (let b = 0; b < atoms[a2].bonds.length; b++) {
			if (atoms[a2].bonds[b].o == a1) {
				atoms[a2].bonds[b].n = (atoms[a2].bonds[b].n + 1) % 3;
				break;
			}
		}
	}

	refresh();
}
function selectAtom(e: MouseEvent) {
	if ((isPerfroming && action == 0) || action == 2)
		return;

	if (action == 5) {
		let closest = { a1: -1, a2: -1 }, shortestDist = 15*15;
		for (let a = 0; a < atoms.length; a++) {
			for (let b = 0; b < atoms[a].bonds.length; b++) {
				if (a < atoms[a].bonds[b].o)
					continue;

				let p1 = atoms[a].pos, p2 = atoms[atoms[a].bonds[b].o].pos;
				if (e.offsetX < Math.min(p1.x, p2.x) || e.offsetX > Math.max(p1.x, p2.x) ||
					e.offsetY < Math.min(p1.y, p2.y) || e.offsetY > Math.max(p1.y, p2.y))
					continue;

				let dx = e.offsetX - (p1.x + p2.x) / 2;
				let dy = e.offsetY - (p1.y + p2.y) / 2;
				if (dx*dx + dy*dy < shortestDist) {
					shortestDist = dx*dx + dy*dy;
					closest = { a1: a, a2: atoms[a].bonds[b].o };
				}
			}
		}
		if (closest != bondSelected) {
			bondSelected = closest;
			refresh();
		}
		return;
	}

	const maxAtom = (indexTemp != -1) ? indexTemp : atoms.length
	let closest = -1, shortestDist = 12*12;
	for (let i = 0; i < maxAtom; i++) {
		let dx = e.offsetX - atoms[i].pos.x;
		let dy = e.offsetY - atoms[i].pos.y;
		if (dx*dx + dy*dy < shortestDist) {
			shortestDist = dx*dx + dy*dy;
			closest = i;
		}
	}
	if (closest != atomSelected) {
		atomSelected = closest;
		refresh();
	}
}
canvas.addEventListener('mousedown', (e) => {
	if (isPerfroming || e.button != 0)
		return;

	startActionPos = { x: e.offsetX, y: e.offsetY };
	endActionPos = { x: e.offsetX, y: e.offsetY };
	
	isPerfroming = true;
	if (action == 1) {
		if (atomSelected != -1 && atomSelected < atoms.length) {
			branchingOff = atomSelected;
			indexTemp = atoms.length;
		} else {
			atomSelected = atoms.length;
			branchingOff = atoms.length;
			atoms.push({ pos: startActionPos, e: 'C', bonds: [] });
			indexTemp = atoms.length;
		}
		refresh();
	}
	if (action == 2 || action == 5)
		performAction();
});
let lastCall = performance.now();
canvas.addEventListener('mousemove', (e) => {
	let now = performance.now();
	if ((now - lastCall) < 1000 / 60)
		return;

	selectAtom(e);
	if (!isPerfroming)
		return;

	lastCall = now;
	endActionPos = { x: e.offsetX, y: e.offsetY };
	if (action != 5)
		performAction();
});

async function finalizeAction() {
	isPerfroming = false;
	if (action == 1) {
		indexTemp = -1, branchingOff = -1, branchingInto = -1;
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
			console.log("failed to get offscreen context")
			return;
		}
    offscreenCtx.putImageData(new ImageData(data, w, h), 0, 0);

    try {
      const blob = await offscreenCanvas.convertToBlob({ type: "image/png" });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    } catch (err) {
      console.error("failed to copy image:", err);
    }
	}
}
canvas.addEventListener('mouseup', (e) => {
	if (isPerfroming && e.button == 0)
		finalizeAction();
});
canvas.addEventListener('mouseenter', (e) => {
	if (isPerfroming && !(e.buttons % 2))
		finalizeAction();
})

function refresh() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawAtoms();

	if (atomSelected != -1 && atomSelected < atoms.length) {
		let pos = atoms[atomSelected].pos;
		let l = 12, s = 5;
		ctx.strokeStyle = "rgb(40, 40, 140)";
		ctx.beginPath();
    
    ctx.moveTo(pos.x - l, pos.y - l + s);
    ctx.lineTo(pos.x - l, pos.y - l);
    ctx.lineTo(pos.x - l + s, pos.y - l);

    ctx.moveTo(pos.x + l - s, pos.y - l);
    ctx.lineTo(pos.x + l, pos.y - l);
    ctx.lineTo(pos.x + l, pos.y - l + s);

    ctx.moveTo(pos.x - l, pos.y + l - s);
    ctx.lineTo(pos.x - l, pos.y + l);
    ctx.lineTo(pos.x - l + s, pos.y + l);

    ctx.moveTo(pos.x + l - s, pos.y + l);
    ctx.lineTo(pos.x + l, pos.y + l);
    ctx.lineTo(pos.x + l, pos.y + l - s);

    ctx.stroke();
	} else if (action == 5 && bondSelected.a1 != -1) {
		let x1 = Math.min(atoms[bondSelected.a1].pos.x, atoms[bondSelected.a2].pos.x);
		let x2 = Math.max(atoms[bondSelected.a1].pos.x, atoms[bondSelected.a2].pos.x);
		let y1 = Math.min(atoms[bondSelected.a1].pos.y, atoms[bondSelected.a2].pos.y);
		let y2 = Math.max(atoms[bondSelected.a1].pos.y, atoms[bondSelected.a2].pos.y);
		let l = 5, s = 7;
		ctx.strokeStyle = "rgb(40, 40, 140)";
		ctx.beginPath();
    
    ctx.moveTo(x1 - l, y1 - l + s);
    ctx.lineTo(x1 - l, y1 - l);
    ctx.lineTo(x1 - l + s, y1 - l);
		
    ctx.moveTo(x2 + l - s, y1 - l);
    ctx.lineTo(x2 + l, y1 - l);
    ctx.lineTo(x2 + l, y1 - l + s);
		
    ctx.moveTo(x1 - l, y2 + l - s);
    ctx.lineTo(x1 - l, y2 + l);
    ctx.lineTo(x1 - l + s, y2 + l);

    ctx.moveTo(x2 + l - s, y2 + l);
    ctx.lineTo(x2 + l, y2 + l);
    ctx.lineTo(x2 + l, y2 + l - s);

    ctx.stroke();
	}

	if (!isPerfroming)
		return;
	
	if (action == 2) {
		ctx.globalAlpha = 0.1;
		ctx.fillStyle = "rgb(255, 255, 255)";
		ctx.beginPath();
		ctx.arc(endActionPos.x, endActionPos.y, 25, 0, 2 * Math.PI);
		ctx.fill();
	} else if (action == 3) {
		ctx.globalAlpha = 0.1;
		ctx.fillStyle = "rgb(255, 255, 255)";
		let w = endActionPos.x - startActionPos.x;
		let h = endActionPos.y - startActionPos.y;
		ctx.fillRect(startActionPos.x, startActionPos.y, w, h);
	}
}
function drawAtoms() {
	const subscripts: string[] = [
		"₀", "₁", "₂", "₃", "₄", "₅", "₆", "₇", "₈", "₉"
	];

	ctx.globalAlpha = 1;
	ctx.lineWidth = 1.4;
	ctx.fillStyle = "rgb(255, 255, 255)"
	ctx.font = "24px Arial";
	ctx.strokeStyle = "rgb(255, 255, 255)"

	atoms.forEach((a, i) => {
		if (a.e == 'C' && a.bonds.length < 2) {
			let txt: string, dx: number = ctx.measureText('C').width / 2;
			let nBonds = 0;
			for (let b = 0; b < a.bonds.length; b++)
				nBonds += a.bonds[b].n + 1;
			if (a.bonds.length == 1 && a.pos.x < atoms[a.bonds[0].o].pos.x) {
				txt = 'H' + subscripts[4 - nBonds] + 'C';
				dx = ctx.measureText(txt).width - dx;
			}
			else
				txt = 'CH' + subscripts[4 - nBonds];

			let size = ctx.measureText('C');
			ctx.fillText(txt, a.pos.x - dx, a.pos.y + 9);
		}
		else if (a.e != 'C') {
			let size = ctx.measureText(a.e);
			ctx.fillText(a.e, a.pos.x - size.width / 2, a.pos.y + 9);
		}

		for (let b = 0; b < a.bonds.length; b++) {
			let bondMissmatch = true;
			for (let ob = 0; ob < atoms[a.bonds[b].o].bonds.length; ob++) {
				if (atoms[a.bonds[b].o].bonds[ob].o == i && 
					atoms[a.bonds[b].o].bonds[ob].n == a.bonds[b].n) {
					bondMissmatch = false;
					break;
				}
			}
			if (bondMissmatch) 
				console.log("Bond Missmatch", i, a.bonds[b].o, atoms);

			if (i < a.bonds[b].o)
				continue;
			drawBond(a, atoms[a.bonds[b].o], a.bonds[b].n);
		}
	});
}
function drawBond(a1: Atom, a2: Atom, n: number) {
	let {x: x1, y: y1} = a1.pos;
	let {x: x2, y: y2} = a2.pos;
	let ang = Math.atan2(y2 - y1, x2 - x1);

	//make bonds not "go into" the atoms
	if ((a1.e == 'C' && a1.bonds.length < 2) || a1.e != 'C') {
		x1 += 12 * Math.cos(ang);
		y1 += 12 * Math.sin(ang);
	}
	if ((a2.e == 'C' && a2.bonds.length < 2) || a2.e != 'C') {
		x2 -= 12 * Math.cos(ang);
		y2 -= 12 * Math.sin(ang);
	}

	ctx.beginPath();
	let dx = Math.cos(Math.PI / 2 + ang) * 3;
	let dy = Math.sin(Math.PI / 2 + ang) * 3;
	for (let i = 0; i < n + 1; i++) {
		let k = (i == 2) ? -1 : i;
		ctx.moveTo(x1 + dx * k, y1 + dy * k);
		ctx.lineTo(x2 + dx * k, y2 + dy * k);
	}
	ctx.stroke();
}