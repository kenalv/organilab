/*
@organization: Solvo
@license: GNU General Public License v3.0
@date: Created on 4 oct. 2018
@author: Guillermo Castro Sánchez
@email: guillermoestebancs@gmail.com
*/

/**
// Default to true for browsers, false for node, it enables objectCaching at object level.
fabric.Object.prototype.objectCaching = false;
// Enabled to avoid blurry effects for big scaling
fabric.Object.prototype.noScaleCache = true;
// Improve Canvas perfomance
fabric.Object.prototype.statefullCache = false;
fabric.Object.prototype.needsItsOwnCache = false;
*/

function handleDragStart(e) {

    e.dataTransfer.setData("text", e.target.id);
    e.dataTransfer.setData("type", $(e.target).data('ftype'));

   if(e.target.title){
      e.dataTransfer.setData("label", e.target.title);
   }else{
     e.dataTransfer.setData("label", "{{"+e.target.id+"}}");
   }
}

function handleDragEnd(e) {
 console.log('handleDragEnd');
}



(function( ) {
 this.__canvases = [];
 fabric.Object.prototype.transparentCorners = false;
 canvas_editor = new fabric.Canvas('canvas_editor');
 canvas_editor.clear();

 canvas_editor.selectionColor = 'rgba(0, 122, 255, 0.2)';
 canvas_editor.selectionBorderColor = '#337ab7';
 canvas_editor.selectionLineWidth = 2;
 //Canvas background color
 canvas_editor.backgroundColor = 'rgba(255, 255, 255, 1)';

 //Control zoom and panning in canvas editor
 canvas_editor.on('mouse:wheel', function (opt) {
     var delta = opt.e.deltaY;
     var zoom = canvas_editor.getZoom();
     zoom = zoom + delta / 200;
     if (zoom > 20) zoom = 20;
     if (zoom < 0.01) zoom = 0.01;
     canvas_editor.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
     opt.e.preventDefault();
     opt.e.stopPropagation();
 });


 //Save changes in Canvas
 canvas_editor.renderAll();
 function get_position_x(e){
     return e.layerX;
 }
 function get_position_y(e){
     return e.layerY;
 }
 function get_fabric_element(e){
     var data = e.dataTransfer.getData("label");
     var ftype = e.dataTransfer.getData('type');
     if(ftype == "textbox"){
         var name_label = new fabric.Textbox(data, {
             width: 180,
             height: 20,
             left: get_position_x(e),
             top: get_position_y(e),
             fontSize: $("#text-font-size").val(),
             fill: $('#colorfill').val(),
             textAlign: $('#textalign').val(),
             fixedWidth: 160,
             fontFamily: 'Helvetica',
             objectCaching: false,
             renderOnAddRemove: false,
         });
         canvas_editor.add(name_label);
     }else if (ftype == "itext"){
         var name_label = new fabric.IText(data, {
             width: 280,
             left: get_position_x(e),
             top: get_position_y(e),
             fontSize: $("#text-font-size").val(),
             fontFamily: $('#fontfamily').val(),
             textAlign: $('#textalign').val(),
             fill: $('#colorfill').val(),
             fixedWidth: 280,
            // centeredScaling: true,
             objectCaching: false,
             renderOnAddRemove: false,
         });
         canvas_editor.add(name_label);

     }else if(ftype == "image") {
         fabric.Image.fromURL(data, function (img) {
             img.scaleToWidth(100);
             img.scaleToHeight(100);
             img.set("top", get_position_x(e));
             img.set("left", get_position_y(e));
             img.set("centeredScaling", true);
             canvas_editor.add(img);
         });
     }
 }


 function handleDragOver(e) {
     if (e.preventDefault) {
         e.preventDefault();
     }
      e.dataTransfer.dropEffect = 'copy';
     return false;
 }

 function handleDragEnter(e) {
     this.classList.add('over');
 }

 function handleDragLeave(e) {
     this.classList.remove('over');
 }

 function handleDrop(e) {
     e = e || window.event;
     if (e.preventDefault) {
       e.preventDefault();
     }
     if (e.stopPropagation) {
         e.stopPropagation();
     }
     get_fabric_element(e);

     /**
     var img = document.querySelector('.furniture img.img_dragging');
     console.log('event: ', e);

     var offset = $(canvasObject).offset();
     var y = e.clientY - (offset.top + imageOffsetY);
     var x = e.clientX - (offset.left + imageOffsetX);

     var newImage = new fabric.Image(img, {
         width: img.width,
         height: img.height,
         left: x,
         top: y
     });
     canvas.add(newImage);
     */

     return false;
 }

   $(".genericitem").each(function (i, obj) {
         obj.addEventListener('dragstart', handleDragStart, false);
         obj.addEventListener('dragend', handleDragEnd, false);
       });

    var canvasContainer = document.getElementById("canvasContainer");

   canvasContainer.addEventListener('dragenter', handleDragEnter, false);
   canvasContainer.addEventListener('dragover', handleDragOver, false);
   canvasContainer.addEventListener('dragleave', handleDragLeave, false);
   canvasContainer.addEventListener('drop', handleDrop, false);

})( );

