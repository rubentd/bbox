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

		//faces
		this.frontFace=elem.find('.face.front');
		this.backFace=elem.find('.face.back');
		this.topFace=elem.find('.face.top');
		this.bottomFace=elem.find('.face.bottom');

		//vertex
		this.vertexFrontTop=elem.find('.vertex.front.top');
		this.vertexFrontBottom=elem.find('.vertex.front.botom');
		this.vertexFrontLeft=elem.find('.vertex.front.left');
		this.vertexFrontRight=elem.find('.vertex.front.right');

		this.shearTopX=0;
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
				box.width=$(this).val();
				box.redraw();
			});
			$('#height').on('keyup keydown', function(){
				box.height=$(this).val();
				box.redraw();
			});
			$('#depth').on('keyup keydown', function(){
				box.depth=$(this).val();
				box.redraw();
			});
			$("input[name=tool]").change(function(){
				box.currentTool=$(this).val();
				box.redraw();
			});

			//Plane shear
			$("#ps-top-x").change(function(){
				box.shearTopX=degToRad($(this).val());
				box.redraw();
			});
		},

		redraw: function(){
			//front
			this.frontFace.css('width', this.width + 'px');
			this.frontFace.css('height', this.height + 'px');
			var tFront = '';
			tFront += ' translateX(-'+this.width/2+'px)';
			tFront += ' translateZ('+this.depth/2+'px)';
			tFront += ' translateY(-'+this.height/2+'px)';
			this.frontFace.css('-webkit-transform', tFront);
			//vertex transformations: front left
			this.vertexFrontLeft.css('-webkit-transform', 'rotateZ('+radToDeg(this.shearTopX) + 'deg)');
			this.vertexFrontLeft.css('left', Math.sin(this.shearTopX)*this.height/2 + 'px');
			this.vertexFrontLeft.css('top', this.height/2 - Math.cos(this.shearTopX)*this.height/2 + 'px');
			//vertex transformations: front right
			this.vertexFrontRight.css('-webkit-transform', 'rotateZ('+radToDeg(this.shearTopX) + 'deg)');
			this.vertexFrontRight.css('left', this.width + Math.sin(this.shearTopX)*this.height/2 + 'px');
			this.vertexFrontRight.css('top', this.height/2 - Math.cos(this.shearTopX)*this.height/2 + 'px');
			//vertex transformations: front top
			this.vertexFrontTop.css('left', Math.sin(this.shearTopX)*this.height + 'px');
			this.vertexFrontTop.css('top', this.height -Math.cos(this.shearTopX)*this.height + 'px');
			
			//back
			this.backFace.css('width', this.width + 'px');
			this.backFace.css('height', this.height + 'px');
			var tBack = '';
			tBack += 'translateX(-'+this.width/2+'px)';
			tBack += ' translateZ(-'+this.depth/2+'px)';
			tBack += ' translateY(-'+this.height/2+'px)';
			this.backFace.css('-webkit-transform', tBack);
			
			//top
			this.topFace.css('width', this.width + 'px');
			this.topFace.css('height', this.depth + 'px');
			var tTop = '';
			tTop += 'translateX(-'+this.width/2+'px)';
			tTop += ' translateY(-'+this.depth/2+'px)';
			tTop += ' rotateX(90deg)';
			tTop += ' translateZ(-'+this.height/2+'px)';
			this.topFace.css('-webkit-transform', tTop);

			//bottom
			this.bottomFace.css('width', this.width + 'px');
			this.bottomFace.css('height', this.depth + 'px');
			var tBottom = '';
			tBottom += 'translateX(-'+this.width/2+'px)';
			tBottom += ' translateY(-'+this.depth/2+'px)';
			tBottom += ' rotateX(90deg)';
			tBottom += ' translateZ('+this.height/2+'px)';
			console.log(tBottom);
			this.bottomFace.css('-webkit-transform', tBottom);

			this.drawTools();
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