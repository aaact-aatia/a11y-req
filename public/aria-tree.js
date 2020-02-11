/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   Tree.js
*
*   Desc:   Tree widget that implements ARIA Authoring Practices
*           for a tree being used as a file viewer
*/

/**
 * ARIA Treeview example
 * @function onload
 * @desc  after page has loaded initialize all treeitems based on the role=treeitem
 */

// EDIT: Use WET init function
$(document).on("wb-ready.wb", function (event) {

  var trees = document.querySelectorAll('[role="tree"]');

  for (var i = 0; i < trees.length; i++) {
    var t = new Tree(trees[i]);
    t.init();
  }

});

/*
*   @varructor
*
*   @desc
*       Tree item object for representing the state and user interactions for a
*       tree widget
*
*   @param node
*       An element with the role=tree attribute
*/

var Tree = function (node) {
  // Check whether node is a DOM element
  if (typeof node !== 'object') {
    return;
  }

  this.domNode = node;

  this.treeitems = [];
  this.firstChars = [];

  this.firstTreeitem = null;
  this.lastTreeitem = null;

};

Tree.prototype.init = function () {

  function findTreeitems(node, tree, group) {

    var elem = node.firstElementChild;
    var ti = group;

    while (elem) {

      if (elem.tagName.toLowerCase() === 'li' && ($(elem).is('.parentNode') || $(elem).is('.endNode'))) {
        ti = new Treeitem(elem, tree, group);
        ti.init();
        tree.treeitems.push(ti);
        tree.firstChars.push(ti.label.substring(0, 1).toLowerCase());
      }

      if (elem.firstElementChild) {
        findTreeitems(elem, tree, ti);
      }

      elem = elem.nextElementSibling;
    }
  }

  // initialize pop up menus
  if (!this.domNode.getAttribute('role')) {
    this.domNode.setAttribute('role', 'tree');
  }

  findTreeitems(this.domNode, this, false);

  this.updateVisibvarreeitems();

  this.firstTreeitem.domNode.tabIndex = 0;

};

Tree.prototype.setFocusToItem = function (treeitem) {

  for (var i = 0; i < this.treeitems.length; i++) {
    var ti = this.treeitems[i];

    if (ti === treeitem) {
      ti.domNode.tabIndex = 0;
      ti.domNode.focus();
    }
    else {
      ti.domNode.tabIndex = -1;
    }
  }

};

Tree.prototype.setFocusToNextItem = function (currentItem) {

  var nextItem = false;

  for (var i = (this.treeitems.length - 1); i >= 0; i--) {
    var ti = this.treeitems[i];
    if (ti === currentItem) {
      break;
    }
    if (ti.isVisible) {
      nextItem = ti;
    }
  }

  if (nextItem) {
    this.setFocusToItem(nextItem);
  }

};

Tree.prototype.setFocusToPreviousItem = function (currentItem) {

  var prevItem = false;

  for (var i = 0; i < this.treeitems.length; i++) {
    var ti = this.treeitems[i];
    if (ti === currentItem) {
      break;
    }
    if (ti.isVisible) {
      prevItem = ti;
    }
  }

  if (prevItem) {
    this.setFocusToItem(prevItem);
  }
};

Tree.prototype.setFocusToParentItem = function (currentItem) {

  if (currentItem.groupTreeitem) {
    this.setFocusToItem(currentItem.groupTreeitem);
  }
};

Tree.prototype.setFocusToFirstItem = function () {
  this.setFocusToItem(this.firstTreeitem);
};

Tree.prototype.setFocusToLastItem = function () {
  this.setFocusToItem(this.lastTreeitem);
};

Tree.prototype.expandTreeitem = function (currentItem) {

  if (currentItem.isExpandable) {
    currentItem.domNode.setAttribute('aria-expanded', true);
    this.updateVisibvarreeitems();
    scrollIntoView($(document.activeElement));
  }

};

Tree.prototype.expandAllSiblingItems = function (currentItem) {
  for (var i = 0; i < this.treeitems.length; i++) {
    var ti = this.treeitems[i];

    if ((ti.groupTreeitem === currentItem.groupTreeitem) && ti.isExpandable) {
      this.expandTreeitem(ti);
    }
  }

};

Tree.prototype.collapseTreeitem = function (currentItem) {

  var groupTreeitem = false;

  if (currentItem.isExpanded()) {
    groupTreeitem = currentItem;
  }
  else {
    groupTreeitem = currentItem.groupTreeitem;
  }

  if (groupTreeitem) {
    groupTreeitem.domNode.setAttribute('aria-expanded', false);
    this.updateVisibvarreeitems();
    this.setFocusToItem(groupTreeitem);
  }
};

