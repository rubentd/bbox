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
		
		//tools
		this.currentTool='planeShear'; //none, planeShear
		this.planeShear=$('#tool-plane-shear-wrap');
	}

	BoundingBox.prototype = {
		
		init: function(){
			this.addDomEvents();
			this.redraw();
			this.drawTools();
		},

		addDomEvents: function(){
			var box=this;
			$('#width').on('keyup keydown', function(){
				box.width=parseInt($(this).val());
				box.redraw();
			});
			$('#height').on('keyup keydown', function(){
				box.height=parseInt($(this).val());
				box.redraw();
			});
			$('#depth').on('keyup keydown', function(){
				box.depth=parseInt($(this).val());
				box.redraw();
			});
			$("input[name=tool]").change(function(){
				box.currentTool=parseInt($(this).val());
				box.redraw();
			});

			//Plane shear
			$("#ps-top-x").change(function(){
				box.shearTopX=degToRad($(this).val());
				box.redraw();
			});
			$("#ps-top-y").change(function(){
				box.shearTopY=degToRad($(this).val());
				box.redraw();
			});
			$("#ps-top-z").change(function(){
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
			switch(this.currentTool){
				case 'none':
					this.planeShear.hide();
					break;
				case 'planeShear':
					this.planeShear.show();
					break;
			}
		},

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