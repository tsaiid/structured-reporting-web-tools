import './common.js';
import '../css/dashboard.css';
import '../css/ajcc8_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc8/lung.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc8_common.js';