// Resize canvas and objects to specified width and height
function zoomCanvas(factorX,   canvas) {
 canvas.setZoom(factorX);
 canvas.setWidth(200);
 canvas.setHeight(200);
 return true;
}



function build_canvas_preview(){
$("#hiddencanvas").append("<canvas id='canvas2' ></canvas>");
canvas2 = new fabric.Canvas('canvas2');
canvas2.loadFromJSON(JSON.stringify(canvas_editor), function(){
canvas2.renderAll();
// build preview from 200 px x 200px
zoomCanvas(20000/canvas_editor.getWidth()/100,  canvas2);
});
}



function convertionTocm(cadena) {
    sizecm = [];
    valueHeight =  cadena[1].split("=");
    valueWidth  =  cadena[3].split("=");
    unitHeight  =  cadena[2].split("=");
    unitWidth   =  cadena[4].split("=");
    if ((unitHeight[1]).localeCompare("mm") == 0 && (unitWidth[1]).localeCompare("mm") == 0) {
        sizecm.push(valueHeight[1] / 10);
        sizecm.push((valueWidth[1] / 10));
    } else if ((unitHeight[1]).localeCompare("inch") == 0 && (unitWidth[1]).localeCompare("inch") == 0) {
        sizecm.push(valueHeight[1] * 2.54);
        sizecm.push(valueWidth[1] * 2.54);
    } else if ((unitHeight[1]).localeCompare("inch") == 0 && (unitWidth[1]).localeCompare("mm") == 0) {
        sizecm.push(valueHeight[1] * 2.54);
        sizecm.push((valueWidth[1] / 10));

    } else if ((unitHeight[1]).localeCompare("mm") == 0 && (unitWidth[1]).localeCompare("inch") == 0) {
        sizecm.push(valueHeight[1] / 10);
        sizecm.push(valueWidth[1] * 2.54);
    } else if ((unitHeight[1]).localeCompare("cm") == 0 && (unitWidth[1]).localeCompare("inch") == 0) {
        sizecm.push(valueHeight[1]);
        sizecm.push(valueWidth[1] * 2.54);
    } else if ((unitHeight[1]).localeCompare("inch") == 0 && (unitWidth[1]).localeCompare("cm") == 0) {
        sizecm.push(valueHeight[1] * 2.54);
        sizecm.push(valueWidth[1]);
    } else if ((unitHeight[1]).localeCompare("cm") == 0 && (unitWidth[1]).localeCompare("mm") == 0) {
        sizecm.push(valueHeight[1]);
        sizecm.push((valueWidth[1] / 10));
    } else if ((unitHeight[1]).localeCompare("mm") == 0 && (unitWidth[1]).localeCompare("cm") == 0) {
        sizecm.push(valueHeight[1] / 10);
        sizecm.push(valueWidth[1]);

    } else {
        sizecm.push(valueHeight[1]);
        sizecm.push(valueWidth[1]);

    }
    return sizecm;
}

function cmToPixel(cadena){
 sizeInPixel= [];
 sizeInPixel.push(cadena[0]*38);
 sizeInPixel.push(cadena[1]*38);
 return sizeInPixel;
}

