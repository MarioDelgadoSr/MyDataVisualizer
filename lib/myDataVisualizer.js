	var languageIndex = 0;																												//Initially set to English(0)
	const languageCodes = ["en","es","sv","fi","fr","da","lt","pl","id","fil","zh-CN","cs","nl","et",
	                      "de","el","he","is","it","ja","ko","lv","nb","fa","pt","ro","ru","sr","sk","sl"];
	//ToDo Translate languges themsleves	
	const languages = ["English","Spanish","Swedish","Finnish","French","Danish","Lithuanian","Polish","Indonesian",
					 "Filipino","Chinese","Czech","Dutch","Estonian","German","Greek","Hebrew","Icelandic","Italian",
					 "Japanese","Korean","Latvian","Norwegian","Persian","Portuguese","Romanian","Russian","Serbian","Slovak","Slovenian"];
					 
    var localLanguage =  languageCodes[languageIndex];	

	function translate(prop){
		
		return translations[localLanguage][prop];			
	
	} //translate

var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';   												//Panel styling		
		


//Developing
$(document).ready(function(){

	
	var blob = b64toBlob(ForkliftGLTF, 'model/gltf-binary'); 
	var blobUrl = URL.createObjectURL(blob);   

	gltfLoader = new THREE.GLTFLoader();

	gltfLoader.load( blobUrl, function( gltfDataFromFile ) {  
	
		
		const dataKey = Object.keys(ForkliftData[0])[0];    				
		const visualKey = "name";     		
		
		var datVisual =  new dataVisual();	
		
			datVisual.joinDataToVisual(ForkliftData, gltfDataFromFile, dataKey, visualKey); //scope.dataVisual.joinDataToVisual([], gltfVisual, dataKey, visualKey);  //testing with no data	
			datVisual.selectionLinks = [];  //No links for now	
			datVisual.colorPrefix = "COLOR_";																	//If properity has this prefix, it's a defined color
		
			datVisual.dataName = "Forklift.csv";
			datVisual.visualName = "ForkLift.gltf".split(".")[0];
			
			var container = $(document.createElement("div"))
									.appendTo($(document.body).css({"margin":"0px"})); 							//Layout Height Design Pattern: https://github.com/vitmalina/w2ui/issues/105 
			
		var appLayout = new applicationLayout();
		
			appLayout.display(container[0], datVisual);															//Developers can pass a DOM object, not necessarily jQuery object
	

		URL.revokeObjectURL( blobUrl );	//https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL						
	
	}, //Loader function handlder
	
	undefined/*, function ( error ) {   //Error Handling

		alert( error );

	}*/ ); //gltfLoader		
	
	
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

var test;

function applicationLayout(){
	
	var app  = this;
	
	app.dataVisual = undefined;
	
	app.myDataVisualizer = undefined;
	var layout = undefined;

	app.display = function(container, dataVisual){
	
		app.dataVisual = dataVisual;
	
		$(container).css({"position": "absolute", "width": "100%", "height": "100%"})  														//https://github.com/vitmalina/w2ui/issues/105
		
		layout = 
				$().w2layout(
					{	box: $(container),
						name: dataVisual.visualName + "_mainPanel", 																			//http://w2ui.com/web/docs/1.5/layout
								panels: 
								  [																												//Tool Bar Handle by Main Panel
									{ type: 'left', size: '50%', resizable: true, style: pstyle },  											//Data Analyzer
									{ type: 'main',  resizable: true,  style: pstyle},															//Visual GRID	
									{ type: 'preview', size: '75%', resizable: true }  															//The display panel for the image
								] //panels
					}					
				); //layout
						
		app.myDataVisualizer = new myDataVisualizer();
		app.myDataVisualizer.display(layout, dataVisual)		
				

	} //display

	app.refreshMyDataVisualizer = function(){
		
		//ToDo Refresh...for example change in laguageIndex	
		//Refresh only the specific w2ui sub-component that have languge components.  Layout Headers, Grid toolbars
		//Pattern: w2ui['dataGrid'].toolbar.get('styleGrid').text = "vvvvv Grid"  MUST USE .text not .caption.... there's a bug
		// w2ui['dataGrid'].toolbar.refresh()        
		
	}
	
	app.setLanguageIndex = function(newIndex){
		
		localLanguage =  languageCodes[newIndex]
		app.refreshMyDataVisualizer();	
		
	} // setLanguageIndex
	
	app.destroy =  function (){
		
		app.myDataVisualizer.destroy();
		
		Object.keys(w2ui).forEach( function (objKey){  if ( objKey.indexOf(app.dataVisual.visualName + "_") != -1 )  w2ui[objKey].destroy(); } );  		//Remove all w2ui instances for this object
		
		$(app.appContainer).find(":first-child").remove();
		
	} //destroy



} //applicationLayout


function myDataVisualizer(){	
	
	var mdv = this; 																													//Reference this with methods	
	
	mdv.appVersion = 1.1;

	mdv.visualizer = undefined;
	mdv.dataGrid = undefined;
	mdv.visualGrid = undefined;
	

	mdv.display = function(mdvLayout, dataVisual){
																						

		//var bInitiating = true;  																										//Used when initiaing grid's resize event
		var timeOutVar = null;																											//Used by scalng tool to scale visaul aftet 1 second pause	
		
		//Need size of visualization container...so render and continue
		mdvLayout.onRender = function (event){
					
				event.onComplete = fnContinueBuild;
			
		} //onRender

		var visualizerDiv = document.createElement("div")	 																			
			mdvLayout.content("preview", visualizerDiv);		
		mdvLayout.render();																													//Continues with fnContinueBuild
		
		function fnContinueBuild(){

			dataVisual.dataTypes = fnGetDataTypes(dataVisual.data);																			//Used by Data and Visual Grid

			mdv.visualizer = fnBuildDataVisualizer(mdvLayout.content("preview"), dataVisual);
			
			mdv.visualGrid = fnBuildVisualGrid(dataVisual, mdv.visualizer);
			
			mdvLayout.content("main", mdv.visualGrid);
						
			if (dataVisual.data.length == 0){  																								//No Data, just image
							
				mdvLayout.hide('left');   																									//Hide Data Analyzer Panel
				mdvLayout.resize(true);
							
			} //if
			else {																															//Build Data Analyzer	
					
				//Build 2 panel Analyzer, Data Grid on top, Scale Control and Legend on Bottom	
				var analyzerLayout = $().w2layout({ 	name: dataVisual.visualName  +  '_analyzerLayout',
								panels: [
									{ type: 'main', overflow: "auto", size: "70%", resizable: true, style: pstyle },							
									{ type: 'preview', size:"30%", style: pstyle, overflow: "auto", resizable: true }
								],
								onRender: function(event){
									event.done(function() {    				////http://w2ui.com/web/docs/1.5/utils/events
										//fnGetObjectListAndLoad(folderIndex, languageIndex);
									
									}); //event.done
								}
				});

				
				mdvLayout.content('left',analyzerLayout);	

				mdv.dataGrid = fnBuildDataGrid(dataVisual);
				mdv.dataGrid.header = dataVisual.dataName;
				mdv.dataGrid.show.header = true;
									
				//Data Grid
				analyzerLayout.content('main',mdv.dataGrid); //http://w2ui.com/web/docs/1.5/utils/plugins
				
		
				var scaleControlLayout = $().w2layout({
														name: dataVisual.visualName  + '_scaleControlLayout',
														panels: [
															{ type: 'left', resizable: true, size: "50%", style: pstyle, title:'Visualization Color Scale'}, 
															{ type: 'main', resizable: true, style: pstyle, title: "Legend" }
														]
													}
											);		
			
				//Add Predfinded Scale Canvas and Scale Slider
			
				/*
				var predefinedScale = $(document.createElement("div"));				
					var table = $(document.createElement("table")).appendTo(predefinedScale);					
						var tableRow = $(document.createElement("tr")).appendTo(table);
							var sliderTD = $(document.createElement("td")).appendTo(tableRow);				
							var scaleTD = $(document.createElement("td")).appendTo(tableRow);												   
			
				scaleControlLayout.content("left", predefinedScale[0]);
				*/
				//To Do	
				//var legend =  $(document.createElement("div"))	
				//scaleControlLayout.content("main", getLegendContent);
			
			
				//visualizer.setLegendContainer($("#legend")[0]);
				//visualizer.setLegendContainer(legend[0]);
			
				analyzerLayout.content("preview",scaleControlLayout );
				
			}

			analyzerLayout.render();		//render everything at once	

			


		} //fnContinueBuild

		

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
					mouse: new THREE.Vector2(),
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
					


					visual: null,																					//The gltf file to be loaded
					keyVisualName: "name",																			//The key vale for the visual file, defaults to name property of objects, but can be overrriden				
					visualizeProp: "visualize",																		//The property in the GLTF file that designates meshes to visulize

					selectionLinks:[],																				//Array of selection links

					//Methods			
					setVisual: fnSetVisual,
					display: fnDisplay,																				//Invoked to render thes scene
					resize: null, 																					//resize method...callback assigned by fnGetResizeCallback() at initialization of the dataVisualizer	
					destroy: fnDestroy,																				//Used at initialization and if loading different files by interface to clean-out the current visualization
					
					
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
						
				
					//Remove window event listeners that reference fnfnHandleKeyMouse so reference to 'propeties' is freed-up
					if (typeof properties.fnHandleKeyMouse != "undefined") {
						document.removeEventListener( 'keydown', properties.fnHandleKeyMouse );								
						document.removeEventListener( 'mousedown', properties.fnHandleKeyMouse);	
						document.removeEventListener( 'mouseup', properties.fnHandleKeyMouse);
						document.removeEventListener( 'dblclick', properties.fnHandleKeyMouse);
					} //if	
				
				} //fnDestroy
				
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
							
						
					
					// KEY AND MOUSE Click HANDLER
					properties.fnHandleKeyMouse = function (event){
						

					
						event = event || window.event;			
						/* This works, but offsetX relative to domElement is more straightforward
						var rendererDOM = properties.renderer.obj.domElement ;
						var renderOffsetX = $(rendererDOM).offset().left - $(window).scrollLeft(); //https://stackoverflow.com/questions/3714628/jquery-get-the-location-of-an-element-relative-to-window
						var renderOffsetY = $(rendererDOM).offset().top  - $(window).scrollTop();
						
						
						properties.offsetX=   event.clientX - renderOffsetX ;   //relative to the container's offset	https://stackoverflow.com/questions/16154857/how-can-i-get-the-mouse-coordinates-relative-to-a-parent-div-javascript
						properties.offsetY =  event.clientY - renderOffsetY ;    //relative to the container's offset 
						*/
						
						
						
						if (!event.target === properties.renderer.obj.domElement) return; //Only handle events for visualization;
						
						properties.offsetX= event.offsetX;
						properties.offsetY = event.offsetY;
						

						if (properties.WebFOCUS) {  //WebFOCUS Extension support

							var content = properties.renderConfig.moonbeamInstance.getSeries(0).tooltip;    //Base Content																				

							// tooltip style is an object full of CSS properties and values
							var tooltip_style = {
								background: 'lightgrey',
								borderWidth: '5px',
								borderStyle: 'solid',
								borderColor: 'grey',
								borderRadius: '5px'
							};

							var tooltip_properties = {
										 fill: 'lightgrey',
										 border: {},
										 cascadeMenuStyle: {
										 hover: { labelColor: '#000000', fill: '#D8BFD8'}
										 }
							};	


							properties.tooltip = tdgchart.createExternalToolTip(container, "vwTooltip"); 
							properties.tooltip
								.style(tooltip_style)
								.properties(tooltip_properties)
								.autoHide(true);											
																		

						}
						

						switch(event.type){
							case "keydown":
								if (!event.ctrlKey) {
									//http://www.asciitable.com/
									switch(event.keyCode) {
										case 66: 				//key = 'b'
											fnShowBirdsEyeView();
											break;
										case 27:                //key = 'Escape'			
										case 67:				//key = 'c'
											fnClearSelectionAndSearch();	
											break;
										case 68:				//key = 'd'
											//fnShowDataGrid();	
											break;	
									} //switch
								}// if
								break;
							case "mousedown":				
								var visualObjSelected = fnGetSelectedObj(properties);
								if (visualObjSelected) 	{			
									if (event.ctrlKey) {

										fnSearchVisualObjSelected(visualObjSelected);
									
									} //if
									else {

										if (properties.WebFOCUS && visualObjSelected.userData[properties.visualizeProp]) {  //WebFOCUS..show tooltip

											fnSearchVisualObjSelected(visualObjSelected);

											var offset = properties.visualDataMap.get(visualObjSelected[properties.keyVisualName]);
											var ids = {series: 0, group: offset};	
											var data = properties.renderConfig.data;	
											properties.tooltip
												.content(content, data[offset], data, ids)	
												.position(event.clientX , event.clientY)   //Takes into account main or selection
												.show();												
										} //if					
									
									} //else
										
								} // if
								break;							
							case "mouseup":
								break;
							case "dblclick":
							
										var visualObjSelected = fnGetSelectedObj(properties);

										if (visualObjSelected) {
											if (properties.WebFOCUS && visualObjSelected.userData[properties.visualizeProp]) {  //WebFOCUS Drilldown

												fnSearchVisualObjSelected(visualObjSelected);

												var offset = properties.visualDataMap.get(visualObjSelected[properties.keyVisualName]);
												var chart = properties.renderConfig.moonbeamInstance;
												
												
												var ids = {series: 0, group: offset};	
												var data = properties.renderConfig.data;
												var ddType = (chart.eventDispatcher.events.length != 0) ? "single" : "multi";
												
												switch (ddType) {
												
													case "single":
														var dispatcher = chart.eventDispatcher.events.find(function (obj) { return obj.series == 0});
														var localURL = chart.parseTemplate(dispatcher.url, data[offset], data, ids);
														if (dispatcher.target) {
																		window.open(localURL, dispatcher.target);
														} //if
														else {
																		document.location = localURL;
														} //else										
													
														break;
													
													case "multi":
														//New WebFOCUS Extension logic for showing tooltip		

														properties.tooltip
															.content(content, data[offset], data, ids)	
															//.content([" offset: " + offset])   //for debugging
															//.position(properties.offsetX, properties.offsetY)
															.position(event.clientX , event.clientY)   //Takes into account main or selection
															.show();
														break;
													default:
												
												} //switch

											} //if
											
											else {
												
												fnSearchVisualObjSelected(visualObjSelected);
											
											} //else
										} //if
						
							default:	
						} //switch
						
						
						function fnSearchVisualObjSelected(visualObjSelected){

							properties.dataGrid.searchReset(false);  //Reset search (trigger search logic), but don't refresh the grid http://w2ui.com/web/docs/1.5/w2grid.searchReset
							properties.dataGrid.search(properties.keyDataName, visualObjSelected[properties.keyVisualName] );  //An effective join	
							
						} //fnSearchVisualObjSelected

					
						
					}//properties.fnHandleKeyMouse
					
					
					// EVENTS
					document.addEventListener( 'keydown', properties.fnHandleKeyMouse , false );								//https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
					document.addEventListener( 'mousedown', properties.fnHandleKeyMouse, false );	
					document.addEventListener( 'mouseup', properties.fnHandleKeyMouse, false );
					document.addEventListener( 'dblclick', properties.fnHandleKeyMouse, false );		
					
					
					
					//RETURN
					return;
					
					
						
					//USE RAYCASTING TO DETERMINE SELECT OBJECT
					function fnGetSelectedObj(properties){

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
						
						var intersects = properties.raycaster.intersectObjects( grouping.children,true );
						
						if (intersects.length == 0) return null;
						
						var visualParent = fnGetVisualizeableParent(intersects[0].object);
						if (visualParent) return visualParent;
						
						//Otherwise determine if raycaster intersect childs (or its parent) are desginated for visualization and return it
						var selectedObject = null;
				
						intersects.some(function(intersect) {  //Find the intersect (or its parent) that can be visualized	
							
							selectedObject = fnGetVisualizeableParent(intersect.object);
							if (selectedObject) return true;
						
							if (intersect.object.userData){
								selectedObject = intersect.object.userData[properties.visualizeProp] ? intersect.object : null;
								return intersect.object.userData[properties.visualizeProp];
							} //if
							else {
								return false;
							} //else
							
						}); //intersects.some
					
						return selectedObject;
						
						function fnGetVisualizeableParent(visualObj){
							
							//If parent is designated for visualization, return it
							if (visualObj.parent){
								if (visualObj.parent.userData){
									if (visualObj.parent.userData[properties.visualizeProp]){
										return visualObj.parent;
									}
								}		
							}//if				
							
							return null;
							
						} //fnGetVisualizeableParent 
						
						
						
									
					} // fnGetSelectedObj
					
					
						
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
								//node[properties.keyVisualName] maps (joins) to properties.keyDataName
								//Testing userData[properties.visualizeProp] (values '1' or '0') allows program to determine if CAD designer wants object to be data driven
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
			
			return 	$().w2grid(dataGridProps);
			
			/*
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
				
			*/
			
			function fnGetDataGridProperties(dataVisual) {
				
																	
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
					name		: dataVisual.visualName + "_dataGrid",		
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
							// {type: 'button', id: 'downloadButton', caption: translate("downLoadData"), tooltip: 'Download .csv file of current data grid'} 
							{type: 'button', id: 'downloadButton', caption: "Download", tooltip: 'Download .csv file of current data grid'} 
							,{type: 'break'},
							{type: 'button',
									id: 'refreshData', 
									// caption:	dataVisual.dataRefreshing ?  translate("datGuiLoadingMsg") : translate("datGuiFolders.refresh"), 
									// bug with w2ui[dataVisual.visualName + "_dataGrid"].toolbar.set, use text: instead
									// text:	dataVisual.dataRefreshing ?  translate("datGuiLoadingMsg") : translate("datGuiFolders.refresh"), 
									text:	dataVisual.dataRefreshing ?  translate("datGuiLoadingMsg") : "Refresh",  //Must use text not caption...bug with caption in w2ui
									tooltip: dataVisual.dataRefreshing ?  translate("datGuiLoadingMsg") : translate("datGuiFolders.refresh"),
							}
							],	
						
						onRender: function(event){
								event.onComplete =  function(){

										//if (dataVisual.callBackReloadTimer) w2ui[dataVisual.visualName + "_dataGrid"].toolbar.set("refreshData", {caption: translate("datGuiLoadingMsg") } );
										if (dataVisual.callBackReloadTimer) w2ui[dataVisual.visualName + "_dataGrid"].toolbar.set("refreshData", {text: translate("datGuiLoadingMsg") } );

								}; //onComplete
						},
						onResize: function(event){
								event.onComplete =  function(){
										if (dataVisual.bInitiating){
											dataVisual.bInitiating =  false;
											w2ui[dataVisual.visualName + "_dataGrid"].columnClick(dataVisual.dataKey);
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


		function fnBuildVisualGrid(dataVisual,visualizer){
			
			var visualGridProps  = fnGetVisualGridProperties(dataVisual, mdv.visualizer); 													//Build the visualGrid
			return $().w2grid(visualGridProps);			
				
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
															case "vGrId" +  dataVisual.visualKey:
																column.caption = field.split("vGrId")[1] + " (Visual Key)";
																break;
															default:
																column.caption = field.split("vGrId")[1];
																break;
														} //select
														
														if (field == dataVisual.colorPrefix + "vGrIdColor"){
															
														  column.render = function(record) {	
														  
																	var visualObj =  dataVisual.visual.scene.getObjectByProperty("uuid",record.recid);
																	
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
					
					record.recid = visualObj.uuid ;
						
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

			function fnGetMaterialMeshes(visualObject){
				
				var aMaterialMeshes=[];	
				visualObject.traverse(function(node) {  //Color the object and any children; object may be a group with children
					if (node.type == "Mesh" && node.material) {
						aMaterialMeshes.push(node);
					} //if
				}); //visualObject.traverse	
				
				return aMaterialMeshes;
				
			}//fnGetMaterialMeshes	
	
	
		} //fnBuildVisualGrid


		function fnHandleSelectionOrSearch(event){

			
			if (dataVisual.searching) return;  //Prevent deadly embrace
			
			dataVisual.searching = true;
		
			fnClearIsolateSelections("clear");	//Clear

			var grid = event.target;  //Could be either data grid or visual grid
			var grid2 = grid == dataVisual.visualName + "_dataGrid" ? dataVisual.visualName + "_visualGrid" : dataVisual.visualName + "_dataGrid";
			
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

	mdv.destroy =  function (){
		
		mdv.visualizer.destroy();

		
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
	
} //MyDataVisualizer
