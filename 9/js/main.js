/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	__webpack_require__(1);
	__webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	(function() {
	  /**
	   * @constructor
	   * @param {string} image
	   */
	  var Resizer = function(image) {
	    // Изображение, с которым будет вестись работа.
	    this._image = new Image();
	    this._image.src = image;
	
	    // Холст.
	    this._container = document.createElement('canvas');
	    this._ctx = this._container.getContext('2d');
	
	    // Создаем холст только после загрузки изображения.
	    this._image.onload = function() {
	      // Размер холста равен размеру загруженного изображения. Это нужно
	      // для удобства работы с координатами.
	      this._container.width = this._image.naturalWidth;
	      this._container.height = this._image.naturalHeight;
	
	      /**
	       * Предлагаемый размер кадра в виде коэффициента относительно меньшей
	       * стороны изображения.
	       * @const
	       * @type {number}
	       */
	      var INITIAL_SIDE_RATIO = 0.75;
	
	      // Размер меньшей стороны изображения.
	      var side = Math.min(
	          this._container.width * INITIAL_SIDE_RATIO,
	          this._container.height * INITIAL_SIDE_RATIO);
	
	      // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
	      // от размера меньшей стороны.
	      this._resizeConstraint = new Square(
	          this._container.width / 2 - side / 2,
	          this._container.height / 2 - side / 2,
	          side);
	
	      // Отрисовка изначального состояния канваса.
	      this.setConstraint();
	    }.bind(this);
	
	    // Фиксирование контекста обработчиков.
	    this._onDragStart = this._onDragStart.bind(this);
	    this._onDragEnd = this._onDragEnd.bind(this);
	    this._onDrag = this._onDrag.bind(this);
	  };
	
	  Resizer.prototype = {
	    /**
	     * Родительский элемент канваса.
	     * @type {Element}
	     * @private
	     */
	    _element: null,
	
	    /**
	     * Положение курсора в момент перетаскивания. От положения курсора
	     * рассчитывается смещение на которое нужно переместить изображение
	     * за каждую итерацию перетаскивания.
	     * @type {Coordinate}
	     * @private
	     */
	    _cursorPosition: null,
	
	    /**
	     * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
	     * от верхнего левого угла исходного изображения.
	     * @type {Square}
	     * @private
	     */
	    _resizeConstraint: null,
	
	    /**
	     * Отрисовка канваса.
	     */
	    redraw: function() {
	      // Очистка изображения.
	      this._ctx.clearRect(0, 0, this._container.width, this._container.height);
	
	      // Параметры линии.
	      // NB! Такие параметры сохраняются на время всего процесса отрисовки
	      // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
	      // чего-либо с другой обводкой.
	
	      // Толщина линии.
	      this._ctx.lineWidth = 6;
	      // Цвет обводки.
	      this._ctx.strokeStyle = '#ffe753';
	      // Размер штрихов. Первый элемент массива задает длину штриха, второй
	      // расстояние между соседними штрихами.
	      this._ctx.setLineDash([15, 10]);
	      // Смещение первого штриха от начала линии.
	      this._ctx.lineDashOffset = 7;
	
	      // Сохранение состояния канваса.
	      this._ctx.save();
	
	      // Установка начальной точки системы координат в центр холста.
	      this._ctx.translate(this._container.width / 2, this._container.height / 2);
	
	      var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
	      var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
	      // Отрисовка изображения на холсте. Параметры задают изображение, которое
	      // нужно отрисовать и координаты его верхнего левого угла.
	      // Координаты задаются от центра холста.
	      this._ctx.drawImage(this._image, displX, displY);
	
	      // Отрисовка прямоугольника, обозначающего область изображения после
	      // кадрирования. Координаты задаются от центра.
	      this._ctx.strokeRect(
	          (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	          (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2,
	          this._resizeConstraint.side - this._ctx.lineWidth / 2,
	          this._resizeConstraint.side - this._ctx.lineWidth / 2);
	
	      // Отрисовка черного слоя с прозрачностью 80% вокруг желтой рамки
	      this._ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
	      this._ctx.beginPath();
	      this._ctx.moveTo(-this._image.naturalWidth / 2, this._image.naturalHeight / 2);
	      this._ctx.lineTo(this._image.naturalWidth / 2, this._image.naturalHeight / 2);
	      this._ctx.lineTo(this._image.naturalWidth / 2, -this._image.naturalHeight / 2);
	      this._ctx.lineTo(-this._image.naturalWidth / 2, -this._image.naturalHeight / 2);
	      this._ctx.moveTo((-this._resizeConstraint.side / 2) - this._ctx.lineWidth, (-this._resizeConstraint.side / 2) - this._ctx.lineWidth);
	      this._ctx.lineTo(this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2, -(this._resizeConstraint.side / 2) - this._ctx.lineWidth);
	      this._ctx.lineTo(this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2, (this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2);
	      this._ctx.lineTo((-this._resizeConstraint.side / 2) - this._ctx.lineWidth, (this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2);
	      this._ctx.fill('evenodd');
	
	      //Вывод размера кадрируемого изображения
	      this._ctx.font = '18px serif';
	      this._ctx.fillStyle = 'white';
	      this._ctx.textAlign = 'center';
	      this._ctx.fillStyle = 'rgba(255, 255, 255)';
	      this._ctx.fillText(this._image.naturalWidth + 'x' + this._image.naturalHeight, 0, (-this._resizeConstraint.side / 2) - this._ctx.lineWidth - 10);
	
	      // Восстановление состояния канваса, которое было до вызова ctx.save
	      // и последующего изменения системы координат. Нужно для того, чтобы
	      // следующий кадр рисовался с привычной системой координат, где точка
	      // 0 0 находится в левом верхнем углу холста, в противном случае
	      // некорректно сработает даже очистка холста или нужно будет использовать
	      // сложные рассчеты для координат прямоугольника, который нужно очистить.
	      this._ctx.restore();
	    },
	
	    /**
	     * Включение режима перемещения. Запоминается текущее положение курсора,
	     * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
	     * позволяющие перерисовывать изображение по мере перетаскивания.
	     * @param {number} x
	     * @param {number} y
	     * @private
	     */
	    _enterDragMode: function(x, y) {
	      this._cursorPosition = new Coordinate(x, y);
	      document.body.addEventListener('mousemove', this._onDrag);
	      document.body.addEventListener('mouseup', this._onDragEnd);
	    },
	
	    /**
	     * Выключение режима перемещения.
	     * @private
	     */
	    _exitDragMode: function() {
	      this._cursorPosition = null;
	      document.body.removeEventListener('mousemove', this._onDrag);
	      document.body.removeEventListener('mouseup', this._onDragEnd);
	    },
	
	    /**
	     * Перемещение изображения относительно кадра.
	     * @param {number} x
	     * @param {number} y
	     * @private
	     */
	    updatePosition: function(x, y) {
	      this.moveConstraint(
	          this._cursorPosition.x - x,
	          this._cursorPosition.y - y);
	      this._cursorPosition = new Coordinate(x, y);
	    },
	
	    /**
	     * @param {MouseEvent} evt
	     * @private
	     */
	    _onDragStart: function(evt) {
	      this._enterDragMode(evt.clientX, evt.clientY);
	    },
	
	    /**
	     * Обработчик окончания перетаскивания.
	     * @private
	     */
	    _onDragEnd: function() {
	      this._exitDragMode();
	    },
	
	    /**
	     * Обработчик события перетаскивания.
	     * @param {MouseEvent} evt
	     * @private
	     */
	    _onDrag: function(evt) {
	      this.updatePosition(evt.clientX, evt.clientY);
	    },
	
	    /**
	     * Добавление элемента в DOM.
	     * @param {Element} element
	     */
	    setElement: function(element) {
	      if (this._element === element) {
	        return;
	      }
	
	      this._element = element;
	      this._element.insertBefore(this._container, this._element.firstChild);
	      // Обработчики начала и конца перетаскивания.
	      this._container.addEventListener('mousedown', this._onDragStart);
	    },
	
	    /**
	     * Возвращает кадрирование элемента.
	     * @return {Square}
	     */
	    getConstraint: function() {
	      return this._resizeConstraint;
	    },
	
	    /**
	     * Смещает кадрирование на значение указанное в параметрах.
	     * @param {number} deltaX
	     * @param {number} deltaY
	     * @param {number} deltaSide
	     */
	    moveConstraint: function(deltaX, deltaY, deltaSide) {
	      this.setConstraint(
	          this._resizeConstraint.x + (deltaX || 0),
	          this._resizeConstraint.y + (deltaY || 0),
	          this._resizeConstraint.side + (deltaSide || 0));
	    },
	
	    /**
	     * @param {number} x
	     * @param {number} y
	     * @param {number} side
	     */
	    setConstraint: function(x, y, side) {
	      if (typeof x !== 'undefined') {
	        this._resizeConstraint.x = x;
	      }
	
	      if (typeof y !== 'undefined') {
	        this._resizeConstraint.y = y;
	      }
	
	      if (typeof side !== 'undefined') {
	        this._resizeConstraint.side = side;
	      }
	
	      requestAnimationFrame(function() {
	        this.redraw();
	        window.dispatchEvent(new CustomEvent('resizerchange'));
	      }.bind(this));
	    },
	
	    /**
	     * Удаление. Убирает контейнер из родительского элемента, убирает
	     * все обработчики событий и убирает ссылки.
	     */
	    remove: function() {
	      this._element.removeChild(this._container);
	
	      this._container.removeEventListener('mousedown', this._onDragStart);
	      this._container = null;
	    },
	
	    /**
	     * Экспорт обрезанного изображения как HTMLImageElement и исходником
	     * картинки в src в формате dataURL.
	     * @return {Image}
	     */
	    exportImage: function() {
	      // Создаем Image, с размерами, указанными при кадрировании.
	      var imageToExport = new Image();
	
	      // Создается новый canvas, по размерам совпадающий с кадрированным
	      // изображением, в него добавляется изображение взятое из канваса
	      // с измененными координатами и сохраняется в dataURL, с помощью метода
	      // toDataURL. Полученный исходный код, записывается в src у ранее
	      // созданного изображения.
	      var temporaryCanvas = document.createElement('canvas');
	      var temporaryCtx = temporaryCanvas.getContext('2d');
	      temporaryCanvas.width = this._resizeConstraint.side;
	      temporaryCanvas.height = this._resizeConstraint.side;
	      temporaryCtx.drawImage(this._image,
	          -this._resizeConstraint.x,
	          -this._resizeConstraint.y);
	      imageToExport.src = temporaryCanvas.toDataURL('image/png');
	
	      return imageToExport;
	    }
	  };
	
	  /**
	   * Вспомогательный тип, описывающий квадрат.
	   * @constructor
	   * @param {number} x
	   * @param {number} y
	   * @param {number} side
	   * @private
	   */
	  var Square = function(x, y, side) {
	    this.x = x;
	    this.y = y;
	    this.side = side;
	  };
	
	  /**
	   * Вспомогательный тип, описывающий координату.
	   * @constructor
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  var Coordinate = function(x, y) {
	    this.x = x;
	    this.y = y;
	  };
	
	  window.Resizer = Resizer;
	})();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* global Resizer: true */
	
	/**
	 * @fileoverview
	 * @author Igor Alexeenko (o0)
	 */
	
	'use strict';
	
	(function() {
	  /** @enum {string} */
	  var FileType = {
	    'GIF': '',
	    'JPEG': '',
	    'PNG': '',
	    'SVG+XML': ''
	  };
	
	  /** @enum {number} */
	  var Action = {
	    ERROR: 0,
	    UPLOADING: 1,
	    CUSTOM: 2
	  };
	
	  /**
	   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
	   * из ключей FileType.
	   * @type {RegExp}
	   */
	  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');
	
	  /**
	   * @type {Object.<string, string>}
	   */
	  var filterMap;
	
	  /**
	   * Объект, который занимается кадрированием изображения.
	   * @type {Resizer}
	   */
	  var currentResizer;
	  //переменная cookies, хранящая в качестве зависимости библиотеку browser-cookies
	  var browserCookies = __webpack_require__(3);
	
	  /**
	   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
	   * изображением.
	   */
	  function cleanupResizer() {
	    if (currentResizer) {
	      currentResizer.remove();
	      currentResizer = null;
	    }
	  }
	
	  /**
	   * Ставит одну из трех случайных картинок на фон формы загрузки.
	   */
	  function updateBackground() {
	    var images = [
	      'img/logo-background-1.jpg',
	      'img/logo-background-2.jpg',
	      'img/logo-background-3.jpg'
	    ];
	
	    var backgroundElement = document.querySelector('.upload');
	    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
	    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
	  }
	
	  /**
	   * Проверяет, валидны ли данные, в форме кадрирования.
	   * @return {boolean}
	   */
	  var resizerX = document.querySelector('#resize-x');
	  var resizerY = document.querySelector('#resize-y');
	  var resizerSize = document.querySelector('#resize-size');
	  var resizerFwd = document.querySelector('#resize-fwd');
	  var resizerFields = document.querySelectorAll('.upload-resize-controls > input');
	
	  var setResizerConstraint = function() {
	    if ((+resizerX.value + +resizerSize.value) > currentResizer._image.naturalWidth || (+resizerY.value + +resizerSize.value) > currentResizer._image.naturalHeight || resizerX < 0 || resizerY < 0) {
	      resizerFwd.setAttribute('disabled', '');
	    } else {
	      resizerFwd.removeAttribute('disabled');
	    }
	  };
	
	  resizerX.min = 0;
	  resizerX.value = 0;
	  resizerY.min = 0;
	  resizerY.value = 0;
	  resizerSize.min = 50;
	  resizerSize.value = 50;
	
	  for (var m = resizerFields.length - 1; m >= 0; m--) {
	    resizerFields[m].addEventListener('input', function() {
	      setResizerConstraint();
	    } );
	  }
	
	  function resizeFormIsValid() {
	    return true;
	  }
	
	  /**
	   * Форма загрузки изображения.
	   * @type {HTMLFormElement}
	   */
	  var uploadForm = document.forms['upload-select-image'];
	
	  /**
	   * Форма кадрирования изображения.
	   * @type {HTMLFormElement}
	   */
	  var resizeForm = document.forms['upload-resize'];
	
	  /**
	   * Форма добавления фильтра.
	   * @type {HTMLFormElement}
	   */
	  var filterForm = document.forms['upload-filter'];
	
	  /**
	   * @type {HTMLImageElement}
	   */
	  var filterImage = filterForm.querySelector('.filter-image-preview');
	
	  /**
	   * @type {HTMLElement}
	   */
	  var uploadMessage = document.querySelector('.upload-message');
	
	  /**
	   * @param {Action} action
	   * @param {string=} message
	   * @return {Element}
	   */
	  function showMessage(action, message) {
	    var isError = false;
	
	    switch (action) {
	      case Action.UPLOADING:
	        message = message || 'Кексограмим&hellip;';
	        break;
	
	      case Action.ERROR:
	        isError = true;
	        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
	        break;
	    }
	
	    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
	    uploadMessage.classList.remove('invisible');
	    uploadMessage.classList.toggle('upload-message-error', isError);
	    return uploadMessage;
	  }
	
	  function hideMessage() {
	    uploadMessage.classList.add('invisible');
	  }
	
	  /**
	   * Обработчик изменения изображения в форме загрузки. Если загруженный
	   * файл является изображением, считывается исходник картинки, создается
	   * Resizer с загруженной картинкой, добавляется в форму кадрирования
	   * и показывается форма кадрирования.
	   * @param {Event} evt
	   */
	  uploadForm.onchange = function(evt) {
	    var element = evt.target;
	    if (element.id === 'upload-file') {
	      // Проверка типа загружаемого файла, тип должен быть изображением
	      // одного из форматов: JPEG, PNG, GIF или SVG.
	      if (fileRegExp.test(element.files[0].type)) {
	        var fileReader = new FileReader();
	
	        showMessage(Action.UPLOADING);
	
	        fileReader.onload = function() {
	          cleanupResizer();
	
	          currentResizer = new Resizer(fileReader.result);
	          currentResizer.setElement(resizeForm);
	          uploadMessage.classList.add('invisible');
	
	          uploadForm.classList.add('invisible');
	          resizeForm.classList.remove('invisible');
	
	          hideMessage();
	        };
	
	        fileReader.readAsDataURL(element.files[0]);
	      } else {
	        // Показ сообщения об ошибке, если формат загружаемого файла не поддерживается
	        showMessage(Action.ERROR);
	      }
	    }
	  };
	
	  /**
	   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
	   * и обновляет фон.
	   * @param {Event} evt
	   */
	  resizeForm.onreset = function(evt) {
	    evt.preventDefault();
	
	    cleanupResizer();
	    updateBackground();
	
	    resizeForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');
	  };
	
	  /**
	   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
	   * кропнутое изображение в форму добавления фильтра и показывает ее.
	   * @param {Event} evt
	   */
	  resizeForm.onsubmit = function(evt) {
	    evt.preventDefault();
	
	    if (resizeFormIsValid()) {
	      var image = currentResizer.exportImage().src;
	
	      var thumbnails = filterForm.querySelectorAll('.upload-filter-preview');
	      for (var i = 0; i < thumbnails.length; i++) {
	        thumbnails[i].style.backgroundImage = 'url(' + image + ')';
	      }
	
	      filterImage.src = image;
	
	      resizeForm.classList.add('invisible');
	      filterForm.classList.remove('invisible');
	    }
	  };
	
	  /**
	   * Сброс формы фильтра. Показывает форму кадрирования.
	   * @param {Event} evt
	   */
	  filterForm.onreset = function(evt) {
	    evt.preventDefault();
	
	    filterForm.classList.add('invisible');
	    resizeForm.classList.remove('invisible');
	  };
	
	  /**
	   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
	   * записав сохраненный фильтр в cookie.
	   * @param {Event} evt
	   */
	  filterForm.onsubmit = function(evt) {
	    evt.preventDefault();
	
	    cleanupResizer();
	    updateBackground();
	
	    filterForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');
	  };
	
	  /**
	   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
	   * выбранному значению в форме.
	   */
	  filterForm.onchange = function() {
	    if (!filterMap) {
	      // Ленивая инициализация. Объект не создается до тех пор, пока
	      // не понадобится прочитать его в первый раз, а после этого запоминается
	      // навсегда.
	      filterMap = {
	        'none': 'filter-none',
	        'chrome': 'filter-chrome',
	        'sepia': 'filter-sepia',
	        'marvin': 'filter-marvin'
	      };
	    }
	
	    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
	      return item.checked;
	    })[0].value;
	
	    //Установка срока жизни cookie - количество дней с последнего прошедшего дня рождения Грейс Хоппер - 9 декабря.
	    var today = new Date();
	    var dateofGraceBirthday = new Date(today.getFullYear(), 11, 9);
	    //Если текущая дата меньше даты дня рождения Грейс Хоппер, за остчет принимается предыдущий год.
	    if ((today - dateofGraceBirthday) < 0) {
	      dateofGraceBirthday.setFullYear(today.getFullYear() - 1);
	    }
	    var cookiesExpires = (today - dateofGraceBirthday) / 1000 / 3600 / 24;
	    browserCookies.set('upload-filter', selectedFilter, {expires: cookiesExpires});
	    // Класс перезаписывается, а не обновляется через classList потому что нужно
	    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
	    // состояние или просто перезаписывать.
	    filterImage.className = 'filter-image-preview ' + filterMap[selectedFilter];
	  };
	
	  //Выбор фильтра, записанного в cookies в качестве фильтра по умолчанию.
	  var defaultFilter = browserCookies.get('upload-filter');
	  if (defaultFilter !== null) {
	    document.querySelector('#upload-filter-' + defaultFilter).click();
	  }
	  cleanupResizer();
	  updateBackground();
	})();


/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.defaults = {};
	
	exports.set = function(name, value, options) {
	  // Retrieve options and defaults
	  var opts = options || {};
	  var defaults = exports.defaults;
	
	  // Apply default value for unspecified options
	  var expires  = opts.expires || defaults.expires;
	  var domain   = opts.domain  || defaults.domain;
	  var path     = opts.path     != undefined ? opts.path     : (defaults.path != undefined ? defaults.path : '/');
	  var secure   = opts.secure   != undefined ? opts.secure   : defaults.secure;
	  var httponly = opts.httponly != undefined ? opts.httponly : defaults.httponly;
	
	  // Determine cookie expiration date
	  // If succesful the result will be a valid Date, otherwise it will be an invalid Date or false(ish)
	  var expDate = expires ? new Date(
	      // in case expires is an integer, it should specify the number of days till the cookie expires
	      typeof expires == 'number' ? new Date().getTime() + (expires * 864e5) :
	      // else expires should be either a Date object or in a format recognized by Date.parse()
	      expires
	  ) : '';
	
	  // Set cookie
	  document.cookie = name.replace(/[^+#$&^`|]/g, encodeURIComponent)                // Encode cookie name
	  .replace('(', '%28')
	  .replace(')', '%29') +
	  '=' + value.replace(/[^+#$&/:<-\[\]-}]/g, encodeURIComponent) +                  // Encode cookie value (RFC6265)
	  (expDate && expDate.getTime() >= 0 ? ';expires=' + expDate.toUTCString() : '') + // Add expiration date
	  (domain   ? ';domain=' + domain : '') +                                          // Add domain
	  (path     ? ';path='   + path   : '') +                                          // Add path
	  (secure   ? ';secure'           : '') +                                          // Add secure option
	  (httponly ? ';httponly'         : '');                                           // Add httponly option
	};
	
	exports.get = function(name) {
	  var cookies = document.cookie.split(';');
	
	  // Iterate all cookies
	  for(var i = 0; i < cookies.length; i++) {
	    var cookie = cookies[i];
	    var cookieLength = cookie.length;
	
	    // Determine separator index ("name=value")
	    var separatorIndex = cookie.indexOf('=');
	
	    // IE<11 emits the equal sign when the cookie value is empty
	    separatorIndex = separatorIndex < 0 ? cookieLength : separatorIndex;
	
	    // Decode the cookie name and remove any leading/trailing spaces, then compare to the requested cookie name
	    if (decodeURIComponent(cookie.substring(0, separatorIndex).replace(/^\s+|\s+$/g, '')) == name) {
	      return decodeURIComponent(cookie.substring(separatorIndex + 1, cookieLength));
	    }
	  }
	
	  return null;
	};
	
	exports.erase = function(name, options) {
	  exports.set(name, '', {
	    expires:  -1,
	    domain:   options && options.domain,
	    path:     options && options.path,
	    secure:   0,
	    httponly: 0}
	  );
	};


/***/ }
/******/ ]);
//# sourceMappingURL=main.js.map