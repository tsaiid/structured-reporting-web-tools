// font awesome
import '../css/tailwind.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap';
import $ from 'jquery';
import { getPreferredTheme, applyTheme, setTheme } from './theme.js';


import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faGithub, faFacebookSquare, faXTwitter, faInstagram, faThreads, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faFileContract, faAt, faSun, faMoon, faFileMedical, faPlusCircle, faFolder, faFolderOpen, faGlobe, faAngleDoubleLeft, faAngleDoubleRight, faBook, faCopy, faBars, faCheck } from "@fortawesome/free-solid-svg-icons";

library.add(faGithub, faFacebookSquare, faXTwitter, faInstagram, faThreads, faYoutube, faFileContract, faAt, faSun, faMoon, faFileMedical, faPlusCircle, faFolder, faFolderOpen, faGlobe, faAngleDoubleLeft, faAngleDoubleRight, faBook, faCopy, faBars, faCheck);
dom.watch();

// redirect to legacy version
$('#link_legacy').on('click', function (event) {
    event.preventDefault();
    const fileName = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = '../legacy/ajcc/' + fileName;
});

// show about modal
$('#link_about').on('click', function (event) {
    event.preventDefault(); // To prevent following the link (optional)
    const modal = document.querySelector('#aboutModalLong');
    if (modal) {
        modal.showModal();
    }
});

// Dark Mode Logic
// 立即套用偏好主題，防治 FOUC
applyTheme(getPreferredTheme());

$(document).ready(function () {
    // 確保 DOM 載入後 UI 控制項（checkbox）狀態同步
    const currentTheme = getPreferredTheme();
    applyTheme(currentTheme);
    $('#checkbox_dark_mode').prop('checked', currentTheme === 'dark');

    $('#checkbox_dark_mode').on('change', function () {
        const newTheme = this.checked ? 'dark' : 'light';
        setTheme(newTheme);
    });
});

// Remove loader when page is fully loaded
$(window).on('load', function () {
    const loader = $('#global-loader');
    // Small delay to ensure everything is painted
    setTimeout(() => {
        loader.css('opacity', '0');
        setTimeout(() => {
            loader.remove();
        }, 300); // Matches transition duration
    }, 100);
});

// Global behavior: Close dialog when clicking outside (backdrop)
document.addEventListener('click', (event) => {
    if (event.target.tagName === 'DIALOG') {
        const rect = event.target.getBoundingClientRect();
        const isInDialog = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
            event.target.close();
        }
    }
});
