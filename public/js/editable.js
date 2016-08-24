$(document).ready(function(){
			
	$.get('/cms/edition', function(response){
		if(response){
			$('body')
				.prepend(response)
				.append('<div class="cms-notification"></div>')
				.attr('id', 'drag-container');
			
			$('head').append('<link href="/cms/css/main.css" type="text/css" rel="stylesheet" />' + 
			'<link href="/cms/css/font-awesome.min.css" type="text/css" rel="stylesheet" />');
			$('body').append('<div class="cms-admin">Bonjour '+response+'</div>')
				.append('<div class="notification"></div>');
			
			$('.cms-admin-handle').click(function(){
				$('.cms-admin').toggleClass('extended');
				$(this).text($('.cms-admin').hasClass('extended') ? '>' : '<');
			});
			
			var notif = $('.cms-notification');
			
			var script = document.createElement('script');
			script.src = "/cms/js/tinymce/tinymce.min.js";
			script.onload = function () {
				initEditor();
				
				$('body').on('click', '[data-content]', function(){
						if(!$(this).is('img')){
							return;
						}
					})
				
					.on('blur', '[data-content]', function(){
						var elem = this;
						var attrs = getAttributes($(elem));
											
						data = {
							name: $(elem).attr('data-content'), 
							attrs: attrs
						};
						
						var html = $(elem).find('.cms-wrapper').html();
						if($(elem).attr('data-repeatable') == "true"){
							data.repeatIndex = $(elem).index('[data-content=' + data.name + ']');
							data.repeatHtml = html;
						} else {							
							data.innerHtml = html;
						}
						
						$.ajax({
							url:'/cms/edit',
							type:"POST",
							data: JSON.stringify(data),
							contentType:"application/json; charset=utf-8",
							dataType:"json",
							success: function(){
								notif.html('Content saved !').fadeIn(500, function(){
									window.setTimeout(function(){
										notif.fadeOut(500);
									}, 2000);
								});
							}
						});
					});
			};
			document.head.appendChild(script);		
		}
		
		function initEditor(){
			
			$('[data-content]')
				.wrapInner('<div class="cms-wrapper"></div>')
				
			$('[data-content][data-repeatable]')
				.append('<div class="cms-duplicate"><span class="fa fa-clone"></span>Dupliquer<span></span></div>');
			
			initTinymce();
			
			$('body').on('click', '.cms-duplicate', function(){
				var elem = $(this).closest('[data-repeatable]');
				var newElem = elem.clone();
				$.each(["id", "contenteditable"],function(i,attrName){
					newElem.removeAttr(attrName);
				});
				newElem.removeClass('mce-content-body mce-edit-focus');
				elem.after(newElem);
				initTinymce(newElem);
			});
		}
		
		function initTinymce(){			
			tinymce.remove('.cms-wrapper');
			tinymce.init({
				selector: '.cms-wrapper',
				inline: true,
				toolbar: 'undo redo image link paste | bold italic underline',
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

	});	
		
});