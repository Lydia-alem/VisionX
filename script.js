const canvas = document.getElementById('galaxy-canvas');
const ctx = canvas.getContext('2d');
let cw = canvas.width = window.innerWidth;
let ch = canvas.height = window.innerHeight;

const particles = [];
const numParticles = 2000; // Reduced for performance
const maxRadius = Math.max(cw, ch) * 0.7; // Increased size, using max dimension to fill more space
const branches = 4; // Number of spiral arms
const spin = 1.2; // Tightness of the spiral

// Resize handler
window.addEventListener('resize', () => {
    cw = canvas.width = window.innerWidth;
    ch = canvas.height = window.innerHeight;
});

function initParticles() {
    particles.length = 0; // Clear existing
    for (let i = 0; i < numParticles; i++) {
        // Core distribution vs edge (pow 2 creates denser center)
        const density = Math.pow(Math.random(), 2);
        const actualRadius = density * maxRadius;

        const branchAngle = (i % branches) / branches * Math.PI * 2;
        const spinAngle = (actualRadius / maxRadius) * spin * Math.PI * 2;

        // Add some random spread
        const spreadRand = Math.random() < 0.5 ? 1 : -1;
        const randX = Math.pow(Math.random(), 3) * spreadRand * (actualRadius * 0.4 + 10);
        const randY = Math.pow(Math.random(), 3) * spreadRand * (actualRadius * 0.2 + 5);
        const randZ = Math.pow(Math.random(), 3) * spreadRand * (actualRadius * 0.4 + 10);

        let gx = Math.cos(branchAngle + spinAngle) * actualRadius + randX;
        let gy = randY;
        let gz = Math.sin(branchAngle + spinAngle) * actualRadius + randZ;

        // Scattered positions (starfield)
        const spreadX = cw * 2.5;
        const spreadY = ch * 4;
        const spreadZ = 3000;

        let sx = (Math.random() - 0.5) * spreadX;
        let sy = (Math.random() - 0.5) * spreadY + (spreadY * 0.2); // slight downward offset for scroll
        let sz = (Math.random() - 0.5) * spreadZ;

        // Assign colors based on distance from center for a realistic galaxy feel
        let colorMix;
        if (actualRadius < maxRadius * 0.15) {
            colorMix = ['#ffffff', '#ffeedd', '#fff0aa'][Math.floor(Math.random() * 3)]; // Hot core
        } else if (actualRadius < maxRadius * 0.4) {
            colorMix = ['#ff00ff', '#ff88ff', '#ffffff'][Math.floor(Math.random() * 3)]; // Mid arms
        } else {
            colorMix = ['#00ffff', '#0077ff', '#00aaff'][Math.floor(Math.random() * 3)]; // Outer arms
        }

        const size = Math.random() * 1.5 + 0.3; // Random size
        const speed = (1 - (actualRadius / maxRadius)) * 0.003 + 0.001; // Center spins faster

        particles.push({
            gx, gy, gz,
            sx, sy, sz,
            color: colorMix,
            size, speed,
            angle: Math.random() * Math.PI * 2 // Random starting angle offset
        });
    }
}

initParticles();

// Utility rotations
function rotateX(y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { y: y * cos - z * sin, z: z * cos + y * sin };
}
function rotateY(x, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: x * cos + z * sin, z: z * cos - x * sin };
}
function rotateZ(x, y, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return { x: x * cos - y * sin, y: y * cos + x * sin };
}

function hexToRgb(hex) {
    if (hex === '#ffffff') return '255, 255, 255';
    if (hex === '#ffeedd') return '255, 238, 221';
    if (hex === '#fff0aa') return '255, 240, 170';
    if (hex === '#ff00ff') return '255, 0, 255';
    if (hex === '#ff88ff') return '255, 136, 255';
    if (hex === '#00ffff') return '0, 255, 255';
    if (hex === '#0077ff') return '0, 119, 255';
    if (hex === '#00aaff') return '0, 170, 255';
    return '255, 255, 255';
}

let time = 0;
let scatterProgress = 0;