$(document).ready(function () {
 $("#id_recipient_size").on('change', function(){

 select = $(this);
 selectedOption = select.find("option:selected").text();
 comboBoxText=selectedOption.split(",");
 x=convertionTocm(comboBoxText);
 values=cmToPixel(x);
 HeightPix=values[0];
 WidthPix=values[1];
 y=setSize(WidthPix,HeightPix);
Width2=y[0];
height2=y[1];
setNewCanvas(Width2,height2);

 });


function setSize(widthP,heightP){
sizeMaximum= [];
originalWidth= canvas_editor.getWidth();
originalHeight= canvas_editor.getHeight();
if(widthP<originalWidth){
    sizeMaximum.push(widthP+(originalWidth-widthP))
}
if(heightP<originalHeight){
    sizeMaximum.push(heightP+(originalHeight-heightP))
}
if(widthP>originalWidth){
    sizeMaximum.push(widthP -(widthP-originalWidth))
}
if(heightP>originalHeight){
    sizeMaximum.push(heightP -(heightP-originalHeight))
}
else{
    sizeMaximum.push(widthP);
    sizeMaximum.push(heightP);
}
return sizeMaximum;
}

function setNewCanvas(widthP,heightP){
    margen = 0.02;
    margenw = widthP*margen;
    margenh = heightP*margen;
    canvas_editor.getObjects()[0].top=margenw;
     canvas_editor.getObjects()[0].left=margenh;
     canvas_editor.getObjects()[0].width=widthP-margenh;
     canvas_editor.getObjects()[0].height=heightP -margenw;
     canvas_editor.getObjects()[0].center();
     canvas_editor.renderAll();
    
    }

$("#editor_save").on('click', function(){
//$("#hiddencanvas").removeClass("hidden");
//$("#hiddencanvas").removeClass("hide");
 $("#id_json_representation").val(JSON.stringify(canvas_editor));
 $("#id_preview").val(20000/canvas_editor.getWidth()/100);
  document.getElementById("sgaform").submit();
//  $("#id_preview").val(canvas_editor.toDataURL('png'));
// $("#sgaform").submit();
});

$("#id_dangerindication_on_deck").bind('added', function() {
 var obj = $("#id_dangerindication_on_deck .tag");
 obj.attr('draggable', 'True');
 obj[0].addEventListener('dragstart', handleDragStart, false);
 obj[0].addEventListener('dragend', handleDragEnd, false);

 var obj = $("#id_dangerindication_on_deck .tagcode");
 obj.attr('draggable', 'True');
 obj[0].addEventListener('dragstart', handleDragStart, false);
 obj[0].addEventListener('dragend', handleDragEnd, false);

});

$("#id_prudenceadvice_on_deck").bind('added', function() {

 var obj = $("#id_prudenceadvice_on_deck .tag");
 obj.attr('draggable', 'True');
 obj[0].addEventListener('dragstart', handleDragStart, false);
 obj[0].addEventListener('dragend', handleDragEnd, false);

 var obj = $("#id_prudenceadvice_on_deck .tagcode");
 obj.attr('draggable', 'True');
 obj[0].addEventListener('dragstart', handleDragStart, false);
 obj[0].addEventListener('dragend', handleDragEnd, false);
});


 var height = $(".canvas-container").height();
 if (height < 400){
     height = 400;
 }
 var width = $(".canvas-container").width();
 if(width < 400 ){
     width = 400;
 }
 canvas_editor.setHeight(height);
 canvas_editor.setWidth(width);

 $("#text-font-size").on('change', function(){
     $("#font-size-label").text( $("#text-font-size").val());
 });

if($("#id_json_representation").val() != ""){
 canvas_editor.loadFromJSON($("#id_json_representation").val(), function(){
   canvas_editor.renderAll();
 });
}
else {

originalWidth= canvas_editor.getWidth();
originalHeight= canvas_editor.getHeight();
 var fabricObject = new fabric.Rect({

 top: 0, left: 0, width:originalWidth , height:originalHeight , fill: '#fff' });
 fabricObject.selectable=false;
 canvas_editor.setBackgroundColor('#dcdcdc');
 canvas_editor.add(fabricObject);
}

});

function deleteSelectedObj(){
 canvas_editor.remove(canvas_editor.getActiveObject());

}

function addLine(){
 canvas_editor.add(new fabric.Line([ 0, 0, 200, 0], {
   left: 20,
   top: 30,
   stroke: $('#colorfill').val()
 }));
}