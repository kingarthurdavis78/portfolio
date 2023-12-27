const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const width = canvas.width;
const height = canvas.height;

context.fillStyle = 'black';
context.fillRect(0, 0, width, height);

context.fillStyle = 'white';
context.fillRect(width / 4, 0, 1, width / 4);
context.fillRect(0, width / 4, width / 4, 1);

