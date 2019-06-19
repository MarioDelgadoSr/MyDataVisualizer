

var gltfVisual;

//Developing
$(document).ready(function(){

	
	var blob = b64toBlob(ForkliftGLTF, 'model/gltf-binary'); 
	var blobUrl = URL.createObjectURL(blob);   

	gltfLoader = new THREE.GLTFLoader();

	gltfLoader.load( blobUrl, function( gltfDataFromFile ) {  
	
		gltfVisual = gltfDataFromFile;
		
		var mLayout = new mainLayout();
		mLayout.display(document.body);
		
		URL.revokeObjectURL( blobUrl );	//https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL						
	
	}, //Loader function handlder
	
	undefined, function ( error ) {   //Error Handling

		alert( error );

	} ); //gltfLoader		
	
	
	function b64toBlob(b64Data, contentType, sliceSize) {  
	  contentType = contentType || '';
	  sliceSize = sliceSize || 512;

	  var byteCharacters = atob(b64Data); //https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
	  var byteArrays = [];

	  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		var slice = byteCharacters.slice(offset, offset + sliceSize);

		var byteNumbers = new Array(slice.length);
		for (var i = 0; i < slice.length; i++) {
		  byteNumbers[i] = slice.charCodeAt(i);
		} //for

		var byteArray = new Uint8Array(byteNumbers);

		byteArrays.push(byteArray);
	  } //for
		
	  var blob = new Blob(byteArrays, {type: contentType});
	  return blob;
	} //b64toBlob	
	
	
	

});

var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';   												//Panel styling		
		

function mainLayout(){
	
	var scope = this;
	
	this.languageIndex = 0;																												//Initially set to English(0)
	this.languageCodes = ["en","es","sv","fi","fr","da","lt","pl","id","fil","zh-CN","cs","nl","et",
	                      "de","el","he","is","it","ja","ko","lv","nb","fa","pt","ro","ru","sr","sk","sl"];
	//ToDo Translate languges themsleves	
	this.languages = ["English","Spanish","Swedish","Finnish","French","Danish","Lithuanian","Polish","Indonesian",
					 "Filipino","Chinese","Czech","Dutch","Estonian","German","Greek","Hebrew","Icelandic","Italian",
					 "Japanese","Korean","Latvian","Norwegian","Persian","Portuguese","Romanian","Russian","Serbian","Slovak","Slovenian"];
					 
    this.localLanguage =  this.languageCodes[this.languageIndex];	

	this.appContainer = undefined;
	
	this.dataVisual = undefined;
	this.myDataVisualizer = undefined;

	this.display = function(appContainer){

		scope.appContainer = appContainer;

		var dataVisualizerLayout = $(document.createElement("div"));
		
		$(appContainer)
			.css({"margin":"0px"}) 			 																							//Layout Height Design Pattern: https://github.com/vitmalina/w2ui/issues/105 
			.append(dataVisualizerLayout);
			
																																		//Main Panel
		dataVisualizerLayout
			.css({"position": "absolute", "width": "100%", "height": "100%"})  															//https://github.com/vitmalina/w2ui/issues/105
			.w2layout({	name: 'mainPanel', 																								//http://w2ui.com/web/docs/1.5/layout
						panels: 
						  [	
							{ type: 'top', size: 30, style: pstyle},   																	//Toolbar
							{ type: 'left', size: '50%', resizable: true, style: pstyle },  											//Data Analyzer
							{ type: 'main',  resizable: true,  style: pstyle,		
							}, //main
							//{ type: 'preview', size: '75%', resizable: true, content: visualizerDiv }  								//The display panel for the image
							{ type: 'preview', size: '75%', resizable: true }  															//The display panel for the image
						] //panels
			}); //dataVisualizerLayout

		
		const dataKey = Object.keys(ForkliftData[0])[0];    				
		const visualKey = "name";                 	

		scope.dataVisual =  new dataVisual();	
		scope.dataVisual.joinDataToVisual(ForkliftData, gltfVisual, dataKey, visualKey);
		scope.dataVisual.selectionLinks = [];  //No links for now	
		scope.dataVisual.translate =  translate;
		//scope.dataVisual.joinDataToVisual([], gltfVisual, dataKey, visualKey);  //testing with no data
		
		scope.myDataVisualizer = new myDataVisualizer();
		scope.myDataVisualizer.display(w2ui["mainPanel"], scope.dataVisual, "ForkLift.gltf", "Forklift.csv")		
				



	} //display

	this.refreshMyDataVisualizer = function(){
		
		//ToDo Refresh...for example change in laguageIndex	
		//Refresh only the specific w2ui sub-component that have languge components.  Layout Headers, Grid toolbars
		//Pattern: w2ui['dataGrid'].toolbar.get('styleGrid').text = "vvvvv Grid"  MUST USE .text not .caption.... there's a bug
		// w2ui['dataGrid'].toolbar.refresh()        
		
	}
	
	this.setLanguageIndex = function(newIndex){
		
		that.languageIndex =  newIndex;
		that.refreshMyDataVisualizer();	
		
	} // setLanguageIndex
	
	this.destroy =  function (){
		
		Object.keys(w2ui).forEach( function (objKey){  if ( instr(objKey.indexOf(scope.visualName + "_") != -1) )  w2ui[objKey].destroy(); } );  		//Remove all w2ui instances for this object
		
		$(scope.appContainer).find(":first-child").remove();
		
	} //destroy


	function translate(prop){
		
		return translations[scope.localLanguage][prop];			
	
	} //translate	

	

} //mainLayout


