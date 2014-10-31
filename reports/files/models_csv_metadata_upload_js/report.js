__report = {"info":{"file":"models/csv_metadata_upload.js","fileShort":"models/csv_metadata_upload.js","fileSafe":"models_csv_metadata_upload_js","link":"files/models_csv_metadata_upload_js/index.html"},"complexity":{"aggregate":{"line":10,"complexity":{"sloc":{"physical":94,"logical":44},"cyclomatic":3,"halstead":{"operators":{"distinct":10,"total":109,"identifiers":["__stripped__"]},"operands":{"distinct":51,"total":163,"identifiers":["__stripped__"]},"length":272,"vocabulary":61,"difficulty":15.980392156862745,"volume":1613.1605558171052,"effort":25778.938293940013,"bugs":0.5377201852723684,"time":1432.163238552223},"params":26}},"functions":[{"name":"make_db_id_query","line":10,"complexity":{"sloc":{"physical":12,"logical":4},"cyclomatic":1,"halstead":{"operators":{"distinct":6,"total":11,"identifiers":["__stripped__"]},"operands":{"distinct":9,"total":15,"identifiers":["__stripped__"]},"length":26,"vocabulary":15,"difficulty":5,"volume":101.57915548582149,"effort":507.89577742910745,"bugs":0.033859718495273826,"time":28.21643207939486},"params":2}},{"name":"make_insert_custom_field_names_query","line":23,"complexity":{"sloc":{"physical":13,"logical":5},"cyclomatic":2,"halstead":{"operators":{"distinct":8,"total":16,"identifiers":["__stripped__"]},"operands":{"distinct":10,"total":19,"identifiers":["__stripped__"]},"length":35,"vocabulary":18,"difficulty":7.6,"volume":145.94737505048093,"effort":1109.200050383655,"bugs":0.04864912501682698,"time":61.622225021314165},"params":1}},{"name":"make_insert_required_field_names_query","line":37,"complexity":{"sloc":{"physical":10,"logical":5},"cyclomatic":2,"halstead":{"operators":{"distinct":8,"total":16,"identifiers":["__stripped__"]},"operands":{"distinct":10,"total":19,"identifiers":["__stripped__"]},"length":35,"vocabulary":18,"difficulty":7.6,"volume":145.94737505048093,"effort":1109.200050383655,"bugs":0.04864912501682698,"time":61.622225021314165},"params":1}},{"name":"make_get_custom_fields_query","line":48,"complexity":{"sloc":{"physical":10,"logical":4},"cyclomatic":1,"halstead":{"operators":{"distinct":6,"total":9,"identifiers":["__stripped__"]},"operands":{"distinct":7,"total":12,"identifiers":["__stripped__"]},"length":21,"vocabulary":13,"difficulty":5.142857142857142,"volume":77.70923408096293,"effort":399.6474895592379,"bugs":0.025903078026987644,"time":22.20263830884655},"params":1}},{"name":"csvMetadataUpload","line":64,"complexity":{"sloc":{"physical":2,"logical":0},"cyclomatic":1,"halstead":{"operators":{"distinct":0,"total":0,"identifiers":["__stripped__"]},"operands":{"distinct":0,"total":0,"identifiers":["__stripped__"]},"length":0,"time":0,"bugs":0,"effort":0,"volume":0,"difficulty":0,"vocabulary":0},"params":0}},{"name":"<anonymous>.get_dataset_ids","line":67,"complexity":{"sloc":{"physical":7,"logical":2},"cyclomatic":1,"halstead":{"operators":{"distinct":4,"total":5,"identifiers":["__stripped__"]},"operands":{"distinct":8,"total":11,"identifiers":["__stripped__"]},"length":16,"vocabulary":12,"difficulty":2.75,"volume":57.359400011538504,"effort":157.73835003173087,"bugs":0.01911980000384617,"time":8.763241668429494},"params":3}},{"name":"<anonymous>","line":70,"complexity":{"sloc":{"physical":3,"logical":1},"cyclomatic":1,"halstead":{"operators":{"distinct":1,"total":1,"identifiers":["__stripped__"]},"operands":{"distinct":4,"total":6,"identifiers":["__stripped__"]},"length":7,"vocabulary":5,"difficulty":0.75,"volume":16.253496664211536,"effort":12.190122498158651,"bugs":0.005417832221403845,"time":0.6772290276754807},"params":3}},{"name":"<anonymous>.insert_custom_field_names","line":75,"complexity":{"sloc":{"physical":10,"logical":4},"cyclomatic":1,"halstead":{"operators":{"distinct":5,"total":10,"identifiers":["__stripped__"]},"operands":{"distinct":10,"total":15,"identifiers":["__stripped__"]},"length":25,"vocabulary":15,"difficulty":3.75,"volume":97.67226489021297,"effort":366.27099333829864,"bugs":0.03255742163007099,"time":20.34838851879437},"params":2}},{"name":"<anonymous>","line":81,"complexity":{"sloc":{"physical":3,"logical":1},"cyclomatic":1,"halstead":{"operators":{"distinct":1,"total":1,"identifiers":["__stripped__"]},"operands":{"distinct":4,"total":6,"identifiers":["__stripped__"]},"length":7,"vocabulary":5,"difficulty":0.75,"volume":16.253496664211536,"effort":12.190122498158651,"bugs":0.005417832221403845,"time":0.6772290276754807},"params":3}},{"name":"<anonymous>.insert_required_field_names","line":86,"complexity":{"sloc":{"physical":10,"logical":4},"cyclomatic":1,"halstead":{"operators":{"distinct":5,"total":10,"identifiers":["__stripped__"]},"operands":{"distinct":10,"total":15,"identifiers":["__stripped__"]},"length":25,"vocabulary":15,"difficulty":3.75,"volume":97.67226489021297,"effort":366.27099333829864,"bugs":0.03255742163007099,"time":20.34838851879437},"params":2}},{"name":"<anonymous>","line":92,"complexity":{"sloc":{"physical":3,"logical":1},"cyclomatic":1,"halstead":{"operators":{"distinct":1,"total":1,"identifiers":["__stripped__"]},"operands":{"distinct":4,"total":6,"identifiers":["__stripped__"]},"length":7,"vocabulary":5,"difficulty":0.75,"volume":16.253496664211536,"effort":12.190122498158651,"bugs":0.005417832221403845,"time":0.6772290276754807},"params":3}},{"name":"<anonymous>.select_custom_fields_names","line":97,"complexity":{"sloc":{"physical":7,"logical":2},"cyclomatic":1,"halstead":{"operators":{"distinct":4,"total":5,"identifiers":["__stripped__"]},"operands":{"distinct":7,"total":9,"identifiers":["__stripped__"]},"length":14,"vocabulary":11,"difficulty":2.5714285714285716,"volume":48.43204266092217,"effort":124.53953827094274,"bugs":0.016144014220307392,"time":6.918863237274596},"params":2}},{"name":"<anonymous>","line":100,"complexity":{"sloc":{"physical":3,"logical":1},"cyclomatic":1,"halstead":{"operators":{"distinct":1,"total":1,"identifiers":["__stripped__"]},"operands":{"distinct":4,"total":6,"identifiers":["__stripped__"]},"length":7,"vocabulary":5,"difficulty":0.75,"volume":16.253496664211536,"effort":12.190122498158651,"bugs":0.005417832221403845,"time":0.6772290276754807},"params":3}}],"maintainability":79.32186076123598,"params":2,"module":"models/csv_metadata_upload.js"},"jshint":{"messages":[]}}