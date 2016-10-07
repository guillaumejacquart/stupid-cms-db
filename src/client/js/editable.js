(function () {
		
	function jQueryLoaded() {		
		$(document).ready(function(){
			if($("#cms-page-name").length === 0){
				return;
			}
			
			var page = $("#cms-page-name").val();
		
			$.get("/cms/user?page=" + page, function(response) {			
				var cms,
					notif;
				
				$('head').append('<link rel="stylesheet" type="text/css" href="http://yui.yahooapis.com/3.18.1/build/cssnormalize-context/cssnormalize-context-min.css">');
				
				function displayNotif(content, type){
					notif.html(content)
						.addClass(type)
						.fadeIn(500, function(){
							window.setTimeout(function(){
								notif.fadeOut(500, function(){
									notif.removeClass(type);
								});
							}, 2000);
					});
				}
				
				function getAttributes(elem){	
					var attributes = [];	
					elem.each(function() {
						$.each(this.attributes, function() {
							if(this.specified) {
								attributes.push({name: this.name, value: this.value});
							}
						});
					});
					return attributes;
				}
				
				function initCreateEditable(){
					$("div, ul, ol, h1, h2, h3, h4, h5, p")
					.unbind('mouseenter mouseleave')
					.removeClass('cms-creatable')
					.filter(function(){
						return !$(this).closest("[data-content]").length 
							&& !$(this).find("[data-content]").length
							&& !$(this).closest(".stupid-cms").length;
					})
					.hover(function(){
						var elem = $(this);
						var path = elem.getPath();
						
						elem.addClass('cms-creatable');
						if($(".cms-new-content").filter(function(){
							return $(this).data("path") === path;
						}).length > 0){
							return;
						}
						
						var handle = $("<div class=\"cms-new-content\">" + 
							"<div class=\"cms-create\"><span class=\"fa fa-pencil\"></span></div>" + 
							"</div>");
						
						handle.css({
							top: elem.offset().top,
							left: elem.width() + elem.offset().left - 25,
						});
						
						handle.data("path", path);
						cms.append(handle);
					}, function(e){	
						var elem = $(this);	
						var path = elem.getPath();
						if(!$(e.relatedTarget).hasClass("cms-create")){
							$(".cms-new-content").filter(function(){
								return $(this).data("path") === path;
							}).remove();
							
							elem.removeClass('cms-creatable');
						}
					});
					
					cms.on("click", ".cms-create", function(){
						var that = $(this).closest(".cms-new-content");
						var path = that.data("path");
						
						var data = JSON.stringify({
							selector: path
						});
						
						$.ajax({
							url:"/cms/editable?page=" + page,
							type:"POST",
							data: data,
							contentType:"application/json; charset=utf-8",
							dataType:"json",
							success: function(response){
								$(path).attr("data-content", response.name);
								that.remove();
								displayNotif("Content is now editable !");
								initCreateEditable();
								initTinymce();
							}
						});
					})
					.on("mouseleave", ".cms-create", function(){
						$(this).closest(".cms-new-content").remove();
					});
				}
				
				function destroyEditable(elem){				
					var id = elem.attr("data-content");
					
					$.ajax({
						url:"/cms/editable/" + id + "?page=" + page,
						type:"DELETE",
						contentType:"application/json; charset=utf-8",
						dataType:"json",
						success: function(response){
							elem.removeAttr("data-content");
							displayNotif("Content not editable !");
							initTinymce();
							initCreateEditable();
						}
					});
				}
				
				function initRepeatable(){	
					$(".cms-repeat-actions").remove();		
					$("[data-content][data-repeatable]").each(function(){
						var elem = $(this);
						var name = elem.attr("data-content");
						var index = elem.index("[data-content=\"" + name + "\"][data-repeatable]");
						
						var handle = $("<div class=\"cms-repeat-actions\"><div class=\"cms-copy\"><span class=\"fa fa-clone\"></span></div>" + 
							"<div class=\"cms-delete\"><span class=\"fa fa-trash-o\"></div>" + 
							"<div class=\"cms-move-up\"><span class=\"fa fa-angle-up\"></div>" + 
							"<div class=\"cms-move-down\"><span class=\"fa fa-angle-down\"></div></div>");
							
						handle.css({
							top: elem.offset().top,
							left: elem.width() + elem.offset().left - 100,
						});
						
						handle.data("index", index);
						handle.data("name", name);
						cms.append(handle);
					});
				}
				
				function moveRepeatable(dir, elemBtn){
					var actions = $(elemBtn).closest(".cms-repeat-actions");
					var index = actions.data("index");
					var name = actions.data("name");
					
					var length = $("[data-content=\"" + name + "\"][data-repeatable]").length;
					var elem = $("[data-content=\"" + name + "\"][data-repeatable]").eq(index);
					if(dir === "up"){
						$(elem).after($(elem).prev());
					} else {						
						$(elem).before($(elem).next());
					}					
					
					savePage(true);				
					initRepeatable();
				}
				
				var imageField;
				
				function initTinymce(){			
					tinymce.remove();
					tinymce.init({
						selector: "[data-content]",
						inline: true,
						toolbar: "undo redo image link paste | bold italic underline | remove-editor",
						menubar: false,
						plugins: "image link paste",
						paste_as_text: true,
						forced_root_block : "",
						visualblocks_default_state: true,
						file_browser_callback: function(field_name, url, type, win) {
							if(type=='image'){
								imageField = field_name;
								$('#cms_image_upload').click();
							}
						},
						setup: function (editor) {
							editor.addButton("remove-editor", {
								text: "Remove editor",
								icon: false,
								onclick: function () {
									destroyEditable($(editor.bodyElement));
								}
							});
						}
					});
				}
				
				function getData(){
					var contents = [];
					$('body [data-content]').each(function(){
						var that = this;
						var elem = $(that);
						var attrs = getAttributes(elem);
						var name = elem.attr("data-content");
											
						var data = contents.filter(function(c){
							return c.name === name;
						})[0];
						
						if(!data){
							data = {
								name: name, 
								attrs: attrs
							};
							contents.push(data);
						}
						
						var html = elem.html();
						if(elem.attr("data-repeatable") === "true"){					
							var repeatable = {
								repeatIndex: elem.index("[data-content=" + data.name + "]"),
								innerHtml: html,
								
							};
							data.repeatable = true;
							data.repeats = data.repeats || [];
							data.repeats.push(repeatable);
						} else {							
							data.innerHtml = html;
						}
					});
					
					return contents;
				}
				
				function savePage(local = false){				
					var contents = getData();
					
					if(local){
						var toSave = {
							date: new Date(),
							contents: contents
						}
						localStorage.setItem("stupid-cms.contents", JSON.stringify(toSave));
						displayNotif("Content saved to draft !");
					} else {				
						$.ajax({
							url:"/cms/edit-page?page=" + page,
							type:"POST",
							data: JSON.stringify(contents),
							contentType:"application/json; charset=utf-8",
							dataType:"json",
							success: function(){
								displayNotif("Content saved !");
							}
						});
					}
				}
				
				function loadCache(serverDate){
					var local = localStorage.getItem("stupid-cms.contents");
					
					if(local){
						local = JSON.parse(local);
						if(!serverDate || new Date(local.date) > new Date(serverDate)){
							// load cache content into data-content tags
							if(local.contents && local.contents instanceof Array){
								local.contents.forEach(function(d){
									var elem = $("[data-content=\"" + d.name + "\"]");
									if(elem.attr("data-repeatable") === "true"){
										if(!d.repeats){
											return;
										}
										
										elem.slice(1).remove();
										elem = elem.first();
										
										d.repeats.sort(function(a, b){
											return a.repeatIndex === b.repeatIndex ? 0 : a.repeatIndex < b.repeatIndex ? -1 : 1;
										}).forEach(function(c) {										
											if(c.repeatIndex === 0){
												elem.html(c.innerHtml);
											} else {
												var newEl = elem.clone().html(c.innerHtml);
												var alreadyCreated = elem.siblings("[data-repeatable]");
												if(alreadyCreated.length){
													alreadyCreated.last().after(newEl);
												} else {
													elem.after(newEl);
												}
											}
										});
									} else {
										elem.html(d.innerHtml);
										if(d.attrs){
											d.attrs.forEach(function(a){
												elem.attr(a.name, a.value);
											});
										}
									}
								});
							}
						} else{
							localStorage.removeItem("stupid-cms.contents");
						}
					}
				}
				
				function initEditor(){		
					initTinymce();
					initRepeatable();
					initCreateEditable();
					
					cms.on("click", ".cms-repeat-actions .cms-copy", function(){
						var elem = $("[data-content][data-repeatable]").eq($(this).closest(".cms-repeat-actions").index("index"));
						var newElem = elem.clone();
						$.each(["id", "contenteditable"],function(i,attrName){
							newElem.removeAttr(attrName);
						});
						newElem.removeClass("mce-content-body mce-edit-focus");
						elem.after(newElem);
						savePage(true);
						initRepeatable();
						initTinymce();
					});
					
					cms.on("click", ".cms-repeat-actions .cms-delete", function(){
						var actions = $(this).closest(".cms-repeat-actions");
						var index = actions.data("index");
						var name = actions.data("name");
						
						var elem = $("[data-content=\"" + name + "\"][data-repeatable]").eq(index);
						
						elem.remove();
						savePage(true);
						initRepeatable();
					});
					
					cms.on("click", ".cms-repeat-actions .cms-move-up", function(){
						moveRepeatable("up", this);
					});
					
					cms.on("click", ".cms-repeat-actions .cms-move-down", function(){
						moveRepeatable("down", this);
					});
				}			
				
				if(response){	
					
					cms = $("<div class=\"stupid-cms\"></div>");
					notif = $("<div class=\"cms-notification\"></div>");
					cms.append(notif);
					
					$("body")
						.append(cms)
						.on('blur', '[data-content]', function(){
							savePage(true);
						});
					
					loadCache(response.lastUpdatedAt);
		
					$(document).ajaxError(function(event, request, settings) {
						console.log(event);
						displayNotif(request.responseJSON.message, "error");
					});
					
					$.get("/cms/edition?page=" + page, function(response) {
						if(response){
							cms.append(response);
					
							$(".cms-admin-handle").click(function(){
								$(".cms-admin-content").toggleClass("extended");
							});
							
							$(".cms-edit-page").click(function(){
								savePage();
							});	
							
							$(".cms-export-page").click(function(){
								window.location.href = "/cms/export";
							});		
							
							$(".cms-logout").click(function(){
								window.location.href = "/cms/logout";
							});
					
							$('#cms_image_upload').change(function(){
								var file = this.files[0];
								var name = file.name;
								var size = file.size;
								var type = file.type;
								
								//Your validation
								var type = type.substring(0, 5);
								if(type=='image') {
									var formData = new FormData($('#cms_form_file')[0]);
						
									$.ajax({
										url: "/cms/upload-image",
										type: "POST",
										data: formData,
										async: false,
										success: function (msg) {
											$('#' + imageField).val(msg.path);					
										},
										cache: false,
										contentType: false,
										processData: false
									});

								} else {
									alert('Le fichier doit etre une image') 
								}
							});
					
							$('#cms_site_upload').change(function(){
								var file = this.files[0];
								var name = file.name;
								var size = file.size;
								var type = file.type;
								
								var formData = new FormData($('#cms-import-form')[0]);
					
								$.ajax({
									url: "/cms/upload-site",
									type: "POST",
									data: formData,
									async: false,
									success: function (msg) {
										location.reload();					
									},
									cache: false,
									contentType: false,
									processData: false
								});
							});
							
							$(".cms-import-page").click(function(){
								$(".cms-admin-import").toggleClass('extended');
							});
							
							$.get("/cms/metadata?page=" + page, function(response) {
								if(response){
									$("#cms-page-url").val(response.url);
									$(".cms-edit-metadata").click(function(){
										$(".cms-admin-metadata").toggleClass('extended');
									});
									
									$("#cms-metadata-form").submit(function(e){
										e.preventDefault();
										var data = $(this).serialize();
										$.post(
											"/cms/metadata?page=" + page,
											data,
											function(res){
												displayNotif('Metadata saved !');
											});
									});
								}
							});
						}
					});
					
					$(window).resize(function() {
						initRepeatable();
						initCreateEditable();
					});

					initEditor();	
				}
			});
		});

		jQuery.fn.extend({
			getPath: function () {
				var path, node = this;
				while (node.length) {
					var realNode = node[0], name = realNode.localName;
					if (!name) {
						break;
					}
					name = name.toLowerCase();

					var parent = node.parent();

					var sameTagSiblings = parent.children(name);
					if (sameTagSiblings.length > 1) { 
						var allSiblings = parent.children();
						var index = allSiblings.index(realNode) + 1;
						if (index > 1) {
							name += ":nth-child(" + index + ")";
						}
					}

					path = name + (path ? ">" + path : "");
					node = parent;
				}

				return path;
			}
		});
	}

	if(typeof jQuery=='undefined') {
		var headTag = document.getElementsByTagName("head")[0];
		var jqTag = document.createElement('script');
		jqTag.type = 'text/javascript';
		jqTag.src = 'https://code.jquery.com/jquery-2.2.4.min.js';
		jqTag.onload = jQueryLoaded;
		headTag.appendChild(jqTag);
	} else {
		 jQueryLoaded();
	}
	
}());