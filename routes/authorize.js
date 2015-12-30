var express = require('express');
var router = express.Router();
var request = require('request');

var url = 'https://api.instagram.com/oauth/access_token';

/* GET users listing. */
router.get('/', function (req, res, next) {

	var code = req.query.code;
	var data = {
		client_id: '422fbb4794654edfa7b02157a43bfde9',
		client_secret: '26318819aa2a474ba605dede50b1dbd0',
		grant_type: 'authorization_code',
		redirect_uri: 'https://insta-we.herokuapp.com/authorize/',
		code: code
	};

	if(code) {
		request({uri: url,method: "POST",form: data}, function (error, response, body) {
					res.cookie('auth',body, { maxAge: 7 * 24 * 3600000 });
            res.redirect('/');

		});
	} else {
		res.render('authorize', {
			title: 'Authorize App',
            redirect_uri:data.redirect_uri,
            client_id:data.client_id

		});
	}

});

module.exports = router;
