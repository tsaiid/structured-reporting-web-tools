import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/index.html?raw');
}

import { initSidebar } from './ajcc_common.js';

$(document).ready(function() {
    initSidebar();
});