function animate() {
    requestAnimationFrame(animate);

    // Trail effect instead of clearRect for a tiny bit of motion blur
    ctx.fillStyle = 'rgba(2, 2, 5, 0.4)'; // match background var(--dark) of #020205
    ctx.fillRect(0, 0, cw, ch);

    time += 0.005;

    // Calculate scroll progress (0 means top, 1 means scrolled 1.2 viewport heights)
    const scrollMax = window.innerHeight * 1.2;
    let targetScatter = window.scrollY / scrollMax;
    targetScatter = Math.max(0, Math.min(1, targetScatter));

    // Smooth transition towards target scatter
    scatterProgress += (targetScatter - scatterProgress) * 0.05;

    // Update UI elements based on scatterProgress
    const intro = document.getElementById('galaxy-intro');
    if (intro) {
        let opacityIntro = 1 - (scatterProgress / 0.3);
        opacityIntro = Math.max(0, Math.min(1, opacityIntro));
        intro.style.opacity = opacityIntro;
        intro.style.transform = `translateY(${scatterProgress * -50}px) scale(${1 - scatterProgress * 0.2})`;

        // Disable pointer events when faded out
        intro.style.pointerEvents = opacityIntro > 0 ? 'auto' : 'none';

        // Optional hide completely to optimize
        if (opacityIntro === 0) {
            intro.style.visibility = 'hidden';
        } else {
            intro.style.visibility = 'visible';
        }
    }

    const scrollInd = document.getElementById('scroll-indicator');
    if (scrollInd) {
        let opacityInd = 1 - (scatterProgress / 0.15);
        opacityInd = Math.max(0, Math.min(1, opacityInd));
        scrollInd.style.opacity = opacityInd;
        scrollInd.style.visibility = opacityInd === 0 ? 'hidden' : 'visible';
    }

    const vContent = document.getElementById('visionx-content');
    if (vContent) {
        let opacityVisionX = (scatterProgress - 0.5) / 0.5;
        opacityVisionX = Math.max(0, Math.min(1, opacityVisionX));
        vContent.style.opacity = opacityVisionX;
        vContent.style.transform = `scale(${0.9 + 0.1 * opacityVisionX})`;
        vContent.style.pointerEvents = opacityVisionX > 0.8 ? 'auto' : 'none';

        if (opacityVisionX === 0) {
            vContent.style.visibility = 'hidden';
        } else {
            vContent.style.visibility = 'visible';
        }
    }

    ctx.globalCompositeOperation = 'lighter';

    const cx = cw / 2;
    const cy = ch / 2;
    const fov = 400;

    for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        // 1. Galaxy specific transforms
        // Add individual rotation speed
        const currentAngle = time + p.angle + p.speed * time * 50;

        // Rotate galaxy around Y axis
        const gRotY = rotateY(p.gx, p.gz, currentAngle);
        let currentX = gRotY.x;
        let currentY = p.gy;
        let currentZ = gRotY.z;

        // Apply a tilt (rotate X) to see the galaxy from an angle
        const gRotX = rotateX(currentY, currentZ, Math.PI / 2.5); // 72 deg
        currentY = gRotX.y;
        currentZ = gRotX.z;

        // Slightly rotate Z for a dynamic look
        const gRotZ = rotateZ(currentX, currentY, -Math.PI / 8);
        currentX = gRotZ.x;
        currentY = gRotZ.y;

        // 2. Scattered starfield transforms
        // Rotate stars around Y just slowly for ambient motion
        const sRotY = rotateY(p.sx, p.sz, time * 0.2);
        let targetX = sRotY.x;
        let targetY = p.sy - window.scrollY * 1.5; // Parallax effect on scroll
        let targetZ = sRotY.z;

        // Lerp between Galaxy position and Scattered position
        const x = currentX + (targetX - currentX) * scatterProgress;
        const y = currentY + (targetY - currentY) * scatterProgress;
        const z = currentZ + (targetZ - currentZ) * scatterProgress;

        // Move the whole system backwards or forwards depending on scatter?
        // Galaxy starts far enough, scattered comes slightly closer
        const adjustedZ = z + 600 - scatterProgress * 300;

        if (adjustedZ <= -fov) continue;

        const scale = fov / (fov + adjustedZ);
        if (scale < 0) continue;

        const screenX = cx + x * scale;
        const screenY = cy + y * scale;
        const screenRadius = p.size * scale;

        // Depth fading
        let zFade = 1;
        if (adjustedZ > 2000) zFade = Math.max(0, 1 - (adjustedZ - 2000) / 1000);

        let alpha = zFade;
        // Increase brightness for core galaxy
        if (scatterProgress < 0.2 && p.size > 1.2) {
            alpha = Math.min(1, alpha * 1.5);
        }

        if (screenX > -10 && screenX < cw + 10 && screenY > -10 && screenY < ch + 10) {
            // Using fillRect instead of arc for massive performance boost
            const rgb = hexToRgb(p.color);
            ctx.fillStyle = `rgba(${rgb}, ${alpha})`;

            // Draw particle
            const d = screenRadius * 2;
            ctx.fillRect(screenX - screenRadius, screenY - screenRadius, d, d);

            // Fake glow for bigger particles without expensive shadowBlur
            if (p.size > 1 && scatterProgress < 0.2) {
                ctx.fillStyle = `rgba(${rgb}, ${alpha * 0.3})`;
                ctx.fillRect(screenX - screenRadius * 2, screenY - screenRadius * 2, d * 2, d * 2);
            }
        }
    }
    ctx.globalCompositeOperation = 'source-over'; // reset for standard fillRect next frame
}

animate();

// Cards interactivity
const cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 50%)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.background = 'rgba(255, 255, 255, 0.02)';
    });
});

// Projects Cards interactivity (Galaxy Glow Tracking)
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouseX', `${x}px`);
        card.style.setProperty('--mouseY', `${y}px`);
    });
});
