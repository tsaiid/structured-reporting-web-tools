// Larynx Neck Lymph Node Helper Logic
// 喉癌頸部淋巴結地圖輔助工具邏輯 (完整版，含所有 17 個 stations)

const NECK_LN_HELPER_STATE = {
    selectedUIDs: new Set()
};

// 定義所有 Lymph Node Stations (每側 17 個)
// 圖片右側對應人體左側
const NECK_LN_STATIONS = [
    // 右側
    { uid: 'r-IA', station: 'IA', side: 'right', name: 'IA - Submental' },
    { uid: 'r-IB', station: 'IB', side: 'right', name: 'IB - Submandibular' },
    { uid: 'r-IIA', station: 'IIA', side: 'right', name: 'IIA - Upper jugular (anterior)' },
    { uid: 'r-IIB', station: 'IIB', side: 'right', name: 'IIB - Upper jugular (posterior)' },
    { uid: 'r-III', station: 'III', side: 'right', name: 'III - Mid jugular' },
    { uid: 'r-IVA', station: 'IVA', side: 'right', name: 'IVA - Lower jugular' },
    { uid: 'r-IVB', station: 'IVB', side: 'right', name: 'IVB - Medial supraclavicular' },
    { uid: 'r-VA', station: 'VA', side: 'right', name: 'VA - Upper posterior triangle' },
    { uid: 'r-VB', station: 'VB', side: 'right', name: 'VB - Lower posterior triangle' },
    { uid: 'r-VC', station: 'VC', side: 'right', name: 'VC - Lateral supraclavicular' },
    { uid: 'r-VI', station: 'VI', side: 'right', name: 'VI - Anterior cervical' },
    { uid: 'r-VIIA', station: 'VIIA', side: 'right', name: 'VIIA - Retropharyngeal' },
    { uid: 'r-VIIB', station: 'VIIB', side: 'right', name: 'VIIB - Retrostyloid' },
    { uid: 'r-VIII', station: 'VIII', side: 'right', name: 'VIII - Parotid' },
    { uid: 'r-IX', station: 'IX', side: 'right', name: 'IX - Bucco-facial' },
    { uid: 'r-XA', station: 'XA', side: 'right', name: 'XA - Retro-auricular' },
    { uid: 'r-XB', station: 'XB', side: 'right', name: 'XB - Occipital' },
    // 左側
    { uid: 'l-IA', station: 'IA', side: 'left', name: 'IA - Submental' },
    { uid: 'l-IB', station: 'IB', side: 'left', name: 'IB - Submandibular' },
    { uid: 'l-IIA', station: 'IIA', side: 'left', name: 'IIA - Upper jugular (anterior)' },
    { uid: 'l-IIB', station: 'IIB', side: 'left', name: 'IIB - Upper jugular (posterior)' },
    { uid: 'l-III', station: 'III', side: 'left', name: 'III - Mid jugular' },
    { uid: 'l-IVA', station: 'IVA', side: 'left', name: 'IVA - Lower jugular' },
    { uid: 'l-IVB', station: 'IVB', side: 'left', name: 'IVB - Medial supraclavicular' },
    { uid: 'l-VA', station: 'VA', side: 'left', name: 'VA - Upper posterior triangle' },
    { uid: 'l-VB', station: 'VB', side: 'left', name: 'VB - Lower posterior triangle' },
    { uid: 'l-VC', station: 'VC', side: 'left', name: 'VC - Lateral supraclavicular' },
    { uid: 'l-VI', station: 'VI', side: 'left', name: 'VI - Anterior cervical' },
    { uid: 'l-VIIA', station: 'VIIA', side: 'left', name: 'VIIA - Retropharyngeal' },
    { uid: 'l-VIIB', station: 'VIIB', side: 'left', name: 'VIIB - Retrostyloid' },
    { uid: 'l-VIII', station: 'VIII', side: 'left', name: 'VIII - Parotid' },
    { uid: 'l-IX', station: 'IX', side: 'left', name: 'IX - Bucco-facial' },
    { uid: 'l-XA', station: 'XA', side: 'left', name: 'XA - Retro-auricular' },
    { uid: 'l-XB', station: 'XB', side: 'left', name: 'XB - Occipital' },
];

// 開啟 Modal
$('#btn_neck_ln_helper').click(function() {
    // 從 form checkboxes 同步狀態到 helper
    syncFormToHelper();

    // 更新 UI 選取狀態
    $('.neck-ln-station-btn').removeClass('selected');
    NECK_LN_HELPER_STATE.selectedUIDs.forEach(uid => {
        $(`.neck-ln-station-btn[data-uid='${uid}']`).addClass('selected');
    });

    // 開啟 Modal
    document.getElementById('modal_neck_ln_helper').showModal();
});

// 點擊 station 按鈕切換選取狀態
$('.neck-ln-station-btn').click(function() {
    $(this).toggleClass('selected');
    const uid = $(this).data('uid');

    if ($(this).hasClass('selected')) {
        NECK_LN_HELPER_STATE.selectedUIDs.add(uid.toString());
    } else {
        NECK_LN_HELPER_STATE.selectedUIDs.delete(uid.toString());
    }
});

// 清除所有選取
$('#btn_neck_ln_clear').click(function() {
    NECK_LN_HELPER_STATE.selectedUIDs.clear();
    $('.neck-ln-station-btn').removeClass('selected');
});

// 套用到表單
$('#btn_neck_ln_submit').click(function() {
    // 清除所有 regional lymph node checkboxes (but not ENE)
    $('.cb_rn:not(#cb_rn_ene)').prop('checked', false);

    // 套用選取的 stations
    NECK_LN_HELPER_STATE.selectedUIDs.forEach(uid => {
        const checkboxId = `#cb_rn_${uid.replace('-', '_')}`;
        $(checkboxId).prop('checked', true);
    });

    // 關閉 Modal
    document.getElementById('modal_neck_ln_helper').close();
});

// 從 form checkboxes 同步狀態到 helper
function syncFormToHelper() {
    NECK_LN_HELPER_STATE.selectedUIDs.clear();

    NECK_LN_STATIONS.forEach(station => {
        const checkboxId = `#cb_rn_${station.uid.replace('-', '_')}`;
        if ($(checkboxId).is(':checked')) {
            NECK_LN_HELPER_STATE.selectedUIDs.add(station.uid);
        }
    });
}

// 匯出供外部使用
export { NECK_LN_STATIONS, NECK_LN_HELPER_STATE };
