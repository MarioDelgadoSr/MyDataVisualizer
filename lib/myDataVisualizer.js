	const appVersion = "1.1";																											
	var timeOutVar = null;																												//Used by Color Scale Slider and mdvScales		

	var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';   												//Panel styling		
		
	var languageIndex = 0;																												//Initially set to English(0)

	var parentLayout, appLayout; 																										//Global Reference to Application Layout child to parentLayot

	var appVisuals = [{visualName:"Upload..."}];																												//Array of objects for demo and uploaded visuals

$(document).ready(function(){

	visualList.forEach(function(visual){  																								//demos	
			
			appVisuals.push({	url: "data/" + visual + "/gltf/" + visual + ".gltf",
								blob: null,
								data: window[visual + "Data"],
								dataName: visual + ".csv",
								visualName: visual
							});
		
	});
	
	$(document.body).css({"margin":"0px", "position": "absolute", width: "100%", "height": "100%"});																								// https://github.com/vitmalina/w2ui/issues/105#issuecomment-17793381
	var appDiv = $(document.createElement("div"))																						// Work around: https://github.com/vitmalina/w2ui/issues/1844
		.css({"position": "absolute", width: "100%", "height": "100%"})
		.appendTo(document.body); 
	
	
	parentLayout = 
		$().w2layout(																											
				{	
					name: "parentLayout",
					box: appDiv,
					panels: 
					  [																											
						{ type: 'main', size: "100%", resizable: false, style: pstyle, 
							toolbar: {	
								items:[	
									{ type: "menu-radio", id: "visual", tooltip: "Select Visual",
									  items: appVisuals.map (function (appVisual, index) { return { id: index, text: appVisual.visualName} }),
									  //Find index programmatically with: w2ui.parentLayout.get("main").toolbar.items.find(function(item){return item.id == "visual"}).selected
									  selected: -1,
									  lastSelected: -1,	
									  text: function (item){
												return "Visual: " + (item.selected <= 0 ? "" : item.items[item.selected].text);
											}
									},
									{type: 'break'},									
									{type: "button", id:"toggleAnalyzer", tooltip: "Show/hide Data Analyzer", text:"Toggle Analyzer"},										
									{type: 'break'},									
									{type: "button", id:"toggleVisualGrid", tooltip: "Show/hide Visual Grid", text:"Toggle Visual Grid"},	
									{type: 'break'},						
									{ type: "menu-radio", id: "language", tooltip: "Select Language",
									  items: languages.map(function (language,index) { return {id: index ,text: language.text, tooltip: language.tooltip} }),  
									  //Find index programmatically with: w2ui.parentLayout.get("main").toolbar.items.find(function(item){return item.id == "visual"}).selected
									  selected: languageIndex,
									  text: function (item){
												return "Language: " + item.items[item.selected].text;
											}	
									},
									{type: 'break'},
									{ type: "menu", id: "Help", text: fnGetTranslatedText, tooltip: "Help",
									  items: [
											{ id: "quickKeys", text: "Quick Keys"},
											{ id: "webgl", text: "WebGL"},
											{ id: "gltf", text: "glTF"},
											{ id: "threejs", text: "three.js"},
											{ id: "d3js", text: "d3.js"},
											{ id: "w2ui", text: "w2ui"},
											{ id: "about",     text: translate("About")}
									   ]	
									}
								],
								onClick: function(event){
									event.done( function () {
									
										var aTargets = event.target.split(":");
										if (aTargets.length == 1 && ["upload", "toggleVisualGrid", "toggleAnalyzer"].indexOf(aTargets[0]) == -1) return; //Menu, not menu item, clicked on option
										switch(aTargets[0]) {
	
											case "visual":   //Find programmatically with: w2ui.toolbar.items.find(function(item) {return item.id == "visual"}).selected

												var vDropDown = this.items.find(function(item){return item.id == "visual"});
												var selected = vDropDown.selected;
												if (vDropDown.selected <= 0){ 
													vDropDown.selected = vDropDown.lastSelected;
													vDropDown.lastSelected = selected; 
													fnGetFileUploads();
												} //if 
												else {
													vDropDown.lastSelected = selected;
													vDropDown.text = "Visual: " + vDropDown.items[selected].text;
													fnShowMyDataVisualizerDemo();
												} //else
												break;													
												
											case "toggleVisualGrid":
											
												var mainPanel = this.owner.get("main").content;

												if (mainPanel.get("preview").mdvPreHideSize) {
													
													mainPanel.sizeTo("preview",mainPanel.get("preview").mdvPreHideSize);				//Must operate on preview, not main (bug)
													mainPanel.sizeTo("left",mainPanel.get("left").mdvPreHideSize);
													delete mainPanel.get("preview").mdvPreHideSize;										
													delete mainPanel.get("left").mdvPreHideSize;										//Handling final sizing of preview
												
												} //if
												else {
												
													mainPanel.get("preview").mdvPreHideSize = mainPanel.get("preview").size;
													mainPanel.get("left").mdvPreHideSize = mainPanel.get("left").size;
													mainPanel.sizeTo("preview","100%");	
												
												} //else
												
												break;	
					
											case "toggleAnalyzer":
											
												var mainPanel = this.owner.get("main").content;
												
												if (!mainPanel.get("left").hidden)														//Handling final sizing of preview
													mainPanel.get("left").mdvPreHideSize = mainPanel.get("left").size;	
												
												mainPanel.toggle("left");
												
												if (!mainPanel.get("left").hidden) {													//Handling final sizing of preview
													
													mainPanel.sizeTo("left",mainPanel.get("left").mdvPreHideSize);
													delete mainPanel.get("left").mdvPreHideSize;		
												
												} //if
												
												break;	
											
											case "language":
											
												fnSetLanguageIndex(aTargets[1]);
												break;
											
											case "Help"	:
												
												switch (aTargets[1]){
													case "quickKeys":
													
														var helpText = translate("HelpText1") +  translate("HelpText2")  + translate("HelpText3") + translate("HelpText4");			  
														fnPopUp(document.body, translate("Help"),helpText,3,2.5);									
														break;
														
													case "about":
													
														fnPopUp(document.body, translate("AppTitle") + " (" + appVersion +")",translate("AboutText"),3,5);
														break;
														
													case "webgl":
													case "gltf":
													case "threejs":
													case "d3js":
													case "w2ui":
															var links = { "webgl": "https://en.wikipedia.org/wiki/WebGL",
																		  "gltf" : "https://www.khronos.org/gltf/",
																		"threejs": "https://threejs.org/",
																		"d3js": "https://d3js.org/",
																		"w2ui": "http://w2ui.com/"							
																		};	
															window.open(links[aTargets[1]],"_blank"); 
														break;
												
												} //switch
												break;
									
									} //switch
										
										//Display pop-up Window
										function fnPopUp(appContainer, title,html,wf,hf){ 
										
											var width = $(appContainer).width() == 0 ? appContainer.parentElement.clientWidth :  $(appContainer).width();
											var height = $(appContainer).height() == 0 ? appContainer.parentElement.clientHeight :  $(appContainer).height();	
											
											w2popup.open({	title: title,
															body: html,
															buttons   : '<button onclick="w2popup.close();">' + translate("PopUpClose") + '</button>',	
															showMax: false,
															showClose: true,
															width: width/wf,
															height: height/hf,
															modal: false
														 });
										} // fnPopUp	
										
									}); // event.done
									
								} //onClick
							} //toolbar
						}  //main											
							
					], //panels
					onRender: function(event){event.done(function(event){ fnShowMyDataVisualizerDemo(); });}
				}					
			); //parentLayout
			
			
	parentLayout.get("main").toolbar.tooltip = "top|right";																				// http://w2ui.com/web/docs/1.5/w2toolbar.tooltip
	parentLayout.render();   																											//onRender event continues with fnShowMyDataVisualizerDemo()

}); //document ready
	
function fnShowMyDataVisualizerDemo(){
	
	if (appLayout) 
		appLayout.destroy();
		
	var visualIndex = parentLayout.get("main").toolbar.items.find(function(item){return item.id == "visual"}).selected;
	
	if (visualIndex <= 0){   																											//Show Demo Instructions
		
		parentLayout.content("main", "<div id='demoInstructions'></div");
		$("#demoInstructions").load("demoInstructions.html");
		parentLayout.get("main").toolbar.disable("toggleVisualGrid");																											
		parentLayout.get("main").toolbar.disable("toggleAnalyzer");				
		return;
		
	}
	

	
	var gltfURL = appVisuals[visualIndex].blob ? URL.createObjectURL(appVisuals[visualIndex].blob) : appVisuals[visualIndex].url;
	var visualData = appVisuals[visualIndex].data ? $.extend(true,[],appVisuals[visualIndex].data) : null;  //Deep, unique clone of data
	
	var gltfLoader = new THREE.GLTFLoader();	

	gltfLoader.load( gltfURL, function( gltfDataFromFile ) {  
			
		var dataKey =  appVisuals[visualIndex].blob ? "name" : Object.keys(visualData[0])[0];    		
		const visualKey = "name";
						
		var datVisual =  new dataVisual();	
		
			datVisual.dataName = appVisuals[visualIndex].dataName;
			datVisual.visualName = appVisuals[visualIndex].visualName;		
			
			if (visualData) {	
				datVisual.joinDataToVisual(visualData, gltfDataFromFile, dataKey, visualKey); 			//datVisual.joinDataToVisual(gltfDataFromFile);  //testing with no data	
			}
			else {
				datVisual.joinDataToVisual(gltfDataFromFile);	
			}
			
			if (!datVisual) return; 																			//Could be using recid for property.

			datVisual.selectionLinks = [];
			
			if (!appVisuals[visualIndex].blob) {    //demo visual
			
				var linkURL = "https://www.bing.com/search"																			
				datVisual.selectionLinks.push( {url: linkURL + "?" , urlText:"Bing Search: " + dataKey  , "q":dataKey}); // Free version will allow 1 link and customization of url				
				//	[{url: linkURL + "?"   , urlText:"Data Key Link"  , "dataKey":dataKey}]; 						
																//If properity has this prefix, it's a defined color
			} //if
			
			
			
			
			var container = typeof(parentLayout) != 'undefined' ? parentLayout : 								//Container can be a div or layout.  If layout, app placed in 'main' panel
							$(document.createElement("div"))
									.appendTo($(document.body).css({"margin":"0px"})); 							//Layout Height Design Pattern: https://github.com/vitmalina/w2ui/issues/105 
		

		
		appLayout = new applicationLayout();
		appLayout.display(container, datVisual);															
		
		var vDropDown = parentLayout.get("main").toolbar.items.find(function(item){return item.id == "visual"});
		vDropDown.text = "Visual: " + datVisual.visualName;
		parentLayout.get("main").toolbar.refresh();

		URL.revokeObjectURL( gltfURL );																			//https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL						
	
	}, //Loader function handlder
	
	undefined/*, function ( error ) {   //Error Handling

		alert( error );

	}*/ ); //gltfLoader		
	

} //fnShowMyDataVisualizer	

function fnSetLanguageIndex(newIndex){
	
	languageIndex = parseInt(newIndex);
	parentLayout.refresh();	
	
} // setLanguageIndex	

function fnGetFileUploads(){

	w2popup.load({
				width   : $(document.body).width() * .9,
				height  : $(document.body).height() * .9,
				style	: 'background-color: white;',
				title   : 'Upload',
				modal:    true,
				url: 	  'fileUpload.html',
				onOpen:  function(event){event.done(function(event){fnSetUploadHandlers()}); },	
				onClose:  function(){window.clearInterval(timeOutVar)},
				buttons : '<button class="w2ui-btn" onclick="w2popup.close()">Cancel</button>'
			});		
							
	function fnSetUploadHandlers(){
		
	//https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
	//https://www.frontendjournal.com/javascript-es6-learn-important-features-in-a-few-minutes/
	
	// ************************ Drag and drop ***************** //
	let dropArea = $("#drop-area");		
		dropArea.on("dragenter dragover dragleave drop",(event) => {event.preventDefault(); event.stopPropagation(); });						
		dropArea.on("dragenter dragover", () => {dropArea.addClass('highlight')});
		dropArea.on("dragleave drop", () => {dropArea.removeClass('highlight')});
		
	dropArea.on("drop",fnHandleFileUploads);  
	
	var mdvScales = $("#mdvScales");
	var scaleIndex = 0;
	var scaleDirection = 0;
	const maxScaleIndex =  fnGetD3Scales().length - 1;
	fnBuildPredfinedScales(mdvScales, {scaleIndex: scaleIndex , direction: scaleDirection++ });

	
	timeOutVar = window.setInterval( function(){   
	
				fnBuildPredfinedScales(mdvScales, {scaleIndex: scaleIndex , direction: scaleDirection });
				scaleIndex = scaleIndex + (scaleDirection % 2)  >  maxScaleIndex ? (scaleDirection++, 0) : scaleIndex + (scaleDirection++ % 2)  ;
				
		} , 2000);
	
	

	
	
	
	} //fnSetUploadHandlers

} //fnGetFileUploads

