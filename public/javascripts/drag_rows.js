 // jquery script for moving table rows AND columns
 $(document).ready(function() {        
     
    $("#drag_table").tableDnD({
    
       onDragClass: "myDragClass",
	     onDragStart: function(table, row){        
          var originalRows = table.tBodies[0].rows;			
    		  for(var i=0; i<=originalRows.length-1; i++) {
                  
                  if (originalRows[i].cells[0].id == row.cells[0].id){
                     fromRowIndex=i;
                     //alert(row.cells[3].id)
                     //original_sample_order += originalRows[i].cells[0].id + ',';
                  }
          } 
               //alert(original_sample_order)
    		  $("#dragInfoArea").html("Moving row " + row.cells[0].id
		                        + " (index: " + fromRowIndex + ")" );		
      
       },
	     onDrop: function(table, row) {

            var rows = table.tBodies[0].rows;
            for (var i=0; i<=rows.length-1; i++) {
              if (row.cells[0].id == rows[i].cells[0].id){
                 toRowIndex=i;
                 //alert(row.cells[3].id)
              }
            }
                    
            direction = 'up';
            if(toRowIndex > fromRowIndex) {
	            direction = 'down';
	          }
            
            fromColIndex = fromRowIndex+1;
            toColIndex = toRowIndex+1;

            for (var i=0; i < rows.length;i++){
               var row = rows[i];
  	           var cell1 = row.cells[fromColIndex];
  	           var cell2 = row.cells[toColIndex];
  	           if(direction == 'down')
      				 {
      						row.insertBefore(cell1,cell2.nextSibling);
      				 }	
      				 else
      				 {
      						row.insertBefore(cell1,cell2);
      				 }	
    		    } //end of loop        
            ///// debug /////////////////////
            var debugStr = "** Drag a row to rearrange the table. **";
            
            // this gets the new sample order for saving state between distance_metric changes
            new_sample_order = '';
            for (var i=0; i<rows.length-1; i++) {
                //debugStr += '<br>'+i+'-'+rows[i].cells[0].id;
                new_sample_order += rows[i].cells[0].id + ',';
                //alert(rows[i].id+'-'+ rows[i+1].id)                
             } 
             //alert(new_sample_order)
             // trim off trailing comma
             new_sample_order = new_sample_order.replace(/\,$/,'');
             //update_session('new_sample_order',new_sample_order,'yes');
              //alert(original_sample_order)
             //if(original_sample_order == new_sample_order)
             //{
                // we haven't drug any rows so we must have just clicked
                //refresh();
             //}
             
/*
            var debugStr .= "<br>Row dropped was "+ row.cells[0].id +"-"+row.id
             +"<br>from row= "+ fromRowIndex
             +  "<br>to row= "+ toRowIndex
             +   ". <br>New order:<br> "; 
             for (var i=0; i<rows.length; i++) {
                debugStr += i+'-'+rows[i].cells[0].id;
                //alert(rows[i].id+'-'+ rows[i+1].id)                
             } 
             //////////// end debug /////////////
                       
  */          
             $("#dragInfoArea").html(debugStr);
             
             
             // refresh() here makes the heatmap cell links non-functional
            
             
        }  // end of onDrop
       
	});  
   
});
