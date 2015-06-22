(function() {
  'use strict';

  $(document).ready(function() {

    $("video").mouseover(function(){
       if ($('video')[0].paused) {
         $('video')[0].play();
         $('#play-pause').addClass('pause');
      }
      else{
        $('video')[0].pause();
        $('#play-pause').removeClass('pause');
      }
    });


    $("video").mouseout(function(){
       if ($('video')[0].paused) {
         $('video')[0].play();
         $('#play-pause').addClass('pause');
      }
      else{
        $('video')[0].pause();
        $('#play-pause').removeClass('pause');
      }
    });


    $('video').mouseenter(function(){
      $( '.hover-title' ).empty();
  		$( '.hover-title' ).append( document.createTextNode( 'LEAVE THE VIDEO TO PAUSE' ) );
    });
    $('video').mouseout(function(){
      $( '.hover-title' ).empty();
  		$( '.hover-title' ).append( document.createTextNode( 'HOVER THE VIDEO TO PLAY' ) );
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
      $('.navbar-toggle:visible').click();
    });

    // Testimonials
    (function(){

      $.fn.fitHeights = function() {

        var items = $(this);
        function setHeights() {

          var currentTallest = 0;

          items.css({ 'min-height' : currentTallest });  // unset min-height to get actual new height

          // right now this causes a noticeable shift in height on resize. workarounds?

          items.each(function(){

            if( $(this).height() > currentTallest ) { currentTallest = $(this).height(); }
          });

          items.css({ 'min-height' : currentTallest });

        }

        setHeights();
        $(window).on('resize', setHeights);
        return this;
      };
    })(jQuery);

    $(window).load(function(){
    	/* $(groupOfItems).fitHeights(); */
      $('.grid-testimonials p').fitHeights();
    });

  });

  $(function() {
  	$(".collapsed").bind('click',function() {
  		var _this = $(this);

  		// Expand the current link
  		_this.toggleClass('active', 5);
  		_this.next().toggleClass('closed', 500);
  		// Contract the others and set off the 'active' state.
  		$(".collapsed").not(_this).each(function() {
  			$(this).next().addClass('closed', 500);
  			$(this).removeClass('active', 5);
  		});
  	});
  });

  $(".fade-nav").show();
  $(window).scroll(function() {
    if ($(window).scrollTop() > 100) {
      $(".fade-nav").fadeOut("slow");
    }
    else {
      $(".fade-nav").fadeIn("fast");
    }
  });

}());