function fnHandleFileUploads (event) {				
  
  
	var files = [...event.originalEvent.dataTransfer.files]    //Spread operator: https://zendev.com/2018/05/09/understanding-spread-operator-in-javascript.html
	
	if (files.length > 2) { 
		
		w2alert("More than 2 files uploaded.  The .gltf file must have an embedded data uri.");
		//To Do handle this situation from My Data visualizer
		return;
	
	} 

	
	if (files.length == 2){
	
		var csvFile  = files[0].name.indexOf(".csv") != -1 ? files[0] : files[1].name.indexOf(".csv") != -1 ? files[1] : null;
		//GlobalgltfFile = files[0].name.indexOf(".gltf") != -1 ? files[0] : files[1].name.indexOf(".gltf") != -1 ? files[1] : null;
		var gltfFile = files[0].name.indexOf(".gltf") != -1 ? files[0] : files[1].name.indexOf(".gltf") != -1 ? files[1] : null;

		if (!csvFile && !gltfFile){
			
			w2alert("Only .csv and .gltf files can be processed.")
			//To Do handle this situation from My Data visualizer
			
			return;
			
		} //if			
					
		 w2popup.lock(translate("LoadingMsg"), true);
			
					
		let reader = new FileReader(); //https://w3c.github.io/FileAPI/#filereader-interface
			reader.readAsText(csvFile);

		reader.onloadend = function() {			//https://w3c.github.io/FileAPI/#filereader-result
					
			var dataName = csvFile.name;
			var visualName = gltfFile.name.split(".gltf")[0];
			
			appVisuals.push({	url: null,
								blob: gltfFile,
								data: d3.csvParse(this.result, d3.autoType),   //https://github.com/d3/d3-dsv#csvParse //https://github.com/d3/d3-dsv#autoType
								dataName: dataName,
								visualName: visualName
							});	


			parentLayout.get("main").toolbar.get("visual").items.push({id: appVisuals.length - 1, text: visualName, checked: true});
			parentLayout.get("main").toolbar.get("visual").selected = appVisuals.length - 1;
				
			w2popup.unlock();	
			w2popup.close();				
			
			fnShowMyDataVisualizerDemo();

		}	//onloadend				
		
	} //if
	else {
		
		gltfFile = files[0].name.indexOf(".gltf") != -1 ? files[0] : files[0].name.indexOf(".gltf") != -1 ? files[1] : null;
		
		if (!gltfFile) {
		
			w2alert("A .gltf was not uploaded.")
			//To Do handle this situation from My Data visualizer
			
			return;			
		
		} //if
		
		 w2popup.lock(translate("LoadingMsg"), true);
		
		var visualName = gltfFile.name.split(".gltf")[0];
		
		appVisuals.push({	url: null,
							blob: gltfFile,
							data: null,
							dataName: visualName + " (Embedded)",
							visualName: visualName
						});	


		parentLayout.get("main").toolbar.get("visual").items.push({id: appVisuals.length - 1, text: visualName, checked: true});
		parentLayout.get("main").toolbar.get("visual").selected = appVisuals.length - 1;
		

		w2popup.unlock();	
		w2popup.close();				
		
		fnShowMyDataVisualizerDemo();


	
	} //else

	
	
} //fnHandleFileUploads
		
function applicationLayout(){
	

	var app  = this;
	
	app.dataVisual = undefined;
	
	app.myDataVisualizer = undefined;
	
	app.display = function(container, dataVisual){
		
		
		if ( !WEBGL.isWebGLAvailable() ) { //https://threejs.org/docs/index.html#manual/en/introduction/WebGL-compatibility-check

			var warning = WEBGL.getWebGLErrorMessage();
			w2alert(warning);
			return;

		} 		

	
		app.dataVisual = dataVisual;
		
		var mdvLayoutProperties = 
							{	name: dataVisual.visualName + "_mainPanel", 																	//http://w2ui.com/web/docs/1.5/layout
								panels: 
								[																												//Tool Bar Handle by Main Panel
									{ type: 'left', size: '50%', resizable: true, style: pstyle },  											//Data Analyzer
									{ type: 'main',  resizable: true,  style: pstyle},															//Visual GRID	
									{ type: 'preview',  size: '75%', resizable: true }  														//The display panel for the image
								
								] //panels
							}	
		
		
		if (w2ui[container.name]){
			
			var mdvLayout = $().w2layout(mdvLayoutProperties); 
				container.content("main", mdvLayout );			
			
		} //if
		else {

			$(container).css({"position": "absolute", "width": "100%", "height": "100%"})  															//https://github.com/vitmalina/w2ui/issues/105					
				mdvLayoutProperties.box = $(container);	
					var mdvLayout = $().w2layout(mdvLayoutProperties); //mdvLayout
		
		} //else
			
		app.myDataVisualizer = new myDataVisualizer();
		app.myDataVisualizer.display(mdvLayout, dataVisual)		
				

	} //display

	app.refresh = function(){
		
		//To Do Refresh...for example change in laguageIndex	
		//Refresh only the specific w2ui sub-component that have languge components.  Layout Headers, Grid toolbars
		//Pattern: w2ui['dataGrid'].toolbar.get('styleGrid').text = "vvvvv Grid"  MUST USE .text not .caption.... there's a bug
		// w2ui['dataGrid'].toolbar.refresh()        
		
	}
	
	app.destroy =  function (){
		
		app.myDataVisualizer.destroy();
		app.myDataVisualizer = null;
		
		//Known issue with resize: https://github.com/vitmalina/w2ui/commit/f77b14876604f2d5eed98f416d76b2541307aa0c 
		
		
		Object.keys(w2ui).forEach( function (objKey){  																				//Remove all w2ui instances for this object
									if ( objKey.indexOf(app.dataVisual.visualName + "_") != -1 )  w2ui[objKey].destroy(); 
									} );  		


		appLayout = null;
		
	} //destroy



} //applicationLayout

