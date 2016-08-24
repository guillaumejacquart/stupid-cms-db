$(document).ready(function(){
	
	$.get('/cms/user', function(response) {
		if(response){	
			
			$('head').append('<link href="/cms/css/font-awesome.min.css" type="text/css" rel="stylesheet" />');
			$('head').append('<link href="/cms/css/main.css" type="text/css" rel="stylesheet" />');
			$('body')
				.append('<div class="cms-notification"></div>');
			
			$.get('/cms/edition', function(response) {
				if(response){
					$('body').prepend(response);
				}
			});
			
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
						
						var html = $(elem).html();
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
			initRepeatable();
			initTinymce();
			
			$('body').on('click', '.cms-repeat-actions .cms-copy', function(){
				var elem = $('[data-content][data-repeatable]').eq($(this).closest('.cms-repeat-actions').index('index'));
				var newElem = elem.clone();
				$.each(["id", "contenteditable"],function(i,attrName){
					newElem.removeAttr(attrName);
				});
				newElem.removeClass('mce-content-body mce-edit-focus');
				elem.after(newElem);
				initRepeatable();
				initTinymce(newElem);
			});
			
			$('body').on('click', '.cms-repeat-actions .cms-delete', function(){
				var index = $(this).closest('.cms-repeat-actions').data('index');
				var elem = $('[data-content][data-repeatable]').eq(index);
				var data = JSON.stringify({
					name: elem.attr('data-content'),
					repeatIndex: index
				});
				
				$.ajax({
					url:'/cms/remove',
					type:"POST",
					data: data,
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					success: function(){
						notif.html('Content deleted !').fadeIn(500, function(){
							window.setTimeout(function(){
								notif.fadeOut(500);
							}, 2000);
						});
					}
				});
			});
		}
		
		function initRepeatable(){								
			$('[data-content][data-repeatable]').each(function(){
				var elem = $(this);
				var handle = $('<div class="cms-repeat-actions"><div class="cms-copy"><span class="fa fa-clone"></span>Copy<span></span></div>' + 
					'<div class="cms-delete"><span class="fa fa-times"></span>Remove<span></span></div></div>');
				handle.css({
					top: elem.offset().top,
					left: elem.width() + elem.offset().left - 100,
				});
				handle.data('index', elem.index('[data-content][data-repeatable]'));
				$('body').append(handle);
			});
		}
		
		function initTinymce(){			
			tinymce.remove('[data-content]');
			tinymce.init({
				selector: '[data-content]',
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