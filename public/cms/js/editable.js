$(document).ready(function(){
	
	
	$.get('/user', function(response){
		if(response){
			$('head').append('<link href="/cms/css/main.css" type="text/css" rel="stylesheet />')
			$('body').append('<div class="cms-admin">Bonjour '+response+'</div>')
				.append('<div class="notification"></div>');
			
			var script = document.createElement('script');
			script.src = "/cms/js/tinymce/tinymce.min.js";
			script.onload = function () {
				tinymce.init({
					selector: '.editable',
					inline: true,
					toolbar: 'undo redo image link paste',
					menubar: false,
					plugins: "image link paste",
					paste_as_text: true
				});
				
				var customId = $('.editable[id]').length + 2;
				$('.editable').each(function(){
					if(!this.id){
						this.id = "cms-autoid-" + customId;
						customId++;
					}
					
					$(this).addClass('edit-enabled');
				})
				
				.click(function(){
					if(!$(this).is('img')){
						return;
					}
				})
				
				.blur(function() {
					var elem = this;
					var attrs = getAttributes($(elem));
										
					data = {
						id: elem.id, 
						index: $(elem).index('.editable'), 
						innerHtml: elem.innerHTML.trim(),
						attrs: attrs
					};
					
					$.ajax({
						url:'/edit',
						type:"POST",
						data: JSON.stringify(data),
						contentType:"application/json; charset=utf-8",
						dataType:"json",
						success: function(){
							$('.notification').html('Enregistrement effectué !').fadeIn(500, function(){
								window.setTimeout(function(){
									$('.notification').fadeOut(500);
								}, 2000);
							});
						}
					});
				});
			};
			
			document.head.appendChild(script); //or something of the likes			
		}
	});
	
	
	function getAttributes(elem){	
		var attributes = [];	
		elem.each(function() {
			$.each(this.attributes, function() {
				// this.attributes is not a plain object, but an array
				// of attribute nodes, which contain both the name and value
				if(this.specified) {
					attributes.push({name: this.name, value: this.value});
				}
			});
		});
		return attributes;
	}
	
});