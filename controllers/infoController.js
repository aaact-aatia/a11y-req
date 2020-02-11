const async = require('async');

const Info = require('../models/infoSchema');

const strings = {
  editListTitle: 'Edit content',
  listTitle: 'Edit informative sections',
  createTitle: 'Create informative section',
  sectionTitleRequired: 'Section title required'
}

// Display edit menu
exports.edit_list = (req, res, next) => {
  res.render('edit', {
    title: strings.editListTitle,
    breadcrumbs: [{ url: '/', text: 'Home' }]
  });
};

// Display list of all Infos
exports.info_list = (req, res, next) => {

  Info.find()
    .sort([['order', 'ascending']])
    .exec((err, list_infos) => {
      if (err) { return next(err); }
      res.render('item_list', {
        title: strings.listTitle,
        item_list: list_infos,
        type: 'info',
        breadcrumbs: [
          { url: '/', text: 'Home' },
          { url: '/edit', text: 'Edit content' }
        ]
      });
    });
};

// Display info create form on GET
exports.info_create_get = (req, res, next) => {
  res.render('info_form', {
    title: strings.createTitle,
    breadcrumbs: [
      { url: '/', text: 'Home' },
      { url: '/edit', text: 'Edit content' },
      { url: '/edit/infos', text: 'Edit informative sections' }
    ]
  });
};

// Handle Info create on POST
exports.info_create_post = (req, res, next) => {

  let info = new Info({
    name: req.body.name,
    showHeading: req.body.showHeading === 'on',
    bodyHtml: req.body.bodyHtml,
    frName: req.body.frName,
    order: req.body.order,
    frBodyHtml: req.body.frBodyHtml
  });

  // Check if Info with same name already exists.
  Info.findOne({ 'name': req.body.name })
    .exec((err, found_info) => {
      if (err) { return next(err); }
      if (found_info) {
        res.redirect(found_info.url);
      } else {
        info.save((err) => {
          if (err) { return next(err); }
          // Info saved. Redirect to infos list.
          res.redirect('/edit/infos');
        });
      }
    });
};

// Display info update form on GET
exports.info_update_get = (req, res, next) => {

  // Get info for form
  async.parallel({
    info: (callback) => Info.findById(req.params.id).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.info == null) { // No results.
      let err = new Error('Info not found');
      err.status = 404;
      return next(err);
    }
    res.render('info_form', {
      title: 'Edit info',
      item: results.info,
      breadcrumbs: [
        { url: '/', text: 'Home' },
        { url: '/edit', text: 'Edit content' },
        { url: '/edit/infos', text: 'Edit informative sections' }
      ]
    });
  });
};

// Handle info update on POST.
exports.info_update_post = (req, res, next) => {

  // Create an info object with old id.
  let info = new Info({
    name: req.body.name,
    showHeading: req.body.showHeading === 'on',
    bodyHtml: req.body.bodyHtml,
    frName: req.body.frName,
    frBodyHtml: req.body.frBodyHtml,
    order: req.body.order,
    _id: req.params.id // This is required, or a new ID will be assigned
  });

  Info.findByIdAndUpdate(req.params.id, info, {}, (err, theinfo) => {
    if (err) { return next(err); }
    // Successful - redirect to infos list.
    res.redirect('/edit/infos');
  });
};

// Display Info delete form on GET.
exports.info_delete_get = (req, res, next) => {

  async.parallel({
    info: (callback) => Info.findById(req.params.id).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    if (results.info == null) { // No results.
      res.redirect('/edit/infos');
    }
    // Successful, so render.
    res.render('item_delete', {
      title: 'Delete Info',
      item: results.info,
      breadcrumbs: [
        { url: '/', text: 'Home' },
        { url: '/edit', text: 'Edit content' },
        { url: '/edit/infos', text: 'Edit informative sections' },
        { url: results.info.url, text: results.info.name }
      ]
    });
  });
};

// Handle Info delete on POST.
exports.info_delete_post = (req, res, next) => {

  async.parallel({
    info: (callback) => Info.findById(req.body.itemid).exec(callback)
  }, (err, results) => {
    if (err) { return next(err); }
    // Success. Delete object and redirect to the list of infos.
    Info.findByIdAndRemove(req.body.itemid, (err) => {
      if (err) { return next(err); }
      // Success - go to info list
      res.redirect('/edit/infos');
    })
  });
};