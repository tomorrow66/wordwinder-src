/**
 * GET /
 * Word Winder page.
 */
 exports.getWordWinder = function(req, res) {
   res.render('word-winder', {
     title: 'Word Winder'
   });
 };
