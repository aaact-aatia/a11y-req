const async = require('async');

const { JSDOM } = require('jsdom');
const innertext = require('innertext');

const Clause = require('../models/clauseSchema');
const Preset = require('../models/presetSchema.js');

const strings = {
  listTitle: 'Edit clauses',
  createTitle: 'Create clause',
  clauseNameRequired: 'Clause name required',
  clauseNumberRequired: 'Clause number required',
  deleteClause: 'Delete clause',
  editClause: 'Edit clause',
  clauseNotFound: 'Clause not found',
  updateClause: 'Update clause'
}

// Display list of all Clauses
exports.clause_list = (req, res, next) => {
  Clause.find()
    .exec((err, list_clauses) => {
      if (err) { return next(err); }
      list_clauses = list_clauses.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
      res.render('item_list', {
        title: strings.listTitle,
        item_list: list_clauses,
        type: 'clause',
        breadcrumbs: [
          { url: '/', text: 'Home' },
          { url: '/edit', text: 'Edit content' }
        ]
      });
    });
};

// Display clause create form on GET
exports.clause_create_get = (req, res, next) => {
  res.render('clause_form', {
    title: strings.createTitle,
    breadcrumbs: [
      { url: '/', text: 'Home' },
      { url: '/edit', text: 'Edit content' },
      { url: '/edit/clauses', text: 'Edit clauses' }
    ]
  });
};

// Handle Clause create on POST
exports.clause_create_post = (req, res, next) => {

  let clause = new Clause({
    number: req.body.number,
    name: req.body.name,
    frName: req.body.frName,
    informative: req.body.informative === 'on',
    description: req.body.description,
    frDescription: req.body.frDescription,
    compliance: req.body.compliance,
    frCompliance: req.body.frCompliance
  });

  // Check if Clause with same name already exists.
  Clause.findOne({ 'number': req.body.number }).exec((err, found_clause) => {
    if (err) { return next(err); }
    if (found_clause) {
      // Clause exists, redirect to its detail page.
      res.redirect(found_clause.url);
    } else {
      clause.save((err) => {
        if (err) { return next(err); }
        // Clause saved. Redirect to clause list.
        res.redirect('/edit/clauses');
      });
    }
  });
};

// Display clause update form on GET
exports.clause_update_get = (req, res, next) => {

  // Get clause for form
  async.parallel({
    clause: (callback) => Clause.findById(req.params.id).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.clause == null) { // No results
      let err = new Error(strings.clauseNotFound);
      err.status = 404;
      return next(err);
    }
    // Success.
    res.render('clause_form', {
      title: strings.editClause,
      item: results.clause,
      breadcrumbs: [
        { url: '/', text: 'Home' },
        { url: '/edit', text: 'Edit content' },
        { url: '/edit/clauses', text: 'Edit clauses' }
      ]
    });
  });
};

// Handle clause update on POST.
exports.clause_update_post = (req, res, next) => {

  // Create a clause object with old id.
  let clause = new Clause({
    number: req.body.number,
    name: req.body.name,
    frName: req.body.frName,
    informative: req.body.informative === 'on',
    description: req.body.description,
    frDescription: req.body.frDescription,
    compliance: req.body.compliance,
    frCompliance: req.body.frCompliance,
    weight: req.body.weight,
    _id: req.params.id // This is required, or a new ID will be assigned
  });

  Clause.findByIdAndUpdate(req.params.id, clause, {}, (err, theclause) => {
    if (err) { return next(err); }
    res.redirect('/edit/clauses'); // Success: redirect to clause list.
  });
};

// Display Clause delete form on GET.
exports.clause_delete_get = (req, res, next) => {
  async.parallel({
    clause: (callback) => Clause.findById(req.params.id).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.clause == null) { res.redirect('/edit/clauses'); }
    res.render('item_delete', {
      title: strings.deleteClause,
      item: results.clause,
      breadcrumbs: [
        { url: '/', text: 'Home' },
        { url: '/edit', text: 'Edit content' },
        { url: '/edit/clauses', text: 'Edit clauses' },
        { url: results.clause.url, text: results.clause.name }
      ]
    });
  });
};

// Handle Clause delete on POST.
exports.clause_delete_post = (req, res, next) => {

  async.parallel({
    clause: (callback) =>
      Clause.findById(req.body.itemid).exec(callback),
    clause_presets: (callback) =>
      Preset.find({ clauses: req.body.itemid }).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.clause_presets.length > 0) {
      // Clause has presets referencing it which must be deleted first
      res.render('item_delete', {
        title: strings.deleteClause,
        item: results.clause,
        dependencies: results.clause_presets,
        breadcrumbs: [
          { url: '/', text: 'Home' },
          { url: '/edit', text: 'Edit content' },
          { url: '/edit/clauses', text: 'Edit clauses' },
          { url: results.clause.url, text: results.clause.name }
        ]
      });
      return;
    }

    // Delete object and redirect to the list of clauses
    Clause.findByIdAndRemove(req.body.itemid, (err) => {
      if (err) { return next(err); }
      res.redirect('/edit/clauses'); // Success - go to clause list
    })
  });
};

