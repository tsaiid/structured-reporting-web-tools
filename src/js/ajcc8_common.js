export function ajcc_template(ca_str, t, t_str, n, n_str, m, m_str) {
    var report = `
===================================================
2016, TNM Staging System for ${ca_str}, 8th edition

(T)  PRIMARY TUMOR:
 T${t} : ${t_str}

(N)  REGIONAL LYMPH NODES:
 N${n} : ${n_str}

(M)  DISTANT METASTASIS:
 M${m} : ${m_str}

===================================================


=====================
AJCC 8th edition Staging status:
T${t}N${n}M${m}
=====================`;
    return report;
}

export function ajcc_template_with_parent(ca_str, t, t_table, n, n_table, m, m_table) {
    var report = `
===================================================
2016, TNM Staging System for ${ca_str}, 8th edition

`;
    report += "(T)  PRIMARY TUMOR:\n";
    if (t.match(/[abc]/)) {
        let t_p = parseInt(t);
        let t_p_str = t_table[t_p];
        report += ` T${t_p} : ${t_p_str}\n`;
    }
    report += ` T${t} : ${t_table[t]}\n\n`;

    report += "(N)  REGIONAL LYMPH NODES:\n";
    if (n.match(/[abc]/)) {
        let n_p = parseInt(n);
        let n_p_str = n_table[n_p];
        report += ` N${n_p} : ${n_p_str}\n`;
    }
    report += ` N${n} : ${n_table[n]}\n\n`;

    report += "(M)  DISTANT METASTASIS:\n";
    if (m.match(/[abc]/)) {
        let m_p = parseInt(m);
        let m_p_str = m_table[m_p];
        report += ` M${m_p} : ${m_p_str}\n`;
    }
    report += ` M${m} : ${m_table[m]}`;

    report += `
===================================================


=====================
AJCC 8th edition Staging status:
T${t}N${n}M${m}
=====================`;
    return report;
}

export function join_checkbox_values(jq_cbs, sep=', '){
   return jq_cbs
   .map(function() {
     if (this.value !== "") {
      return this.value;
     }
   })
   .get()
   .join(sep);
}
