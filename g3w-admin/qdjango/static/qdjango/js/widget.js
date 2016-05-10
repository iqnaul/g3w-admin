ga.Qdjango = {};
ga.Qdjango.localVars = {};

ga.Qdjango.widgetEditor = {

	fadeNumber: 400,
	layerColumns: null,
	lawslist: null,
	layer: null,
	form: null,
	onAddCallback: null,
	widget: null,
	delimiterItems: ['.',',',';','|'],
	
	isset: function(o)
	{
		if(typeof o == 'undefined')
			return false
		else
			if(o===null)
				return false;
		return true;
	},
	
	getType: function(str)
	{
		if (str.indexOf("VARCHAR") !== -1 || str.indexOf("STRING") !== -1 || str.indexOf("TEXT") !== -1)
			return "textfield";
		if (str.indexOf("NUMERIC") !== -1 || str.indexOf("DOUBLE PRECISION") !== -1 || str.indexOf("INTEGER") !== -1 || str.indexOf("REAL") !== -1)
			return "numberfield";
	},
	
	onFormSubmit: function()
	{
		var that = this;
		var obj = {};
		var widget_type = this.widget ? this.widget.widget_type : $("#id_widget_type").val();
		switch( widget_type )
		{
			case "hyperlink":
				obj = [];
				$.each($(".rightCol").find(".blocco"), function(i,v)
				{
					v = $(v);
					var tmp = {
						field: v.find(".fieldSelect").find("select").val(),
						text: v.find(".textInput").find("input").val(),
						nuovo_field: v.find(".newFieldName").find("input").val(),
					};
					obj.push(tmp);
				});
				break;
			case "search":
				obj = {
					title: $(".rightCol").find("#title").val(), // TITOLO CAMPO DI RICERCA
					query: 'simpleWmsSearch', // MI SEMBRA CHE NON SERCA
					useWmsRequest: true, // SEMPRE A TRUE
					queryLayer: this.layer, // NOME DEL LAYER (VIENE GENERATO DA DJANGO)
					formItems: [],
					gridColumns: [
						 // COLONNE RISULTATI {"INTESTAZIONE COLONNA", "CAMPO DB DA VISUALIZZARE", "NON LO SO :)"}
					],
					selectionLayer: this.layer, // NOME DEL LAYER SU CUI ESEGUIRE LA SELEZIONE IN BASE AI RISULTATI (VIENE GENERATO DA DJANGO)
					selectionZoom: 0, // SELEZIONARE IL RISULTATO? (0,1)
					doZoomToExtent: true // ZOOMA AL RISULTATO? (TRUE,FALSE)
				};
				$.each($(".rightCol").find(".blocco"), function(i,v)
				{
					v = $(v);
					obj.formItems.push({
						xtype: that.getType(v.find(".fieldSelect").find("select").find("option:selected").data().type), // TIPO DI CAMPO //
						name: v.find(".fieldSelect").find("select").val(), // NOME DEL CAMPO DB
						fieldLabel: v.find(".textInput").find("input").val(), // ETICHETTA DEL CAMPO DI RICERCA
						allowBlank: true, // SE PUO' ESSERE VUOTO // mettere a true
						blankText: v.find(".descriptionInput").find("input").val(), // TESTO INIZIALE NEL CAMPO
						filterOp: v.find(".cmpOperatorSelect").find("select").val() // OPERATORE DI CONFRONTO (=,&lt;,&gt;,=&lt;,&gt;=,&lt;&gt;)
					});
				});
				$.each($(".rightCol").find(".bloccoGenerale").find(".resultFields").find(".row"), function(i,v){
					v = $(v);
					if (v.hasClass("labels") || !that.isset(v.find(".fieldSelect").find("select").val()))
						return true;
					obj.gridColumns.push({header: v.find(".textInput").find("input").val(), dataIndex: v.find(".fieldSelect").find("select").val(), menuDisabled: 'true'});
				});
				break;
			case "tooltip":
				obj = [];
				$.each($(".rightCol").find(".blocco"), function(i,v)
				{
					v = $(v);
					var tmp = {
						text: v.find(".textInput").find("input").val(),
						field: v.find(".fieldSelect").find("select").val(),
						image: v.find(".bImage").find("button").hasClass("active"),
					};
					if (tmp.image)
					{
						tmp.img_width = v.find(".imgSize").find(".img_width").val();
						tmp.img_height = v.find(".imgSize").find(".img_height").val();
					}
					obj.push(tmp);
				});
				break;
			case "law":
				var obj = {}
				$.each($(".rightCol").find(".blocco"), function(i,v)
				{
					v = $(v);
					obj = {
						field: v.find(".fieldSelect").find("select").val(),
						delimiter: v.find(".delimiterSelect").find("select").val(),
						law_id: parseInt(v.find(".lawSelect").find("select").val()),
					};
				});
				break;
			default:
				return;
		}
		$('#id_body').val(JSON.stringify(obj));
		this.form.submit();
	},
	
	generateGeneralParams: function(values)
	{
		var that = this;
		var fieldSelect = $('<select class="form-control" name="resultfield"></select>');
		$.each(this.layerColumns, function(i,v)
		{
			var selected = (that.isset(values) && that.isset(values.gridColumns) && values.gridColumns.length>0 && values.gridColumns[0].dataIndex === v.name)? "selected" : "";
			var option = $('<option value="'+v.name+'" '+selected+'>'+v.name+'</option>');
			fieldSelect.append(option);
		});
		
		var alInVa = (that.isset(values) && that.isset(values.gridColumns) && values.gridColumns.length>0 && that.isset(values.gridColumns[0].header))? values.gridColumns[0].header : "";
		var textInput = $('<input class="form-control" type="text" name="resultfield_text" value="'+alInVa+'">');
		
		var tiVa = (that.isset(values) && that.isset(values.title))? values.title : "";
		var title = $('<input class="form-control" type="text" name="title" id="title" value="'+tiVa+'">');
									
		var div = $('<div class="bloccoGenerale">\
						<div class="alert bg-danger row" style="margin-top: 20px">\
							<div class="row">\
								<div class="col-md-5">\
									<div class="row">\
										<div class="col-md-12"><span class="label label-warning">Titolo Ricerca</span></div>\
									</div>\
									<div class="row">\
										<div class="form-group col-md-12 title"></div>\
									</div>\
								</div>\
								<div class="col-md-7 resultFields">\
									<div class="row labels">\
										<div class="col-md-6"><span class="label label-warning">Campo Risultato</span></div>\
										<div class="col-md-6"><span class="label label-warning">Alias Risultato</span></div>\
									</div>\
									<div class="row">\
										<div class="col-md-6 fieldSelect"></div>\
										<div class="col-md-5 textInput"></div>\
										<div class="col-md-1"></div>\
									</div>\
									<div class="row">\
										<div class="col-md-6 fieldSelect"></div>\
										<div class="col-md-5 textInput"></div>\
										<div class="col-md-1"><button type="button" class="btn btn-warning add"><i class="glyphicon glyphicon-plus"></i></button></div>\
									</div>\
								</div>\
							</div>\
						</div>\
					</div>');
					
		var onAddAction = function(btn, values)
		{
			var fieldSelect = $('<select class="form-control" name="resultfield"></select>');
			$.each(that.layerColumns, function(i,v)
			{
				var selected = (that.isset(values) && values.dataIndex === v.name)? "selected" : "";
				var option = $('<option value="'+v.name+'" '+selected+'>'+v.name+'</option>');
				fieldSelect.append(option);
			});
		
			var alInVa = (that.isset(values) && that.isset(values.header))? values.header : "";
			var textInput = $('<input class="form-control" type="text" name="resultfield_text" value="'+alInVa+'" >');
			var lastRow = btn.parents(".row").first();
			var newRow = 	$(	'<div class="row">\
									<div class="col-md-6 fieldSelect"></div>\
									<div class="col-md-5 textInput"></div>\
									<div class="col-md-1"></div>\
								</div>');
			lastRow.find(".fieldSelect").append(fieldSelect);
			lastRow.find(".textInput").append(textInput);
			btn.parents(".resultFields").first().append(newRow);
			btn.appendTo(newRow.find(".col-md-1"));
			var remBtn = $('<button type="button" class="btn btn-default remove"><i class="glyphicon glyphicon-minus"></i></button>');
			remBtn.click(function(){ 
				$(this).parents(".row").first().remove(); 
			});
			lastRow.find(".col-md-1").append(remBtn);
		};
		
		div.find("button").click(function(){ onAddAction($(this)); });
		div.find(".title").append(title);
		div.find(".fieldSelect").first().append(fieldSelect);
		div.find(".textInput").first().append(textInput);
		$(".rightCol").append(div);
		
		if (that.isset(values) && that.isset(values.gridColumns) && values.gridColumns.length>1)
		{
			$.each(values.gridColumns, function(i,v){
				if (i === 0)
					return true;
				onAddAction(div.find("button.add"), v);
			});
		}
		
		div.fadeIn(this.fadeNumber);
	},
	
	generateSearchRow: function(values)
	{
		var that = this;
		var fieldSelect = $('<select class="form-control" name="searchfield"></select>');
		$.each(this.layerColumns, function(i,v)
		{
			var selected = (that.isset(values) && values.name === v.name)? "selected" : "";
			var option = $('<option value="'+v.name+'" '+selected+'>'+v.name+'</option>');
			option.data({type: v.type});
			fieldSelect.append(option);
		});
		
		var fiLaVa = (that.isset(values) && that.isset(values.fieldLabel))? values.fieldLabel : "";
		var textInput = $('<input class="form-control" type="text" name="searchfield_text" value="'+fiLaVa+'" >');
		
		var blTeVa = (that.isset(values) && that.isset(values.blankText))? values.blankText : "";
		var descriptionInput = $('<input class="form-control" type="text" name="searchfield_description" value="'+blTeVa+'" >');
		
		var cmpOperatorSelect = $('<select class="form-control" name="comparison_operator">\
										<option value="=">=</option>\
										<option value="&gt;">&gt;</option>\
										<option value="&lt;">&lt;</option>\
										<option value="&lt;&gt;">&lt;&gt;</option>\
										<option value="&gt;=">&gt;=</option>\
										<option value="&lt;=">&lt;=</option>\
										<option value="LIKE">LIKE</option>\
									</select>');
		if (this.layer_type != 'spatialite'){
			cmpOperatorSelect.append('<option value="ILIKE">ILIKE</option>')
		}
		if (that.isset(values) && that.isset(values.filterOp))
			cmpOperatorSelect.val($('<div/>').html(values.filterOp).text());
									
		var div = $('<div class="blocco" style="display: none">\
						<div class="alert bg-success row" style="margin-top: 20px">\
							<div class="row">\
								<button type="button" class="close">&times;</button>\
							</div>\
							<div class="row">\
								<div class="col-md-3"><span class="label label-success">Campo</span></div>\
								<div class="col-md-3"><span class="label label-success">Alias</span></div>\
								<div class="col-md-3"><span class="label label-success">Descrizione</span></div>\
								<div class="col-md-3"><span class="label label-success">Operatore comparazione</span></div>\
							</div>\
							<div class="row">\
								<div class="col-md-3 fieldSelect"></div>\
								<div class="col-md-3 textInput"></div>\
								<div class="col-md-3 descriptionInput"></div>\
								<div class="col-md-3 cmpOperatorSelect"></div>\
							</div>\
						</div>\
						<div class="row text-center">\
							<select class="form-control logic_operator" name="logic_operator" class="logic_operator" style="width: 100px; display: none">\
								<option value="and">AND</option>\
							</select>\
						</div>\
					</div>');
		
		div.find(".close").click(function(){
			var blocco = $(this).parents(".blocco").first();
			blocco.find(".logic_operator").fadeOut(that.fadeNumber, function(){ $(this).remove(); });
			$(this).parents(".alert").first().fadeOut(that.fadeNumber, function(){ 
				$(this).alert('close');
				blocco.remove();
			});
			$(".logic_operator").last().fadeOut(that.fadeNumber);
		});
		div.find(".fieldSelect").append(fieldSelect);
		div.find(".textInput").append(textInput);
		div.find(".descriptionInput").append(descriptionInput);
		div.find(".cmpOperatorSelect").append(cmpOperatorSelect);
		
		$(".rightCol").append(div);
		div.fadeIn(this.fadeNumber);
	},
	
	generateTooltipRow: function(values)
	{
		var that = this;
		
		var alInVa = (that.isset(values) && that.isset(values.text))? values.text : "";
		var textInput = $('<input class="form-control" type="text" name="field_text" value="'+alInVa+'">');
		
		var fieldSelect = $('<select class="form-control" name="field" ></select>');
		$.each(that.layerColumns, function(i,v)
		{
			var selected = (that.isset(values) && values.field === v.name)? "selected" : "";
			var option = $('<option value="'+v.name+'" '+selected+'>'+v.name+'</option>');
			fieldSelect.append(option);
		});
		
		var bImage = $('<button type="button" class="btn"><i class="glyphicon glyphicon-remove"></i></button>');
		
		var imWiVa = (that.isset(values) && that.isset(values.img_width))? values.img_width : "";
		var imHeVa = (that.isset(values) && that.isset(values.img_height))? values.img_height : "";
									
		var div = $('<div class="alert bg-success row blocco" style="margin-top: 30px; display: none">\
						<div class="row">\
							<button type="button" class="close">&times;</button>\
						</div>\
						<div class="row">\
							<div class="col-md-4"><span class="label label-success">Testo</span></div>\
							<div class="col-md-4"><span class="label label-success">Campo</span></div>\
							<div class="col-md-1"><span class="label label-success">Immagine</span></div>\
							<div class="col-md-3 imgSizeLabel" style="display:none"><span class="label label-success">Dimensioni</span></div>\
						</div>\
						<div class="row">\
							<div class="col-md-4 textInput"></div>\
							<div class="col-md-4 fieldSelect"></div>\
							<div class="col-md-1 bImage"></div>\
							<div class="col-md-3 imgSize" style="display: none">\
								<input class="form-control col-md-1"  type="text" class="img_width" placeholder="width" value="'+imWiVa+'">\
								<input class="form-control col-md-1" type="text" class="img_height" placeholder="height" value="'+imHeVa+'">\
							</div>\
						</div>\
					</div>');		
		
		div.find(".close").click(function(){
			$(this).parents(".alert").first().fadeOut(that.fadeNumber, function(){ 
				$(this).alert('close');
				$(this).remove();
			});
		});
		bImage.click(function(){ // va in esecuzione prima del cambiamento della classe active
			if (!$(this).hasClass("active"))
			{
				$(this).addClass("btn-success").addClass("active");
				$(this).html('<i class="glyphicon glyphicon-ok"></i>');
				$(this).parents(".row").first().find(".imgSize").fadeIn(that.fadeNumber);
				$(this).parents(".blocco").first().find(".imgSizeLabel").fadeIn(that.fadeNumber);
			}
			else
			{
				$(this).removeClass("btn-success").removeClass("active");
				$(this).html('<i class="glyphicon glyphicon-remove"></i>');
				$(this).parents(".row").first().find(".imgSize").fadeOut(that.fadeNumber);
				$(this).parents(".blocco").first().find(".imgSizeLabel").fadeOut(that.fadeNumber);
			}
		});
		
		div.find(".fieldSelect").append(fieldSelect);
		div.find(".textInput").append(textInput);
		div.find(".bImage").append(bImage);
		
		$(".rightCol").append(div);
		
		if (that.isset(values) && that.isset(values.image) && values.image)
			bImage.click();
			
		div.fadeIn(that.fadeNumber);
	},

	generateLawRow: function(values)
	{
		var that = this;

		var fieldSelect = $('<select class="form-control" name="field" ></select>');
		$.each(that.layerColumns, function(i,v)
		{
			var selected = (that.isset(values) && values.field === v.name)? "selected" : "";
			var option = $('<option value="'+v.name+'" '+selected+'>'+v.name+'</option>');
			fieldSelect.append(option);
		});

		var delimiterSelect = $('<select class="form-control" name="delimiter" ></select>');
		$.each(that.delimiterItems, function(i,v)
		{
			var selected = (that.isset(values) && values.delimiter === v)? "selected" : "";
			var option = $('<option value="'+v+'" '+selected+'>'+v+'</option>');
			delimiterSelect.append(option);
		});

		var lawSelect = $('<select class="form-control" name="law_id" ></select>');
		$.each(that.lawslist, function(i,v)
		{
			var selected = (that.isset(values) && values.law_id === v.id)? "selected" : "";
			var option = $('<option value="'+v.id+'" '+selected+'>'+v.name+'('+v.variation+')'+'</option>');
			lawSelect.append(option);
		});

		var div = $('<div class="alert bg-success row blocco" style="margin-top: 30px; display: none">\
						<div class="row">\
							<div class="col-md-5"><span class="label label-success">Campo</span></div>\
							<div class="col-md-2"><span class="label label-success">Delimiter</span></div>\
							<div class="col-md-5"><span class="label label-success">Law</span></div>\
						</div>\
						<div class="row">\
							<div class="col-md-5 fieldSelect"></div>\
							<div class="col-md-2 delimiterSelect"></div>\
							<div class="col-md-5 lawSelect"></div>\
						</div>\
					</div>');


		div.find(".fieldSelect").append(fieldSelect);
		div.find(".delimiterSelect").append(delimiterSelect);
		div.find(".lawSelect").append(lawSelect);
		$(".rightCol").append(div);
		div.fadeIn(that.fadeNumber);
	},
	
	generateHyperlinkRow: function(values)
	{
		var that = this;
		var fieldSelect = $('<select name="field"></select>');
		$.each(this.layerColumns, function(i,v)
		{
			var selected = (that.isset(values) && values.field === v.name)? "selected" : "";
			var option = $('<option value="'+v.name+'" '+selected+'>'+v.name+'</option>');
			fieldSelect.append(option);
		});
		
		var alInVa = (that.isset(values) && that.isset(values.text))? values.text : "";
		var textInput = $('<input type="text" name="field_text" value="'+alInVa+'">');
		var neFiVa = (that.isset(values) && that.isset(values.nuovo_field))? values.nuovo_field : "";
		var newFieldName = $('<input type="text" name="new_field_name" value="'+neFiVa+'">');
									
		var div = $('<div class="well blocco alert alert-success row" style="margin-top: 20px; display: none">\
						<div class="row">\
							<button type="button" class="close">&times;</button>\
						</div>\
						<div class="row">\
							<div class="col-md-4"><span class="label label-success">Campo</span></div>\
							<div class="col-md-4"><span class="label label-success">Alias</span></div>\
							<div class="col-md-4"><span class="label label-success">Nome nuovo field</span></div>\
						</div>\
						<div class="row">\
							<div class="col-md-4 fieldSelect"></div>\
							<div class="col-md-4 textInput"></div>\
							<div class="col-md-4 newFieldName"></div>\
						</div>\
					</div>');		
		
		div.find(".close").click(function(){ 
			$(this).parents(".alert").first().fadeOut(that.fadeNumber, function(){ 
				$(this).alert('close');
				$(this).remove();
			});
		});
		div.find(".fieldSelect").append(fieldSelect);
		div.find(".textInput").append(textInput);
		div.find(".newFieldName").append(newFieldName);
		
		$(".rightCol").append(div);
		div.fadeIn(this.fadeNumber);
	},
	
	onWidgetTypeChange: function(el)
	{
		var that = this;
		$("#id_body").val("");
		$(".rightCol").empty();
		switch( el.val() )
		{
			case "hyperlink":
				this.generateHyperlinkRow();
				this.onAddCallback = this.generateHyperlinkRow;
				break;
			case "search":
				this.generateGeneralParams();
				this.generateSearchRow();
				this.onAddCallback = function(){ $(".rightCol").find(".logic_operator").last().fadeIn(that.fadeNumber); that.generateSearchRow(); };
				break;
			case "tooltip":
				this.generateTooltipRow();
				this.onAddCallback = this.generateTooltipRow;
				break;
			case "law":
				this.generateLawRow();
				break;
			default:
				return;
		}
		if(el.val() != 'law')
		{
			var addDiv = $('<div class="row text-center">\
							<button type="button" class="btn btn-success addRow"><i class="glyphicon glyphicon-plus"></i> Aggiungi</button>\
						</div>');
			addDiv.find(".addRow").click(function(){
				var div = $(this).parents("div").first();
				that.onAddCallback();
				div.appendTo($(".rightCol"));
			});
			$(".rightCol").append(addDiv);
		}

		

	},
	

	
	showStoredValues: function()
	{
		var that = this;
		//$("#id_name").val(this.widget.name);
		//$("#id_widget_type").val(this.widget.widget_type);
		//$("#id_body").val(JSON.stringify(this.widget.body));
		$(".rightCol").empty();
		
		switch(this.widget.widget_type)
		{
			case "hyperlink":
				$.each(this.widget.body, function()
				{
					that.generateHyperlinkRow(this);
				});
				this.onAddCallback = this.generateHyperlinkRow;
				break;
			case "search":
				this.generateGeneralParams(this.widget.body);
				$.each(this.widget.body.formItems, function(i)
				{
					that.generateSearchRow(this);
					if (i < that.widget.body.formItems.length-1)
						$(".rightCol").find(".logic_operator").last().fadeIn(that.fadeNumber);
				});
				this.onAddCallback = function(){ $(".rightCol").find(".logic_operator").last().fadeIn(that.fadeNumber); that.generateSearchRow(); };
				break;
			case "tooltip":
				$.each(this.widget.body, function()
				{
					that.generateTooltipRow(this);
				});
				this.onAddCallback = this.generateTooltipRow;
				break;
			case "law":
				this.generateLawRow(this.widget.body);
				this.onAddCallback = this.generateLawRow;
				break;
			default:
				return;
		}
		if(this.widget.widget_type != 'law') {
			var addDiv = $('<div class="row text-center">\
							<button type="button" class="btn btn-success addRow"><i class="glyphicon glyphicon-plus"></i> Aggiungi</button>\
						</div>');

			addDiv.find(".addRow").click(function () {
				var div = $(this).parents("div").first();
				that.onAddCallback();
				div.appendTo($(".rightCol"));
			});
			$(".rightCol").append(addDiv);
		}
	},
	
	setLayerData: function(data,layer,layer_type)
	{
		this.layerColumns = data;
		this.layer = layer;
		this.layer_type = layer_type;
	},

	 init: function()
	{
		var that = this;
		this.setLayerData(ga.Qdjango.localVars['layer_columns'],ga.Qdjango.localVars['layer_name'],ga.Qdjango.localVars['layer_type']);
		this.lawslist = ga.Qdjango.localVars['laws_list']
		if (ga.Qdjango.localVars['update']){
			if (!$.isEmptyObject(ga.Qdjango.localVars['widget'])){
				this.widget = ga.Qdjango.localVars['widget'];
				this.showStoredValues();
			}
		}
		this.form = $("#widget_form");
		ga.currentForm.on('preSendForm', that.onFormSubmit);
		/*
		var button = this.form.find("button.confirm");
		this.form.find("button.confirm").click(function(){ 
			that.onFormSubmit(); 
		});
		*/
		$("#id_widget_type").change(function(){ that.onWidgetTypeChange($(this)); });
	}
};