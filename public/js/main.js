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

    // Custom Scroll
    $("body").onepage_scroll({
      sectionContainer: "section",
      animationTime: 2000,
      easing: "cubic-bezier(0.680, -0.550, 0.265, 1.550)"
    });
    //jQuery to collapse the navbar on scroll
    $(window).scroll(function() {
      if ($('.navbar').offset().top > 50) {
        $('.navbar-fixed-top').addClass('top-nav-collapse');
      } else {
        $('.navbar-fixed-top').removeClass('top-nav-collapse');
      }
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
      $('.navbar-toggle:visible').click();
    });

    //jQuery for page scrolling feature - requires jQuery Easing plugin
    $(function() {
      $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
          scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
      });
    });

    $(document).ready(function(){
      $window = $(window);
      $('section[data-type="background"]').each(function(){
        var $scroll = $(this);
        $(window).scroll(function() {
          var yPos = -(($window.scrollTop() - $scroll.offset().top) / $scroll.data('speed'));
          var coords = '50% '+ yPos + 'px';
          $scroll.css({ backgroundPosition: coords });
        });
      });
    });
    /* Create HTML5 element for IE */
    document.createElement("section");


    // Fullpage.js
    $('.home#fullpage').fullpage({
      anchors: ['david', 'word-winder', 'giant-word-winder'],
      sectionsColor: ['#FFFFFF', '#FFFFFF', '#E14603'],
      navigation: true,
      navigationPosition: 'right',
      navigationTooltips: ['David L. Hoyt', 'Word Winder', 'Giant Word Winder'],
      loopBottom: true,
      responsive: 900,
      css3: true
      // afterLoad: function(anchorLink, index){
      //
      //   //section 1
      //   if(index == 1){
      //     //moving the image
      //     // $('.dlh').find('img').delay(500).animate({
      //     //   left: '0%'
      //     // }, 1500, 'easeOutExpo');
      //
      //     console.log('Index 1');
      //     $('#section0').find('p').first().fadeIn(1800, function(){
      //       $('#section0').find('p').last().fadeIn(1800);
      //     });
      //
      //   }
      //
      //   if(index == 2){
      //     //moving the image
      //     // $('.ww').find('img').delay(500).animate({
      //     //   left: '0%'
      //     // }, 1500, 'easeOutExpo');
      //     console.log('Index 2');
      //     $('.ww').find('p').first().fadeIn(1800, function(){
      //       $('.ww').find('p').last().fadeIn(1800);
      //     });
      //
      //   }
      //
      //   if(index == 3){
      //     //moving the image
      //     // $('.gww').find('img').delay(500).animate({
      //     //   left: '0%'
      //     // }, 1500, 'easeOutExpo');
      //
      //     console.log('Index 3');
      //     $('.gww').find('p').first().fadeIn(1800, function(){
      //       $('.gww').find('p').last().fadeIn(1800);
      //     });
      //
      //   }
      //
      //   // //section 3
      //   // if(anchorLink == '3rdPage'){
      //   //   //moving the image
      //   //   $('.gww').find('.intro').delay(500).animate({
      //   //     left: '0%'
      //   //   }, 1500, 'easeOutExpo');
      //   // }
      // }
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

  // Parallax Video
  $(document).ready(function() {
    $('#david-video').backgroundVideo({
      pauseVideoOnViewLoss: true,
      parallaxOptions: {
        effect: 1.9
      }
    });
  });

}());
