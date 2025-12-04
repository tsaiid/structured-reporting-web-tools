// font awesome
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
function setDarkMode(isDark) {
    if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
        $('#btn_dark_mode').text('Light Mode');
        $('#btn_dark_mode').removeClass('btn-outline-light').addClass('btn-outline-warning');
    } else {
        document.body.removeAttribute('data-theme');
        $('#btn_dark_mode').text('Dark Mode');
        $('#btn_dark_mode').removeClass('btn-outline-warning').addClass('btn-outline-light');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

$(document).ready(function() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Initialize
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        setDarkMode(true);
    } else {
        setDarkMode(false); // Default to light/standard if no pref
    }

    $('#btn_dark_mode').on('click', function() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        setDarkMode(!isDark);
    });
});