Tree.prototype.updateVisibvarreeitems = function () {

  this.firstTreeitem = this.treeitems[0];

  for (var i = 0; i < this.treeitems.length; i++) {
    var ti = this.treeitems[i];

    var parent = ti.domNode.parentNode;

    ti.isVisible = true;

    while (parent && (parent !== this.domNode)) {

      if (parent.getAttribute('aria-expanded') == 'false') {
        ti.isVisible = false;
      }
      parent = parent.parentNode;
    }

    if (ti.isVisible) {
      this.lastTreeitem = ti;
    }
  }

};

Tree.prototype.setFocusByFirstCharacter = function (currentItem, char) {
  var start, index, char = char.toLowerCase();

  // Get start index for search based on position of currentItem
  start = this.treeitems.indexOf(currentItem) + 1;
  if (start === this.treeitems.length) {
    start = 0;
  }

  // Check remaining slots in the menu
  index = this.getIndexFirstChars(start, char);

  // If not found in remaining slots, check from beginning
  if (index === -1) {
    index = this.getIndexFirstChars(0, char);
  }

  // If match was found...
  if (index > -1) {
    this.setFocusToItem(this.treeitems[index]);
  }
};

Tree.prototype.getIndexFirstChars = function (startIndex, char) {
  for (var i = startIndex; i < this.firstChars.length; i++) {
    if (this.treeitems[i].isVisible) {
      if (char === this.firstChars[i]) {
        return i;
      }
    }
  }
  return -1;
};

/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*
*   File:   Treeitem.js
*
*   Desc:   Treeitem widget that implements ARIA Authoring Practices
*           for a tree being used as a file viewer
*/

/*
*   @varructor
*
*   @desc
*       Treeitem object for representing the state and user interactions for a
*       treeItem widget
*
*   @param node
*       An element with the role=tree attribute
*/

var Treeitem = function (node, treeObj, group) {

  // Check whether node is a DOM element
  if (typeof node !== 'object') {
    return;
  }

  node.tabIndex = -1;
  this.tree = treeObj;
  this.groupTreeitem = group;
  this.domNode = node;
  this.label = node.textContent.trim();

  if (node.getAttribute('aria-label')) {
    this.label = node.getAttribute('aria-label').trim();
  }

  this.isExpandable = false;
  this.isVisible = false;
  this.inGroup = false;

  if (group) {
    this.inGroup = true;
  }

  var elem = node.firstElementChild;

  while (elem) {

    if (elem.tagName.toLowerCase() == 'ul') {
      elem.setAttribute('role', 'group');
      this.isExpandable = true;
      break;
    }

    elem = elem.nextElementSibling;
  }

  this.keyCode = Object.freeze({
    RETURN: 13,
    SPACE: 32,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  });
};

Treeitem.prototype.init = function () {
  this.domNode.tabIndex = -1;

  if (!this.domNode.getAttribute('role')) {
    this.domNode.setAttribute('role', 'treeitem');
  }

  this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
  this.domNode.addEventListener('click', this.handleClick.bind(this));
  this.domNode.addEventListener('focus', this.handleFocus.bind(this));
  this.domNode.addEventListener('blur', this.handleBlur.bind(this));

  if (!this.isExpandable) {
    this.domNode.addEventListener('mouseover', this.handleMouseOver.bind(this));
    this.domNode.addEventListener('mouseout', this.handleMouseOut.bind(this));
  }
};

Treeitem.prototype.isExpanded = function () {

  if (this.isExpandable) {
    return this.domNode.getAttribute('aria-expanded') === 'true';
  }

  return false;

};

/* EVENT HANDLERS */

