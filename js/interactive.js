(function () {

/***************************************************************************************************/

/*
Interactive Parent
*/
	
	//Define & Declare Variables
	var Interactive = function () {
		var Int = this;
			Int.wrapper 			= '#interactive-wrapper',
			Int.slider 				= '.viewport',
			Int.index 				= 1,
			Int.indexed 			= '.indexed',
			Int.scene 				= '.scene',
			Int.sub 				= '.sub',
			Int.interactiveElement 	= '.interactive-element',
			Int.imgMask 			= '.img-mask',
			Int.mask 				= '.mask',
			Int.duration 			=  600,
			Int.easing 				= 'linear',
			Int.item		 		= '.item',
			Int.itemSelectable 		= '.item.selectable',
			Int.snapFirst 			= 'snapscroll-first',
			Int.snapCurrent 		= 'snapscroll-current',
			Int.snapLast 			= 'snapscroll-last',
			Int.introPrompt 		= '#opening .begin',
			Int.items 				= {},
			Int.scenes 				= ko.observableArray([]),
			Int.masks 				= {},
			Int.scrollEnabled 		= true,
			Int.scrolling 			= false,
			Int.sceneData,
			Int.delta,
			Int.collector,
			Int.progressBar,
			Int.quiz,
			Int.currentScene,
			Int.lastScene,
			Int.mobile,
			Int.data;
	};

/*
Constructors
*/

	//Item Contructor
	Interactive.prototype._Item_				= function (args) {
		var item 			= this;
			item.element 	= args.id,
			item.quiz 		= args.quiz,
			item.vin 		= args.vin;
		return item;
	};

	//Scene Constructor
	Interactive.prototype._Scene_ 				= function (args) {
		var scene 			= this;
			scene.name 		= args.name,
			scene.sub 		= args.sub,
			scene.index 	= args.index,
			scene.limit 	= args.limit,
			scene.scroll 	= args.scroll,
			scene.collector = args.collector,
			scene.progress 	= args.progress;
		return scene;
	};

	//Item Collector
	Interactive.prototype._ItemCollector_ 		= function (args) {
		var coll 			= this;
			coll.element 	= args.element,
			coll.items 		= ko.observableArray([]),
			coll.all 		= ko.observableArray([]),

		/*
		Methods
		*/

			//Clear Items Array
			coll.clear 		= function () {
				for (var i = 0; i < coll.items().length; i++) {
					coll.all.push(coll.items()[i]);
				};
				console.log(coll.all());
				coll.items([]);
				console.log(coll.items());
			},
			//Add to Items Array
			coll.add 		= function (id) {
				coll.items.push({item: id});
				console.log(coll.items());
			};

		return coll;
	};

	//Progress Bar Constructor
	Interactive.prototype._ProgressBar_ 		= function (args) {
		var bar 			= this;
			bar.element 	= args.element;
		return bar;
	};

	//Mask Constructor
	Interactive.prototype._Mask_ 				= function (args) {
		var mask 			= this;
			mask.element 	= args.element,
			mask.close 		= args.close,

		/*
		Methods
		*/

			//Show Mask
			mask.show 		= function () {
				console.log(mask.element);
				console.log($(mask.element));
				$(mask.element).fadeIn();
			},
			//Hide Mask
			mask.hide 		= function () {
				$(mask.element).fadeOut();
			};

        return mask;
	};

	//Quiz Constructor
	Interactive.prototype._Quiz_ 				= function (args) {
		var quiz 			= this;
			quiz.question 	= ko.observable(args.question),
			quiz.answer 	= ko.observableArray(args.answer);
		return quiz;
	};

/*
Interactive Global Methods - Setup
*/

	//XHR JSON Data
	Interactive.prototype.getData  				= function (callback) {
		var Int = this;
		$.getJSON('js/data/interactive.json', function (res) {
			Int.data = res;
			if (typeof callback === 'function') callback();
		});
	};

	//Employ Modernizr to Detect Touch Events Else Default to Desktop Scroll Events
	Interactive.prototype.detectMobile 				= function () {
		this.mobile = (typeof Modernizr !== 'undefined') ? ((Modernizr.touch) ? true : false) : false;
		return this.mobile;
	};

/*
Interactive Navigation Handling
*/

	//Bind Scroll
	Interactive.prototype.bindScroll  			= function () {
		var Int = this;
		$(Int.scene).first().addClass(Int.snapFirst).addClass(Int.snapCurrent);
		$(Int.scene).last().addClass(Int.snapLast);
		if (Int.mobile === true) {
			$(Int.wrapper).on("touchstart", function (e) {
				if (Int.scrollEnabled === true) Int.touchStart(e);
			});
			$(Int.wrapper).on("touchmove", function (e) {
				if (Int.scrollEnabled === true) Int.touchMoveY(e);
			});
		} else {
			$(Int.wrapper).on('mousewheel DOMMouseScroll MozMousePixelScroll wheel', function (e) {
				if (Int.scrollEnabled === true) Int.scrollDelta(e);
			});
		}
	};

	//Measure / Normalize Scroll Delta 
	Interactive.prototype.scrollDelta 			= function (e) {
		this.delta = 0;
		if (!e) e = window.event;
		if (e.originalEvent.wheelDelta) {
			this.delta = e.originalEvent.wheelDelta / 120;
		} else if (e.originalEvent.detail) {
			this.delta = - e.originalEvent.detail / 3;
		}
		if (this.delta) {
			e.preventDefault ? e.preventDefault() : e.returnValue = false;
			this.scrollDirectionY();
		}
	};

	//Set Touch Start Coordinates (Triggered by Mobile Bindings)
	Interactive.prototype.touchStart 			= function (e) {
		var start = {x: 0, y: 0};
		start.x = e.originalEvent.pageX;
		start.y = e.originalEvent.pageY;
		this.startPosition = start;
	};

	//Maps Touchmove on Y-Axis to Delta
	Interactive.prototype.touchMoveY 			= function (e) {
		var offset = {};
		offset.y = this.startPosition.y - e.originalEvent.pageY;
		this.delta = offset.y;
		if (Math.abs(this.delta) >= 10) {
			e.preventDefault ? e.preventDefault() : e.returnValue = false;
			this.scrollDirectionY();
		}
	};

	//Scrolls To Next or Previous Page
	Interactive.prototype.scrollPageY 			= function (destination, callback) {
		var Int = this,
		//Private Scrolling Function
		snapTo = function (loc, callback) {
			$(Int.slider).scrollTo(loc, {
				duration: Int.duration,
				axis: "y",
				easing: Int.easing,
				onAfter: function () {
					Int.scrolling = false;
					if (typeof callback === 'function') callback();
				}
			});
		};
		//Determine Where to Scroll
		if (destination === 'next') {
			if ($('.' + Int.snapLast).hasClass(Int.snapCurrent)) return (Int.scrolling = false);
			$('.' + Int.snapCurrent).removeClass(Int.snapCurrent).next().addClass(Int.snapCurrent);
			var navTimer = setTimeout(function () {
				snapTo('.' + Int.snapCurrent);
			}, Int.duration);
		} else if (destination === 'prev') {
			if ($('.' + Int.snapFirst).hasClass(Int.snapCurrent)) return (Int.scrolling = false);
			$('.' + Int.snapCurrent).removeClass(Int.snapCurrent).prev().addClass(Int.snapCurrent);
			var navTimer = setTimeout(function () {
				snapTo('.' + Int.snapCurrent);
			}, Int.duration);
		} else {
			console.log("Scroll Destination Error: " + destination);
		}
	};

	//Uses Delta to Determine Scroll Direction
	Interactive.prototype.scrollDirectionY 		= function () {
		if (this.mobile === true) {
			if (this.scrolling === false) {
				if (this.delta > -1.25) {
					this.scrolling = true;
					this.nextScene();
				} else if (this.delta < 1.25) {
					this.scrolling = true;
					this.prevScene();
				} else return;
			};
		} else {
			if (this.scrolling === false) {
				if (this.delta <= -1) {
					this.scrolling = true;
					this.nextScene();
				} else if (this.delta >= 1) {
					this.scrolling = true;
					this.prevScene();
				} else return;
			}
		}
	};

/*
Interactive Item Handling
*/

	//Initializes Collectable Items
	Interactive.prototype.initItems 			= function () {
		var Int = this;
		for (var i = 0; i < Int.data.length; i++) {
			for (var j = 0; j < Int.data[i].item.length; j++) {
				var item = new Int._Item_({
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
		d3.select('#' + id).classed('selectable', false).classed('selected', true);
		if (Int.items[id].vin !== false) {
			Int.vinvasive(id);
		} else if (Int.items[id].quiz !== false) {
			Int.newQuiz(id);
		} else {
			Int.collector.add(id);
			if (Int.sceneLimit === (Int.collector.items().length)) {
				Int.sceneEnd();
			};
		};
	};

/*
Interactive Quiz & Vin Vasive
*/

	Interactive.prototype.vinvasive 			= function (id) {
		var Int = this;
		console.log(Int.items[id].vin);
		Int.collector.add(id);
		if (Int.sceneLimit === (Int.collector.items().length)) {
			Int.sceneEnd();
		};
	};

	Interactive.prototype.newQuiz 				= function (id) {
		var Int = this;
		console.log(Int.items[id].quiz);
		Int.collector.add(id);
		if (Int.sceneLimit === (Int.collector.items().length)) {
			Int.sceneEnd();
		};
	};

/*
Interactive Scene Handling
*/

	//Initialize Scene
	Interactive.prototype.setSceneData 			= function () {
		var Int = this;
		for (var i = 0; i < Int.data.length; i++) {
			if ((i + 1) === Int.index) {
				Int.sceneData = Int.data[i];
			}
		}
		console.log(Int.sceneData);
		return Int.sceneData;
	};

	//Set Sub Scene
	Interactive.prototype.setSubScene 			= function () {
		var Int = this;
		if (typeof Int.sceneData.sub === 'string') {
			$('.subscene').css('z-index', 0);
			$('#' + Int.sceneData.sub).css('z-index', 100);
		};
	};

	//Set Masks
	Interactive.prototype.setMasks 				= function () {
		var Int = this;
		if (Int.sceneData.mask === true) {
			var mask = new Int._Mask_({
				element 	: '#' + Int.sceneData.scene + ' .mask',
				close 		: '#' + Int.sceneData.scene + ' .mask .dismiss'
			});
			mask.show();
		};
		if (Int.sceneData.imgMask === true) {
			var imgMask = new Int._Mask_({
				element 	: '#' + Int.sceneData.scene + ' .img-mask',
				close 		: '#' + Int.sceneData.scene + ' .img-mask .dismiss'
			});
			imgMask.show();
		};
	};

/*
Interactive Global Macro Methods
*/

	//Initialization Macro
	Interactive.prototype.init 					= function () {
		var Int = this;
		Int.getData(function () {
			console.log(Int.data);
			Int.detectMobile();
			Int.bindScroll();
			Int.initItems();
			Int.setSceneData();
			//Initialize Item Collector
			Int.collector = new Int._ItemCollector_({element: '.item-collector'});
		});
	};

	//Next Scene Macro
	Interactive.prototype.nextScene 			= function () {
		var Int = this;
		Int.index++
		if (Int.sceneData.scroll === true) {
			Int.setSceneData();
			Int.setMasks();
			Int.setSubScene();
			Int.scrollPageY("next");
		} else {
			Int.setSceneData();
			Int.setMasks();
			Int.setSubScene();
		}
	};

	//Previous Scene Macro
	Interactive.prototype.prevScene 			= function () {
		var Int = this;
		Int.scrollPageY("prev");
	};

/*
Instantiation & Initialization
*/

	var interactive = new Interactive();
		interactive.init()

/*
Global Event Bindings
*/

	//Sets Interactive as Focus For Keypress Events on Mouseover
	$(interactive.wrapper).on("mouseover", function () {
		$(this).focus();
	});

	//Arrow Up & Arrow Down Navigation
	$(interactive.wrapper).on("keydown", function (e) {
		if (e.keyCode === 40) (e.preventDefault(), interactive.nextScene());
    	if (e.keyCode === 38) (e.preventDefault(), interactive.prevScene());
	});
	//Click Intro Prompt To Start
	$(interactive.introPrompt).on("click", function (e) {
		interactive.nextScene();
	});

/*
Item Event Bindings
*/

	$(interactive.wrapper + " " + interactive.itemSelectable).on("click", function (e) {
		var id = e.currentTarget.id;
		interactive.selectItem(id);
	});	

}(jQuery, ko, d3));

