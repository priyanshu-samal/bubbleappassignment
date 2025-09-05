const canvas = document.getElementById("stage");
const ctx = canvas.getContext("2d");

const initCircles = [
  { x: 120, y: 80, r: 30, base: "red", hit: "darkred" },
  { x: 120, y: 160, r: 30, base: "green", hit: "darkgreen" },
  { x: 120, y: 240, r: 30, base: "blue", hit: "darkblue" },
  { x: 120, y: 320, r: 30, base: "orange", hit: "darkorange" }
];

const initArrows = [
  { x: 680, y: 80 },
  { x: 680, y: 160 },
  { x: 680, y: 240 },
  { x: 680, y: 320 }
];

let circles, arrows, raf;

function reset() {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = null;
  }
  circles = initCircles.map(c => ({ x: c.x, y: c.y, r: c.r, color: c.base, hit: c.hit }));
  arrows = initArrows.map(a => ({ x: a.x, y: a.y, vx: 0, vy: 0, state: "idle" }));
  draw();
}

function drawCircle(c) {
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
  ctx.fillStyle = c.color;
  ctx.fill();
}

function drawArrow(a, i) {
  let angle = Math.PI;
  if (a.state === "moving" || a.state === "hit") angle = Math.atan2(a.vy, a.vx);
  const ux = Math.cos(angle), uy = Math.sin(angle);
  const px = -uy, py = ux;
  const h = 14, w = 10, L = 30;
  const Bx = a.x - h * ux, By = a.y - h * uy;
  const H1x = Bx + (w / 2) * px, H1y = By + (w / 2) * py;
  const H2x = Bx - (w / 2) * px, H2y = By - (w / 2) * py;
  const Tx = a.x - (h + L) * ux, Ty = a.y - (h + L) * uy;
  ctx.beginPath();
  ctx.moveTo(Tx, Ty);
  ctx.lineTo(Bx, By);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#333";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(H1x, H1y);
  ctx.lineTo(H2x, H2y);
  ctx.closePath();
  ctx.fillStyle = "#333";
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  circles.forEach(drawCircle);
  arrows.forEach((a, i) => drawArrow(a, i));
}

function loop() {
  let active = false;
  arrows.forEach((a, i) => {
    if (a.state === "moving") {
      active = true;
      a.x += a.vx;
      a.y += a.vy;
      const c = circles[i];
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
  draw();
  if (active) raf = requestAnimationFrame(loop);
  else raf = null;
}

function fire(i) {
  const a = arrows[i], c = circles[i];
  if (a.state !== "idle") return;
  const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy);
  a.vx = (dx / d) * 4;
  a.vy = (dy / d) * 4;
  a.state = "moving";
  if (!raf) raf = requestAnimationFrame(loop);
}

canvas.addEventListener("click", e => {
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left, y = e.clientY - r.top;
  for (let i = 0; i < circles.length; i++) {
    const c = circles[i];
    const dx = x - c.x, dy = y - c.y;
    if (dx * dx + dy * dy <= c.r * c.r) { fire(i); break; }
  }
});

document.getElementById("reset").addEventListener("click", reset);

reset();