Treeitem.prototype.handleKeydown = function (event) {

  var tgt = event.currentTarget,
    flag = false,
    char = event.key,
    clickEvent;

  function isPrintableCharacter(str) {
    return str.length === 1 && str.match(/\S/);
  }

  function printableCharacter(item) {
    if (char == '*') {
      item.tree.expandAllSiblingItems(item);
      flag = true;
    }
    else {
      if (isPrintableCharacter(char)) {
        item.tree.setFocusByFirstCharacter(item, char);
        flag = true;
      }
    }
  }

  if (event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  if (event.shift) {
    if (isPrintableCharacter(char)) {
      printableCharacter(this);
    }
  }
  else {
    switch (event.keyCode) {
      case this.keyCode.SPACE:
      case this.keyCode.RETURN:
        // Create simulated mouse event to mimic the behavior of ATs
        // and var the event handler handleClick do the housekeeping.
        try {
          clickEvent = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true
          });
        }
        catch (err) {
          if (document.createEvent) {
            // DOM Level 3 for IE 9+
            clickEvent = document.createEvent('MouseEvents');
            clickEvent.initEvent('click', true, true);
          }
        }

        /* Edit to ARIA code: handle this event through "cycleSelect()"
        defined near the bottom of this file */
        // tgt.dispatchEvent(clickEvent);
        if ($(document.activeElement).is('input:checkbox')) {
          break;
        }
        cycleSelect($(tgt));

        flag = true;
        break;

      case this.keyCode.UP:
        this.tree.setFocusToPreviousItem(this);
        flag = true;
        break;

      case this.keyCode.DOWN:
        this.tree.setFocusToNextItem(this);
        flag = true;
        break;

      case this.keyCode.RIGHT:
        if (this.isExpandable) {
          if (this.isExpanded()) {
            this.tree.setFocusToNextItem(this);
          }
          else {
            this.tree.expandTreeitem(this);
          }
        }
        /* Edit to ARIA code: expand text of clauses */
        else {
          toggleClauseText($(document.activeElement), true);
        }
        flag = true;
        break;

      case this.keyCode.LEFT:
        /* Edit to ARIA code: collapse text of clauses */
        if ($(document.activeElement).is('.endNode[aria-expanded="true"]')) {
          toggleClauseText($(document.activeElement), false);
          flag = true;
        }
        else if (this.isExpandable && this.isExpanded()) {
          this.tree.collapseTreeitem(this);
          flag = true;
        }
        else {
          if (this.inGroup) {
            this.tree.setFocusToParentItem(this);
            flag = true;
          }
        }
        break;

      case this.keyCode.HOME:
        this.tree.setFocusToFirstItem();
        flag = true;
        break;

      case this.keyCode.END:
        this.tree.setFocusToLastItem();
        flag = true;
        break;

      default:
        if (isPrintableCharacter(char)) {
          printableCharacter(this);
        }
        break;
    }

  }

  if (flag) {
    event.stopPropagation();
    event.preventDefault();
  }
};

Treeitem.prototype.handleClick = function (event) {
  /* Edit to ARIA code: expand or collapse text of clauses */
  if ($(document.activeElement).is('.endNode[aria-expanded="true"]')) {
    if (!$(event.target).is('.checkbox') && !$(event.target).is('i')) {
      return;
    }
    toggleClauseText($(document.activeElement), false);
    event.stopPropagation();
  }
  else if ($(document.activeElement).is('.endNode[aria-expanded="false"]')) {
    toggleClauseText($(document.activeElement), true);
    event.stopPropagation();
  }
  else if (this.isExpandable) {
    if (this.isExpanded()) {
      this.tree.collapseTreeitem(this);
    }
    else {
      this.tree.expandTreeitem(this);
    }
    event.stopPropagation();
  }
  else {
    this.tree.setFocusToItem(this);
  }
};

Treeitem.prototype.handleFocus = function (event) {
  var node = this.domNode;
  if (this.isExpandable) {
    node = node.firstElementChild;
  }
  node.classList.add('focus');
};

Treeitem.prototype.handleBlur = function (event) {
  var node = this.domNode;
  if (this.isExpandable) {
    node = node.firstElementChild;
  }
  node.classList.remove('focus');
};

Treeitem.prototype.handleMouseOver = function (event) {
  event.currentTarget.classList.add('hover');
};

Treeitem.prototype.handleMouseOut = function (event) {
  event.currentTarget.classList.remove('hover');
};


/*
Application-specific code
*/
$(document).on("wb-ready.wb", function (event) {

  // Set aria-checked state on <li> based on 'checked' state of child <input>
  $('[role="treeitem"]').each(function () {
    updateAriaChecked($(this));
  });

  $('[role="treeitem"] input:checkbox').click(function (event) {
    // console.log('tree checkbox clicked');
    // event.preventDefault();
    $node = $(this).closest('li');
    cycleSelect($node);
    event.stopImmediatePropagation();
    // event.stopPropagation();
  });

  $('[role="treeitem"] label').click(function (event) {
    // State of the checkbox must be handled through JS to match
    // aria-checked property of parent
    event.preventDefault();
    $node = $(this).closest('li');
    cycleSelect($node);
    event.stopImmediatePropagation();
    event.stopPropagation();
  });

  // Ensure that focused treeitem is visible
  $('[role="treeitem"]').focus(function () {
    if ($(this).offset().top < $(window).scrollTop()) {
      alignToTop($(this));
    }
    else if ($(this).is('.endNode') || $(this).is('[aria-expanded="false"]')) {
      scrollIntoView($(this));
    }
  });

});

