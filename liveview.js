function connect(){
	console.log("Connect()");
	var ctrlDown=false;
	var bkey=66;
	var ctrlKey = 17;
	
	$("#text_ed").keyup(function(e){
		// if (e.keyCode==13 || e.keyCode==32 || e.keyCode==8){ //case space(32),backspace(8) or enter(13) recompile mark-down
			compile($("#text_ed").val(),"#text");
		// }
	});

	console.log("Connect: done..")
}


//	# H1
//	## H2
//	### H3
//  **bold**
//	***italic***
//	 * unorded list
//	 - orded list
//	 */
//	[[/src|text]] (img+caption)
//  {[index]}
//  {{url|text}}