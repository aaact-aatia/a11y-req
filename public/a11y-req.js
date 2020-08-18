// Client side scripts for a11y-req
// NOT FOR WET OVERRIDES

$(document).on("wb-ready.wb", function (event) {

  // setupPresetHandler();

  setupTreeHandler();

  setupWizardHandler();

  setupClauseListHandler();

  // Replace <textarea> with rich text editor (CKEditor)
  // https://stackoverflow.com/questions/46559354/how-to-set-the-height-of-ckeditor-5-classic-editor/56550285#56550285
  function MinHeightPlugin(editor) {
    this.editor = editor;
  };

  MinHeightPlugin.prototype.init = function () {
    this.editor.ui.view.editable.extendTemplate({
      attributes: {
        style: {
          maxHeight: '400px'
        }
      }
    });
  };

  ClassicEditor.builtinPlugins.push(MinHeightPlugin);

  $('textarea').each(function () {
    if (!$(this).hasClass('no-editor')) {
      initCK(this, $(this).attr('lang') === 'fr' ? 'fr' : 'en');
    }
  });
});


/* Manual clause list handling */

var setupClauseListHandler = function () {
  // #clauseList is the <textarea> element (see /views/wizard.pug)
  $('#clauseList').change(function () { updateClauseSelections(); });
};

var updateClauseSelections = function () {
  var clauseList = $('#clauseList').val();
  // Uncheck all checkboxes
  $('#clauses input').prop('checked', false);
  // Clean up clause list text
  clauseList = clauseList.replace(/[a-z]|,/gi, '');
  var clauses = clauseList.split(' ');
  // console.log(clauses);
  for (var i = 0; i < clauses.length; i++) {
    var clause = clauses[i];
    if (clause.length < 1) {
      continue;
    }
    if (clause[clause.length - 1] === '.') {
      clause = clause.substr(0, clause.length - 1);
    }
    $('input[data-number="' + clause + '"]').prop('checked', true);
  }

  $('[role="treeitem"]').each(function () {
    updateAriaChecked($(this));
  });

  $('[role="treeitem"]').each(function () {
    updateAriaChecked($(this));
  });
};


/* Tree menu selection */

var setupTreeHandler = function () {
  $('#selectAll').click(function (e) {
    $('#clauses input').prop('checked', true).prop('indeterminate', false);
    $('[role="treeitem"]').attr('aria-checked', true);
    e.preventDefault();
  });
  $('#selectNone').click(function (e) {
    selectNone();
    e.preventDefault();
  });
  $('#expandAll').click(function (e) {
    $('li.parentNode').attr('aria-expanded', true);
    $('li.endNode').each(function () {
      toggleClauseText($(this), true, true);
    });
    e.preventDefault();
  });
  $('#expandTree').click(function (e) {
    console.log("Why is this being called by the enter key on checkboxes?");//debug statement
    $('li.parentNode').attr('aria-expanded', true);
    e.preventDefault();
  });
  $('#collapseAll').click(function (e) {
    $('li.parentNode').attr('aria-expanded', false);
    $('li.endNode').each(function () {
      toggleClauseText($(this), false);
    });
    e.preventDefault();
  });
  $('#openClauseList').click(function (e) {
    $('li.parentNode').attr('aria-expanded', true);
    $('li.endNode').each(function () {
      toggleClauseText($(this), true, true);
    });
    e.preventDefault();
  });
};

/* CKEditor */

var initCK = function (element, lang) {
  ClassicEditor
    .create(element, {
      language: {
        ui: 'en',
        content: lang
      },
      removePlugins: [],
      // plugins: [ 'Base64UploadAdapter' ],
      toolbar: ['heading', 'bold', 'italic', 'bulletedList', 'numberedList', 'link', 'undo', 'redo', 'imageUpload', 'imageTextAlternative', 'insertTable']
    })
    .then(function (editor) {
      // console.log(editor);
      // console.log(Array.from(editor.ui.componentFactory.names()));
    })
    .catch(function (error) { console.error(error); });

  // console.log(ClassicEditor.builtinPlugins.map(plugin => plugin.pluginName));
};

/* Wizard questions */

var setupWizardHandler = function () {

  wizardChanged = false;

  $(document).on("wb-updated.wb-tabs", ".wb-tabs", function (event, $newPanel) {
    if (wizardChanged) {
      updateWizard();
      wizardChanged = false;
    }
  });

  $('#wizard input').change(function () { wizardChanged = true; })

  // Focus highlighting
  // $('#wizard input').focus(function () { $(this).closest('.checkbox').addClass('focus'); });
  // $('#wizard input').blur(function () { $(this).closest('.checkbox').removeClass('focus'); });
};

var selectClauses = function (clauses, select) {
  $clauses = $('#clauses');
  for (var i = 0; i < clauses.length; i++) {
    var clauseNum = clauses[i];
    // Find the id of the clause checkbox
    $clause = $clauses.find('input[data-number="' + clauseNum + '"]');
    if (select) {
      if (!$clause.is(':checked')) {
        $clause.click();
      }
    } else {
      if ($clause.is(':checked')) {
        $clause.click();
      }
    }
  }
}

var selectNone = function () {
  $('#clauses input').prop('checked', false).prop('indeterminate', false);
  $('[role="treeitem"]').attr('aria-checked', false);
};

var updateWizard = function () {
  selectNone();

  // Select relevant Step 2 clauses based on Step 1 selections
  $('#wizard input:checked').not('.onlyIf').each(function () {
    var presetId = this.id;
    $('#preset-data ul[data-preset-id='+presetId+'] li').each(function () {
      $clause = $('#'+this.innerHTML);
      if (!$clause.is(':checked')) {
        $clause.click();
      }
    });
  });

  // Deselect irrelevant Step 2 clauses based on Step 1 "if and only if" selections
  $('#wizard input.onlyIf').not(':checked').each(function () {
    var presetId = this.id;
    $('#preset-data ul[data-preset-id='+presetId+'] li').each(function () {
      $clause = $('#'+this.innerHTML);
      if ($clause.is(':checked') && $clause.closest('li').hasClass('endNode')) {
        $clause.click();
      }
    });
  });

};

/* Generator preset handling */

// var setupPresetHandler = function () {
//   // #preset is the <select> element (see /views/select_fps.pug)
//   $('#preset').change(function () { updatePresetSelections(); });
// };

// var updatePresetSelections = function () {
//   var preset = $('#preset').val();
//   // Save existing selections

//   // Uncheck all checkboxes
//   $('#clauses input').prop('checked', false);
//   // Get hidden preset data (see /views/select_fps.pug)
//   $('#' + preset + ' li').each(function () {
//     // Check the preset checkboxes
//     $('#' + this.innerHTML).prop('checked', true);
//   });
//   $('[role="treeitem"]').each(function () {
//     updateAriaChecked($(this));
//   });
// };