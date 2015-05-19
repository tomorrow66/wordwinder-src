/**
 * GET /
 * Giant Word Winder page.
 */
 exports.getGiantWordWinder = function(req, res) {
   res.render('giant-word-winder', {
     title: 'Giant Word Winder'
   });
 };
