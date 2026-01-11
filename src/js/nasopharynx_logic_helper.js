// Nasopharynx Neck Lymph Node Helper Logic
// 頸部淋巴結地圖輔助工具邏輯

const NECK_LN_HELPER_STATE = {
    selectedUIDs: new Set()
};

// 定義所有 Lymph Node Stations
// 圖片右側對應人體左側
const NECK_LN_STATIONS = [
    // 右側
    { uid: 'r-IA', station: 'IA', side: 'right', name: 'IA - Submental', belowCricoid: false },
    { uid: 'r-IB', station: 'IB', side: 'right', name: 'IB - Submandibular', belowCricoid: false },
    { uid: 'r-IIA', station: 'IIA', side: 'right', name: 'IIA - Upper jugular (anterior)', belowCricoid: false },
    { uid: 'r-IIB', station: 'IIB', side: 'right', name: 'IIB - Upper jugular (posterior)', belowCricoid: false },
    { uid: 'r-III', station: 'III', side: 'right', name: 'III - Mid jugular', belowCricoid: false },
    { uid: 'r-IVA', station: 'IVA', side: 'right', name: 'IVA - Lower jugular', belowCricoid: true },
    { uid: 'r-IVB', station: 'IVB', side: 'right', name: 'IVB - Medial supraclavicular', belowCricoid: true },
    { uid: 'r-VA', station: 'VA', side: 'right', name: 'VA - Upper posterior triangle', belowCricoid: false },
    { uid: 'r-VB', station: 'VB', side: 'right', name: 'VB - Lower posterior triangle', belowCricoid: true },
    { uid: 'r-VC', station: 'VC', side: 'right', name: 'VC - Lateral supraclavicular', belowCricoid: true },
    { uid: 'r-VI', station: 'VI', side: 'right', name: 'VI - Anterior cervical', belowCricoid: false },
    { uid: 'r-VIIA', station: 'VIIA', side: 'right', name: 'VIIA - Retropharyngeal', belowCricoid: false },
    { uid: 'r-VIIB', station: 'VIIB', side: 'right', name: 'VIIB - Retrostyloid', belowCricoid: false },
    { uid: 'r-VIII', station: 'VIII', side: 'right', name: 'VIII - Parotid', belowCricoid: false },
    { uid: 'r-IX', station: 'IX', side: 'right', name: 'IX - Bucco-facial', belowCricoid: false },
    { uid: 'r-XA', station: 'XA', side: 'right', name: 'XA - Retro-auricular', belowCricoid: false },
    { uid: 'r-XB', station: 'XB', side: 'right', name: 'XB - Occipital', belowCricoid: false },
    // 左側
    { uid: 'l-IA', station: 'IA', side: 'left', name: 'IA - Submental', belowCricoid: false },
    { uid: 'l-IB', station: 'IB', side: 'left', name: 'IB - Submandibular', belowCricoid: false },
    { uid: 'l-IIA', station: 'IIA', side: 'left', name: 'IIA - Upper jugular (anterior)', belowCricoid: false },
    { uid: 'l-IIB', station: 'IIB', side: 'left', name: 'IIB - Upper jugular (posterior)', belowCricoid: false },
    { uid: 'l-III', station: 'III', side: 'left', name: 'III - Mid jugular', belowCricoid: false },
    { uid: 'l-IVA', station: 'IVA', side: 'left', name: 'IVA - Lower jugular', belowCricoid: true },
    { uid: 'l-IVB', station: 'IVB', side: 'left', name: 'IVB - Medial supraclavicular', belowCricoid: true },
    { uid: 'l-VA', station: 'VA', side: 'left', name: 'VA - Upper posterior triangle', belowCricoid: false },
    { uid: 'l-VB', station: 'VB', side: 'left', name: 'VB - Lower posterior triangle', belowCricoid: true },
    { uid: 'l-VC', station: 'VC', side: 'left', name: 'VC - Lateral supraclavicular', belowCricoid: true },
    { uid: 'l-VI', station: 'VI', side: 'left', name: 'VI - Anterior cervical', belowCricoid: false },
    { uid: 'l-VIIA', station: 'VIIA', side: 'left', name: 'VIIA - Retropharyngeal', belowCricoid: false },
    { uid: 'l-VIIB', station: 'VIIB', side: 'left', name: 'VIIB - Retrostyloid', belowCricoid: false },
    { uid: 'l-VIII', station: 'VIII', side: 'left', name: 'VIII - Parotid', belowCricoid: false },
    { uid: 'l-IX', station: 'IX', side: 'left', name: 'IX - Bucco-facial', belowCricoid: false },
    { uid: 'l-XA', station: 'XA', side: 'left', name: 'XA - Retro-auricular', belowCricoid: false },
    { uid: 'l-XB', station: 'XB', side: 'left', name: 'XB - Occipital', belowCricoid: false },
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
    // 清除所有 regional lymph node checkboxes
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
