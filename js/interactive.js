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
			Int.scrolling 			= false,
			Int.itemCount 			= 0,
			Int.collectorIcon 		= '#icon-collector .icons .icon',
			Int.quizElement 		= '#quiz',
			Int.quizExit 			= '#quiz .exit',
			Int.vinvasive 			= '#vinvasive',
			Int.terrifyingComment 	= '#vinvasive .evil-words',
			Int.finalIcon 			= '#final .all-icons .icon',
			Int.maskIndex 			= 1,
			Int.currentMask 		= false,
			Int.activeQuizItem,
			Int.activeTerror,
			Int.sceneData,
			Int.delta,
			Int.collector,
			Int.progressBar,
			Int.quiz,
			Int.currentImgMask,
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
		var item 				= this;
			item.element 		= args.id,
			item.quiz 			= args.quiz,
			item.vin 			= args.vin;
		return item;
	};

	//Scene Constructor
	Interactive.prototype._Scene_ 				= function (args) {
		var scene 				= this;
			scene.name 			= args.name,
			scene.sub 			= args.sub,
			scene.index 		= args.index,
			scene.limit 		= args.limit,
			scene.scroll 		= args.scroll,
			scene.collector 	= args.collector,
			scene.progress 		= args.progress;
		return scene;
	};

	//Item Collector
	Interactive.prototype._ItemCollector_ 		= function (args) {
		var coll 				= this;
			coll.element 		= args.element,
			coll.ui 			= args.ui,
			coll.all 			= ko.observableArray([]),
			coll.icons 			= ko.observableArray([]),
			coll.showing 		= false,

		/*
		Methods
		*/

			//Add to Items Array
			coll.add 			= function (id) {
				coll.icons.push(id);
				// coll.icons.valueHasMutated();
				console.log("added " + id);
			},
			coll.remove 		= function (id) {
				coll.icons.remove(id);
				// coll.icons.valueHasMutated();
				console.trace("removed " + id);
			},
			//Clear Items Array
			coll.clear 			= function () {
				for (var i = 0; i < coll.icons().length; i++) {
					coll.all.push(coll.icons()[i]);
				};
				coll.icons([]);
			},
			coll.show 			= function () {
				$(coll.ui).fadeIn();
				coll.showing = true;
			},
			coll.hide 			= function () {
				$(coll.ui).fadeOut();
				coll.showing = false;
			};

		return coll;
	};

	//Progress Bar Constructor
	Interactive.prototype._ProgressBar_ 		= function (args) {
		var bar 				= this;
			bar.element 		= args.element,
			bar.showing 		= false;

		/*
		Methods
		*/

			bar.show 			= function () {
				$(bar.element).fadeIn();
				bar.showing = true;
				console.log('showing progress bar');
			},
			bar.hide 			= function () {
				$(bar.element).fadeOut();
				bar.showing = false;
				console.log('hiding progress bar');
			};

		return bar;
	};

	//Mask Constructor
	Interactive.prototype._Mask_ 				= function (args) {
		var mask 				= this;
			mask.element 		= args.element,
			mask.close 			= args.close,
			mask.showing 		= false;

		/*
		Methods
		*/

			//Show Mask
			mask.show 			= function () {
				$(mask.element).fadeIn();
				mask.showing = true;
				console.log("showing mask");
			},
			//Hide Mask
			mask.hide 			= function () {
				$(mask.element).fadeOut();
				mask.showing = false;
				console.log("hiding mask");
			};

        return mask;
	};

	//Quiz Constructor
	Interactive.prototype._Quiz_ 				= function (args) {
		var quiz 				= this;
			quiz.parent 		= args.parent,
			quiz.question 		= ko.observable(),
			quiz.answer 		= ko.observableArray([]),
			quiz.result 		= ko.observable(),

		/*
		Methods
		*/

			quiz.show 			= function () {
				$(quiz.parent.quizElement).fadeIn();
			},
			quiz.hide 			= function () {
				$(quiz.parent.quizElement).fadeOut();
				quiz.parent.dismissQuiz();
			},
			quiz.selectAnswer  	= function (data) {
				quiz.result(data.result)
			};

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
				Int.touchStart(e);
			});
			$(Int.wrapper).on("touchmove", function (e) {
				Int.touchMoveY(e);
			});
		} else {
			$(Int.wrapper).on('mousewheel DOMMouseScroll MozMousePixelScroll wheel', function (e) {
				Int.scrollDelta(e);
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
			return
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
		};
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
			};
		};
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
		if (Int.itemCount === Int.sceneData.limit) return;
		if (Int.currentImgMask.showing === true) Int.currentImgMask.hide();
		d3.select('#' + id).classed('selectable', false).classed('selected', true);
		if (Int.items[id].vin.element !== false) {
			Int.terrify(id);
		} else if (Int.items[id].quiz !== false) {
			Int.loadQuiz(id);
		} else {
			Int.collector.add(id);
			$(Int.finalIcon + '.' + id).addClass('selected');
			Int.itemCount++;
			if ((Int.itemCount) === Int.sceneData.limit) {
				Int.sceneEnd();
			}
		}
	};

	//Item Deselection
	Interactive.prototype.deselectItem 			= function (id, e) {
		var Int = interactive;
		if ($(Int.collectorIcon + "." + id).hasClass('noselect')) return;
		Int.collector.remove(id);
		$(Int.finalIcon + '.' + id).removeClass('selected');
		d3.select("#" + id).classed('selected', false).classed('selectable', true);
		Int.itemCount--;
	};