// {checkboxId: true/false, checkbox2Id: true/false, ...}
var selectionStates = {};

// Cycles state of checkboxes, acting on <input> elements only
// Calls updateAriaChecked to clean up aria properties / indeterminate states
var cycleSelect = function ($node) {
  var state = getState($node);
  // console.log($node);
  if (state === 'mixed') {
    // If clearing a mixed state, save the state for later
    // Then, the next state is 'checked'
    $node.find('input').each(function () {
      var id = $(this).attr('id');
      selectionStates[id] = $(this).is(':checked');
      $(this).prop('checked', true);
    });
  }
  else if (state === 'true') {
    // Next state is off
    $node.find('input').each(function () {
      $(this).prop('checked', false);
    });
  }
  else if (state === 'false') {
    // Next state is restoring the mixed state
    $node.find('input').each(function () {
      var id = $(this).attr('id');
      var oldState = selectionStates[id];
      if (oldState === undefined) {
        oldState = true;
      }
      $(this).prop('checked', oldState);
    });
    // If all children remain unchecked, toggle to 'checked'
    if ($node.find('input:checked').not(':first').length === 0) {
      $node.find('input').each(function () {
        var id = $(this).attr('id');
        selectionStates[id] = undefined;
        $(this).prop('checked', true);
      });
    }
  }

  updateAriaChecked($node);

  // Update children to match rules
  $node.find('li').each(function () {
    updateAriaChecked($(this));
  });

  // Updating parents to match rules, walking the tree to the root node
  while (!$node.parent('ul').is('[role="tree"]')) {
    $node = $node.parent('ul').closest('[role="treeitem"]');
    updateAriaChecked($node);
  }
};

var getState = function ($node) {
  return $node[0].getAttribute('aria-checked');
}

// Define the expected boolean behaviour of mixed checkboxes
var checkIfMixed = true;

// Updates aria-checked property of treeitems to follow checkboxes
// and sets indeterminate state of checkboxes
var updateAriaChecked = function ($node) {
  var checked = false;
  if ($node.is('.endNode')) {
    // For an end node, follow the state of its (sole) checkbox input
    checked = $node.find('input:checkbox:checked').length > 0;
  } else if ($node.find('input:checkbox:checked').length === $node.find('input:checkbox').length) {
    // For a parent node, only checked if all children are checked
    checked = true;
    // Update indeterminate property to match
    $node.find('input:checkbox:checked:first').prop('indeterminate', false);
  } else if ($node.find('input:checkbox').not(':first').not('.informative').is(':checked')) {
    // Parent node has "mixed" state if some but not all children are checked
    checked = 'mixed';
    // Update indeterminate property to match
    var parentNode = $node.find('input:checkbox:first');
    parentNode.prop('indeterminate', true);
    parentNode.prop('checked', checkIfMixed);
  } else {
    // When no children are checked, parent cannot be checked either
    checked = false;
    var parentNode = $node.find('input:checkbox:first');
    parentNode.prop('indeterminate', false);
    parentNode.prop('checked', false);
  }
  $node[0].setAttribute('aria-checked', checked);
  // Application specific: Parent node might have an informative child
  if ($node.is('.parentNode')) {
    selectInformative($node);
  }
};

// Application specific: Select child informative clauses automatically
var selectInformative = function ($node) {
  var $informative = $node.children('ul').children('li.informative').find('input.informative');
  if ($informative.length > 0) {
    var checked = (getState($node) !== 'false');
    $informative.prop('checked', checked);
    $informative.each(function () {
      $(this).closest('li')[0].setAttribute('aria-checked', checked);
    });
  }
}

// Expand text of child clauses
var toggleClauseText = function ($node, value, noScroll) {
  $node.attr('aria-expanded', value);
  if (!noScroll) {
    scrollIntoView($node);
  }
}

var alignToTop = function ($node) {
  window.scrollTo({
    top: $node.offset().top,
    left: $node.offset().left,
    behavior: 'smooth'
  });
}

var alignToBottom = function ($node) {
  window.scrollTo({
    top: $node.offset().top + $node.height() - $(window).height(),
    left: $node.offset().left,
    behavior: 'smooth'
  });
}

var scrollIntoView = function ($node) {
  // When clause expands below the fold, scroll down to show
  // (align bottom of clause with bottom of viewport)
  var rect = $node[0].getBoundingClientRect();
  if (rect.bottom > $(window).height() && $node.height() <= $(window).height()) {
    alignToBottom($node);
  }
  // If clause is too long to show on one screen, scroll somewhat
  // (align top of clause with top of viewport)
  else if ($node.height() > $(window).height()) {
    alignToTop($node);
  }
}