// Populate clauses from HTML files
// HTML converted from Word at docconverter.pro
exports.clause_populate = (req, res, next) => {

  // Convert HTML to array of objects following database schema:
  /* clause = {
    number: c.number,
    name: c.name,
    frName: c.frName,
    informative: c.informative === 'on',
    description: c.description,
    frDescription: c.frDescription,
    compliance: c.compliance,
    frCompliance: c.frCompliance
  } */

  JSDOM.fromFile('english.html').then(dom => {
    console.log("file loaded");
    let document = dom.window.document;

    // Replace DOM body with modified htmlString
    let htmlString = document.querySelector('body').innerHTML;
    document.querySelector('body').innerHTML = regexHtml(htmlString);

    // Extract clauses
    let clauses = [];
    let rows = document.querySelectorAll('tbody tr');
    for (let i = 0; i < rows.length; i++) {
      let clause = {};
      let cells = rows[i].querySelectorAll('td');
      // Extract clause information from HTML and add to clause object
      let descriptionCell = cells[0];
      let complianceCell = cells[1];
      let clauseNameNumber = innertext(descriptionCell.querySelector('p').innerHTML).replace(/(\r\n|\n|\r)/gm, " ").trim();
      clause.number = clauseNameNumber.substr(0, clauseNameNumber.indexOf(" "));
      clause.name = clauseNameNumber.substr(clauseNameNumber.indexOf(" ") + 1);
      clause.informative = clauseNameNumber.indexOf("nformative") > -1;
      let descriptionHTML = descriptionCell.innerHTML;
      clause.description = descriptionHTML.substr(descriptionHTML.indexOf('</p>') + 4).replace(/(\r\n|\n|\r)/gm, " ").trim();
      let complianceHTML = complianceCell.innerHTML;
      clause.compliance = complianceHTML.substr(complianceHTML.indexOf('</p>') + 4).replace(/(\r\n|\n|\r)/gm, " ").trim();
      clauses.push(clause);
    }

    // Add French HTML content, asserting that clause numbers are equal
    JSDOM.fromFile('french.html').then(dom => {
      let document = dom.window.document;

      // Replace DOM body with modified htmlString
      let htmlString = document.querySelector('body').innerHTML;
      document.querySelector('body').innerHTML = regexHtml(htmlString);

      // Extract clauses
      let rows = document.querySelectorAll('tbody tr');
      console.log(`English clauses length is ${clauses.length}, french rows is ${rows.length}`);
      for (let i = 0; i < rows.length; i++) {
        // Get clause with English information
        let clause = clauses[i];
        let cells = rows[i].querySelectorAll('td');
        // Extract clause information from HTML and add to clause object
        let descriptionCell = cells[0];
        let complianceCell = cells[1];
        let clauseNameNumber = innertext(descriptionCell.querySelector('p').innerHTML).replace(/(\r\n|\n|\r)/gm, " ").trim();
        clause.frName = clauseNameNumber.substr(clauseNameNumber.indexOf(" ") + 1);
        let descriptionHTML = descriptionCell.innerHTML;
        clause.frDescription = descriptionHTML.substr(descriptionHTML.indexOf('</p>') + 4).replace(/(\r\n|\n|\r)/gm, " ").trim();
        let complianceHTML = complianceCell.innerHTML;
        clause.frCompliance = complianceHTML.substr(complianceHTML.indexOf('</p>') + 4).replace(/(\r\n|\n|\r)/gm, " ").trim();
      }

      // Array of clauses is now populated. Insert documents in database.
      for (c of clauses) {
        let clause = new Clause(c);

        clause.save((err) => {
          if (err) { return next(err); }
          // Clause saved
          // console.log(`Inserted clause: ${clause.number} ${clause.name}`);
        });
      }
      res.redirect('/edit/clauses'); // Success - go to clause list
    });
  });

};

// Replaces:

// <p class="NormalBOLD"(.*?)>\n(.*?)\n(.*?)</p>
// <p><strong>$2</strong></p>

// <td[^>]*> replaced with <td>
// <p[^>]*> replaced with <p>
// <ul[^>]*> replaced with <ul>
// <li[^>]*> replaced with <li>
// <span[^>]*> replaced with (nothing)
// </span> replaced with (nothing)

// <ol style="margin:0pt; padding-left:0pt; list-style-type:lower-latin">
// <ol style="list-style-type:lower-latin">

// \n and \t replaced with " "
// "  " replaced with " " until none left
// </ol> <ol(.*?)> replaced with (nothing)
// <li> <p>(.+?)</p> replaced with <li>$1</li>
const regexHtml = function(htmlString) {
  // Perform string replaces as described above on htmlString
  htmlString = htmlString.replace(/\s\s+/gm, ' ');
  htmlString = htmlString.replace(/<p class="NormalBOLD"(.*?)> (.*?) <\/p>/gm, '<p><strong>$2</strong></p>');
  htmlString = htmlString.replace(/<td(.*?)>/gm, '<td>');
  htmlString = htmlString.replace(/<p(.*?)>/gm, '<p>');
  htmlString = htmlString.replace(/<ul(.*?)>/gm, '<ul>');
  htmlString = htmlString.replace(/<li(.*?)>/gm, '<li>');
  htmlString = htmlString.replace(/<span(.*?)>/gm, '');
  htmlString = htmlString.replace(/<\/span>/gm, '');
  htmlString = htmlString.replace(/<ol style="margin:0pt; padding-left:0pt; list-style-type:lower-latin">/gm, '<ol style="list-style-type:lower-alpha">');
  htmlString = htmlString.replace(/<\/ol> <ol(.*?)>/gm, '');
  htmlString = htmlString.replace(/<a(.*?)style="(.*?)"/gm, '<a$1');
  htmlString = htmlString.replace(/\.<\/a>/gm, '</a>.');
  htmlString = htmlString.replace(/\. <\/a>/gm, '</a>.');
  console.log(htmlString.substring(0,1000));
  return htmlString;
}