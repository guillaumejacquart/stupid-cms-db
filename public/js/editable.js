(function () {
	$(document).ready(function(){
	
		$.get('/cms/user', function(response) {
			if(response){	
				
				$('head').append('<link href="/cms/css/font-awesome.min.css" type="text/css" rel="stylesheet" />');
				$('head').append('<link href="/cms/css/main.css" type="text/css" rel="stylesheet" />');
				
				var cms = $('<div class="stupid-cms"></div>');
				$('body').append(cms);
				
				cms.append('<div class="cms-notification"></div>');
				
				$.get('/cms/edition', function(response) {
					if(response){
						cms.append(response);
					}
				});
				
				$('.cms-admin-handle').click(function(){
					$('.cms-admin').toggleClass('extended');
					$(this).text($('.cms-admin').hasClass('extended') ? '>' : '<');
				});
				
				var notif = $('.cms-notification');
				
				$(window).resize(function() {
					initRepeatable();
					initCreateEditable();
				});
				
				var script = document.createElement('script');
				script.src = "/cms/js/tinymce/tinymce.min.js";
				script.onload = function () {
					initEditor();
					
					$('body')				
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
								data.innerHtml = html;
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
				initTinymce();
				initRepeatable();
				initCreateEditable();
				
				cms.on('click', '.cms-repeat-actions .cms-copy', function(){
					var elem = $('[data-content][data-repeatable]').eq($(this).closest('.cms-repeat-actions').index('index'));
					var newElem = elem.clone();
					$.each(["id", "contenteditable"],function(i,attrName){
						newElem.removeAttr(attrName);
					});
					newElem.removeClass('mce-content-body mce-edit-focus');
					elem.after(newElem);
					initRepeatable();
					initTinymce();
				});
				
				cms.on('click', '.cms-repeat-actions .cms-delete', function(){
					var actions = $(this).closest('.cms-repeat-actions');
					var index = actions.data('index');
					var name = actions.data('name');
					
					var elem = $('[data-content="' + name + '"][data-repeatable]').eq(index);
					var data = JSON.stringify({
						name: name,
						repeatIndex: index
					});
					
					$.ajax({
						url:'/cms/remove',
						type:"POST",
						data: data,
						contentType:"application/json; charset=utf-8",
						dataType:"json",
						success: function(){
							elem.remove();
							initRepeatable();
							notif.html('Content deleted !').fadeIn(500, function(){
								window.setTimeout(function(){
									notif.fadeOut(500);
								}, 2000);
							});
						}
					});
				});
				
				cms.on('click', '.cms-repeat-actions .cms-move-up', function(){
					moveRepeatable('up', this);
				});
				
				cms.on('click', '.cms-repeat-actions .cms-move-down', function(){
					moveRepeatable('down', this);
				});
			}
			
			function initRepeatable(){	
				$('.cms-repeat-actions').remove();		
				$('[data-content][data-repeatable]').each(function(){
					var elem = $(this);
					var name = elem.attr('data-content');
					var index = elem.index('[data-content="' + name + '"][data-repeatable]');
					
					var handle = $('<div class="cms-repeat-actions"><div class="cms-copy"><span class="fa fa-clone"></span></div>' + 
						'<div class="cms-delete"><span class="fa fa-trash-o"></div>' + 
						'<div class="cms-move-up"><span class="fa fa-angle-up"></div>' + 
						'<div class="cms-move-down"><span class="fa fa-angle-down"></div></div>');
						
					handle.css({
						top: elem.offset().top,
						left: elem.width() + elem.offset().left - 100,
					});
					
					handle.data('index', index);
					handle.data('name', name);
					cms.append(handle);
				});
			}
			
			function moveRepeatable(dir, elemBtn){
				var actions = $(elemBtn).closest('.cms-repeat-actions');
				var index = actions.data('index');
				var name = actions.data('name');
				
				var length = $('[data-content="' + name + '"][data-repeatable]').length;
				var elem = $('[data-content="' + name + '"][data-repeatable]').eq(index);
				var data = JSON.stringify({
					name: name,
					repeatIndex: index,
					newRepeatIndex: dir === 'up' ? Math.max(index - 1, 0) : Math.min(index + 1, length - 1)
				});
				
				$.ajax({
					url:'/cms/order',
					type:"POST",
					data: data,
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					success: function(){
						if(dir === 'up'){
							$(elem).after($(elem).prev());
						} else {						
							$(elem).before($(elem).next());
						}						
						initRepeatable();
						notif.html('Content moved !').fadeIn(500, function(){
							window.setTimeout(function(){
								notif.fadeOut(500);
							}, 2000);
						});
					}
				});
			}
			
			function initTinymce(){			
				tinymce.remove();
				tinymce.init({
					selector: '[data-content]',
					inline: true,
					toolbar: 'undo redo image link paste | bold italic underline | remove-editor',
					menubar: false,
					plugins: "image link paste visualblocks",
					paste_as_text: true,
					forced_root_block : "",
					visualblocks_default_state: true,
					setup: function (editor) {
						editor.addButton('remove-editor', {
							text: 'Remove editor',
							icon: false,
							onclick: function () {
								destroyEditable($(editor.bodyElement));
							}
						});
					}
				});
			}
			
			function initCreateEditable(){
				$('body *').filter(function(){
					return !$(this).closest('[data-content]').length 
						&& !$(this).find('[data-content]').length
						&& !$(this).closest('.stupid-cms').length;
				})
				.hover(function(){
					var elem = $(this);
					var path = elem.getPath();
					
					elem.css({ 
						border: '1px dashed #ddd'
					});
					if($('.cms-new-content').filter(function(){
						return $(this).data('path') === path;
					}).length > 0){
						return;
					}
					
					var handle = $('<div class="cms-new-content">' + 
						'<div class="cms-create"><span class="fa fa-plus"></span></div>' + 
						'</div>');
					
					handle.css({
						top: elem.offset().top,
						left: elem.width() + elem.offset().left - 100,
					});
					
					handle.data('path', path);
					cms.append(handle);
				}, function(e){	
					var elem = $(this);	
					var path = elem.getPath();
					if(!$(e.relatedTarget).hasClass('cms-create')){
						$('.cms-new-content').filter(function(){
							return $(this).data('path') === path;
						}).remove();
						
						elem.css({ 
							border: 'initial' 
						});
					}
				});
				
				cms.on('click', '.cms-create', function(){
					var that = $(this).closest('.cms-new-content');
					var path = that.data('path');
					
					var data = JSON.stringify({
						selector: path
					});
					
					$.ajax({
						url:'/cms/editable',
						type:"POST",
						data: data,
						contentType:"application/json; charset=utf-8",
						dataType:"json",
						success: function(response){
							$(path).attr('data-content', response.name);
							that.remove();
							
							notif.html('Content is now editable !').fadeIn(500, function(){
								window.setTimeout(function(){
									notif.fadeOut(500);
								}, 2000);
							});	
							initTinymce();
						}
					});
				})
				.on('mouseleave', '.cms-create', function(){
					$(this).closest('.cms-new-content').remove();
				});
			}
			
			function destroyEditable(elem){
				
				var id = elem.attr('data-content');
				
				$.ajax({
					url:'/cms/editable/' + id,
					type:"DELETE",
					contentType:"application/json; charset=utf-8",
					dataType:"json",
					success: function(response){
						elem.removeAttr('data-content');
						
						notif.html('Content not editable !').fadeIn(500, function(){
							window.setTimeout(function(){
								notif.fadeOut(500);
							}, 2000);
						});	
						initTinymce();
						initCreateEditable();
					}
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

	jQuery.fn.extend({
		getPath: function () {
			var path, node = this;
			while (node.length) {
				var realNode = node[0], name = realNode.localName;
				if (!name) break;
				name = name.toLowerCase();

				var parent = node.parent();

				var sameTagSiblings = parent.children(name);
				if (sameTagSiblings.length > 1) { 
					allSiblings = parent.children();
					var index = allSiblings.index(realNode) + 1;
					if (index > 1) {
						name += ':nth-child(' + index + ')';
					}
				}

				path = name + (path ? '>' + path : '');
				node = parent;
			}

			return path;
		}
	});
})();