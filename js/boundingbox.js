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
		this.mainBox=elem;

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
			$('.face').attr('style', '');
			$('.vertex').attr('style', '');
		},

		addToolEvents: function(){
			var bbox = this;
			$('.control').mousedown( function(e){
				$('.control').hide();
				$(this).addClass('moving');
				$(this).show();
				bbox.mouseX = e.pageX;
				bbox.mouseY = e.pageY;
				bbox.currentActiveControl=$(this);
				bbox.currentTransformation=$(this).attr('data-trans');
				bbox.currentTransformationValue=parseInt($("#" + bbox.currentTransformation).val());
			});

			$(document).mousemove( function(e){
				if($(bbox.currentActiveControl).hasClass('moving')){
					var delta=0;
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
					}
					if($(bbox.currentActiveControl).hasClass('shear-handle')){
						//Calculate horizontal or vertical movement of the gizmo,
						//according to the case
						delta=(e.pageX-bbox.mouseX)/5;
						if((bbox.currentTransformationValue+delta) < 90 &&
							(bbox.currentTransformationValue+delta) > -90){
							bbox.applyUITransform(delta);
						}
						var sin=Math.sin(bbox.shearTopX)*bbox.height;
						var cos=Math.cos(bbox.shearTopX)*bbox.height;
						console.log(sin);
						//Update control's coordinates
						
					}
					
				}
			});
			$(document).mouseup( function(){
				bbox.currentActiveControl.removeClass('moving');
				bbox.currentActiveControl=$(document);
				$('.control').show();
				bbox.resetShearInputs();
			});
		},

		resetShearInputs: function(){
			$("#ps-top-x").val(0);
			$("#ps-top-x").trigger('change');
		},

		applyUITransform: function(delta){
			var current = this.currentTransformationValue;
			$("#" + this.currentTransformation).val(parseInt(current + delta));
			$("#" + this.currentTransformation).trigger('change');
			var transforms = '';
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
					this.shearTopX = delta/2;
					break;
			}

			this.mainBox.find('.bbox').css('webkit-transform', 
				'translateX(' + this.transX + 'px) translateY(' + this.transY + 'px) translateZ(' + this.transZ + 'px)');
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