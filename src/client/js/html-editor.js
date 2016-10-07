(function () {
	
	if(typeof($) === 'undefined') {
		return;
	}
	
	$(document).ready(function(){
		if(!$("#cms-editor-code").length){
			return;
		}
		
		var editor = CodeMirror.fromTextArea(document.getElementById("cms-editor-code"), {
			mode: "htmlmixed",
			lineNumbers: true,
			selectionPointer: true
		});
		  
		$(".cms-save-page").click(function(){
			var html = editor.getValue();
			var page = $("#cms-page").val();
					
			var data = JSON.stringify({
				html: html
			});
			
			$.ajax({
				url:"/editor?page=" + page,
				type:"POST",
				data: data,
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(response){
					alert("page have been saved");
				}
			});
		});
	});
}());