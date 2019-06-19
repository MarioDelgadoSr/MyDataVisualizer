	function fnGetVisualGridProperties(dataVisual, visualizer) {
											
		var visualObjProp = {};	
			visualObjProp["vGrId" + dataVisual.visualKey] = [dataVisual.visualKey];
			visualObjProp[dataVisual.colorPrefix + "vGrIdColor"] = ["material","color"];  //vGrId to distinguish from visualData column...should be unique enough	
			visualObjProp["vGrIdx"] = ["position","x"];
			visualObjProp["vGrIdy"] = ["position","y"];
			visualObjProp["vGrIdz"] = ["position","z"];
			
		var columns = [{field:"recid", caption:"Object uuid", sortable:true, searchable:true}];
		
		Object.keys(visualObjProp).forEach(function(field){ 
																								
												var column = {field:field, sortable: true, searchable: true};
												
												switch (field){
													case dataVisual.colorPrefix + "vGrIdColor":
														column.caption = "Original Color";
														break;
													case "vGrId" +  properties.keyVisualName:
														column.caption = field.split("vGrId")[1] + " (Visual Key)";
														break;
													default:
														column.caption = field.split("vGrId")[1];
														break;
												} //select
												
												if (field == dataVisual.colorPrefix + "vGrIdColor"){
													
												  
												  column.render = function(record) {	
												  
															var visualObj =  dataVisual.visual.scene.getObjectById(record.recid)
															
															if (!visualObj) return;  //Hack to deal with new file being loaded while user is on 'Objects with 'visualization' attribute tab
															
															var color = visualObj.material ? visualObj.userData.originalColor.getHexString() : fnGetColor(visualObj);
															
															var input = $(document.createElement("INPUT"))
																			.attr("size",4)
																			.attr("readonly","readonly")
																			.css("background-color", "#" + color );

															var pre = $(document.createElement("PRE"))
																		.append(input)
																		.append("&nbsp;#" + color ); 
															return pre[0].outerHTML;
															
															function fnGetColor(visualObj){   //color all children within the visualObj
																var color;
																visualObj.traverse(function (node){
																	if (node.type == "Mesh" && node.material) {
																		color = node.userData.originalColor.getHexString();
																		return;
																	}
																}); //traverse
																return color;
																
															} //fnGetColor
															

													} //column.render													
													
												} //if
											
											columns.push(column);
											
											}); //forEach	
			
		var gridRecords = [];	
		
		dataVisual.join.forEach(function(joinRow){
			
			visualObj = joinRow.visualObj
			
			var record = {};
			
			record.recid = visualObj.id ;
				
			visualObjectFirstMaterial = fnGetMaterialMeshes(visualObj)[0];
			
			Object.keys(visualObjProp).forEach(function(column){ 
						
											var vObject = column == dataVisual.colorPrefix + "vGrIdColor" ? visualObjectFirstMaterial : visualObj;  
											
											record[column] = getVal(vObject,visualObjProp[column]);
												
											function getVal(visualObject,aProps){
												
													if (aProps.length == 1) {
														return aProps[0] == "color" ? "#" + visualObject[aProps[0]].getHexString()  : 
																				typeof visualObject[aProps[0]] == "string" ?  visualObject[aProps[0]]  : visualObject[aProps[0]].toPrecision(7) ;
													} //if
													else {
														return getVal(visualObject[aProps[0]], aProps.slice(1));
													} //else
											}//getVal												
		
		
										});		
			gridRecords.push(record);

			
		});
	
	
		fnGetDataTypes(gridRecords);	//rebuild DataType for recid, but that's OK becuase it is the same in dataGrid and visualGrid

		function fnBuildRadioIds(prefix,start,end,increment){
			
			arr = [];
			for (var i = start; i <= end; i = i + increment){
				arr.push({id: prefix + "_" + (increment < 1 ?  String(i).substring(0,3) : i), caption: increment < 1 ? String(i).substring(0,3) : String(i)})
			} //for
			return arr;
			
		} //fnBuildRadioIds
	
		var aFOV = fnBuildRadioIds("fov",10,100,5);
		var aGridDiv = 	fnBuildRadioIds("div",2,20,1);
		var aZoomSpeed = fnBuildRadioIds("zp",.1,2.1,.1);
		var aPanSpeed = fnBuildRadioIds("ps",.1,2.1,.1);
	     
		var dataTypes = dataVisual.dataTypes;	
		
		return {
			name		: dataVisual.visualName + "_visualGrid",
			columns		: columns,	
			//recordHeight: dataVisual.selectionLinks.length > 0 ? 50 : 24,	
			records		: gridRecords,    																		
			show: 		{
							toolbar: true,
							toolbarReload: false,
							footer: true,
							selectColumn: true, 
							footer: true,							
						},
			sortData: 	columns.map(function(row,i){ return Object.assign(row,{direction: "ASC"}) }),	
			searches: 	columns.map(function(row,i){ return Object.assign(row,{type: dataTypes[row.field] ? dataTypes[row.field].type : "text" }) }),	
			multiSearch : true,
			multiSelect: true,
			multiSort: true,
			toolbar: {
				items: [
					{type: 'break'},
					{type: 'check', id: 'gpuPerformance', checked: false,   caption: "GPU", tooltip: "Show Visual Performance"}, 						
					{type: 'html', id: 'gpuPerformanceContainer', html: "<span id='gpuContainer' style='display:none'></span>"},
					{type: 'break'},					
					{type: 'button', id: 'bev', caption: "Reset View", tooltip: "Show Bird's Eye View"}, 					
					{type: 'break'},					
					{type: 'button', id: 'rotate', caption: "Rotate", tooltip: "Rotate Visual"}, 					
					{type: 'break'},	
					{type: 'check', id: 'axesHelper', checked: visualizer.axesHelper.obj.visible, caption: "Axes", tooltip: "Show/Hide Axes on Visual"}, 
					{type: 'break'},					
					{type: 'color', id: 'background', color: visualizer.scene.obj.background.getHexString() , caption: "Background", tooltip: "Set Background Color"}, 								
					{type: 'break'},										
					{type: 'check', id: 'boundingBox', checked: visualizer.boundingBox.obj.visible,  caption: "Bounding Box", tooltip: "Set Bounding Box Properties"}, 	
					{type: 'color', id: 'bBoxColor', color: visualizer.boundingBox.obj.material.color.getHexString() , caption: "Color", tooltip: "Set Background Color"}, 													
					{type: 'break'},
					{ type: 'menu-radio', id: 'fov', 
						caption: function (item) {
							return 'Camera Field of View: ' + item.selected.split("_")[1];
						},
						selected: "fov_" + visualizer.camera.fov,
						items: 	aFOV			
					},					
					{ type: 'menu-radio', id: 'polarAngle', 
						caption: function (item) {
							return 'Polar Angel: ' + item.selected.split("_")[1];
						},
						selected: "pa_" + visualizer.controls.maxPolarAngle,
						items: 	[
									{id: 'pa_90', caption: "90"},
									{id: 'pa_180', caption: "180"}
						]			
					},
					{ type: 'menu-radio', id: 'zoomSpeed', 
						caption: function (item) {
							return 'Zoom Speed: ' + item.selected.split("_")[1];
						},
						selected: "zs_" + visualizer.controls.zoomSpeed,
						items:  aZoomSpeed
					},
					{ type: 'menu-radio', id: 'panSpeed', 
						caption: function (item) {
							return 'Pan Speed: ' + item.selected.split("_")[1];
						},
						selected: "ps_" + visualizer.controls.panSpeed,
						items:  aPanSpeed
					},	
					{type: 'break'},										
					{type: 'check', id: 'gridHelper', checked: visualizer.gridHelper.obj.visible, caption: "Grid&nbsp;", tooltip: "Show/Hide Grid"},
					{type: 'color', id: 'colorGrid', color: new THREE.Color(visualizer.gridHelper.colorGrid).getHexString() ,
						  caption: "Grid Color", tooltip: "Set Grid Color"}, 								
					{type: 'color', id: 'colorCenter', color: new THREE.Color(visualizer.gridHelper.colorCenter).getHexString() ,
						  caption: "Center Line Color", tooltip: "Set Grid Center Line Color"}, 
					{ type: 'menu-radio', id: 'divisions', 
						caption: function (item) {
							return 'Grid Divisions: ' + item.selected.split("_")[1];
						},
						selected: "div_" + visualizer.gridHelper.divisions,
						//items:  aGridDiv
						items: 	aGridDiv					
					}
				],				
				onClick: function (target, data){   //For Toolbar
				
							switch(target){
								
								case "bev":
									fnShowBirdsEyeView();
									break;								
								case "rotate":
									fnRotate();
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
						
							data.onComplete = function (event){
								
								switch(event.target.split(":")[0]){

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
										
										fnBuildGridHelper(settings); 
										break;
									default:	
										break;
								} //switch
								
	
								
							}

				
				} //OnClick	
			}, //toolbar 			

			onColumnClick: function(event){ 

				event.done(function(){	
			
					visualizer.activeGridColumn = event.field; 
					//To Do	
					fnVisualizeData(event.field, gridRecords, "vGrId" + dataVisual.visualKey);            
					//properties.callBackVisualScaling();		//Call back to user interface						  
					
					fnGridSelectColumn(this, visualizer.activeGridColumn);											
					
				}); //done
			}, //onColumnClick			
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
			} //onSearch
			
		} //return object
	
	} //fnGetVisualGridProperties