/*
Interactive Quiz & Vin Vasive
*/
	
	//Terrify With The Evil Vin Vasive
	Interactive.prototype.terrify 				= function (id) {
		var Int = this;
		$(Int.terrifyingComment).text(Int.items[id].vin.copy);
		$(Int.vinvasive).fadeIn();
		$(Int.wrapper + ' .' + Int.items[id].vin.element).fadeIn();
		Int.activeTerror = id;
	};

	//Make Him Go Away
	Interactive.prototype.dismissTerror 		= function () {
		var Int = this;
		$(Int.vinvasive).fadeOut();
		$(Int.wrapper + ' .' + Int.items[Int.activeTerror].vin.element).fadeOut();
		Int.collector.add(Int.activeTerror);
		$(Int.finalIcon + '.' + Int.activeTerror).addClass('selected');
		Int.itemCount++;
		if (Int.itemCount === Int.sceneData.limit) {
			Int.sceneEnd();
		};
	};

	//Clear old Quiz Data and Load New Data
	Interactive.prototype.loadQuiz 				= function (id) {
		var Int = this;
		Int.quiz.answer([]);
		Int.quiz.result(null);
		Int.quiz.question(Int.items[id].quiz.question);
		for (var i = 0; i < Int.items[id].quiz.answer.length; i++) {
			Int.quiz.answer.push(ko.observable(Int.items[id].quiz.answer[i]));
		};
		Int.quiz.show();
		Int.activeQuizItem = id;
	};

	//Dismiss Quiz and Push Item to Collector
	Interactive.prototype.dismissQuiz 			= function () {
		var Int = this;
		Int.collector.add(Int.activeQuizItem);
		$(Int.finalIcon + '.' + Int.activeQuizItem).addClass('selected');
		Int.itemCount++;
		if (Int.itemCount === Int.sceneData.limit) {
			Int.sceneEnd();
		};
	};

