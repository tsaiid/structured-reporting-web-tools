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