function myDataVisualizer(){	
	
	var mdv = this; 																													//Reference this with methods	
	
	mdv.appVersion = 1.1;

	mdv.visualizer = undefined;
	mdv.dataGrid = undefined;
	mdv.visualGrid = undefined;
	
	mdv.destroy =  function (){
		
		mdv.visualizer.destroy();
		
	} //destroy

	mdv.display = function(mdvLayout, dataVisual){
																						

		//Build 2 panel Analyzer, Data Grid in main panel, Scale Control and Legend in preview panel	
		
		var analyzerLayout = $().w2layout({ 	name: dataVisual.visualName  +  '_analyzerLayout',
						panels: [
							{ type: 'main', overflow: "auto", size: "70%", resizable: true, style: pstyle },							
							{ type: 'preview', size:"30%", style: pstyle, overflow: "auto", resizable: true }
						],
						onRender: function(event){
							event.done(function() {    																						//http://w2ui.com/web/docs/1.5/utils/events
								//fnGetObjectListAndLoad(visualIndex, languageIndex);
							
							}); //event.done
						}
		});
		

		//Scale Control	

		var scaleControlLayout = $().w2layout({
												name: dataVisual.visualName  + '_scaleControlLayout',
												panels: [
													{ type: 'left', resizable: true, size: "50%", style: pstyle, title:'Visualization Color Scale'}, 
													{ type: 'main', resizable: true, style: pstyle, title: "Legend" }
												]
											}
									);		
	
		
		var predefinedScale = $(document.createElement("div")).addClass("wrapper");																	//Slider and scale hosted in html table	
			var table = $(document.createElement("table")).appendTo(predefinedScale);					
				var tableRow = $(document.createElement("tr")).appendTo(table);
					var sliderTd = $(document.createElement("td")).appendTo(tableRow);				
					var scaleTd = $(document.createElement("td")).appendTo(tableRow);												   
	
		mdvLayout.content("left",analyzerLayout);	
			analyzerLayout.content("preview", scaleControlLayout);
				scaleControlLayout.content("left", predefinedScale[0]);


		var legendContainer =  document.createElement("div");
		scaleControlLayout.content("main", legendContainer);
			
			
		dataVisual.legendContainer = legendContainer;


		//Need size of visualization container, Color Scale and Legend before building them, so render first
		scaleControlLayout.onRender = function (event){ event.done(function(event){fnFinshLayout();}); } 															//onRender
		
		/*	Debugging Leave Here
		 
			//mdvLayout.on('*', function (event) {
			mdvLayout.on('resize', function (event) {
				console.log('Event: '+ event.type + ' Target: '+ event.target);
				console.log(event);
			});		
			

			analyzerLayout.on('*', function (event) {
				console.log('Event: '+ event.type + ' Target: '+ event.target);
				console.log(event);
			});		
			
			scaleControlLayout.on('*', function (event) {
				console.log('Event: '+ event.type + ' Target: '+ event.target);
				console.log(event);
			});	

		*/



		var visualizerDiv = document.createElement("div")	 																			
			mdvLayout.content("preview", visualizerDiv);		
			mdvLayout.render();																												//Continues with fnFinshLayout
		
		function fnFinshLayout(){
			
			//scaleControlLayout render gets called twice, one for each panel, so following if test is needed
			if (mdv.visualizer) return;

			mdv.visualizer = fnBuildDataVisualizer(mdvLayout.content("preview"), dataVisual);												//Visual Scene in visualizer object
	
			
			if (dataVisual.data.length == 0){  																								//No Data, just image
					
				parentLayout.get("main").toolbar.disable("toggleVisualGrid");																//Disable visual grid and analyzerbutton						
				parentLayout.get("main").toolbar.disable("toggleAnalyzer");																						
					
				mdvLayout.hide('left');   																									//Hide Data Analyzer Panel
				mdvLayout.hide('main');
				mdvLayout.get("preview").size = "100%";		
				mdvLayout.showToolbar('preview');
				mdvLayout.get("preview").title = dataVisual.visualName;	
				$(mdvLayout.get("preview").content).closest(".w2ui-panel").find(".w2ui-panel-title").css("text-align", "center");
				
				var toolbar = fnGetGridToolbar(dataVisual, mdv.visualizer,"visual");
				
					toolbar.name =  dataVisual.visualName + "_visualToolbar";
					toolbar.items.splice(0,2); //Remove Visualize Grid Option

					mdvLayout.assignToolbar("preview",$().w2toolbar(toolbar));

							
			} //if
			else {																															//Build Data Analyzer	

				parentLayout.get("main").toolbar.enable("toggleVisualGrid");																	// Enable show/hide visual grid button											
				parentLayout.get("main").toolbar.enable("toggleAnalyzer");				
				
				mdv.visualizer.setIntersectsSelectedCallback(fnSearchIntersects);															//Object on the visual selected Handler (ctrl Mouse Click or Double Click)
			
				dataVisual.dataTypes = fnGetDataTypes(dataVisual); 																			//Used by Data and Visual Grid
				
				Object.keys(dataVisual.dataTypes).forEach(function(column){
										
					//https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
					dataVisual.dataTypes[column].aUniqueCategories = 
								Array.from(new Set(dataVisual.data.map(function (row) {return dataVisual.dataTypes[column].type == "float" ? 
													parseFloat(row[column]): 
														["date", "time", "dateTime"].indexOf(dataVisual.dataTypes[column].type) != -1 ? 
															fnFloatFormat(dataVisual, column, row[column]) :
																row[column]}) ))
									.sort(function(a,b){  //https://stackoverflow.com/questions/4373018/sort-array-of-numeric-alphabetical-elements-natural-sort
										  var a1=typeof a, b1=typeof b;
										  return a1<b1 ? -1 : a1>b1 ? 1 : a<b ? -1 : a>b ? 1 : 0;
									});				
				
				}); //forEach
				
	
				// Data Grid
				mdv.dataGrid = fnBuildGrid(dataVisual, mdv.visualizer, "data");
					analyzerLayout.content('main',mdv.dataGrid); 																			//http://w2ui.com/web/docs/1.5/utils/plugins
					dataVisual.dataGrid = mdv.dataGrid;		
	
				// Visual Grid	
				mdv.visualGrid = fnBuildGrid(dataVisual, mdv.visualizer, "visual");													//Visual Scene's GRID
					mdvLayout.content("main", mdv.visualGrid);		
					dataVisual.visualGrid = mdv.visualGrid;

	
				//Add Predfinded Scale Canvas and Scale Slider
				dataVisual.activeGridColumn = {grid: dataVisual.dataGrid, column: dataVisual.dataKey };																			//First column to be visualized	

				//If being programamatically controlled, this would set initial scaling	
				dataVisual.selectedScale = {scaleIndex: 0, direction: 0};																	//The index into the scale array built by 
																																			//fnGetD3Scales, direction: 0: LowHigh, 1: HighLow
				//FIRST TIMER INTERVAL DOES VISUALIZTION ON mv.dataGrid.activeGridColumn
				fnBuildScaleSlider(sliderTd, scaleTd, dataVisual);									
				
				// Refresh Handler
				fnRefreshGrid= function(event) {  																								//Refresh grids on 
										event.done(function(event) {																			//http://w2ui.com/web/docs/1.5/utils/events
											fnGridSelectColumn(dataVisual);
										});
									};	
				
				mdv.visualGrid.on("refresh", fnRefreshGrid);
				mdv.dataGrid.on("refresh", fnRefreshGrid);				
				
			} //else dataVisual has data
			
			
			// Resize Handler
			fnResizeMdvLayout = function(event) {  																							//Resize visualizer on layout's resize
									event.done(function(event) {																			//http://w2ui.com/web/docs/1.5/utils/events
										mdv.visualizer.resize(); 																			//Exposed by dataVisualizer for resizing 
									});
								};				
			
			mdvLayout.refresh();
			
			mdvLayout.on("resize", fnResizeMdvLayout);
				mdvLayout.resize();
			
			
		} //fnFinshLayout


		function fnSearchIntersects(intersects, bSearch){
			
			if (intersects == "reset"){
				
				dataVisual.join.forEach(function (joinRow){ joinRow.visualObj.visible = true;});
				dataVisual.dataGrid.searchReset(false);  //http://w2ui.com/web/docs/1.5/w2grid.searchReset
				dataVisual.visualGrid.searchReset(false);
				fnVisualize(dataVisual);				
					
			} //if
			else {
					
				dataRow =  fnFindDataRow(intersects);
				
				if ((dataRow[dataVisual.dataKey] == dataVisual.dataGrid.last.search) && bSearch){  //Toggle isolation searching	
					fnSearchIntersects("reset");
					return dataRow;
				
				}
				
				if (dataRow && bSearch){
				
					dataVisual.dataGrid.searchReset(false);  //Reset search (trigger search logic), but don't refresh the grid http://w2ui.com/web/docs/1.5/w2grid.searchReset
					dataVisual.dataGrid.search(dataVisual.dataKey, dataRow[dataVisual.dataKey]);  //http://w2ui.com/web/docs/1.5/w2grid.search

				}
				
				return dataRow;

					
			} //else 
				
						
			function fnFindDataRow(intersects){
				
				//Use Join to determine keyValue, if interesect contain one of the visualization objects
				var dataRow = null;
		
				for (var i = 0; i < intersects.length; i++){
					
					bFoundMatch = dataVisual.join.some(function(joinRow){
								
														 if ( isVisualObj(joinRow.visualObj,intersects[i].object) ) {
															dataRow =  joinRow.dataRow;
															return true; 
														 }	 
										
										}); //some				

					if (bFoundMatch) break;
					
				}	

				return dataRow;
				
				
				function isVisualObj(visualObj, intersectObj){
					
					var bVisualObj = visualObj === intersectObj;
					
					if (bVisualObj) return true;
					
					intersectObj.traverseAncestors(function(node){
							
							bVisualObj = bVisualObj ? bVisualObj : visualObj === node;  //Keep checking ancestors/parents to determine if instersect is a child of a visualObj			
								
							
					});
					
					return bVisualObj;
					
				} //isVisualObj
				
				
				
				
			} //fnFindDataRow
				
			
		} //fnSearchIntersects

		

		function fnBuildDataVisualizer(container, dataVisual){
			
			//PREPARE THE VISUAL OPTIONS 
			var objVisualizeSettings = {
					scene: {background: "#d9dccb"},
					boundingBox:{visible:false, color:"white"},
					axesHelper: {visible:false},
					gridHelper: {visible:true},
				};						 
		 
			//INSTANTIATE NEW VISUAL WITH OPTIONS
			var visualizer =  new dataVisualizer(objVisualizeSettings);
			visualizer.setVisual(dataVisual.visual);
						
			visualizer.display(container);       	//Build threejs scene into the container and builds the 'visualize' Objects grid
			
			return visualizer;

			function dataVisualizer (overrideProperties) {

				var properties = {//Default visual layout props; attributes can be changed with attributes in ojb3dProperties
					version: 0.90,
					id: "Visual" + uuidv4(),																    //UniqueID
																												//Prefix in visualData column that designates a column as a predefined color
					container: null,																			//Assigned in fnDisplay
					containerWidth: undefined,																	//Default width (px) or (%)			
					containerHeight: undefined,																	//Defualt height (px) 	   

					//ThreeJS specific objects
					scene: 	{	obj:null, 																		//https://threejs.org/docs/index.html#api/scenes/Scene
								background:"black",
								controller:{background:"color"}
							},	
																												//background: any color acceptable to THREE.Color: https://threejs.org/docs/index.html#api/math/Color				
					camera: {	obj:null,																		//https://threejs.org/docs/index.html#api/cameras/Camera
								fov:45,
								controller:{fov:{type:"number", minMaxStep: [1,179,1]}}
							},
					renderer:{ 	obj:null},																		//https://threejs.org/docs/index.html#api/renderers/WebGLRenderer
					controls: { obj:null,																		//https://threejs.org/docs/index.html#examples/controls/OrbitControls
								maxPolarAngle: 90,																//90 degrees: Don't rotate below Y = 0 plane, > 90 degrees camera can go -Y 
								zoomSpeed: 1, 																    //https://threejs.org/docs/index.html#examples/controls/OrbitControls.zoomSpeed
								panSpeed: 1, 																    //https://threejs.org/docs/index.html#examples/controls/OrbitControls.panSpeed
								controller:{maxPolarAngle: {type:"number", minMaxStep: [0,180,1]},
											zoomSpeed: {type:"number", minMaxStep: [0.1,2,.1]},	
											panSpeed: {type:"number", minMaxStep: [0.1,2,.1]}	
										   }
							  } ,	   
					mouse: new THREE.Vector2(),																	//RayCasting mouse object
					tooltipInteresected: null,																	//Tooltip object last intersected ojbect					
					raycaster: new THREE.Raycaster(),
					boundingBox: {	obj:null,
									boundingRange: null,														//A Three.js Vector with +/- lengths along x,y,z axis relative to scene/world 0,0,0	
									visible:true,
									color:"white",
									controller:{visible:"boolean", color:"color"}
								},			
					axesHelper: {	obj:null,
									visible:false,
									controller:{visible:"boolean"}
								},	
					gridHelper: {	obj:null,
									gridSize:null,	
									visible:false,																//Set to true to see grid and minimum visual y for image									
									colorGrid:"green",															//Default CSS color for grid
									colorCenter:"white",														//Default CSS color for grid's centerline
									divisions:10, 																//Defuault number of divisions for GridHelper
									controller:{visible:"boolean", 
												colorGrid:"color", 
												colorCenter:"color", 
												divisions:{type:"number",minMaxStep: [2,20,1]}}
								}, 	
					stats: null, 																			    //Stats Performance display									

					visualGroup: null,																			//All the objects displayed in the scene.  It's a child of sceneGroup
					sceneGroup: null,																			//Collection of of sub objects for easy transformation

					animationFrame: null,																		//Animation Frame used for rendering //https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/

					//Methods specific to threejs scene 													
					rebuildGridHelper: fnRebuildGridHelper,														//Rebuild the visualization grid helper
					showBirdsEyeView: fnShowBirdsEyeView,														//Bird's Eye View
					rotate: fnRotate,																			//Rotate the image in the visualization	
					


					visual: null,																				//The gltf file to be loaded
					keyVisualName: "name",																		//The key vale for the visual file, defaults to name property of objects, but can be overrriden				
					visualizeProp: "visualize",																	//The property in the GLTF file that designates meshes to visulize

					selectionLinks:[],																			//Array of selection links

					fnSearchIntersects: function(){},                                                            //Callback function handling object selection 

					//Methods			
					setVisual: fnSetVisual,
					setIntersectsSelectedCallback: fnSetInteresectsCallBack,
					display: fnDisplay,																			//Invoked to render thes scene
					resize: null, 																				//resize method...callback assigned by fnGetResizeCallback() at initialization of the dataVisualizer	
					destroy: fnDestroy,																			//Used at initialization and if loading different files by interface to clean-out the current visualization
					
					
				} //properties


				// SET SCENE PROPERTIES
				if (overrideProperties) 
					fnSetSceneProperties(overrideProperties);													//Use Override properties if they were set
				
				return properties;																				//Return the complete properties object to caller

				/////////////////////////////////////////////////////////////////M E T H O D S ////////////////////////////////////////////////////////////////////////////////////

				
				function fnGetResizeCallback(){
					
					//Add Window resize event and return callback so that properties.resize() can be invoked for non windows resize events.
					//Invoked after the scene is created
					
					var callback	= function(){
						
						if (!properties.renderer.obj || !properties.camera.obj  ) return; //Can't resize something that doesn't exist yet
						
						var containerWidthHeight = fnGetContainerWidthHeight(properties.container);
						
						properties.containerWidth  = containerWidthHeight.width;
						properties.containerHeight = containerWidthHeight.height;				
						
						// notify the renderer of the size change
						properties.renderer.obj.setSize( properties.containerWidth, properties.containerHeight );
						
						// update the camera
						properties.camera.obj.aspect = properties.containerWidth / properties.containerHeight;
						properties.camera.obj.updateProjectionMatrix();

					}; //callback
					
					// bind the resize event
					window.addEventListener('resize', callback, false);

					
					return callback;
					
					
				} //fResize
				
				function fnSetInteresectsCallBack(fnCallBack){
						
					properties.fnSearchIntersects = fnCallBack;
					
				}
				
				
				function fnGetContainerWidthHeight(container){

					var width = $(container).width() == 0 ? container.parentElement.clientWidth :  $(container).width();
					var height = $(container).height() == 0 ? container.parentElement.clientHeight :  $(container).height();
					return { width: width,  height: height };
					
				} //fnGetContainerWidthHeight	
				

				function fnSetVisual(visual){
					properties.visual = visual;	
				} //fnSetVisual

				
				// DISPLAY
				function fnDisplay(container) {
					
						if (!container){ 
							w2alert("Error: No container for visualizer specified"); 
							return;
						} //if  
						
						fnBuildPerformanceStats(properties)						
						
						properties.container = container;
						
						var containerWidthHeight = fnGetContainerWidthHeight(properties.container);
						properties.containerWidth = containerWidthHeight.width;
						properties.containerHeight = containerWidthHeight.height;			
						
						fnBuildScene();																						//Build the scene; calls fnBuildVisual

						properties.resize =  fnGetResizeCallback(container);												//Set resize logic, fnGetResizeCallback is called once at startup (after scene is built) 
																															// and returns a callback used with exposed 'resize' method of the Data Visualizer		
						
						fnSetBirdsEyeView();	
												
						//So that properties.sceneGroup.obj.matrixWorld get updated;
						properties.renderer.obj.render( properties.scene.obj, properties.camera.obj );
				
						animate();
						
				
				} //fnDisplay

				function fnBuildPerformanceStats(properties){
							
						//PERFORMANCE https://www.reddit.com/r/threejs/comments/7g15ff/datgui_how_did_they_get_the_fps_chart_in_the_gui/
						//https://github.com/mrdoob/stats.js#readme
						//Customized for Height
						properties.stats = new Stats();
						//ALREADY 3 STATS, DISPLAY THEM ALL
						for (var i = 0; i < properties.stats.domElement.children.length; i++) { properties.stats.domElement.children[i].style.display = ""; }
						properties.stats.domElement.style.position = "static";
						properties.stats.domElement.style.cursor = "auto";

						
				} //fnBuildPerformanceStats	
				
						

				// SET THE ENVIRONMENT
				function fnDestroy() {
					
					//Remove window event listeners that reference fnfnHandleKeyMouse so reference to 'propeties' is freed-up
					if (typeof properties.fnHandleKeyMouse != "undefined") {

							
							document.removeEventListener( 'keydown', properties.fnHandleKeyMouse );									
							properties.renderer.obj.domElement.removeEventListener( 'mousedown', properties.fnHandleKeyMouse);
							properties.renderer.obj.domElement.removeEventListener( 'mousemove', properties.fnHandleKeyMouse);			
							properties.renderer.obj.domElement.removeEventListener( 'mouseup', properties.fnHandleKeyMouse);
							properties.renderer.obj.domElement.removeEventListener( 'dblclick', properties.fnHandleKeyMouse);						
							
							
							
						} //if	
					
					} //fnDestroy		

		
					// CLEAR (see https://github.com/mrdoob/three.js/issues/385 )
					THREE.Object3D.prototype.clear = function(){
					var children = this.children;
						for(var i = children.length-1;i>=0;i--){
							var child = children[i];
							child.clear();
							this.remove(child);
						};
					};


					if (properties.animationFrame) window.cancelAnimationFrame(properties.animationFrame);
					if (properties.scene.obj) {
						properties.scene.obj.clear(); 
						doDispose(properties.scene.obj);
					}
					if (properties.renderer.obj) {
						properties.container.removeChild(properties.renderer.obj.domElement);
						properties.renderer.obj.dispose();
						properties.renderer.obj.forceContextLoss();     //https://threejs.org/docs/index.html#api/renderers/WebGLRenderer.forceContextLoss
						properties.renderer.obj.context=undefined;
						properties.renderer.obj.domElement=undefined;
					}	
					
					//NULL-OUT any .obj PROPERTY
					for (var prop in properties){
						if (properties[prop] && properties[prop].hasOwnProperty("obj")) properties[prop].obj = null;
					} //for
						
				

				
				//https://stackoverflow.com/questions/22565737/cleanup-threejs-scene-leak
				function doDispose (obj){
					if (obj !== null){
						for (var i = 0; i < obj.children.length; i++){
							doDispose(obj.children[i]);
						} //for
						if (obj.geometry){
							obj.geometry.dispose();
							obj.geometry = undefined;
						}
						if (obj.material){
							if (obj.material.map){
								obj.material.map.dispose();
								obj.material.map = undefined;
							}
							obj.material.dispose();
							obj.material = undefined;
						}
					}
					obj = undefined;
				} //doDispose
				
				// SET SCENE PROPERTIES
				function fnSetSceneProperties(overrideProperties) {
					
					properties.visualData = overrideProperties.visualData ? overrideProperties.visualData : properties.visualData;					//Use override data/schema if they exists.
					properties.schema = overrideProperties.schema ? overrideProperties.schema : properties.schema;
							
					$.extend(true,properties,overrideProperties);														//Deep extend: http://api.jquery.com/jQuery.extend/
							
					
				} //fnSetSceneProperties	
				


				
				// REBUILD GRIDHELPER BASED ON  dat.GUI SETTINGS
				function fnRebuildGridHelper() {

					var settings = {x: 				properties.gridHelper.obj.position.x,										
									y: 				properties.gridHelper.obj.position.y, 
									z: 				properties.gridHelper.obj.position.z, 
									size: 			properties.gridHelper.gridSize,
									divisions: 		properties.gridHelper.divisions, 
									colorCenter: 	properties.gridHelper.colorCenter,
									colorGrid:		properties.gridHelper.colorGrid, 
									visible:  		properties.gridHelper.visible 
									};
					fnBuildGridHelper(settings);			
				
				} //fnRebuildGridHelper		
				
				
				
				// ANIMATE
				function animate() {
					
						properties.animationFrame = window.requestAnimationFrame( animate );						//https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/			
						properties.renderer.obj.render( properties.scene.obj, properties.camera.obj );		
												
						properties.controls.obj.update();
						properties.stats.update();

				}


			
				
				// beyeV ORBITAL CONTROL
				function fnShowBirdsEyeView() {
					
					// if (properties.camera.obj.position.y != properties.gridHelper.gridSize) {
					
						properties.controls.obj.reset();
					
					// }
				
				} //fnShowBirdsEyeView

				//Rotate the imagage
				function fnRotate() {
				
					//rotate clockwize
					properties.camera.obj.position.applyAxisAngle(new THREE.Vector3(0,1,0), -Math.PI / 2); //rotate clockwize 90 degrees
					properties.controls.obj.update();		
					
				}
				
				// SET BIRDSEYE VIEW
				function fnSetBirdsEyeView(){
					
					//Discussion on Camera lookat: https://stackoverflow.com/questions/15696963/three-js-set-and-read-camera-look-vector/15697227#15697227
					properties.camera.obj.position.set(0, properties.gridHelper.gridSize, properties.gridHelper.gridSize);
					properties.camera.obj.lookAt(properties.scene.obj.position);	
					properties.controls.obj.update();		
					properties.controls.obj.saveState();
				
				} //fnSetBirdsEyeView
				
				// BUILD GRIDHELPER	
				function fnBuildGridHelper (settings) {
					
					if (properties.gridHelper.obj) 
						properties.sceneGroup.remove(properties.gridHelper.obj);
					
					properties.gridHelper.obj = null;
					
					properties.gridHelper.obj = new THREE.GridHelper(settings.size, 
												settings.divisions, 
												settings.colorCenter, 
												settings.colorGrid);
					properties.gridHelper.obj.position.set(settings.x,settings.y,settings.z);
					properties.gridHelper.obj.material.visible = settings.visible;						
					properties.sceneGroup.add(properties.gridHelper.obj);		
				
				} //fnBuildGridHelper		
					
				
				// BUILD SCENE
				function fnBuildScene() {	
				
					// CONTAINER
					var container = properties.container;
					
					
					// PARENT GROUP	
					properties.sceneGroup = new THREE.Group();		
							
					// SCENE
					properties.scene.obj = new THREE.Scene();
					properties.scene.obj.background  = new THREE.Color(properties.scene.background);	
					
					
					//Visual
					
					// SCENE COMPONENTS
					// Adds objects to  properties.visualGroup.  The fnBuildVisual method is set in fnBuildVisual and is data dependent
					// Objects are built color-less	
					///		
					properties.visualGroup = fnBuildVisual();
					

					
					//Add visual created during join to the scene's parent group
					properties.sceneGroup.add(properties.visualGroup);	
					
					
					//*******************************************************************************************************************************	
					
					// BOXHELPER																						//A boundingBox for the complete group is then calculated. Its center is used to re-center the group relative to the scene's 0,0,0 coordiante. 
					properties.boundingBox.obj = 
							new THREE.BoxHelper(properties.visualGroup, properties.boundingBox.color); 					//Used to get the group's coordinates	
					properties.boundingBox.obj.geometry.computeBoundingBox();                         					//https://threejs.org/docs/index.html#api/core/BufferGeometry.computeBoundingBox
					properties.boundingBox.obj.visible = properties.boundingBox.visible;	
					
					var bBox = properties.boundingBox.obj.geometry.boundingBox;											//Save in properties for possbile future reference
					var bSphere= 
						properties.boundingBox.obj.geometry.boundingSphere;												//Save in properties for possible future reference
					properties.gridHelper.gridSize = Math.ceil(bSphere.radius) * 2.25;									//The grid size is 25% larger than the diameter (r*2)
							
					properties.boundingBox.boundingRange = new THREE.Vector3 (											// +/- x,y,z length values; Divide by 2 because group is centered in scene
						(bBox.max.x - bBox.min.x) / 2, 																	//Used to set orbit controls' target, which is a function of major axis orientation
						(bBox.max.y - bBox.min.y) / 2,       
						(bBox.max.z - bBox.min.z) / 2); 		
					
						
					var x = bSphere.center.x;
					var y = bSphere.center.y;
					var z = bSphere.center.z;
					var minY = bBox.min.y; 
																 
					properties.sceneGroup.add(properties.boundingBox.obj);	


					// LIGHT
					properties.scene.obj.add(new THREE.AmbientLight(0xffffff,0.5));
					properties.scene.obj.add(new THREE.HemisphereLight(0xffffff,0xffffff,0.5));
					
					
					// CAMERA
					var width = properties.containerWidth;
					var height = properties.containerHeight;
					
					var fieldOfView = properties.camera.fov.number;
					var aspectRatio = width / height;
					//var perspectiveNear = 0.1, perspectiveFar = 20000;		
					var perspectiveNear = 0.1, 
						perspectiveFar = properties.gridHelper.gridSize * 2;		
					properties.camera.obj = new THREE.PerspectiveCamera( fieldOfView, aspectRatio, perspectiveNear, perspectiveFar);
					properties.scene.obj.add(properties.camera.obj);
					

					// RENDERER
					if ( Detector.webgl )
						properties.renderer.obj = new THREE.WebGLRenderer( {antialias:true} );
					else
						properties.renderer.obj = new THREE.CanvasRenderer(); 

					//https://threejs.org/docs/index.html#examples/en/loaders/GLTFLoader
					properties.renderer.obj.gammaOutput = true;
					properties.renderer.obj.gammaFactor = 2.2;
					
					properties.renderer.obj.setSize(width, height);
					
					var zIndex = parseFloat($(container).css("z-index")) ?  parseFloat($(properties.container).css("z-index"))  : 0;
					
					$(properties.renderer.obj.domElement).css({"z-index": zIndex - 2, "position": "absolute", "top": 0, "left": 0} );		
					
					container.appendChild( properties.renderer.obj.domElement );
						
					// ORBIT CONTROLS
					properties.controls.obj = new THREE.OrbitControls( properties.camera.obj, properties.renderer.obj.domElement ); 			
					properties.controls.obj.enableKeys = true;
					properties.controls.obj.enablePan = true;
					properties.controls.obj.screenSpacePanning = false;	
					properties.controls.obj.panSpeed = properties.controls.panSpeed;	
					properties.controls.obj.zoomSpeed = properties.controls.zoomSpeed;	
					properties.controls.obj.maxPolarAngle = properties.controls.maxPolarAngle * (Math.PI / 180)  ;											
					

					// GRIDHELPER
					fnBuildGridHelper({x: x, y: minY, z: z, size: properties.gridHelper.gridSize, 
												   divisions: properties.gridHelper.divisions, colorCenter: properties.gridHelper.colorCenter,
												   colorGrid:properties.gridHelper.colorGrid, visible:  properties.gridHelper.visible  });
					
				
					// AXESHELPER														
					properties.axesHelper.obj = new THREE.AxesHelper( properties.gridHelper.gridSize );			//Add x,y,z axis helper at scenes 0,0,0
					properties.axesHelper.obj.position.set(-properties.boundingBox.boundingRange.x, -properties.boundingBox.boundingRange.y, -properties.boundingBox.boundingRange.z )
					properties.axesHelper.obj.visible = properties.axesHelper.visible;
					properties.scene.obj.add( properties.axesHelper.obj );
						
				
					properties.sceneGroup.position.x = -x; 														    //Center image relative to scene's x:0,y:0,z:0 
					properties.sceneGroup.position.y = -y;																
					properties.sceneGroup.position.z = -z;
					
				
					properties.scene.obj.add(properties.sceneGroup);
					
					properties.controls.obj.maxDistance = properties.gridHelper.gridSize * 1.5;						//Don't allow orbital control to go out beyond the 150% of gridSize		
							


					//Tooltip 
					
					properties.toolTipDiv = $(document.createElement("div"));    									//A jQuery object

					properties.toolTipDiv.css({
										  position: "absolute",
										  left: 0,
										  top: 0,
										  "text-align": "center",
										  padding: "2px 2px",
										  "font-family": "Verdana,Arial,sans-serif",
										  "font-size": "11px",
										  background: "#ffffff",
										  display: "none",
										  opacity: 0,
										  border: "1px solid black",
										  "box-shadow": "2px 2px 3px rgba(0, 0, 0, 0.5)",
										  "border-radius": "3px"
										});


					$(container).append(properties.toolTipDiv);

					
					// KEY AND MOUSE HANDLER
					properties.fnHandleKeyMouse = function (event){
					
						event = event || window.event;			
											
						if (!event.target === properties.renderer.obj.domElement) return; //Only handle events for visualization;
						
						properties.offsetX= event.offsetX;
						properties.offsetY = event.offsetY;
						

						switch(event.type){   //Based on document, so offset is relative to doucument if the intent is to use event.offsetX/offsetY
							case "keydown":
								if (!event.ctrlKey) {
									//http://www.asciitable.com/
									switch(event.keyCode) {
										case 66: 				//key = 'b'
											fnShowBirdsEyeView();
											break;
										case 27:                //key = 'Escape'			
										case 67:				//key = 'c'
											properties.fnSearchIntersects("reset");	
											break;	
									} //switch
								}// if
								break;						
							case "mouseup":
								break;
							case "mousedown":
									if (!event.ctrlKey) break;
							case "dblclick":
							
								var intersects = fnGetRayCasterIntersects(properties);
								
								if (intersects) {
									
									var dataRow = properties.fnSearchIntersects(intersects, !event.ctrlKey);
									
									if (!dataRow) return;
									
									if (event.ctrlKey) {    //Navigate to link, if any
										
										if (dataVisual.selectionLinks.length > 0){
																				
											var selectName = dataVisual.visualName + "_links_" + dataRow[dataVisual.dataKey];
												
											$("[name='" + selectName + "']").clone().appendTo(properties.toolTipDiv);

										} //if 

									} //if
									
									
								} //if
								else {
									properties.fnSearchIntersects("reset");	
								}//else
									
								
									
								break;
							case "mousemove":	  //https://stackoverflow.com/questions/39177205/threejs-tooltip http://jsfiddle.net/UberMario/60xkg97p/4/
							
									fnHandleMouseMove(properties.toolTipDiv);		

							default:	
						} //switch
						
						function fnHandleMouseMove(toolTip) {
							
										
							var renderer =  properties.renderer.obj;
							var camera = properties.camera.obj;

							var intersects = fnGetRayCasterIntersects(properties);
							
							if (intersects) {
								
								var dataRow = fnSearchIntersects(intersects, false);				
													
								if (dataRow){
									
									var column = dataVisual.activeGridColumn.column;
									
									var split = column.split(dataVisual.colorPrefix);
									var colorColumn = split[split.length - 1];					//Reference to origial column to get it's unique categories, not the column with the colors		
									var columnText0 = column == "recid" || column == dataVisual.dataKey || column == " " + dataVisual.visualKey ? "" : colorColumn.trim() + " ";
									var text = dataVisual.activeGridColumn.grid.columns.find(function(col){return col.field == column}).caption;
									
									var columnText = (fnIsPresetColor(column) || dataVisual.data[0][dataVisual.colorPrefix + column] != undefined ) ? columnText0 + text : text;
									var formattedValue = dataVisual.dataTypes[column].type != "text" ? 
																fnFloatFormat(dataVisual,dataVisual.activeGridColumn.column, dataRow[dataVisual.activeGridColumn.column]) :
																	dataRow[dataVisual.activeGridColumn.column];
									var text =  column == dataVisual.dataKey || column == dataVisual.visualKey ? 
															dataRow[dataVisual.dataKey] :
																dataRow[dataVisual.dataKey] + ": " + columnText + ": " + formattedValue;
	

									fnShowToolTip(text, intersects[0].point);
								}

							} //if
							else {
									hideTooltip();	
							} //else
							
							
				
							// This will immediately hide tooltip
							function hideTooltip() {

								toolTip.css({ display: "none"});

							} //hideTooltip				
							
							// This will move tooltip to the current mouse position and show it by timer.
							function fnShowToolTip(text, latestMouseProjection) {
							
								if (toolTip && latestMouseProjection) {

									toolTip.empty();
									toolTip.text(text);

									var canvasHalfWidth = renderer.domElement.offsetWidth / 2;
									var canvasHalfHeight = renderer.domElement.offsetHeight / 2;

									//Normalized with 0,0,0 centered on the scene 
									var tooltipPosition = latestMouseProjection.clone().project(camera);   

									//Relative to the renderer		
									tooltipPosition.x = (tooltipPosition.x * canvasHalfWidth) + canvasHalfWidth ;
									tooltipPosition.y = -(tooltipPosition.y * canvasHalfHeight) + canvasHalfHeight;	

									toolTip.css({	
										//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
										left: `${tooltipPosition.x - toolTip.outerWidth() / 2 }px`,   
										top:  `${tooltipPosition.y - toolTip.outerHeight() - 5}px`,
										opacity: 1.0,
										display: "block"
									});
								

								} //if
							  
							} //fnShowToolTip
										
							
						
						} //fnHandleMouseMove

				
		
					}//properties.fnHandleKeyMouse
					
					
					// EVENTS			
					
					document.addEventListener( 'keydown', properties.fnHandleKeyMouse , false );								//https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
					properties.renderer.obj.domElement.addEventListener( 'mousemove', properties.fnHandleKeyMouse, false )
					properties.renderer.obj.domElement.addEventListener( 'mousedown', properties.fnHandleKeyMouse, false );	
					properties.renderer.obj.domElement.addEventListener( 'mouseup', properties.fnHandleKeyMouse, false );
					properties.renderer.obj.domElement.addEventListener( 'dblclick', properties.fnHandleKeyMouse, false );		
							
					
					//RETURN
					return;
					
					
						
					//USE RAYCASTING TO DETERMINE INTERSECTS
					function fnGetRayCasterIntersects(properties){

						// the following line would stop any other event handler from firing
						// (such as the mouse's TrackballControls)
						// event.preventDefault();
						//properties.mouse is a THREEjx object
						
						//https://riptutorial.com/three-js/example/17088/object-picking---raycasting  (uses clientX and window coordinates to normalize, logic below uses domElement and clientX/Y to normalize)
						
						var renderer = properties.renderer.obj ;
						var camera = properties.camera.obj ;
						var grouping = properties.visualGroup ;
						
						properties.mouse.x = ( properties.offsetX / renderer.domElement.clientWidth ) * 2 - 1;   //Normaized and relative to container that my be offset within the client
						properties.mouse.y = - ( properties.offsetY / renderer.domElement.clientHeight ) * 2 + 1;
						properties.raycaster.setFromCamera( properties.mouse, camera );
						
						//var intersects = properties.raycaster.intersectObjects( grouping.children,true );
						var intersects = properties.raycaster.intersectObjects( dataVisual.join.map(function(joinRow){ return joinRow.visualObj}),true );
						
						return  (intersects.length == 0) ? null : intersects;
						
						
									
					} // fnGetRayCasterIntersects
					
					
						
				} //fnBuildScene()
				
				//Build a Three.js group of for the visual object from the gltf file. 
				//Discussion on Model, View and Projection matrices: http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/#the-model-view-and-projection-matrices	
				function fnBuildVisual() {
				
					var visualGroup = new THREE.Group();  															//Containing the whole image allows for possible complete transforms later
					visualGroup.name = "visual";
																													//In Threejs space, image is laid out relative to 0,0,0		
					var	visual = properties.visual;

					/*
					visual.scene.traverse( function ( node ) {

						if ( node.isMesh || node.isLight ) node.castShadow = true;
						
					} );
					*/
					
					//var meshes = visual.scene.children.filter(function(node){return node.isMesh || node.isGroup});	
					//meshes.forEach(function(mesh){visual.add(mesh.clone())});	
					
					//visualGroup.add(visual.scene.clone());	
					visualGroup.add(visual.scene);	

					visualGroup.traverse(function (node) {  //object may be a node deep in the mesh hiearchy	
						if (node.userData){
							if (node.userData[properties.visualizeProp]) {    //GLTF file would have associated with mesh:  {Blender: ...."extras": {"visualize": 1.0} ...}, In Blender it's custom property: https://docs.blender.org/manual/en/latest/data_system/custom_properties.html
								fnSaveChildrenOriginalColor(node);
							}//if	
						}//if	
					});
				
					return visualGroup;	
				
					function fnSaveChildrenOriginalColor(node){   //parent and children (if any) have userData.originalColor assigned to them as well
							node.traverse(function (node){
								if (node.material) node.userData.originalColor = new THREE.Color().copy(node.material.color);	//copy the original color assoicated with the mesh		
							});
					} // fnSaveChildrenOriginalColor
					
				} //fnBuildVisual	
				



				//https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
				function uuidv4() {
				  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
					(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
				  )
				}	
				
					

				
				
			} //dataVisualizer

								
		} //fnBuildDataVisualizer


		function fnGetDataTypes(dataVisual) {	
	
			var visualizeData = dataVisual.data;
	
			var dataTypes = {};
		
			for (var i = 0; i < visualizeData.length; i++ ){
											
				// CALCULATE DATATYPES by inspecting each column of each row 	
					var mergedRow = i == 0 ? {} : mergedRow;
					
					Object.assign(mergedRow, visualizeData[i]);
					
					var aColumns = Object.keys(mergedRow);
					
					aColumns.forEach(function(column) { 
						if (dataTypes[column]) {
							dataTypes[column].type = dataTypes[column].type == "text" ?  "text"  :  isNaN(Number(mergedRow[column])) ? "text" : "float";
						} //if
						else {
							dataTypes[column] =  {type: isNaN(Number(mergedRow[column])) ? "text" : "float"};
						} //else
							
							
						
					}); //aColumns.forEach
																					
			} //for 	
			
			//Determine columns with color assigned, dataKey or visualKey for column, number of decimal places for floats, dates and aUniqueCategories
			var aColumns = Object.keys(visualizeData[0]);
			
					
			aColumns.forEach(function(column) { 
			
				dataTypes[column].colorColumn = dataTypes[dataVisual.colorPrefix + column];   //May be undefined if no color if predefined for column
			
				//Date must be milliseconds since 1 January 1970 00:00:00 UTC: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
				dataTypes[column].type  = column.substring(0,dataVisual.datePrefix.length) == dataVisual.datePrefix ? "date" : 
							column.substring(0,dataVisual.dateTimePrefix.length) == dataVisual.dateTimePrefix ? "dateTime" :
								column.substring(0,dataVisual.timePrefix.length) == dataVisual.timePrefix ? "time" :
									dataTypes[column].type;
			
				dataTypes[column].key =  column.split(dataVisual.colorPrefix)[column.split(dataVisual.colorPrefix).length - 1].substring(0,1) != " " ?
										 dataVisual.dataKey :		//Doesn't matter which key recid gets assigned to
										 dataVisual.visualKey;		
							
			
				if (dataTypes[column].type == "float") {
					
					dataTypes[column].numDecimals = 0;
					for (var i = 0; i < visualizeData.length; i++ ){
						
						dataTypes[column].numDecimals = Math.max( dataTypes[column].numDecimals,fnDecimaPlaces(visualizeData[i][column]));
		
					}//for
					
				} //if
				
				
				switch (true){
					
					case dataTypes[column].type == "date":
						dataTypes[column].caption = column.substring(dataVisual.datePrefix.length);
						break;
					case dataTypes[column].type == "dateTime":
						dataTypes[column].caption = column.substring(dataVisual.dateTimePrefix.length);
						break;										
					case dataTypes[column].type == "time":
						dataTypes[column].caption = column.substring(dataVisual.timePrefix.length);
						break;
					default:
						dataTypes[column].caption = column;
				
				} //switch
				
				

								
				//https://stackoverflow.com/questions/10454518/javascript-how-to-retrieve-the-number-of-decimals-of-a-string-number
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
	

			}); //aColumns.forEach
			
			
			return dataTypes;
		
																			
		} // fnGetDataTypes

		function fnBuildGrid(dataVisual, visualizer, gridType){
				
			var dataGridProps  = fnGetGridProperties(dataVisual, visualizer, gridType); 
			
			return 	$().w2grid(dataGridProps);
			
			
			function fnGetGridProperties(dataVisual, visualizer, gridType) {
				
																	
				var gridRecords =  dataVisual.data;
				
				var dataTypes = dataVisual.dataTypes;
					
				var dataFields = Object.keys(dataVisual.data[0]).filter( function(field){
																			var parseField = field.split(dataVisual.colorPrefix);
																			var field =  parseField[parseField.length - 1];
																			//Data or Visual filter; " " prefix for visual data columns	assinged in dataVisual fnSetVisualProps
																			var filterTest = gridType == "data" ? field.substring(0,1) != " " : field.substring(0,1) == " ";
																				filterTest = field == "recid" ? true : filterTest;
																			return filterTest;  
																		});
				
				//var floatFields = dataFields
				//					 .filter(function (field){ return dataTypes[field].type == "float"; });
								
				var columns = [];
				var bColorField = false;  //Tracks Pre-assigned color fields					
				
				var key = (gridType == "data" ? "" : " ")  + dataVisual[gridType + "Key"] ;  // " " prefix for visual data columns	assinged in dataVisual fnSetVisualProps
				
				columns.push({	field: 		"recid",  
								caption: 	"Join Row", 
								sortable:	true, 
								searchable:	true, 
								hidden: 	false, 
								render: 	fnGridColumnRender 
								});   //Always located in column 1 associted with key used for join in Column 2
				
				columns.push({	field:		key, 
								caption: 	key.trim() + " (Key)", //Always in column 2
								render: 	fnGridColumnRender, 
								sortable:	true, 
								searchable:	true , 
								hidden: 	false
							});	
							  
				if (dataTypes[dataVisual.colorPrefix + key]) { //position here for column grouping
					
					columns.push({	field: 		dataVisual.colorPrefix +  key, 
									caption: 	"Color (Preset)" , 		
									render: 	fnGridColumnRender, 
									sortable: 	true, 
									hidden: 	false, 
									searchable: true
								});	//if key has color, Column 3	  
					
					bColorField = true;
				}	
				//***********************************	
				//Start Columns 4 through dataFields.length					
				//***********************************


				dataFields
					.filter(function(columnName){return columnName != "recid" })			
					.filter(function(columnName){return columnName != key})			
					.filter(function(columnName){return !fnIsPresetColor(columnName)  })
					.forEach(function(field,i){ 
								
									var fieldCaption = dataTypes[field].caption;
																		
									var column = {	field:	field, 
													caption: fieldCaption.trim()  + " (Scaled)", 
													sortable: true, 
													searchable: true, 
													hidden: false, 
													render: fnGridColumnRender};
									columns.push(column);
									
				
									if (dataTypes[dataVisual.colorPrefix + field]){ //If the current field in loop also has predefined color; position here for column grouping
										
										columns[columns.length - 1].caption =  "Value (Scaled)";
										
										var colorColumn = {	field: dataVisual.colorPrefix + field, 
															hidden: false, 
															caption: "Color (Preset)", 
															sortable: true, 
															searchable: false, 
															render: fnGridColumnRender};
										
										columns.push( colorColumn );
										
										bColorField = true;   //data has at least 1 pre-set color field
									
									} //if	 

				}); //dataField.forEach		
								
			
				if (dataVisual.selectionLinks.length > 0 && gridType == "data") {
					columns.push({	field: "_links", 
									caption:"Link(s)", 
									sortable: false, 
									searchable: false, 
									hidden: false,
									render: function(record,rowIndex,columnIndex) {

											
											var select = "<select "
											select += "name='" + dataVisual.visualName + "_links_" + record[dataVisual.dataKey]+"'"; 
											select += " style='width: 100% !important;'"; //Fix for select width issue when rendered in column: https://github.com/vitmalina/w2ui/issues/1827#issuecomment-494770546
											select += " onchange='";
											select += "if (this.value == -1) return;  window.open(this.value , \"_blank\");" + "'>";
											var options = "<option value=-1 linknum=-1>Links...</option>"
										
											dataVisual.selectionLinks.forEach( function(selection,i){
												
												linkParms = [];
												urlParms = "";
												Object.keys(selection).forEach(function(parm,i) {
																if (parm != "url" && parm != "urlText") {
																	linkParms.push(dataVisual.data[record.recid - 1][selection[parm]]) ;  //Booyah Booyah!
																	urlParms += parm + "=" + escape(dataVisual.data[record.recid - 1][selection[parm]]) + "&";
																}	
														});	//forEach									
												  urlParms =  urlParms.substring(0,urlParms.length - 1);
												  options = options + "<option value='" + selection.url + urlParms +  "' >" + selection.urlText + " (" + linkParms.join() +")</option>" ;
											}); //forEach
										
											return select + options + "</select>";

										} //render 
								   } //push object

					);	//columns.push method
					
				} //if	
					
				//***********************************	
				//End Columns 4 through dataFields.length					
				//***********************************
				
				var columnGroups = [];
				
				if (bColorField){
					
					columnGroups= [
							{	
								caption: 'Row', span: 1, 
								master: true
							}				
					]
					
					for (var i = 1; i < columns.length - 1; i++){  //skip over recid and last columm ( i < columns.length - 1)
					
						if ( !fnIsPresetColor(columns[i].field) && !columns[i].hidden ){
							
							if (dataTypes[dataVisual.colorPrefix + columns[i].field]){  //If the current field as a preset color associate with it
								
								columnGroups.push({	
													caption: columns[i].field.trim() ,
													span: 2, 
													master: false});  //Span over current field and next field
								
							}	
							else {								
									
								columnGroups.push({	
													caption: columns[i].field.trim(), 
													span: 1, master: true}); //Otherwise, just a single splan
								
							}
							
						} //if
						
					} //for
					
					if (columns[columns.length -1].field == "_links") {					//links is hidden and was handled above
							
						columnGroups.push({	
											caption: "Link(s)", 
											span: 1, 
											master: true
										  });
					}
					else {
						
						if ( !fnIsPresetColor(columns[i].field) && !columns[i].hidden )
							columnGroups.push({	
												caption: columns[i].field.trim(), 
												span: 1, 
												master: true
											}); //Otherwise, just a single splan	
						
					}
				
				} //if

				
				
				return {
					name		: dataVisual.visualName + "_" + gridType + "Grid",		
					columns		: columns,				
					columnGroups: columnGroups,
					recordHeight: 50,	
					records		: gridRecords,   
					header: 	dataVisual[gridType + "Name"],
					show: 		{
									toolbar: true,
									toolbarReload: false,
									footer: true,
									selectColumn: true,
									footer: true,
									header: true,
							
								},

					sortData: 	columns
									.filter(function(row){return row.field != "_links"; })	
									.map(function(row){ return {field: row.field, direction: "ASC" } }) ,	
										
					searches: 	columns
									.filter(function(row){return row.field != "_links"; })
									.map(function(row,i, arr){ return {field: row.field, 
																		caption: fnIsPresetColor(row.field) ? arr[i-1].field.trim()  + " COLOR"  
																										   : row.field.trim() == "recid" ?  "Join Row"
																										   : dataVisual.dataTypes[row.field].caption.trim()
																	   ,  
																	   type:  dataTypes[row.field].type 
																	   } 
															 }),			
				
					multiSearch : true,
					multiSelect: true,
					multiSort: true,


					toolbar: fnGetGridToolbar(dataVisual, visualizer, gridType),
		
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
								http://w2ui.com/web/docs/1.5/utils/events
								event.done(function(event){
									
										fnHandleSelectionOrSearch(event) // http://w2ui.com/web/docs/1.5/w2grid.onSearch
										
												
										});  //event.done
					}, //onSearch
					onColumnClick: function(event){ 

						
						event.done(function(){	

							if (event.field == "_links") return;
		
							dataVisual.activeGridColumn = {grid: this, column: event.field};	
							fnVisualize(dataVisual);
						
							
						}); //done
						
							
					
					}, //onColumnClick

					
				} //return object
				

				//*************fnGridColumnRender
				function fnGridColumnRender(record, row_index, column_index) {	
				
					var fieldColorColumn = this.columns[column_index].field;
					var fieldText = fieldColorColumn == "recid" ? record.recid  : record[fieldColorColumn];  
					var predDefinedColor = fnIsPresetColor(fieldColorColumn);
					var fieldValueColumn = predDefinedColor ? this.columns[column_index -1].field : this.columns[column_index].field ;	//For predefined colors columns, reference the column to its left	
					var fieldValueType = dataVisual.dataTypes[fieldValueColumn].type;	
				
				
					if (!this.toolbar.get('styleGrid').checked)   //No visualization formatting
						return predDefinedColor ? fieldText : fieldValueType != "text"  ?   fnFloatFormat(dataVisual, fieldValueColumn, fieldText) : fieldText;
				
					//Logic for 'Visualize Grid Data' option 
				
					var numDecimals = 	dataVisual.dataTypes[fieldValueColumn].numDecimals;
					var fieldValue = record[fieldValueColumn];		
					var dataRecordIndex = record.recid - 1;  //The actual index into the data
					
					
					var color = predDefinedColor ? 
							record[this.columns[column_index].field] : 
								fnGetObjectScaleColorAndOptionallyVisualize(dataVisual, fieldValueColumn, dataRecordIndex, false);   
								

							
					var divWidth;
					if (fieldValueType != "text" ){
								
							var columnAttributes = fnGetColumnAttributes(fieldValueColumn,dataVisual);	

							var minPixels = 50;
							var maxPixels = 100;
							var scale = d3.scaleLinear()
										.domain([columnAttributes.minScale, columnAttributes.maxScale])
										.range([minPixels, maxPixels]);
							divWidth = scale(fieldValue);																		

						
					}//if	
					
					divWidth = (fieldValueType != "text" ) ? divWidth : 100;
					
					var div = $(document.createElement("DIV"))  //https://www.quora.com/How-do-you-create-a-box-filled-with-a-color-with-HTML-CSS
									.css({"width": divWidth + "px"})
									.css({"outline-style": "solid", "outline-width": "thin"})
									.css({"line-height":"25px", "height":"25px", "vertical-align":"center"})
									.css({"background-color": color, "opacity":"1"});
					
					$(document.createElement("SPAN"))
						.css({"background-color": "white", "opacity":".8"})  //Displays the text in a slighlty opaque box
						.text(predDefinedColor ? fieldText : fieldValueType != "text"  ?   
							fnFloatFormat(dataVisual, fieldValueColumn, fieldText) : 
								fieldText)
						.appendTo(div);
									
									
					
					return "&nbsp;" + div[0].outerHTML;													
																																			
				} //fnGridColumnRender
			
		
				
			} //fnGetGridProperties		
			
			
			
			
			
			
		}//fnBuildGrid

		function fnGetGridToolbar(dataVisual, visualizer, gridType) {
		
			function fnBuildRadioIds(prefix,start,end,increment){
				
				arr = [];
				for (var i = start; i <= end; i = i + increment){
					arr.push({id: prefix + "_" + (increment < 1 ?  String(i).substring(0,3) : i), text: increment < 1 ? String(i).substring(0,3) : String(i)})
				} //for
				return arr;
				
			} //fnBuildRadioIds
		
			var aFOV = fnBuildRadioIds("fov",10,100,5);
			var aGridDiv = 	fnBuildRadioIds("div",2,20,1);
			var aZoomSpeed = fnBuildRadioIds("zp",.1,2.1,.1);
			var aPanSpeed = fnBuildRadioIds("ps",.1,2.1,.1);

			switch(gridType){
				
				case "data":

					return {
							items: [
									{type: 'break'},
									{type: 'check', id: 'styleGrid', text: "Visualize Grid", checked: false, tooltip: 'Visualize Data on Grid'},
									{type: 'break'},
									// {type: 'button', id: 'downloadButton', text: translate("DownLoadData"), tooltip: 'Download .csv file of current data grid'} 
									{type: 'button', id: 'downloadButton', text: "Download", tooltip: 'Download .csv file of current data grid'} 

									],	
																
								onClick: function (event){
											
											switch(event.target){
																					
												case "downloadButton":	
													if (!( document.documentMode || /Edge/.test(navigator.userAgent ) ) ) {	
													
														var oGrid = this.owner;
														var gridData = oGrid.searchData.length > 0 
															?  oGrid.last.searchIds.map(function(searchId){ return dataVisual.data[searchId] })  //search results
															:  	dataVisual.data;    //or all records				
													
														var mdvDownLoadData= "data:text/plain;charset=utf-8," + encodeURIComponent(d3.csvFormat(gridData)); //https://github.com/d3/d3-dsv#csvFormat
														
														var anchor = $(event.originalEvent.currentTarget).find("a");
																		
														
														if (anchor.length == 0){

															var anchor = $(document.createElement("a"))
																			.attr("download","dataDownload.csv");  
																			// .click(function (){ debugger; this.href = "";} );  //Save space in the DOM: doesn't work because click is handled before download
															
																	
															$(event.originalEvent.currentTarget).append(anchor);	//https://api.jquery.com/wrap/	
														
															
														} //if

														anchor.attr("href",mdvDownLoadData);
														
														anchor[0].click(); //https://stackoverflow.com/questions/34174134/triggering-click-event-on-anchor-tag-doesnt-works
														

													} //if	
													break;
													
												default:
													break;
												
											}//switch		
										
											event.done(function (event){
												
												if (event.target == "styleGrid"){   //Button to Toggle Visualization Styling of Data Grid Selected

													
													this.owner.refresh();  //re-render grid with/without styling
													
												} //if		
												
											});
								
								
								
								} //OnClick
								
							}; //toolbar
					break;			

				case "visual":		
					return		{
									items: [
										{type: 'break'},
										{type: 'check', id: 'styleGrid', text: "Visualize Grid", checked: false, tooltip: 'Visualize Data on Grid'},									
										{type: 'break'},
										{type: 'check', id: 'gpuPerformance', checked: false,   text: fnGetTranslatedText, tooltip: "Show Graphical Processing Unit Performance"}, 						
										{type: 'html', id: 'gpuPerformanceContainer', html: "<span id='gpuContainer' style='display:none'></span>"},
										{type: 'break'},					
										{type: 'button', id: 'bev', text: "Reset View", tooltip: "Show Bird's Eye View"}, 					
										{type: 'break'},					
										{type: 'button', id: 'rotate', text: "Rotate", tooltip: "Rotate Visual"}, 					
										{type: 'break'},	
										{type: 'check', id: 'axesHelper', checked: visualizer.axesHelper.obj.visible, text: "Axes", tooltip: "Toggle Axes on Visual"}, 
										{type: 'break'},					
										{type: 'color', id: 'background', color: visualizer.scene.obj.background.getHexString() , text: "Background", tooltip: "Set Background Color"}, 								
										{type: 'break'},										
										{type: 'check', id: 'boundingBox', checked: visualizer.boundingBox.obj.visible,  text: "Bounding Box", tooltip: "Toggle Bounding Box"}, 	
										{type: 'color', id: 'bBoxColor', color: visualizer.boundingBox.obj.material.color.getHexString() , text: "Color", tooltip: "Set Bounding Box Color"}, 													
										{type: 'break'},
										{ type: 'menu-radio', id: 'fov', 
											text: function (item) {
												return 'Camera Field of View: ' + item.selected.split("_")[1];
											},
											selected: "fov_" + visualizer.camera.fov,
											items: 	aFOV,
											tooltip: "Set Camera's Field of View"	
										},					
										{ type: 'menu-radio', id: 'polarAngle', 
											text: function (item) {
												return 'Polar Angel: ' + item.selected.split("_")[1];
											},
											selected: "pa_" + visualizer.controls.maxPolarAngle,
											items: 	[
														{id: 'pa_90', text: "90"},
														{id: 'pa_180', text: "180"}
											],
											tooltip: "Set Visual's Polar Angle"
										},
										{ type: 'menu-radio', id: 'zoomSpeed', 
											text: function (item) {
												return 'Zoom Speed: ' + item.selected.split("_")[1];
											},
											selected: "zs_" + visualizer.controls.zoomSpeed,
											items:  aZoomSpeed,
											tooltip: "Set Camera Zoom Speed"
										},
										{ type: 'menu-radio', id: 'panSpeed', 
											text: function (item) {
												return 'Pan Speed: ' + item.selected.split("_")[1];
											},
											selected: "ps_" + visualizer.controls.panSpeed,
											items:  aPanSpeed,
											tooltip: "Set Pan Speed"
										},	
										{type: 'break'},										
										{type: 'check', id: 'gridHelper', checked: visualizer.gridHelper.obj.visible, text: "Grid&nbsp;", tooltip: "Toggle Grid"},
										{type: 'color', id: 'colorGrid', color: new THREE.Color(visualizer.gridHelper.colorGrid).getHexString() ,
											  text: "Grid Color", tooltip: "Set Grid Color"}, 								
										{type: 'color', id: 'colorCenter', color: new THREE.Color(visualizer.gridHelper.colorCenter).getHexString() ,
											  text: "Center Line Color", tooltip: "Set Grid Center Line Color"}, 
										{ type: 'menu-radio', id: 'divisions', 
											text: function (item) {
												return 'Grid Divisions: ' + item.selected.split("_")[1];
											},
											selected: "div_" + visualizer.gridHelper.divisions,
											//items:  aGridDiv
											items: 	aGridDiv,
											tooltip: "Set Grid Divisions"
										}
									],	
									
									onClick: function (event){   //For Toolbar
									
												switch(event.target){
													

													case "bev":
														visualizer.showBirdsEyeView();
														break;								
													case "rotate":
														visualizer.rotate();
														break;	
													case "gpuPerformance":	
														var isVisible = $("#gpuContainer").css("display") == "inline";
														$("#gpuContainer").css("display", isVisible ?  "none" : "inline");
														
														if ($("#gpuContainer").contents().length == 0){
															$("#gpuContainer").append($(visualizer.stats.domElement).contents());
														} //
													case "background":
														visualizer.scene.obj.background.set(this.get('background').color)
														break;
													case "bBoxColor":
														visualizer.boundingBox.obj.material.color.set(this.get('bBoxColor').color)		
														break;	
														
													default:
														break;
													
												}//switch		
											
												event.done(function (event){
													
													switch(event.target.split(":")[0]){

														case "styleGrid":

															this.owner.refresh();  //re-render grid with/without styling	
									
															break;

														case "axesHelper":
															visualizer.axesHelper.obj.visible = this.get('axesHelper').checked;		
															break;
														case "boundingBox":								
															visualizer.boundingBox.obj.visible = this.get('boundingBox').checked;
															break;
														case "fov":
															visualizer.camera.fov = parseInt(this.get("fov").selected.split("_")[1]);
															visualizer.camera.obj.fov = visualizer.camera.fov;
															visualizer.camera.obj.updateProjectionMatrix();
															break;
														case "polarAngle":
															visualizer.controls.maxPolarAngle = parseInt(this.get("polarAngle").selected.split("_")[1])  ;
															visualizer.controls.obj.maxPolarAngle = visualizer.controls.maxPolarAngle * (Math.PI / 180);
															break;
														case "zoomSpeed":
															visualizer.controls.zoomSpeed = parseFloat(this.get("zoomSpeed").selected.split("_")[1]);
															visualizer.controls.obj.zoomSpeed = visualizer.controls.zoomSpeed;									
															break;
														case "panSpeed":
															visualizer.controls.panSpeed = parseFloat(this.get("panSpeed").selected.split("_")[1]);
															visualizer.controls.obj.panSpeed = visualizer.controls.panSpeed;									
															break;									
														case "gridHelper":
														case "colorGrid":
														case "colorCenter":
														case "divisions":
														case "gridSize":

															visualizer.gridHelper.visible = this.get('gridHelper').checked;
															visualizer.gridHelper.colorGrid = this.get('colorGrid').color;
															visualizer.gridHelper.colorCenter =	this.get('colorCenter').color;
															visualizer.gridHelper.divisions = parseInt(this.get("divisions").selected.split("_")[1]);

															var settings = {
																x: 				visualizer.gridHelper.obj.position.x,										
																y: 				visualizer.gridHelper.obj.position.y, 
																z: 				visualizer.gridHelper.obj.position.z, 
																size: 			visualizer.gridHelper.gridSize,
																divisions: 		visualizer.gridHelper.divisions, 
																colorCenter: 	visualizer.gridHelper.colorCenter,
																colorGrid:		visualizer.gridHelper.colorGrid, 
																visible:  		visualizer.gridHelper.visible 
																};
															
															visualizer.rebuildGridHelper(settings); 
															break;
														default:	
															break;
													} //switch
													

													
												});
												

							
							} //OnClick	
							
						}; // return toolbar 	
					break;
							
			} //switch		
			
		} //fnGetVisualGridToolBar		

		function fnVisualize(dataVisual){
			

			
			fnSetVisualColors(dataVisual);            
			fnSetVisualScalingTitle(dataVisual);								  
			
			//fnGridSelectColumn(dataVisual);								
			
			dataVisual.dataGrid.refresh();
			dataVisual.visualGrid.refresh();
			
		}

		function fnHandleSelectionOrSearch(event){

			
			if (dataVisual.searching) return;  //Prevent deadly embrace
			
			dataVisual.searching = true;
		
			//fnClearIsolateSelections("clear");	//Clear
			dataVisual.join.forEach(function (joinRow){ joinRow.visualObj.visible = true;});
			
		
			var grid = w2ui[event.target];  //Could be either data grid or visual grid
			var grid2 = grid === dataVisual.dataGrid ? dataVisual.visualGrid : dataVisual.dataGrid;
			
			
			var recIds = event.searchData ?  grid.last.searchIds :   // http://w2ui.com/web/docs/1.5/w2grid.last
												grid.getSelection(true); // http://w2ui.com/web/docs/1.5/w2grid.getSelection
			if (recIds.length > 0){
			
				dataVisual.join.forEach(function (joinRow){ joinRow.visualObj.visible = false;});    //Initially make everything invisible
			
				var searches = [];  //For the other grid
				var recordKey = grid === dataVisual.dataGrid ? dataVisual.dataKey : " " + dataVisual.visualKey;
				var searchKey = recordKey == dataVisual.dataKey ? " " + dataVisual.visualKey : dataVisual.dataKey;  //for the other grid
										
				recIds.forEach(function (recid){
								
					var keyValue = grid.records[recid][recordKey];
					
					dataVisual.getJoinByProperty(searchKey, keyValue).visualObj.visible = true;    //Un-hide objects from the search

					if (event.searchData){		
						searches.push({field: searchKey, value: keyValue, operator: 'is'}); //http://w2ui.com/web/docs/1.5/w2grid.searchData
					} //if	
					else {
						searches.push(grid2.records.find(function(record){return record[searchKey] == keyValue}).recid );	//Find the recid in the grid2 grid
					}//else
						
				}); // recIds
						
						
				if (event.searchData){		
					grid2.searchReset();				//dataVisual.searching == true will prevent deadly embrace
					grid2.search(searches, 'OR');  	//Perform search on the other grid with 'OR'  http://w2ui.com/web/docs/1.5/w2grid.search
				} //if
				else {
					grid2.selectNone();	
					//grid2.select(searches.join()); //Doesn't work http://w2ui.com/web/docs/1.5/w2grid.select
					searches.forEach(function(search){grid2.select(search);});
					
					
				} //else
			
			} //if (recIds.length > 0)
			else {

				fnSearchIntersects("reset");
			
			} //else
				
			dataVisual.searching = false;	

		}  // fnHandleSelectionOrSearch	
	
		function fnGridSelectColumn(dataVisual){   //Used by data and visual grid to de-select Column (from either grid) and select on current grid
		
			//gridColumnSelection class defined in dataVisualizer.css file
		
			//Remove existing backgrounds from the complete data and visual grid; even if they are already applied to current column
			$(mdvLayout).find(".gridColumnSelection").removeClass("gridColumnSelection");  
								
			//Apply background to selected column
			//for (var i = 0; i < dataVisual.activeGridColumn.grid.total; i++) {
			for (var i = 0; i < dataVisual.activeGridColumn.grid.records.length; i++) {
				
				var column = dataVisual.activeGridColumn.grid.getColumn(dataVisual.activeGridColumn.column, true);
				
				var cellIdSelector =  "#grid_" + dataVisual.activeGridColumn.grid.name + "_data_" + i + "_"  + column;	
					
				$(cellIdSelector).addClass("gridColumnSelection");
	
							
			
			}//for

		} //fnGridSelectColumn	

		function fnBuildScaleSlider(canvasParent, scaleTd, dataVisual) {

			var canvas = fnGetAdjustedCanvas(canvasParent);
			
			var scaleSlider = new Slider({canvasId: canvas[0].id});

			var arrayLength = fnGetD3Scales().length;
			var step = 10;
			var max = (2 * arrayLength*step)-step;
			
			var bNoCallBack = true;  //Turn off changed event when setting initial value, Original Slider code was customized with this functionality			
			
			scaleSlider.addSlider({
				id: dataVisual.name + "_scaleSelector",
				//radius: Math.min(100, canvasWidth, canvasHeight) ,
				radius: Math.min(50, canvas.width() / 2, canvas.height() / 2  ),
				min: 0,
				max: max ,
				step: step ,
				color: "#514dc6",
				//bNoCallBack : bNoCallBack,   //Customization for no initial invocation of .setSliderValue method
				changed: function (v) {
										
					var stepIndex = parseInt(v.value) / step;
										
					dataVisual.selectedScale.direction =  stepIndex % 2;   //always mod 2 of value: odd/even
					dataVisual.selectedScale.scaleIndex = Math.min(arrayLength -1, (stepIndex- dataVisual.selectedScale.direction) / 2);
					fnBuildPredfinedScales(scaleTd, dataVisual.selectedScale);
					
					//https://www.w3schools.com/js/js_timing.asp
					if (timeOutVar)
						clearTimeout(timeOutVar); //timeOutVar is global, clear and reset to anouther timeOutInterval until user stops moving slider
					
					var timeOutInterval = 1000; //In milliseconds
					timeOutVar = setTimeout(function(){
												dataVisual.dataGrid.refresh();	
												fnVisualize(dataVisual)
											}
											,timeOutInterval
											); //setTimeout
					

				} //changed
			
			}); //scaleSlider

					
			
		} //fnBuildScaleSlider	

		function fnSetVisualScalingTitle(dataVisual){

			var column = dataVisual.activeGridColumn.column;
			var originalColumn = fnIsPresetColor(column) ? column.split(dataVisual.colorPrefix)[1].trim() : "";
			var isKey = column == dataVisual.dataKey || column.trim() == dataVisual.visualKey;
			var text = dataVisual.activeGridColumn.grid.columns.find(function(col){return col.field == column}).caption;
			var columnText =  (column == "recid" || isKey) ? ": " + text 
								: fnIsPresetColor(column) ?  "" 
									: fnIsPresetColor( dataVisual.colorPrefix + column) ? ": " + column
										: ": " + originalColumn + " " + text;	


			w2ui[dataVisual.visualName + "_scaleControlLayout"].set('left', {title: "Visualization Scale" + columnText});		
			w2ui[dataVisual.visualName + "_scaleControlLayout"].refresh();
		
		} //fnSetVisualScalingTitle	

		function fnSetVisualColors(dataVisual){  // fnSetVisualColors() with no parms resets visualizations
				
			if (dataVisual){																					
				var column = dataVisual.activeGridColumn.column;
				
				if (fnIsPresetColor(column)){ //Preset Color  
					
					var fnCalcColor = function (rowIndex, column)  { 		
						return dataVisual.join[rowIndex].dataRow[column].toLowerCase();		
					};				  
							
			
					dataVisual.join.forEach(function(joinRow, rowIndex){
							
						dataVisual.setColorVisualObj(joinRow.visualObj,fnCalcColor(rowIndex,column));
						
					}); //forEach	


					
					//For Legend processing
					var fnCalcColor = function (i, uniqueCat)  { 
											
						var originalColumn = column.split(dataVisual.colorPrefix)[1];	
											
						var rowIndex = dataVisual.join.findIndex(function(joinRow){return joinRow.dataRow[originalColumn] == uniqueCat; });
						
						return  dataVisual.join[rowIndex].dataRow[column];		
					};
					
					var fnLegendScale = {fnCalcColor: fnCalcColor};
				
				} //if
				else {	//Scale Color
				
					//SET OBJECT COLOR AS A FUNCTION OF COLORSCALE
					for (var rowIndex = 0; rowIndex < dataVisual.join.length; rowIndex++ ) {
						
						fnGetObjectScaleColorAndOptionallyVisualize(dataVisual, column, rowIndex, true);

						
					} //for

					var fnLegendScale = fnGetColorScale(column, dataVisual);	//For Legend, Scale coloring is handeld by 	

				} //else
				
				var split = column.split(dataVisual.colorPrefix);
				var colorColumn = split[split.length - 1];					//Reference to origial column to get it's unique categories, not the column with the colors		
				var columnText0 = column == "recid" || column == dataVisual.dataKey || column == " " + dataVisual.visualKey ? "" : colorColumn.trim() + " ";
				var text = dataVisual.activeGridColumn.grid.columns.find(function(col){return col.field == column}).caption;
				
				var columnText = (fnIsPresetColor(column) || dataVisual.data[0][dataVisual.colorPrefix + column] != undefined ) ? columnText0 + text : text;
																			
				fnBuildLegend(column, colorColumn, columnText , fnLegendScale, dataVisual);

			} //if
			else {
				
									
				//Set Original Color			
				dataVisual.join.forEach(function(joinRow){
					
					
					joinRow.visualObj.traverse(function(node) {  //Color the object and any children; object may be a group with children
						if (node.type == "Mesh" && node.material) {
								node.material.color.copy(node.userData.originalColor);
						} //if
					}); //visualObject.traverse					
					
				
				});	//forEach		
				

			} //else				



			// RENDER COLOR SCALE LIST
			//function fnBuildLegend(column, title, colorScaleObj)
			function fnBuildLegend(column, colorColumn, legendTitle , colorScaleObj, dataVisual){
				
						
				var dataType =  dataVisual.dataTypes[column].type;
				var maxDecimalPlaces =  dataVisual.dataTypes[column].numDecimals;		
			
				var legendContainer2 = d3.select(dataVisual.legendContainer)  
						.style("background-color","white")
						.style("height","100%")
						.style("width","100%")				
						.style("overflow","auto");					
				
				legendContainer2.selectAll("svg").remove();
				

				var svgLegend2 = legendContainer2.append("svg")
									.attr("height",$(legendContainer2.node()).height())					
									.attr("width",$(legendContainer2.node()).width());						
				
				
			
				
				var gLegend2 = svgLegend2							
								.append("g")
									.attr("class", (dataType == "float") ? "legendSequential" : "legendOrdinal" )
									.style("font-size","11px")					
									.style("font-family","'Lucida Grande', sans-serif")								  
									.attr("transform", "translate(20,20)");	
							

				var aUniqueCategories =  dataVisual.dataTypes[colorColumn].aUniqueCategories; //colorColumn is the column that is being colorized 
					
				var legend = d3.legendColor()
					.title(legendTitle)		
					.shape("rect")
					.shapeWidth(10)
					.shapeHeight(7)
					.labelOffset(4)
					.cells(Math.min(10,aUniqueCategories.length))
					//.ascending(dataType == "text" ? false : colorScaleObj.minScale > colorScaleObj.maxScale)	
					.orient("vertical"); //vertical or horizontal		


				if (dataType == "float") {
								
					legend		
						.ascending(dataVisual.selectedScale.direction == 1)
						.scale(colorScaleObj.fnCalcColor)
						.labelFormat(",." + maxDecimalPlaces +"f");
						
				} //if
				else {	
					
					var ordinal = d3.scaleOrdinal()			
										.domain(aUniqueCategories)
										.range(aUniqueCategories.map(function(cat,i) { return colorScaleObj.fnCalcColor(i, cat); } ) );  //sequentialScale assigned to Ordinal logic		
					legend	
						.cellFilter(function(d,i) {return i < aUniqueCategories.length})						
						.scale(ordinal);  //Use sequentialScale assigned to ordinal logic above to create array of specific colors assigned to ordinals						
				} //else 
					
					

				gLegend2.call(legend);   //Build Legend with var 'legend' properties	


				//Make scrollable if necessary.  Driven by the legend contents width/height when it's larger than its svg container
				svgLegend2.attr("width",  Math.max(svgLegend2.attr("width")  - 20 ,gLegend2.node().getBBox().width  + 20)); 		
				svgLegend2.attr("height", Math.max(svgLegend2.attr("height") - 20 ,gLegend2.node().getBBox().height + 20));	
				
					
			} //fnBuildLegend
		
		
			
			
	} //fnSetVisualColors
	
		//GET AN ARRAY OF THE SCALED COLORS FOR COLUMN objColumnAttributes.column 
		function fnGetObjectScaleColorAndOptionallyVisualize(dataVisual, column, rowIndex, bColorVisual) {   
			
			var scaleIndex = dataVisual.selectedScale.scaleIndex;    //
			var scaleDirection = dataVisual.selectedScale.direction; //direction: 0: LowHigh, 1: HighLow
													
			var storedScaleColorsKey = column + "_" + scaleIndex + "_" + scaleDirection;

			if (dataVisual.join[rowIndex].storedScaleColors[storedScaleColorsKey]){
				
				var strColorRGB = dataVisual.join[rowIndex].storedScaleColors[storedScaleColorsKey];

				if (bColorVisual) {
					
					dataVisual.setColorVisualObj(dataVisual.join[rowIndex].visualObj, strColorRGB);
					
				}
				
				return strColorRGB;
				
			} //if
		
			else {
				
				var colorScaleObj = fnGetColorScale(column, dataVisual);
				
				var colorScale = colorScaleObj.fnCalcColor;
				
				//SET OBJECT COLOR AS A FUNCTION OF COLORSCALE			
				dataVisual.join.forEach(function(joinRow){

					if (colorScaleObj.minScale == colorScaleObj.maxScale ) {
						var strColorRGB = colorScale(colorScaleObj.minScale);
					} //if
					else {
						var columnValue = ["date", "time", "dateTime"].indexOf(dataVisual.dataTypes[column].type) != -1 ?  
											fnFloatFormat(dataVisual, column, joinRow.dataRow[column]) : 
												joinRow.dataRow[column];  
						var strColorRGB = dataVisual.dataTypes[column].type == "float" ?  
											colorScale(columnValue) : 
												colorScale(dataVisual.dataTypes[column].aUniqueCategories.indexOf(columnValue));
					} //else						
							
					joinRow.storedScaleColors[storedScaleColorsKey] = strColorRGB;
					
				});
				

				if (bColorVisual) {
									
					dataVisual.setColorVisualObj(dataVisual.join[rowIndex].visualObj, dataVisual.join[rowIndex].storedScaleColors[storedScaleColorsKey]);
				
				} //if			
			
				return  dataVisual.join[rowIndex].storedScaleColors[storedScaleColorsKey];	
				
			} //else
				
			
				
		} // fnGetObjectScaleColorAndOptionallyVisualize
		
		//GET COLUMN NAME, TYPE, DATATYPE, MIN/MAX SCALE (if numeric)
		function fnGetColumnAttributes(column,dataVisual){
			
			var dataType =  dataVisual.dataTypes[column] ?  dataVisual.dataTypes[column].type: null; 
			
			var data = dataVisual.join;
			
			var minScale =  dataType == "float" ? d3.min(data,function (join) { return parseFloat(join.dataRow[column]); }) : null;				
			var maxScale = 	dataType == "float" ? d3.max(data,function (join) { return parseFloat(join.dataRow[column]); }) : null;
			
			return {column:column,  
					dataType: dataType, 
					minScale: minScale,
					maxScale: maxScale};
					
		} //fnGetColumnAttributes	
	
		function fnGetColorScale(column,dataVisual){
			
			var scaleIndex = dataVisual.selectedScale.scaleIndex;    //
			var scaleDirection = dataVisual.selectedScale.direction; //direction: 0: LowHigh, 1: HighLow		

			var dataType =  dataVisual.dataTypes[column].type;
					
			var aUniqueCategories =  dataVisual.dataTypes[column].aUniqueCategories
										
						
			var objColumnAttributes = fnGetColumnAttributes(column, dataVisual);
						
			switch(dataType) {
				case "float":			
					var minScale = objColumnAttributes.minScale;
					var maxScale = objColumnAttributes.maxScale;	
					break;
				case "text":
				case "date":
				case "time":
				case "dateTime":
					var minScale = 0;				
					var maxScale = Math.max(aUniqueCategories.length - 1, 1);									
					break;
				default:	
			} //switch
			

					
			//SEQUENTIAL SCALING
			//ColorScales documented here: https://github.com/d3/d3-scale-chromatic 
			//Scale Sequential requires interpolator: https://github.com/d3/d3-scale#sequential-scales
			//Interpolator: https://github.com/d3/d3-interpolate 			
			var aMinMaxSequential = [ minScale, Math.max(parseFloat(minScale) + 1,maxScale) ];
			var domain = [ aMinMaxSequential[scaleDirection % 2], aMinMaxSequential[(-1* scaleDirection % 2) + 1] ] ; //Flipping the domain reverses the scale [min,max] or [max,min]
			var interpolator = d3[fnGetD3Scales()[scaleIndex]];
			
			return {fnCalcColor: d3.scaleSequential(interpolator).domain(domain) , minScale: minScale, maxScale: maxScale }	
			
			
		} //fnGetColorScale	
	
		function fnIsPresetColor(column){
	
			return column.startsWith(dataVisual.colorPrefix) ;	
			
		} //fnIsPresetColor

			
	} //display

	function fnFloatFormat(dataVisual, fieldValueColumn, fieldValue){	
	
		switch (true){
			
			case dataVisual.dataTypes[fieldValueColumn].type == "date":
				return w2utils.formatDate(fieldValue, w2utils.settings.dateformat);
				break;
			case dataVisual.dataTypes[fieldValueColumn].type == "dateTime":
				return w2utils.formatDateTime(fieldValue, w2utils.settings.datetimeFormat);
				break;
			case dataVisual.dataTypes[fieldValueColumn].type == "time":
				return w2utils.formatTime(fieldValue, w2utils.settings.timeFormat);
				break;
			default:
				return d3.format(",")(fieldValue);
		
		} //switch
		
	} //fnFloatFormat

} //MyDataVisualizer

