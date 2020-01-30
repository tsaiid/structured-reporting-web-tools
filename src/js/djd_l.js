import '../css/dashboard.css';
import '../css/djd-l.css';
if (process.env.NODE_ENV !== 'production') {
    require('raw-loader!../html/djd_l.html');
}

var DJDLForm = 'Lumbar spine:' + "\n";

// Control for radio and checkbox.
// Disc Space Narrowing
$('.disc_space_narrowing').change(function() {
    var cb_dsn = $(this).parent().parent().find('.cb_dsn');

    if (!cb_dsn.is(':checked')) {
        cb_dsn.click();
    }
});

$('.cb_dsn').change(function() {
    if (!$(this).is(':checked')) {
        $(this).parent().parent().find(':radio').prop('checked', false);
    } else {
        // set default degree to mild.
        if ($(this).parent().parent().find(':radio:checked').length == 0) {
            $(this).parent().parent().find(':radio').first().prop('checked', true);
        }
    }
});

// Degenerative Spondylolisthesis
$('.deg_spon').change(function() {
    var cb_deg_spon = $(this).parent().parent().find('.cb_deg_spon');

    if (!cb_deg_spon.is(':checked')) {
        cb_deg_spon.click();
    }
});

$('.cb_deg_spon').change(function() {
    if (!$(this).is(':checked')) {
        $(this).parent().parent().find(':radio').prop('checked', false);
    } else {
        // set default grade to 1.
        if ($(this).parent().parent().find(':radio:checked').length == 0) {
            $(this).parent().parent().find(':radio').first().prop('checked', true);
        }
    }
});

// Scoliosis
$('.scoliosis').change(function() {
    var cb_scoliosis = $(this).parent().parent().find('.cb_scoliosis');

    if (!cb_scoliosis.is(':checked')) {
        cb_scoliosis.click();
    }
});

$('.cb_scoliosis').change(function() {
    if (!$(this).is(':checked')) {
        $(this).parent().parent().find(':radio').prop('checked', false);
    } else {
        // set default grade to Left.
        if ($(this).parent().parent().find(':radio:checked').length == 0) {
            $(this).parent().parent().find(':radio').first().prop('checked', true);
        }
    }
});

// Vertebral Collapse
$('.v_collapse').change(function() {
    var cb_collapse = $(this).parent().parent().find('.cb_collapse');

    if (!cb_collapse.is(':checked')) {
        cb_collapse.click();
    }

    // if not any collapsed level, uncheck.
    var v_collapses = $(this).parent().parent().find('.v_collapse:checkbox:checked');
    if (v_collapses.length == 0) {
        cb_collapse.prop('checked', false);
    }
});

$('.cb_collapse').change(function() {
    if (!$(this).is(':checked')) {
        $(this).parent().parent().find(':checkbox').prop('checked', false);
    } else {
        // set default to T11.
        if ($(this).parent().parent().find('.v_collapse:checkbox:checked').length == 0) {
            $(this).parent().parent().find('.v_collapse:checkbox').first().prop('checked', true);
        }
    }
});

// LSTV
$('.lstv').change(function() {
    var cb_lstv = $(this).parent().parent().find('.cb_lstv');

    if (!cb_lstv.is(':checked')) {
        cb_lstv.click();
    }

    // clear side if type 4
    console.log($(this).val());
    if ($(this).val() == "IV") {
        $(this).parent().parent().find('.lstv_side:radio').prop('checked', false);
    } else {
        // default side: both
        var checked_side_radios = $(this).parent().parent().find('.lstv_side:radio:checked');
        console.log(checked_side_radios.length);
        if (checked_side_radios.length == 0)
            $(this).parent().parent().find('.lstv_side:radio').last().prop('checked', true);
    }
});

$('.cb_lstv').change(function() {
    if (!$(this).is(':checked')) {
        $(this).parent().parent().find(':radio').prop('checked', false);
    } else {
        // set default grade to 1, and both sides.
        if ($(this).parent().parent().find('.lstv:radio:checked').length == 0) {
            console.log($(this).parent().parent().find('.lstv:radio').first());
            $(this).parent().parent().find(':radio[name="lstv_type"]').first().prop('checked', true); // type
            $(this).parent().parent().find('.lstv_side:radio').last().prop('checked', true); // side
        }
    }
});

$(':checkbox, :radio').change(function() {
    analyze();
});

$('#btn_clear').click(function() {
    $(':checkbox, :radio').prop('checked', false);
    $('#result').text('');
});

