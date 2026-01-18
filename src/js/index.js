import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('../html/ajcc/lung.html?raw');
}

import {join_checkbox_values, ajcc_template, initSidebar} from './ajcc_common.js';

$(document).ready(function() {
    initSidebar();
});