//BUILD THE PREDEFINED SCALE LIST
function fnBuildPredfinedScales(canvasParent, selectedScale){

	var canvas = fnGetAdjustedCanvas(canvasParent);

	var canvasWidth = canvas.width();
	var triangleHeight = .9 * canvas.height() ;
				
	var scaleIndex = selectedScale.scaleIndex;
	var direction = selectedScale.direction;
	
	var scale = fnGetD3Scales()[scaleIndex];
	var fnColor = d3.scaleSequential(d3[scale]).domain([ canvasWidth * (direction % 2) ,  canvasWidth * ((-1* direction % 2) + 1)  ]); 	//direction determines scale rendering
	
	var context = canvas[0].getContext("2d");
	var gradient = context.createLinearGradient(0,0,canvasWidth,0);				
	
	for(var i = 0; i <= canvasWidth; i++) {
		gradient.addColorStop(i/canvasWidth, fnColor(i) );	  //As per the example: https://www.tutorialspoint.com/html5/canvas_create_gradients.htm
	} //for
	
	//Paint Triangle on Canvas	
	context.beginPath();
	context.moveTo(0, triangleHeight );  
	context.lineTo(canvasWidth,0); //: | or _
	context.lineTo(canvasWidth , triangleHeight); 
	context.lineTo(0, triangleHeight );
	context.fillStyle = gradient;
	context.fill();
					

} // fnBuildPredfinedScales	

