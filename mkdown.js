function compile(input,texttag){
	if (input==null) return;
	var lines=input.split("\n");
	//clear output elements
	$(texttag).empty();


	var title_flag=false;
	var index={
		flag:false,
		tag:"",
		title:"",
		chapter:new Array()
	};

	var chapIndex=-1;
	var subChap=0;

	var ul={
		id:0,
		tag:"",
		active:false
	};

	var ol={
		id:0,
		tag:"",
		active:false
	};

	var inTable=false;
	var tableid=0;

	for(var i = 0;i < lines.length;i++){
    	//code here using lines[i] which will give you each line
    	var text= lines[i];

    	text=italify(text);
    	text=boldify(text);
    	text=convertImg(text);
    	text=convertLink(text);

    	if (text.indexOf("{[index]}")!=-1){
    		index.flag=true;
    		index.tag="#index-list";
    		text="<div id=\"index-list\"></div>";
    	}


 		//check ul status
 		if (ul.active && text.indexOf(" * ")==-1){
 			ul.active=false;
 		}
 		//check ol status
 		if (ol.active && text.indexOf(" - ")==-1){
 			ol.active=false
 		}

 		if (text.indexOf("[{")!=-1){
 			text=text.replace("[{","<table id=\"table-"+tableid+"\"></table>");
 			$(texttag).append(text);
 			inTable=true;
 			continue;
 		}
 		else if (text.indexOf("}]")!=-1 && inTable){
 			inTable=false;
 			tableid++;
 			text=text.replace("}]","");
 		}

 		if (inTable){
 			text=parseRow(text);
 			$("#table-"+tableid).append(text);
 			continue;
 		}
 		else if (text.indexOf("###") != -1) {
			//h3
			text=text.replace("###","<h3 id=\"c"+chapIndex+"-"+subChap+"\">");
			text=text+"</h3>";
			if (chapIndex>=0){
				index.chapter[chapIndex][subChap]=text;
				subChap++;
			}
		}
		else if (text.indexOf("##") != -1){
			chapIndex++;
			//h2
			text=text.replace("##","<h2 id=\"c"+chapIndex+"\">");
			text=text+"</h2>";
			index.chapter[chapIndex]=new Array();
			index.chapter[chapIndex][0]=text;
			subChap=1;
		}
		else if (text.indexOf("#")!=-1){
			//h1
			text=text.replace("#","<h1>");
			text=text+"</h1>";
			if (!title_flag){
				// $(titletag).append(text);
				title_flag=true;
				index.title=text;
				// text="";
			}
		}
		else if (text.indexOf(" - ")!=-1 && !ul.active){
			text=text.replace(" - ","<li>");
			text+="</li>";
			if (ol.active){
				$("#"+ol.tag).append(text);
			}
			else{
				ol.active=true;
				ol.id++;
				ol.tag="ol-"+ol.id;
				$(texttag).append("<ol id=\"ol-"+ol.id+"\"></ol>");
				$("#"+ol.tag).append(text);
			}
			text="";
		}
		else if (text.indexOf(" * ")!=-1 && !ol.active){
			text=text.replace(" * ","<li>");
			text+="</li>";
			if (ul.active){
				$("#"+ul.tag).append(text);
			}
			else{
				ul.active=true;
				ul.id++;
				ul.tag="ul-"+ul.id;
				$(texttag).append("<ul id=\"ul-"+ul.id+"\"></ul>");
				$("#"+ul.tag).append(text);
			}
			text="";
		}
		else text+="<br>";
		$(texttag).append(text);

	}

	if (index.flag){
		$(index.tag).empty();
		for (var i=0;i<index.chapter.length;i++){
			for (var j=0; j<index.chapter[i].length;j++){
				if (j==0){
					$(index.tag).append("<a href=\"#c"+i+"\">"+index.chapter[i][j]+"</a>");
				}
				else{
					$(index.tag).append("<a href=\"#c"+i+"-"+j+"\">"+index.chapter[i][j]+"</a>");
				}	
			}
		}
	}
}



function convertImg(text){
	var img=/\[\[[^\*]+\]\]/gi;
	var imgs=text.match(img);
	if (imgs!=null){
		for (var i=0;i<imgs.length;i++){
			var info=imgs[i];
			info=info.replace("[[","");
			info=info.replace("]]","");
			var list=info.split("|");
			var image="<figure>"
			// var image="";
			if (list!=null && list.length==2){
				image+="<img src=\""+list[0]+"\"/>";
				image+="<figcaption>"+list[1]+"</figcaption>";
			}
			else{
				image+="<img src=\""+info+"\"/>";
			}
			image+="</figure>"
			text=text.replace(imgs[i],image);
		}
	}
	return text;
}

function boldify(text){
	var bold=/\*\*[^\*]+\*\*/gi;
	var boldchar=/\*\*/gi;
	var special=text.match(bold);
	if (special!=null){
		for (var j=0;j<special.length;j++){
			var te=special[j].replace(bold,"<b>"+special[j]+"</b>");
			te=te.replace(boldchar,"");
			text=text.replace(special[j],te);
		}
	}
	return text;
}

function italify(text){
	var italic=/\*\*\*[^\*]+\*\*\*/gi;
	var italicchar=/\*\*\*/gi;
	var special=text.match(italic);
	if (special!=null){
		for (var j=0;j<special.length;j++){
			var te=special[j].replace(italic,"<i>"+special[j]+"</i>");
			te=te.replace(italicchar,"");
			text=text.replace(special[j],te);
		}
	}
	return text;
}

function convertLink(text){
	var regex=/\{\{[^\*]+\}\}/gi;
	var links=text.match(regex);
	if (links!=null){
		for (var i=0;i<links.length;i++){
			var info=links[i];
			info=info.replace("{{","");
			info=info.replace("}}","");
			var list=info.split("|");
			var link="<a href=\" "
			// var image="";
			if (list!=null && list.length==2){
				link+=list[0]+"\">"+list[1];
			}
			else{
				link+=info+"\">"+info;
			}
			link+="</a>"
			text=text.replace(links[i],link);
		}
	}
	return text;
}

function parseRow(text){
	var coulmns=text.split("|");
	if (coulmns!=null && coulmns.length>1){
		var output="<tr>";
		for (var i=0;i<coulmns.length;i++){
			output+="<td>"+coulmns[i]+"</td>";
		}
		output+="</tr>";
		return output;
	}
	else text="<tr><td>"+text+"</td></tr>";
	return text;
}