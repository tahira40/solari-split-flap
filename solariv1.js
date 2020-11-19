String.prototype.padRight = function(length, character) {
	return this + Array(length - this.length + 1).join(character || " ");
}

// ASCII characters to use
var charGroups = [
	{offset: 32, length: 1},	// begin with space
	{offset: 48, length: 10},
	{offset: 65, length: 26}
];

var chars           = genChars(charGroups);
var columns         = 43;											// tab stops?
var rows            = 1;
var delayFactor     = 50;
var defaultDuration = 100;
var duration, containers;
var str;



init();


/**
 * Build the DOM structure
 * 
 * @return void
 */
function init() {
	containers = d3.select("body").selectAll(".container")
		.data(d3.range(rows)).enter()
			.append("div")
				.attr("class", "container");
				

	containers.selectAll(".flapset")
		.data(d3.range(columns)).enter()
			.append("div")
			.attr("class", "flapset")
			.attr("data-d", function(d) { return d; })
			.selectAll(".flap")
				.data(chars).enter()
			    .call(addFlaps);
	// initialise first flap in each set with enter class
	var starters = reset();
	// computes the animation speed using CSS style rule of first element
	duration = getAnimationDuration(starters[0][0]) || defaultDuration;
}


/**
 * Reset lines
 * 
 * @return d3.selection		the first flaps in each widget 
 */
function reset() {
	d3.selectAll(".flap").classed("enter", false);
	return d3.selectAll(".flap[data-next='1'").classed("enter", true);
}


/**
 * update messages
 * 
 * @return void
 */
function update(str) {
	// temporary
	
	
	for( var no_of_rows=1; no_of_rows <= rows; no_of_rows++)
	{
		var msg = characters(str, columns);
		var line = Math.floor(Math.random() * no_of_rows);


		dispatch(line, msg);
	}
} 


/**
 * dispatch a msg to a given line
 * 
 * @param  int			line	zero-indexed line no.
 * @param  Array		chars msg to display,prepped as individual characters
 * @return void
 */
function dispatch(line, chars) {	
	containers.each(function(d, i) {
		// there's got to be a better way of targeting a specific element in a selection
		if (i === line) {
			d3.select(this).selectAll(".flapset")
				.each(function(d, i) {
					window.setTimeout(function() {
						flip(this, chars[i]);
					}.bind(d3.select(this)), i * delayFactor);
				});
		}
	});
}


/**
 * Starts a split-flap widget flipping
 * 
 * @return void
 */
function flip() {
	var _this = arguments[0];
	var letter = arguments[1];

	// space char -- used for padding
	if (letter == chars[0]) return;

	var interval = window.setInterval(function() {

		var enter = _this.selectAll(".enter");
		var d     = enter[0][0].dataset.d;
		var next  = chars[ enter[0][0].dataset.next ];

		_this.selectAll(".exit").classed("exit", false);
		enter.classed("exit", true).classed("enter", false);
		_this.selectAll(".flap[data-d='" + next + "']").classed("enter", true);

		if (next == letter) {
			clearInterval(interval);
		}

	}, duration);
}


/**
 * Adds top & bottom flaps for each character. Not super elegant.
 * Note that all.flap-tops will be added before the .flap-bottoms.
 * 
 * @param d3.selection selection
 * @return void
 */
function addFlaps(selection) {
	selection.append("div")
		.attr("class", "flap flap-top")
		.attr("data-d", function(d) { return d; })
		.attr("data-next", getNextIndex)
		.append("span")
			.text(function(d) { return d;});
	selection.append("div")
		.attr("class", "flap flap-bottom")
		.attr("data-d", function(d) { return d; })
		.attr("data-next", getNextIndex)
		.append("span")
			.text(function(d) { return d;})
			.on("mouseover", update("west bengal"));
			
}


/**
 * Prepares the characters in a msg
 * 
 * @param  String msg		the message
 * @param  Int		cols	number of columns
 * @return Array      	the chars,to uppercase and right-padded with spaces
 */
function characters(msg, cols) {
	return msg.slice(0, cols).padRight(cols).toUpperCase().split("");
}



/**
 * Generates an array of characters.
 *
 * @param	Array	groups	Contains objects for each set of consecutive
 * 		ASCII chars desired. Object should have the following properties:
 *			"offset": the decimal code for the first character in the group
 *			"length": the length of the group
 * @return Array
 */
function genChars(groups) {
	var a = [];

	if (typeof groups === undefined || !(groups instanceof Array)) {
		groups = [];
	}

	groups.forEach(function(d) {
		if (d && d.length && d.offset) {
			for (var i = 0; i < d.length; i++) {
				a.push(String.fromCharCode(d.offset + i));
			}
		}
	});
	return a;
}


/**
 * Get the index of the following char for a given char, or 0.
 * Each div.flap stores this value in its data to make it easier
 * to specify which should next have the "enter" class added.
 * 
 * @param  String d some character
 * @return Integer   the next index
 */
function getNextIndex(d) {

	var i = chars.indexOf(d) + 1;
	if (i === chars.length ) {
		i = 0;
	
	}
	return i;
}

/**
 * Gets the duration for an element's animation as set in
 * the CSS rule.
 * 
 * @param  element
 * @return Float	milliseconds
 */
function getAnimationDuration(element) {
  var properties = [
    'animation-duration',
    'WebkitAnimationDuration',
    'msAnimationDuration',
    'MozAnimationDuration',
    'OAnimationDuration'
  ];
  var p;
  var style = window.getComputedStyle(element);

  while (p = properties.shift()) {
    if (typeof style[p] !== undefined) {
      return parseFloat(style[p]) * 1000;
    }
  }
  return false;
}

