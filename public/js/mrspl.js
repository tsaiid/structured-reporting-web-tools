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

  $('#disc_hivd_l12').click(function(){
    if ($(this).hasClass('active')) {
      $('.hivd_section').show();
    } else {
      $('.hivd_section').hide();
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
    rating_str = ['', 'mild ', 'mild-to-moderate ', 'moderate ', 'moderate-to-severe ', 'severe '];
    level_str = ['L1-L2', 'L2-L3', 'L3-L4', 'L4-L5', 'L5-S1'];
    //level_id = ['l12', 'l23', 'l34', 'l45', 'l5s1'];
    level_id = ['l12'];

    final_report = "";
    $.each(level_id, function(i, level){
      disc_rating = rating_str[$('#disc_rating_'+level).rating('get rating')];
      report_str = level_str[i] + ": Presence of ";

      if ($('#disc_hivd_'+level).hasClass('active')) {
        report_str += '';
      } else {
        disc_type = $('#disc_'+level).children('.active').text();
        report_str += disc_rating + 'diffuse ' + disc_type + ' disk, ';
        $('#characters_'+level).find(':checkbox:checked').each(function(){
          character_rating = $(this).parent().next().rating('get rating');
          report_str += rating_str[character_rating] + $(this).next().text() + ', ';
        });
      }

      final_report += report_str;
    });

    $('#report_text').text(final_report);
  });
});