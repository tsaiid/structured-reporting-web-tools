function show_about_modal(){

}

$('#link_about').on('click', function(event) {
    event.preventDefault(); // To prevent following the link (optional)
    $('#aboutModalLong').modal('show');
});