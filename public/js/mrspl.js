$(function(){
  $('.ui.checkbox').checkbox({
    'onDisable':  function() {
      $(this).parent().siblings('.ui.rating').rating('clear rating');
    }
  });

  $('.ui.rating').rating({
    clearable: true,
    onRate: function(valRate){
      if (valRate > 0) {
        $(this).siblings('.ui.toggle.checkbox').checkbox('enable');
      } else {
        // 暫時不要 disable, 有時候會只想取消 rating
        //$(this).siblings('.ui.toggle.checkbox').checkbox('disable');
      }
    }
  });

  $('.menu .item').tab({history:false});

  $('#test_btn').click(function(){
    //a1 = $('#disc-rating-l12').rating('get rating');
    // alert(a1);
    alert($('#disc-hivd-migration-l12').find('.active').text());
  });

  $('.ui.toggle.button').state();

  $('#disc-hivd-l12').click(function(){
    if ($(this).hasClass('active')) {
      $('.hivd-section').show();
    } else {
      $('.hivd-section').hide();
    }
  });

  $('.ui.buttons .button').on('click', function(){
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
    } else {
      $(this)
        .addClass('active')
        .siblings()
        .removeClass('active')
      ;
    }
  });

  $('#get_report_btn').click(function(){
    rating_str = ['', 'mild', 'mild-to-moderate', 'moderate', 'moderate-to-severe', 'severe'];

    disc_rating_l12 = $('#disc-rating-l12').rating('get rating');

    $('#report_text').text(rating_str[disc_rating_l12]);
  });
});