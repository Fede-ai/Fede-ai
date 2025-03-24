const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx: CanvasRenderingContext2D = (() => {
	let possibleContext = canvas.getContext('2d');

	if (possibleContext)
		return possibleContext;
	else
		throw new Error('Failed to get 2d contex');
})();

type Point = { x: number, y: number };
type Bond = { o: number, n: number };
type Atom = { pos: Point, e: string, bonds: Bond[] };

let topLeft: Point = { x: 0, y: 0 };
//1 = default draw
let action: number = 1;
let isPerfroming: boolean = false;
let actionPos: Point = { x: 0, y: 0};

let atoms: Atom[] = [];
let tempAtoms: Atom[] = [];

function resize() {
	canvas.width = window.innerWidth + 1;
	let canvasTop = window.scrollY + canvas.getBoundingClientRect().top;
	canvas.height = window.innerHeight - canvasTop + 1;
}
window.addEventListener('resize', () => { resize(), refresh() });
resize();

canvas.addEventListener('mousedown', (e) => {
	actionPos = { x: e.clientX, y: e.clientY };
	
	if (action == 1 && e.button == 0) {
		isPerfroming = true;
		tempAtoms.push({ pos: actionPos, e: 'C', bonds: [] });
		refresh();
	}
});
canvas.addEventListener('mousemove', (e) => {
	if (!isPerfroming)
		return;
	actionPos = { x: e.clientX, y: e.clientY };

	if (action == 1) {
		const s: number = 60;
		let d: Point = { x: actionPos.x - tempAtoms[0].pos.x, 
			y: actionPos.y - tempAtoms[0].pos.y };
		tempAtoms = [tempAtoms[0]];
		tempAtoms[0].bonds = [];

		let ang = Math.atan(-d.x/d.y);
		let diag: Point = { x: Math.cos(ang)*45, y: Math.sin(ang)*45 }

		let dist = Math.sqrt(d.x*d.x + d.y*d.y);
		for (let i = 1; i < dist / s; i++) {
			let p: Point = { x: tempAtoms[0].pos.x + d.x * i / ((dist - dist % s) / s), 
				y: tempAtoms[0].pos.y + d.y * i / ((dist - dist % s) / s) }

			tempAtoms[i - 1].bonds.push({ o: i, n: 1 });
			tempAtoms.push({ e: 'C', pos: p, bonds: [{o: i - 1, n: 1}]})

			if (i % 2 == 1 && dist / s > 2) {
				tempAtoms[i].pos.x += diag.x * d.y / Math.abs(d.y);
				tempAtoms[i].pos.y += diag.y * d.y / Math.abs(d.y);
			}
		}
		refresh();
	}
});
canvas.addEventListener('mouseup', (e) => {
	if (action == 1 && e.button == 0) {
		isPerfroming = false;
		let initAtoms = atoms.length;
		for (let a = 0; a < tempAtoms.length; a++) {
			tempAtoms[a].bonds.forEach((b) => { b.o += initAtoms })
			atoms.push(tempAtoms[a])
		}
		tempAtoms = [];

		refresh();
	}
});
canvas.addEventListener('mouseleave', () => {
	if (action == 1) {
		isPerfroming = false;
		let initAtoms = atoms.length;
		for (let a = 0; a < tempAtoms.length; a++) {
			tempAtoms[a].bonds.forEach((b) => { b.o += initAtoms })
			atoms.push(tempAtoms[a])
		}
		tempAtoms = [];

		refresh();
	}
})

function drawAtoms(as: Atom[]) {
	as.forEach((a, i) => {
		if (a.e != 'C' || a.bonds.length < 2) {
			let size = ctx.measureText(a.e);
			ctx.fillText(a.e, a.pos.x - size.width / 2, a.pos.y - 24);
		}

		for (let b = 0; b < a.bonds.length; b++) {
			if (i < a.bonds[b].o)
				continue;

			let bondMissmatch = true;
			for (let ob = 0; ob < as[a.bonds[b].o].bonds.length; ob++) {
				if (as[a.bonds[b].o].bonds[ob].o == i && 
					as[a.bonds[b].o].bonds[ob].n == a.bonds[b].n) {
					bondMissmatch = false;
					break;
				}
			}
			if (bondMissmatch) 
				console.log("Bond Missmatch", i, a.bonds[b].o, as);

			ctx.beginPath();
			let {x: x1, y: y1} = a.pos;
			ctx.moveTo(x1, y1 - 32)
			let {x: x2, y: y2} = as[a.bonds[b].o].pos;
			ctx.lineTo(x2, y2 - 32);
			ctx.stroke();
		}
	});
}
function refresh() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.lineWidth = 2;
	ctx.fillStyle = "rgb(255, 255, 255)"
	ctx.font = "24px Arial";
	ctx.strokeStyle = "rgb(255, 255, 255)"

	drawAtoms(atoms);
	drawAtoms(tempAtoms);
}