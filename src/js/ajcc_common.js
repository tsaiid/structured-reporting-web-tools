export function ajcc_template(ca_str, t, t_str, n, n_str, m, m_str, ver=8) {
    var report = `
===================================================
AJCC Cancer Staging System, ${ver}th edition
For ${ca_str}

(T)  PRIMARY TUMOR:
 T${t} : ${t_str}

(N)  REGIONAL LYMPH NODES:
 N${n} : ${n_str}

(M)  DISTANT METASTASIS:
 M${m} : ${m_str}
===================================================


=====================
AJCC ${ver}th edition Staging status:
T${t}N${n}M${m}
=====================`;
    return report;
}

export function ajcc_template_with_parent(ca_str, t, t_table, n, n_table, m, m_table, ver=8) {
    var report = `
===================================================
AJCC Cancer Staging System, ${ver}th edition
For ${ca_str}

`;
    if (t_table instanceof Map) {
        t_table = Object.fromEntries(t_table);
    }
    report += "(T)  PRIMARY TUMOR:\n";
    if (t.match(/[abc]/)) {
        let t_p = parseInt(t);
        let t_p_str = t_table[t_p];
        report += ` T${t_p} : ${t_p_str}\n  `;
    }
    report += ` T${t} : ${t_table[t]}\n\n`;

    if (n_table instanceof Map) {
        n_table = Object.fromEntries(n_table);
    }
    report += "(N)  REGIONAL LYMPH NODES:\n";
    if (n.match(/[abc]/)) {
        let n_p = parseInt(n);
        let n_p_str = n_table[n_p];
        report += ` N${n_p} : ${n_p_str}\n  `;
    }
    report += ` N${n} : ${n_table[n]}\n\n`;

    if (m_table instanceof Map) {
        m_table = Object.fromEntries(m_table);
    }
    report += "(M)  DISTANT METASTASIS:\n";
    if (m.match(/[abc]/)) {
        let m_p = parseInt(m);
        let m_p_str = m_table[m_p];
        report += ` M${m_p} : ${m_p_str}\n  `;
    }
    report += ` M${m} : ${m_table[m]}`;

    report += `
===================================================


=====================
AJCC ${ver}th edition Staging status:
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

export function generate_ajcc_table(t, n, m){
    let t_table = "";
    let n_table = "";
    let m_table = "";
    t.forEach(function(v, k, m){
        let k_span = k;
        if (k.match(/^\d\w+\d$/)) {
            k_span = `<span class="ml-4">${k_span}</span>`;
        } else if (k.match(/^\d\w+$/)) {
            k_span = `<span class="ml-2">${k_span}</span>`;
        }
        t_table += `
    <tr>
      <th scope="row">${k_span}</th>
      <td>${v}</td>
    </tr>`;
    });
    n.forEach(function(v, k, m){
        let k_span = k;
        if (k.match(/^\d\w+\d$/)) {
            k_span = `<span class="ml-4">${k_span}</span>`;
        } else if (k.match(/^\d\w+$/)) {
            k_span = `<span class="ml-2">${k_span}</span>`;
        }
        n_table += `
    <tr>
      <th scope="row">${k_span}</th>
      <td>${v}</td>
    </tr>`;
    });
    m.forEach(function(v, k, m){
        let k_span = k;
        if (k.match(/^\d\w+\d$/)) {
            k_span = `<span class="ml-4">${k_span}</span>`;
        } else if (k.match(/^\d\w+$/)) {
            k_span = `<span class="ml-2">${k_span}</span>`;
        }
        m_table += `
    <tr>
      <th scope="row">${k_span}</th>
      <td>${v}</td>
    </tr>`;
    });

    let ajcc_table = `
<table class="table table-sm">
  <thead>
    <tr>
      <th scope="col">T Category</th>
      <th scope="col">T Criteria</th>
    </tr>
  </thead>
  <tbody>
    ${t_table}
  </tbody>
</table>

<table class="table">
  <thead>
    <tr>
      <th scope="col">N Category</th>
      <th scope="col">N Criteria</th>
    </tr>
  </thead>
  <tbody>
    ${n_table}
  </tbody>
</table>

<table class="table">
  <thead>
    <tr>
      <th scope="col">M Category</th>
      <th scope="col">M Criteria</th>
    </tr>
  </thead>
  <tbody>
    ${m_table}
  </tbody>
</table>
`;
    return ajcc_table;
}
