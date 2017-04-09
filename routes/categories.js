var express = require('express');
var router = express.Router();
let mongo = require('mongodb');
let db = require('monk')('localhost/nodeblog');

router.get('/show/:category', (req, res, next) => {
  let posts = db.get('posts');
	posts.find({category: req.params.category}, {}, function(err, posts) {
		res.render('index',{
			'title': req.params.category,
			'posts': posts
		});
	});
});

router.get('/add', (req, res, next) => {
  res.render('addcategory', {
    'title': 'Add category'
  });
});

router.post('/add', (req, res, next) => {
  // Get Form Values
  let name = req.body.name;

  // Form Validation
  req.checkBody('name', 'Name field is required').notEmpty();

  // Check Errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('addcategory', {
      'errors': errors
    });
  } else {
    let categories = db.get('categories');
    categories.insert({
      'name': name,
    }, (err, post) => {
      if (err) {
        res.send(err);
      } else {
        req.flash('success', 'Category Added');
        res.location('/');
        res.redirect('/');
      }
    })
  }
});

module.exports = router;
