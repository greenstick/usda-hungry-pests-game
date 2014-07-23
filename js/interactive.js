(function () {

/*
Snap Scroller - Dependencies: jQuery, jQuerys.scrollTo, & Modernizr (optional for mobile)
*/

	var Snapscroller = function (args) {
		var snap 					= this;
			snap.element 			= args.element,
			snap.parent 			= args.parent,
			snap.easing 			= args.easing 				|| 		"linear",
			snap.duration 			= args.duration 			|| 		600,
			snap.first 				= 'snapscroller-first',
			snap.current 			= 'snapscroller-current',
			snap.last 				= 'snapscroller-last',
			// snap.mobile 			= (typeof Modernizr !== 'undefined') ? ((Modernizr.touch) ? true : false) : false,
			snap.scrolling 			= false,
			snap.enabled 			= true,
			snap.startPosition,
			snap.delta;
	};

	//Determines Whether to Bind Scroll Handler to Touch Events or Desktop Scroll
	// Snapscroller.prototype.init  				= function () {
	// 	var snap = this;
	// 	$(snap.element).first().addClass(snap.first).addClass(snap.current);
	// 	$(snap.element).last().addClass(snap.last);
	// 	if (snap.mobile === true) {
	// 		$(snap.element).on("touchstart", function (e) {
	// 			snap.touchStart(e);
	// 		});
	// 		$(snap.element).on("touchmove", function (e) {
	// 			snap.touchMoveY(e);
	// 		});
	// 	} else {
	// 		$(snap.element).on('mousewheel DOMMouseScroll MozMousePixelScroll wheel', function (e) {
	// 			snap.scrollDelta(e);
	// 		});
	// 	};
	// };

	Snapscroller.prototype.init 				= function () {
		var snap = this;
		$(snap.element).first().addClass(snap.first).addClass(snap.current);
		$(snap.element).last().addClass(snap.last);
	};

	//Set Scroll Delta
	Snapscroller.prototype.scrollDelta 			= function (e) {
		this.delta = 0;
		if (!e) e = window.event;
		if (e.originalEvent.wheelDelta) {
			this.delta = e.originalEvent.wheelDelta / 120;
		} else if (e.originalEvent.detail) {
			this.delta = - e.originalEvent.detail / 3;
		};
		if (this.delta && this.enabled === true) {
			e.preventDefault ? e.preventDefault() : e.returnValue = false;
			this.scrollDirectionY();
		};
	};

	//Set Touch Start Coordinates
	Snapscroller.prototype.touchStart 			= function (e) {
		var start = {x: 0, y: 0};
			start.x = e.originalEvent.pageX;
			start.y = e.originalEvent.pageY;
			this.startPosition = start;
	};

	//Binds touchmove Y Axis Event to Delta
	Snapscroller.prototype.touchMoveY 			= function (e) {
		var offset = {};
		offset.y = this.startPosition.y - e.originalEvent.pageY;
		this.delta = offset.y;
		if (Math.abs(this.delta) >= 10 && this.enabled === true) {
			e.preventDefault ? e.preventDefault() : e.returnValue = false;
			this.scrollDirectionY();
		};
	};

	//Determines direction to Scroll and Calls scrollPage Function
	Snapscroller.prototype.scrollDirectionY 	= function () {
		if (this.mobile === true) {
			if (this.scrolling === false) {
				if (this.delta > -1.25) {
					this.scrolling = true;
					this.scrollPageY('next');
				} else if (this.delta < 1.25) {
					this.scrolling = true;
					this.scrollPageY('prev');
				};
			};
		} else {
			if (this.scrolling === false) {
				if (this.delta <= -1) {
					this.scrolling = true;
					this.scrollPageY('next');
				} else if (this.delta >= 1) {
					this.scrolling = true;
					this.scrollPageY('prev');
				};
			};
		};
	};

	//Scrolls to Next or Previous Page
	Snapscroller.prototype.scrollPageY			= function (destination, callback) {
		var snap = this, id, callback = callback || null;
		//Next Page
		if (destination === 'next') {
			if ($('.' + snap.last).hasClass(snap.current)) {
				snap.scrolling = false;
				return;
			} else {
				$('.' + snap.current).removeClass(snap.current).next().addClass(snap.current);
				var navTimer = setTimeout(function () {
					snap.to("." + snap.current, snap.duration, callback);
				}, snap.duration);
			};
		//Previous Page
		} else if (destination === 'prev') {
			if ($('.' + snap.first).hasClass(snap.current)) {
				snap.scrolling = false;
				return;
			} else {
				$('.' + snap.current).removeClass(snap.current).prev().addClass(snap.current);
				var navTimer = setTimeout(function () {
					snap.to("." + snap.current, snap.duration, callback);
				}, snap.duration);
			};
		} else {
			return false;
		};
	};

	Snapscroller.prototype.to 					= function (loc, duration, callback) {
		var snap = this;
		$(snap.parent).scrollTo(loc, {
			duration: duration,
			axis: "y",
			easing: snap.easing,
			onAfter: function () {
				snap.scrolling = false;
				if (typeof callback === 'function') callback();
			}
		});
	};

/***************************************************************************************************/

/*
Item Prototype
*/

	var Item 		= function (args) {
		var item 				= this;
			item.element 		= args.id,
			item.quiz 			= args.quiz,
			item.vin 			= args.vin;
		return this;
	};

/***************************************************************************************************/

/*
Scene Prototype
*/

	var Scene 		= function (args) {
		var scene 				= this;
			scene.name 			= args.name,
			scene.index 		= args.index,
			scene.limit 		= args.limit,
			scene.scroll 		= args.scroll,
			scene.collector 	= args.collector,
			scene.progress 		= args.progress;
		return this;
	};

/***************************************************************************************************/

/*
Progress Bar
*/

	var Progress 	= function (args) {

	};

/***************************************************************************************************/

/*
Item Collector
*/

	var Collector 	= function (args) {
		var coll 				= this;
			coll.element 		= args.element,
			coll.items 			= ko.observableArray([]),
			coll.all 			= ko.observableArray([]);
	};

	Collector.prototype.clear 					= function () {
		var coll = this;
		for (var i = 0; i < coll.items().length; i++) {
			coll.all.push(coll.items()[i]);
		};
		console.log(coll.all());
		coll.items([]);
		console.log(coll.items());
	};

	Collector.prototype.add 					= function (id) {
		var coll = this;
		coll.items.push({item: id});
		console.log(coll.items());
	};

/***************************************************************************************************/

/*
Modal Prototype
*/

	var Modal 		= function (args) {
		var modal 				= this;
			modal.element 		= args.element,
			modal.mask 			= args.mask 		|| 	false, //optional
			modal.open 			= args.open,
			modal.close 		= args.close;
        return this;
	};

/*
Modal Methods
*/

    //Open Modal
	Modal.prototype.openModal   				= function () {
		var modal = this;
		if (this.mask !== false) $(modal.mask).fadeIn();
		$(modal.element).fadeIn();
	};

    //Close Modal
	Modal.prototype.closeModal  				= function () {
		var modal = this;
		if (this.mask !== false) $(modal.mask).fadeOut();
		$(modal.element).fadeOut();
	};

/***************************************************************************************************/

/*
Quiz
*/

	var Quiz 		= function (args) {
		var quiz 				= this;
			quiz.question 		= ko.observable(args.question),
			quiz.answer 		= ko.observableArray(args.answer);
	};

	Quiz.prototype.checkResponse 				= function () {
		var quiz = this;
	};

/***************************************************************************************************/

/*
Interactive Parent
*/

	var Interactive = function () {
		var Int 					= this;
			Int.wrapper 			= '#interactive-wrapper',
			Int.slider 				= '.viewport',
			Int.scene 				= '.scene',
			Int.subscene			= '.subscene',
			Int.interativeElement 	= '.interactive-element',
			Int.imgMask 			= '.img-mask',
			Int.mask 				= '.mask',
			Int.snapScroll 			= new Snapscroller({
				element 			: '.scene',
				parent 				: '.viewport',
				duration 			: 600
			}),
			Int.mobile 				= (typeof Modernizr !== 'undefined') ? ((Modernizr.touch) ? true : false) : false,
			Int.collector 			= new Collector({
				element 			: 'item-collector'
			}),
			Int.item 				= '.item',
			Int.itemSelectable 		= '.item.selectable',
			Int.items 				= {},
			Int.scenes 				= {},
			Int.sceneIndex 			= 0,
			Int.sceneName,
			Int.sceneLimit,
			Int.sceneScroll,
			Int.sceneCollector,
			Int.sceneProgress,
			Int.data;
	};

/*
Methods
*/

	//XHR JSON Data
	Interactive.prototype.getData  				= function (callback) {
		var Int = this;
		$.getJSON('js/data/interactive.json', function (res) {
			Int.data = res;
			if (typeof callback === 'function') callback();
		});
	};

	//Initializes Interactive Scenes
	Interactive.prototype.initScenes 			= function () {
		var Int = this;
		for (var i = 0; i < Int.data.length; i++) {
			var scene = new Scene({
				name 		: 	Int.data[i].scene,
				index 		: 	Int.data[i].index,
				limit 		: 	Int.data[i].limit,
				scroll 		: 	Int.data[i].scroll,
				collector 	: 	Int.data[i].collector,
				progress 	: 	Int.data[i].progress
			});
			Int.scenes[Int.data[i].scene] = scene;
		};
	};

	//Initializes Collectable Items
	Interactive.prototype.initItems 			= function () {
		var Int = this;
		for (var i = 0; i < Int.data.length; i++) {
			for (var j = 0; j < Int.data[i].item.length; j++) {
				var item = new Item({
					id 		: 	Int.data[i].item[j].id,
					quiz 	: 	Int.data[i].item[j].quiz,
					vin 	: 	Int.data[i].item[j].vin,
					pest 	: 	Int.data[i].item[j].pest,
					active 	: 	false
				});
				Int.items[Int.data[i].item[j].id] = item;
			}
		}
	};
	//Binds Snap Scroll Events 
	Interactive.prototype.bindSnapScroll 		= function () {
		var Int = this;
		if (Int.mobile === true) {
			$(Int.snapScroll.element).on("touchstart", function (e) {
				Int.snapScroll.touchStart(e);
			});
			$(Int.snapScroll.element).on("touchmove", function (e) {
				Int.snapScroll.touchMoveY(e);
			});
		} else {
			$(Int.snapScroll.element).on('mousewheel DOMMouseScroll MozMousePixelScroll wheel', function (e) {
				Int.snapScroll.scrollDelta(e);
			});
		};
	};

	//Item Selection
	Interactive.prototype.selectItem 			= function (id) {
		var Int = this;
		d3.select('#' + id).classed('selectable', false);
		Int.setState('fridge');
		if (Int.items[id].vin !== false) {
			Int.vinvasive(id);
		} else if (Int.items[id].quiz !== false) {
			Int.newQuiz(Int.items[id].quiz);
		} else {
			Int.collector.add(id);
			if (Int.sceneLimit === (Int.collector.items().length + 1)) {
				Int.sceneEnd();
			};
		};
	};

	//Vinvasive Popout
	Interactive.prototype.vinvasive 			= function (id) {
		var Int = this;
		console.log(Int.items[id].vin);
		Int.collector.add(id);
	};

	//Quiz
	Interactive.prototype.newQuiz 				= function (args) {
		var Int = this;
		new Quiz(args);
	};

	//Set State
	Interactive.prototype.setState 				= function (state) {
		var Int = this;
			$(Int.subscene).css('z-index', 0);
			$('.' + state).css('z-index', 100);
			$('.' + state + ' ' + Int.imgMask).fadeIn();
	};

	//Interactive Scene Start
	Interactive.prototype.sceneInit 			= function (scene) {
		var Int = this, scene = Int.scenes[scene];
			Int.sceneIndex 		= scene.index;
			Int.sceneScroll 	= scene.scroll;
			Int.sceneName 		= scene.scene;
			Int.sceneLimit 		= scene.limit;
			Int.sceneCollector 	= scene.collector;
			Int.sceneProgress 	= scene.progress;
	};

	//Interactive Scene End
	Interactive.prototype.sceneEnd 				= function (scene) {
		var Int = this;
		for (var i = 0; i < Int.data.length; i++) {
			if (Int.data[i].index === (Int.sceneIndex + 1)) {
				Int.sceneInit(Int.data[i].scene);
				Int.nextScene();
				console.log(Int.data[i].scene);
			};
		}
	};

/*
Macros
*/

	//Initialize Macro
	Interactive.prototype.init 					= function () {
		var Int = this;
		Int.getData(function () {
			Int.initItems();
			Int.initScenes();
			Int.snapScroll.init();
			Int.snapScroll.enabled = false;
			Int.bindSnapScroll();
			Int.sceneInit('opening');
			ko.applyBindings(Int.collector, document.getElementById(Int.collector.item));
		});
	};
	//Next Scene Macro
	Interactive.prototype.nextScene 			= function (scrolling) {
		var Int = this;
		Int.snapScroll.enabled = true;
		if (scrolling !== true) Int.snapScroll.scrollPageY("next", function () {
			Int.snapScroll.enabled = false;
		});
	};
	//Previous Scene Macro
	Interactive.prototype.prevScene 			= function (scrolling) {
		var Int = this;
		Int.snapScroll.enabled = true;
		if (scrolling !== true) Int.snapScroll.scrollPageY("prev");
	};

/*
Instantiate & Initialize
*/

	var interactive = new Interactive();
		interactive.init();

/*
Bind Item Events
*/

	$(interactive.wrapper + " " + interactive.itemSelectable).on("click", function (e) {
		var id = e.currentTarget.id;
		interactive.selectItem(id);
	});

/*
Bind Scroll Events
*/

	//Sets Interactive as Focus For Keypress Events
	$(interactive.wrapper).on("mouseover", function () {
		$(this).focus();
	});

	//Arrow Up & Down Navigation
	$(interactive.wrapper).on('keydown', function (e) {
		if (e.keyCode === 40) (e.preventDefault(), interactive.nextScene());
    	if (e.keyCode === 38) (e.preventDefault(), interactive.prevScene());
	});
	//Click to Start
	$('#opening .begin').on("click", function (e) {
		interactive.nextScene();
	});

}(jQuery, d3, ko))