function fnGetAdjustedCanvas(canvasParent){

	//Resizable Canvas: http://ameijer.nl/2011/08/resizable-html5-canvas/

	var parentWidth =  canvasParent.closest(".w2ui-panel").width();		
	var parentHeight = canvasParent.closest(".w2ui-panel").height();	
	var canvasWidth = parseInt(.4 * parentWidth);
	var canvasHeight = parseInt(.7 * parentHeight);		

	var canvas = canvasParent.find("canvas");

	if (canvas.length == 0){
	
		var canvas = $(document.createElement("canvas"))
						.attr("id",canvasParent[0].id + "Canvas")
						.attr("width",canvasWidth)
						.attr("height", canvasHeight);
		
		canvasParent.append(canvas);

	} //if
	else {
	
		canvas.attr("width",canvasWidth).attr("height", canvasHeight);
	
	} //else	

	var context = canvas[0].getContext("2d");     //clear the canvas https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
	context.clearRect(0, 0, canvasWidth, canvasHeight);			
	
	return canvas ;	

} //fnGetAdjustedCanvas		

// 3D COLOR SCALES
function fnGetD3Scales() {
	//https://github.com/d3/d3-scale-chromatic
	var strScales = "interpolateRdYlGn,interpolateBrBG,interpolatePRGn,interpolatePiYG,interpolatePuOr,interpolateRdBu";
	strScales += ",interpolateRdGy,interpolateRdYlBu,interpolateSpectral";
	strScales += ",interpolateBlues,interpolateGreens,interpolateGreys,interpolateOranges";
	strScales += ",interpolatePurples,interpolateReds,interpolateBuGn,interpolateBuPu";
	strScales += ",interpolateGnBu,interpolateOrRd,interpolatePuBuGn,interpolatePuBu,interpolatePuRd";
	strScales += ",interpolateRdPu,interpolateYlGnBu,interpolateYlGn,interpolateYlOrBr,interpolateYlOrRd";
	
	var scales = strScales.replace(/\s/g,'').split(",");
	
	
	return scales;
} //fnGetD3Scales

