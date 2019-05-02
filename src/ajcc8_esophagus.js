import './js/common.js';
import './js/ajcc8_common.js';
import './js/ajcc8_esophagus.js';
import './css/dashboard.css';
import './css/ajcc8_common.css';
require('raw-loader!./html/ajcc8/esophagus.html');

// font awesome
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { faGithub, faFacebookSquare, faTwitterSquare } from "@fortawesome/free-brands-svg-icons";
import { faFileContract, faAt } from "@fortawesome/free-solid-svg-icons";

library.add(faGithub, faFacebookSquare, faTwitterSquare, faFileContract, faAt);
dom.watch();