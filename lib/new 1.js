	function fnVisualizeData(column, dataVisual, key){  //Undefined column means show visual with the color it was designed with
			
		//fnVisualizeData() with no parms resets visualizations
		if (column){   
			
			if (fnIsPresetColor(column)){ //Preset Color  
				
				var fnCalcColor = function (rowIndex, column)  { 		
					return dataVisual.join[rowIndex].dataRow[column];		
				};				  
						
		
				dataVisual.join.forEach(function(joinRow, rowIndex){
						
					dataVisual.setColorVisualObj(joinRow.visualObject,fnCalColor(rowIndex,column));
					
				}); //forEach	


				
				//For Legend processing
				var fnCalcColor = function (i, uniqueCat)  { 
					var originalColumn = column.indexOf("vGrId") == -1 ? column.split(dataVisual.colorPrefix)[1] :	 column;															 
																		 
					var rowIndex = dataVisual.join.findIndex(function(joinRow){joinRow.dataRow[originalColumn] == uniqueCat });
					
					return  dataVisual.join[rowIndex].dataRow[column];		
				};
				
				var fnLegendScale = {fnCalcColor: fnCalcColor};
			
			} //if
			else {	//Scale Color
			
				//SET OBJECT COLOR AS A FUNCTION OF COLORSCALE
				for (var rowIndex = 0; rowIndex < visualizeData.length; rowIndex++ ) {
					
					fnGetObjectScaleColorAndOptionallyVisualize(dataVisual, column, rowIndex, true);

					
				} //for

				var fnLegendScale = fnGetColorScale(column);	//For Legend, Scale coloring is handeld by 	

			} //else

				
			var columnText;
			var colorColumn;
			
			if (key == dataVisual.dataKey){
				
					columnText =  fnIsPresetColor(column) ?  column.split(dataVisual.colorPrefix)[1] + " (Preset Color)"  : 
					column == "recid" ?   dataVisual.dataGrid.columns.find(function(col){ return col.field == column}).caption  : column;	
					
				colorColumn = fnIsPresetColor(column) ?    column.split(dataVisual.colorPrefix)[1] : column;  //Reference to origial column to get it's unique categories, not the column with the colors		
				
			} //if
			else {
					
				columnText = dataVisual.visualGrid.columns.find(function(col){return col.field == column}).caption;	
				colorColumn = column;  //For visualGrid the color column is the column itself
				
			} //else
								
			fnBuildLegend(column, colorColumn, columnText , fnLegendScale, dataVisual);

		} //if
		else {
			
			var fnCalcColor = function () { 									
									return "originalColor";  							
								}; //fnCalcColor
								
			
			dataVisual.join.forEach(function(joinRow){
				
				dataVisual.setColorVisualObj(joinRow.visualObj,fnCalcColor());
			
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
	
	
		
			
	} //fnVisualizeData
	
	//GET AN ARRAY OF THE SCALED COLORS FOR COLUMN objColumnAttributes.column
	//function fnGetObjectScaleColorAndOptionallyVisualize(visualizeData, column, rowIndex, dataKey, bColorVisual) {   
	function fnGetObjectScaleColorAndOptionallyVisualize(dataVisual, column, rowIndex, bColorVisual) {   
		
		var scaleIndex = dataVisual.selectedScale.scaleIndex;    //
		var scaleDirection = dataVisual.selectedScale.direction; //direction: 0: LowHigh, 1: HighLow
												
		var storedScaleColorsKey = column + "_" + scaleIndex + "_" + scaleDirection;

		if (dataVisual.join[rowIndex].storedScaleColors[storedScaleColorsKey]){
			
			var strColorRGB = dataVisual.join[rowIndex].storedScaleColors[storedScaleColorsKey];

			if (bColorVisual) {
				
				dataVisual.setColorVisualObj(dataVisual.join[rowIndex].visualObj,strColorRGB);
				
			}
			
			return strColorRGB;
			
		} //if
	
		else {
			
			dataVisual.storedScaleColors[storedScaleColorsKey] = []; 	
			
			var colorScaleObj = fnGetColorScale(column, dataVisual);
			
			var colorScale = colorScaleObj.fnCalcColor;
			
			//SET OBJECT COLOR AS A FUNCTION OF COLORSCALE			
			dataVisual.join.forEach(function(joinRow){

				if (colorScaleObj.minScale == colorScaleObj.maxScale ) {
					var strColorRGB = colorScale(colorScaleObj.minScale);
				} //if
				else {
					var columnValue = dataVisual.joinRow.dataRow[column];  
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
					var minScale = 0;				
					var maxScale = Math.max(aUniqueCategories.length - 1, 1);									
					break;
				default:	
			} //switch
			

					
			//SEQUENTIAL SCALING
			//ColorScales documented here: https://github.com/d3/d3-scale-chromatic 
			//Scale Sequential requires interpolator: https://github.com/d3/d3-scale#sequential-scales
			//Interpolator: https://github.com/d3/d3-interpolate 			
			var aMinMaxSequential = [ minScale, Math.max(parseFloat(minScale)+1,maxScale) ];
			var domain = [ aMinMaxSequential[scaleDirection % 2], aMinMaxSequential[(-1* scaleDirection % 2) + 1] ] ; //Flipping the domain reverses the scale [min,max] or [max,min]
			var interpolator = d3[fnGetD3Scales()[scaleIndex]];
			
			return {fnCalcColor: d3.scaleSequential(interpolator).domain(domain) , minScale: minScale, maxScale: maxScale }	
			
			
		} //fnGetColorScale
	
			
		
			
	} // fnGetObjectScaleColorAndOptionallyVisualize
	
	//GET COLUMN NAME, TYPE, DATATYPE, MIN/MAX SCALE (if numeric)
	function fnGetColumnAttributes(column,dataVisual){
		
		var dataType =  dataVisual.dataTypes[column] ?  properties.dataTypes[column].type: null; 
		
		var data = dataVisual.join;
		
		var minScale =  dataType == "float" ? d3.min(data,function (join) { return parseFloat(join.dataRow[column]); }) : null;				
		var maxScale = 	dataType == "float" ? d3.max(data,function (join) { return parseFloat(join.dataRow[column]); }) : null;
		
		return {column:column,  
				dataType: dataType, 
				minScale: minScale,
				maxScale: maxScale};
				
	} //fnGetColumnAttributes	
	
	

	
	