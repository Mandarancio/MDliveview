function connect(){	
	$("#text_ed").keyup(function(e){

		$("#css-pers").empty();
		$("#css-pers").append($("#text_ed").val());
	});
}
