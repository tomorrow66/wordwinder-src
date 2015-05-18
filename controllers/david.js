/**
 * GET /
 * David page.
 */
 exports.getDavid = function(req, res) {
   res.render('david', {
     title: 'David L. Hoyt'
   });
 };
