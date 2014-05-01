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

  $('.enable_first_button_while_rating').rating({
    clearable: true,
    onRate: function(valRate){
      if (valRate === 0) {
        $(this).siblings('.ui.buttons').children('.button').removeClass('active');
      } else {
        if ($(this).siblings('.ui.buttons').children('.active').length === 0) {
          $(this).siblings('.ui.buttons').children().eq(0).addClass('active');
        }
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

  $('.ui.buttons.exclusive .button').click(function(){
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

  // multiple choice buttons
  $('.ui.buttons.multiple_choice .button').click(function(){
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
    } else {
      $(this).addClass('active');
    }
  });

  $('.toggle_child_section').click(function(){
    if ($(this).hasClass('active')) {
      $(this).siblings('.child_section').show();
      // set default rating and button
      child_section = $(this).siblings('.child_section');
      fst_buttons = child_section.find('.ui.buttons').eq(0);
      if (fst_buttons.children('.active').length === 0) {
        fst_buttons.children().eq(0).click();
      }
    } else {
      $(this).siblings('.child_section').hide();
    }
  });

  $('.toggle_location_section .button').click(function(){
    if ($(this).hasClass('active') && $(this).text() != 'posterior-central') {
      $(this).siblings('.child_section').show();
      // set default rating and button
      child_section = $(this).siblings('.child_section');
      fst_buttons = child_section.find('.ui.buttons').eq(0);
      if (fst_buttons.children('.active').length === 0) {
        fst_buttons.children().eq(0).click();
      }
    } else {
      $(this).siblings('.child_section').hide();
      // toggle parent hivd button
      if ($(this).parent().children('.active').length === 0) {
        $(this).parent().parent().parent().siblings('[id^="disc_hivd_"]').click();
      }
    }
  });

  $('.rating_while_enabling .button').click(function(){
    current_rating = $(this).parent().siblings('.ui.rating').rating('get rating');
    if ($(this).hasClass('active')) {
      if (current_rating === 0) {
        $(this).parent().siblings('.ui.rating').rating('set rating', 1);
      }
    } else {
      $(this).parent().siblings('.ui.rating').rating('clear rating');
    }
  });

  var slider_str = ['S1', 'L5', 'L4', 'L3', 'L2', 'L1'];

  var update_slider_value = function(event, ui) {
    lower_value = (ui.values ? ui.values[0] : $(this).slider('values')[0]);
    upper_value = (ui.values ? ui.values[1] : $(this).slider('values')[1]);
    $(this).find('a').eq(0).html('<div class="ui pointing left large label slider_handle">' + slider_str[lower_value] + '</div>');
    $(this).find('a').eq(1).html('<div class="ui pointing left large label slider_handle">' + slider_str[upper_value] + '</div>');
  }

  $( "#desiccation-range, #dsn-range" ).slider({
    orientation: "vertical",
    range: true,
    min: 0, max: 5,
    step: 1,
    values: [ 1, 4 ],
    slide: update_slider_value,
    create: update_slider_value
  });

  $('#get_report_btn').click(function(){
    rating_str = ['', 'mild ', 'mild-to-moderate ', 'moderate ', 'moderate-to-severe ', 'severe '];
    level_str = ['L1-L2', 'L2-L3', 'L3-L4', 'L4-L5', 'L5-S1'];
    //level_id = ['l12', 'l23', 'l34', 'l45', 'l5s1'];
    level_id = ['l12'];

    final_report = "";
    $.each(level_id, function(i, level){
      disc_ss_rating = $('#disc_ss_rating_'+level).rating('get rating');
      if (!$('#disc_diffuse_'+level).hasClass('active') && !$('#disc_hivd_'+level).hasClass('active') && disc_ss_rating === 0) {
        final_report += level_str[i] + ": No definite spinal stenosis.";
        return;
      }

      disc_rating = rating_str[$('#disc_rating_'+level).rating('get rating')];
      report_str = level_str[i] + ": Presence of ";

      // listhesis
      // example: Grade 1 degenerative type spondylolisthesis in combination of
      spdll_rating = $('#disc_spdll_rating_'+level).rating('get rating');
      if (spdll_rating > 0) {
        report_str += 'Grade ' + spdll_rating + ' degenerative type spondylolisthesis in combination of ';
      }

      // example: mild retrolisthesis, small spondylosis
      retro_rating = $('#disc_retro_rating_'+level).rating('get rating');
      spdl_rating = $('#disc_spdl_rating_'+level).rating('get rating');
      spdl_is_active = $('#spdl_'+level).is(':checked');

      disc_spine_characters_length = 0;
      if (retro_rating > 0) disc_spine_characters_length++;
      if (spdl_is_active > 0) disc_spine_characters_length++;

      if (retro_rating > 0) {
        report_str += rating_str[retro_rating] + 'retrolisthesis';
      }

      if (spdl_is_active) {
        if (disc_spine_characters_length > 1) report_str += ', ';
        if (spdl_rating > 0) report_str += 'small ';
        report_str += 'spondylosis';
      }

      if (disc_spine_characters_length > 0) report_str += ', ';

      // diffuse
      // example: diffuse bulging/protrusion/herniation disk
      diffuse_is_active = $('#disc_diffuse_'+level).hasClass('active');
      if (diffuse_is_active) {
        disc_type = $('#disc_'+level).children('.active').text();
        report_str += disc_rating + 'diffuse ' + disc_type + ' disc';
      }

      // hivd
      // example: and associated with the posterior-central/right/left/posterior-lateral/lateral herniated nucleus pulposus (HIVD), cranial/caudal migration of this HIVD, with compression /attachment of the adjacent nerve root/dural sac
      hivd_is_active = $('#disc_hivd_'+level).hasClass('active');
      if (hivd_is_active) {
        if (diffuse_is_active) {
          report_str += ', and associated with the ';
        }
        disc_location = $('#disc_location_'+level).children('.active').text();
        if (disc_location != 'posterior-central') {
          disc_location_lr = $('#disc_location_lr_'+level).children('.active').text();
          disc_location = disc_location_lr + ' ' + disc_location;
        }
        report_str += disc_location + ' herniated nucleus pulposus (HIVD)';

        hivd_migration_is_active = ($('#disc_hivd_migration_'+level).children('.active').length > 0);
        if (hivd_migration_is_active) {
          disc_hivd_migration = $('#disc_hivd_migration_'+level).children('.active').text();
          report_str += ', ' + disc_hivd_migration + ' migration of this HIVD';
        }

        hivd_nerve_is_active = ($('#disc_hivd_nerve_'+level).children('.active').length > 0);
        if (hivd_nerve_is_active) {
          disc_hivd_nerve = $('#disc_hivd_nerve_'+level).children('.active').text();
          report_str += ', with ' + disc_hivd_nerve + ' of the adjacent nerve root';
        }
      }

      // characters
      // example: disc space narrowing, degenerative endplate change, ligament flavum hypertrophy and facet joint degenerative change
      characters = $('#characters_'+level).find(':checkbox:checked');
      characters.each(function(index, element){
        character_rating = $(this).parent().next().rating('get rating');
        report_str += (index == characters.length - 1) ? ', and ' : ', ';
        report_str += rating_str[character_rating] + $(this).next().text();
      });

      // stenosis
      // example: causing mild/moderate/severe degree central spinal stenosis and mild/moderate/severe narrowing of bilateral lateral recesses and mild/moderate/severe degree degenerative bilateral/right/left neuroforaminal stenosis
      disc_nblr_rating = $('#disc_nblr_rating_'+level).rating('get rating');
      disc_nfs_rating = $('#disc_nfs_rating_'+level).rating('get rating');
      if (disc_ss_rating > 0) {
        report_str += ', causing ' + rating_str[disc_ss_rating] + 'spinal stenosis';
        disc_ss_accessory_length = 0;
        if (disc_nblr_rating > 0) disc_ss_accessory_length++;
        if (disc_nfs_rating > 0) disc_ss_accessory_length++;

        if (disc_nblr_rating > 0) {
          report_str += (disc_ss_accessory_length > 1 ? ', ' : ' and ');
          report_str += rating_str[disc_nblr_rating] + 'narrowing of bilateral lateral recesses';
        }
        if (disc_nfs_rating > 0) {
          disc_nfs_side = $('#disc_nfs_lr_'+level).children('.active').text();
          report_str += (disc_ss_accessory_length > 1 ? ', and ' : ' and ');
          report_str += rating_str[disc_nfs_rating] + 'degree degenerative ' + disc_nfs_side + ' neuroforaminal stenosis';
        }
        report_str += '.';
      } else {
        report_str += ', causing mild indentation of anterior dural sac, however, no obvious significant spinal stenosis.';
      }

      final_report += report_str;
    });

    // djd
    // example: Degenerative disc disease:
    //          1. Desiccation: L1 through L5
    //          2. Disc space narrowing: L2 through L5
    desiccation_is_active = $('#desiccation').hasClass('active');
    narrowing_is_active = $('#narrowing').hasClass('active');

    if (desiccation_is_active || narrowing_is_active) {
      report_str = "\n\nDegenerative disc disease:\n";

      if (desiccation_is_active) {
        dec_begin = slider_str[$('#desiccation-range').slider('values')[1]];
        dec_end = slider_str[$('#desiccation-range').slider('values')[0]];
        report_str += '- Desiccation: ' + dec_begin + ' through ' + dec_end + "\n";
      }

      if (narrowing_is_active) {
        dsn_begin = slider_str[$('#dsn-range').slider('values')[1]];
        dsn_end = slider_str[$('#dsn-range').slider('values')[0]];
        report_str += '- Disc space narrowing: ' + dsn_begin + ' through ' + dsn_end + "\n";
      }

      final_report += report_str;
    }

    // Schmorl's node
    // example: Schmorl's node ( vertical intravertebral disc herniation ) over the T12-L1, L1-L2, L2-L3, L3-L4, L4-L5, L5-S1.
    sch_node_length = $('#sch_node').children('.active').length;
    if (sch_node_length > 0) {
      report_str = "\n\nSchmorl's node ( vertical intravertebral disc herniation ) over the ";

      $('#sch_node').children('.active').each(function(i, level){
        report_str += $(this).text();
        report_str += (i == sch_node_length - 1) ? '.' : ', ';
      });

      final_report += report_str;
    }

    // Scoliosis
    // Example: Rotatory scoliosis of L-spine, convex to left/right side.
    if ($('#scoliosis').children('.active').length > 0) {
      scoliosis_side = $('#scoliosis').children('.active').text();
      final_report += "\n\nRotatory scoliosis of L-spine, convex to " + scoliosis_side + " side.";
    }

    $('#report_text').text(final_report);
  });
});