// # Analysis for output.
function analyze() {
    var str = DJDLForm;
    var retro = [];
    var hyper = [];
    var side_text = ['left', 'right'];

    // Disc Space Narrowing
    if ($('.disc_space_narrowing:checked').length == 0) {
        str += '- No obvious disc space narrowing. ' + "\n";
    } else {
        var degree = [];
        var degree_text = ['', 'mild', 'moderate', 'severe'];
        var has_disc_space_narrowing = false;

        $('.disc_space_narrowing:checked').each(function() {
            var level = $(this).parent().parent().parent().attr('id');
            if (typeof degree[$(this).val()] == "undefined") {
                degree[$(this).val()] = new Array();
            }
            degree[$(this).val()].push(level);
            has_disc_space_narrowing = true;
        });

        if (has_disc_space_narrowing) {
            str += "- Disc space narrowing:\n";
        }

        for (i = 1; i < 4; i++) {
            if (typeof degree[i] != "undefined" && degree[i].length) {
                str += "  - " + degree[i].join(', ') + ': ' + degree_text[i] + "\n";
            }
        }
    }

    // Retrolisthesis
    $('.cb_retro:checked').each(function() {
        var level = $(this).parent().parent().parent().attr('id');
        retro.push(level);
    });

    if (retro.length) {
        str += "- Retrolisthesis: " + retro.join(', ') + "\n";
    } else {
        str += "- No retrolisthesis.\n";
    }

    // Degenerative Spondylolisthesis
    if ($('.deg_spon:checked').length == 0) {
        str += '- No degenerative spondylolisthesis. ' + "\n";
    } else {
        var grade = [];
        //var grade_text = ['', 'mild', 'moderate', 'severe'];
        var has_spondylolisthesis = false;

        $('.deg_spon:checked').each(function() {
            var level = $(this).parent().parent().parent().attr('id');
            if (typeof grade[$(this).val()] == "undefined") {
                grade[$(this).val()] = new Array();
            }
            grade[$(this).val()].push(level);
            has_spondylolisthesis = true;
        });

        if (has_spondylolisthesis) {
            str += "- Degenerative Spondylolisthesis:\n";
        }

        for (var i = 1; i < 5; i++) {
            if (typeof grade[i] != "undefined" && grade[i].length) {
                str += "  - " + grade[i].join(', ') + ': grade ' + i + ".\n";
            }
        }
    }

    // Degenerative lower lumbar facet joints
    if ($('.cb_dllfj:checked').length) {
        str += "- Degenerative lower lumbar facet joints.\n";
    }

    // Marginal osteophyte
    if ($('.cb_mo:checked').length) {
        if ($('.cb_mo_sm:checked').length) {
            str += "- Small marginal osteophyte.\n";
        } else {
            str += "- Marginal osteophyte.\n";
        }
    }

    // Hypermobility
    $('.cb_hyper:checked').each(function() {
        var level = $(this).parent().parent().parent().attr('id');
        hyper.push(level);
    });

    if (hyper.length) {
        str += "- Hypermobility: " + hyper.join(', ') + "\n";
    } else {
        str += "- No hypermobility.\n";
    }

    // Scoliosis
    if ($('.cb_scoliosis:checked').length) {
        str += "- Scoliosis with " + side_text[$('.scoliosis:checked').first().val()] + " lateral convexity.\n";
    }

    // Collapse Vertebra
    if ($('.cb_collapse:checked').length) {
        var v_collapses = $('.v_collapse:checked');
        str += "- Collapse of ";
        var len = v_collapses.length;
        v_collapses.each(function(i) {
            str += $(this).val();
            if (i != len - 1)
                str += ', ';
        });
        str += (len > 1) ? " vertebrae" : " vertebra";
        str += ".\n";
    }

    // LSTV
    if ($('.cb_lstv:checked').length) {
        var lstv_type = $('.lstv:checked').first().val();
        str += "- Lumbosacral Transitional Vertebrae, type " + lstv_type;
        if (lstv_type != "IV") {
            var lstv_side = $('.lstv_side:checked').first().val();
            str += (lstv_side == 2 ? "b" : "a, " + side_text[lstv_side]);
        }
        str += ".\n";
    }

    $('#result').text(str);
    return false;
}

var clipboard = new ClipboardJS('#btn_copy');
clipboard.on('success', function(e) {
    console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', e.trigger);

    e.clearSelection();
    $('#btn_copy').tooltip('show');
});

clipboard.on('error', function(e) {
    console.error('Action:', e.action);
    console.error('Trigger:', e.trigger);
    $('#btn_copy').attr('data-original-title', "Press Ctrl+C to copy!").tooltip('show');
});

$('#btn_copy').mouseleave(function(){
    $(this).tooltip('dispose');
});

