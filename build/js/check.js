"use strict";
 function getMessage(a, b) {
  var amountOfRedPoints = 0;
  var artifactsSquare = 0;
  var i;
    if (typeof a == 'number') {
      return("Переданное SVG-изображение содержит " + a + " объектов и " + b * 4 + " атрибутов" );
    }
    if (a == true) {
      return( "Переданное GIF-изображение анимировано и содержит " + b + " кадров" );
    }
    if (a == false) {
      return( "Переданное GIF-изображение не анимировано" );
    }
    if (typeof a == 'object' && typeof b != 'object') {
      for (i = 0 ; i < a.length; i++) {
        amountOfRedPoints += a[i];
      }
      return( "Количество красных точек во всех строчках изображения: " + amountOfRedPoints );
      }
    if (a instanceof Array && a instanceof Object && b instanceof Object && b instanceof Array) {
      for (i = 0; i < a.length; i++) {
        artifactsSquare  += a[i]*b[i];
      }
      return( "Общая площадь артефактов сжатия: " + [artifactsSquare] + " пикселей" );
    }
 }
 