function dataVisual(){
	
//DataVisual Design pattern developed by Mario Delgado: https://github.com/MarioDelgadoSr
//Base Code: https://github.com/mariodelgadosr/datavisual
//Customize for My Data Visualizer
//Reference:  http://www.crockford.com/javascript/private.html		
		
	this.join = [];
	this.data = undefined;
	this.visual = undefined;
	this.dataKey = undefined;
	this.visualKey = undefined;
	this.colorPrefix = undefined;
	
	this.nonMatchingDataKeys = [];
	
	var that =  this;   //So 'that' methods can reference 'this' object
	
	 
	// Join data to ThreeJS visual.  If a dataKey to visualKey match is not found, non-matching dataKey value is placed in nonMatchingKeys array.	
	this.joinDataToVisual = function (data, visual, dataKey, visualKey, colorPrefix, datePrefix, dateTimePrefix, timePrefix){     //Paying customers can override default color and date prefix
	

		
		/* 	
			If method is called with just 1 parameter, it is assumed to be a visaul with embedded data.

			dataKey and visualKey are optional parameters.  
			If not provided than data[i]["name"] and visual.scene.children[k]["name"] values must match exactly for a join to occur
			visualKey can be either an attribute of the mesh or mesh.userData.  It will try finding it with as  mesh[visualKey] before searching in mesh.userData[visualKey]

			Known issue for objects created by Blender with its duplicate naming convention.  
			ThreeJS 'sanitizes' the name property "item.001" to "item001"; stripping the "."  
			See the following for explanation on why: https://discourse.threejs.org/t/issue-with-gltfloader-and-objects-with-dots-in-their-name-attribute/6726
		*/
			
		dataKey = dataKey || "name";
		visualKey =  visualKey || "name"
		colorPrefix = colorPrefix || "COLOR_";
		datePrefix = datePrefix || "DATE_";
		dateTimePrefix = datePrefix || "DATETIME_";
		timePrefix = datePrefix || "TIME_";
		

		that.dataKey = dataKey;
		that.visualKey = visualKey;		
		
		that.colorPrefix = colorPrefix;
		that.datePrefix = datePrefix;
		that.dateTimePrefix = dateTimePrefix;
		that.timePrefix = timePrefix;
		
		if (arguments.length == 1) {	//Visual has embedded data. Visual must have mesh.name property and mesh.userData with  .userData[dataProperties]
	
			that.visual = arguments[0];
			that.data = [];
			that.join = [];

			var i = 0;
			
			that.visual.scene.traverse(function (node) {  													// visuaObj may several children deep into the hierarchy
				
				var dataRow = {};
							
																			
					if (node.hasOwnProperty(visualKey) && node.type == "Mesh" && node.hasOwnProperty("userData")) {    			// Extract embedded data and create dataVisual.data and dataVisual.join			
						
						if (Object.keys(node.userData).length > 0 ){
							
							dataRow[visualKey] =  node[visualKey];				
							
							
							Object.keys(node.userData).forEach(function(key){
								
								if (key == "recid") {		
									w2alert("Error: 'recid' is a reserved data property.");
									return null;
								} //if	


								dataRow[key] = node.userData[key];
								
							}); //forEach
							
							
							that.data.push(dataRow);
							
							fnSetVisualProps(dataRow, i++, node, visualKey);
							
							that.join.push(	{	dataRow: dataRow, 
												visualObj: node,
												storedScaleColors: {}		//Hash for Scale Coloring													
											}); //push
					
						} //if
						
						
					} //if

				
			});	// traverse	
			
			
		
		} //if
		
		else {							//Join data to visual	
		
			if (data[0].hasOwnProperty("recid")) {		
				w2alert("Error: 'recid' is a reserved data property.");
				return null;
			}		

			// 'this' (via 'that') object's references to original inbound parameters	
			that.data = data;
			that.visual = visual;			
			
			data.forEach(function (dataRow,i){
												
							var mesh = undefined;
						
							visual.scene.traverse(function (node) {  													// visuaObj may have several children deep into the hierarchy
								
								if (!mesh){ 																			// Only continue on if the mesh hasn't been found yet
									if (node.hasOwnProperty(visualKey)) {               								// Is it a messh attribute? 
									
										mesh = node[visualKey] == dataRow[dataKey] ? node : mesh;	
									
									} //if
									else if (node.hasOwnProperty("userData")){
										
										mesh = 	node.userData[visualKey] == dataRow[dataKey] ? node : mesh;
									
									} //else if
									
								
								}//if 	
							});	// traverse					
							
							if (mesh) {
		
								fnSetVisualProps(dataRow, i, mesh, visualKey);
		
								that.join.push(	{	dataRow: dataRow, 
													visualObj: mesh,
													storedScaleColors: {}		//Hash for Scale Coloring													
												}); //push
							} //if
							else {
								
								that.nonMatchingDataKeys.push(dataRow[dataKey]);										// No match found for this dataRow[dataKey]
								
							}
								
			}); //data.forEach
			
		} //else
			
		function fnSetVisualProps(dataRow, i,  mesh, visualKey){
								
			//Columns for the Visual Grid	
			var firstObjWithMaterial = fnGetMaterialMeshes(mesh)[0];
			
			dataRow["recid"] = i + 1;
			dataRow[" " + visualKey] = mesh[visualKey] ? mesh[visualKey] : mesh.userData[visualKey]; //It's either in the parent or userData level	
			
			dataRow[colorPrefix + " " + visualKey] = "#" + firstObjWithMaterial.material.color.getHexString();
			
			dataRow[" id"] = mesh.id;
			
			dataRow[" x"] = firstObjWithMaterial.position.x.toPrecision(7);
			dataRow[" y"] = firstObjWithMaterial.position.y.toPrecision(7);
			dataRow[" z"] = firstObjWithMaterial.position.z.toPrecision(7);		
			
			function fnGetMaterialMeshes(visualObject){
			
			var aMaterialMeshes=[];	
			visualObject.traverse(function(node) {  //Color the object and any children; object may be a group with children
				if (node.type == "Mesh" && node.material) {
					aMaterialMeshes.push(node);
				} //if
			}); //visualObject.traverse	
			
			return aMaterialMeshes;
				
			}//fnGetMaterialMeshes				
			
			
		} // fnGetVisualProps		
		
		
		
	} //joinDataToVisual





	this.getJoinByUUID = function(uuid, protoString){																// Helper function to get the visualObj 
																													// (or index, protoString == "index") assoicated with 
			return uuid ?																							// the ThreeJS mesh uuid
							that.join[protoString == "index" ? "findIndex" : "find"](function(join){ 
																						return join.visualObj.uuid == uuid;
																					}) //function 
						:	null;
	
	} //getJoinByUUID


	this.getJoinByKey = function(key, protoString){																	// Helper function to get the joined dataRow
																													// (or index, protoString == "index") 
			return key ?																							// where join.data[dataKey] == key (same value as visualKey)			
							that.join[protoString == "index" ? "findIndex" : "find"](function(join){ 
																						return join.dataRow[that.dataKey] == key;
																					}) //function
						:	null;
	
	} //getJoinByKey
	
	
	this.getJoinByProperty = function(property, key, protoString){													// Helper function to get the joined dataRow
																													// (or index, protoString == "index") 
			return key ?																							// where join.data[property] == key (same value as visualKey)			
							that.join[protoString == "index" ? "findIndex" : "find"](function(join){ 
																						return join.dataRow[property] == key;
																					}) //function
						:	null;
	
	} //getJoinByKey	
	
	
	
	this.setColorVisualObj = function(visualObj, color){

		visualObj.traverse(function(node) {  																		//Color the object and any child meshes with color-able materials	
			if (node.type == "Mesh" && node.material) {
					node.material.color.set(color);																	// 	https://threejs.org/docs/index.html#api/en/math/Color.set
			} //if
		}); //visualObj.traverse
		
		
	} //setColorVisualObj

	this.setColorByJoinIndex = function(index, color){
		
		var visualObj = that.join[index].visualObj;
		that.setColorVisualObj(visualObj,color);
		
	} //setColorByJoinIndex 
	
	
} //dataVisual

		/*
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
		*/
	

