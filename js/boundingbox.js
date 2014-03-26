/*
 * Bounding box
 */

function degToRad(angle){
	return angle*Math.PI/180;
}

function radToDeg(angle){
	return angle/Math.PI*180;
}

 (function($) {

	function BoundingBox(elem, options){
		this.options=options;
		this.width=options.width;
		this.height=options.width;
		this.depth=options.depth;
		this.mainBox=elem.find('.bbox');

		this.mainBoxTransforms='';

		//Translations overt main box
		this.transX=0;
		this.transY=0;
		this.transZ=0;

		//face transforms
		this.tFront='';
		this.tBack='';
		this.tUpper='';
		this.tLower='';

		//faces
		this.frontFace=elem.find('.face.front');
		this.backFace=elem.find('.face.back');
		this.upperFace=elem.find('.face.upper');
		this.lowerFace=elem.find('.face.lower');

		//vertex
		this.vertexFrontTop=elem.find('.vertex.front.top');
		this.vertexFrontBottom=elem.find('.vertex.front.bottom');
		this.vertexFrontLeft=elem.find('.vertex.front.left');
		this.vertexFrontRight=elem.find('.vertex.front.right');

		this.vertexBackTop=elem.find('.vertex.back.top');
		this.vertexBackBottom=elem.find('.vertex.back.bottom');
		this.vertexBackLeft=elem.find('.vertex.back.left');
		this.vertexBackRight=elem.find('.vertex.back.right');

		this.vertexUpperLeft=elem.find('.vertex.upper.left');
		this.vertexUpperRight=elem.find('.vertex.upper.right');
		this.vertexLowerLeft=elem.find('.vertex.lower.left');
		this.vertexLowerRight=elem.find('.vertex.lower.right');

		this.shearTopX=0;
		this.shearTopY=0;
		this.shearTopZ=0;

		//center
		this.centerX=elem.find('.core').offset().left;
		this.centerY=elem.find('.core').offset().top;

		//tools
		this.planeToolXY=$('.planetool.xy');
		this.planeToolXZ=$('.planetool.xz');
		this.planeToolYZ=$('.planetool.yz');
		this.currentTool="shear";
		this.updateToolVisibility();

		//some values needed for UI drag and drop
		this.mouseX = 0;
		this.mouseY = 0;
		this.currentActiveControl=$(document);
		this.currentTransformationValue=0;
		this.currentTransformation='none';


	}

	BoundingBox.prototype = {
		
		init: function(){
			this.addDomEvents();
			this.addToolEvents();
			this.redraw();
			this.drawTools();
		},

		addDomEvents: function(){
			var box=this;
			
			$('input[name=tool-select]').change(function(){
				box.currentTool = $(this).val();
				box.updateToolVisibility();
			});

			$('#width').on('keyup keydown change', function(){
				box.width=parseInt($(this).val());
				box.redraw();
			});
			$('#height').on('keyup keydown change', function(){
				box.height=parseInt($(this).val());
				box.redraw();
			});
			$('#depth').on('keyup keydown change', function(){
				box.depth=parseInt($(this).val());
				box.redraw();
			});

			//Plane shear
			$("#ps-top-x").change(function(){
				box.resetShearY();
				box.resetShearZ();
				box.shearTopX=degToRad($(this).val());
				box.redraw();
			});
			$("#ps-top-y").change(function(){
				box.resetShearX();
				box.resetShearZ();
				box.shearTopY=degToRad($(this).val());
				box.redraw();
			});
			$("#ps-top-z").change(function(){
				box.resetShearX();
				box.resetShearY();
				box.shearTopZ=degToRad($(this).val());
				box.redraw();
			});
		},

		redraw: function(){
			this.sizeTransformations();
			this.shearTransformations();
			this.applyWebkitTransforms();
			this.drawTools();
		},

		updateToolVisibility: function(){
				if(this.currentTool=="resize"){
					$(".control.resize-handle").show();
					$(".control.shear-handle").hide();
					$(".control.move-center-handle").show();
				}else{
					$(".control.shear-handle").show();
					$(".control.resize-handle").hide();
					$(".control.move-center-handle").hide();
				}
		},

		sizeTransformations: function(){
			//front
			this.frontFace.css('width', this.width + 'px');
			this.frontFace.css('height', this.height + 'px');
			this.tFront = '';
			this.tFront += ' translateX(-'+this.width/2+'px)';
			this.tFront += ' translateZ('+this.depth/2+'px)';
			this.tFront += ' translateY(-'+this.height/2+'px)';

			//back
			this.backFace.css('width', this.width + 'px');
			this.backFace.css('height', this.height + 'px');
			this.tBack = '';
			this.tBack += 'translateX(-'+this.width/2+'px)';
			this.tBack += ' translateZ(-'+this.depth/2+'px)';
			this.tBack += ' translateY(-'+this.height/2+'px)';

			//upper
			this.upperFace.css('width', this.width + 'px');
			this.upperFace.css('height', this.depth + 'px');
			this.tUpper = '';
			this.tUpper += 'translateX(-'+this.width/2+'px)';
			this.tUpper += ' translateY(-'+this.depth/2+'px)';
			this.tUpper += ' rotateX(90deg)';
			this.tUpper += ' translateZ('+this.height/2+'px)';

			//lower
			this.lowerFace.css('width', this.width + 'px');
			this.lowerFace.css('height', this.depth + 'px');
			this.tLower = '';
			this.tLower += 'translateX(-'+this.width/2+'px)';
			this.tLower += ' translateY(-'+this.depth/2+'px)';
			this.tLower += ' rotateX(90deg)';
			this.tLower += ' translateZ(-'+this.height/2+'px)';

		},

		shearTransformations: function(){
			if(this.shearTopX!=0){
				//TOPX
				//vertex transformations: front left
				var tx='rotateZ('+radToDeg(this.shearTopX) + 'deg)';
				var sin=Math.sin(this.shearTopX)*this.height;
				var cos=Math.cos(this.shearTopX)*this.height;

				this.vertexFrontLeft.css('-webkit-transform', tx);
				this.vertexFrontLeft.css('left', sin/2 + 'px');
				this.vertexFrontLeft.css('top', this.height/2 - cos/2 + 'px');
				//vertex transformations: front right
				this.vertexFrontRight.css('-webkit-transform', tx);
				this.vertexFrontRight.css('left', this.width + sin/2 + 'px');
				this.vertexFrontRight.css('top', (this.height - cos)/2 + 'px');
				//vertex transformations: front top
				this.vertexFrontTop.css('left', sin + 'px');
				this.vertexFrontTop.css('top', this.height - cos + 'px');

				this.vertexBackLeft.css('-webkit-transform', tx);
				this.vertexBackLeft.css('left', sin/2 + 'px');
				this.vertexBackLeft.css('top', (this.height - cos)/2 + 'px');
				//vertex transformations: front right
				this.vertexBackRight.css('-webkit-transform', tx);
				this.vertexBackRight.css('left', this.width + sin/2 + 'px');
				this.vertexBackRight.css('top', (this.height - cos)/2 + 'px');
				//vertex transformations: front top
				this.vertexBackTop.css('left', sin + 'px');
				this.vertexBackTop.css('top', this.height - cos + 'px');

				//top face x 
				this.upperFace.css('left', sin + 'px');
				this.tUpper += ' translateZ(' + (cos - this.height) + 'px)';
			}

			if(this.shearTopZ!=0){
				//TOPZ
				var sinZ=Math.sin(this.shearTopZ)*this.height;
				var cosZ=Math.cos(this.shearTopZ)*this.height;
				var tz1=' rotateX('+radToDeg(-this.shearTopZ) + 'deg)';
				var tz2=' translateZ('+ (sinZ)/2 + 'px)';
				var tz3=' translateY('+ (this.height-cosZ)/2 + 'px)';
				var tz4=' translateZ('+ -(this.height-cosZ) + 'px)';
				var tz5=' translateY('+ (sinZ) + 'px)';
				this.tFront += tz3 + tz2 + tz1;
				this.tBack += tz3 + tz2 + tz1;
				this.tUpper += tz4 + tz5;
			}

			if(this.shearTopY!=0){
				//RIGHT Y
				var ty='rotateZ('+radToDeg(this.shearTopY) + 'deg)';
				var ty2=' rotateY('+radToDeg(this.shearTopY) + 'deg)';
				var sinY=Math.sin(this.shearTopY)*this.width;
				var cosY=Math.cos(this.shearTopY)*this.width;
				this.vertexFrontTop.css('-webkit-transform', ty);
				this.vertexFrontTop.css('top', (sinY/2) + 'px');
				this.vertexFrontTop.css('left', (cosY - this.width)/2 + 'px');
				this.vertexFrontBottom.css('-webkit-transform', ty);
				this.vertexFrontBottom.css('top', this.height+(sinY/2) + 'px');
				this.vertexFrontBottom.css('left', (cosY - this.width)/2 + 'px');
				this.vertexBackTop.css('-webkit-transform', ty);
				this.vertexBackTop.css('top', (sinY/2) + 'px');
				this.vertexBackTop.css('left', (cosY - this.width)/2 + 'px');
				this.vertexBackBottom.css('-webkit-transform', ty);
				this.vertexBackBottom.css('top', this.height+(sinY/2) + 'px');
				this.vertexBackBottom.css('left', (cosY - this.width)/2 + 'px');	
				this.vertexFrontRight.css('top', (sinY) + 'px');
				this.vertexFrontRight.css('left', (cosY) + 'px');
				this.vertexBackRight.css('top', (sinY) + 'px');
				this.vertexBackRight.css('left', (cosY) + 'px');
				var ty3=' translateZ(' + (-sinY/2) + 'px)';
				var ty4=' translateX(' + (this.width-cosY)/2 + 'px)';
				this.tUpper+= ty2 + ty3 + ty4;
				this.tLower+= ty2 + ty3 + ty4;
			}
		},

		applyWebkitTransforms: function(){
			this.frontFace.css('-webkit-transform', this.tFront);
			this.backFace.css('-webkit-transform', this.tBack);
			this.upperFace.css('-webkit-transform', this.tUpper);
			this.lowerFace.css('-webkit-transform', this.tLower);
		},

		drawTools: function(){
			
			this.planeToolXY.css('width', this.width + 'px');
			this.planeToolXY.css('height', this.height + 'px');
			var txy='';
			txy += ' translateX(-'+this.width/2+'px)';
			txy += ' translateY(-'+this.height/2+'px)';
			this.planeToolXY.css('-webkit-transform', txy);

			this.planeToolXZ.css('width', this.width + 'px');
			this.planeToolXZ.css('height', this.depth + 'px');
			var txz='';
			txz += 'translateZ(-'+this.width/2+'px)';
			txz += 'rotateX(90deg)';
			txz += 'translateX(-'+this.width/2+'px)';
			txz += 'translateY('+this.width/2+'px)';
			txz += 'translateZ('+this.depth/2+'px)';
			this.planeToolXZ.css('-webkit-transform', txz);

			this.planeToolYZ.css('width', this.depth + 'px');
			this.planeToolYZ.css('height', this.height + 'px');
			var tyz='';
			tyz += 'translateZ(-'+this.depth/2+'px)';
			tyz += 'rotateY(90deg)';
			tyz += 'translateX(-'+this.depth/2+'px)';
			tyz += 'translateY(-'+this.height/2+'px)';
			tyz += 'translateZ(-'+this.depth/2+'px)';
			this.planeToolYZ.css('-webkit-transform', tyz);

		},

		hidePlaneTools: function(){
			this.planeToolXY.hide();
			this.planeToolXZ.hide();
			this.planeToolYZ.hide();
		},

		showPlaneTools: function(){
			this.planeToolXY.show();
			this.planeToolXZ.show();
			this.planeToolYZ.show();
		},

		resetShearX: function(){
			$("#ps-top-x").val(0);
			this.shearTopX=0;
			this.clearTransforms();
		},

		resetShearY: function(){
			$("#ps-top-y").val(0);
			this.shearTopY=0;
			this.clearTransforms();
		},

		resetShearZ: function(){
			$("#ps-top-z").val(0);
			this.shearTopZ=0;
			this.clearTransforms();
		},

		clearTransforms: function(){
			this.tFront='';
			this.tBack='';
			this.tUpper='';
			this.tLower='';
			this.applyWebkitTransforms();
			$('.face').attr('style', '');
			$('.vertex').attr('style', '');
			this.mainBoxTransforms='';
			this.mainBox.css('webkit-transform', this.mainBoxTransforms);
		},

		addToolEvents: function(){
			var bbox = this;

			$('.control').mousedown( function(e){
				if(bbox.currentTool == 'resize'){
					bbox.transX=0;
					bbox.transY=0;
					bbox.transZ=0;
				}

				bbox.mainBoxTransforms=''
				$('.control').hide();
				$(this).addClass('moving');
				bbox.mouseX = e.pageX;
				bbox.mouseY = e.pageY;
				bbox.currentActiveControl=$(this);
				bbox.currentTransformation=$(this).attr('data-trans');
				bbox.currentTransformationValue=parseInt($("#" + bbox.currentTransformation).val());
				if(bbox.currentActiveControl.hasClass('move-center-handle')){
					bbox.currentActiveControl.show();
				}
			});

			$(document).mousemove( function(e){
				if($(bbox.currentActiveControl).hasClass('moving')){
					var delta=0;
					if(bbox.currentTool == 'resize'){
						if($(bbox.currentActiveControl).hasClass('resize-handle')){
							//calculate the amount of the transformation 
							//First: distance between the control and the center
							var dcX=bbox.mouseX-bbox.centerX;
							var dcY=bbox.mouseY-bbox.centerY;
							var controlDist=Math.sqrt(dcX*dcX + dcY*dcY);
							//Second: distance between the mouse and the center
							var dmX=e.pageX-bbox.centerX;
							var dmY=e.pageY-bbox.centerY;
							var mouseDist=Math.sqrt(dmX*dmX + dmY*dmY);
							delta = mouseDist - controlDist;
							bbox.applyUITransform(delta);
						}else if($(bbox.currentActiveControl).hasClass('move-center-handle')){
							//Calculate horizontal or vertical movement of the gizmo,
							//according to the case
							if(bbox.currentActiveControl.hasClass('xy')){
								delta=(e.pageX-bbox.mouseX);
							}
							if(bbox.currentActiveControl.hasClass('xz')){
								delta=-(e.pageY-bbox.mouseY);
							}
							if(bbox.currentActiveControl.hasClass('yz')){
								delta=(e.pageX-bbox.mouseX);
							}
							//get in range
							if(delta < -100){
								delta = -100;
							}else if(delta > 100){
								delta = 100;
							}
							bbox.applyUITransform(delta);
						}
					}else if(bbox.currentTool == 'shear'){
						if($(bbox.currentActiveControl).hasClass('shear-handle')){
							//Calculate horizontal or vertical movement of the gizmo,
							//according to the case
							if(bbox.currentActiveControl.hasClass('top')
								|| bbox.currentActiveControl.hasClass('bottom')){
								delta=(e.pageX-bbox.mouseX)/5;
							}else if(bbox.currentActiveControl.hasClass('right')){
								delta=(e.pageY-bbox.mouseY)/5;
							}else if(bbox.currentActiveControl.hasClass('left')){
								delta=(bbox.mouseY-e.pageY)/5;
							}
							if((bbox.currentTransformationValue+delta) < 90 &&
								(bbox.currentTransformationValue+delta) > -90){
								bbox.applyUITransform(delta);
							}
							
						}
					}
					
				}
			});
			$(document).mouseup( function(){
				var transforms = '';
				bbox.currentActiveControl.removeClass('moving');
				bbox.currentActiveControl=$(document);
				
				if(bbox.currentTool == 'resize'){
					this.width=200;
					this.height=200;
					this.depth=200;
					bbox.resetResizeInputs();
					$('.control.resize-handle').show();
					$('.control.move-center-handle').show();
				}else if(bbox.currentTool == 'shear'){
					bbox.resetShearInputs();
					$('.control.shear-handle').show();
				}
				bbox.clearTransforms();
			});
		},

		resetShearInputs: function(){
			$("#ps-top-x").val(0);
			$("#ps-top-x").trigger('change');
		},

		resetResizeInputs: function(){
			$("#height").val(200);
			$("#height").trigger('change');
			$("#width").val(200);
			$("#width").trigger('change');
			$("#depth").val(200);
			$("#depth").trigger('change');
		},

		applyUITransform: function(delta){
			this.mainBoxTransforms='';
			var current = this.currentTransformationValue;
			$("#" + this.currentTransformation).val(parseInt(current + delta));
			$("#" + this.currentTransformation).trigger('change');
			var transforms = '';
			this.mainBox.css('webkit-transform', this.mainBoxTransforms);

			// TODO: 
			// stack transformations per axis so they are not resetted

			//adjust position
			switch(this.currentTransformation){
				case 'height':
					if(this.currentActiveControl.hasClass('top')){
						this.transY = -delta/2;
					}
					if(this.currentActiveControl.hasClass('bottom')){
						this.transY = delta/2;
					}
					break;
				case 'width':
					if(this.currentActiveControl.hasClass('left')){
						this.transX = -delta/2;
					}
					if(this.currentActiveControl.hasClass('right')){
						this.transX = delta/2;
					}
					break;
				case 'depth':
					if(this.currentActiveControl.hasClass('left')){
						this.transZ = delta/2;
					}
					if(this.currentActiveControl.hasClass('right')){
						this.transZ = -delta/2;
					}
					break;
				case 'ps-top-x':
					//In case we have a shear transformation, we rotate the bounding box
					//to execute any shear transformation using the shear top x transformation
					this.shearTopX = delta/2;
					this.rotateBoundingBoxToShear();
					break;
				case 'move-center-xy':
					var trans='translateX(-' + this.width/2+ 'px)';
					trans+='translateY(-' + this.height/2+ 'px)';
					trans += ' translateZ(' + delta + 'px)'; 
					this.currentActiveControl.css('-webkit-transform', trans);
					break;
				case 'move-center-xz':
					var trans='translateZ(-' + this.depth/2+ 'px)';
					trans+=' rotateX(90deg)';
					trans+=' translateX(-' + this.width/2 + 'px)';
					trans+='translateY(' + this.height/2+ 'px)';
					trans+= ' translateZ(' + (this.depth/2+delta) + 'px)'; 
					this.currentActiveControl.css('-webkit-transform', trans);
					break;
				case 'move-center-yz':
					var trans='translateZ(-' + this.depth/2+ 'px)';
					trans+=' rotateY(90deg)';
					trans+=' translateX(-' + this.width/2 + 'px)';
					trans+='translateY(-' + this.height/2+ 'px)';
					trans+= ' translateZ(-' + (-delta+this.width/2) + 'px)';  
					this.currentActiveControl.css('-webkit-transform', trans);
					break;
			}

			this.mainBoxTransforms+=' translateX(' + this.transX + 'px) translateY(' + this.transY + 'px) translateZ(' + this.transZ + 'px)';

			this.mainBox.css('webkit-transform', this.mainBoxTransforms);
		},

		rotateBoundingBoxToShear: function(){
			//Rotate to achieve shear on any side
			this.mainBox.css('-webkit-transform-origin', '0% 0%');
			
			if(this.currentActiveControl.hasClass('xy-bottom')){
				this.mainBoxTransforms += ' rotateX(180deg)';
			}
			if(this.currentActiveControl.hasClass('xy-left')){
				this.mainBoxTransforms += ' rotateZ(-90deg)';
			}
			if(this.currentActiveControl.hasClass('xy-right')){
				this.mainBoxTransforms += ' rotateZ(90deg)';
			}

			if(this.currentActiveControl.hasClass('xz-right')){
				this.mainBoxTransforms += ' rotateX(90deg)';
				this.mainBoxTransforms += ' rotateZ(90deg)';
			}
			if(this.currentActiveControl.hasClass('xz-left')){
				this.mainBoxTransforms += ' rotateX(90deg)';
				this.mainBoxTransforms += ' rotateZ(-90deg)';
			}
			if(this.currentActiveControl.hasClass('xz-top')){
				this.mainBoxTransforms += ' rotateX(90deg)';
			}
			if(this.currentActiveControl.hasClass('xz-bottom')){
				this.mainBoxTransforms += ' rotateX(-90deg)';
			}

			if(this.currentActiveControl.hasClass('yz-left')){
				this.mainBoxTransforms += ' rotateY(90deg)';
				this.mainBoxTransforms += ' rotateZ(-90deg)';
			}
			if(this.currentActiveControl.hasClass('yz-right')){
				this.mainBoxTransforms += ' rotateY(90deg)';
				this.mainBoxTransforms += ' rotateZ(90deg)';
			}
			if(this.currentActiveControl.hasClass('yz-top')){
				this.mainBoxTransforms += ' rotateY(-90deg)';
			}
			if(this.currentActiveControl.hasClass('yz-bottom')){
				this.mainBoxTransforms += ' rotateY(-90deg)';
				this.mainBoxTransforms += ' rotateX(180deg)';
			}

		}

	}


	$.fn.boundingbox = function(options) {
 		this.each(function(){
 			options = $.extend({}, $.fn.boundingbox.defaults, options);
 			var boundingbox = new BoundingBox($(this), options);
 			boundingbox.init();
 		});	
 	}

 	$.fn.boundingbox.defaults = {
 		width:200,
 		height:200,
 		depth:200
 	};

 })(jQuery);