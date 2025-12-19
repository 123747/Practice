import * as THREE from 'three';

export function createCardTexture(text: string, gradientColors: string[], size = { width: 512, height: 256 }): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return new THREE.CanvasTexture(canvas);
    }
    
    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradientColors.forEach((color, index) => {
        gradient.addColorStop(index / (gradientColors.length - 1 || 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Dots
    const dotColors = ['#00ffea', '#ff5e62', '#fcb045'];
    for (let i = 0; i < 3; i++) {
        ctx.fillStyle = dotColors[i];
        ctx.beginPath();
        ctx.arc(30 + i * 25, 30, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold 64px 'PingFang SC', 'Microsoft YaHei', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 255, 234, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

export function createParticleTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    if (!ctx) return new THREE.Texture();

    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(0, 255, 234, 0.8)');
    gradient.addColorStop(0.4, 'rgba(131, 58, 180, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}
