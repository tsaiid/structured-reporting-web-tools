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
