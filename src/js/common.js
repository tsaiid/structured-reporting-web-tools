// font awesome
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import $ from 'jquery';
import ClipboardJS from 'clipboard';

window.ClipboardJS = ClipboardJS;

import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faGithub, faFacebookSquare, faTwitterSquare } from "@fortawesome/free-brands-svg-icons";
import { faFileContract, faAt } from "@fortawesome/free-solid-svg-icons";

library.add(faGithub, faFacebookSquare, faTwitterSquare, faFileContract, faAt);
dom.watch();

// show about modal
$('#link_about').on('click', function(event) {
    event.preventDefault(); // To prevent following the link (optional)
    $('#aboutModalLong').modal('show');
});

// Dark Mode Logic
// Function to apply the theme immediately
function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        $('#btn_dark_mode').text('Light Mode');
        $('#btn_dark_mode').removeClass('btn-outline-light').addClass('btn-outline-warning');
    } else {
        document.documentElement.removeAttribute('data-theme');
        $('#btn_dark_mode').text('Dark Mode');
        $('#btn_dark_mode').removeClass('btn-outline-warning').addClass('btn-outline-light');
    }
}

// Get theme from storage or system preference
function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Immediate execution to prevent FOUC (Flash of Unstyled Content)
// This script needs to run as early as possible, before DOMContentLoaded
(function() {
    const theme = getPreferredTheme();
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark'); // Set on html/root element initially
        // We also set it on body when it becomes available, but setting on root helps earlier
    }
})();


$(document).ready(function() {
    // Re-apply to ensure UI elements like button text are updated
    const currentTheme = getPreferredTheme();
    applyTheme(currentTheme);

    $('#btn_dark_mode').on('click', function() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
});

// Remove loader when page is fully loaded
$(window).on('load', function() {
    const loader = $('#global-loader');
    // Small delay to ensure everything is painted
    setTimeout(() => {
        loader.css('opacity', '0');
        setTimeout(() => {
            loader.remove();
        }, 300); // Matches transition duration
    }, 100);
});