/*
Mask Handling
*/

	//Set Mask
	Interactive.prototype.setMask 				= function () {
		var Int = this;
		console.log("setting mask");
		var prefix = '#' + Int.sceneData.scene,
		mask = new Int._Mask_({
			element 	: prefix + '-mask-' + Int.maskIndex,
			close 		: prefix + '-mask-' + Int.maskIndex + ' .dismiss'
		});
		if (Int.currentMask !== false) Int.currentMask.hide();
		mask.show();
		Int.currentMask = mask;
		Int.maskIndex++
	};

	//Set Image Mask
	Interactive.prototype.setImgMask 				= function () {
		var Int = this;
		if (Int.sceneData.imgMask === true) {
			var prefix = (Int.sceneData.sub !== false) ? '#' + Int.sceneData.sub : '#' + Int.sceneData.scene,
			imgMask = new Int._Mask_({
				element 	: prefix + ' .img-mask',
				close 		: prefix + ' .img-mask .dismiss'
			});
			imgMask.show();
			Int.currentImgMask = imgMask;
		};
	};

	Interactive.prototype.hideMasks 			= function () {
		var Int = this;
		if (typeof Int.currentMask !== 'undefined') Int.currentMask.hide();
		if (typeof Int.currentImgMask !== 'undefined')Int.currentImgMask.hide();
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
		Int.itemCount = 0;
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

	//End Scene
	Interactive.prototype.sceneEnd 				= function () {
		var Int = this;
		Int.hideMasks();
		Int.nextScene();
	};

	//Set State
	Interactive.prototype.setScene 				= function (destination) {
		var Int = this;
		console.log(Int.scrolling);
		//Determine Previous State
		if (destination === "next") previousState = Int.data[Int.index - 2];
		if (destination === "prev") previousState = Int.data[Int.index];

	//Set The Following According to Previous State . . .

		//Scroll?
		previousState.scroll === true ? Int.scrollPageY("next") : false;
		//Hide Previous Mask
		previousState.mask !== false ? Int.currentMask.hide() : false;
		//Test Scroll Modal Issue 


	//Set The Following According to New State . . .

		//Setup Collector
		Int.sceneData.collector.display === true ? Int.collector.show() : Int.collector.hide();
		Int.sceneData.collector.reset === true ? Int.collector.clear() : false;
		//Setup Progress
		Int.sceneData.progress.display === true ? Int.progressBar.show() : Int.progressBar.hide();
		//Setup Masks
		Int.sceneData.mask !== false ? Int.setMask() : Int.maskIndex = 1;
		//Setup Img Masks
		Int.sceneData.imgMask !== false ? Int.setImgMask() : false;
		//Setup Sub Scene
		Int.sceneData.sub !== false ? Int.setSubScene() : false;
		if (typeof Int.sceneData.limit !== 'number') {
					setTimeout(function () {
				Int.scrolling = false;
			}, 600)
		};
	};

/*
Interactive Global Macro Methods
*/

	//Initialization Macro
	Interactive.prototype.init 					= function () {
		var Int = this;
		Int.getData(function () {
			Int.detectMobile();
			Int.bindScroll();
			Int.initItems();
			Int.setSceneData();
			//Initialize Item Collector
			Int.collector = new Int._ItemCollector_({element: '#item-collector', ui: '.notepad'});
			//Initialize Progress Bar
			Int.progressBar = new Int._ProgressBar_({element: '#progress-bar'});
			//Initialize Quiz
			Int.quiz = new Int._Quiz_({parent: Int});
			//Apply Bindings
			ko.applyBindings(interactive, document.getElementById('interactive-wrapper'));
		});
	};

	//Next Scene Macro
	Interactive.prototype.nextScene 			= function () {
		var Int = this;
		Int.index++
		Int.setSceneData();
		Int.setScene("next");
		$(Int.collectorIcon).addClass("noselect");
	};

	//Previous Scene Macro
	Interactive.prototype.prevScene 			= function () {
		// var Int = this;
		// Int.index--
		// Int.setSceneData();
		// Int.setScene("prev");
	};

/*
Instantiation & Initialization
*/

	var interactive = new Interactive();
		interactive.init();

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

	//Click Mask to Go To Next
	$(interactive.wrapper + " " + interactive.mask).on("click", function (e) {
		interactive.nextScene();
	});

/*
Item Event Bindings
*/
	
	//Item Selection
	$(interactive.wrapper + " " + interactive.itemSelectable).on("click", function (e) {
		var id = e.currentTarget.id;
		interactive.selectItem(id);
	});	

/*
Vin Vasive Bindings
*/

	$(interactive.vinvasive).on("click", function (e) {
		interactive.dismissTerror();
	});

}(jQuery, ko, d3));

