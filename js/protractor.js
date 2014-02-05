/*
 * Protractor tool
 */
var INITIAL_X=362;
var INITIAL_Y=234;

function Protractor(){

	this.origin = {x:INITIAL_X, y:INITIAL_Y, visible:true};
	this.tool=$("#protractor-tool");
	this.canvas=$("#protractor-canvas");
	this.context=this.canvas[0].getContext('2d');

	this.setInputRotation();

	this.angleDegrees=0;
	this.angleRadians=0;

	this.updateAngle();

}

Protractor.prototype = {
	set: function(){
		if(this.state<3){
			this.state++;
		}else{
			this.v1.visible=false;
			this.v2.visible=false;
			this.state=0;
		}		
	},

	setRotation: function(x, y, z){
		this.tool.css("-webkit-transform", "rotateX(" + x + "deg) rotateY(" + y + "deg) rotateZ(" + z + "deg)");
	},

	updateAngle: function(){
		this.constrainAngle();

		$('#protractor-angle').data('deg', this.angleDegrees);
		$('#protractor-angle').data('rad', this.angleRadians);

		$('#protractor-slider-knob').css('left',  this.angleDegrees + 'px');
		this.updateVisibleAngles();
		this.angleRadians=parseFloat(this.angleDegrees/180).toFixed(2);
		this.updateCanvas();
	},

	constrainAngle: function(){
		if(this.angleDegrees < 0){
			this.angleDegrees = 0;
		}else if(this.angleDegrees > 360){
			this.angleDegrees = 360;
		}
	},

	updateVisibleAngles: function(){
		if($('#angle-unit').val() == 'rad'){
			$("#protractor-angle-center").html(this.angleRadians + ' &pi;');
			$("#protractor-angle").val(this.angleRadians);
		}else{
			$("#protractor-angle-center").html(this.angleDegrees + '&deg;');
			$("#protractor-angle").val(this.angleDegrees);
		}
	},

	setInputRotation: function(){
		var xRot = parseInt($("#rot-x").val());
		var yRot = parseInt($("#rot-y").val());
		var zRot = parseInt($("#rot-z").val());
		this.setRotation(xRot, yRot, zRot);
	},

	drawArc: function(){
		var radius = 85;
		var x= this.canvas.width()/2;
		var y= this.canvas.height()/2;
		var startAngle = 0 + (0.5*Math.PI);
		var endAngle = (this.angleRadians*Math.PI) + (0.5*Math.PI);
		var counterClockwise = false;

		this.context.beginPath();
		this.context.arc(x, y, radius, 0, 365, counterClockwise);
		this.context.lineWidth = 15;
		this.context.strokeStyle = '#93A6BA';
		this.context.stroke();

		this.context.beginPath();
		this.context.arc(x, y, radius-8, 0, 365, counterClockwise);
		this.context.lineWidth = 1;
		this.context.strokeStyle = '#525B66';
		this.context.stroke();

		this.context.beginPath();
		this.context.arc(x, y, radius+8, 0, 365, counterClockwise);
		this.context.lineWidth = 1;
		this.context.strokeStyle = '#525B66';

		this.context.beginPath();
		this.context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
		this.context.lineWidth = 15;
		this.context.strokeStyle = 'orange';
		this.context.stroke();

		this.context.beginPath();
		this.context.arc(x, y, radius-8, startAngle, endAngle, counterClockwise);
		this.context.lineWidth = 1;
		this.context.strokeStyle = 'red';
		this.context.stroke();

		this.context.beginPath();
		this.context.arc(x, y, radius+8, startAngle, endAngle, counterClockwise);
		this.context.lineWidth = 1;
		this.context.strokeStyle = 'red';
		this.context.stroke();
	},

	updateCanvas: function(){
		this.context.clearRect(0, 0, 300, 300);
		this.drawArc();
	}
}

/*
 * Object for managing the main canvas
 */
function CanvasController($scope){

	var cc=this;
	$(document).ready( function(){
		cc.protractor = new Protractor(cc);
		cc.mouseX=0;
		cc.mouseY=0;
		$scope.protractor=this.protractor;
		$scope.$apply();
		cc.setEvents();
	});
}

CanvasController.prototype={

	setEvents: function(){
		var cc=this;
		var prot=this.protractor;
		$("input").keydown(function(){
			prot.setInputRotation();
		});
		$("input").keyup(function(){
			prot.setInputRotation();
		});
		$("input").blur(function(){
			prot.setInputRotation();
		});
		$("#protractor-angle").keyup(function(){
			prot.updateAngle();
		});
		$("#protractor-angle").keydown(function(){
			prot.updateAngle();
		});
		$('#protractor-slider-knob').draggable({ 
			axis: 'x',
			containment: 'parent', 
			drag: function(){
				prot.angleDegrees = parseInt($(this).css('left').replace('px',''));
				prot.updateAngle();
			}
		});
		$('#angle-unit').change(function(){
			prot.updateVisibleAngles();
		});
	},

	drawPoint: function(color, x, y, radius){
		this.context.beginPath();
		this.context.arc(x, y, radius, 0, 2*Math.PI, false);
		this.context.fillStyle = color;
		this.context.strokeStyle = 'transparent';
		this.context.fill();
		this.context.stroke();
	},

	drawDashedLine: function(x0, y0, x1, y1, dashLen){
		if (dashLen == undefined) dashLen = 2;
		this.context.beginPath();
		this.context.setLineDash([dashLen,dashLen*2]);
		this.context.moveTo(x0,y0);
        this.context.lineTo(x1,y1);
        this.context.strokeStyle = '#333';
		this.context.stroke();
	}
}

