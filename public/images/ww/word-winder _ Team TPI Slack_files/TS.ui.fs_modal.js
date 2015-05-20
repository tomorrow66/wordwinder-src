(function(){TS.registerModule("ui.fs_modal",{is_showing:false,onStart:function(){},start:function(n){if(n){g=$.extend(TS.utility.clone(d),n)
}else{g=d
}if(typeof g.show_close_button==="undefined"){g.show_close_button=g.show_cancel_button
}TS.ui.fs_modal.is_showing=true;
var m=false;
if(!f){m=true;
a()
}c=f.find(".contents");
var l;
if(g.body_template_html){l=g.body_template_html;
if(g.body){TS.warn("Both body and body_template_html were passed in settings to TS.ui.fs_modal.start(). Using body_template.")
}}else{l=TS.templates.fs_modal_generic_contents({settings:g})
}c.html(l);
f.find(".dialog_go").on("click",k);
f.find(".dialog_secondary_go").on("click",b);
f.find(".dialog_cancel").on("click",e);
$(window.document).on("keydown.fs_modal",i);
j.on("click",function(){if(g.show_cancel_button){e()
}else{if(g.esc_for_ok){k()
}}});
j.toggleClass("hidden",!g.show_close_button);
if(m){setTimeout(function(){f.addClass("active")
},0)
}else{f.addClass("active")
}setTimeout(function(){c.addClass("active")
},250);
if(f.find("input").length){f.find("input").first().focus()
}else{if(document.activeElement&&document.activeElement!==document.body){document.activeElement.blur()
}}if(g.on_show){g.on_show()
}}});
var f;
var j;
var c;
var g=null;
var d={title:"",body:"",body_template_html:null,show_go_button:true,show_secondary_go_button:false,show_cancel_button:true,go_button_text:"OK",go_button_class:"",secondary_go_button_text:"OK 2",secondary_go_button_class:"",cancel_button_text:"Cancel",on_go:null,on_secondary_go:null,on_cancel:null,on_end:null,esc_for_ok:false,on_show:null,enter_always_gos:false,fullscreen:false};
var a=function(){f=$(TS.templates.fs_modal());
$("body").append(f);
j=$("#fs_modal_close_btn")
};
var k=function(){if(!TS.ui.fs_modal.is_showing){TS.error("not showing?");
return
}if(g.on_go){if(g.on_go()!==false){e()
}}else{e()
}};
var b=function(l){if(!TS.ui.fs_modal.is_showing){TS.error("not showing?");
return
}if(g.on_secondary_go){if(g.on_secondary_go()!==false){e()
}}else{e()
}};
var i=function(l){if(l.which==TS.utility.keymap.enter&&(TS.utility.getActiveElementProp("NODENAME")=="BODY"||g.enter_always_gos)){if(g.show_go_button){k();
l.preventDefault()
}}else{if(l.which==TS.utility.keymap.esc&&TS.utility.getActiveElementProp("NODENAME")=="BODY"&&g.show_close_button){if(g.esc_for_ok){k()
}else{e()
}}}};
var e=function(){f.removeClass("active");
if(g.on_cancel){g.on_cancel()
}h()
};
var h=function(){TS.ui.fs_modal.is_showing=false;
f.find(".contents_container").html('<div class="contents"></div>');
$(window.document).off("keydown.fs_modal").off("resize.fs_modal");
if(g.on_end){g.on_end()
}}
})();