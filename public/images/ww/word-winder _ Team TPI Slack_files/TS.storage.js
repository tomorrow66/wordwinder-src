(function(){TS.registerModule("storage",{msgs_version:(function(){try{return window.boot_data.login_data.cache_version
}catch(c){return"unknown_version"
}})(),version:"0.81",prefix:window.boot_data.user_id+"_",disabled:false,buffer:{},disable_interval_buffer_write:(function(){var e,h,d,g,f,c;
c=true;
g="slack_ssb/";
f=0.45;
e=navigator.userAgent.toLowerCase();
h=e.indexOf(g);
if(h!==-1){d=parseFloat(e.substr(h+g.length));
if(!isNaN(d)&&d<f){c=false
}}return c
}()),flush_buffer_interv:0,flush_buffer_interv_ms:1000,setDisabled:function(c){if(TS.storage.disabled==c){return
}if(c||!a){TS.storage.disabled=true
}else{TS.storage.disabled=false;
TS.storage.setUp()
}TS.info("TS.storage.disabled:"+TS.storage.disabled)
},onStart:function(){TS.storage.setDisabled(TS.storage.disabled||TS.qs_args.ls_disabled=="1"||!a);
if(!TS.storage.disabled){try{if(TS.boot_data.login_data.self.prefs.ls_disabled){TS.storage.disabled=true
}}catch(c){}}TS.log(488,"TS.storage.disabled:"+TS.storage.disabled);
TS.ui.window_unloaded_sig.add(TS.storage.windowUnloaded);
TS.ui.window_focus_changed_sig.add(TS.storage.windowBlurred);
if(!TS.storage.disabled){TS.storage.setUp()
}},getKeys:function(){var d=[];
if(!a){return d
}var c=a.length;
if(!c){return d
}for(var e=0;
e<c;
e++){d.push(a.key(e))
}return d
},storageAvailable:function(){if(!a){return false
}try{var c="test_to_see_if_we_can_write_to_local_storage";
a.setItem(c,"foo");
a.removeItem(c);
return true
}catch(d){return false
}},storageSize:function(f){var h=0;
if(!a){return h
}var g=TS.storage.getKeys();
var k=0;
var e;
var j;
for(var d=0;
d<g.length;
d++){k++;
e=g[d];
j=a.getItem(e);
if(!j&&j!==""){TS.warn(e+" not measurable value:"+j+" typeof:"+(typeof j))
}else{h+=j.length;
if(f){TS.info(e+"="+((j.length*2)/1024).toFixed(2)+"KB (total="+(h/1024).toFixed(2)+"KB)")
}}}if(f){TS.info("total for "+k+" items is "+(h/1024).toFixed(2)+"KB")
}return h
},setUp:function(){var c=TS.storage._get("storage_msgs_version");
TS.log(488,"TS.storage.msgs_version:"+TS.storage.msgs_version);
TS.log(488,"storage_msgs_version:"+c);
var f=TS.storage._get("storage_version");
TS.log(488,"TS.storage.version:"+TS.storage.version);
TS.log(488,"storage_version:"+f);
TS.log(488,"TS.storage.storageAvailable(): "+TS.storage.storageAvailable());
var g=TS.storage.getKeys();
TS.log(488,g);
var e;
if(!TS.storage.storageAvailable()){TS.warn("TS.storage.storageAvailable() = false so flushing");
a.clear()
}else{if(f!=TS.storage.version||!TS.storage.fetchLastEventTS()){if(f!=TS.storage.version){TS.warn("storage_version:"+f+" does not match TS.storage.version:"+TS.storage.version+" so flushing")
}else{if(f){TS.warn("TS.storage.fetchLastEventTS() is empty so flushing");
TS.logError({message:"TS.storage.fetchLastEventTS() is empty #2 B"},"TS.storage.fetchLastEventTS() is empty but we have a storage_version, so flushing LS from TS.storage")
}}for(var d=0;
d<g.length;
d++){e=g[d];
if(e.indexOf(TS.storage.prefix)!==0){continue
}var h=TS.utility.date.getTimeStamp();
a.removeItem(e);
TS.warn("_ls.removeItem:"+e+" "+(TS.utility.date.getTimeStamp()-h)+"ms")
}TS.storage._set("storage_version",TS.storage.version);
TS.storage._set("storage_msgs_version",TS.storage.msgs_version);
if(TS.storage.getKeys().length>0){TS.info(TS.storage.getKeys())
}}else{if(c!=TS.storage.msgs_version||TS.qs_args.no_ls_msgs=="1"){if(TS.qs_args.no_ls_msgs=="1"){TS.warn("TS.qs_args['no_ls_msgs'] == '1' so flushing channel data")
}else{TS.warn("storage_msgs_version:"+c+" does not match TS.storage.msgs_version:"+TS.storage.msgs_version+" so flushing channel data")
}TS.storage.cleanOutMsgStorage();
TS.storage._set("storage_msgs_version",TS.storage.msgs_version);
if(TS.storage.getKeys().length>0){TS.warn(TS.storage.getKeys())
}}}}if(TS.storage.disable_interval_buffer_write){TS.storage.flushBufferOnIdleTimer()
}},cleanOutMsgStorageIfTooOld:function(){if(TS.storage.isStorageTooOld()){TS.warn("last LS activity too old, we're purging");
TS.storage.cleanOutMsgStorageAndReset();
return true
}return false
},cleanOutMsgStorageAndReset:function(){TS.info("cleanOutMsgStorageAndReset running");
TS.storage.cleanOutMsgStorage();
TS.storage.storeLastEventTS("",true,true);
TS.storage.storeLastMsgTS("",true);
var c=TS.storage.fetchLastEventTS(true);
TS.info("cleanOutMsgStorageAndReset fetched_b4_flush:"+c);
if(c){TS.info("TS.storage.getKeys:"+TS.storage.getKeys().join(", "));
TS.info("Object.keys(TS.storage.buffer):"+Object.keys(TS.storage.buffer).join(", "))
}TS.storage.flushBuffer(true);
var d=TS.storage.fetchLastEventTS(true);
TS.info("cleanOutMsgStorageAndReset fetched_after_flush:"+d);
if(d){TS.info("TS.storage.getKeys:"+TS.storage.getKeys().join(", "));
TS.info("Object.keys(TS.storage.buffer):"+Object.keys(TS.storage.buffer).join(", "))
}},isStorageTooOld:function(){var f=TS.storage.fetchLastEventTS();
var c=TS.storage.fetchLastMsgTS();
var e=f;
if(!e||c>f){e=c
}if(e){var g=TS.utility.date.toDateObject(e);
var d=TS.utility.date.getTimeStamp()-g;
var h=3*86400000;
if(d>h){return true
}}return false
},cleanOutMsgStorage:function(){var e=TS.storage.getKeys();
TS.log(488,e);
var d;
for(var c=0;
c<e.length;
c++){d=e[c];
if(d.indexOf(TS.storage.prefix)!==0){continue
}if(d.indexOf(TS.storage.msgs_id_part)==-1&&d.indexOf(TS.storage.oldest_ts_part)==-1){continue
}var f=TS.utility.date.getTimeStamp();
a.removeItem(d);
delete TS.storage.buffer[d];
TS.warn("_ls.removeItem:"+d+" "+(TS.utility.date.getTimeStamp()-f)+"ms")
}for(d in TS.storage.buffer){if(d.indexOf(TS.storage.prefix)!==0){continue
}if(d.indexOf(TS.storage.msgs_id_part)==-1&&d.indexOf(TS.storage.oldest_ts_part)==-1){continue
}delete TS.storage.buffer[d];
TS.info("delete TS.storage.buffer:"+d)
}e=TS.storage.getKeys();
TS.log(488,e)
},windowUnloaded:function(){TS.storage._set("last_unload_flushing",new Date().toString(),true);
TS.storage.flushBuffer(true)
},windowBlurred:function(){TS.storage.flushBuffer(true)
},onFlushBufferInterval:function(){TS.storage.flushBuffer(false)
},slow_write:false,slow_all_write:false,slow_write_threshold:1000,flush_all_buffer_interv:null,flush_all_buffer_interv_ms:2000,flush_all_buffer_user_inactive_ms:3000,flushBufferOnIdleTimer:function(){if(TS.storage.flush_all_buffer_interv){window.clearInterval(TS.storage.flush_all_buffer_interv);
TS.storage.flush_all_buffer_interv=null
}TS.storage.flush_all_buffer_interv=window.setInterval(TS.storage.maybeFlushAllBuffer,TS.storage.flush_all_buffer_interv_ms)
},maybeFlushAllBuffer:function(){if(!TS.model){return
}var e=false;
if(!TS.model.ui.is_window_focused){e=true
}else{var d=new Date();
var c=(d-TS.model.client.last_user_active_timestamp);
if(c>=TS.storage.flush_all_buffer_user_inactive_ms){e=true
}}TS.log(488,"TS.storage.maybeFlushAllBuffer ok_to_flush:"+e);
if(e){TS.storage.flushBuffer(true)
}},prepareValForStorage:function(c){return(typeof c=="string"||typeof c=="number"||!c)?c:JSON.stringify(c)
},correctBadValsFromStorage:function(c){if(c=="undefined"){return null
}if(c=="null"){return null
}return c
},flushBuffer:function(p){if(TS.storage.disabled){return
}var e=new Date();
var c=TS.utility.date.getTimeStamp();
var j;
var l=0;
var o=(TS.model&&TS.model.team&&TS.model.team.domain&&TS.model.team.domain==="tinyspeck");
var q;
var n;
var h;
if(!p&&TS.storage.disable_interval_buffer_write){return false
}var d;
for(var g in TS.storage.buffer){d=TS.storage.prepareValForStorage(TS.storage.buffer[g]);
try{a.setItem(g,d)
}catch(f){TS.warn("flushBuffer _ls.setItem failed once, flushing. TS.storage.storageSize():"+TS.storage.storageSize(false));
TS.dir(0,f);
a.clear();
try{a.setItem(g,d)
}catch(m){TS.warn("flushBuffer _ls.setItem failed twice, flushing and bailing. TS.storage.storageSize():"+TS.storage.storageSize());
TS.dir(0,m);
a.clear();
continue
}}l++;
j=TS.utility.date.getTimeStamp()-c;
TS.storage.flush_buffer_interv_ms=TS.utility.clamp(j*3,1000,5000);
if(o){TS.log(488,"onFlushBufferInterval _ls.setItem "+g+": "+(j)+"ms "+(TS.storage.buffer[g]&&TS.storage.buffer[g].toString?TS.storage.buffer[g].toString().substr(0,100):"NULL?"))
}if(!p){q=new Date()-e;
if(!TS.storage.slow_write&&q>TS.storage.slow_write_threshold){TS.storage.slow_write=true;
h=new Date();
try{n=TS.storage.storageSize()
}catch(f){}h=new Date()-h;
TS.logError({message:"TS.storage.flushBuffer > "+TS.storage.slow_write_threshold+" ms"}," took "+q+" ms for "+l+" item (!all case). Key: "+g+". Buffer length: "+(TS.storage.buffer[g]&&TS.storage.buffer[g].toString()?TS.storage.buffer[g].toString().length:"unknown (not a string)")+". localStorage size: "+(n||"unknown")+". Time to read LS size: "+h)
}}delete TS.storage.buffer[g];
if(!p){TS.log(488,"TS.storage.flushBuffer: Wrote one item.");
return
}}if(l&&!TS.storage.slow_all_write){q=new Date()-e;
if(q>TS.storage.slow_write_threshold){TS.storage.slow_all_write=true;
try{n=TS.storage.storageSize()
}catch(f){}TS.logError({message:"TS.storage.flushBuffer (all) > "+TS.storage.slow_write_threshold+" ms"}," took "+q+" ms for "+l+" items. localStorage size: "+n+". App open for "+((new Date()-TS.view.start_time)/1000/60).toFixed(2)+" min.")
}}if(l===0){if(TS.storage.flush_buffer_interv){window.clearInterval(TS.storage.flush_buffer_interv);
TS.storage.flush_buffer_interv=null
}TS.log(488,"TS.storage.flushBuffer: Nothing to save.")
}else{TS.log(488,"TS.storage.flushBuffer: Saved "+l+(l===1?" item":" items"))
}},slow_get_threshold:1000,slow_get:null,_get:function(g,d,h){var f=TS.storage.prefix+g;
if(h){TS.info("_get name:"+g+" k:"+f+" disabled:"+TS.storage.disabled+" TS.storage.buffer[k]:"+TS.storage.buffer[f])
}if(TS.storage.disabled){return TS.storage.buffer[f]||d
}if(f in TS.storage.buffer){return TS.storage.buffer[f]||d
}var e=new Date();
var c=TS.storage.correctBadValsFromStorage(a.getItem(f));
if(h){TS.info("_get TS.storage.correctBadValsFromStorage(_ls.getItem(k)):"+c)
}var j;
if(c&&typeof c=="string"&&/^[{[]/.test(c)){try{c=JSON.parse(c)
}catch(i){}}c=c||(d||null);
e=new Date()-e;
if(!TS.storage.slow_get&&e>TS.storage.slow_get_threshold){TS.storage.slow_get=true;
try{j=TS.storage.storageSize()
}catch(i){}TS.logError({message:"TS.storage._get > "+TS.storage.slow_get_threshold+" ms"}," took "+e+" ms to read "+f+", length = "+(c&&!isNaN(c.length)?c.length:"unknown")+". Storage size: "+j)
}return c
},slow_set_threshold:1000,slow_set:null,_set:function(c,n,e,i){var o=new Date();
var l;
var h=TS.storage.prefix+c;
TS.storage.buffer[h]=n;
var j=false;
if(i){TS.info("_set immediate:"+e+" name:"+c+" k:"+h+" disabled:"+TS.storage.disabled+" TS.storage.buffer[k]:"+TS.storage.buffer[h])
}if(e){if(!TS.storage.disabled){var d=TS.storage.prepareValForStorage(n);
try{a.setItem(h,d);
var m=a.getItem(h);
if(c=="testing_breakage"){m+="BREAKAGE"
}if(m!==d){var g="_ls.setItem() failed _using_macgap_ls:"+b;
var p="k:"+h+"\nval:"+d+"\nnew_val:"+m;
TS.logError({message:g},p);
TS.warn(g+"\n"+p)
}}catch(f){TS.warn("_set _ls.setItem failed, flushing. TS.storage.storageSize():"+TS.storage.storageSize(false));
j=true;
a.clear()
}}if(i){TS.info("_set failed:"+j)
}if(!j){delete TS.storage.buffer[h];
if(i){TS.info("_set TS.storage.buffer[k]:"+TS.storage.buffer[h])
}o=new Date()-o;
if(o>TS.storage.slow_set_threshold){TS.warn("TS.storage._set immediately "+c+": "+(o)+"ms "+(n&&n.toString?n.toString().substr(0,100):"NULL?"));
if(!TS.storage.slow_set){TS.storage.slow_set=true;
try{l=TS.storage.storageSize()
}catch(f){}TS.logError({message:"TS.storage._set (immediate) > "+TS.storage.slow_set_threshold+" ms"}," took "+o+" ms to write "+h+", length = "+(n&&!isNaN(n.length)?n.length:"unknown")+". Storage length: "+l)
}}else{TS.log(488,"TS.storage._set immediately "+c+": "+(o)+"ms "+(n&&n.toString?n.toString().substr(0,100):"NULL?"))
}return
}}if(!TS.storage.disabled){if(!TS.storage.flush_buffer_interv){TS.storage.flush_buffer_interv=setInterval(TS.storage.onFlushBufferInterval,TS.storage.flush_buffer_interv_ms)
}}},msgs_id_part:"channel_msgs_",_makeMsgsId:function(c){return TS.storage.msgs_id_part+c
},fetchMsgsRaw:function(c){return TS.storage._get(TS.storage._makeMsgsId(c),[])||[]
},fetchMsgs:function(g){var f=JSON.parse(JSON.stringify(TS.storage._get(TS.storage._makeMsgsId(g),[])||[]));
var c=[];
var d;
for(var e=0;
e<f.length;
e++){if(TS.qs_args.not_all_ls_msgs&&e<5){continue
}d=f[e];
if(!d.ts){continue
}if(TS.utility.msgs.isTempMsg(d)){continue
}if(d.is_ephemeral){continue
}c.push(TS.utility.msgs.processImsg(d,g))
}return c
},storeMsgs:function(e,d){TS.storage._set(TS.storage._makeMsgsId(e),d);
if(d&&d.length){var c=TS.storage.fetchLastMsgTS();
if(d[0].ts>c){TS.storage.storeLastMsgTS(d[0].ts)
}}},_makeMsgInputId:function(c){return"msg_input_"+c
},fetchLastMsgInput:function(c){return TS.storage._get(TS.storage._makeMsgInputId(c),null)
},storeLastMsgInput:function(d,c){TS.storage._set(TS.storage._makeMsgInputId(d),c)
},_makeCommentInputId:function(c){return"comment_input_"+c
},fetchLastCommentInput:function(c){return TS.storage._get(TS.storage._makeCommentInputId(c),null)
},storeLastCommentInput:function(d,c){TS.storage._set(TS.storage._makeCommentInputId(d),c)
},oldest_ts_part:"oldest_msg_ts_",_makeOldestTsId:function(c){return TS.storage.oldest_ts_part+c
},fetchOldestTs:function(c){if(TS.boot_data.feature_oldest_msg_storing){return TS.storage._get(TS.storage._makeOldestTsId(c),null)
}return null
},storeOldestTs:function(d,c){if(TS.boot_data.feature_oldest_msg_storing){TS.storage._set(TS.storage._makeOldestTsId(d),c);
return
}TS.storage._set(TS.storage._makeOldestTsId(d),null)
},fetchActiveHistory:function(){return TS.storage._get("active_history",[])||[]
},storeActiveHistory:function(c){TS.storage._set("active_history",c,true)
},fetchLastEventTS:function(c){return TS.storage._get("last_event_ts","",c)||""
},storeLastEventTS:function(e,c,d){TS.storage._set("last_event_ts",e,c,d)
},fetchLastMsgTS:function(){return TS.storage._get("last_msg_ts","")||""
},storeLastMsgTS:function(d,c){TS.storage._set("last_msg_ts",d,c)
},fetchUIState:function(){return TS.storage._get("ui_state",{})||{}
},storeUIState:function(c){TS.storage._set("ui_state",c)
},fetchInlineImgState:function(){return TS.storage._get("inline_img_state",{})||{}
},storeInlineImgState:function(c){TS.storage._set("inline_img_state",c)
},fetchInlineVideoState:function(){return TS.storage._get("inline_video_state",{})||{}
},storeInlineVideoState:function(c){TS.storage._set("inline_video_state",c)
},fetchInlineAttachmentState:function(){return TS.storage._get("inline_attachment_state",{})||{}
},storeInlineAttachmentState:function(c){TS.storage._set("inline_attachment_state",c)
},fetchExpandableState:function(){return TS.storage._get("expandable_state",{})||{}
},storeExpandableState:function(c){TS.storage._set("expandable_state",c)
},fetchClientWindows:function(){return TS.storage._get("client_windows",{})||{}
},storeClientWindows:function(c){TS.storage._set("client_windows",c)
},fetchInputHistory:function(){var d=TS.storage._get("input_history",[])||[];
var c=300;
if(d.length>c){d.length=c
}return d
},storeInputHistory:function(c){TS.storage._set("input_history",c)
},fetchChannelPageState:function(){return TS.storage._get("channel_page_state",{})||{}
},storeChannelPageState:function(c){TS.storage._set("channel_page_state",c)
},fetchRxnRecords:function(){return TS.storage._get("rxn_records",[])||[]
},storeRxnRecords:function(c){TS.storage._set("rxn_records",c)
}});
var b=!!(window.macgap&&macgap.ls);
var a=b?macgap.ls:window.localStorage
})();