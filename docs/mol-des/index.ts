const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = window.innerWidth;
let canvasTop = window.scrollY + canvas.getBoundingClientRect().top;
canvas.height = window.innerHeight - canvasTop;

type Point = { x: number, y: number }
let topLeft: Point = { x: 0, y: 0 };

const ctx: CanvasRenderingContext2D = (() => {
	let possibleContext = canvas.getContext('2d');

	if (possibleContext)
		return possibleContext;
	else
		throw new Error('Failed to get 2d contex');
})();

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	let canvasTop = window.scrollY + canvas.getBoundingClientRect().top;
	canvas.height = window.innerHeight - canvasTop;
});