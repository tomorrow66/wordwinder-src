/**
 * GET /
 * David page.
 */
 exports.getDavid = function(req, res) {
   res.render('david/david', {
     title: 'David L. Hoyt'
   });
 };

 exports.getDavidAbout = function(req, res) {
   res.render('david/about', {
     title: 'About David L. Hoyt'
   });
 };

 exports.getDavidMedia = function(req, res) {
   res.render('david/media', {
     title: 'David L. Hoyt Media'
   });
 };

 exports.getDavidPartnerships = function(req, res) {
   res.render('david/partnerships', {
     title: 'David L. Hoyt Partnerships'
   });
 };

 exports.getDavidAppearances = function(req, res) {
   res.render('david/appearances', {
     title: 'David L. Hoyt Appearances'
   });
 };
