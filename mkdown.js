var index={
	flag:false,
	tag:"",
	title:"",
	chapter:new Array(),
	args:null
};


function compile(input,texttag){
	if (input==null) return;
	var lines=input.split("\n");
	//clear output elements
	$(texttag).empty();

	index.flag=false;
	var title_flag=false;

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
    	
    	text=codify(text);
    	text=italify(text);
    	text=boldify(text);
    	text=convertImg(text);
    	text=convertLink(text);

    	text=parseCommand(text);

 		//check ul status
 		if (ul.active && text.indexOf(" + ")==-1){
 			ul.active=false;
 		}
 		//check ol status
 		if (ol.active && text.indexOf(" - ")==-1){
 			ol.active=false
 		}

 		if (text.indexOf("[{")!=-1){
 			text=text.replace("[{","");
 			text="<table id=\"table-"+tableid+"\""+text+"></table>";
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
		else if (text.indexOf(" + ")!=-1 && !ol.active){
			text=text.replace(" + ","<li>");
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
		var ord=false;
		if (index.args!=null && index.args[1]=="ordered"){
			ord=true;
		}
		var id;
		for (var i=0;i<index.chapter.length;i++){
			id="#c"+i;
			for (var j=0; j<index.chapter[i].length;j++){
				if (j==0){
					$(index.tag).append("<a href=\""+id+"\"><h2>"+(ord? (i+1)+" ":"")+$(id).text()+"</h2></a>");
				}
				else{
					id="#c"+i+"-"+j;
					$(index.tag).append("<a href=\""+id+"\"><h3>"+(ord? (i+1)+"."+j+" ":"")+$(id).text()+"</h3></a>");
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
	var bold=/\*[^\*]+\*/gi;
	var boldchar=/\*/gi;
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
	var italic=/\*\*[^\*]+\*\*/gi;
	var italicchar=/\*\*/gi;
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

function codify(text){
	var italic=/\*\*\*[^\*]+\*\*\*/gi;
	var italicchar=/\*\*\*/gi;
	var special=text.match(italic);
	if (special!=null){
		for (var j=0;j<special.length;j++){
			var te=special[j].replace(italic,"<code>"+special[j]+"</code>");
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

function parseCommand(text){
	var regex=/\{\[[^\*]+\]\}/gi;
	var cmds=text.match(regex);
	if (cmds!=null){
		for (var i=0;i<cmds.length;i++){
			var info=cmds[i];
			info=info.replace("{[","");
			info=info.replace("]}","");
			var list=info.split("|");
			text=text.replace(cmds[i],command(info,list));
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

function command(str,list){
	if (list!=null && list.length>1){
		var cmd=list[0];
		if (cmd=="index"){
			index.args=list;
			index.flag=true;
			index.tag="#index-list";
			return "<div id=\"index-list\"></div>";

		}
		if (cmd=="echo"){
			for (var i=1;i<list.length;i++){
				console.log(list[i]);
			}
			return "";
		}
	}
	else {
		if (str=="index"){
			index.flag=true;
			index.tag="#index-list";
			index.args=null;
			return "<div id=\"index-list\"></div>";
		}
	}
	return str;
}