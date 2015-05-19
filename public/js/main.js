(function() {
  'use strict';

  $(document).ready(function() {

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

  });

}());
