import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'clipboard';
import './js/common.js';
import './js/ajcc8_common.js';
import './js/ajcc8_lung.js';
import './css/dashboard.css';
import './css/ajcc8_lung.css';
require('raw-loader!./html/ajcc8/lung.html');

// font awesome
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faGithub, faFacebookSquare, faTwitterSquare } from "@fortawesome/free-brands-svg-icons";
import { faFileContract, faAt } from "@fortawesome/free-solid-svg-icons";

library.add(faGithub, faFacebookSquare, faTwitterSquare, faFileContract, faAt);
dom.watch();