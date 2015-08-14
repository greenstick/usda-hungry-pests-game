(function () {

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
			Int.introPrompt 		= '#opening',
			Int.items 				= {},
			Int.scenes 				= ko.observableArray([]),
			Int.masks 				= {},
			Int.scrolling 			= false,
			Int.itemCount 			= 0,
			Int.collectorIcon 		= '#icon-collector .icons .icon',
			Int.quizElement 		= '#quiz',
			Int.quizBody 			= '#quiz .quiz',
			Int.quizExit 			= '#quiz .exit',
			Int.vinvasive 			= '#vinvasive',
			Int.vinvasiveDismiss 	= '#vinvasive .shoo',
			Int.vinvasiveElement 	= '#vinvasive .vin-element',
			Int.vinvasiveBubble 	= '#vinvasive .evil-words',
			Int.terrifyingComment 	= '#vinvasive .evil-words .copy',
			Int.finalIcon 			= '#final .all-icons .icon',
			Int.maskIndex 			= 1,
			Int.currentMask 		= false,
			Int.cta1 				= '#final .cta-1',
			Int.cta2 				= '#final .cta-2',
			Int.cta3 				= '#final .cta-3',
			Int.pestPopup 			= '#pest-popup',
			Int.activePest 			= ko.observable(''),
			Int.pestTitle 			= ko.observable(''),
			Int.pestInfo 			= ko.observable(''),
			Int.vinvasiveMask 		= ko.observable(''),
			Int.progressBarElement 	= '#progress-bar .bar',
			Int.progressActive 		= '#progress-bar .bar.active',
			Int.progressDone 		= '#progress-bar .bar.done',
			Int.check 				= '#interactive-wrapper .check-mark',
			Int.selectionEvent 		= (typeof Modernizr !== 'undefined') ? ((Modernizr.touch) ? "touchend" : "click") : "click",
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
			item.vin 			= args.vin,
			item.pest 			= args.pest;
		return item;
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
			},
			//Remove From Items Array
			coll.remove 		= function (id) {
				coll.icons.remove(id);
			},
			//Clear Items Array
			coll.clear 			= function () {
				for (var i = 0; i < coll.icons().length; i++) {
					coll.all.push(coll.icons()[i]);
				};
				coll.icons([]);
			},
			//Show Collector
			coll.show 			= function () {
				$(coll.ui).fadeIn();
				coll.showing = true;
			},
			//Hide Collector
			coll.hide 			= function () {
				$(coll.ui).fadeOut();
				coll.showing = false;
			};

		return coll;
	};

	//Progress Bar Constructor
	Interactive.prototype._ProgressBar_ 		= function (args) {
		var bar 				= this;
			bar.parent 			= args.parent,
			bar.element 		= args.element,
			bar.showing 		= false,

		/*
		Methods
		*/

			bar.show 			= function () {
				$(bar.element).fadeIn();
				bar.showing = true;
			},
			bar.hide 			= function () {
				$(bar.element).fadeOut();
				bar.showing = false;
			},
			bar.update 			= function () {
				$(bar.parent.progressActive).removeClass('active').addClass('done');
				$(bar.parent.progressDone).next().addClass('active');
			};

		return bar;
	};

	//Mask Constructor
	Interactive.prototype._Mask_ 				= function (args) {
		var mask 				= this;
			mask.element 		= args.element,
			mask.close 			= args.close,
			mask.showing 		= false,

		/*
		Methods
		*/

			//Show Mask
			mask.show 			= function () {
				$(mask.element).fadeIn();
				mask.showing = true;
			},
			//Hide Mask
			mask.hide 			= function () {
				$(mask.element).fadeOut();
				mask.showing = false;
			};

        return mask;
	};

	//Quiz Constructor
	Interactive.prototype._Quiz_ 				= function (args) {
		var quiz 				= this;
			quiz.parent 		= args.parent,
			quiz.question 		= ko.observable(''),
			quiz.answer 		= ko.observableArray([]),
			quiz.result 		= ko.observable(''),
			quiz.triangle 		= ko.observable(''),
			quiz.value 			= ko.observable(''),

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
				quiz.value(data.value);
				quiz.result(data.result);
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
			// $(Int.wrapper).on("touchstart", function (e) {
			// 	Int.touchStart(e);
			// });
			// $(Int.wrapper).on("touchmove", function (e) {
			// 	Int.touchMoveY(e);
			// });
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
		if (Math.abs(this.delta) >= 20) {
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
			console.trace("Scroll Destination Error: " + destination);
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
					return
				} else return;
			};
		} else {
			if (this.scrolling === false) {
				if (this.delta <= -1) {
					this.scrolling = true;
					this.nextScene();
				} else if (this.delta >= 1) {
					return
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
		if ($('#' + id).attr('class').indexOf("selected") > -1) return;
		$('#' + id).attr('class', 'icon selected');
		if (Int.items[id].vin.element !== false) {
			Int.terrify(id);
		} else if (Int.items[id].quiz !== false) {
			Int.loadQuiz(id);
		} else {
			if ($.inArray(id, Int.collector.icons()) > -1) return;
			$(Int.finalIcon + '.' + id).addClass('selected');
			$(Int.check + '.' + id).addClass('active');
			Int.collector.add(id);
			Int.itemCount++;
			if ((Int.itemCount) === Int.sceneData.limit) Int.sceneEnd();
		};
	};

	//Item Deselection
	Interactive.prototype.deselectItem 			= function (id, e) {
		var Int = interactive;
		if ($(Int.collectorIcon + "." + id).hasClass('noselect')) return;
		$(Int.check + '.' + id).removeClass('active');
		$(Int.finalIcon + '.' + id).removeClass('selected');
		Int.collector.remove(id);
		Int.itemCount--;
		$("#" + id).attr('class', 'item selectable');
	};

/*
Interactive Quiz & Vin Vasive & Pests
*/
	
	//Terrify With The Evil Vin Vasive
	Interactive.prototype.terrify 				= function (id) {
		var Int = this;
		$(Int.terrifyingComment).text(Int.items[id].vin.copy);
		$(Int.vinvasive).fadeIn();
		$(Int.vinvasiveElement).animate({"left": "0px"}, 400);
		$(Int.vinvasiveBubble).animate({"left": "192px"})
		$(Int.wrapper + ' .' + Int.items[id].vin.element).fadeIn();
		Int.activeTerror = id;
	};

	//Make Him Go Away
	Interactive.prototype.dismissTerror 		= function () {
		var Int = this;
			if ($.inArray(Int.activeTerror, Int.collector.icons()) > -1) return;
			$(Int.vinvasive).fadeOut();
			$(Int.wrapper + ' .' + Int.items[Int.activeTerror].vin.element).fadeOut(function () {
				$(Int.vinvasiveElement).css("left", "-329px");
				$(Int.vinvasiveBubble).css("left", "-152px");
			});
			$(Int.finalIcon + '.' + Int.activeTerror).addClass('selected');
			$(Int.check + '.' + Int.activeTerror).addClass('active');
			Int.collector.add(Int.activeTerror);
			Int.itemCount++;
			if (Int.itemCount === Int.sceneData.limit) Int.sceneEnd();
	};

	//Clear old Quiz Data and Load New Data
	Interactive.prototype.loadQuiz 				= function (id) {
		var Int = this;
		$(Int.quizBody).css("left", Int.items[id].quiz.position.x + "px").css("top", Int.items[id].quiz.position.y + "px");
		Int.quiz.triangle(Int.items[id].quiz.triangle);
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
		if ($.inArray(Int.activeQuizItem, Int.collector.icons()) > -1) return;
		$(Int.finalIcon + '.' + Int.activeQuizItem).addClass('selected');
		$(Int.check + '.' + Int.activeQuizItem).addClass('active');
		Int.collector.add(Int.activeQuizItem);
		Int.itemCount++;
		if (Int.itemCount === Int.sceneData.limit) Int.sceneEnd();
	};

	//Show Pest on Final Scene
	Interactive.prototype.showPest 				= function (id, e) {
		var Int = this;
		if (typeof Int.items[id] === 'undefined') return
		Int.pestTitle(Int.items[id].pest.title);
		Int.pestInfo(Int.items[id].pest.copy);
		Int.activePest(Int.items[id].pest.src);
		if (e.pageX > Math.floor(window.innerWidth) / 2) $(Int.pestPopup).removeClass('right').addClass('left');
		if (e.pageX < Math.floor(window.innerWidth) / 2) $(Int.pestPopup).removeClass('left').addClass('right');
		$(Int.pestPopup).stop().fadeIn();
	};

	//Hide Pest on Final Scene
	Interactive.prototype.hidePest 				= function () {
		var Int = this;
		$(Int.pestPopup).stop().fadeOut();
	};

/*
Mask Handling
*/

	//Set Mask
	Interactive.prototype.setMask 				= function () {
		var Int = this, prefix = '#' + Int.sceneData.scene,
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
			if ((i + 1) === Int.index) Int.sceneData = Int.data[i];
		};
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
		//Determine Previous State
		if (destination === "next") previousState = Int.data[Int.index - 2];
		//Scroll?
		previousState.scroll === true ? Int.scrollPageY("next") : false;
		//Hide Previous Mask
		previousState.mask !== false ? Int.currentMask.hide() : false;
		//Setup Collector
		Int.sceneData.collector.display === true ? Int.collector.show() : Int.collector.hide();
		Int.sceneData.collector.reset === true ? Int.collector.clear() : false;
		//Setup Progress
		Int.sceneData.progress.display === true ? Int.progressBar.show() : Int.progressBar.hide();
		Int.sceneData.progress.update !== false ? Int.progressBar.update() : false;
		//Setup Masks
		Int.sceneData.mask !== false ? Int.setMask() : Int.maskIndex = 1;
		//Setup Img Masks
		Int.sceneData.imgMask !== false ? Int.setImgMask() : false;
		//Setup Sub Scene
		setTimeout(function () {
			Int.sceneData.sub !== false ? Int.setSubScene() : false;
		}, 200);
		//Setup Vinvasive Mask
		Int.sceneData.vinMask !== false ? Int.vinvasiveMask(Int.sceneData.vinMask) : Int.vinvasiveMask('');
		//If Last Scene, Initialize Last Animation Sequence
		Int.sceneData.index === 12 ? Int.lastAnimSequence() : false;
		if (typeof Int.sceneData.limit !== 'number') {
			setTimeout(function () {
				Int.scrolling = false;
			}, 1000)
		};
	};

	//Last Scene Animation Sequence
	Interactive.prototype.lastAnimSequence 		= function () {
		var Int = this;
		setTimeout(function () {
			$(Int.cta1).fadeOut(2000, function () {
				$(Int.finalIcon).fadeIn(2000, function () {
					$(this).addClass('selected');
				});
				setTimeout(function () {
					$(Int.finalIcon).animate({"opacity": .5}, 3000);
				}, 3000);
				$(Int.cta2).fadeIn(function () {
					setTimeout(function () {
						$(Int.cta2).fadeOut(1000, function () {
							$(Int.cta3).fadeIn();
							$(Int.finalIcon).addClass('interactable');
						});
					}, 6000)
				});
			});
		}, 4000);
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
			Int.progressBar = new Int._ProgressBar_({parent: Int, element: '#progress-bar'});
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

/*
Instantiation & Initialization
*/

	var interactive = new Interactive();
		interactive.init();

/*
Global Event Bindings
*/

	//Sets Interactive as Focus For Keypress Events on Mouseover - Desktop
	$(interactive.wrapper).on("mouseover", function () {
		$(this).focus();
	});

	//Sets Interactive as Focus For Keypress Events on Mouseover - Mobile
	$(interactive.wrapper).on("touchstart", function (e) {
		$(this).focus();
	});

	//Click Intro Prompt To Start
	$(interactive.introPrompt).on(interactive.selectionEvent, function (e) {
		interactive.nextScene();
	});

	//Click Mask to Go To Next
	$(interactive.wrapper + " " + interactive.mask).on(interactive.selectionEvent, function (e) {
		interactive.nextScene();
	});

/*
Item Event Bindings
*/
	
	//Item Selection
	$(interactive.wrapper + " " + interactive.itemSelectable).on(interactive.selectionEvent, function (e) {
		var id = e.currentTarget.id;
		interactive.selectItem(id);
	});	

/*
Vin Vasive Bindings
*/

	$(interactive.vinvasiveDismiss).on(interactive.selectionEvent, function (e) {
		interactive.dismissTerror();
	});

/*
Final Screen Event Bindings
*/

	//Show Pest
	$(interactive.finalIcon).on("mouseover", function (e) {
		var id = $(this).data().id;
		if ($(this).hasClass('interactable')) interactive.showPest(id, e);
	});

	//Hide Pest
	$(interactive.finalIcon).on("mouseleave", function (e) {
		interactive.hidePest();
	});

/*
Social Bindings
*/

	//Email
	$('.cta-social .em').bind("click", function(event) {
	    window.location = ('mailto:?subject=' + encodeURIComponent('Hungry Pests Interactive Game') + '&body=' + encodeURIComponent("<a href='http://hungrypests.com/resources/interactive.php' target='_blank'>Checkout this interactive game about Hungry Pests! Watchout for Vin Vasive!</a>"));
	    // if(window.focus) { wnd.focus(); }
	    return false; // Prevents closing the modal because there's a handler on the outer container
	});

	//Facebook
	$('.cta-social .fb').bind("click", function(event) {
	    var wnd = window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent("http://hungrypests.com/resources/interactive.php") + '&p[summary]=' + encodeURIComponent("Checkout this interactive game about Hungry Pests! Watchout for Vin Vasive!"), 'facebook-share-dialog', 'height=436,width=626');
	    if(window.focus) { wnd.focus(); }
	    return false; // Prevents closing the modal because there's a handler on the outer container
	});

	//Twitter
	$('.cta-social .tw').bind("click", function(event) {
	    var wnd = window.open('http://twitter.com/intent/tweet?url=' + encodeURIComponent("http://hungrypests.com/resources/interactive.php") + '&text=' + encodeURIComponent("Checkout this interactive game about Hungry Pests via @HungryPests"), '', 'height=480,width=640');
	    if(window.focus) { wnd.focus(); }
	    return false; // Prevents closing the modal because there's a handler on the outer container
	});

}(jQuery, ko));

