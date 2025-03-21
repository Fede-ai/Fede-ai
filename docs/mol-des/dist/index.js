"use strict";
const canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
let canvasTop = window.scrollY + canvas.getBoundingClientRect().top;
canvas.height = window.innerHeight - canvasTop;
const ctx = (() => {
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
