$(function(){
  $('.ui.rating').rating({
    clearable: true
  });

  $('.menu .item').tab({history:false});

  $('#test_btn').click(function(){
    a1 = $('#disc-rating-l12').rating('get rating');
    // alert(a1);
  });
});