function myDataVisualizer(){
	
	
	var scope = this; 																													//Reference this with methods	
	
	this.appVersion = 1.1;
	this.visualName = undefined;																										//Visual Name parm in display method
	this.visualizer = undefined;																											//Reference to object that build Three.js scene; has .destroy method
	this.parentLayout = undefined;																										//Referenced by destroy method to delete firstChild

	this.destroy =  function (){
		
		scope.visualizer.destroy();

		
	}
	
	function fnUnique(arr) {    //returns only uniques in an array
		var hash = {}, result = [];
		for ( var i = 0, l = arr.length; i < l; ++i ) {
			if ( !hash.hasOwnProperty(arr[i]) ) { 
				hash[ arr[i] ] = true;
				result.push(arr[i]);
			} //id
		} //for
	return result;
	} //fnUnique	
	
	function fnDecimaPlaces(num) {
	  var match = (''+num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
	  if (!match) { return 0; }
	  return Math.max(
		   0,
		   // Number of digits right of decimal point.
		   (match[1] ? match[1].length : 0)
		   // Adjust for scientific notation.
		   - (match[2] ? +match[2] : 0));
	} //fnDecimaPlaces		


	this.display = function(parentLayout, dataVisual, visualName, dataName ){
	
		scope.parentLayout = parentLayout;
		scope.visualName =  visualName.split(".")[0];																					//If "." in name, just use first portion
		dataVisual.name =  scope.visualName;																							
		dataVisual.colorPrefix = "COLOR_";																								//If properity has this prefix, it's a defined color
	
		var bInitiating = true;  																										//Used when initiaing grid's resize event
		var timeOutVar = null;																											//Used by scalng tool to scale visaul aftet 1 second pause	
		
		var visualizerDiv =	$(document.createElement("div")); 																			//JQuery reference to right panel, DOM reference is visualizerDiv[0]
					
		parentLayout.content("preview", visualizerDiv[0]);																				//The visual scene's container	
		
		// parentLayout.content("preview") //jQuery reference to div for visual 
		

		//Add Predfinded Scale Canvas and Scale Slider
		
		var predefinedScale = $(document.createElement("div"));			
		
		var table = $(document.createElement("table")).appendTo(predefinedScale);					
		
		var tableRow = $(document.createElement("tr")).appendTo(table);
		
		var sliderTD = $(document.createElement("td")).appendTo(tableRow);				
		
		var scaleTD = $(document.createElement("td")).appendTo(tableRow);
									   					   
		var legend =  $(document.createElement("div"))	

		$().w2layout({
		name: scope.visualName  + '_scaleControlLayout',
		panels: [
			{ type: 'left', resizable: true, size: "50%", style: pstyle, title:'Visualization Color Scale',
			  content: predefinedScale[0] }, //Add Slider Control to Panel
			{ type: 'main', resizable: true, style: pstyle, title: "Legend", content: legend }
		]
		});
	
		//Build 2 panel Analyzer, assign controller content to top panel and continue with fnGetObjectListAndLoad when rendered
		$().w2layout({ 	name: scope.visualName  +  '_analyzerLayout',
						panels: [
							{ type: 'main', overflow: "auto", size: "70%", resizable: true, style: pstyle },							
							{ type: 'preview', size:"30%", style: pstyle, overflow: "auto", resizable: true, content: w2ui[scope.visualName  + "_scaleControlLayout"] }
						],
						onRender: function(event){
							event.done(function() {    				////http://w2ui.com/web/docs/1.5/utils/events
							
								//fnGetObjectListAndLoad(folderIndex, languageIndex);
							
							}); //event.done
						}
		});

		
		parentLayout.content('left',w2ui[scope.visualName  + "_analyzerLayout"]);	
					
		if (dataVisual.data.length == 0){  																									//No Data, just image
						
			parentLayout.hide('left');   																									//Hide Data Analyzer Panel
			parentLayout.resize(true);
						
		} //if
		else {																																//Build DataGrid	
			
			dataVisual.dataTypes = fnGetDataTypes(dataVisual.data);
			fnBuildDataGrid(dataVisual);
			dataVisual.dataGrid.header = dataName;
			dataVisual.dataGrid.show.header = true;
								
			//Data Grid
			w2ui[scope.visualName  +  '_analyzerLayout'].content('main',dataVisual.dataGrid); //http://w2ui.com/web/docs/1.5/utils/plugins
			
			//visualizer.setLegendContainer($("#legend")[0]);
			//visualizer.setLegendContainer(legend[0]);

		
			
		}


		function fnGetDataTypes(visualizeData) {	
	
			var dataTypes = {};
		
			for (var i = 0; i < visualizeData.length; i++ ){
											
				// CALCULATE DATATYPES by inspecting each column of each row 	
					var mergedRow = i == 0 ? {} : mergedRow;
					Object.assign(mergedRow, visualizeData[i]);
					var aKeys = Object.keys(mergedRow);
					aKeys.forEach(function(key) { 
						if (dataTypes[key]) {
							dataTypes[key].type = dataTypes[key].type == "text" ?  "text"  :  isNaN(Number(mergedRow[key])) ? "text" : "float";
						} //if
						else {
							dataTypes[key] =  {type: isNaN(Number(mergedRow[key])) ? "text" : "float"};
						} //else
							
							
						
					}); //aKeys.forEach
																					
			} //for 	
			
			//For float type, determine number of decimal places and aUniqueCategories

			var aKeys = Object.keys(visualizeData[0]);
			aKeys.forEach(function(key) { 
			
				if (dataTypes[key].type == "float") {
					
					dataTypes[key].numDecimals = 0;
					for (var i = 0; i < visualizeData.length; i++ ){
						
						dataTypes[key].numDecimals = Math.max( dataTypes[key].numDecimals,fnDecimaPlaces(visualizeData[i][key]));
		
					}//for
					
				} //if
				
				var dataType =  dataTypes[key].type;
				
				dataTypes[key].aUniqueCategories = fnUnique(visualizeData.map(function (row) {return dataType == "float" ? parseFloat(row[key]): row[key]}) )
					.sort(function(a,b){  //https://stackoverflow.com/questions/4373018/sort-array-of-numeric-alphabetical-elements-natural-sort
						  var a1=typeof a, b1=typeof b;
						  return a1<b1 ? -1 : a1>b1 ? 1 : a<b ? -1 : a>b ? 1 : 0;
					});

			}); //aKeys.forEach
			
			
			return dataTypes;
		
																			
		} // fnGetDataTypes


		function fnBuildDataGrid(dataVisual){
				
			var dataGridProps  = fnGetDataGridProperties(dataVisual); 

			if (!dataVisual.dataRefreshing) {
				dataVisual.dataGrid = $().w2grid(dataGridProps);		
			}	
			else { //Else reuse the existing grid
		
				// $.extend(true,dataVisual.dataGrid,dataGridProps);  //Won't work, replaces toolbar.items array rather than merging it
				["columns","columnGroups","records","sortData","searches"]
					.forEach(function(key){
						
						dataVisual.dataGrid[key] = dataGridProps[key];   //replace possibly newly built sub-components of dataGrid from re-load of data
							
					}); //forEach
				
				
				dataVisual.dataGrid.render();
				
			}// else
				

			function fnGetDataGridProperties(dataVisual) {
				
				var translate =  dataVisual.translate;			
																	
				var gridRecords =  $.extend(true,[],dataVisual.data); //make copy 	

				var dataTypes = dataVisual.dataTypes;

				dataTypes.recid = {type: "float", numDecimals: 0, aUniqueCategories: []};
												
				var dataFields = Object.keys(gridRecords[0]);
				
				var floatFields = dataFields
									 .filter(function (key){ return dataTypes[key].type == "float"; });
				
				gridRecords.forEach(function (record, i){
																		
										record.recid = i;  //Add recid which is reserved for data grid, can not be a recored in visual data	
										dataTypes.recid.aUniqueCategories.push(record.recid); //Add entry into recid's unique categories...for Legend generation	

										
				}); //gridRecords.forEach 
				
				
				var columns = [];
				
				columns.push({field:"recid", caption:"Data Row", sortable:true, searchable:true, hidden: false, render: fnDataGridColumnRender });   //Always located in column 1 associted with key used for join in Column 2
				columns.push({field:dataVisual.dataKey, caption: dataVisual.dataKey + " (Data Key)", //Always in column 2
								 render: fnDataGridColumnRender, sortable:true, searchable:true , hidden: false} 
							  );	
							  
				if (dataTypes[dataVisual.colorPrefix + dataVisual.dataKey]) //position here for column grouping
					columns.push( {field: dataVisual.colorPrefix +  dataVisual.dataKey, 
									caption:"Color (Preset)" , 
									render: fnDataGridColumnRender, 
									sortable: true, hidden: false, 
									searchable: true} );	//if key has color, Column 3	  
					
				//***********************************	
				//Start Columns 4 through dataFields.length					
				//***********************************

				bColorField = false;  //Tracks Pre-assigned color fields	

				dataFields
					.filter(function(columnName){return columnName != "recid" })			
					.filter(function(columnName){return columnName != dataVisual.dataKey })			
					.filter(function(columnName){return !fnIsPresetColor(columnName)  })
					.forEach(function(field,i){ 
					
									if (field != dataVisual.dataKey){
										var column = {field:field, caption:field + " (Scaled)", sortable: true, searchable: true, hidden: false, render: fnDataGridColumnRender};
										columns.push(column);
										
									} //if
									
									if (dataTypes[dataVisual.colorPrefix + field]){ //If the current field in loop also has predefined color; position here for column grouping
										columns[columns.length - 1].caption =  "Value (Scaled)";
										
										var colorColumn = {field: dataVisual.colorPrefix + field, hidden: false, 
															caption: "Color (Preset)", sortable: true, searchable: false, render: fnDataGridColumnRender};
										
										columns.push( colorColumn );
										
										bColorField = true;   //data has at least 1 pre-set color field
									} //if	, 

				}); //dataField.forEach		
								
			
				if (dataVisual.selectionLinks.length > 0) {
					columns.push({field: "_links", caption:"Link(s)", sortable: false, searchable: false, hidden: false,
								  render: function(record,rowIndex,columnIndex) {
									
											var select = "<select "
											select += " style='width: 100% !important;'"; //Fix for select width issue when rendered in column: https://github.com/vitmalina/w2ui/issues/1827#issuecomment-494770546
											select += " onchange='";
											select += "var grid = $(this).closest(\"*[id*=grid]\");";
											select += "var appdataVisual = w2ui[grid.attr(\"id\").split(\"_\")[1]]._this_visualizer_dataVisual;";  //  https://www.w3schools.com/jquery/traversing_closest.asp and https://stackoverflow.com/questions/1487792/jquery-find-element-whose-id-has-a-particular-pattern
											select += "appdataVisual.showLink(this.value,$(this.options[this.selectedIndex]).attr(&quot;linknum&quot;) );'"; 
											select += '<option value=-1 linknum=-1>Links...</option>';	
											//var select = "<select onchange=' fnShowLink(this.value,$(this.options[this.selectedIndex]).attr(&quot;linknum&quot;) );'>";
											var options = "<option value=-1 linknum=-1>Links...</option>"
										
											dataVisual.selectionLinks.forEach( function(selection,i){
												
												linkParms = [];
												Object.keys(selection).forEach(function(parm) {
																if (parm != "url" && parm != "urlText") 
																		linkParms.push(dataVisual.data[record.recid][selection[parm]]) ;  //Booyah Booyah!
														});										
												  options = options + "<option value=" + record.recid  +  " linknum=" + i +   " >" + selection.urlText + " (" + linkParms.join() +")</option>" ;
											}); //forEach
										
											return select + options + "</select>";

										} //render 
								   } //push object

					);	//columns.push method
					
				} //if	
					//Finally add hidden sort fields
			

					
				//***********************************	
				//End Columns 4 through dataFields.length					
				//***********************************
				
				var columnGroups = [];
				
				if (bColorField){
					
					columnGroups= [
							{caption: 'Row', span: 1, master: true}				
					]
					
					for (var i = 1; i < columns.length - 1; i++){  //skip over recid
						if ( !fnIsPresetColor(columns[i].field) && !columns[i].hidden ){
							
							if (dataTypes[dataVisual.colorPrefix + columns[i].field]){
								
								columnGroups.push({caption: columns[i].field, span: 2, master: false})
								
							}	
							else {
								
								columnGroups.push({caption: columns[i].field, span: 1, master: true})
							}
							
						} //if
						
					}
					
					if (columns[columns.length -1].field == "_links") 
						columnGroups.push({caption: "Link(s)", span: 1, master: true});
					
				
				}
				
				
				return {
					name		: dataVisual.name + "_dataGrid",		
					columns		: columns,				
					columnGroups: columnGroups,
					recordHeight: dataVisual.selectionLinks.length > 0 ? 50 : 24,	
					records		: gridRecords,    																		
					show: 		{
									toolbar: true,
									toolbarReload: false,
									footer: true,
									selectColumn: true,
									footer: true,								
							
								},

					sortData: 	columns
									.filter(function(row){return row.field != "_links"; })	
									.map(function(row){ return {field: row.field, direction: "ASC" } }) ,	
										
					searches: 	columns
									.filter(function(row){return row.field != "_links"; })
									.map(function(row,i, arr){ return {field: row.field, 
																	   caption: fnIsPresetColor(row.field) ? arr[i-1].field + " COLOR" : row.field, 
																	   type: dataTypes[row.field] ? dataTypes[row.field].type : "text" } 
																	  }),			
				
					multiSearch : true,
					multiSelect: true,
					multiSort: true,

					toolbar: {
						items: [
							{type: 'break'},
							{type: 'check', id: 'styleGrid', caption: "Visualize Grid", checked: false, tooltip: 'Visualize Data on Grid'},
							{type: 'break'},
							//{type: 'button', id: 'downloadButton', caption: translate("downLoadData"), tooltip: 'Download .csv file of current data grid'} 
							{type: 'button', id: 'downloadButton', caption: "Download", tooltip: 'Download .csv file of current data grid'} 
							,{type: 'break'},
							{type: 'button',
									id: 'refreshData', 
									//caption:	dataVisual.dataRefreshing ?  translate("datGuiLoadingMsg") : translate("datGuiFolders.refresh"), 
									//bug with w2ui[dataVisual.name + "_dataGrid"].toolbar.set, use text: instead
									//text:	dataVisual.dataRefreshing ?  translate("datGuiLoadingMsg") : translate("datGuiFolders.refresh"), 
									text:	dataVisual.dataRefreshing ?  translate("datGuiLoadingMsg") : "Refresh",  //Must use text not caption...bug with caption in w2ui
									tooltip: dataVisual.dataRefreshing ?  translate("datGuiLoadingMsg") : translate("datGuiFolders.refresh"),
							}
							],	
						
						onRender: function(event){
								event.onComplete =  function(){

										//if (dataVisual.callBackReloadTimer) w2ui[dataVisual.name + "_dataGrid"].toolbar.set("refreshData", {caption: translate("datGuiLoadingMsg") } );
										if (dataVisual.callBackReloadTimer) w2ui[dataVisual.name + "_dataGrid"].toolbar.set("refreshData", {text: translate("datGuiLoadingMsg") } );

								}; //onComplete
						},
						onResize: function(event){
								event.onComplete =  function(){
										if (dataVisual.bInitiating){
											dataVisual.bInitiating =  false;
											w2ui[dataVisual.name + "_dataGrid"].columnClick(dataVisual.dataKey);
										}
								}; //onComplete
						}
						,									
						onClick: function (target, data){
								 
									switch(target){
										
										case "refreshData":
																	
											fnRefreshData("toggle");	

											break;
										
										case "downloadButton":	
											if (!( document.documentMode || /Edge/.test(navigator.userAgent ) ) ) {	
											
												var oGrid = this.owner;
												var gridData = oGrid.searchData.length > 0 
													?  oGrid.last.searchIds.map(function(searchId){ return dataVisual.data[searchId] })  //search results
													:  	dataVisual.data;    //or all records				
											
												var downLoadData= "data:text/plain;charset=utf-8," + encodeURIComponent(d3.csvFormat(gridData)); //https://github.com/d3/d3-dsv#csvFormat
												
												var anchor = $(data.originalEvent.currentTarget).find("a");
																
												
												if (anchor.length == 0){

													var anchor = $(document.createElement("a"))
																	.attr("download","dataDownload.csv");  
																	// .click(function (){ debugger; this.href = "";} );  //Save space in the DOM: doesn't work because click is handled before download
													
															
													$(data.originalEvent.currentTarget).append(anchor);	//https://api.jquery.com/wrap/	
												
													
												} //if

												anchor.attr("href",downLoadData);
												
												anchor[0].click(); //https://stackoverflow.com/questions/34174134/triggering-click-event-on-anchor-tag-doesnt-works
												

											} //if	
											break;
											
										default:
											break;
										
									}//switch		
								
									data.onComplete = function (event){
										
										if (event.target == "styleGrid"){   //Button to Toggle Visualization Styling of Data Grid Selected
											
											this.owner.refresh();  //re-render grid with/without styling
											
											//Re- Apply background to selected column
											var column = this.owner.getColumn(dataVisual.activeGridColumn, true);

											for (var i = 0; i < this.owner.total; i++) {    //Reset Set background  cleared out by the this.owner.refresh() method
												
												var cellIdSelector =  "#grid_" + this.owner.name + "_data_" + i + "_"  + column;	
												$(cellIdSelector).addClass("gridColumnSelection");
											
											}//for
							
											
										} //if		
										
									}
						
						
						
						} //OnClick
						
					}, //toolbar
				
					onUnselect: function(event) {  //Same as onSelect

								event.done(function(){
						
									fnHandleSelectionOrSearch(event);
									
								});	//event.done

						}, //onUnselect			
					onSelect: function(event){  //Added with when multiSelect:true was enabled

								event.done(function(){
						
									fnHandleSelectionOrSearch(event);
									
								});	//event.done
						
					}, //onselect
					onSearch: function(event){
								//https://github.com/vitmalina/w2ui/issues/1604
								//event.onComplete http://w2ui.com/web/docs/1.5/utils/events
								event.onComplete = function(){
									
										fnHandleSelectionOrSearch(event) // http://w2ui.com/web/docs/1.5/w2grid.onSearch
												
								};  //event.onComplete
					}, //onSearch
					onColumnClick: function(event){ 

						
						event.done(function(){	

							if (event.field == "_links") return;
						
						
							dataVisual.activeGridColumn = event.field; 
							
							fnVisualizeData(event.field, dataVisual.data, dataVisual.dataKey);            
							dataVisual.callBackVisualScaling();		//Call back to user interface						  
							
							fnGridSelectColumn(this, dataVisual.activeGridColumn);
																	
							
						}); //done
						
							
					
					}, //onColumnClick

					
				} //return object
				

				//*************fnDataGridColumnRender
				function fnDataGridColumnRender(record, row_index, column_index) {	
				
					var fieldColorColumn = this.columns[column_index].field;
					var fieldText = fieldColorColumn == "recid" ? record.recid + 1 : record[fieldColorColumn];  //Add 1 to zero-based recid for display
					var predDefinedColor = fnIsPresetColor(fieldColorColumn);
					var fieldValueColumn = predDefinedColor ? this.columns[column_index -1].field : this.columns[column_index].field ;	//For predefined colors columns, reference the column to its left	
					var fieldValueType = dataVisual.dataTypes[fieldValueColumn].type;	
				
					if (!this.toolbar.get('styleGrid').checked)   //No visualization formatting
						return predDefinedColor ? fieldText : fieldValueType == "float" ?   d3.format(",")(fieldText) : fieldText;
				
					//Logic for 'Visualize Grid Data' option 
				
					var numDecimals = 	dataVisual.dataTypes[fieldValueColumn].numDecimals;
					var fieldValue = record[fieldValueColumn];		
					var dataRecordIndex = record.recid;  //The actual index into the data
					
					var color = predDefinedColor ? 
							record[this.columns[column_index].field] : 
							fnGetObjectScaleColorAndOptionallyVisualize(dataVisual.data, fieldValueColumn, dataRecordIndex, dataVisual.dataKey);   
							
					var divWidth;
					if (fieldValueType == "float"){
								
							var columnAttributes = fnGetColumnAttributes(fieldValueColumn);	

							var minPixels = 50;
							var maxPixels = 100;
							var scale = d3.scaleLinear()
										.domain([columnAttributes.minScale, columnAttributes.maxScale])
										.range([minPixels, maxPixels]);
							divWidth = scale(fieldValue);																		

						
					}//if	
					
					divWidth = (fieldValueType == "float") ? divWidth : 100;
					
					var div = $(document.createElement("DIV"))  //https://www.quora.com/How-do-you-create-a-box-filled-with-a-color-with-HTML-CSS
									.css({"width": divWidth + "px"})
									.css({"outline-style": "solid", "outline-width": "thin"})
									.css({"line-height":"25px", "height":"25px", "vertical-align":"center"})
									.css({"background-color": color, "opacity":"1"});
					
					$(document.createElement("SPAN"))
						.css({"background-color": "white", "opacity":".8"})  //Displays the text in a slighlty opaque box
						.text(predDefinedColor ? fieldText : fieldValueType == "float" ?   d3.format(",")(fieldText) : fieldText)
						.appendTo(div);
									
									
					
					return "&nbsp;" + div[0].outerHTML;													
																																			
				} //fnDataGridColumnRender
			
		
				
			} //fnGetDataGridProperties		
			
			
			
			
			
			
		}//fnBuildDataGrid


		function fnHandleSelectionOrSearch(event){

			
			if (dataVisual.searching) return;  //Prevent deadly embrace
			
			dataVisual.searching = true;
		
			fnClearIsolateSelections("clear");	//Clear

			var grid = event.target;  //Could be either data grid or visual grid
			var grid2 = grid == dataVisual.name + "_dataGrid" ? dataVisual.name + "_visualGrid" : dataVisual.name + "_dataGrid";
			
			var recIds = event.searchData ?  w2ui[grid].last.searchIds :   // http://w2ui.com/web/docs/1.5/w2grid.last
												w2ui[grid].getSelection(true); // http://w2ui.com/web/docs/1.5/w2grid.getSelection
			
			var searches = [];  //For the other grid
			var recordKey = grid == "dataGrid" ? dataVisual.dataKey : "vGrId" + dataVisual.visualKey;
			var searchKey = grid != "dataGrid" ? dataVisual.dataKey : "vGrId" + dataVisual.visualKey;  //for the other grid
									
			recIds.forEach(function (recid){
							
				var keyValue = w2ui[grid].records[recid][recordKey];
				alert("Add visualGroup");
				var selectedObject = dataVisual.visualGroup.getObjectByProperty(dataVisual.visualKey, keyValue ); //the join
				selectedObject.userData.selected = true; //Handled by fnClearIsolateSelections("isolate")	

				if (event.searchData){		
					searches.push({field: searchKey, value: keyValue, operator: 'is'}); //http://w2ui.com/web/docs/1.5/w2grid.searchData
				} //if	
				else {
					searches.push(w2ui[grid2].records.find(function(record){return record[searchKey] == keyValue}).recid );	//Find the recid in the grid2 grid
				}//else
					
			}); // recIds
					
					
			if (event.searchData){		
				w2ui[grid2].searchReset();	//dataVisual.searching == true will prevent deadly embrace
				w2ui[grid2].search(searches, 'OR');  //Perform search on the other grid with 'OR'  http://w2ui.com/web/docs/1.5/w2grid.search
			} //if
			else {
				w2ui[grid2].selectNone();	
				//w2ui[grid2].select(searches.join()); //Doesn't work http://w2ui.com/web/docs/1.5/w2grid.select
				searches.forEach(function(search){w2ui[grid2].select(search);});
				
				
			} //else
			
			if (recIds.length > 0) //No need to isolate if no records from search or selection
				fnClearIsolateSelections("isolate");   //Isolate all searches/selections	
			
			dataVisual.searching = false;	

		}  // fnHandleSelectionOrSearch	
	
		function fnGridSelectColumn(grid, column){   //Used by data and visual grid to de-select Column (from either grid) and select on current grid
		
			//gridColumnSelection class defined in dataVisualizer.css file
		
			//Remove existing backgrounds from the complete data and visual grid; even if they are already applied to current column
			$("body").find(".gridColumnSelection").removeClass("gridColumnSelection");  
								
			//Apply background to selected column
			for (var i = 0; i < grid.total; i++) {
				
				var cellIdSelector =  "#grid_" + grid.name + "_data_" + i + "_"  + grid.getColumn(column, true);	
				$(cellIdSelector).addClass("gridColumnSelection");
			
			}//for

		} //fnGridSelectColumn	


		function fnIsPresetColor(field){

			var test = 1;
			return field.startsWith(dataVisual.colorPrefix)  	
			
		} //fnIsPresetColor

		
	} //display



	
	
} //MyDataVisualizer
