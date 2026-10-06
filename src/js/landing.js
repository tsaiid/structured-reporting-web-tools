
import '../css/landing.css';
import { initTheme, toggleTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle?.querySelector('span');

    // 更新圖示顯示
    function updateIcon(theme) {
        if (icon) {
            icon.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }

    // 初始化主題並同步圖示
    initTheme((theme) => {
        updateIcon(theme);
    });

    // 切換按鈕事件監聽
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = toggleTheme();
            updateIcon(newTheme);
        });
    }

    // 解除 Anti-FOUC 遮罩
    if (document.body) {
        document.body.classList.add('ready');
    }
});
