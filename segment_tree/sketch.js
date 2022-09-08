let speed = 1;
let ready = true;

class SegNode {
  constructor(x, y, idx, val, c1, c2, leaf) {
    this.idx = idx;
    this.val = val;
    this.leaf = leaf;
    this.c1 = c1;
    this.c2 = c2;
    this.start = createVector(x, y);
    this.animTarget = createVector(x, y);
    this.angle = 0.0;
    this.animating = false;
    this.jobQueue = null;
    this.valQueue = null;
    this.destQueue = null;
  }

  propagate(s, e) {
    this.s = s;
    this.e = e;
    if (this.leaf) return;
    const m = Math.floor((s + e) / 2);
    this.c1.propagate(s, m);
    this.c2.propagate(m + 1, e);
  }

  showDotPair() {
    push();
    fill(20, 100, 200);
    noStroke();
    ellipse(this.start.x, this.start.y, 15);
    fill("red");
    text(this.val, this.start.x, this.start.y);
    //console.log(`showing at ${this.start.x} ${this.start.y}`);
    pop();
  }

  showLine() {
    if (this.leaf) return;
    stroke("black");
    line(this.start.x, this.start.y, this.c1.start.x, this.c1.start.y);
    line(this.start.x, this.start.y, this.c2.start.x, this.c2.start.y);
    if (this.animating) {
      // console.log("animating");
      stroke("red");
      strokeWeight(2);
      line(this.start.x, this.start.y, this.animTarget.x, this.animTarget.y);
    }
  }

  animateLine(target, val) {
    if (this.animating === false) {
      return;
    }
    this.animTarget.x = map(
      this.angle,
      0,
      100,
      this.start.x,
      target.start.x,
      1
    );
    this.animTarget.y = map(
      this.angle,
      0,
      100,
      this.start.y,
      target.start.y,
      1
    );

    // this.current = createVector(tempX, tempY);

    if (
      this.animTarget.x == target.start.x &&
      this.animTarget.y == target.start.y
    ) {
      this.animating = false;
      this.animTarget = this.start.copy();
      this.jobQueue = null;
      target.update(this.valQueue, this.destQueue);
      this.valQueue = null;
      this.destQueue = null;
    }
    this.angle += speed;
  }

  update(val, dest) {
    // console.log("lesgo");
    this.val += val;
    if (this.leaf) {
      ready = true;
      return;
    }

    if (dest <= this.c1.e && this.c1.s <= dest) {
      // console.log("c1");
      this.animating = true;
      this.jobQueue = this.c1;
    } else if (dest <= this.c2.e && this.c2.s <= dest) {
      // console.log("c2");
      this.animating = true;
      this.jobQueue = this.c2;
    }
    this.valQueue = val;
    this.destQueue = dest;
  }
  updateAnimations() {
    if (this.jobQueue) this.animateLine(this.jobQueue);
  }
}
class segtree {
  constructor(size) {
    let sz = 1;
    while (sz <= size) sz *= 2;
    this.size = sz;
    this.tree = new Array(sz * 2);
  }
  update(pos, val) {
    let idx = pos + this.size - 1;
    while (idx > 0) {
      this.tree[idx] += val;
      idx /= 2;
    }
  }
  getsum(n, s, e, l, r) {
    if (r < s || e < l) return 0;
    if (l <= s && e <= r) return this.tree[n];
    const m = (s + e) >> 1;
    return (
      this.getsum(n * 2, s, m, l, r) + this.getsum(n * 2 + 1, m + 1, e, l, r)
    );
  }
}

function getlevel(x) {
  let lv = 1;
  while (x > 0) {
    x /= 2;
    x = Math.floor(x);
    lv++;
  }
  return lv;
}

let x = 0;
let nodeArray = Array(17);
function setup() {
  createCanvas(800, 1000);
  for (let i = 15; i > 0; i--) {
    if (i >= 8) {
      nodeArray[i] = new SegNode(
        i * 20,
        getlevel(i) * 40,
        i,
        0,
        null,
        null,
        true
      );
    } else {
      nodeArray[i] = new SegNode(
        i * 20,
        getlevel(i) * 40,
        i,
        0,
        nodeArray[i * 2],
        nodeArray[i * 2 + 1],
        false
      );
    }
  }
  nodeArray[1].propagate(1, 16);
}

function draw() {
  background(255);
  // if (mouseIsPressed) {
  //   fill(0);
  // } else fill(255);
  for (let i = 1; i <= 16; i++) {
    const n = nodeArray[i];
    if (!n) continue;
    n.showDotPair();
    n.updateAnimations();
  }
  for (let i = 1; i <= 16; i++) {
    const n = nodeArray[i];
    if (!n) continue;
    n.showLine();
  }
  if (ready) {
    ready = false;
    nodeArray[1].update(
      Math.floor(Math.random() * 16) + 1,
      Math.floor(Math.random() * 16) + 1
    );
  }
}
