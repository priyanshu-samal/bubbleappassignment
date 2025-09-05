const myCanvas = document.getElementById("stage");
const pen = myCanvas.getContext("2d");

const startCircles = [
  { x: 120, y: 80, r: 30, base: "red", hit: "darkred" },
  { x: 120, y: 160, r: 30, base: "green", hit: "darkgreen" },
  { x: 120, y: 240, r: 30, base: "blue", hit: "darkblue" },
  { x: 120, y: 320, r: 30, base: "orange", hit: "darkorange" }
];

const startArrows = [
  { x: 680, y: 80 },
  { x: 680, y: 160 },
  { x: 680, y: 240 },
  { x: 680, y: 320 }
];

let bubbles, arrows, animation;

function restartGame() {
  if (animation) {
    cancelAnimationFrame(animation);
    animation = null;
  }
  bubbles = startCircles.map(c => ({ x: c.x, y: c.y, r: c.r, color: c.base, hit: c.hit }));
  arrows = startArrows.map(a => ({ x: a.x, y: a.y, vx: 0, vy: 0, state: "idle" }));
  updateScreen();
}

function makeBubble(c) {
  pen.beginPath();
  pen.arc(c.x, c.y, c.r, 0, Math.PI * 2);
  pen.fillStyle = c.color;
  pen.fill();
}

function makeArrow(a, i) {
  let angle = Math.PI;
  if (a.state === "moving" || a.state === "hit") angle = Math.atan2(a.vy, a.vx);
  const ux = Math.cos(angle), uy = Math.sin(angle);
  const px = -uy, py = ux;
  const h = 14, w = 10, L = 30;
  const Bx = a.x - h * ux, By = a.y - h * uy;
  const H1x = Bx + (w / 2) * px, H1y = By + (w / 2) * py;
  const H2x = Bx - (w / 2) * px, H2y = By - (w / 2) * py;
  const Tx = a.x - (h + L) * ux, Ty = a.y - (h + L) * uy;
  pen.beginPath();
  pen.moveTo(Tx, Ty);
  pen.lineTo(Bx, By);
  pen.lineWidth = 2;
  pen.strokeStyle = "#333";
  pen.stroke();
  pen.beginPath();
  pen.moveTo(a.x, a.y);
  pen.lineTo(H1x, H1y);
  pen.lineTo(H2x, H2y);
  pen.closePath();
  pen.fillStyle = "#333";
  pen.fill();
}

function updateScreen() {
  pen.clearRect(0, 0, myCanvas.width, myCanvas.height);
  bubbles.forEach(makeBubble);
  arrows.forEach((a, i) => makeArrow(a, i));
}

function gameLoop() {
  let active = false;
  arrows.forEach((a, i) => {
    if (a.state === "moving") {
      active = true;
      a.x += a.vx;
      a.y += a.vy;
      const c = bubbles[i];
      const dx = a.x - c.x, dy = a.y - c.y;
      const d = Math.hypot(dx, dy);
      if (d <= c.r) {
        a.state = "hit";
        const ux = dx / (d || 1), uy = dy / (d || 1);
        a.x = c.x + ux * c.r;
        a.y = c.y + uy * c.r;
        c.color = c.hit;
      }
    }
  });
  updateScreen();
  if (active) animation = requestAnimationFrame(gameLoop);
  else animation = null;
}

function shoot(i) {
  const a = arrows[i], c = bubbles[i];
  if (a.state !== "idle") return;
  const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy);
  a.vx = (dx / d) * 4;
  a.vy = (dy / d) * 4;
  a.state = "moving";
  if (!animation) animation = requestAnimationFrame(gameLoop);
}

myCanvas.addEventListener("click", e => {
  const r = myCanvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  for (let i = 0; i < bubbles.length; i++) {
    const c = bubbles[i];
    const dx = x - c.x, dy = y - c.y;
    if (dx * dx + dy * dy <= c.r * c.r) { shoot(i); break; }
  }
});

document.getElementById("reset").addEventListener("click", restartGame);

restartGame();