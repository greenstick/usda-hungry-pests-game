(function () {

/*
Snap Scroller - Dependencies: jQuery, jQuerys.scrollTo, & Modernizr (optional for mobile)
*/

	var Snapscroller = function (args) {
		var snap 					= 	this;
			snap.element 			= 	args.element,
			snap.parent 			= 	args.parent,
			snap.easing 			= 	args.easing 			|| 		"linear",
			snap.duration 			= 	args.duration 			|| 		600,
			snap.first 				= 	'snapscroller-first',
			snap.current 			= 	'snapscroller-current',
			snap.last 				= 	'snapscroller-last',
			snap.mobile 			= 	(typeof Modernizr !== 'undefined') ? ((Modernizr.touch) ? true : false) : false,
			snap.scrolling 			= 	false,
			snap.startPosition,
			snap.delta;
	};

	//Determines Whether to Bind Scroll Handler to Touch Events or Desktop Scroll
	Snapscroller.prototype.init  				= function () {
		var snap = this;
		$(snap.element).first().addClass(snap.first).addClass(snap.current);
		$(snap.element).last().addClass(snap.last);
		if (snap.mobile === true) {
			$(snap.element).on("touchstart", function (e) {
				snap.touchStart(e);
			});
			$(snap.element).on("touchmove", function (e) {
				snap.touchMoveY(e);
			});
		} else {
			$(snap.element).on('mousewheel DOMMouseScroll MozMousePixelScroll wheel', function (e) {
				snap.scrollDelta(e);
			});
		};
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
		if (this.delta) {
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
		if (Math.abs(this.delta) >= 10) {
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
	Snapscroller.prototype.scrollPageY			= function (destination) {
		var snap = this, id;
		//Next Page
		if (destination === 'next') {
			if ($('.' + snap.last).hasClass(snap.current)) {
				snap.scrolling = false;
				return;
			} else {
				$('.' + snap.current).removeClass(snap.current).next().addClass(snap.current);
				var navTimer = setTimeout(function () {
					snap.to("." + snap.current, snap.duration);
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
					snap.to("." + snap.current, snap.duration);
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
			coll.array 			= ko.observableArray([]);
	};

	Collector.prototype.add 					= function (id) {
		var coll = this;
		coll.array.push(id);
		console.log(coll.array());
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
Interactive Parent
*/

	var Interactive = function () {
		var Int = this;
			Int.wrapper 	= 	'#interactive-wrapper',
			Int.slider 		= 	'.viewport',
			Int.scene 		= 	'.scene',
			Int.snapScroll 	= 	new Snapscroller({
				element 	: 	".scene",
				parent 		: 	".viewport",
				duration 	: 	600
			}),
			Int.collector 	= 	new Collector({

			}),
			Int.item 		= 	'.item',
			Int.items 		= 	[],
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

	//Receives Scene Value as Param and Initializes Items for Scene
	Interactive.prototype.initItems 			= function (scene) {
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

	//Item Selection
	Interactive.prototype.selectItem 			= function (id) {
		var Int = this;
		if (Int.items[id].vin !== false) {
			Int.vinvasive(id);
		} else if (Int.items[id].quiz !== false) {
			Int.quiz(id);
		} else {
			Int.collector.add(id);
		};
	};

	//Vinvasive Popout
	Interactive.prototype.vinvasive 			= function (id) {
		var Int = this;
		console.log(Int.items[id].vin);
		Int.collector.add(id);
	};

	//Quiz
	Interactive.prototype.quiz 					= function (id) {
		var Int = this;
		console.log(Int.items[id].quiz);
		Int.collector.add(id);
	};

/*
Macros
*/

	Interactive.prototype.init 					= function () {
		var Int = this;
		Int.getData(function () {
			Int.initItems();
			Int.snapScroll.init();
		});
	};

/*
Instantiate & Initialize
*/

	var interactive = new Interactive();
		interactive.init();

/*
Bind Item Events
*/

	$(interactive.wrapper + " " + interactive.item).on("click", function (e) {
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
		if (e.keyCode === 40) (e.preventDefault(), interactive.snapScroll.scrollPageY("next"));
    	if (e.keyCode === 38) (e.preventDefault(), interactive.snapScroll.scrollPageY("prev"));
	});
	//Click to Start
	$('#opening .begin').on("click", function (e) {
		interactive.snapScroll.scrollPageY("next");
	});

}(jQuery, d3, ko))