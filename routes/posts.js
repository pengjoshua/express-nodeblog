let express = require('express');
let router = express.Router();
let multer = require('multer');
let upload = multer({ dest: './public/images' })
let mongo = require('mongodb');
let db = require('monk')('localhost/nodeblog');

router.get('/show/:id', function(req, res, next) {
	let posts = db.get('posts');

	posts.findById(req.params.id, function(err, post) {
		res.render('show',{
  			'post': post
  		});
	});
});

router.get('/add', function(req, res, next) {
	let categories = db.get('categories');
	categories.find({}, {}, function(err, categories) {
		res.render('addpost',{
			'title': 'Add Post',
			'categories': categories
		});
	});
});

router.post('/add', upload.single('mainimage'), function(req, res, next) {
  // Get Form Values
  let title = req.body.title;
  let category= req.body.category;
  let body = req.body.body;
  let author = req.body.author;
  let date = new Date();

  // Check Image Upload
  if (req.file) {
  	let mainimage = req.file.filename
  } else {
  	let mainimage = 'noimage.jpg';
  }

  	// Form Validation
	req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	let errors = req.validationErrors();

	if(errors){
		res.render('addpost',{
			"errors": errors
		});
	} else {
		let posts = db.get('posts');
		posts.insert({
			'title': title,
			'body': body,
			'category': category,
			'date': date,
			'author': author,
			'mainimage': mainimage
		}, function(err, post){
			if(err){
				res.send(err);
			} else {
				req.flash('success','Post Added');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});


router.post('/addcomment', function(req, res, next) {
  // Get Form Values
  let name = req.body.name;
  let email = req.body.email;
  let body = req.body.body;
  let postid = req.body.postid;
  let commentdate = new Date();

  // Form Validation
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required but never displayed').notEmpty();
	req.checkBody('email','Email is not formatted properly').isEmail();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	let errors = req.validationErrors();

	if (errors) {
		let posts = db.get('posts');
		posts.findById(postid, function(err, post){
			res.render('show',{
				'errors': errors,
				'post': post
			});
		});
	} else {
		let comment = {
			'name': name,
			'email': email,
			'body': body,
			'commentdate': commentdate
		}

		let posts = db.get('posts');

		posts.update({
			'_id': postid
		},{
			$push: {
				"comments": comment
			}
		}, function (err, doc) {
			if (err) {
				throw err;
			} else {
				req.flash('success', 'Comment Added');
				res.location('/posts/show/' + postid);
				res.redirect('/posts/show/' + postid);
			}
		});
	}
});

module.exports = router;
