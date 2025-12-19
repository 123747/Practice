import type { Config } from './types';

export const CARD_TEXTS = [
    "今天辛苦了", "早点休息", "多喝热水", "好梦成真", "别熬夜了",
    "保持好心情", "未来可期", "记得吃饭", "抱抱自己", "永远开心",
    "万事胜意", "你很棒", "记得微笑", "允许休息", "慢慢来",
    "好事发生", "生活明朗", "万物可爱", "平安喜乐", "自在如风",
    "保持热爱", "奔赴山海", "来日方长", "一切顺利", "天天开心",
    "元气满满", "能量加满", "我想你了", "见信如晤", "岁岁平安",
    "光芒万丈", "随遇而安", "不负韶华", "只争朝夕", "初心未改",
    "未来已来", "心之所向", "素履以往", "生如夏花", "静待花开"
];

// Repeat texts to get 350 cards
export const ALL_CARD_TEXTS = Array.from({ length: Math.ceil(350 / CARD_TEXTS.length) }, () => CARD_TEXTS).flat().slice(0, 350);

export const CARD_GRADIENTS = [
    ['#24243e', '#302b63', '#0f0c29'], // Violet
    ['#134e5e', '#71b280'], // Emerald
    ['#ff9966', '#ff5e62'], // Sunset
    ['#000428', '#004e92'], // Deep Sea
    ['#833ab4', '#fd1d1d', '#fcb045'], // Neon
    ['#2C3E50', '#4CA1AF'], // Rocky
    ['#4568DC', '#B06AB3'] // Purple-Red
];

export const INITIAL_CONFIG: Config = {
    particleCount: 3500,
    cardSize: 1,
    rotationSpeed: 0.1,
    floatSpeed: 0.1,
    bloomStrength: 1.5,
    bloomRadius: 0.4,
    bloomThreshold: 0.85,
    readScale: 4.5,
    pinchSensitivity: 0.05,
};

export const NUM_CARDS = 350;
export const SPHERE_RADIUS = 10;
