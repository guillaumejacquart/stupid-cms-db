$(document).ready(function(){
	
	
	$.get('/stupid-cms/user', function(response){
		if(response){
			
			$('head').append('<link href="/stupid-cms/css/main.css" type="text/css" rel="stylesheet" />')
			$('body').append('<div class="cms-admin">Bonjour '+response+'</div>')
				.append('<div class="notification"></div>');
			
			var script = document.createElement('script');
			script.src = "/stupid-cms/js/tinymce/tinymce.min.js";
			script.onload = function () {
				initTinymce();
				
				$('body').on('click', '.editable', function(){
						if(!$(this).is('img')){
							return;
						}
					})
				
					.on('blur', '.editable', function(){
						var elem = this;
						var attrs = getAttributes($(elem));
											
						data = {
							id: elem.id, 
							index: $(elem).index('.editable'), 
							innerHtml: elem.innerHTML,
							attrs: attrs
						};
						
						$.ajax({
							url:'/stupid-cms/edit',
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
		
		function initTinymce(){
			tinymce.remove('.editable');
			tinymce.init({
				selector: '.editable',
				inline: true,
				toolbar: 'undo redo image link paste',
				menubar: false,
				plugins: "image link paste",
				paste_as_text: true,
				forced_root_block : ""
			});
		}
		
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
		
		/**
		* Gets an XPath for an element which describes its hierarchical location.
		*/
		var getElementTreeXPath = function(element) {
			var paths = [];

			// Use nodeName (instead of localName) so namespace prefix is included (if any).
			for (; element && element.nodeType == 1; element = element.parentNode)  {
				var index = 0;

				for (var sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
					// Ignore document type declaration.
					if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
						continue;

					if (sibling.nodeName == element.nodeName)
						++index;
				}

				var tagName = element.nodeName.toLowerCase();
				var pathIndex = (index ? "[" + (index+1) + "]" : "");
				paths.splice(0, 0, tagName + pathIndex);
			}

			return paths.length ? "/" + paths.join("/") : null;
		};
		
		$('body p, span, div, img').on('dblclick', '*:not(:has(*), .editable)', function(){
			var xpath = getElementTreeXPath(this);
			var elem = this;
			
			$.ajax({
				url:'/stupid-cms/make-editable',
				type:"POST",
				data: JSON.stringify({xpath: xpath}),
				contentType:"application/json; charset=utf-8",
				dataType:"json",
				success: function(){					
					$(elem).addClass('editable');
					initTinymce();
					$(elem).focus();
					$('.notification').html('Elément modifiable !').fadeIn(500, function(){
						window.setTimeout(function(){
							$('.notification').fadeOut(500);
						}, 2000);
					});
				}
			});
			
		});

	});	
		
});