import './common.js';
import '../css/dashboard.css';
import '../css/ajcc_common.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/ajcc/lung.html');
}

import {join_checkbox_values, ajcc_template} from './ajcc_common.js';
