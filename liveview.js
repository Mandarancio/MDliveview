function connect(){	
	$("#text_ed").keyup(function(e){
		// if (e.keyCode==13 || e.keyCode==32 || e.keyCode==8){ //case space(32),backspace(8) or enter(13) recompile mark-down
			compile($("#text_ed").val(),"#text");
		// }
	});
}
