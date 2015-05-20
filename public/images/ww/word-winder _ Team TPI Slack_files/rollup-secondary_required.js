(function(){TS.registerModule("api",{Q_empty_sig:new signals.Signal(),pending:0,limit:4,Q:[],one_at_a_time_methodsA:["users.prefs.set"],one_at_a_time_call_pending:false,one_at_a_timeQ:[],method_call_counts:{total_asks:0,total_attempts:0},onStart:function(){},call:function(e,b,d,c){b=b||{};
var a;
if(TS.api.one_at_a_time_methodsA.indexOf(e)!=-1){if(!TS.api.one_at_a_time_call_pending){TS.api.actuallyCall(e,b,d,c);
return
}a=TS.api.one_at_a_timeQ
}else{if(TS.api.pending<TS.api.limit){TS.api.actuallyCall(e,b,d,c);
return
}a=TS.api.Q
}TS.logLoad("TS.api Qing "+e);
a.push({method:e,args:b,handler:d,dont_set_active:c})
},callImmediately:function(d,a,c,b){if(TS.api.one_at_a_time_methodsA.indexOf(d)!=-1){TS.warn(d+" cannot be called with TS.api.callImmediately, so sending to TS.api.call for enqueuing");
TS.api.call(d,a,c,b);
return
}TS.api.actuallyCall(d,a||{},c,b)
},callSynchronously:function(d,a,c,b){if(TS.api.one_at_a_time_methodsA.indexOf(d)!=-1){TS.warn(d+" cannot be called with TS.api.callSynchronously, so sending to TS.api.call for enqueuing");
TS.api.call(d,a,c,b);
return
}a=a||{};
a._synchronously=true;
TS.api.actuallyCall(d,a,c,b)
},nextFromQ:function(){var a;
if(TS.api.one_at_a_timeQ.length&&!TS.api.one_at_a_time_call_pending){a=TS.api.one_at_a_timeQ.shift()
}else{if(TS.api.Q.length){a=TS.api.Q.shift()
}}if(!a){if(TS.api.pending===0){TS.api.Q_empty_sig.dispatch()
}return
}TS.api.actuallyCall(a.method,a.args,a.handler,a.dont_set_active)
},actuallyCall:function(g,c,e,d){TS.logLoad("TS.api calling "+g);
TS.api.pending++;
if(TS.api.one_at_a_time_methodsA.indexOf(g)!=-1){TS.api.one_at_a_time_call_pending=true
}c.token=TS.model.api_token;
TS.log(2,'calling method "'+g+'"');
if(!d){c.set_active=true;
TS.model.last_net_send=TS.utility.date.getTimeStamp()
}var f=new Date().getTime();
var a=Math.round(new Date().getTime()/1000);
var b=TS.model.api_url+g+"?t="+a+TS.appendQSArgsToUrl();
if(g=="rtm.start"&&TS.client){b+="&"+TS.ms.getConnectionFlowLog(1900)
}if(TS.boot_data.feature_channel_eventlog_client){if(g=="channels.history"||g=="groups.history"||g=="im.history"){c.visible=1
}}TS.api.ajax_call(b,g,c,function(m){var i=(new Date().getTime()-f);
TS.logLoad("TS.api complete "+g+" (took "+i+"ms)");
TS.log(2,'got api rsp for method "'+g+'" (took '+i+"ms)");
TS.dir(2,c);
TS.dir(2,m);
var k=24;
var j=false;
if(!m){m={}
}if(m.ok){j=true
}else{if(m.ok===false){j=false;
if(m.error=="file_deleted"){}else{TS.error('api call "'+g+'" not ok');
try{TS.warn("args: "+JSON.stringify(c))
}catch(l){TS.warn("could not stringify args")
}try{TS.warn("data: "+JSON.stringify(m))
}catch(l){TS.warn("could not stringify data")
}}}else{TS.error('api call "'+g+'" not ok');
try{TS.warn("args: "+JSON.stringify(c))
}catch(l){TS.warn("could not stringify args")
}try{TS.warn("data: "+JSON.stringify(m))
}catch(l){TS.warn("could not stringify data")
}if(c._attempts<k&&!c._synchronously){var h=(TS.api.one_at_a_time_methodsA.indexOf(g)!=-1)?TS.api.one_at_a_timeQ:TS.api.Q;
h.unshift({method:g,args:c,handler:e,dont_set_active:d});
return
}if(c._got_0_status){if(TS.model.team.domain==="tinyspeck"&&!readCookie("seen_api_failure_dialog_today")){setTimeout(function(){var n="We've made "+c._attempts+" attempts on "+g+" and have received no data, with a 0 http status";
if(m){n+="\ndata: "+JSON.stringify(m,null,"  ")
}if(c){n+="\nargs: "+JSON.stringify(c,null,"  ")
}TS.generic_dialog.start({title:"Tiny Speck team only alert!",body:"<p>An error condition has been detected, and you should say something about it in the #dhtml channel.</p>"+n.replace(/\n/g,"<br>"),show_cancel_button:false,esc_for_ok:true,on_go:function(){}})
},0);
createCookie("seen_api_failure_dialog_today","1",1)
}}}}if(e){e(j,m,c)
}})
},ajax_call:function(b,g,a,d){if(!a._attempts){a._attempts=0;
TS.api.method_call_counts.total_asks++;
TS.api.method_call_counts[g]=(TS.api.method_call_counts[g])?TS.api.method_call_counts[g]+1:1
}TS.api.method_call_counts.total_attempts++;
TS.log(48,g+" count: "+TS.api.method_call_counts[g]+" (asks: "+TS.api.method_call_counts.total_asks+" attempts: "+TS.api.method_call_counts.total_attempts+")");
a._attempts++;
var e=new XMLHttpRequest();
e.onerror=function(h){a._error={_event:h,_event_error:h.error||"e.error is undefined"}
};
e.onreadystatechange=function(){var j=d;
var i=a._delay_ms?a._delay_ms:100;
if(e.readyState==4){if(e.status==200){e.onreadystatechange=null;
var k;
if(e.responseText.indexOf("{")===0){try{k=JSON.parse(e.responseText)
}catch(h){TS.warn("unable to do anything with api rsp");
TS.error(h)
}}else{k={ok:1,rsp:e.responseText}
}j(k)
}else{if(e.status===0){i=a._delay_ms=(!a._delay_ms)?1000:Math.min(a._delay_ms*1.3,1000*60);
a._got_0_status=true
}j({ok:0,error:"Non-200 HTTP status: "+e.status,debug:e.responseText})
}setTimeout(function(){TS.api.pending--;
if(TS.api.one_at_a_time_methodsA.indexOf(g)!=-1){TS.api.one_at_a_time_call_pending=false
}TS.api.nextFromQ()
},i)
}};
e.open("POST",b,!a._synchronously);
e.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
var f=[];
for(var c in a){f[f.length]=encodeURIComponent(c)+"="+encodeURIComponent(a[c])
}e.send(f.join("&"))
}})
})();
(function(){TS.registerModule("notifs",{onStart:function(){},canCorGHaveChannelMentions:function(o){var n=TS.channels.getChannelById(o)||TS.groups.getGroupById(o);
if(!n){TS.error("no model_ob for c_id:"+o+"?");
return true
}if(TS.model.team.prefs.who_can_at_channel=="admin"||TS.model.team.prefs.who_can_at_channel=="owner"){return true
}if(n.is_general&&(TS.model.team.prefs.who_can_at_everyone=="admin"||TS.model.team.prefs.who_can_at_everyone=="owner")){return true
}if(n.is_general&&(TS.model.team.prefs.who_can_post_general=="admin"||TS.model.team.prefs.who_can_post_general=="owner")){return true
}var p=TS.notifs.getCalculatedCorGNotifySetting(n.id);
if(p!="mentions"){return true
}return !TS.notifs.hasUserSuppressedCorGChannelMentions(o)
},hasUserSuppressedCorGChannelMentions:function(p){var n=TS.channels.getChannelById(p)||TS.groups.getGroupById(p);
if(!n){TS.error("no model_ob for c_id:"+p+"?");
return true
}var o=TS.model.at_channel_suppressed_channels.indexOf(n.id);
if(o!=-1){return true
}return false
},hasUserSuppressedCorGPushChannelMentions:function(p){var n=TS.channels.getChannelById(p)||TS.groups.getGroupById(p);
if(!n){TS.error("no model_ob for c_id:"+p+"?");
return true
}var o=TS.model.push_at_channel_suppressed_channels.indexOf(n.id);
if(o!=-1){return true
}return false
},isCorGMuted:function(n){if(!n){TS.error('wtf no c_id "'+n+'"');
return false
}if(TS.model.muted_channels.indexOf(n)>-1){return true
}return false
},getGlobalPushNotificationSetting:function(){if(TS.model.prefs.push_everything){return"everything"
}if(TS.model.prefs.push_mention_alert&&TS.model.prefs.push_dm_alert){return"dm_and_mentions"
}if(TS.model.prefs.push_mention_alert){return"mentions"
}if(TS.model.prefs.push_dm_alert){return"dms"
}return"nothing"
},getCorGsNotUsingGlobalPushNotificationSetting:function(){var p={nothing:[],mentions:[],everything:[]};
var o;
var q;
var r={};
var t;
var n;
var s="quiet";
if(TS.model.prefs.push_mention_alert){s="mentions"
}if(TS.model.prefs.push_everything){s="loud"
}n=TS.model.prefs.push_loud_channels_set?TS.model.prefs.push_loud_channels_set.split(","):[];
for(q=0;
q<n.length;
q++){t=$.trim(n[q]);
if(!t){continue
}r[t]="quiet"
}n=TS.channels.getChannelsForUser();
for(q=0;
q<n.length;
q++){if(!n[q]){continue
}t=n[q].id;
if(TS.notifs.getCalculatedCorGPushNotifySetting(t)!="mentions"){continue
}if(!TS.notifs.hasUserSuppressedCorGPushChannelMentions(t)){continue
}r[t]="mentions_suppressed";
p.mentions.push(n[q])
}n=TS.model.prefs.push_mention_channels?TS.model.prefs.push_mention_channels.split(","):[];
for(q=0;
q<n.length;
q++){t=$.trim(n[q]);
if(!t){continue
}if(!r[t]){continue
}r[t]="mentions"
}n=TS.model.prefs.push_loud_channels?TS.model.prefs.push_loud_channels.split(","):[];
for(q=0;
q<n.length;
q++){t=$.trim(n[q]);
if(!t){continue
}if(!r[t]){continue
}r[t]="loud"
}for(t in r){o=TS.channels.getChannelById(t)||TS.groups.getGroupById(t);
if(!o){continue
}if(o.is_archived){continue
}if(o.is_channel&&!o.is_member){continue
}if(r[t]=="loud"){if(s=="loud"){continue
}p.everything.push(o)
}else{if(r[t]=="mentions"){if(s=="mentions"){continue
}p.mentions.push(o)
}else{if(r[t]=="mentions_suppressed"){}else{if(s=="quiet"){continue
}p.nothing.push(o)
}}}}return p
},getGlobalNotificationSetting:function(){if(!TS.model.prefs.growls_enabled){return"nothing"
}if(TS.model.prefs.all_channels_loud){return"everything"
}return"mentions"
},getCorGsNotUsingGlobalNotificationSetting:function(){var p={nothing:[],mentions:[],everything:[],muted:[]};
var o;
var q;
var n=TS.channels.getChannelsForUser();
for(q in n){o=n[q];
if(o.is_archived){continue
}if(!o.is_member){continue
}if(m(o.id)){p.nothing.push(o)
}if(k(o.id)){p.mentions.push(o)
}if(e(o.id)){p.everything.push(o)
}if(TS.notifs.isCorGMuted(o.id)){p.muted.push(o)
}}for(q in TS.model.groups){o=TS.model.groups[q];
if(o.is_archived){continue
}if(m(o.id)){p.nothing.push(o)
}if(k(o.id)){p.mentions.push(o)
}if(e(o.id)){p.everything.push(o)
}if(TS.notifs.isCorGMuted(o.id)){p.muted.push(o)
}}return p
},getCalculatedCorGNotifySetting:function(n){if(!n){TS.error('wtf no c_id "'+n+'"');
return false
}var o=g(n);
if(o){if(d(n)){return"everything"
}if(a(n)){return"nothing"
}return"mentions"
}if(TS.model.prefs.growls_enabled){if(TS.model.prefs.all_channels_loud){return"everything"
}return"mentions"
}return"nothing"
},makeCorGMuted:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.muted_channels.indexOf(o);
if(n==-1){TS.model.muted_channels.push(o)
}TS.prefs.setMutedChannels(TS.model.muted_channels.join(","));
if(!TS.client){return
}if(p){TS.channels.calcUnreadCnts(p)
}if(q){TS.groups.calcUnreadCnts(q)
}},makeCorGNOTMuted:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.muted_channels.indexOf(o);
if(n!=-1){TS.model.muted_channels.splice(n,1)
}TS.prefs.setMutedChannels(TS.model.muted_channels.join(","));
if(!TS.client){return
}if(p){TS.channels.calcUnreadCnts(p)
}if(q){TS.groups.calcUnreadCnts(q)
}},makeCorGSuppresed:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.at_channel_suppressed_channels.indexOf(o);
if(n==-1){TS.model.at_channel_suppressed_channels.push(o)
}TS.prefs.setSuppressedChannels(TS.model.at_channel_suppressed_channels.join(","));
if(!TS.client){return
}if(p){TS.channels.calcUnreadCnts(p)
}if(q){TS.groups.calcUnreadCnts(q)
}},makeCorGNOTSuppresed:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.at_channel_suppressed_channels.indexOf(o);
if(n!=-1){TS.model.at_channel_suppressed_channels.splice(n,1)
}TS.prefs.setSuppressedChannels(TS.model.at_channel_suppressed_channels.join(","));
if(!TS.client){return
}if(p){TS.channels.calcUnreadCnts(p)
}if(q){TS.groups.calcUnreadCnts(q)
}},makeCorGPushSuppresed:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.push_at_channel_suppressed_channels.indexOf(o);
if(n==-1){TS.model.push_at_channel_suppressed_channels.push(o)
}TS.prefs.setPushSuppressedChannels(TS.model.push_at_channel_suppressed_channels.join(","))
},makeCorGNOTPushSuppresed:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.push_at_channel_suppressed_channels.indexOf(o);
if(n!=-1){TS.model.push_at_channel_suppressed_channels.splice(n,1)
}TS.prefs.setPushSuppressedChannels(TS.model.push_at_channel_suppressed_channels.join(","))
},makeCorGDTopNothing:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.loud_channels.indexOf(o);
if(n!=-1){TS.model.loud_channels.splice(n,1)
}TS.prefs.setLoudChannels(TS.model.loud_channels.join(","));
n=TS.model.never_channels.indexOf(o);
if(TS.model.prefs.growls_enabled){if(n==-1){TS.model.never_channels.push(o)
}j(o)
}else{if(n!=-1){TS.model.never_channels.splice(n,1)
}f(o)
}TS.prefs.setNeverChannels(TS.model.never_channels.join(","))
},makeCorGDTopEverything:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.never_channels.indexOf(o);
if(n!=-1){TS.model.never_channels.splice(n,1)
}TS.prefs.setNeverChannels(TS.model.never_channels.join(","));
n=TS.model.loud_channels.indexOf(o);
if(TS.model.prefs.growls_enabled&&TS.model.prefs.all_channels_loud){if(n!=-1){TS.model.loud_channels.splice(n,1)
}f(o)
}else{if(n==-1){TS.model.loud_channels.push(o)
}j(o)
}TS.prefs.setLoudChannels(TS.model.loud_channels.join(","))
},makeCorGDTopMentions:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.loud_channels.indexOf(o);
if(n!=-1){TS.model.loud_channels.splice(n,1)
}TS.prefs.setLoudChannels(TS.model.loud_channels.join(","));
n=TS.model.never_channels.indexOf(o);
if(n!=-1){TS.model.never_channels.splice(n,1)
}TS.prefs.setNeverChannels(TS.model.never_channels.join(","));
if(TS.model.prefs.growls_enabled&&!TS.model.prefs.all_channels_loud){f(o)
}else{j(o)
}},makeCorGPushNothing:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.push_loud_channels.indexOf(o);
if(n!=-1){TS.model.push_loud_channels.splice(n,1)
}TS.prefs.setPushLoudChannels(TS.model.push_loud_channels.join(","));
n=TS.model.push_mention_channels.indexOf(o);
if(n!=-1){TS.model.push_mention_channels.splice(n,1)
}TS.prefs.setPushMentionChannels(TS.model.push_mention_channels.join(","));
if(TS.model.prefs.push_everything||TS.model.prefs.push_mention_alert){i(o)
}else{l(o)
}},makeCorGPushEverything:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.push_mention_channels.indexOf(o);
if(n!=-1){TS.model.push_mention_channels.splice(n,1)
}TS.prefs.setPushMentionChannels(TS.model.push_mention_channels.join(","));
n=TS.model.push_loud_channels.indexOf(o);
if(TS.model.prefs.push_everything){if(n!=-1){TS.model.push_loud_channels.splice(n,1)
}l(o)
}else{if(n==-1){TS.model.push_loud_channels.push(o)
}i(o)
}TS.prefs.setPushLoudChannels(TS.model.push_loud_channels.join(","))
},makeCorGPushMentions:function(o){var p=TS.channels.getChannelById(o);
var q=TS.groups.getGroupById(o);
if(!p&&!q){TS.error('wtf no channel/group "'+o+'"');
return false
}var n=TS.model.push_loud_channels.indexOf(o);
if(n!=-1){TS.model.push_loud_channels.splice(n,1)
}TS.prefs.setPushLoudChannels(TS.model.push_loud_channels.join(","));
n=TS.model.push_mention_channels.indexOf(o);
if(!TS.model.prefs.push_mention_alert||TS.model.prefs.push_everything){if(n==-1){TS.model.push_mention_channels.push(o)
}i(o)
}else{if(n!=-1){TS.model.push_mention_channels.splice(n,1)
}l(o)
}TS.prefs.setPushMentionChannels(TS.model.push_mention_channels.join(","))
},getCalculatedCorGPushNotifySetting:function(o){if(!o){TS.error('wtf no c_id "'+o+'"');
return false
}var n=c(o);
if(n){if(b(o)){return"everything"
}if(h(o)){return"mentions"
}return"nothing"
}if(TS.model.prefs.push_everything){return"everything"
}if(TS.model.prefs.push_mention_alert){return"mentions"
}return"nothing"
}});
var d=function(n){if(!n){TS.error('wtf no c_id "'+n+'"');
return false
}if(TS.model.loud_channels.indexOf(n)>-1){return true
}return false
};
var a=function(n){if(!n){TS.error('wtf no c_id "'+n+'"');
return false
}if(TS.model.never_channels.indexOf(n)>-1){return true
}return false
};
var g=function(n){if(!n){TS.error('wtf no c_id "'+n+'"');
return false
}if(TS.model.loud_channels_set.indexOf(n)>-1){return true
}return false
};
var m=function(n){if(TS.model.prefs.growls_enabled&&TS.notifs.getCalculatedCorGNotifySetting(n)=="nothing"){return true
}return false
};
var k=function(n){var o=TS.notifs.getCalculatedCorGNotifySetting(n);
if(o!="mentions"){return false
}if(!TS.model.prefs.growls_enabled||TS.model.prefs.all_channels_loud){return true
}if(TS.notifs.hasUserSuppressedCorGChannelMentions(n)){return true
}return false
};
var e=function(n){if((!TS.model.prefs.growls_enabled||!TS.model.prefs.all_channels_loud)&&TS.notifs.getCalculatedCorGNotifySetting(n)=="everything"){return true
}return false
};
var b=function(n){if(!n){TS.error('wtf no c_id "'+n+'"');
return false
}if(TS.model.push_loud_channels.indexOf(n)>-1){return true
}return false
};
var h=function(n){if(!n){TS.error('wtf no c_id "'+n+'"');
return false
}if(TS.model.push_mention_channels.indexOf(n)>-1){return true
}return false
};
var c=function(n){if(!n){TS.error('wtf no c_id "'+n+'"');
return false
}if(TS.model.push_loud_channels_set.indexOf(n)>-1){return true
}return false
};
var j=function(o){var n=TS.model.loud_channels_set.indexOf(o);
if(n==-1){TS.model.loud_channels_set.push(o)
}TS.prefs.setLoudChannelsSet(TS.model.loud_channels_set.join(","))
};
var f=function(o){var n=TS.model.loud_channels_set.indexOf(o);
if(n!=-1){TS.model.loud_channels_set.splice(n,1)
}TS.prefs.setLoudChannelsSet(TS.model.loud_channels_set.join(","))
};
var i=function(o){var n=TS.model.push_loud_channels_set.indexOf(o);
if(n==-1){TS.model.push_loud_channels_set.push(o)
}TS.prefs.setPushLoudChannelsSet(TS.model.push_loud_channels_set.join(","))
};
var l=function(o){var n=TS.model.push_loud_channels_set.indexOf(o);
if(n!=-1){TS.model.push_loud_channels_set.splice(n,1)
}TS.prefs.setPushLoudChannelsSet(TS.model.push_loud_channels_set.join(","))
}
})();
(function(){TS.registerModule("channels",{switched_sig:new signals.Signal(),pre_switched_sig:new signals.Signal(),joined_sig:new signals.Signal(),member_joined_sig:new signals.Signal(),left_sig:new signals.Signal(),member_left_sig:new signals.Signal(),list_fetched_sig:new signals.Signal(),history_fetched_sig:new signals.Signal(),history_being_fetched_sig:new signals.Signal(),message_received_sig:new signals.Signal(),message_removed_sig:new signals.Signal(),message_changed_sig:new signals.Signal(),marked_sig:new signals.Signal(),unread_changed_sig:new signals.Signal(),unread_highlight_changed_sig:new signals.Signal(),topic_changed_sig:new signals.Signal(),purpose_changed_sig:new signals.Signal(),created_sig:new signals.Signal(),deleted_sig:new signals.Signal(),renamed_sig:new signals.Signal(),archived_sig:new signals.Signal(),unarchived_sig:new signals.Signal(),msg_not_sent_sig:new signals.Signal(),data_retention_changed_sig:new signals.Signal(),data_updated_sig:new signals.Signal(),onStart:function(){},addMsg:function(i,h){var e=TS.channels.getChannelById(i);
if(!e){TS.error('unknown channel "'+i+'"');
return
}var f=e.msgs;
if(!TS.utility.msgs.validateMsg(i,h,f)){return
}TS.utility.msgs.appendMsg(f,h);
TS.utility.msgs.maybeStoreMsgs(e.id,f);
TS.utility.msgs.maybeSetOldestMsgsTsAfterMsgAdded(e);
var g=!TS.utility.msgs.isTempMsg(h);
TS.channels.calcUnreadCnts(e,g);
TS.utility.msgs.maybeTruncateMsgs(e);
TS.channels.message_received_sig.dispatch(e,h)
},calcUnreadCnts:function(e,f){TS.shared.calcUnreadCnts(e,TS.channels,f)
},removeMsg:function(h,g){var e=TS.channels.getChannelById(h);
if(!e){TS.error('unknown channel "'+h+'"');
return
}if(e._archive_msgs){TS.utility.msgs.spliceMsg(e._archive_msgs,g)
}var f=e.msgs;
TS.utility.msgs.spliceMsg(f,g);
TS.channels.message_removed_sig.dispatch(e,g);
TS.utility.msgs.maybeStoreMsgs(e.id,f);
TS.channels.calcUnreadCnts(e,true)
},changeMsgText:function(h,g,e){var f=TS.channels.getChannelById(h);
if(!f){TS.error('unknown channel "'+h+'"');
return
}g.text=e;
TS.channels.message_changed_sig.dispatch(f,g);
TS.utility.msgs.maybeStoreMsgs(f.id,f.msgs)
},sendMsg:function(l,n){var h;
var j=TS.channels.getChannelById(l);
if(!j){return false
}if(j.is_archived){return false
}if(!j.is_member){return false
}var f=TS.channels.getGeneralChannel();
var m=function(p,o){if(o){TS.client.ui.addOrFlashEphemeralBotMsg({text:p,ephemeral_type:o})
}else{TS.generic_dialog.alert(p)
}TS.client.ui.$msg_input.val(n);
TS.view.focusMessageInput()
};
if(j.is_general&&!TS.members.canUserPostInGeneral()){m("A team owner has restricted posting to the #*"+j.name+"* channel.","general_posting_restricted");
return false
}var g=TS.format.cleanMsg(n);
var k=TS.boot_data.feature_at_here&&TS.model.here_regex.test(g);
var e=TS.model.channel_regex.test(g)||TS.model.group_regex.test(g)||k;
if(TS.model.everyone_regex.test(g)||(j.is_general&&e)){if(!TS.members.canUserAtEveryone()){h="<p>A team owner has restricted the use of <b>@everyone</b> messages.</p>";
if(TS.model.user.is_restricted){h="<p>Your account is restricted, and you cannot send <b>@everyone</b> messages.</p>"
}if(!j.is_general&&TS.members.canUserAtChannelOrAtGroup()){h+='<p class="no_bottom_margin">If you just want to address everyone in this channel, use <b>@channel</b> instead.</p>'
}m(h);
return false
}if(!j.is_general&&!TS.model.here_regex.test(g)){if(!f||!f.is_member){h="<p>You cannot send <b>@everyone</b> messages.</p>";
if(TS.members.canUserAtChannelOrAtGroup()){h+='<p class="no_bottom_margin">If you just want to address everyone in this channel, use <b>@channel</b> instead.</p>'
}m(h)
}else{TS.generic_dialog.start({title:"Send @everyone a message",body:'<p class="bold">Would you like to switch to #'+f.name+' and send your message?</p><p class="">Using <b>@everyone</b> in a message is a way to address your whole team, but it must be done in the #'+f.name+' channel.</p><p class="no_bottom_margin">If you just want to address everyone in this channel, use <b>@channel</b> instead.</p>',show_cancel_button:true,show_go_button:true,go_button_text:"Yes, send it",on_go:function(){TS.channels.displayChannel(f.id,n)
},on_cancel:function(){TS.client.ui.$msg_input.val(n);
TS.view.focusMessageInput()
}})
}return false
}}if(e&&!TS.members.canUserAtChannelOrAtGroup()){var i=k?"@here":"@channel";
h="<p>A team owner has restricted the use of <b>"+i+"</b> messages.</p>";
m(h);
return false
}if(TS.boot_data.feature_at_channel_warning&&TS.ui.needToShowAtChannelWarning(l,n)){TS.ui.at_channel_warning_dialog.startInMessagePane(l,n,TS.channels);
return false
}return TS.shared.sendMsg(l,n,TS.channels)
},onSendMsg:function(g,e){var f=TS.channels.getChannelById(e.SENT_MSG.channel);
if(!f){TS.error("unknown channel? "+e.SENT_MSG.channel);
return
}TS.shared.onSendMsg(g,e,f,TS.channels)
},displayChannel:function(h,f,j,g){j=!!j;
g=!!g;
var i=TS.channels.getChannelById(h);
if(!i){TS.error('channel "'+h+'" unknown');
return
}if(h==TS.model.active_channel_id&&!g){TS.warn('channel "'+h+'" already displayed');
if(f){TS.channels.sendMsg(h,$.trim(f))
}return
}if(TS.boot_data.feature_archive_viewer){if(!i.is_member){if(f){TS.model.requested_channel_joins[h]={and_send_txt:f};
TS.channels.join(i.name);
return
}else{}}}else{if(!i.is_member&&!i.is_archived){if(g){TS.error("I never ever expect to get here, but I am logging this just in case!")
}else{TS.model.requested_channel_joins[h]={and_send_txt:f};
TS.channels.join(i.name)
}return
}}var e=(g)?false:j;
if(TS.client.channelDisplaySwitched(h,null,null,g,e)){TS.channels.pre_switched_sig.dispatch();
TS.channels.switched_sig.dispatch()
}if(f){TS.channels.sendMsg(h,$.trim(f))
}},setLastRead:function(f,e){if(f.last_read==e){return false
}if(e.indexOf(TS.utility.date.fake_ts_unique_padder)>-1){TS.error("bad ts:"+e);
return false
}if(f.last_read>e){var g=TS.model.last_reads_set_by_client[f.id+"_"+e];
delete TS.model.last_reads_set_by_client[f.id+"_"+e];
if(g){TS.warn("NOT going back in time channel.last_read:"+f.last_read+" new:"+e);
return
}TS.info("going back in time channel.last_read:"+f.last_read+" new:"+e)
}f.last_read=e;
TS.channels.marked_sig.dispatch(f);
TS.channels.calcUnreadCnts(f);
return true
},markMostRecentReadMsg:function(e,f){if(!e){TS.error("channel unknown");
return
}if(!e.msgs||!e.msgs.length){return
}var g=TS.utility.msgs.getMostRecentValidTs(e.msgs);
if(!g){TS.warn("no valid tses???");
return
}e.all_read_this_session_once=true;
TS.channels.markReadMsg(e.id,g,f)
},markReadMsg:function(e,g,h){var f=TS.channels.getChannelById(e);
if(!f){TS.error('channel "'+e+'" unknown');
return
}if(f.last_read==g){return
}if(TS.channels.setLastRead(f,g)){f._marked_reason=h;
if(f.is_member){f.needs_api_marking=true
}}},onMarked:function(f,h,e){var g=TS.channels.getChannelById(e.channel);
if(!g){TS.error('wtf no channel "'+e.channel+'"');
return
}if(f||(h&&(h.error=="not_in_channel"||h.error=="is_archived"))){}else{g.needs_api_marking=true
}},join:function(e,g,f){if(TS.model.user.is_restricted){return
}if(!e){return
}if(!TS.channels.getChannelByName(e)){if(TS.model.created_channels[e]){return
}TS.model.created_channels[e]=true
}TS.api.call("channels.join",{name:e,in_background:!!f},function(i,j,h){TS.channels.onJoin(i,j,h);
if(g){g(i,j,h)
}if(!i){delete TS.model.created_channels[e]
}})
},onJoin:function(h,j,g){if(!h){if(j.error=="name_taken"){}else{if(j.error=="is_archived"){if(TS.boot_data.feature_archive_viewer){TS.channels.displayChannel(TS.channels.getChannelByName(g.name).id)
}else{setTimeout(function(){TS.generic_dialog.alert("<p>The <b>#"+TS.utility.htmlEntities(g.name)+'</b> channel is archived.</p><p><a href="/archives/'+TS.utility.htmlEntities(g.name)+'" target="_blank">Click here</a> to view the channel archives or re-open it.</p>')
},500)
}}else{if(j.error=="restricted_action"){TS.generic_dialog.alert("<p>You don't have permission to create new channels.</p><p>Talk to your team owner.</p>")
}else{TS.error("failed to join channel");
alert("failed to join channel")
}}}return
}var f;
var i;
if(j.channel){i=TS.channels.upsertChannel(j.channel);
f=j.channel.id
}if(!f){TS.error("no channel_id?!!");
return
}var e="";
if(TS.model.requested_channel_joins[f]){e=TS.model.requested_channel_joins[f].and_send_txt;
delete TS.model.requested_channel_joins[f]
}if(!i){TS.error("no channel?!!");
return
}if(g.in_background){return
}if(!i.needs_created_message&&!i.never_needs_joined_msg){i.needs_joined_message=true
}TS.channels.displayChannel(f,e)
},leave:function(f){if(TS.model.user.is_restricted){return
}var e=TS.channels.getChannelById(f);
if(!e){return
}if(e.is_general){TS.generic_dialog.alert("Sorry, you can't leave <b>#"+e.name+"</b>!");
return
}TS.channels.markMostRecentReadMsg(e,TS.model.marked_reasons.left);
TS.client.markLastReadsWithAPI();
TS.api.call("channels.leave",{channel:f},TS.channels.onLeave)
},onLeave:function(f,h,e){if(!f){TS.error("failed to leave channel");
return
}var g=TS.channels.getChannelById(e.channel);
if(!g){TS.error('wtf no channel "'+e.channel+'"');
return
}g.msgs.length=0;
TS.storage.storeMsgs(g.id,null)
},setTopic:function(f,e){TS.api.call("channels.setTopic",{channel:f,topic:e},TS.channels.onSetTopic)
},onSetTopic:function(f,g,e){if(!f){TS.error("failed to set channel topic");
return
}},setPurpose:function(f,e){TS.api.call("channels.setPurpose",{channel:f,purpose:e},TS.channels.onSetPurpose)
},onSetPurpose:function(f,g,e){if(!f){TS.error("failed to set channel purpose");
return
}},getChannelById:function(h){var e=TS.model.channels;
var g=d[h];
if(g){return g
}if(!e){return null
}for(var f=0;
f<e.length;
f++){g=e[f];
if(g.id==h){TS.warn(h+" not in _id_map?");
d[h]=g;
return g
}}return null
},getFirstChannelYouAreIn:function(){var e=TS.model.channels;
var g;
if(!e){return null
}for(var f=0;
f<e.length;
f++){g=e[f];
if(g.is_member){return g
}}return null
},getGeneralChannel:function(){var e=TS.model.channels;
var g;
for(var f=0;
f<e.length;
f++){g=e[f];
if(g.is_general){return g
}}},getChannelByName:function(f){f=TS.utility.getLowerCaseValue(f);
var e=TS.model.channels;
var h=c[f];
if(h){return h
}if(!e){return null
}for(var g=0;
g<e.length;
g++){h=e[g];
if(h._name_lc==f||"#"+h._name_lc==f){TS.warn(f+" not in _name_map?");
c["#"+f]=h;
c[f]=h;
return h
}}return null
},upsertChannel:function(m){var e=TS.model.channels;
var j=TS.channels.getChannelById(m.id);
var h;
if(j){TS.log(4,'updating existing channel "'+m.id+'"');
for(var g in m){if(g=="members"){h=m.members;
j.members.length=0;
for(var l=0;
l<h.length;
l++){j.members.push(h[l])
}}else{if(g==="pinned_items"){if(TS.boot_data.feature_pins&&TS.client){TS.pins.upsertPinnedItems(m.pinned_items);
j.pinned_items=m.pinned_items
}}else{j[g]=m[g]
}}}m=j;
if(TS.client&&m.is_member){TS.shared.checkInitialMsgHistory(m,TS.channels)
}}else{TS.log(4,'adding channel "'+m.id+'"');
e.push(m);
if(m.is_channel!==true){TS.warn(m.name+" lacked the is_channel flag from the server");
m.is_channel=true
}m.is_general=!!m.is_general;
m._name_lc=TS.utility.getLowerCaseValue(m.name);
m._show_in_list_even_though_no_unreads=false;
d[m.id]=m;
c[m._name_lc]=m;
c["#"+m._name_lc]=m;
if(!m.members){m.members=[]
}if(!m.topic){m.topic={}
}if(!m.purpose){m.purpose={}
}if(!m.unread_count){m.unread_count=0
}m.active_members=[];
m.is_member=!!m.is_member;
m.oldest_msg_ts=TS.storage.fetchOldestTs(m.id);
m.last_msg_input=TS.storage.fetchLastMsgInput(m.id);
m.scroll_top=-1;
m.history_is_being_fetched=false;
m.needs_api_marking=false;
m.unread_highlight_cnt=0;
m.unread_highlights=[];
m.unread_cnt=0;
m.unreads=[];
m.oldest_unread_ts=null;
m.has_fetched_history_after_scrollback=false;
if(TS.boot_data.feature_pins&&m.pinned_items&&TS.client){TS.pins.upsertPinnedItems(m.pinned_items)
}if(TS.client){var f=(m.is_member)?TS.utility.msgs.fetchInitialMsgsFromLS(m):[];
TS.utility.msgs.setMsgs(m,f)
}else{if(TS.boot_data.msgs){TS.utility.msgs.ingestMessagesFromBootData(m)
}}if(TS.model.created_channels[m.name]){m.needs_created_message=true;
delete TS.model.created_channels[m.name]
}}if(m.is_member&&m.is_archived){TS.error("channel.is_member and channel.is_archived are both true for "+m.id+" #"+m.name);
TS.dir(0,m);
m.is_member=false
}if(TS.client){var n=TS.utility.msgs.shouldMarkUnreadsOnMessageFetch();
TS.channels.calcUnreadCnts(m,n)
}TS.channels.calcActiveMembersForChannel(m);
return m
},removeChannel:function(g){var e=TS.model.channels;
TS.log(4,'removing channel "'+g.id+'"');
var h;
for(var f=0;
f<e.length;
f++){h=e[f];
if(h.id==g.id){e.splice(f,1);
break
}}delete d[g.id];
delete c[g._name_lc];
delete c["#"+g._name_lc];
if(TS.client){if(TS.model.active_channel_id==g.id){TS.client.activeChannelDisplayGoneAway()
}}g.msgs.length=0;
TS.storage.storeMsgs(g.id,null);
TS.channels.deleted_sig.dispatch(g)
},channelRenamed:function(g){var e=TS.channels.getChannelById(g.id);
delete c[e._name_lc];
delete c["#"+e._name_lc];
var f=TS.channels.upsertChannel(g);
f._name_lc=TS.utility.getLowerCaseValue(f.name);
c[f._name_lc]=f;
c["#"+f._name_lc]=f;
TS.channels.renamed_sig.dispatch(f)
},markScrollTop:function(g,e){var f=TS.channels.getChannelById(g);
if(!f){return false
}if(f.scroll_top==e){return false
}f.scroll_top=e;
return true
},maybeLoadScrollBackHistory:function(g,f){var e=TS.channels.getChannelById(g);
if(!e){return false
}return TS.shared.maybeLoadScrollBackHistory(e,TS.channels,f)
},maybeLoadHistory:function(f){var e=TS.channels.getChannelById(f);
if(!e){return false
}return TS.shared.maybeLoadHistory(e,TS.channels)
},onHistory:function(f,h,e){var g=TS.channels.getChannelById(e.channel);
if(!g){TS.error('wtf no channel "'+e.channel+'"');
return
}if(!f||!h||!h.messages){TS.error("failed to get history");
(g.history_fetch_retries)?g.history_fetch_retries++:g.history_fetch_retries=1;
TS.channels.history_fetched_sig.dispatch(g);
return
}delete g.history_fetch_retries;
var j=TS.shared.onHistory(g,h,e,TS.channels);
if(!j){g.history_is_being_fetched=false;
TS.channels.history_fetched_sig.dispatch(g)
}var i=TS.utility.msgs.shouldMarkUnreadsOnMessageFetch();
TS.channels.calcUnreadCnts(g,i)
},fetchHistory:function(g,e,f){if(!g){TS.error('wtf no channel "'+g+'"');
return
}g.history_is_being_fetched=true;
g.history_fetch_failed=false;
TS.channels.history_being_fetched_sig.dispatch(g);
if(g.history_fetch_retries>5){delete g.history_fetch_retries;
g.history_is_being_fetched=false;
g.history_fetch_failed=true;
if(TS.client){TS.client.msg_pane.updateEndMarker()
}return
}TS.api.call("channels.history",e,f||TS.channels.onHistory)
},topicChanged:function(h,e,g,f){if(!h.topic){h.topic={}
}h.topic.creator=e;
h.topic.last_set=g;
h.topic.value=f;
TS.channels.topic_changed_sig.dispatch(h,e,f)
},purposeChanged:function(h,e,g,f){if(!h.purpose){h.purpose={}
}h.purpose.creator=e;
h.purpose.last_set=g;
h.purpose.value=f;
TS.channels.purpose_changed_sig.dispatch(h,e,f)
},closeArchivedChannel:function(f){var e=TS.channels.getChannelById(f);
if(!e){return
}if(!e.is_archived){return
}e.was_archived_this_session=false;
TS.client.activeChannelDisplayGoneAway()
},makeMembersWithPreselectsForTemplate:function(e,f){f=f||[];
var g=[];
for(var h=0;
h<e.length;
h++){var k=e[h];
var j=f.indexOf(k.id)!=-1;
g[h]={member:k,preselected:j}
}return g
},getActiveMembersNotInThisChannelForInviting:function(l,h){var g=[];
var j=h||TS.model.user.is_admin;
if(TS.model.user.is_ultra_restricted){return g
}var i=TS.channels.getChannelById(l);
if(!i){return g
}var k;
var f=TS.members.getActiveMembersWithSelfAndNotSlackbot();
for(var e=0;
e<f.length;
e++){k=f[e];
if(k.is_ultra_restricted){continue
}if(!j&&k.is_restricted){continue
}if(i.members.indexOf(k.id)==-1){g.push(k)
}}return g
},calcActiveMembersForChannel:function(f){f.active_members.length=0;
if(!f.members){return
}var g;
for(var e=0;
e<f.members.length;
e++){g=TS.members.getMemberById(f.members[e]);
if(!g){continue
}if(g.deleted){continue
}f.active_members.push(g.id)
}},calcActiveMembersForAllChannels:function(){var e=TS.model.channels;
for(var f=0;
f<e.length;
f++){TS.channels.calcActiveMembersForChannel(e[f])
}},fetchList:function(){TS.api.call("channels.list",{},TS.channels.onListFetched)
},onListFetched:function(f,g,e){if(!f){TS.error("failed to fetch channel list");
return
}$.each(g.channels,function(h,j){TS.channels.upsertChannel(j)
});
TS.channels.list_fetched_sig.dispatch(g.channels)
},kickMember:function(i,e){if(!TS.members.canUserKickFromChannels()){return
}var f=TS.channels.getChannelById(i);
if(!f){return
}var h=TS.members.getMemberById(e);
if(!h){return
}if(f.members.indexOf(h.id)==-1){TS.generic_dialog.alert("<b>"+TS.members.getMemberDisplayName(h,true)+"</b> is not a member of #"+f.name+".");
return
}var g=TS.members.getMemberDisplayName(h,true);
TS.generic_dialog.start({title:"Remove "+g,body:"<p>Are you sure you wish to remove <b>"+g+"</b> from #"+f.name+"?</p>",go_button_text:"Yes, remove them",on_go:function(){TS.api.call("channels.kick",{channel:i,user:e},function(k,l,j){if(!k){var m='Kicking failed with error "'+l.error+'"';
if(l.error=="cant_kick_from_last_channel"){m="<b>"+g+"</b> can't be kicked from #"+f.name+" because they must belong to at least one channel or group."
}else{if(l.error=="restricted_action"){m="<p>You don't have permission to kick from channels.</p><p>Talk to your team owner.</p>"
}}setTimeout(TS.generic_dialog.alert,500,m)
}})
}})
},getChannelsForUser:function(){if(!TS.model.user.is_restricted){return TS.model.channels
}b.length=0;
var f;
for(var e=0;
e<TS.model.channels.length;
e++){f=TS.model.channels[e];
if(!f.is_member){continue
}b.push(f)
}return b
},getUnarchivedChannelsForUser:function(){a.length=0;
var e=TS.channels.getChannelsForUser();
var g;
for(var f=0;
f<e.length;
f++){g=e[f];
if(g.is_archived){continue
}a.push(g)
}return a
},setDataRetention:function(e,f,i,h){var g={channel:e,retention_type:$("select[name=retention_type]").val()};
if(g.retention_type==1){g.retention_duration=$("#retention_duration").val()
}TS.api.call("channels.setRetention",g,function(k,l,j){if(h){h(k,l,j)
}if(k){TS.channels.data_retention_changed_sig.dispatch(j)
}})
},getDataRetention:function(e,f){TS.api.call("channels.getRetention",{channel:e},f)
}});
var b=[];
var a=[];
var d={};
var c={}
})();
(function(){TS.registerModule("channels.ui",{onStart:function(){},showDataRetentionDialog:function(o,t,h,m){var j=!h;
var n,q,r;
n=TS.channels.getChannelById(o);
if(!n){q=TS.ims.getImById(o)
}if(!n&&!q){r=TS.groups.getGroupById(o)
}if(!q&&!n&&!r){TS.error("unknown channel_id passed to data retention dialog:"+o);
return
}var p,i;
if(n){i="channel";
p="#"+TS.utility.htmlEntities(n.name)
}else{if(q){i="conversation";
p="this conversation"
}else{i="group";
p=TS.utility.htmlEntities(r.name)
}}var k=TS.model.team.prefs.retention_type;
var l=TS.model.team.prefs.retention_duration;
if(r){k=TS.model.team.prefs.group_retention_type;
l=TS.model.team.prefs.group_retention_duration
}else{if(q){k=TS.model.team.prefs.dm_retention_type;
l=TS.model.team.prefs.dm_retention_duration
}}var s=f();
if(!j){s=TS.templates.channel_data_retention_dialog({model_type:i,retention_type:h,retention_duration:m,team_type:k,team_duration:l})
}TS.generic_dialog.start({title:"Edit retention policy for "+p,body:s,go_button_text:"Save settings",enter_always_gos:true,on_go:function(){var u=$("select[name=retention_type]").val();
var v=$("#retention_duration").val();
if(u===null){return
}if(v===null){return
}if(n){TS.channels.setDataRetention(o,u,v,t)
}else{if(q){TS.ims.setDataRetention(o,u,v,t)
}else{TS.groups.setDataRetention(o,u,v,t)
}}},on_show:j?null:a});
if(j){if(n){TS.channels.getDataRetention(o,e)
}else{if(q){TS.ims.getDataRetention(o,c)
}else{TS.groups.getDataRetention(o,g)
}}}},channelCreateDialogShowNameTakenAlert:function(h){h.find(".modal_input_note").addClass("hidden");
h.find(".name_taken_warning").removeClass("hidden");
$("#channel_create_title").select()
},channelCreateDialogShowDisallowedCharsAlert:function(h){h.find(".modal_input_note").addClass("hidden");
h.find(".invalid_chars_warning").removeClass("hidden");
$("#channel_create_title").select()
},channelCreateDialogShowSinglePunctuationAlert:function(h){h.find(".modal_input_note").addClass("hidden");
h.find(".single_punctuation_warning").removeClass("hidden");
$("#channel_create_title").select()
},channelCreateDialogValidateInput:function(j){var h=j.find(".title_input").val();
var i=TS.utility.cleanChannelName(h);
while(h.substr(0,1)=="#"){h=h.substr(1)
}if(i!=h){j.find(".title_input").val(i);
TS.channels.ui.channelCreateDialogShowDisallowedCharsAlert(j);
return false
}if(i==="_"||i==="-"){TS.channels.ui.channelCreateDialogShowSinglePunctuationAlert(j);
return false
}if(!h){$("#channel_create_title").select();
return false
}if(TS.channels.getChannelByName(h)||TS.groups.getGroupByName(h)||TS.members.getMemberByName(h)){TS.channels.ui.channelCreateDialogShowNameTakenAlert(j);
return false
}return true
}});
var e=function(i,k,h){if(i){var j=k.retention.retention_type;
var l=k.retention.retention_duration;
d("channel",j,l)
}else{b("channel",k)
}};
var g=function(i,k,h){if(i){var j=k.retention.retention_type;
var l=k.retention.retention_duration;
d("group",j,l)
}else{b("group",k)
}};
var c=function(i,k,h){if(i){var j=k.retention.retention_type;
var l=k.retention.retention_duration;
d("conversation",j,l)
}else{b("conversation",k)
}};
var d=function(i,j,m){var k=$("#generic_dialog .loading_hash_animation");
var l=TS.model.team.prefs.retention_type;
var h=TS.model.team.prefs.retention_duration;
if(i==="group"){l=TS.model.team.prefs.group_retention_type;
h=TS.model.team.prefs.group_retention_duration
}else{if(i==="conversation"){l=TS.model.team.prefs.dm_retention_type;
h=TS.model.team.prefs.dm_retention_duration
}}k.replaceWith(TS.templates.channel_data_retention_dialog({model_type:i,retention_type:j,retention_duration:m,team_type:l,team_duration:h}));
a()
};
var b=function(h,j){var i=$("#generic_dialog .loading_hash_animation");
if(j.error==="no_perms"||j.error==="is_archived"||j.error==="not_paid"){i.replaceWith('<p class="no_bottom_margin">Sorry! You can\'t change the retention duration for this '+h+".</p>")
}else{i.replaceWith('<p class="no_bottom_margin">Oops! Something went wrong. Please try again.</p>')
}};
var a=function(){$("select[name=retention_type]").change(function(){if(this.value!=1){$("#team_retention_pref").removeClass("hidden");
$("#retention_duration_container, #retention_duration_warning").addClass("hidden")
}else{$("#team_retention_pref").addClass("hidden");
$("#retention_duration_container, #retention_duration_warning").removeClass("hidden");
if($("#retention_duration").val()===0){$("#retention_duration").val("")
}$("#retention_duration").focus()
}}).change()
};
var f=function(){var h=cdn_url+"/f85a/img/loading_hash_animation_@2x.gif";
return'<div class="loading_hash_animation" style="margin: 2rem;"><img src="'+h+'" alt="Loading" /><br />loading...</div>'
}
})();
(function(){TS.registerModule("groups",{switched_sig:new signals.Signal(),pre_switched_sig:new signals.Signal(),joined_sig:new signals.Signal(),member_joined_sig:new signals.Signal(),left_sig:new signals.Signal(),member_left_sig:new signals.Signal(),history_fetched_sig:new signals.Signal(),history_being_fetched_sig:new signals.Signal(),message_received_sig:new signals.Signal(),message_removed_sig:new signals.Signal(),message_changed_sig:new signals.Signal(),marked_sig:new signals.Signal(),unread_changed_sig:new signals.Signal(),unread_highlight_changed_sig:new signals.Signal(),topic_changed_sig:new signals.Signal(),purpose_changed_sig:new signals.Signal(),deleted_sig:new signals.Signal(),renamed_sig:new signals.Signal(),opened_sig:new signals.Signal(),closed_sig:new signals.Signal(),archived_sig:new signals.Signal(),unarchived_sig:new signals.Signal(),msg_not_sent_sig:new signals.Signal(),data_retention_changed_sig:new signals.Signal(),onStart:function(){},addMsg:function(j,i){var h=TS.groups.getGroupById(j);
if(!h){TS.error('unknown group "'+j+'"');
return
}var f=h.msgs;
if(!TS.utility.msgs.validateMsg(j,i,f)){return
}TS.utility.msgs.appendMsg(f,i);
TS.utility.msgs.maybeStoreMsgs(h.id,f);
TS.utility.msgs.maybeSetOldestMsgsTsAfterMsgAdded(h);
var g=!TS.utility.msgs.isTempMsg(i);
TS.groups.calcUnreadCnts(h,g);
TS.utility.msgs.maybeTruncateMsgs(h);
TS.groups.message_received_sig.dispatch(h,i);
if(!h.is_open){TS.api.call("groups.open",{channel:h.id},TS.groups.onOpened)
}},calcUnreadCnts:function(g,f){TS.shared.calcUnreadCnts(g,TS.groups,f)
},removeMsg:function(i,h){var g=TS.groups.getGroupById(i);
if(!g){TS.error('unknown group "'+i+'"');
return
}if(g._archive_msgs){TS.utility.msgs.spliceMsg(g._archive_msgs,h)
}var f=g.msgs;
TS.utility.msgs.spliceMsg(f,h);
TS.groups.message_removed_sig.dispatch(g,h);
TS.utility.msgs.maybeStoreMsgs(g.id,f);
TS.groups.calcUnreadCnts(g,true)
},changeMsgText:function(i,h,f){var g=TS.groups.getGroupById(i);
if(!g){TS.error('unknown group "'+i+'"');
return
}h.text=f;
TS.groups.message_changed_sig.dispatch(g,h);
TS.utility.msgs.maybeStoreMsgs(g.id,g.msgs)
},sendMsg:function(n,o){var m=TS.groups.getGroupById(n);
if(!m){return false
}if(m.is_archived){return false
}var f=TS.channels.getGeneralChannel();
var l=function(p){TS.generic_dialog.alert(p);
TS.client.ui.$msg_input.val(o);
TS.view.focusMessageInput()
};
var g=TS.format.cleanMsg(o);
var i;
if(TS.model.everyone_regex.test(g)){if(!TS.members.canUserAtEveryone()){i="<p>A team owner has restricted the use of <b>@everyone</b> messages.</p>";
if(TS.model.user.is_restricted){i="<p>Your account is restricted, and you cannot send <b>@everyone</b> messages.</p>"
}if(TS.members.canUserAtChannelOrAtGroup()){i+='<p class="no_bottom_margin">If you just want to address everyone in this group, use <b>@group</b> instead.</p>'
}l(i);
return false
}if(!f||!f.is_member){i="<p>You cannot send <b>@everyone</b> messages.</p>";
if(TS.members.canUserAtChannelOrAtGroup()){i+='<p class="no_bottom_margin">If you just want to address everyone in this group, use <b>@group</b> instead.</p>'
}l(i)
}else{TS.generic_dialog.start({title:"Send @everyone a message",body:'<p class="bold">Would you like to switch to #'+f.name+' and send your message?</p><p class="">Using <b>@everyone</b> in a message is a way to address your whole team, but it must be done in the #'+f.name+' channel.</p><p class="no_bottom_margin">If you just want to address everyone in this group, use <b>@group</b> instead.</p>',show_cancel_button:true,show_go_button:true,go_button_text:"Yes, send it",on_go:function(){TS.channels.displayChannel(f.id,o)
},on_cancel:function(){TS.client.ui.$msg_input.val(o);
TS.view.focusMessageInput()
}})
}return false
}var k=TS.boot_data.feature_at_here&&TS.model.here_regex.test(g);
var h=(TS.model.channel_regex.test(g)||TS.model.group_regex.test(g))||k;
if(h&&!TS.members.canUserAtChannelOrAtGroup()){var j=k?"@here":"@group";
i="<p>A team owner has restricted the use of <b>"+j+"</b> messages.</p>";
l(i);
return false
}if(TS.boot_data.feature_at_channel_warning&&TS.ui.needToShowAtChannelWarning(n,o)){TS.ui.at_channel_warning_dialog.startInMessagePane(n,o,TS.groups);
return false
}return TS.shared.sendMsg(n,o,TS.groups)
},onSendMsg:function(h,f){var g=TS.groups.getGroupById(f.SENT_MSG.channel);
if(!g){TS.error("unknown group? "+f.SENT_MSG.channel);
return
}TS.shared.onSendMsg(h,f,g,TS.groups)
},closeGroup:function(g){var f=TS.groups.getGroupById(g);
if(!f){return
}TS.api.call("groups.close",{channel:g},TS.groups.onClosed)
},onClosed:function(g,h,f){if(!g){return
}if(h.no_op){var i=TS.groups.getGroupById(f.channel);
if(i){i.is_open=false;
if(i.is_archived){i.was_archived_this_session=false
}if(TS.model.active_group_id==i.id){if(TS.client){TS.client.activeChannelDisplayGoneAway()
}}TS.groups.closed_sig.dispatch(i)
}}},onOpened:function(f,g){if(!f){return
}},displayGroup:function(i,g,j,h){j=!!j;
h=!!h;
var k=TS.groups.getGroupById(i);
if(!k){TS.error('group "'+i+'" unknown');
return
}TS.info("displayGroup "+k.name+" from_history:"+j+" replace_history_state:"+h);
if(i==TS.model.active_group_id&&!h){TS.warn('group "'+i+'" already displayed');
if(g){TS.groups.sendMsg(i,$.trim(g))
}return
}var f=(h)?false:j;
if(TS.client.channelDisplaySwitched(null,null,i,h,f)){TS.groups.pre_switched_sig.dispatch();
TS.groups.switched_sig.dispatch()
}if(k.is_open){if(g){TS.groups.sendMsg(i,$.trim(g))
}return
}TS.model.requested_group_opens[i]={and_send_txt:g};
TS.api.call("groups.open",{channel:k.id},TS.groups.onOpened)
},setLastRead:function(h,f){if(h.last_read==f){return false
}if(f.indexOf(TS.utility.date.fake_ts_unique_padder)>-1){TS.error("bad ts:"+f);
return false
}if(h.last_read>f){var g=TS.model.last_reads_set_by_client[h.id+"_"+f];
delete TS.model.last_reads_set_by_client[h.id+"_"+f];
if(g){TS.warn("NOT going back in time group.last_read:"+h.last_read+" new:"+f);
return
}TS.info("going back in time group.last_read:"+h.last_read+" new:"+f)
}h.last_read=f;
TS.groups.marked_sig.dispatch(h);
TS.groups.calcUnreadCnts(h);
return true
},markMostRecentReadMsg:function(g,f){if(!g){TS.error("group unknown");
return
}if(!g.msgs||!g.msgs.length){return
}var h=TS.utility.msgs.getMostRecentValidTs(g.msgs);
if(!h){TS.warn("no valid tses???");
return
}g.all_read_this_session_once=true;
TS.groups.markReadMsg(g.id,h,f)
},markReadMsg:function(g,f,i){var h=TS.groups.getGroupById(g);
if(!h){TS.error('group "'+g+'" unknown');
return
}if(h.last_read==f){return
}if(TS.groups.setLastRead(h,f)){h._marked_reason=i;
h.needs_api_marking=true
}},onMarked:function(g,h,f){var i=TS.groups.getGroupById(f.channel);
if(!i){TS.error('wtf no group "'+f.channel+'"');
return
}if(g||(h&&h.error=="is_archived")){}else{i.needs_api_marking=true
}},create:function(g,f,i){if(!g){return
}TS.model.created_groups[g]=true;
var h=(f)?f.join(","):"";
TS.api.call("groups.create",{name:g,and_invite_members_ids:h},function(k,l,j){TS.groups.onCreate(k,l,j);
if(i){i(k,l,j)
}})
},createChild:function(g,f,j){var i=TS.groups.getGroupById(g);
if(!i){return
}TS.model.archives_and_recreated_groups[g]=true;
var h=(f)?f.join(","):"";
TS.api.call("groups.createChild",{channel:g,and_invite_members_ids:h},function(l,m,k){TS.groups.onCreate(l,m,k);
if(j){j(l,m,k)
}})
},onCreate:function(h,k,f){if(!h){if(k.error=="name_taken"){}else{if(k.error=="restricted_action"){}else{TS.error("failed to create group");
alert("failed to create group")
}}return
}var m;
var j;
if(k.group){m=TS.groups.upsertGroup(k.group);
j=k.group.id
}if(!j){TS.error("no group_id?!!");
return
}if(!m){TS.error("no group?!!");
return
}var l=f.and_invite_members_ids?f.and_invite_members_ids.split(","):null;
if(l){for(var g=0;
g<l.length;
g++){TS.api.call("groups.invite",{channel:j,user:l[g]})
}}TS.groups.displayGroup(j)
},leave:function(g){var f=TS.groups.getGroupById(g);
if(!f){TS.error("WTF no group:"+g);
return
}if(f.active_members.length==1){TS.groups.closeGroup(g);
return
}if(!TS.groups.canLeaveGroup(g)){return
}TS.generic_dialog.start({title:"Leave "+TS.model.group_prefix+f.name,body:"<p>If you leave the group, you will no longer be able to see any of its messages. To rejoin the group, you will have to be re-invited.</p><p>Are you sure you wish to leave?</p>",go_button_text:"Yes, leave the group",on_go:function(){TS.api.call("groups.leave",{channel:g},TS.groups.onLeave)
}})
},onLeave:function(g,h,f){if(!g){if(h&&h.error=="last_member"){TS.groups.closeGroup(f.channel);
return
}TS.error("failed to leave group");
return
}var i=TS.groups.getGroupById(f.channel);
if(!i){TS.error('wtf no group "'+f.channel+'"');
return
}i.msgs.length=0;
TS.storage.storeMsgs(i.id,null)
},setTopic:function(g,f){TS.api.call("groups.setTopic",{channel:g,topic:f},TS.groups.onSetTopic)
},onSetTopic:function(g,h,f){if(!g){TS.error("failed to set group topic");
return
}},setPurpose:function(g,f){TS.api.call("groups.setPurpose",{channel:g,purpose:f},TS.groups.onSetPurpose)
},onSetPurpose:function(g,h,f){if(!g){TS.error("failed to set group purpose");
return
}},getGroupById:function(j){var f=TS.model.groups;
var h=c[j];
if(h){return h
}if(!f){return null
}for(var g=0;
g<f.length;
g++){h=f[g];
if(h.id==j){TS.warn(j+" not in _id_map?");
c[j]=h;
return h
}}return null
},getGroupByName:function(g){g=TS.utility.getLowerCaseValue(g);
var f=TS.model.groups;
var j=b[g];
if(j){return j
}if(!f){return null
}for(var h=0;
h<f.length;
h++){j=f[h];
if(j._name_lc==g||TS.model.group_prefix+j._name_lc==g){TS.warn(g+" not in _name_map?");
b[g]=j;
b[TS.model.group_prefix+g]=j;
return j
}}return null
},upsertGroup:function(o){var f=TS.model.groups;
var l=TS.groups.getGroupById(o.id);
var j;
if(l){TS.log(4,'updating existing group "'+o.id+'"');
for(var h in o){if(h=="members"){j=o.members;
l.members.length=0;
for(var m=0;
m<j.length;
m++){l.members.push(j[m])
}}else{if(h==="pinned_items"){if(TS.boot_data.feature_pins&&TS.client){TS.pins.upsertPinnedItems(o.pinned_items);
l.pinned_items=o.pinned_items
}}else{l[h]=o[h]
}}}o=l;
if(TS.client&&(o.is_open||o.unread_cnt)){TS.shared.checkInitialMsgHistory(o,TS.groups)
}}else{TS.log(4,'adding group "'+o.id+'"');
f.push(o);
if(o.is_group!==true){TS.warn(o.name+" lacked the is_group flag from the server");
o.is_group=true
}o._name_lc=TS.utility.getLowerCaseValue(o.name);
o._show_in_list_even_though_no_unreads=false;
c[o.id]=o;
b[o._name_lc]=o;
b[TS.model.group_prefix+o._name_lc]=o;
o.active_members=[];
o.oldest_msg_ts=TS.storage.fetchOldestTs(o.id);
o.last_msg_input=TS.storage.fetchLastMsgInput(o.id);
o.scroll_top=-1;
o.history_is_being_fetched=false;
o.needs_api_marking=false;
o.unread_highlight_cnt=0;
o.unread_highlights=[];
o.unread_cnt=0;
o.unreads=[];
o.oldest_unread_ts=null;
o.has_fetched_history_after_scrollback=false;
if(TS.boot_data.feature_pins&&o.pinned_items&&TS.client){TS.pins.upsertPinnedItems(o.pinned_items)
}if(TS.client){var g=TS.utility.msgs.fetchInitialMsgsFromLS(o);
TS.utility.msgs.setMsgs(o,g)
}else{if(TS.boot_data.msgs){TS.utility.msgs.ingestMessagesFromBootData(o)
}}if(TS.model.created_groups[o.name]){delete TS.model.created_groups[o.name]
}}if(TS.client){var n=TS.utility.msgs.shouldMarkUnreadsOnMessageFetch();
TS.groups.calcUnreadCnts(o,n)
}TS.groups.calcActiveMembersForGroup(o);
return o
},removeGroup:function(h){var f=TS.model.groups;
TS.log(4,'removing group "'+h.id+'"');
var j;
for(var g=0;
g<f.length;
g++){j=f[g];
if(j.id==h.id){f.splice(g,1);
break
}}delete c[h.id];
delete b[h._name_lc];
delete b[TS.model.group_prefix+h._name_lc];
if(TS.client){if(TS.model.active_group_id==h.id){TS.client.activeChannelDisplayGoneAway()
}}h.msgs.length=0;
TS.storage.storeMsgs(h.id,null);
TS.groups.deleted_sig.dispatch(h)
},groupRenamed:function(h){var f=TS.groups.getGroupById(h.id);
delete b[f._name_lc];
delete b[TS.model.group_prefix+f._name_lc];
var g=TS.groups.upsertGroup(h);
g._name_lc=TS.utility.getLowerCaseValue(g.name);
b[g._name_lc]=g;
b[TS.model.group_prefix+g._name_lc]=g;
TS.view.updateTitleWithContext();
TS.groups.renamed_sig.dispatch(g)
},markScrollTop:function(h,f){var g=TS.groups.getGroupById(h);
if(!g){return false
}if(g.scroll_top==f){return false
}g.scroll_top=f;
return true
},maybeLoadScrollBackHistory:function(h,f){var g=TS.groups.getGroupById(h);
if(!g){return false
}return TS.shared.maybeLoadScrollBackHistory(g,TS.groups,f)
},maybeLoadHistory:function(g){var f=TS.groups.getGroupById(g);
if(!f){return false
}return TS.shared.maybeLoadHistory(f,TS.groups)
},onHistory:function(g,h,f){var j=TS.groups.getGroupById(f.channel);
if(!j){TS.error('wtf no group "'+f.channel+'"');
return
}if(!g||!h||!h.messages){TS.error("failed to get history");
(j.history_fetch_retries)?j.history_fetch_retries++:j.history_fetch_retries=1;
TS.groups.history_fetched_sig.dispatch(j);
return
}delete j.history_fetch_retries;
var k=TS.shared.onHistory(j,h,f,TS.groups);
if(!k){j.history_is_being_fetched=false;
TS.groups.history_fetched_sig.dispatch(j)
}var i=TS.utility.msgs.shouldMarkUnreadsOnMessageFetch();
TS.groups.calcUnreadCnts(j,i)
},fetchHistory:function(h,f,g){if(!h){TS.error('wtf no group "'+h+'"');
return
}h.history_is_being_fetched=true;
h.history_fetch_failed=false;
TS.groups.history_being_fetched_sig.dispatch(h);
if(h.history_fetch_retries>5){delete h.history_fetch_retries;
h.history_is_being_fetched=false;
h.history_fetch_failed=true;
if(TS.client){TS.client.msg_pane.updateEndMarker()
}return
}TS.api.call("groups.history",f,g||TS.groups.onHistory)
},topicChanged:function(i,f,h,g){if(!i.topic){i.topic={}
}i.topic.creator=f;
i.topic.last_set=h;
i.topic.value=g;
TS.groups.topic_changed_sig.dispatch(i,f,g)
},purposeChanged:function(i,f,h,g){if(!i.purpose){i.purpose={}
}i.purpose.creator=f;
i.purpose.last_set=h;
i.purpose.value=g;
TS.groups.purpose_changed_sig.dispatch(i,f,g)
},getUnarchivedClosedGroups:function(j){e.length=0;
var f=TS.model.groups;
var h;
for(var g=0;
g<f.length;
g++){h=f[g];
if(h.is_archived){continue
}if(h.is_open){continue
}e.push(h)
}return e
},getUnarchivedGroups:function(){a.length=0;
var f=TS.model.groups;
var h;
for(var g=0;
g<f.length;
g++){h=f[g];
if(h.is_archived){continue
}a.push(h)
}return a
},getActiveMembersNotInThisGroupForInviting:function(h,f){var g=TS.groups.getGroupById(h);
if(!g){return[]
}return d(f,g)
},getActiveMembersForInviting:function(f){return d(f)
},getGroupsWithTheseActiveMembers:function(n){var f=[];
var g=TS.model.groups;
var o;
var j=n.sort().join(",");
var p;
var k;
for(var l=0;
l<g.length;
l++){o=g[l];
o.members.sort();
p=[];
for(var h=0;
h<o.members.length;
h++){k=TS.members.getMemberById(o.members[h]);
if(!k){continue
}if(k.deleted){continue
}p.push(k.id)
}if(j==p.join(",")){f.push(o)
}}return f
},calcActiveMembersForGroup:function(g){g.active_members.length=0;
if(!g.members){return
}var h;
for(var f=0;
f<g.members.length;
f++){h=TS.members.getMemberById(g.members[f]);
if(!h){continue
}if(h.deleted){continue
}g.active_members.push(h.id)
}},calcActiveMembersForAllGroups:function(){var f=TS.model.groups;
for(var g=0;
g<f.length;
g++){TS.groups.calcActiveMembersForGroup(f[g])
}},createSuggestedName:function(k){var f=TS.model.user.name;
var n=[];
var h;
var j;
var l=TS.model.channel_name_max_length;
for(j=0;
j<k.length;
j++){h=TS.members.getMemberById(k[j]);
if(!h){continue
}n.push(h)
}n.sort(function g(q,i){if(q.id==TS.ui.group_create_dialog.start_member_id){return -1
}if(i.id==TS.ui.group_create_dialog.start_member_id){return 1
}var r=q._name_lc;
var s=i._name_lc;
if(r<s){return -1
}if(r>s){return 1
}return 0
});
for(j=0;
j<n.length;
j++){h=n[j];
f+="-"+h.name.split("-")[0]
}if(f.length>l){f=f.substr(0,l);
if(f.charAt(f.length-1)=="-"){f=f.substr(0,l-1)
}}var o=f;
var p=1;
var m;
while(TS.channels.getChannelByName(f)||TS.groups.getGroupByName(f)||TS.members.getMemberByName(f)){m=(p+1).toString();
f=o+m;
if(f.length>l){f=o.substr(0,l-m.length)+m
}}return f
},kickMember:function(j,f){if(!TS.members.canUserKickFromGroups()){return
}var h=TS.groups.getGroupById(j);
if(!h){return
}var i=TS.members.getMemberById(f);
if(!i){return
}if(h.members.indexOf(i.id)==-1){TS.generic_dialog.alert("<b>"+TS.members.getMemberDisplayName(i,true)+"</b> is not a member of "+h.name+".");
return
}var g=TS.members.getMemberDisplayName(i,true);
TS.generic_dialog.start({title:"Remove "+g,body:"<p>If you remove <b>"+g+"</b> from "+h.name+", they will no longer be able to see any of its messages. To rejoin the group, they will have to be re-invited.</p><p>Are you sure you wish to do this?</p>",go_button_text:"Yes, remove them",on_go:function(){TS.api.call("groups.kick",{channel:j,user:f},function(l,m,k){if(!l){var n='Kicking failed with error "'+m.error+'"';
if(m.error=="cant_kick_from_last_channel"){n="<b>"+g+"</b> can't be kicked from <b>"+h.name+"</b> because they must belong to at least one channel or group."
}else{if(m.error=="restricted_action"){n="<p>You don't have permission to kick from channels.</p><p>Talk to your team owner.</p>"
}}setTimeout(TS.generic_dialog.alert,500,n)
}})
}})
},canLeaveGroup:function(h){if(!TS.model.user.is_restricted){return true
}if(TS.model.user.is_ultra_restricted){return false
}if(TS.channels.getChannelsForUser().length){return true
}var f=TS.model.groups;
var j;
for(var g=0;
g<f.length;
g++){j=f[g];
if(j.is_archived){continue
}if(j.id==h){continue
}return true
}return false
},setDataRetention:function(j,f,i,h){var g={channel:j,retention_type:$("select[name=retention_type]").val()};
if(g.retention_type==1){g.retention_duration=$("#retention_duration").val()
}TS.api.call("groups.setRetention",g,function(l,m,k){if(h){h(l,m,k)
}if(l){TS.groups.data_retention_changed_sig.dispatch(k)
}})
},getDataRetention:function(g,f){TS.api.call("groups.getRetention",{channel:g},f)
}});
var c={};
var b={};
var e=[];
var a=[];
var d=function(h,j){var g=[];
if(TS.model.user.is_ultra_restricted&&!h){return g
}var i=TS.members.getMembersForUser();
var k;
for(var f=0;
f<i.length;
f++){k=i[f];
if(k.deleted){continue
}if(k.is_slackbot){continue
}if(k.is_self){continue
}if(k.is_ultra_restricted){continue
}if(!j||j.members.indexOf(k.id)==-1){g.push(k)
}}return g
}
})();
(function(){TS.registerModule("utility.box",{onStart:function(){},launchPopup:function(){if(!window.BoxSelect){return
}var e;
try{e=window.open;
window.open=function(h,g,l){var i,f,k,j;
i=String(l).match(/width\D+(\d+)/);
i=parseInt(i&&i[1]||590);
f=String(l).match(/height\D+(\d+)/);
f=parseInt(f&&f[1]||520);
k=(window.screenX||window.screenLeft)+((window.outerWidth||document.documentElement.offsetWidth)-i)/2;
j=(window.screenY||window.screenTop)+((window.outerHeight||document.documentElement.offsetHeight)-f)/2;
a=e(h,g,[l,"left="+k,"top="+j].join(","));
return a
};
d().launchPopup();
if(window.focus&&a){a.focus()
}}finally{window.open=e
}},closePopup:function(){window.BoxSelect&&d().closePopup()
},success:function(e){window.BoxSelect&&d().success(e)
},cancel:function(e){window.BoxSelect&&d().cancel(e)
},unregister:function(){window.BoxSelect&&d().unregister.apply(d(),arguments)
},isBrowserSupported:function(){return window.BoxSelect&&d().isBrowserSupported()
},test:function(){return{getBoxSelect:d,setBoxSelect:b}
}});
var c,a;
var d=function(){if(c){return c
}c=new window.BoxSelect({clientId:TS.boot_data.box_app_key,linkType:"shared",multiselect:"true"});
TS.utility.box.SUCCESS_EVENT_TYPE=c.SUCCESS_EVENT_TYPE;
TS.utility.box.CANCEL_EVENT_TYPE=c.CANCEL_EVENT_TYPE;
return c
};
var b=function(e){c=e
}
})();
(function(){TS.registerModule("files",{member_files_fetched_sig:new signals.Signal(),team_files_fetched_sig:new signals.Signal(),team_file_added_sig:new signals.Signal(),team_file_deleted_sig:new signals.Signal(),team_file_changed_sig:new signals.Signal(),team_file_comment_added_sig:new signals.Signal(),team_file_comment_edited_sig:new signals.Signal(),team_file_comment_deleted_sig:new signals.Signal(),file_uploaded_sig:new signals.Signal(),file_uploading_sig:new signals.Signal(),file_progress_sig:new signals.Signal(),file_canceled_sig:new signals.Signal(),file_queue_emptied_sig:new signals.Signal(),channel_files_fetched_sig:new signals.Signal(),user_changed_public_url_sig:new signals.Signal(),uploadQ:[],uploading:false,polling_count:0,polling_file_id:null,polling_ticket:null,polling_tim:null,polling_handler:null,waiting_for_refresh:{},onStart:function(){},isFilePrivate:function(d){return !d.is_public&&!d.is_external&&!d.is_shared
},isFileUntitled:function(d){return d.name=="-"
},createPublicURL:function(d,e){if(TS.model.team.prefs.disallow_public_file_urls){return
}TS.api.callImmediately("files.sharedPublicURL",{file:d.id},function(g,h,f){if(g){TS.files.upsertAndSignal({id:d.id,public_url_shared:true});
TS.files.user_changed_public_url_sig.dispatch(h.file)
}else{if(h.error&&h.error==="not_allowed"){TS.model.team.prefs.disallow_public_file_urls=true;
TS.generic_dialog.alert("An administator has disabled public file URL creation. You will not be able to create a public URL for this space.")
}}if(e&&typeof e=="function"){e(g,h,f)
}})
},createAndOpenNewSpace:function(d,e){TS.api.callSynchronously("files.createSpace",{},function(k,l,h){if(k){var j=TS.files.upsertAndSignal(l.file).file;
if(document.ssb_main&&document.ssb_main.TS){document.ssb_main.TS.files.upsertAndSignal(j)
}var f=(TS.model.active_cid?"?origin_channel="+TS.model.active_cid:"");
var g=j.permalink+f;
var i=function(){if(TS.client){return TS.client.windows.openFileWindow(j.id,f)
}else{if(document.ssb_main){if(document.ssb_main.TS){return document.ssb_main.TS.client.windows.openFileWindow(j.id,g)
}else{return true
}}}return false
};
if(e||!i()){TS.utility.openInNewTab(g,j.id)
}}else{TS.generic_dialog.alert('<p class="no_bottom_margin">Oops! Something went wrong. Please try again.</p>')
}if(typeof d=="function"){d(k,l,h)
}})
},promptForFileUnshare:function(f,d){var e=TS.channels.getChannelById(d);
var g=(e)?null:TS.groups.getGroupById(d);
if(!g&&!e){return
}TS.generic_dialog.start({title:"Un-share file",body:"<p>Are you sure you want to un-share this file from the <b>"+((e)?"#"+e.name+"</b> channel":g.name+"</b> group")+"?</p>					<p>Un-sharing the file will not remove existing share and comment messages, but it will keep any future comments from appearing 					in the "+((e)?"channel":"group")+".</p>",show_cancel_button:true,show_go_button:true,go_button_text:"Yes, unshare this file",cancel_button_text:"Cancel",on_go:function(){TS.files.unshareFile(f,d)
}})
},shareFile:function(g,d,f,e){TS.api.call("files.share",{file:g,channel:d,comment:f||""},function(i,j,h){TS.files.onFileShare(i,j,h);
if(e){e(i,j,h)
}})
},onFileShare:function(f,g,d){if(!f){return
}TS.files.fetchFileInfo(d.file,function(i,h){TS.templates.builders.updateFileShareLabels(h);
if(TS.web){TS.files.upsertAndSignal(h)
}});
if(TS.web){var e=TS.files.getFileById(d.file);
if(e.mode==="post"){TS.web.file.onPostShare(f,g,d)
}if(TS.web.space){TS.web.space.onFileShare(f,g,d)
}}},unshareFile:function(f,d,e){TS.api.call("files.unshare",{file:f,channel:d},function(h,i,g){TS.files.onFileUnShare(h,i,g);
if(e){e(f,TS.files.getFileById(f))
}})
},onFileUnShare:function(e,f,d){if(!e){return
}else{TS.files.fetchFileInfo(d.file,function(h,g){TS.templates.builders.updateFileShareLabels(g);
if(TS.web){TS.files.upsertAndSignal(g)
}})
}},fetchFileInfo:function(e,d){TS.api.call("files.info",{file:e},function(g,h,f){TS.files.onFileFetch(g,h,f);
if(d){d(e,TS.files.getFileById(e))
}})
},fetchFileInfoNEW:function(e,d){if(!e){TS.error("WTF no file id for fetchFileInfo()?");
return
}if(c[e]){if(d){c[e].callbacks.push(d)
}if(e=="F02CLF8UA"){TS.warn("NOT FETCHING "+e+" ****************************************************************************************")
}return
}c[e]={callbacks:[d]};
TS.api.call("files.info",{file:e},function(g,i,f){TS.files.onFileFetch(g,i,f);
var h=c[f.file].callbacks;
h.forEach(function(j,k){if(j){j(f.file,TS.files.getFileById(f.file))
}});
delete c[f.file]
})
},onFileFetch:function(e,g,d){if(!e){if(g.error=="file_deleted"){var f=TS.files.getFileById(d.file);
if(f){TS.files.removeFile(f.id);
TS.activity.maybeUpdateTeamActivity()
}else{if(d.file){TS.files.removeFile(d.file)
}}}else{if(g.error=="file_not_found"){TS.files.removeFile(d.file)
}}return
}if(g.file){g.file.comments=g.comments;
g.file.content=g.content;
g.file.content_html=g.content_html;
g.file.content_highlight_html=g.content_highlight_html;
TS.files.upsertAndSignal(g.file)
}},fetchTeamFiles:function(e){e=TS.model.file_list_types;
var d=(e&&e.length)?e.join(","):"";
TS.api.call("files.list",{types:d},TS.files.onTeamFetch)
},onTeamFetch:function(g,h,d){if(!g){return
}if(h.files){var f;
for(var e=0;
e<h.files.length;
e++){f=h.files[e];
TS.files.upsertFile(f)
}}TS.files.team_files_fetched_sig.dispatch(TS.model.files)
},fetchMemberFiles:function(f,e){var d=(e&&e.length)?e.join(","):"";
TS.api.call("files.list",{user:f,types:d},TS.files.onMemberFetch)
},onMemberFetch:function(g,h,d){if(!g){return
}if(h.files){var f;
for(var e=0;
e<h.files.length;
e++){f=h.files[e];
TS.files.upsertFile(f)
}}TS.files.team_files_fetched_sig.dispatch(TS.model.files);
var j=TS.members.getMemberById(d.user);
TS.files.member_files_fetched_sig.dispatch(j)
},fetchChannelFiles:function(f,e){var d=(e&&e.length)?e.join(","):"";
TS.api.call("files.list",{channel:f,types:d},TS.files.onChannelFetch)
},onChannelFetch:function(g,h,d){if(!g){return
}if(h.files){var f;
for(var e=0;
e<h.files.length;
e++){f=h.files[e];
TS.files.upsertFile(f)
}}TS.files.channel_files_fetched_sig.dispatch(d.channel,h.files)
},addComment:function(f,e,d){TS.api.callImmediately("files.comments.add",{file:f,comment:e},function(h,i,g){TS.files.onFileComment(h,i,g);
if(d){d(h,i,g)
}})
},onFileComment:function(f,g,d){if(!f){return
}var e=TS.files.getFileById(d.file);
if(!e){TS.error("no file? "+d.file);
return
}TS.files.addCommentToFile(g.comment,e)
},getFileById:function(g){if(!g){return null
}var f=TS.model.files;
var e;
for(var d=0;
d<f.length;
d++){e=f[d];
if(e.id==g){return e
}}return null
},getFileActions:function(f){if(!f){return
}var g={};
var h=false;
if(f.user==TS.model.user.id){h=true
}if(f.is_public){g.share=true
}else{if(h){g.share=true
}}g.comment=true;
if(!f.public_url_shared&&f.mode!="external"&&!TS.model.user.is_restricted&&!TS.model.team.prefs.disallow_public_file_urls){if(f.is_public){g.create_public_link=true
}else{if(h){g.create_public_link=true
}}}if(f.public_url_shared&&!TS.model.user.is_restricted&&(TS.model.user.is_admin||h)&&!TS.model.team.prefs.disallow_public_file_urls){g.revoke_public_link=true
}if(f.mode=="hosted"||f.mode=="snippet"){g.download=true
}if((f.mimetype&&f.mimetype.indexOf("image/")===0)||f.mode=="external"||f.mode=="snippet"||f.mode=="email"){g.open_original=true
}if(TS.web){if(f.mode=="post"||f.mode=="snippet"||f.mode=="space"||f.mode=="email"){g.print=true
}}if(h){if(f.mode=="snippet"||f.mode=="post"||f.mode=="space"){g.edit=true
}if(f.mode=="hosted"||f.mode=="email"){g.edit_title=true
}g.delete_file=true
}if(TS.model.user.is_admin){g.delete_file=true
}if(f.mode=="external"){if(h||TS.model.user.is_admin){g.refresh=true
}}if(window.Dropbox&&Dropbox.isBrowserSupported()&&TS.model.prefs.dropbox_enabled){if(f.mode=="hosted"){g.save_to_dropbox=true
}}if(TS.boot_data.feature_pins&&TS.client){var d=TS.shared.getActiveModelOb();
if(TS.pins.canUserPinHere(d)){if(f.pinned_to&&f.pinned_to.indexOf(d.id)!==-1){g.unpin_file=true
}else{var e=!!f.is_public;
e=e||f.channels.indexOf(d.id)!==-1;
e=e||f.groups.indexOf(d.id)!==-1;
if(e){g.pin_file=true
}}}}if(TS.boot_data.feature_reactions){g.rxn_file=true
}return g
},getFileCommentActions:function(h,f){if(!h){return{}
}var g={can_edit:true,can_delete:true};
if(h.user!=TS.model.user.id){g.can_edit=false
}else{if(TS.model.team.prefs.msg_edit_window_mins>-1&&(TS.utility.date.getTimeStamp()-TS.utility.date.toDateObject(h.timestamp))/60000>TS.model.team.prefs.msg_edit_window_mins){g.can_edit=false
}}if(!TS.model.team.prefs.allow_message_deletion){if(!TS.model.user.is_admin){g.can_delete=false
}}else{if(h.user!=TS.model.user.id){if(!TS.model.user.is_admin){g.can_delete=false
}}}if(TS.boot_data.feature_pins&&TS.client){var d=TS.shared.getActiveModelOb();
if(TS.pins.canUserPinHere(d)){if(h.pinned_to&&h.pinned_to.indexOf(d.id)!==-1){g.can_unpin=true
}else{var e=!!f.is_public;
e=e||f.channels.indexOf(d.id)!==-1;
e=e||f.groups.indexOf(d.id)!==-1;
if(e){g.can_pin=true
}}}}if(TS.boot_data.feature_reactions){g.rxn_file_comment=true
}return g
},sortFiles:function(d){function e(g,f){if(g.timestamp<f.timestamp){return 1
}if(g.timestamp>f.timestamp){return -1
}return 0
}d.sort(e)
},getFileCommentById:function(e,f){var g;
for(var d=0;
d<e.comments.length;
d++){g=e.comments[d];
if(g.id==f){return g
}}return null
},addCommentToFile:function(f,d){var e=TS.files.getFileCommentById(d,f.id);
if(e){return e
}if(TS.boot_data.feature_reactions){f._rxn_key=TS.rxns.getRxnKey("file_comment",f.id);
TS.rxns.upsertRxnsFromDataAndUpdateUI(f._rxn_key,f.reactions);
delete f.reactions
}d.comments.push(f);
TS.files.sortCommentsOnFile(d);
TS.files.team_file_comment_added_sig.dispatch(d,f);
return f
},editCommentOnFile:function(j,e){var h;
var g=false;
var f=false;
for(var d=0;
d<e.comments.length;
d++){h=e.comments[d];
if(h.id==j.id){g=true;
e.comments[d]=j;
if(h.is_starred){j.is_starred=true
}if(h._rxn_key){j._rxn_key=h._rxn_key
}if(h.pinned_to&&!j.pinned_to){j.pinned_to=h.pinned_to
}if(e.initial_comment&&h.id==e.initial_comment.id){e.initial_comment=j;
f=true
}break
}}if(!g){return false
}TS.files.makeSureReferencesGetSavedToLS(e.id);
TS.files.sortCommentsOnFile(e);
TS.files.team_file_comment_edited_sig.dispatch(e,j);
if(f){TS.files.team_file_changed_sig.dispatch(e)
}return true
},deleteCommentOnFile:function(g,f){var j;
var d=[];
var h=false;
var k;
for(var e=0;
e<f.comments.length;
e++){j=f.comments[e];
if(j.id==g){k=j;
if(f.initial_comment&&j.id==f.initial_comment.id){f.initial_comment=null;
h=true
}continue
}d.push(j)
}if(d.length==f.comments.length){return
}f.comments=d;
TS.files.makeSureReferencesGetSavedToLS(f.id);
TS.files.sortCommentsOnFile(f);
TS.files.team_file_comment_deleted_sig.dispatch(f,g,k);
if(h){TS.files.team_file_changed_sig.dispatch(f)
}},makeSureReferencesGetSavedToLS:function(h){var e=function(m,l){var n;
for(var k=0;
k<m.length;
k++){n=m[k];
if(n.file&&n.file.id==l){return true
}}return false
};
var f;
var g;
for(f=0;
f<TS.model.channels.length;
f++){g=TS.model.channels[f];
if(g&&g.msgs&&g.msgs.length){if(e(g.msgs,h)){TS.utility.msgs.maybeStoreMsgs(g.id,g.msgs)
}}}var j;
for(f=0;
f<TS.model.groups.length;
f++){j=TS.model.groups[f];
if(j&&j.msgs&&j.msgs.length){if(e(j.msgs,h)){TS.utility.msgs.maybeStoreMsgs(j.id,j.msgs)
}}}var d;
for(f=0;
f<TS.model.ims.length;
f++){d=TS.model.ims[f];
if(d&&d.msgs&&d.msgs.length){if(e(d.msgs,h)){TS.utility.msgs.maybeStoreMsgs(d.id,d.msgs)
}}}},sortCommentsOnFile:function(d){function e(g,f){if(g.timestamp>f.timestamp){return 1
}if(g.timestamp<f.timestamp){return -1
}return 0
}d.comments.sort(e)
},upsertFile:function(x){if(x.mode=="space"){try{if(x.preview&&/^\s*<document>/.test(x.preview)){var w=$(x.preview);
if(w.length){x.preview=w.html()
}}}catch(j){TS.log(93,"problem with file.preview id:"+x.id);
TS.log(93,"file.preview: "+x.preview)
}try{if(x.content_html){var h=$(x.content_html);
if(h.length){x.content_html=h.html()
}}}catch(j){TS.log(93,"problem with file.content_html id:"+x.id);
TS.log(93,"file.content_html: "+x.content_html)
}}var l=TS.model.files;
var p=TS.files.getFileById(x.id);
var s="NOOP";
var f=[];
var v;
var q;
var z;
var d;
var y;
var u;
if(p){if(TS.boot_data.feature_reactions){x._rxn_key=TS.rxns.getRxnKey("file",x.id);
y=TS.rxns.getExistingRxnsByKey(x._rxn_key);
if(y&&!x.reactions){TS.warn("file:"+x.id+" has reactions in local model, but we are upserting an object that does NOT have reactions, which seems suspicious")
}else{TS.rxns.upsertRxnsFromDataAndUpdateUI(x._rxn_key,x.reactions)
}delete x.reactions;
if(x.comments){for(u=0;
u<x.comments.length;
u++){d=x.comments[u];
d._rxn_key=TS.rxns.getRxnKey("file_comment",d.id);
y=TS.rxns.getExistingRxnsByKey(d._rxn_key);
if(y&&!d.reactions){TS.warn("comment:"+x.id+" has reactions in local model, but we are upserting an object that does NOT have reactions, which seems suspicious")
}else{TS.rxns.upsertRxnsFromDataAndUpdateUI(d._rxn_key,d.reactions)
}delete d.reactions
}}if(x.initial_comment){x.initial_comment._rxn_key=TS.rxns.getRxnKey("file_comment",x.initial_comment.id);
y=TS.rxns.getExistingRxnsByKey(x.initial_comment._rxn_key);
if(y&&!x.initial_comment.reactions){TS.warn("initial_comment:"+x.id+" has reactions in local model, but we are upserting an object that does NOT have reactions, which seems suspicious")
}else{TS.rxns.upsertRxnsFromDataAndUpdateUI(x.initial_comment._rxn_key,x.initial_comment.reactions)
}delete x.initial_comment.reactions
}}v=p.channels||[];
q=p.ims||[];
z=p.groups||[];
for(var t in x){if(t=="channels"||t=="ims"||t=="groups"||t=="pinned_to"||t=="to"||t=="from"||t=="cc"||t=="attachments"){var m=false;
var g=TS.utility.ensureArray(x[t]);
var r=TS.utility.ensureArray(p[t]);
if(t=="to"||t=="from"||t=="cc"||t=="attachments"){if(r.length!=g.length){m=true
}}else{if(r.join("")!=g.join("")){m=true;
if(g.length){if(t=="channels"){v=v.concat(x[t])
}else{if(t=="ims"){q=q.concat(x[t])
}else{if(t=="groups"){z=z.concat(x[t])
}}}}}}if(m){p[t]=x[t];
s="CHANGED";
f.push(t)
}}else{if(t=="comments"){if(x[t]&&!TS.utility.areSimpleObjectsEqual(x[t],p[t],"file:"+x.id+" "+x.name)){p[t]=x[t];
s="CHANGED";
f.push(t)
}}else{if(t=="content"){if(x[t]&&p[t]!=x[t]){p[t]=x[t];
s="CHANGED";
f.push(t)
}}else{if(t=="initial_comment"){p[t]=x[t]
}else{if(t=="reactions"){p[t]=x[t]
}else{if(p[t]!=x[t]){if(x[t]&&!TS.utility.isScalar(x[t])){p[t]=x[t];
TS.warn(t+" is not scalar! it needs to be handled by upsertFile specifically to test if it has changed! "+(typeof x[t]))
}else{if(typeof x[t]!="boolean"||!x[t]!=!p[t]){f.push(t+" ["+p[t]+"] -> ["+x[t]+"]");
p[t]=x[t];
s="CHANGED"
}}}}}}}}}}else{s="ADDED";
if(TS.boot_data.feature_reactions){x._rxn_key=TS.rxns.getRxnKey("file",x.id);
TS.rxns.upsertRxnsFromDataAndUpdateUI(x._rxn_key,x.reactions);
delete x.reactions;
if(x.comments){for(u=0;
u<x.comments.length;
u++){d=x.comments[u];
d._rxn_key=TS.rxns.getRxnKey("file_comment",d.id);
TS.rxns.upsertRxnsFromDataAndUpdateUI(d._rxn_key,d.reactions);
delete d.reactions
}if(x.initial_comment){x.initial_comment._rxn_key=TS.rxns.getRxnKey("file_comment",x.initial_comment.id);
TS.rxns.upsertRxnsFromDataAndUpdateUI(x.initial_comment._rxn_key,x.initial_comment.reactions);
delete x.initial_comment.reactions
}}}l.push(x);
var e=TS.members.getMemberById(x.user);
if(e){e.files.push(x);
TS.files.sortFiles(e.files);
e.has_files=true
}else{TS.error("hmmm, file "+x.id+" does not have a know user "+x.user)
}a(x);
p=x
}if(s=="CHANGED"){a(x)
}if(!p.comments){p.comments=[]
}else{p.comments_count=Math.max(p.comments_count,p.comments.length)
}if(!p.channels){p.channels=[]
}if(!p.ims){p.ims=[]
}if(!p.groups){p.groups=[]
}p.is_shared=(p.groups.length>0)||(p.channels.length>0);
if(s!="NOOP"){var o;
if(v){v=v.filter(function(C,B,k){return k.indexOf(C)===B
});
var A;
for(u=0;
u<v.length;
u++){A=TS.channels.getChannelById(v[u]);
if(A&&A.is_member&&A.msgs&&A.msgs.length){TS.utility.msgs.maybeStoreMsgs(A.id,A.msgs)
}}}if(q){q=q.filter(function(C,B,k){return k.indexOf(C)===B
});
for(u=0;
u<q.length;
u++){o=TS.ims.getImById(q[u]);
if(o&&o.msgs&&o.msgs.length){TS.utility.msgs.maybeStoreMsgs(o.id,o.msgs)
}}}if(z){z=z.filter(function(C,B,k){return k.indexOf(C)===B
});
var n;
for(u=0;
u<z.length;
u++){n=TS.groups.getGroupById(z[u]);
if(n&&n.msgs&&n.msgs.length){TS.utility.msgs.maybeStoreMsgs(n.id,n.msgs)
}}}if(!q||!q.length){o=TS.ims.getImByMemberId(TS.model.user.id);
if(o&&o.msgs&&o.msgs.length){TS.utility.msgs.maybeStoreMsgs(o.id,o.msgs)
}if(p.user!=TS.model.user.id){o=TS.ims.getImByMemberId(p.user);
if(o&&o.msgs&&o.msgs.length){TS.utility.msgs.maybeStoreMsgs(o.id,o.msgs)
}}}}TS.files.sortFiles(TS.model.files);
return{status:s,file:p,what_changed:f}
},upsertAndSignal:function(d){var e=TS.files.upsertFile(d);
if(e.status=="CHANGED"){TS.files.team_file_changed_sig.dispatch(e.file)
}else{if(e.status=="ADDED"){TS.files.team_file_added_sig.dispatch(e.file)
}}return e
},removeFile:function(h){TS.log(4,'removing file "'+h+'"');
var f;
var e=TS.files.getFileById(h);
if(e){e.is_deleted=true
}var g=TS.model.channels;
var j;
for(f=0;
f<g.length;
f++){j=g[f];
if(e){TS.utility.msgs.removeFileSharesAndMentions(j,e)
}if(e){TS.utility.msgs.removeFileComments(j,e)
}TS.utility.msgs.removeFileReferences(j,h)
}var d=TS.model.groups;
var l;
for(f=0;
f<d.length;
f++){l=d[f];
if(e){TS.utility.msgs.removeFileSharesAndMentions(l,e)
}if(e){TS.utility.msgs.removeFileComments(l,e)
}TS.utility.msgs.removeFileReferences(l,h)
}var m=TS.model.ims;
var k;
for(f=0;
f<m.length;
f++){k=m[f];
if(e){TS.utility.msgs.removeFileSharesAndMentions(k,e)
}if(e){TS.utility.msgs.removeFileComments(k,e)
}TS.utility.msgs.removeFileReferences(k,h)
}if(e){TS.files.team_file_deleted_sig.dispatch(e)
}},upload:function(d){if(TS.files.uploading){TS.files.uploadQ.push(d)
}else{TS.files.actuallyUpload(d)
}},actuallyUpload:function(h){TS.files.uploading=true;
h.retry_num=h.retry_num||0;
var j=new FormData();
var g;
var e=!!h.file;
if(h.text){g=h.title||h.filetype;
TS.files.file_uploading_sig.dispatch(g,h.retry_num>0,e);
j.append("content",h.text);
if(h.filetype){j.append("filetype",h.filetype)
}if(h.filename){TS.warn("ignoring filename because it makes no sense for text files")
}}else{g=h.title||h.filename||h.file.name||"blob";
TS.files.file_uploading_sig.dispatch(g,h.retry_num>0,e);
if(typeof h.file=="string"){j.append("content64",h.file)
}else{j.append("file",h.file)
}if(h.filename){j.append("filename",h.filename)
}if(h.filetype){TS.warn("ignoring filetype we send a filename which can intuit it")
}}j.append("token",TS.model.api_token);
if(h.channels&&h.channels.length){var d=(typeof h.channels=="string")?h.channels:(h.channels.join)?h.channels.join(","):"";
j.append("channels",d)
}j.append("title",h.title);
if(h.initial_comment){j.append("initial_comment",h.initial_comment)
}var k="files.uploadAsync";
if(h.link){if(h.is_dropbox){k="services.dropbox.upload"
}if(h.is_box){k="files.uploadExternal"
}j.append("link",h.link)
}TS.log(2,"calling "+TS.model.api_url+"files.upload");
var f;
if(k=="files.uploadAsync"){f=TS.model.async_api_url+k
}else{f=TS.model.api_url+k
}var i=false;
b=$.ajax({url:f,data:j,dataType:"json",cache:false,contentType:false,processData:false,type:"POST",xhr:function(){var l=jQuery.ajaxSettings.xhr();
if(l.upload){l.upload.addEventListener("progress",function(m){if(m.lengthComputable){var n=parseInt(100*m.loaded/m.total,10);
TS.files.file_progress_sig.dispatch(n)
}else{TS.info("Upload length not computable")
}},false)
}return l
},error:function(l,n,m){i=true;
TS.info("Error: Failed to upload file.");
TS.info("textStatus:"+n+" errorThrown:"+m);
if(n==="abort"){TS.files.file_canceled_sig.dispatch(g);
TS.files.uploadOver(false);
return
}if(h.retry_num===0){h.retry_num++;
TS.files.actuallyUpload(h)
}else{TS.generic_dialog.start({title:"Upload failed",body:'Failed to upload file: "'+n+(m?" "+m:"")+'". Try again?',go_button_text:"Yes, try again",cancel_button_text:"No, cancel",on_go:function(){h.retry_num++;
TS.files.actuallyUpload(h)
},on_cancel:function(){TS.files.uploadOver(false)
}})
}},complete:function(m){if(i){return
}m=jQuery.parseJSON(m.responseText);
if(m&&m.ok&&m.file){if(k=="files.uploadAsync"){var n=function(q,s,p){if(!TS.files.polling_file_id){return
}if(q){if(s.status=="complete"){var r=TS.files.upsertAndSignal(s.file);
TS.files.uploadProcessingOver(true,r.file.id)
}else{if(s.status=="failed"){var o="";
if(s.debug&&TS.model.team.domain=="tinyspeck"){o="<br><br>TS only Debugging:<br><br>"+s.debug
}TS.generic_dialog.start({title:"Upload failed",body:"Failed to process the uploaded file. Try again?"+o,go_button_text:"Yes, try again",cancel_button_text:"No, cancel",on_go:function(){p.retry_num++;
TS.files.actuallyUpload(p)
},on_cancel:function(){TS.files.uploadProcessingOver(false,TS.files.polling_file_id)
}})
}else{TS.files.pollForUploadProcessing()
}}}else{TS.generic_dialog.start({title:"Upload failed",body:"Failed to process the uploaded file.",show_cancel_button:true});
TS.files.uploadProcessingOver(false,TS.files.polling_file_id)
}};
TS.files.startPollingForUploadProcessing(m.file,m.ticket,n)
}else{var l=TS.files.upsertAndSignal(m.file);
TS.files.uploadOver(m.ok,l.file.id)
}}else{TS.info("Error: Failed to upload file.");
TS.info(m);
if(m){if(h.retry_num===0){h.retry_num++;
TS.files.actuallyUpload(h)
}else{if(m.error==="folders_not_supported"){TS.generic_dialog.start({title:"Folders not supported",body:"<p>Sorry, <b>"+TS.utility.htmlEntities(h.filename)+"</b> is a folder, and folder uploads are not supported by Slack.</p>									<p>Try uploading a .zip version of the file instead.</p>",show_cancel_button:false,esc_for_ok:true,on_go:function(){TS.generic_dialog.end();
TS.files.uploadOver(false)
}})
}else{TS.generic_dialog.start({title:"Upload failed",body:'Failed to upload file: "'+(m.error||"unknown error")+'". Try again?',go_button_text:"Yes, try again",cancel_button_text:"No, cancel",on_go:function(){h.retry_num++;
TS.files.actuallyUpload(h)
},on_cancel:function(){TS.files.uploadOver(false)
}})
}}}else{alert("Upload failed.");
TS.files.uploadOver(false)
}}}})
},startPollingForUploadProcessing:function(d,e,f){TS.files.polling_count=0;
TS.files.polling_file_id=d;
TS.files.polling_ticket=e;
TS.files.polling_handler=f;
TS.files.pollForUploadProcessing()
},pollForUploadProcessing:function(){TS.files.polling_count++;
TS.files.polling_tim=setTimeout(function(){if(!TS.files.polling_ticket){return
}TS.api.callImmediately("files.uploadStatus",{ticket:TS.files.polling_ticket},function(e,f,d){if(!TS.files.polling_ticket){return
}TS.files.polling_handler(e,f,d)
})
},TS.files.polling_count*1000)
},uploadProcessingOver:function(d,e){if(TS.files.polling_file_id!=e){return
}TS.info("TS.files.uploadProcessingOver polling_file_id:"+TS.files.polling_file_id+" polling_ticket:"+TS.files.polling_ticket+" polling_count:"+TS.files.polling_count);
TS.files.polling_count=0;
TS.files.polling_file_id=null;
TS.files.polling_ticket=null;
TS.files.polling_handler=null;
clearTimeout(TS.files.polling_tim);
TS.files.uploadOver(d,e)
},uploadOver:function(d,e){TS.files.file_uploaded_sig.dispatch(d,e);
TS.files.uploading=false;
b=null;
if(TS.files.uploadQ.length){TS.files.actuallyUpload.call(null,TS.files.uploadQ.shift())
}else{TS.files.file_queue_emptied_sig.dispatch()
}},cancelCurrentUpload:function(){if(b){b.abort()
}},deleteFile:function(d){TS.api.call("files.delete",{file:d},TS.files.onFileDelete)
},onFileDelete:function(e,f,d){if(!e){return
}},endEditFileTitle:function(){$("#file_edit_title_container").addClass("hidden");
$("#file_title_container").removeClass("hidden")
},saveEditFileTitle:function(f){var e=TS.files.getFileById(f);
if(!e){return
}var g=$("#file_edit_title_input").val();
if(!$.trim(g)){TS.sounds.play("beep");
return
}var d=e.title;
if(d==g){TS.files.endEditFileTitle();
return
}TS.api.callImmediately("files.edit",{file:f,title:g},function(i,j,h){if(!i){TS.files.upsertAndSignal({id:f,title:d});
alert("save failed!")
}});
g=TS.utility.htmlEntities(g);
TS.files.upsertAndSignal({id:f,title:g});
TS.files.endEditFileTitle()
},editFileTitle:function(e){var d=TS.files.getFileById(e);
if(!d){return
}var f=d.title;
if(f){f=TS.format.unFormatMsg(f)
}else{f=d.name
}$("#file_title_container").addClass("hidden");
$("#file_edit_title_container").removeClass("hidden");
$("#file_edit_title_input").val(f);
$("#file_edit_title_input").select()
},openBoxChooser:function(){TS.utility.box.unregister(TS.utility.box.SUCCESS_EVENT_TYPE,TS.files.onBoxChooser);
TS.utility.box.success(TS.files.onBoxChooser);
TS.utility.box.launchPopup()
},onBoxChooser:function(e){var g=new Array(e.length);
for(var f=0;
f<e.length;
f++){var d=e[f];
g[f]={name:d.name,link:d.url,is_box:true}
}TS.ui.upload_dialog.startWithCommentFromChatInput(g)
},openDropboxChooser:function(){Dropbox.choose({success:TS.files.onDropboxChooser,linkType:"direct",multiselect:true})
},onDropboxChooser:function(g){var f=[];
for(var e=0;
e<g.length;
e++){var h=g[e];
f.push({name:h.name,size:h.bytes,link:h.link,icon:h.icon,is_dropbox:true})
}TS.ui.upload_dialog.startWithCommentFromChatInput(f)
},makeFileNameFromFile:function(e){var d=TS.utility.date.getTimeStamp()/1000;
return e.name||"Pasted image at "+TS.utility.date.toFilenameFriendlyDate(d)+".png"
},makeFileTitleFromFile:function(e){var d=TS.utility.date.getTimeStamp()/1000;
return e.name||"Pasted image at "+TS.utility.date.toDate(d)
},justUploadTheseFileNow:function(f){var e;
for(var d=0;
d<f.length;
d++){e=f[d];
if(e.size>TS.model.upload_file_size_limit_bytes){continue
}TS.files.upload({file:e,filename:TS.files.makeFileNameFromFile(e),title:TS.files.makeFileTitleFromFile(e),channels:[TS.shared.getActiveModelOb().id],initial_comment:""})
}},refreshFile:function(d){TS.files.startRefreshingFile(d);
TS.api.call("files.refresh",{file:d},TS.files.onFileRefresh)
},onFileRefresh:function(e,g,d){var h=d.file;
if(e){TS.menu.$menu.find("#refresh_file").find(".item_label").text("File refreshed!").end().find("i").removeClass("ts_icon_spin")
}else{if(!e){TS.files.doneRefreshingFile(h,'<span class="moscow_red">Refresh failed.</span>',5000);
TS.menu.$menu.find("#refresh_file").find(".item_label").text("Refresh failed").end().find("i").removeClass("ts_icon_spin")
}}if(e&!g.will_refresh){TS.files.doneRefreshingFile(h,'<span class="moscow_red">File refreshed < 1 minute ago.</span>',5000)
}if(TS.web&&e){TS.menu.$menu.find("#refresh_file").find(".item_label").text("Reloading...");
location.reload()
}if(!e){if(g.error=="file_deleted"){var f=TS.files.getFileById(h);
if(f){TS.files.removeFile(f.id);
TS.activity.maybeUpdateTeamActivity()
}}return
}},fileWasMaybeRefreshed:function(d){if(!d){return
}if(!TS.files.waiting_for_refresh[d.id]){return
}TS.files.doneRefreshingFile(d.id,'<span class="kelly_green">File refreshed!</span>',60000)
},startRefreshingFile:function(d){TS.files.waiting_for_refresh[d]=true;
$('.file_refresh[data-file-id="'+d+'"]').addClass("hidden");
$('.file_refresh_status[data-file-id="'+d+'"]').removeClass("hidden")
},doneRefreshingFile:function(f,e,d){delete TS.files.waiting_for_refresh[f];
$('.file_refresh_status[data-file-id="'+f+'"]').html(e);
setTimeout(function(){$('.file_refresh[data-file-id="'+f+'"]').removeClass("hidden");
$('.file_refresh_status[data-file-id="'+f+'"]').text("Refreshing file...").addClass("hidden")
},d)
},useLargerThumbnail:function(d){return TS.boot_data.feature_fix_files&&TS.qs_args["480_thumbs"]=="1"&&d.thumb_480&&d.thumb_480_w
}});
var b=null;
var c={};
var a=function(e){if(TS.model.inline_img_exclude_filetypes.indexOf(e.filetype)!=-1){return
}var f={thumb_size:360,width:e.thumb_360_w,height:e.thumb_360_h,link_url:e.url_private,internal_file_id:e.id};
if(e.thumb_360_gif){TS.inline_imgs.makeInternalInlineImg(e.thumb_360_gif,f)
}else{if(e.thumb_720){TS.inline_imgs.makeInternalInlineImg(e.thumb_720,f)
}if(e.thumb_360){TS.inline_imgs.makeInternalInlineImg(e.thumb_360,f)
}}if(TS.files.useLargerThumbnail(e)){var d={thumb_size:480,width:e.thumb_480_w,height:e.thumb_480_h,link_url:e.url_private,internal_file_id:e.id};
if(e.thumb_480_gif){TS.inline_imgs.makeInternalInlineImg(e.thumb_480_gif,$.extend({},d))
}else{if(e.thumb_960){TS.inline_imgs.makeInternalInlineImg(e.thumb_960,$.extend({},d))
}if(e.thumb_480){TS.inline_imgs.makeInternalInlineImg(e.thumb_480,$.extend({},d))
}}}}
})();
(function(){TS.registerModule("activity",{team_activity_has_new_sig:new signals.Signal(),team_activity_being_fetched_sig:new signals.Signal(),team_activity_fetched_sig:new signals.Signal(),team_activity_reset_sig:new signals.Signal(),individual_activity_fetched_sig:new signals.Signal(),user_recent_fetched_sig:new signals.Signal(),team_has_more:false,team_fetching:false,onStart:function(){},fetchIndividualActivity:function(c,b){if(TS.model.user.is_restricted){return
}var a={start_ts:"",user:c.id};
if(!b&&c.individual_activity_next_ts){a.start_ts=c.individual_activity_next_ts
}c.individual_activity_fetching=true;
TS.api.call("activity.individual",a,TS.activity.onIndividualActivityFetch)
},onIndividualActivityFetch:function(b,c,a){var d=TS.members.getMemberById(a.user);
if(!d){TS.error("no member? user:"+a.user);
return
}d.individual_activity_fetching=false;
if(!b){TS.error("failed fetchIndividualActivity");
return
}if(a.start_ts){d.activity=d.activity.concat(TS.activity.slurpItems(c.items,d))
}else{d.activity=TS.activity.slurpItems(c.items,d)
}d.individual_activity_next_ts=c.next_ts;
TS.activity.individual_activity_fetched_sig.dispatch(d)
},fetchUserLatest:function(){},fetchUserRecent:function(b){var a={period:b+"h"};
TS.api.call("activity.recent",a,TS.activity.onFetchUserRecent)
},onFetchUserRecent:function(b,c,a){TS.activity.team_fetching=false;
if(!b){TS.error("failed fetchUserRecent");
return
}TS.info("onTeamActivityFetch");
TS.dir(0,c);
TS.model.user.activity_recent=TS.activity.slurpItems(c.items);
TS.activity.user_recent_fetched_sig.dispatch(TS.model.user.activity_recent)
},fetchTeamActivity:function(){var a={start:"",days:10};
if(TS.model.team.activity.length){a.start=TS.utility.date.getPrevActivityDayStamp(TS.model.team.activity[TS.model.team.activity.length-1].date)
}TS.activity.team_fetching=true;
TS.activity.team_activity_being_fetched_sig.dispatch(true);
TS.api.call("activity.team",a,TS.activity.onTeamActivityFetch)
},tested_day_rollover:false,onTeamActivityFetch:function(b,c,a){TS.activity.team_fetching=false;
if(!b){TS.activity.team_activity_being_fetched_sig.dispatch(false);
TS.error("failed fetchTeamActivity");
return
}if(!TS.activity.tested_day_rollover){TS.activity.tested_day_rollover=true
}TS.model.team.activity=TS.model.team.activity.concat(TS.activity.slurpDayItems(c.days));
TS.activity.team_has_more=c.has_more;
TS.activity.team_activity_fetched_sig.dispatch(TS.model.team.activity);
TS.activity.makeSureWehaveEnoughTeamActivity()
},makeSureWehaveEnoughTeamActivity:function(){if(!TS.activity.team_has_more){return
}var b=30;
var c=0;
var d=TS.model.team.activity;
for(var a=0;
a<d.length;
a++){if(d[a]&&d[a].items){c+=d[a].items.length
}}if(c<b){TS.activity.fetchTeamActivity()
}},makeSigFromActivityItem:function(b,d){d=d||0;
var c=[];
for(var a in b){if(a=="permalink"){continue
}if(!TS.utility.isScalar(b[a])&&d<3){if(a=="user"){c.push(a+"("+d+")===="+b[a].id)
}else{c.push(a+"("+d+")="+TS.activity.makeSigFromActivityItem(b[a],d+1))
}}else{c.push(a+"("+d+")="+b[a])
}}c.sort();
return c.join("***")
},current_activity_sig:"",current_activity_day_0_count:0,maybeUpdateTeamActivity:function(){if(TS.boot_data.app!="client"){return
}if(!TS.model.team){return
}if(TS.activity.team_activity_being_fetched){TS.activity.team_activity_needs_fetched=true;
return
}if(TS.model.team&&TS.model.team.activity&&TS.model.team.activity.length){var a=TS.model.team.activity[0];
TS.activity.current_activity_day_0_count=a.items.length;
if(a.items&&a.items.length){TS.activity.current_activity_sig=TS.activity.makeSigFromActivityItem(a.items)
}}TS.activity.updateTeamActivity()
},team_activity_being_fetched:false,team_activity_needs_fetched:false,updateTeamActivity:function(){TS.activity.team_activity_being_fetched=true;
TS.activity.team_activity_needs_fetched=false;
TS.activity.team_activity_being_fetched_sig.dispatch(true);
var a=true;
TS.api.call("activity.team",{days:1},TS.activity.onTeamActivityUpdate,a)
},onTeamActivityUpdate:function(d,e,c){TS.activity.team_activity_being_fetched=false;
if(TS.activity.team_activity_needs_fetched){setTimeout(TS.activity.maybeUpdateTeamActivity,100)
}if(!d){TS.activity.team_activity_being_fetched_sig.dispatch(false);
TS.error("failed updateTeamActivity");
return
}if(!e.days.length){return
}var b=TS.activity.slurpDayItems(e.days)[0];
if(TS.model.team.activity.length&&TS.model.team.activity[0].date==b.date){TS.info("days matched: "+b.date);
TS.model.team.activity[0]=b;
var a=(TS.model.team.activity&&TS.model.team.activity[0]&&TS.model.team.activity[0].items)?TS.model.team.activity[0].items.length:0;
var g=(TS.model.team.activity&&TS.model.team.activity[0]&&TS.model.team.activity[0].items)?TS.activity.makeSigFromActivityItem(TS.model.team.activity[0].items):"";
var f=true;
if(a>TS.activity.current_activity_count){f=false
}else{if(g!=TS.activity.current_activity_sig){f=false
}}if(f){TS.warn("no activity change")
}else{TS.model.team_activity_has_new=true;
TS.activity.team_activity_has_new_sig.dispatch(true)
}TS.activity.current_activity_sig=g;
TS.activity.current_activity_count=a;
TS.activity.team_activity_fetched_sig.dispatch(TS.model.team.activity,f)
}else{TS.info("days NOT matched: "+b.date);
TS.activity.team_activity_reset_sig.dispatch();
TS.model.team.activity.length=0;
TS.activity.fetchTeamActivity()
}},activityRead:function(){TS.model.team_activity_has_new=false;
TS.activity.team_activity_has_new_sig.dispatch(false)
},expandIndividual:function(a){var b=TS.members.getMemberById(a);
if(!b){TS.error("no member? member_id:"+a);
return
}if(b.individual_activity_fetching){return
}TS.activity.fetchIndividualActivity(b)
},expandTeam:function(){if(TS.activity.team_fetching){return
}TS.activity.fetchTeamActivity()
},slurpDayItems:function(b){for(var a=0;
a<b.length;
a++){b[a].items=TS.activity.slurpItems(b[a].items)
}return b
},slurpStarItem:function(a,c){var b;
if(a.type=="message"){a.message.is_starred=true;
if(TS.boot_data.feature_reactions){a.message._rxn_key=TS.rxns.getRxnKey("message",a.message.ts,a.channel)
}if(a.message.type=="channel_topic"||a.message.type=="channel_purpose"||a.message.type=="channel_join"||a.message.type=="channel_leave"){a.message.subtype=a.message.type
}a.message.type="message"
}else{if(a.type=="file"||a.type=="file_comment"){if(a.file){b=TS.files.upsertAndSignal(a.file);
a.file=b.file;
if(a.type=="file_comment"){if(a.comment){a.comment=TS.files.addCommentToFile(a.comment,a.file)
}else{TS.error("WTF no comment in type "+a.type+" in "+c);
return false
}}}else{TS.error("WTF no file in type "+a.type+" in "+c);
return false
}}else{if(a.type=="channel"){}else{if(a.type=="group"){}else{if(a.type=="im"){}else{TS.error("need to handle star item type:"+a.type+" in "+c);
return false
}}}}}return true
},sortStars:function(a){a.sort(function b(d,c){if(d.user==TS.model.user.id){return -1
}return 1
})
},updateActivityMsgStar:function(b,a,c){if(!TS.model.previewed_member_id){return
}var d=TS.members.getMemberById(TS.model.previewed_member_id);
d.activity.forEach(function(e){if(e.type!=="user_star"){return
}if(e.item.type!=="message"){return
}if(e.item.message.ts==b&&e.item.channel===a){e.item.message.is_starred=c
}})
},slurpItems:function(b,h){var g=[];
var e;
var a;
for(var c=0;
c<b.length;
c++){e=TS.utility.clone(b[c]);
if(e.type=="messages"){if(TS.client){continue
}e.channels_total=0;
e.channels_with_messages=0;
e.dms_total=0;
e.groups_total=0;
if(e.channels){var d;
for(a=0;
a<e.channels.length;
a++){d=TS.channels.getChannelById(e.channels[a].id);
if(d.is_member){e.channels[a].channel=d;
if(!e.channels[a].channel){TS.error('activity item of type "'+e.type+'" specifies a channel that we know nothing about:'+e.channels[a].id)
}e.channels_total+=parseInt(e.channels[a].count)||0;
e.channels_with_messages++
}}}if(e.groups){for(a=0;
a<e.groups.length;
a++){e.groups[a].group=TS.groups.getGroupById(e.groups[a].id);
e.groups_total+=parseInt(e.groups[a].count)||0
}}if(e.dms){for(a=0;
a<e.dms.length;
a++){e.dms[a].im=TS.ims.getImById(e.dms[a].id);
e.dms_total+=parseInt(e.dms[a].count)||0
}}var f=function(j,i){return(parseInt(j.count)<parseInt(i.count))?1:((parseInt(i.count)<parseInt(j.count))?-1:0)
};
e.channels.sort(f);
e.groups.sort(f);
e.dms.sort(f)
}else{if(e.type=="user_files"){if(e.files){for(a=0;
a<e.files.length;
a++){e.files[a]=TS.files.upsertFile(e.files[a]).file
}}else{TS.error("WTF no files in activity item "+e.type);
continue
}}else{if(e.type=="team_files"){}else{if(e.type=="file_comments"){if(e.file){e.file=TS.files.upsertFile(e.file).file
}else{TS.error("WTF no file in activity item "+e.type);
continue
}}else{if(e.type=="file_stars"){TS.activity.sortStars(e.stars);
if(e.file){e.file=TS.files.upsertFile(e.file).file
}else{TS.error("WTF no file in activity item "+e.type);
continue
}}else{if(e.type=="file_comment_stars"){TS.activity.sortStars(e.stars);
if(e.file){e.file=TS.files.upsertFile(e.file).file;
e.comment=TS.files.addCommentToFile(e.comment,e.file)
}else{TS.error("WTF no file in activity item "+e.type);
continue
}}else{if(e.type=="message_stars"){TS.activity.sortStars(e.stars);
for(a=0;
a<e.stars.length;
a++){if(TS.model.user.id==e.stars[a].user){e.message.is_starred=true;
break
}}}else{if(e.type=="starred_by_you"){if(!TS.activity.slurpStarItem(e.item,e.type)){continue
}e.user=TS.model.user
}else{if(e.type=="user_star"){if(!TS.activity.slurpStarItem(e.item,e.type)){continue
}if(h){e.user=h
}}else{if(e.type=="new_channels"){if(e.channels){for(a=0;
a<e.channels.length;
a++){e.channels[a]=TS.channels.getChannelById(e.channels[a])
}}}else{if(e.type=="new_members"){}else{if(e.type=="unread_group_messages"){e.group=TS.groups.getGroupById(e.id)
}else{if(e.type=="unread_messages"){e.channel=TS.channels.getChannelById(e.id)
}else{if(e.type=="unread_dms"){e.im=TS.ims.getImById(e.id)
}else{if(e.type=="sent_group_messages"){e.group=TS.groups.getGroupById(e.id)
}else{if(e.type=="sent_messages"){e.channel=TS.channels.getChannelById(e.id)
}else{if(e.type=="sent_dms"){e.im=TS.ims.getImById(e.id)
}else{if(e.type=="user_file"){e.file=TS.files.upsertFile(e.file).file;
if(h){e.user=h
}}else{if(e.type=="user_file_comment"){e.file=TS.files.upsertFile(e.file).file;
e.comment=TS.files.addCommentToFile(e.comment,e.file);
if(h){e.user=h
}}else{if(e.type=="user_rename"){h=TS.members.getMemberById(e.user);
if(h){e.user=h
}}else{TS.error("unknown activity item type:"+e.type);
continue
}}}}}}}}}}}}}}}}}}}}g.push(e)
}return g
}})
})();
(function(){TS.registerModule("activity.view",{list_state:"activity",onStart:function(){TS.activity.team_activity_fetched_sig.add(TS.activity.view.teamActivityFetched,TS.activity.view);
TS.activity.team_activity_fetched_sig.add(TS.activity.view.bindTeamActivityLoadButton,TS.activity.view);
TS.activity.team_activity_reset_sig.add(TS.activity.view.teamActivityReset,TS.activity.view);
TS.activity.user_recent_fetched_sig.add(TS.activity.view.teamUserRecentFetched,TS.activity.view);
TS.activity.team_activity_has_new_sig.add(TS.activity.view.teamActivityHasNew,TS.activity.view);
$("#activity_recent_hours_select").change(function(){TS.activity.fetchUserRecent(this.value)
});
$("#activity_recent_toggle, #activity_recent_close").bind("click",function(){$("#activity_recent").animate({height:"toggle",opacity:"toggle"},150)
});
TS.activity.view.bindTeamActivityLoadButton()
},expanded_activity_messages_lists:{},isActivityMessagesListExpanded:function(a){return !!TS.activity.view.expanded_activity_messages_lists[TS.templates.makeActivityMessagesDomId(a)]
},expandActivityMessagesList:function(c){TS.activity.view.expanded_activity_messages_lists[c]=true;
var b=$("#"+c);
var a=b.find(".show_link");
var e=b.find(".hide_link");
var f=b.find(".activity_messages_list");
a.addClass("hidden");
e.removeClass("hidden");
f.removeClass("hidden");
f.css("opacity",0);
var d=f.height();
if(d>$(window).height()-100){b.scrollintoview({duration:400,px_offset:50,complete:function(){}})
}else{b.scrollintoview({duration:400,offset:"bottom",px_offset:-50,complete:function(){}})
}f.height(0);
f.animate({height:d},150,function(){f.stop().animate({opacity:1},100);
f.css("height","")
})
},collapseActivityMessagesList:function(c){delete TS.activity.view.expanded_activity_messages_lists[c];
var b=$("#"+c);
var a=b.find(".show_link");
var d=b.find(".hide_link");
var e=b.find(".activity_messages_list");
a.removeClass("hidden");
d.addClass("hidden");
e.animate({opacity:0},200).animate({height:0},200,function(){e.addClass("hidden");
e.css("height","")
})
},markMsgsRead:function(e,d){var b=TS.shared.getModelObById(e);
if(!b){TS.error("wtf no model_ob? c_id:"+e);
return
}var h;
var c=$("#"+d);
var g=c.find(".mark_read_link");
if(b.is_channel){h="channels.mark"
}else{if(b.is_group){h="groups.mark"
}else{h="im.mark"
}}var f=c.data("last_read_ts");
var a=c.data("showing_all_msgs");
if(!f){if(a){alert("Error! no last_read_ts");
return
}f=TS.utility.date.makeTsStamp(TS.session_ms,"0","0")
}if(!a){if(!confirm("You have not read all messages yet... are you sure you want to mark all read?")){return
}}g.addClass("hidden");
TS.api.call(h,{channel:b.id,ts:f,dom_id:d},TS.activity.view.onMarkMsgsRead)
},onMarkMsgsRead:function(d,e,c){var b=$("#"+c.dom_id);
var f=b.find(".mark_read_link");
var a=b.find(".open_channel_link");
if(!d){f.removeClass("hidden");
a.removeClass("hidden");
alert("error!");
return
}b.animate({opacity:0},150).animate({height:0},150,function(){if(b.parent().find(".activity_item").length==1){b.parent().remove()
}b.remove()
})
},unexpandMsgs:function(c){var e=$("#"+c);
var i=e.find(".show_link");
var d=e.find(".hide_link");
var b=e.find(".mark_read_link");
var g=e.find(".open_channel_link");
var h=e.find(".expanded_msgs_div_wrapper");
var f=e.find(".expanded_msgs_div");
var a=e.find(".expanded_msgs_footer_div");
i.removeClass("hidden");
d.addClass("hidden");
b.addClass("hidden");
g.addClass("hidden");
a.addClass("hidden");
f.css("max-height","");
f.animate({opacity:0},200).animate({height:0},200,function(){f.addClass("hidden");
f.css("height","");
f.css("opacity","100");
h.addClass("hidden")
})
},expandMsgs:function(d,e,c){var b={channel:d,oldest:e,count:1000,dom_id:c};
var a=$("#"+c);
a.find(".expanded_msgs_div").html('<span class="loading">loading...<span>');
a.find(".expanded_msgs_div_wrapper").removeClass("hidden");
a.find(".show_link").addClass("hidden");
a.find(".hide_link").removeClass("hidden");
a.find(".expanded_msgs_div").removeClass("hidden");
var f;
if(d.charAt(0)==="C"){f="channels.history"
}else{if(d.charAt(0)==="G"){f="groups.history"
}else{f="im.history"
}}TS.api.call(f,b,TS.activity.view.onExpandMsgs)
},onExpandMsgs:function(n,y,e){var v=e.channel;
var r=TS.shared.getModelObById(v);
var b=$("#"+e.dom_id);
var x=b.find(".expanded_msgs_div");
var f=b.find(".expanded_msgs_footer_div");
var u=b.find(".show_link");
var g=b.find(".mark_read_link");
var q=b.find(".open_channel_link");
var a=b.find(".more_messages_notice");
if(!r){TS.error("wtf no channel/im/group c_id:"+v);
x.html("Error fetching unread messages! (no model_ob)");
u.removeClass("hidden");
return
}if(!n||!y||!y.messages){TS.error("failed to get history");
x.html("Error fetching unread messages!");
u.removeClass("hidden");
return
}var l=999999999;
var z=10;
var k=!y.has_more;
var m="";
var j;
var d;
var t=0;
for(var s=y.messages.length-1;
s>-1;
s--){t++;
d=j;
j=TS.utility.msgs.processImsg(y.messages[s],v);
m+=TS.templates.builders.buildMsgHTML({msg:j,model_ob:r,prev_msg:d,container_id:e.dom_id});
if(t==y.messages.length&&!y.has_more){b.data("last_read_ts",j.ts)
}if(t==l){if(y.messages.length>l+z){k=false;
break
}}}b.data("showing_all_msgs",k);
x.css("opacity",0);
var o=x.height();
x.html(m||"error retrieving messages.");
var w=x.height();
var h=$(window).height()*0.85;
if(w>h){w=h-50;
x.css("max-height",w);
if(TS.qs_args.new_scroll!="0"&&!("ontouchstart" in document.documentElement)){var p=TS.qs_args.debug_scroll=="1";
x.monkeyScroll({debug:p})
}}if(w>$(window).height()-100){b.scrollintoview({duration:250,px_offset:50,complete:function(){}})
}else{b.scrollintoview({duration:250,offset:"bottom",px_offset:10,complete:function(){}})
}x.height(o);
x.animate({height:w},150,function(){x.stop().animate({opacity:1},100);
x.css("height","");
if(!k){f.removeClass("hidden");
a.removeClass("hidden")
}x.css("overflow","");
if(y.messages.length){g.removeClass("hidden")
}q.removeClass("hidden")
});
if(TS.boot_data.app!="client"){x.bind("click.view",TS.web.onMsgsDivClick)
}},teamActivityReset:function(){var a=(TS.boot_data.app!="client")?$("#activity_team_days_items"):$("#activity_feed_items");
a.html("");
$("#activity_feed_scroller").data("monkeyScroll").updateFunc()
},bindTeamActivityLoadButton:function(){var a=$("#activity_team_load_more");
if(a.length>0){if(a.data("ladda")===undefined){a.data("ladda",Ladda.create(document.querySelector("#activity_team_load_more")));
a.bind("click.fetchMoreActivity",function(b){TS.activity.expandTeam();
$(this).data("ladda").start()
})
}else{$("#activity_team_load_more").data("ladda").stop()
}}},teamActivityFetched:function(h,f){if(f){return
}var g=(TS.boot_data.app!="client")?$("#activity_team_days_items"):$("#activity_feed_items");
var e=g.find(".activity_day");
var d;
var a;
if(e.length){if(h){for(var c=0;
c<h.length;
c++){a=h[c].date;
d=g.find("#"+TS.templates.makeActivityDayDomId(a));
if(d.length){if(d.index()===0){d.replaceWith(TS.templates.activity_day({content:TS.templates.builders.activityListHTML(h[c].items,"team",a),date_str:a}))
}else{d.find(".activity_day_date .day_divider_label").html(TS.utility.date.toCalendarDateOrNamedDay(a))
}}else{var b=TS.templates.activity_day({content:TS.templates.builders.activityListHTML(h[c].items,"team",a),date_str:a});
if(c===0){g.find(".activity_days_list").prepend(b)
}else{g.find(".activity_days_list").append(b)
}}}}}else{g.empty()[0].innerHTML=TS.templates.builders.activityDaysListHTML(h);
TS.view.resizeManually("teamActivityFetched")
}if(TS.client){TS.utility.makeSureAllLinksHaveTargets(g)
}if(TS.activity.team_has_more){$("#day_list_expander").removeClass("hidden")
}else{$("#day_list_expander").addClass("hidden")
}if(TS.activity.team_has_more){$("#activity_feed_block").addClass("hidden")
}else{$("#activity_feed_block").removeClass("hidden")
}if(!TS.web){TS.client.ui.updateClosestMonkeyScroller(g)
}},new_activity_tim:0,teamActivityHasNew:function(a){clearTimeout(TS.activity.view.new_activity_tim);
if(a){if(TS.model.ui.active_tab_id=="activity"&&!$("#activity_tab_activity").hasClass("hidden")){TS.activity.view.new_activity_tim=setTimeout(function(){if(TS.model.ui.active_tab_id=="activity"&&!$("#activity_tab_activity").hasClass("hidden")){TS.activity.activityRead()
}},3000)
}}},teamUserRecentFetched:function(b){if(TS.boot_data.app!="client"){if(b.length){$("#activity_recent_items").html(TS.templates.builders.activityListHTML(b,"recent"));
var a=$("#activity_recent_items").closest(".flex_content_scroller").data("monkeyScroll");
if(a){a.updateFunc()
}}else{$("#activity_recent_items").html("<p class='mini'>No activity to show for this period.</p>")
}}},renderActivity:function(){if(TS.boot_data.app=="client"){return
}if(TS.model.user.activity_latest.length){$("#activity_latest_items").removeClass("hidden").html(TS.templates.builders.activityListHTML(TS.model.user.activity_latest,"latest"))
}else{$("#activity_latest_items").remove();
$("#activity_team_days_items").addClass("top")
}TS.activity.view.teamUserRecentFetched(TS.model.user.activity_recent);
if(TS.model.team.activity.length){$("#activity_team_days_items").html(TS.templates.builders.activityDaysListHTML(TS.model.team.activity))
}else{$("#activity_team_days_items").html("<p class='mini'>No team activity to show.</p>")
}$("#activity_div").bind("click",function(a){TS.stars.checkForStarClick(a);
if(TS.boot_data.feature_reactions){TS.rxns.checkForRxnClick(a)
}})
}})
})();
(function(){TS.registerModule("ims",{switched_sig:new signals.Signal(),pre_switched_sig:new signals.Signal(),history_fetched_sig:new signals.Signal(),history_being_fetched_sig:new signals.Signal(),message_received_sig:new signals.Signal(),message_removed_sig:new signals.Signal(),message_changed_sig:new signals.Signal(),marked_sig:new signals.Signal(),closed_sig:new signals.Signal(),unread_changed_sig:new signals.Signal(),unread_highlight_changed_sig:new signals.Signal(),opened_sig:new signals.Signal(),msg_not_sent_sig:new signals.Signal(),data_retention_changed_sig:new signals.Signal(),onStart:function(){},addMsg:function(h,g){var d=TS.ims.getImById(h);
if(!d){TS.error('unknown im "'+h+'"');
return
}var e=d.msgs;
if(!TS.utility.msgs.validateMsg(h,g,e)){return
}TS.utility.msgs.appendMsg(e,g);
TS.utility.msgs.maybeStoreMsgs(d.id,e);
TS.utility.msgs.maybeSetOldestMsgsTsAfterMsgAdded(d);
var f=!TS.utility.msgs.isTempMsg(g);
TS.ims.calcUnreadCnts(d,f);
TS.utility.msgs.maybeTruncateMsgs(d);
TS.ims.message_received_sig.dispatch(d,g);
if(!d.is_open){TS.api.call("im.open",{user:d.user},TS.ims.onOpened)
}},calcUnreadCnts:function(d,e){TS.shared.calcUnreadCnts(d,TS.ims,e)
},removeMsg:function(g,f){var d=TS.ims.getImById(g);
if(!d){TS.error('unknown im "'+g+'"');
return
}if(d._archive_msgs){TS.utility.msgs.spliceMsg(d._archive_msgs,f)
}var e=d.msgs;
TS.utility.msgs.spliceMsg(e,f);
TS.ims.message_removed_sig.dispatch(d,f);
TS.utility.msgs.maybeStoreMsgs(d.id,e);
TS.ims.calcUnreadCnts(d,true)
},changeMsgText:function(g,f,d){var e=TS.ims.getImById(g);
if(!e){TS.error('unknown im "'+g+'"');
return
}f.text=d;
TS.ims.message_changed_sig.dispatch(e,f);
TS.utility.msgs.maybeStoreMsgs(e.id,e.msgs)
},sendMsg:function(e,d){return TS.shared.sendMsg(e,d,TS.ims)
},onSendMsg:function(f,e){var d=TS.ims.getImById(e.SENT_MSG.channel);
if(!d){TS.error("unknown im? "+e.SENT_MSG.channel);
return
}TS.shared.onSendMsg(f,e,d,TS.ims)
},closeImByMemberId:function(e){var d=TS.ims.getImByMemberId(e);
if(!d){return
}TS.ims.closeIm(d.id)
},closeIm:function(e){var d=TS.ims.getImById(e);
if(!d){return
}if(false&&d.is_slackbot_im){TS.error("can't leave self channel");
return
}TS.api.call("im.close",{channel:e},TS.ims.onClosed)
},onClosed:function(f,g,e){if(!f){return
}if(g.no_op){var d=TS.ims.getImById(e.channel);
if(d){TS.ims.closed_sig.dispatch(d)
}}},startImById:function(g,f,d){var e=TS.ims.getImById(g);
if(!e){TS.error(g+" not an im");
return
}TS.ims.startImByMemberId(e.user,f,d)
},startImByMemberName:function(e,f,d){var g=TS.members.getMemberByName(e);
if(!g){TS.error("no member?? "+e);
return
}TS.ims.startImByMemberId(g.id,f,d)
},startImByMemberId:function(f,g,d,h){var e=TS.ims.getImByMemberId(f);
if(e){TS.ims.displayIm(e.id,g);
if(e.is_open){if(d){TS.ims.sendMsg(e.id,$.trim(d))
}return
}}TS.model.requested_im_opens[f]={and_send_txt:d};
TS.api.call("im.open",{user:f},TS.ims.onOpened)
},onOpened:function(d,e){if(!d){return
}},displayIm:function(h,g,e){var f=TS.ims.getImById(h);
if(!f){TS.error('im "'+h+'" unknown');
return
}if(h==TS.model.active_im_id){if(e){TS.ims.sendMsg(f.id,$.trim(e))
}return
}var d=g;
if(TS.client.channelDisplaySwitched(null,h,null,false,d)){TS.ims.pre_switched_sig.dispatch();
TS.ims.switched_sig.dispatch()
}if(e){TS.ims.sendMsg(f.id,$.trim(e))
}},setLastRead:function(d,e){if(d.last_read==e){return false
}if(e.indexOf(TS.utility.date.fake_ts_unique_padder)>-1){TS.error("bad ts:"+e);
return false
}if(d.last_read>e){var f=TS.model.last_reads_set_by_client[d.id+"_"+e];
delete TS.model.last_reads_set_by_client[d.id+"_"+e];
if(f){TS.warn("NOT going back in time im.last_read:"+d.last_read+" new:"+e);
return
}TS.info("going back in time im.last_read:"+d.last_read+" new:"+e)
}d.last_read=e;
TS.ims.marked_sig.dispatch(d);
TS.ims.calcUnreadCnts(d);
return true
},markMostRecentReadMsg:function(d,e){if(!d){TS.error("im unknown");
return
}if(!d.msgs||!d.msgs.length){return
}var f=TS.utility.msgs.getMostRecentValidTs(d.msgs);
if(!f){TS.warn("no valid tses???");
return
}d.all_read_this_session_once=true;
TS.ims.markReadMsg(d.id,f,e)
},markReadMsg:function(g,e,f){var d=TS.ims.getImById(g);
if(!d){TS.error('im "'+g+'" unknown');
return
}if(d.last_read==e){return
}if(TS.ims.setLastRead(d,e)){d._marked_reason=f;
d.needs_api_marking=true
}},onMarked:function(f,g,e){var d=TS.ims.getImById(e.channel);
if(!d){TS.error('wtf no im "'+e.channel+'"');
return
}if(!f){d.needs_api_marking=true
}},getImById:function(g){var e=TS.model.ims;
var d=b[g];
if(d){return d
}if(!e){return null
}for(var f=0;
f<e.length;
f++){d=e[f];
if(d.id==g){TS.warn(g+" not in _id_map");
b[g]=d;
return d
}}return null
},getDisplayNameOfUserForIm:function(d){return TS.members.getMemberDisplayName(TS.members.getMemberByName(d.name))
},getDisplayNameOfUserForImLowerCase:function(d){return TS.members.getMemberDisplayNameLowerCase(TS.members.getMemberByName(d.name))
},getImByUsername:function(f){f=TS.utility.getLowerCaseValue(f);
var e=TS.model.ims;
var d=a[f];
if(d){return d
}if(!e){return null
}for(var g=0;
g<e.length;
g++){d=e[g];
if(d._name_lc==f||"@"+d._name_lc==f){TS.warn(f+" not in _name_map?");
a[f]=d;
return d
}}return null
},getImByMemberId:function(g){var e=TS.model.ims;
var d=c[g];
if(d){return d
}if(!e){return null
}for(var f=0;
f<e.length;
f++){d=e[f];
if(d.user==g){TS.warn(g+" not in _member_id_map?");
c[g]=d;
return d
}}return null
},getFirstOpenIm:function(){var e=TS.model.ims;
var d;
if(!e){return null
}for(var f=0;
f<e.length;
f++){d=e[f];
if(d.is_open){return d
}}return null
},usernameChanged:function(e){var d=TS.ims.getImByMemberId(e.id);
if(!d){return
}delete a[d._name_lc];
delete a["@"+d._name_lc];
d.name=e.name;
d._name_lc=TS.utility.getLowerCaseValue(d.name);
a[d._name_lc]=d;
a["@"+d._name_lc]=d
},upsertIm:function(f){var e=TS.model.ims;
var i=TS.ims.getImById(f.id);
if(i){TS.log(4,'updating existing im "'+f.id+'"');
for(var g in f){i[g]=f[g]
}f=i;
if(TS.client&&(f.is_open||f.unread_cnt)){TS.shared.checkInitialMsgHistory(f,TS.ims)
}}else{TS.log(4,'adding im "'+f.id+'"');
e.push(f);
if(f.is_im!==true){TS.warn(f.user+" lacked the is_im flag from the server");
f.is_im=true
}f.name=f.user;
var j=TS.members.getMemberById(f.user);
if(j){f.name=j.name;
if(j.is_slackbot){f.is_slackbot_im=true
}}f._name_lc=TS.utility.getLowerCaseValue(f.name);
b[f.id]=f;
c[f.user]=f;
a[f._name_lc]=f;
a["@"+f._name_lc]=f;
f.opened_this_session=false;
f.oldest_msg_ts=TS.storage.fetchOldestTs(f.id);
f.last_msg_input=TS.storage.fetchLastMsgInput(f.id);
f.scroll_top=-1;
f.history_is_being_fetched=false;
f.needs_api_marking=false;
f.unread_highlight_cnt=0;
f.unread_highlights=[];
f.unread_cnt=0;
f.unreads=[];
f.oldest_unread_ts=null;
f.has_fetched_history_after_scrollback=false;
if(TS.client){var d=TS.utility.msgs.fetchInitialMsgsFromLS(f);
TS.utility.msgs.setMsgs(f,d)
}else{if(TS.boot_data.msgs){TS.utility.msgs.ingestMessagesFromBootData(f)
}}}if(TS.client){var h=TS.utility.msgs.shouldMarkUnreadsOnMessageFetch();
TS.ims.calcUnreadCnts(f,h)
}return f
},markScrollTop:function(f,e){var d=TS.ims.getImById(f);
if(!d){return false
}if(d.scroll_top==e){return false
}d.scroll_top=e;
return true
},maybeLoadScrollBackHistory:function(f,e){var d=TS.ims.getImById(f);
if(!d){return false
}return TS.shared.maybeLoadScrollBackHistory(d,TS.ims,e)
},maybeLoadHistory:function(e){var d=TS.ims.getImById(e);
if(!d){return false
}return TS.shared.maybeLoadHistory(d,TS.ims)
},onHistory:function(f,g,e){var d=TS.ims.getImById(e.channel);
if(!d){TS.error('wtf no im "'+e.channel+'"');
return
}if(!f||!g||!g.messages){TS.error("failed to get history");
(d.history_fetch_retries)?d.history_fetch_retries++:d.history_fetch_retries=1;
TS.ims.history_fetched_sig.dispatch(d);
return
}delete d.history_fetch_retries;
var i=TS.shared.onHistory(d,g,e,TS.ims);
if(!i){d.history_is_being_fetched=false;
TS.ims.history_fetched_sig.dispatch(d)
}var h=TS.utility.msgs.shouldMarkUnreadsOnMessageFetch();
TS.ims.calcUnreadCnts(d,h);
if(TS.view){if(!i&&d.unread_cnt){TS.client.channel_pane.rebuildImList()
}}},fetchHistory:function(d,e,f){if(!d){TS.error('wtf no im "'+d+'"');
return
}d.history_is_being_fetched=true;
d.history_fetch_failed=false;
TS.ims.history_being_fetched_sig.dispatch(d);
if(d.history_fetch_retries>5){delete d.history_fetch_retries;
d.history_is_being_fetched=false;
d.history_fetch_failed=true;
if(TS.client){TS.client.msg_pane.updateEndMarker()
}return
}TS.api.call("im.history",e,f||TS.ims.onHistory)
},checkForOldImsToClose:function(){var p=TS.model.ims;
var o;
var j;
var l;
var m;
var g;
var e=0;
var f=11;
var h=1000*60*60*168;
for(g=0;
g<p.length;
g++){o=p[g];
if(!o.is_open&&!o.unread_cnt){continue
}e++
}var k=e-f;
if(k<1){return
}TS.info("checkForOldImsToClose might close some. this_too_many:"+k);
var n=[];
for(g=0;
g<p.length;
g++){o=p[g];
if(o.is_slackbot_im){continue
}if(!o.is_open){continue
}if(o.unread_cnt){continue
}if(o.is_starred){continue
}if(o.opened_this_session){continue
}j=TS.shared.getLatestMsgTs(o)||"";
if(o.msgs&&o.msgs.length&&o.msgs[0]&&o.msgs[0].ts>j){j=o.msgs[0].ts
}if(j){l=TS.utility.date.toDateObject(j)
}else{l=new Date(o.created*1000)
}m=new Date()-l;
if(m>h){TS.info(o.name+" "+l+" ms_since_activity:"+m+" allow_elapsed_ms:"+h);
n.push({im:o,ms_since_activity:m})
}}if(!n.length){TS.info("checkForOldImsToClose found no candidates for closing")
}n.sort(function d(q,i){var r=q.ms_since_activity;
var s=i.ms_since_activity;
if(r<s){return 1
}if(r>s){return -1
}return 0
});
n.length=(n.length>k)?k:n.length;
for(g=0;
g<n.length;
g++){o=n[g].im;
TS.warn("checkForOldImsToClose CLOSING:"+o.name+" ms_since_activity:"+n[g].ms_since_activity);
TS.ims.closeIm(o.id)
}},setDataRetention:function(h,d,g,f){var e={channel:h,retention_type:$("select[name=retention_type]").val()};
if(e.retention_type==1){e.retention_duration=$("#retention_duration").val()
}TS.api.call("im.setRetention",e,function(j,k,i){if(f){f(j,k,i)
}if(j){TS.ims.data_retention_changed_sig.dispatch(i)
}})
},getDataRetention:function(e,d){TS.api.call("im.getRetention",{channel:e},d)
}});
var b={};
var a={};
var c={}
})();
(function(){TS.registerModule("shared",{msg_sent_sig:new signals.Signal(),onStart:function(){},calcUnreadCnts:function(a,g,r){a.unreads.length=0;
a.unread_highlights.length=0;
a.oldest_unread_ts=null;
var m=a.msgs;
var n=a.unread_cnt;
var h=a.unread_highlight_cnt;
var b;
var o=false;
var q=false;
var k=true;
var l=TS.model.user.presence=="away";
if(!a.was_archived_this_session){if(a.is_archived){k=false
}if(a.is_channel&&!a.is_member){k=false
}}if(a.is_im){var e=TS.members.getMemberById(a.user);
if(e&&e.deleted){k=false
}}var p=TS.notifs.isCorGMuted(a.id);
var j=(a.is_im)||TS.notifs.canCorGHaveChannelMentions(a.id);
if(k&&m){for(var d=0;
d<m.length;
d++){b=m[d];
if(b.ts<=a.last_read){continue
}if(TS.utility.msgs.isTempMsg(b)&&!b._alert_even_though_temp){continue
}q=TS.utility.msgs.msgCanCountAsUnread(b);
o=o||q;
if(!q){continue
}a.unreads.push(b.ts);
if(!a.oldest_unread_ts||b.ts<a.oldest_unread_ts){a.oldest_unread_ts=b.ts
}if(j){var c=parseFloat(b.ts)*1000;
var f=l||p||(c<TS.model.user._presence_last_changed);
if(TS.utility.msgs.msgContainsMention(b,f)){a.unread_highlights.push(b.ts)
}}else{if(TS.utility.msgs.getMsgMentionData(b).non_channel_mentions){a.unread_highlights.push(b.ts)
}}}}if(!o&&a.unreads.length){a.unreads.length=0;
a.unread_highlights.length=0;
a.oldest_unread_ts=null;
if(r){g.markMostRecentReadMsg(a,TS.model.marked_reasons.none_qualify)
}}a.unread_cnt=a.unreads.length;
if(p){if(a.unread_cnt){a._show_in_list_even_though_no_unreads=true
}}a.unread_highlight_cnt=a.unread_highlights.length;
TS.shared.maybeMarkReadIfMuted(a,g);
TS.utility.msgs.countAllUnreads();
if(n!=a.unread_cnt){g.unread_changed_sig.dispatch(a)
}if(h!=a.unread_highlight_cnt){g.unread_highlight_changed_sig.dispatch(a)
}},getLatestMsgTs:function(a){if(a.latest&&a.latest.ts){return a.latest.ts
}return a.latest
},checkInitialMsgHistory:function(a,f){if(a.history_is_being_fetched){TS.warn('checkInitialMsgHistory NOT DOING ANYTHING, because "'+a.name+'" history_is_being_fetched:true');
return
}var e=TS.model.initial_msgs_cnt;
var c=TS.shared.getLatestMsgTs(a);
if(!c){TS.shared.maybeDealWithAllSentTempMsgs(a,f)
}else{var b=TS.utility.msgs.getMsg(c,a.msgs);
if(b){TS.log(58,'we have all recent "'+a.id+'" "'+a.name+'" msgs unread_count:'+a.unread_count+" unread_cnt:"+a.unread_cnt+" initial_count:"+e);
TS.shared.maybeDealWithAllSentTempMsgs(a,f);
var d=TS.utility.msgs.getOlderMsgsStatus(a);
if(a.msgs.length<TS.model.initial_msgs_cnt&&d.more){TS.error("calling loadHistory because status.more=true && model_ob.msgs.length < TS.model.initial_msgs_cnt: "+a.msgs.length+" < "+TS.model.initial_msgs_cnt);
TS.dir(0,d,a.name);
TS.shared.loadHistory(a,f,e);
return true
}if(a.msgs.length<a.unread_count&&d.more){e=Math.min(TS.model.special_initial_msgs_cnt,(a.unread_count-a.msgs.length)+1);
TS.log(58,"calling loadHistory because model_ob.msgs.length < model_ob.unread_count");
TS.warn('setting special initial_count for "'+a.id+'" "'+a.name+'" to:'+e);
TS.shared.loadHistory(a,f,e);
return true
}}else{TS.log(58,'WE DO NOT HAVE ALL RECENT MESSAGES for "'+a.id+'" "'+a.name+'" unread_count:'+a.unread_count+" unread_cnt:"+a.unread_cnt+" initial_count:"+e);
var h=false;
if(a.unread_count>TS.model.initial_msgs_cnt){e=Math.min(TS.model.special_initial_msgs_cnt,a.unread_count);
TS.warn('setting special initial_count for "'+a.id+'" "'+a.name+'" to:'+e)
}else{if(!a.msgs.length){}}var i={channel:a.id,latest:c,count:e,inclusive:(typeof a.latest=="string")};
if(h){TS.log(58,'we have some but not all recent "'+a.id+'" "'+a.name+'" msgs but we no_oldest so are not setting oldest for api call')
}else{if(a.msgs.length&&!TS.utility.msgs.isTempMsg(a.msgs[0])){TS.log(58,'we have some but not all recent "'+a.id+'" "'+a.name+'" msgs');
i.oldest=a.msgs[0].ts
}else{TS.log(58,'we have no "'+a.id+'" msgs')
}}var g=function(){f.fetchHistory(a,i)
};
if(TS.model.ms_connected){g()
}else{TS.ms.connected_sig.addOnce(g)
}}}},maybeLoadScrollBackHistory:function(b,a,c){if(!c&&b.scroll_top!==0){return false
}if(!TS.utility.msgs.getOlderMsgsStatus(b).more){return false
}if(!b.msgs.length){return
}TS.info(b.id+" HAS MORE");
TS.shared.loadHistory(b,a);
b.has_fetched_history_after_scrollback=true;
b.fetched_history_after_scrollback_time=TS.utility.date.getTimeStamp();
return true
},maybeLoadHistory:function(b,a){if(!TS.utility.msgs.getOlderMsgsStatus(b).more){return false
}TS.info(b.id+" HAS MORE");
TS.shared.loadHistory(b,a);
return true
},loadHistory:function(b,a,d){var c={channel:b.id,latest:b.msgs[b.msgs.length-1].ts,count:d||TS.model.subsequent_msgs_cnt};
a.fetchHistory(b,c)
},onSendMsg:function(o,m,a,g){var b=TS.utility.msgs.getMsgByRspId(m.reply_to,a.msgs);
if(!o){if(b){TS.model.unsent_msgs[b.ts]=true;
g.msg_not_sent_sig.dispatch(a,b,m)
}else{TS.error("that makes no sense")
}return
}TS.view.scroll_down_when_msg_from_user_is_added=true;
var k;
if(b){k=TS.utility.clone(b);
k.text=m.text;
k.ts=m.ts;
delete k.rsp_id;
g.removeMsg(a.id,b)
}else{TS.warn("no temp msg for "+m.reply_to);
k={text:m.text,user:TS.model.user.id,ts:m.ts}
}g.addMsg(m.SENT_MSG.channel||a.id,TS.utility.msgs.processImsg(k,a.id));
TS.prefs.recordEmojiUse(m.text);
var p;
var l;
var j=TS.utility.date.makeTsStamp();
if(a.is_channel){l="channel";
p=TS.channels.getActiveMembersNotInThisChannelForInviting(a.id)
}else{if(a.is_group){l="group";
p=TS.groups.getActiveMembersNotInThisGroupForInviting(a.id)
}else{return
}}if(!p.length){return
}var c=m.text.match(/<@(.*?)>/g);
var n=[];
var f;
var e;
if(c){for(e=0;
e<c.length;
e++){f=TS.utility.msgs.getMemberFromMemberMarkup(c[e].replace(">","").replace("<",""));
if(p.indexOf(f)==-1){continue
}if(n.indexOf(f)>-1){continue
}n.push(f)
}}if(!n.length){return
}var d="";
var h=[];
for(e=0;
e<n.length;
e++){if(e!==0){if(e==n.length-1){if(n.length>2){d+=","
}d+=" and "
}else{d+=", "
}}d+="<@"+n[e].id+">";
h.push(n[e].id)
}TS.client.ui.addEphemeralBotMsg({channel:a.id,ts:j,text:"You mentioned "+d+", but they're not in this "+l+". Would you like to <javascript:TS.client.ui.promptForGroupOrChannelInvite('"+a.id+"', '"+h.join(",")+"', '"+j+"')|invite them to join>"+(l=="group"?"?":" or have slackbot <javascript:TS.client.ui.sendChannelMsgThroughSlackBot('"+a.id+"', '"+m.ts+"', '"+h.join(",")+"', '"+j+"')|send them a link to your message>?")+" Or, <javascript:TS.utility.msgs.removeEphemeralMsg('"+a.id+"', '"+j+"')|do nothing>."})
},sendMsg:function(d,f,b){if(!f){return false
}var e=TS.utility.date.makeTsStamp();
f=TS.format.cleanMsg(f);
if(f.indexOf("DELEEEEETETEEESTTTT")===0){TS.ms.disconnect()
}var c=TS.ms.send({type:"message",channel:d,text:$.trim(f)},b.onSendMsg,e);
var a=TS.shared.getModelObById(d);
TS.typing.userEnded(a);
b.addMsg(d,{type:"message",text:f,user:TS.model.user.id,ts:e,rsp_id:c});
TS.shared.msg_sent_sig.dispatch(a,c);
return true
},onHistory:function(c,h,e,b){var g=c.msgs;
var d;
if(h.is_limited){h.has_more=false;
c.is_limited=true
}if(e.oldest){if(h.has_more){TS.info(c.name+" has more than one page of msg history between what is in cache and the latest, so let's dump what we have and just use this page of results");
TS.info(c.name+" args.oldest:"+e.oldest);
g.length=0
}}var a=[];
if(h.messages){for(var f=0;
f<h.messages.length;
f++){if(!TS.utility.msgs.getMsg(h.messages[f].ts,g)){d=h.messages[f];
a.push(TS.utility.msgs.processImsgFromHistory(d,c.id))
}}}if(a.length&&!TS.utility.msgs.getDisplayedMsgs(a).length){TS.warn("no displayed msgs in this page for "+c.id+' "'+c.name+'"! We expect TS.client.ui.afterHistoryFetch to detect this and load another page')
}g=TS.utility.msgs.setMsgs(c,a.concat(g));
TS.log(4,c.id+" msgs has more history now");
if(c.latest&&c.latest.ts&&!TS.utility.msgs.getMsg(c.latest.ts,g)){TS.log(4,"tacking on latest msg "+c.latest.ts);
d=c.latest;
TS.utility.msgs.appendMsg(g,TS.utility.msgs.processImsgFromHistory(d,c.id));
TS.utility.msgs.sortMsgs(g);
TS.utility.msgs.maybeStoreMsgs(c.id,g)
}if(!e.oldest){if(!h.has_more&&!h.is_limited){TS.utility.msgs.setOldestMsgsTs(c)
}}TS.shared.maybeDealWithAllSentTempMsgs(c,b)
},maybeDealWithAllSentTempMsgs:function(a,h){if(!TS.ms){return
}for(var f in TS.ms.sent_map){var b=TS.ms.sent_map[f];
if(b.msg.channel!=a.id){continue
}var i=b.temp_ts;
var c=TS.utility.msgs.getMsg(i,a.msgs);
if(!c){continue
}var e=TS.utility.msgs.getNonTempMsgFromUserMatchingText(b.msg.text,TS.model.user.id,a.msgs);
if(e){var d=TS.utility.date.toDateObject(e.ts);
var g=TS.utility.date.toDateObject(i);
if(d<g){TS.info("existing_msg time is older than temp_msg time, so it cant be the message we were looking for");
e=null
}}if(!e){TS.warn("not removing, we dont appear to have this non-temp message:"+b.msg.text);
TS.model.unsent_msgs[c.ts]=true;
h.msg_not_sent_sig.dispatch(a,c);
continue
}TS.info("removing temp_msg:"+c.ts+" "+c.text+" existing_msg:"+e.ts+" "+e.text);
delete TS.ms.sent_map[f];
if(a.is_channel){TS.channels.removeMsg(a.id,c)
}else{if(a.is_group){TS.groups.removeMsg(a.id,c)
}else{TS.ims.removeMsg(a.id,c)
}}}},getActiveModelOb:function(){var a;
if(TS.client){if(TS.model.active_channel_id){a=TS.channels.getChannelById(TS.model.active_channel_id)
}else{if(TS.model.active_im_id){a=TS.ims.getImById(TS.model.active_im_id)
}else{if(TS.model.active_group_id){a=TS.groups.getGroupById(TS.model.active_group_id)
}else{}}}}else{if(TS.boot_data.channel_id){a=TS.channels.getChannelById(TS.boot_data.channel_id)
}else{if(TS.boot_data.im_id){a=TS.ims.getImById(TS.boot_data.im_id)
}else{if(TS.boot_data.group_id){a=TS.groups.getGroupById(TS.boot_data.group_id)
}else{TS.warn("WTF getActiveModelOb found no ob");
TS.warn("TS.boot_data.channel_id: "+TS.boot_data.channel_id);
TS.warn("TS.boot_data.im_id: "+TS.boot_data.im_id);
TS.warn("TS.boot_data.group_id: "+TS.boot_data.group_id)
}}}}return a
},getModelObById:function(a){if(!a){return null
}if(a.charAt(0)==="C"){return TS.channels.getChannelById(a)
}else{if(a.charAt(0)==="G"){return TS.groups.getGroupById(a)
}else{return TS.ims.getImById(a)
}}},getAllModelObsForUser:function(){return TS.channels.getChannelsForUser().concat(TS.model.groups.concat(TS.model.ims))
},getShareModelObId:function(b,e){var c;
var d;
var a=function(f){if(TS.model.archive_view_is_showing&&TS.client.archives.current_model_ob.id==f){TS.client.archives.cancel()
}};
if(b&&b.charAt(0)==="U"){c=TS.ims.getImByMemberId(b);
if(!c){TS.api.call("im.open",{user:b},function(f,g){if(f){c=TS.ims.getImByMemberId(b);
if(c){e(c.id)
}else{if(TS.web){e(g.channel.id)
}else{TS.error("getShareModelObId opened an IM, but it is not in the model? data.channel.id: "+g.channel.id)
}}}else{TS.error("getShareModelObId try to open an IM, but failed data: "+JSON.stringify(g||null))
}})
}else{b=c.id;
a(b);
e(b)
}}else{if(b&&b.charAt(0)==="C"){d=TS.channels.getChannelById(b);
if(!d.is_member&&!d.is_archived){TS.channels.join(d.name,function(g,h,f){if(g){e(b)
}else{e(b)
}})
}else{a(b);
e(b)
}}else{a(b);
e(b)
}}},getModelObIdForSendingMsg:function(d,c){var a;
var b;
if(d&&d.charAt(0)==="U"){a=TS.ims.getImByMemberId(d);
if(!a){TS.api.call("im.open",{user:d},function(e,f){if(e){a=TS.ims.getImByMemberId(d);
if(a){c(a.id)
}else{if(TS.web){c(f.channel.id)
}else{TS.error("getModelObIdForSendingMsg opened an IM, but it is not in the model? data.channel.id: "+f.channel.id)
}}}else{TS.error("getModelObIdForSendingMsg try to open an IM, but failed data: "+JSON.stringify(f||null))
}})
}else{d=a.id;
c(d)
}}else{if(d&&d.charAt(0)==="C"){b=TS.channels.getChannelById(d);
if(!b.is_member&&!b.is_archived){TS.channels.join(b.name,function(f,g,e){if(f){c(d)
}else{c(d)
}})
}else{c(d)
}}else{c(d)
}}},maybeMarkReadIfMuted:function(b,a){if(!b){return
}if(!TS.notifs.isCorGMuted(b.id)){return
}if(!b.unreads.length||b.unread_highlights.length){return
}if(TS.model.prefs.sidebar_behavior=="hide_read_channels"){if(TS.model.active_cid==b.id){return
}}else{if(TS.model.prefs.sidebar_behavior=="hide_read_channels_unless_starred"&&!b.is_starred){if(TS.model.active_cid==b.id){return
}}}if(b.is_group){TS.groups.markMostRecentReadMsg(b,TS.model.marked_reasons.muted)
}else{TS.channels.markMostRecentReadMsg(b,TS.model.marked_reasons.muted)
}}})
})();
(function(){TS.registerModule("members",{status_changed_sig:new signals.Signal(),presence_changed_sig:new signals.Signal(),ds_presence_changed_sig:new signals.Signal(),user_color_changed_sig:new signals.Signal(),joined_team_sig:new signals.Signal(),changed_name_sig:new signals.Signal(),changed_real_name_sig:new signals.Signal(),changed_deleted_sig:new signals.Signal(),changed_profile_sig:new signals.Signal(),changed_tz_sig:new signals.Signal(),changed_account_type_sig:new signals.Signal(),changed_self_sig:new signals.Signal(),members_for_user_changed_sig:new signals.Signal(),onStart:function(){},getMemberById:function(q){var n=TS.model.members;
var p=d[q];
if(p){return p
}for(var o=0;
o<n.length;
o++){p=n[o];
if(p.id==q){TS.warn(q+" not in _id_map");
d[q]=p;
return p
}}return null
},getMemberByName:function(o){o=TS.utility.getLowerCaseValue(o);
var n=TS.model.members;
var q=k[o];
if(q){return q
}for(var p=0;
p<n.length;
p++){q=n[p];
if(q._name_lc==o||"@"+q._name_lc==o){TS.warn(o+" not in _name_map?");
k[o]=q;
k["@"+o]=q;
return q
}}return null
},getMemberByEmail:function(o){o=TS.utility.getLowerCaseValue(o);
var n=TS.model.members;
var q;
for(var p=0;
p<n.length;
p++){q=n[p];
if(!q.profile){continue
}if(!q.profile.email){continue
}if(TS.utility.getLowerCaseValue(q.profile.email)==o){return q
}}return null
},getMemberByRealName:function(o,q){o=TS.utility.getLowerCaseValue(o);
if(q){o=o.replace(/\s/g,"")
}if(!o){return null
}var n=TS.model.members;
var r=(q)?f[o]:b[o];
if(r){return r
}for(var p=0;
p<n.length;
p++){r=n[p];
if(r._real_name_lc){if(q){if(r._real_name_lc_no_spaces==o){TS.warn(o+" not in _real_name_lc_no_spaces?");
f[o]=r;
return r
}}else{if(r._real_name_lc==o){TS.warn(o+" not in _real_name_map?");
b[o]=r;
return r
}}}}return null
},upsertAndSignal:function(p){var o=TS.members.upsertMember(p);
if(o.status=="CHANGED"){if(o.what_changed.indexOf("profile")!=-1){TS.members.changed_profile_sig.dispatch(o.member)
}if(o.what_changed.indexOf("is_restricted")!=-1||o.what_changed.indexOf("is_ultra_restricted")!=-1){TS.members.changed_account_type_sig.dispatch(o.member)
}if(o.what_changed.indexOf("real_name")!=-1){TS.members.changed_real_name_sig.dispatch(o.member)
}if(o.what_changed.indexOf("name")!=-1){TS.members.changed_name_sig.dispatch(o.member)
}if(o.what_changed.indexOf("tz")!=-1){TS.members.changed_tz_sig.dispatch(o.member)
}if(o.what_changed.indexOf("deleted")!=-1){TS.members.changed_deleted_sig.dispatch(o.member);
var n=TS.ims.getImByMemberId(o.member.id);
if(n){TS.ims.calcUnreadCnts(n,true)
}TS.channels.calcActiveMembersForAllChannels();
TS.groups.calcActiveMembersForAllGroups()
}if(o.what_changed.indexOf("presence")!=-1){TS.members.presence_changed_sig.dispatch(o.member)
}if(p.is_self){TS.members.changed_self_sig.dispatch(o.member);
TS.model.makeYouReqex()
}}return o
},upsertMember:function(s,p){var q=TS.model.members;
var v=TS.members.getMemberById(s.id);
var r="NOOP";
var t=[];
if(s.is_ultra_restricted){s.is_restricted=true
}if(v){TS.log(4,'updating existing member "'+s.id+'"');
for(var o in s){if(o=="profile"){if(s[o]&&!TS.utility.areSimpleObjectsEqual(s[o],v[o],"member:"+s.id+" "+s.name)){var n=false;
if(!v.profile||s.profile.real_name!=v.profile.real_name){n=true;
delete b[v._real_name_lc];
delete f[v._real_name_lc_no_spaces]
}v.profile=s.profile;
if(n){TS.members.setLowerCaseNamesForMemberProfile(v);
b[v._real_name_lc]=v;
f[v._real_name_lc_no_spaces]=v
}r="CHANGED";
t.push(o)
}}else{if(v[o]!=s[o]){if(s[o]&&!TS.utility.isScalar(s[o])){v[o]=s[o];
TS.warn(o+" is not scalar! it needs to be handled by upsertMember specifically to test if it has changed! "+(typeof s[o]))
}else{if(typeof s[o]!="boolean"||!s[o]!=!v[o]){t.push(o);
var u=v[o];
v[o]=s[o];
r="CHANGED";
if(o=="name"){TS.members.usernameChanged(v,u)
}else{if(o=="real_name"){TS.members.realNameChanged(v,u)
}}}}}}}s=v
}else{if(s.id){r="ADDED";
if(s.id=="USLACKBOT"){s.is_slackbot=true
}s.member_color=s.color;
if(TS.model.user_colors[s.id]){TS.members.setMemberUserColor(s,TS.model.user_colors[s.id])
}TS.log(4,'adding member "'+s.id+'" color:'+s.color+" member_color:"+s.member_color);
s._first_name_lc="";
s._last_name_lc="";
s._real_name_normalized_lc="";
TS.members.setLowerCaseNamesForMemberProfile(s);
s._name_lc=TS.utility.getLowerCaseValue(s.name);
s._real_name_lc=TS.utility.getLowerCaseValue(s.real_name);
s._real_name_lc_no_spaces=s._real_name_lc.replace(/\s/g,"");
d[s.id]=s;
k[s._name_lc]=s;
k["@"+s._name_lc]=s;
b[s._real_name_lc]=s;
f[s._real_name_lc_no_spaces]=s;
s.files=[];
s.activity=[];
s.stars=[];
s.mentions=[];
s.activity_latest=[];
s.activity_recent=[];
q.push(s)
}else{TS.error("bad error, no member.id")
}}if(s.is_self&&s.deleted){TS.info("calling TS.reload() because member.is_self && member.deleted");
TS.reload(null,"TS.reload() because member.is_self && member.deleted");
return
}g();
i();
return{status:r,member:s,what_changed:t}
},setMemberUserColor:function(o,n){n=TS.utility.htmlEntities(n);
o.member_color=n||o.color;
if(n&&n!=o.color){TS.model.user_colors[o.id]=n
}else{delete TS.model.user_colors[o.id]
}TS.members.user_color_changed_sig.dispatch(o)
},setUserStatus:function(n){TS.api.call("status.set",{status:n},TS.members.onUserStatusSet)
},onUserStatusSet:function(n,o){if(!n){return
}},toggleUserPresence:function(){TS.api.call("presence.set",{presence:(TS.model.user.presence=="away")?"active":"away"},TS.members.onUserPresenceSet)
},onUserPresenceSet:function(n,o){if(!n){return
}},usernameChanged:function(o,n){delete k[n];
delete k["@"+n];
o._name_lc=TS.utility.getLowerCaseValue(o.name);
k[o._name_lc]=o;
k["@"+o._name_lc]=o;
TS.ims.usernameChanged(o,n)
},realNameChanged:function(o,n){if(n){delete b[n];
delete f[n.replace(/\s/g,"")]
}o._real_name_lc=TS.utility.getLowerCaseValue(o.real_name);
o._real_name_lc_no_spaces=o._real_name_lc.replace(/\s/g,"");
b[o._real_name_lc]=o;
f[o._real_name_lc_no_spaces]=o
},setLowerCaseNamesForMemberProfile:function(o){if(!o.profile){return
}if("first_name" in o.profile){o._first_name_lc=TS.utility.getLowerCaseValue(o.profile.first_name)
}if("last_name" in o.profile){o._last_name_lc=TS.utility.getLowerCaseValue(o.profile.last_name)
}if("real_name_normalized" in o.profile){o._real_name_normalized_lc=TS.utility.getLowerCaseValue(o.profile.real_name_normalized)
}if("real_name" in o.profile){o._real_name_lc=TS.utility.getLowerCaseValue(o.profile.real_name);
o._real_name_lc_no_spaces=o._real_name_lc.replace(/\s/g,"");
var n=o.real_name;
o.real_name=o.profile.real_name;
TS.members.realNameChanged(o,n)
}},getMyChannelsThatThisMemberIsNotIn:function(t){var p=[];
var s=TS.members.getMemberById(t);
if(!s){return p
}var r;
var o=TS.model.channels;
channel_loop:for(var q=0;
q<o.length;
q++){r=o[q];
if(!r.is_member){continue
}for(var n=0;
n<r.members.length;
n++){if(r.members[n]==t){continue channel_loop
}}p.push(r)
}return p
},getMyGroupsThatThisMemberIsNotIn:function(s){var o=[];
var r=TS.members.getMemberById(s);
if(!r){return o
}var q;
group_loop:for(var p=0;
p<TS.model.groups.length;
p++){q=TS.model.groups[p];
if(q.is_archived){continue
}for(var n=0;
n<q.members.length;
n++){if(q.members[n]==s){continue group_loop
}}o.push(q)
}return o
},getActiveMembersWithSelfAndNotSlackbot:function(){var n=h;
if(!n.length){n=h=a(n,TS.members.getMembersForUser(),false,false)
}return n
},getActiveMembersExceptSelfAndSlackbot:function(){var n=m;
if(!n.length){n=m=a(n,TS.members.getMembersForUser(),true,false)
}return n
},getActiveMembersWithSelfAndSlackbot:function(){var n=e;
if(!n.length){n=e=a(n,TS.members.getMembersForUser(),false,true)
}return n
},getActiveMembersWithSlackbotAndNotSelf:function(){var n=c;
if(!n.length){n=c=a(n,TS.members.getMembersForUser(),true,true)
}return n
},getMembersForUser:function(){if(!TS.model.user.is_restricted){return TS.model.members
}var o=l;
if(!o.length){var q;
var p=TS.model.members;
for(var n=0;
n<p.length;
n++){q=p[n];
if(q.deleted){continue
}if(!TS.members.canUserSeeMember(q)){continue
}o.push(q)
}}return o
},canUserSeeMember:function(n){if(!TS.model.user.is_restricted){return true
}else{if(n.is_self){return true
}else{if(n.is_slackbot){return true
}else{if(TS.ims.getImByMemberId(n.id)){return true
}else{if(TS.members.memberIsInAChannelIAmIn(n)){return true
}else{if(TS.members.memberIsInAGroupIAmIn(n)){return true
}}}}}}return false
},memberIsInAChannelIAmIn:function(p){var n=TS.channels.getChannelsForUser();
for(var o=0;
o<n.length;
o++){if(!n[o].is_member){continue
}if(n[o].members.indexOf(p.id)!=-1){return true
}}return false
},memberIsInAGroupIAmIn:function(p){var n=TS.model.groups;
for(var o=0;
o<n.length;
o++){if(n[o].is_archived){continue
}if(n[o].members.indexOf(p.id)!=-1){return true
}}return false
},getMemberDisplayNameById:function(p,n){var o=TS.members.getMemberById(p);
return o?TS.members.getMemberDisplayName(o,n):p
},getMemberDisplayName:function(p,o){if(!p){return"NO MEMBER??"
}if(!TS.model.team){return p.name
}var n=TS.model.prefs.display_real_names_override;
if((TS.model.team.prefs.display_real_names&&n!=-1)||n==1){if(p.real_name){if(o){return TS.utility.htmlEntities(p.real_name)
}return p.real_name
}}return p.name
},getMemberDisplayNameLowerCase:function(p,o){if(!p){return"NO MEMBER??"
}if(!TS.model.team){return p._name_lc
}var n=TS.model.prefs.display_real_names_override;
if((TS.model.team.prefs.display_real_names&&n!=-1)||n==1){if(p.real_name){if(o){return TS.utility.htmlEntities(p._real_name_lc)
}return p._real_name_lc
}}return p._name_lc
},botNameMatchesMemberName:function(p,n){if(!p){return false
}p=p.replace(/\s/g,"");
var o=TS.members.getMemberByName(p)||TS.members.getMemberByRealName(p,true);
if(o&&(n||!o.is_slackbot)){return true
}return false
},invalidateMembersUserCanSeeArrayCaches:function(){g()
},canUserAtEveryone:function(){if(TS.model.user.is_restricted){return(TS.model.team.prefs.who_can_at_everyone=="ra")
}if(TS.model.team.prefs.who_can_at_everyone=="ra"){return true
}if(TS.model.team.prefs.who_can_at_everyone=="regular"){return true
}if(TS.model.team.prefs.who_can_at_everyone=="admin"){return !!TS.model.user.is_admin
}if(TS.model.team.prefs.who_can_at_everyone=="owner"){return !!TS.model.user.is_owner
}return true
},canUserAtChannelOrAtGroup:function(){if(TS.model.user.is_restricted){return(TS.model.team.prefs.who_can_at_channel=="ra")
}if(TS.model.team.prefs.who_can_at_channel=="ra"){return true
}if(TS.model.team.prefs.who_can_at_channel=="regular"){return true
}if(TS.model.team.prefs.who_can_at_channel=="admin"){return !!TS.model.user.is_admin
}if(TS.model.team.prefs.who_can_at_channel=="owner"){return !!TS.model.user.is_owner
}return true
},canUserCreateChannels:function(){if(TS.model.user.is_restricted){return false
}if(TS.model.team.prefs.who_can_create_channels=="regular"){return true
}if(TS.model.team.prefs.who_can_create_channels=="admin"){return !!TS.model.user.is_admin
}if(TS.model.team.prefs.who_can_create_channels=="owner"){return !!TS.model.user.is_owner
}return true
},canUserArchiveChannels:function(){if(TS.model.user.is_restricted){return false
}if(TS.model.team.prefs.who_can_archive_channels=="regular"){return true
}if(TS.model.team.prefs.who_can_archive_channels=="admin"){return !!TS.model.user.is_admin
}if(TS.model.team.prefs.who_can_archive_channels=="owner"){return !!TS.model.user.is_owner
}return true
},canUserCreateGroups:function(){if(TS.model.user.is_ultra_restricted){return false
}if(TS.model.user.is_restricted){return(TS.model.team.prefs.who_can_create_groups=="ra")
}if(TS.model.team.prefs.who_can_create_groups=="ra"){return true
}if(TS.model.team.prefs.who_can_create_groups=="regular"){return true
}if(TS.model.team.prefs.who_can_create_groups=="admin"){return !!TS.model.user.is_admin
}if(TS.model.team.prefs.who_can_create_groups=="owner"){return !!TS.model.user.is_owner
}return true
},canUserPostInGeneral:function(){if(TS.model.user.is_restricted){return(TS.model.team.prefs.who_can_post_general=="ra")
}if(TS.model.team.prefs.who_can_post_general=="ra"){return true
}if(TS.model.team.prefs.who_can_post_general=="regular"){return true
}if(TS.model.team.prefs.who_can_post_general=="admin"){return !!TS.model.user.is_admin
}if(TS.model.team.prefs.who_can_post_general=="owner"){return !!TS.model.user.is_owner
}return true
},canUserKickFromChannels:function(){if(TS.model.user.is_restricted){return false
}if(TS.model.team.prefs.who_can_kick_channels=="regular"){return true
}if(TS.model.team.prefs.who_can_kick_channels=="admin"){return !!TS.model.user.is_admin
}if(TS.model.team.prefs.who_can_kick_channels=="owner"){return !!TS.model.user.is_owner
}return true
},canUserKickFromGroups:function(){if(TS.model.user.is_restricted){return false
}if(TS.model.team.prefs.who_can_kick_groups=="regular"){return true
}if(TS.model.team.prefs.who_can_kick_groups=="admin"){return !!TS.model.user.is_admin
}if(TS.model.team.prefs.who_can_kick_groups=="owner"){return !!TS.model.user.is_owner
}return true
},memberSorterByActive:function(o,n){if(o.presence!=n.presence){if(o.presence=="active"){return -1
}if(n.presence=="active"){return 1
}}var p=TS.members.getMemberDisplayNameLowerCase(o);
var q=TS.members.getMemberDisplayNameLowerCase(n);
if(p<q){return -1
}if(p>q){return 1
}return 0
},memberSorterByActiveWithBotsLast:function(o,n){if(o.presence!=n.presence){if(o.presence=="active"){return -1
}if(n.presence=="active"){return 1
}}var s=o.is_bot||o.is_slackbot;
var q=n.is_bot||n.is_slackbot;
if(s!==q){if(!s){return -1
}if(!q){return 1
}}var p=TS.members.getMemberDisplayNameLowerCase(o);
var r=TS.members.getMemberDisplayNameLowerCase(n);
if(p<r){return -1
}if(p>r){return 1
}return 0
},memberSorterByName:function(o,n){var p=TS.members.getMemberDisplayNameLowerCase(o);
var q=TS.members.getMemberDisplayNameLowerCase(n);
if(p<q){return -1
}if(p>q){return 1
}return 0
}});
var d={};
var k={};
var b={};
var f={};
var h=[];
var m=[];
var e=[];
var c=[];
var l=[];
var j=0;
var a=function(o,p,r,q){o.length=0;
var s;
for(var n=0;
n<p.length;
n++){s=p[n];
if(s.deleted){continue
}if(!q&&s.is_slackbot){continue
}if(r&&s.is_self){continue
}o.push(s)
}return o
};
var i=function(){h.length=0;
m.length=0;
e.length=0;
c.length=0
};
var g=function(){if(!TS.model.user||!TS.model.user.is_restricted){return
}var o=l.length;
if(!o){return
}l.length=0;
i();
j=o;
var n=TS.members.getMembersForUser();
if(n.length!=o){TS.members.members_for_user_changed_sig.dispatch()
}}
})();
(function(){TS.registerModule("bots",{added_sig:new signals.Signal(),changed_name_sig:new signals.Signal(),changed_deleted_sig:new signals.Signal(),changed_icons_sig:new signals.Signal(),onStart:function(){},getBotById:function(d){var b=TS.model.bots;
var c;
for(var a=0;
a<b.length;
a++){c=b[a];
if(c.id==d){return c
}}return null
},getBotByName:function(a){var c=TS.model.bots;
var d;
if(typeof a==="undefined"){return null
}for(var b=0;
b<c.length;
b++){d=c[b];
if(d.name.toLowerCase()==a.toLowerCase()){return d
}}return null
},upsertAndSignal:function(b){var a=TS.bots.upsertBot(b);
if(a.status=="CHANGED"){if(a.what_changed.indexOf("icons")!=-1){TS.bots.changed_icons_sig.dispatch(a.bot)
}if(a.what_changed.indexOf("name")!=-1){TS.bots.changed_name_sig.dispatch(a.bot)
}if(a.what_changed.indexOf("deleted")!=-1){TS.bots.changed_deleted_sig.dispatch(a.bot)
}}return a
},upsertBot:function(g,e){var d=TS.model.bots;
var c=TS.bots.getBotById(g.id);
var a="NOOP";
var f=[];
if(c){TS.log(4,'updating existing bot "'+g.id+'"');
for(var b in g){if(b=="icons"){if(g[b]&&!TS.utility.areSimpleObjectsEqual(g[b],c[b],"bot:"+g.id+" "+g.name)){c.icons=g.icons;
a="CHANGED";
f.push(b)
}}else{if(c[b]!=g[b]){if(g[b]&&!TS.utility.isScalar(g[b])){c[b]=g[b];
TS.warn(b+" is not scalar! it needs to be handled by upsertBot specifically to test if it has changed! "+(typeof g[b]))
}else{if(typeof g[b]!="boolean"||!g[b]!=!c[b]){f.push(b);
c[b]=g[b];
a="CHANGED"
}}}}}g=c
}else{a="ADDED";
TS.log(4,'adding bot "'+g.id);
d.push(g)
}return{status:a,bot:g,what_changed:f}
}})
})();
(function(){TS.registerModule("members.view",{team_filter_changed_sig:new signals.Signal(),filter_timer:null,onStart:function(){},switchTabs:function(b){if(TS.web&&TS.web.admin&&TS.web.admin.view=="invites"){$("#"+b+"_invites_tab").trigger("click")
}else{if(TS.client){$("#"+b+"_members_tab").find("a").trigger("click")
}else{$("#"+b+"_members_tab").trigger("click")
}}},bindTeamFilter:function(d,e){var b=$(d);
var f=b.find("input.member_filter");
var c=b.find(".icon_close");
f.bind("keyup update-team-filter",function(g){if(TS.members.view.filter_timer){window.clearTimeout(TS.members.view.filter_timer)
}TS.members.view.filter_timer=window.setTimeout(function(){var h;
if(g.which==TS.utility.keymap.enter&&d=="#dms_filter"){TS.members.view.selectMatch(d)
}h=$.trim(f.val().toLowerCase());
if(h!==a){a=h;
TS.members.view.filterTeam(a,d,e)
}if(a.length===0){c.addClass("hidden")
}else{c.removeClass("hidden")
}},(TS.members.getMembersForUser().length>100?250:50))
});
c.bind("click",function(){TS.members.view.clearFilter(d,e);
setTimeout(function(){f.focus()
},0)
})
},filterTeam:function(h,g,b){var w=$(g);
a=h;
var d=w.data("list-items-id");
var k=$(d);
var t=k.find(".member_item");
var x={};
var u;
var i;
var c;
var p=(g==="#dms_filter");
var j;
if(TS.web&&TS.web.admin&&g==="#team_filter"){j=k.find(".tab_pane.selected")
}if(!j&&!TS.web&&g==="#team_filter"){j=$("#team_list_members")
}if(j&&j.length){j.addClass("hidden")
}if(p){u=t.parent();
i=document.activeElement?$(document.activeElement):null;
t.detach()
}t.removeClass("active");
k.find(".no_results").addClass("hidden");
if(p){u.append(t);
if(i){i.focus()
}}function l(A,z){var y=$.grep(A,function(D,C){var B=(D.name&&D.name.match(z))||(D.first_name&&D.first_name.match(z))||(D.last_name&&D.last_name.match(z))||(D._real_name_lc&&D._real_name_lc.match(z))||(D.profile&&D.profile.email&&D.profile.email.match(z))||(D.profile&&D.profile.real_name_normalized&&D.profile.real_name_normalized.match(z))||(D.profile&&D.profile.real_name&&D.profile.real_name.match(z));
return B
});
return y
}function q(B,A){var z=new RegExp("^"+TS.utility.regexpEscape(A),"i");
var D=new RegExp("(-|_|\\+|\\s|\\.|@)"+TS.utility.regexpEscape(A),"i");
var C=l(B,z);
var y=l(B,D);
y=y.filter(function(E){return !C.some(function(F){return F.id===E.id
})
});
return C.concat(y)
}var s;
if(TS.web&&TS.web.admin&&TS.web.admin.view=="invites"){var v=[];
var f=[];
var r=[];
$.each(t,function(y,z){var A;
z=$(z);
A=z.data("invite-id");
x[A]=z
});
f=q(TS.web.admin.pending_invites,h);
r=q(TS.web.admin.accepted_invites,h);
v=f.concat(r);
if(v.length>0){$.each(v,function(z,y){if(y&&y.id&&x[y.id]){x[y.id].addClass("active")
}});
if(b){$(b).trigger("resize")
}}s=[{name:"pending",label:"pending invitations",matches:f},{name:"accepted",label:"accepted invitations",matches:r}];
s.forEach(function(A){var y=$("#"+A.name+"_no_results");
if(A.matches.length>0){y.addClass("hidden").empty();
return
}else{var B={query:h,tab:A,pending_matches:f,show_pending_matches:A.name!="pending"&&f.length>0,accepted_matches:r,show_accepted_matches:A.name!="accepted"&&r.length>0};
var z=TS.templates.team_list_no_results(B);
y.removeClass("hidden").html(z);
y.find(".clear_members_filter").on("click",function(){TS.members.view.clearFilter(g,b)
})
}})
}else{var o=TS.members.getMembersForUser();
var n=[];
var e=[];
var m=[];
$(".restricted_header, .bot_header, .ra_invite_prompt, .restricted_info")[h?"addClass":"removeClass"]("hidden");
$.each(t,function(y,z){var A;
z=$(z);
A=z.data("member-id");
x[A]=z
});
c=q(o,h);
if(c.length>0){$.each(c,function(y,z){if(z&&z.id&&x[z.id]){x[z.id].addClass("active")
}if(z.is_restricted){e.push(z)
}else{if(z.deleted){m.push(z)
}else{n.push(z)
}}});
if(b){$(b).trigger("resize")
}}else{if(g=="#dms_filter"||g=="#file_member_filter"){k.find(".query").text(h);
k.find(".no_results").removeClass("hidden")
}}if(g=="#team_filter"){s=[{name:"active",label:"full team members",matches:n},{name:"restricted",label:"restricted accounts",matches:e},{name:"disabled",label:"disabled accounts",matches:m}];
s.forEach(function(A){var y=$("#"+A.name+"_no_results");
if(A.matches.length>0){y.addClass("hidden").empty();
return
}else{var B={query:h,tab:A,active_matches:n,show_active_matches:A.name!="active"&&n.length>0,restricted_matches:e,show_restricted_matches:A.name!="restricted"&&e.length>0,disabled_matches:m,show_disabled_matches:TS.web&&A.name!="disabled"&&m.length>0};
var z=TS.templates.team_list_no_results(B);
y.removeClass("hidden").html(z);
y.find(".clear_members_filter").on("click",function(){TS.members.view.clearFilter(g,b)
})
}})
}}if(j&&j.length){j.removeClass("hidden")
}if(TS.client&&b){$(b).data("monkeyScroll").updateFunc()
}TS.members.view.team_filter_changed_sig.dispatch(h,c.length)
},selectMatch:function(g){var d=$(g);
var f=d.data("list-items-id");
var i=$(f);
var c=i.find(".member_item");
var h=c.filter(".active");
if(h.length==1){var b=h.first();
var e=b.data("member-id");
if(e){TS.ims.startImByMemberId(e);
TS.menu.end()
}}},clearFilter:function(f,g){var c=$(f);
var i=c.find("input.member_filter");
var d=c.find(".icon_close");
var e=c.data("list-items-id");
var h=$(e);
var b=h.find(".member_item");
a="";
if(TS.members.view.filter_timer){window.clearTimeout(TS.members.view.filter_timer);
TS.members.view.filter_timer=null
}i.val("");
d.addClass("hidden");
$(".restricted_header, .bot_header, .ra_invite_prompt, .restricted_info").removeClass("hidden");
h.find(".no_results").addClass("hidden");
b.addClass("active");
TS.members.view.team_filter_changed_sig.dispatch("",TS.members.getMembersForUser().length);
if(TS.client&&g){$(g).data("monkeyScroll").updateFunc()
}},onTeamDirectoryItemClick:function(h){if($(h.target).closest("a").length){return
}var c=$(this);
var f=c.data("member-id");
var i=TS.members.getMemberById(f);
if(!i){return
}var b=100;
if(c.hasClass("expanded")){c.removeClass("show_extra_data");
setTimeout(function(){c.removeClass("expanded");
c.find(".expanded_member_details").remove()
},b)
}else{var d=TS.templates.team_list_item_details(i);
var g=TS.templates.team_list_item_buttons(i);
c.find(".member_name_and_title").append(d);
c.append(g);
c.addClass("expanded");
setTimeout(function(){c.addClass("show_extra_data")
},b)
}}});
var a=""
})();
(function(){TS.registerModule("prefs",{highlight_words_changed_sig:new signals.Signal(),seen_welcome_2_changed_sig:new signals.Signal(),emoji_mode_changed_sig:new signals.Signal(),obey_inline_img_limit_changed_sig:new signals.Signal(),show_member_presence_changed_sig:new signals.Signal(),messages_theme_changed_sig:new signals.Signal(),expand_inline_imgs_changed_sig:new signals.Signal(),expand_internal_inline_imgs_changed_sig:new signals.Signal(),expand_non_media_attachments_changed_sig:new signals.Signal(),webapp_spellcheck_changed_sig:new signals.Signal(),color_names_in_list_changed_sig:new signals.Signal(),search_only_my_channels_changed_sig:new signals.Signal(),search_exclude_channels_changed_sig:new signals.Signal(),search_exclude_bots_changed_sig:new signals.Signal(),box_enabled_changed_sig:new signals.Signal(),dropbox_enabled_changed_sig:new signals.Signal(),collapsible_changed_sig:new signals.Signal(),read_changed_sig:new signals.Signal(),push_changed_sig:new signals.Signal(),time24_changed_sig:new signals.Signal(),sidebar_behavior_changed_sig:new signals.Signal(),dtop_notif_changed_sig:new signals.Signal(),muted_channels_changed_sig:new signals.Signal(),mac_speak_changed_sig:new signals.Signal(),mac_ssb_bullet_changed_sig:new signals.Signal(),team_hide_referers_changed_sig:new signals.Signal(),team_require_at_for_mention_changed_sig:new signals.Signal(),sidebar_theme_changed_sig:new signals.Signal(),k_key_omnibox_changed_sig:new signals.Signal(),display_real_names_override_changed_sig:new signals.Signal(),team_display_real_names_changed_sig:new signals.Signal(),team_perms_pref_changed_sig:new signals.Signal(),privacy_policy_seen_changed_sig:new signals.Signal(),compliance_export_start_changed_sig:new signals.Signal(),team_disallow_public_file_urls_changed_sig:new signals.Signal(),msg_preview_changed_sig:new signals.Signal(),mentions_exclude_at_channels_changed_sig:new signals.Signal(),emoji_use_changed_sig:new signals.Signal(),onStart:function(){if(TS.client){TS.client.login_sig.add(TS.prefs.onLogin,TS.prefs)
}},onLogin:function(b,d){var c=TS.boot_data.new_message_sounds;
for(var a=0;
a<c.length;
a++){if(c[a].label==TS.model.prefs.new_msg_snd){TS.warn("corrected TS.model.prefs.new_msg_snd "+c[a].label+" -> "+c[a].value);
TS.model.prefs.new_msg_snd==c[a].value;
TS.api.callImmediately("users.prefs.set",{name:"new_msg_snd",value:c[a].value});
break
}}},setPrefs:function(a){TS.model.prefs=a;
TS.prefs.setEmojiUse(TS.model.prefs.emoji_use);
TS.prefs.setUserColors(TS.model.prefs.user_colors);
TS.prefs.setLoudChannels(TS.model.prefs.loud_channels);
TS.prefs.setSuppressedChannels(TS.model.prefs.at_channel_suppressed_channels);
TS.prefs.setPushSuppressedChannels(TS.model.prefs.push_at_channel_suppressed_channels);
TS.prefs.setNeverChannels(TS.model.prefs.never_channels);
TS.prefs.setMutedChannels(TS.model.prefs.muted_channels);
TS.prefs.setLoudChannelsSet(TS.model.prefs.loud_channels_set);
TS.prefs.setPushLoudChannels(TS.model.prefs.push_loud_channels);
TS.prefs.setPushMentionChannels(TS.model.prefs.push_mention_channels);
TS.prefs.setPushLoudChannelsSet(TS.model.prefs.push_loud_channels_set);
TS.prefs.setSearchExcludeChannels(TS.model.prefs.search_exclude_channels);
try{TS.prefs.setSidebarThemeCustomValues(JSON.parse(TS.model.prefs.sidebar_theme_custom_values))
}catch(b){TS.prefs.setSidebarThemeCustomValues()
}TS.prefs.setEmojiMode();
TS.prefs.setTheme();
TS.model.prefs.emoji_autocomplete_big=false;
TSSSB.call("runFromTray",!!TS.model.prefs.winssb_run_from_tray)
},setHighlightWords:function(a){TS.model.prefs.highlight_words=a;
TS.model.highlight_words=["@"+TS.model.user.name];
if(!TS.model.team.prefs.require_at_for_mention){TS.model.highlight_words.push(TS.model.user.name)
}TS.model.highlight_words.push("<@"+TS.model.user.id);
if(a&&typeof a=="string"){TS.model.highlight_words=TS.model.highlight_words.concat(a.split(","))
}TS.model.highlight_words_regex=null
},setSuppressedChannels:function(a){TS.model.prefs.at_channel_suppressed_channels=a;
TS.model.at_channel_suppressed_channels=[];
if(a&&typeof a=="string"){TS.model.at_channel_suppressed_channels=TS.model.at_channel_suppressed_channels.concat(a.split(","))
}},setPushSuppressedChannels:function(a){TS.model.prefs.push_at_channel_suppressed_channels=a;
TS.model.push_at_channel_suppressed_channels=[];
if(a&&typeof a=="string"){TS.model.push_at_channel_suppressed_channels=TS.model.push_at_channel_suppressed_channels.concat(a.split(","))
}},setLoudChannels:function(a){TS.model.prefs.loud_channels=a;
TS.model.loud_channels=[];
if(a&&typeof a=="string"){TS.model.loud_channels=TS.model.loud_channels.concat(a.split(","))
}},setNeverChannels:function(a){TS.model.prefs.never_channels=a;
TS.model.never_channels=[];
if(a&&typeof a=="string"){TS.model.never_channels=TS.model.never_channels.concat(a.split(","))
}},setMutedChannels:function(c){TS.model.prefs.muted_channels=c;
var b;
var a;
TS.model.muted_channels=[];
if(c&&typeof c=="string"){TS.model.muted_channels=TS.model.muted_channels.concat(c.split(","))
}for(b=0;
b<TS.model.muted_channels.length;
b++){a=TS.shared.getModelObById(TS.model.muted_channels[b]);
if(!a){continue
}if(!a.unread_cnt){continue
}a._show_in_list_even_though_no_unreads=true
}for(b=0;
b<TS.model.channels.length;
b++){a=TS.model.channels[b];
if(TS.notifs.isCorGMuted(a.id)){continue
}a._show_in_list_even_though_no_unreads=false
}for(b=0;
b<TS.model.groups.length;
b++){a=TS.model.groups[b];
if(TS.notifs.isCorGMuted(a.id)){continue
}a._show_in_list_even_though_no_unreads=false
}},setLoudChannelsSet:function(a){TS.model.prefs.loud_channels_set=a;
TS.model.loud_channels_set=[];
if(a&&typeof a=="string"){TS.model.loud_channels_set=TS.model.loud_channels_set.concat(a.split(","))
}},setPushLoudChannels:function(a){TS.model.prefs.push_loud_channels=a;
TS.model.push_loud_channels=[];
if(a&&typeof a=="string"){TS.model.push_loud_channels=TS.model.push_loud_channels.concat(a.split(","))
}},setPushMentionChannels:function(a){TS.model.prefs.push_mention_channels=a;
TS.model.push_mention_channels=[];
if(a&&typeof a=="string"){TS.model.push_mention_channels=TS.model.push_mention_channels.concat(a.split(","))
}},setPushLoudChannelsSet:function(a){TS.model.prefs.push_loud_channels_set=a;
TS.model.push_loud_channels_set=[];
if(a&&typeof a=="string"){TS.model.push_loud_channels_set=TS.model.push_loud_channels_set.concat(a.split(","))
}},setSearchExcludeChannels:function(a){TS.model.prefs.search_exclude_channels=a;
TS.model.search_exclude_channels=[];
if(a&&typeof a=="string"){TS.model.search_exclude_channels=TS.model.search_exclude_channels.concat(a.split(","))
}},recordEmojiUse:function(b){var a=TS.utility.msgs.recordEmojiInHash(b,TS.model.emoji_use);
if(a){TS.utility.callFuncWhenApiQisEmpty(TS.prefs.saveEmojiUse)
}},saveEmojiUse:function(){TS.dir(777,TS.model.emoji_use,"saving emoji_use pref");
TS.prefs.setPrefByAPI({name:"emoji_use",value:JSON.stringify(TS.model.emoji_use)})
},setEmojiUse:function(a){a=a||null;
try{TS.model.emoji_use=JSON.parse(a)||{}
}catch(b){TS.model.emoji_use={}
}TS.dir(777,TS.model.emoji_use,"TS.model.emoji_use set to:");
TS.model.emoji_use_for_menu=Object.keys(TS.model.emoji_use).sort(function(d,c){return -(TS.model.emoji_use[d]-TS.model.emoji_use[c])
});
TS.model.emoji_use_for_menu.length=Math.min(TS.model.emoji_use_for_menu.length,TS.model.emoji_menu_columns*4)
},setUserColors:function(a){TS.model.prefs.user_colors=a;
var b=(a)?JSON.parse(a):{};
TS.model.user_colors=b||{}
},setTheme:function(a){if(TS.model.prefs.messages_theme=="default"){TS.model.prefs.messages_theme="light_with_avatars"
}TS.model.prefs.theme="light";
TS.model.prefs.avatars=true;
if(TS.model.prefs.messages_theme=="dense"){TS.model.prefs.theme="dense";
TS.model.prefs.avatars=false
}else{if(TS.model.prefs.messages_theme=="light"){TS.model.prefs.theme="light";
TS.model.prefs.avatars=false
}else{if(TS.model.prefs.messages_theme=="light_with_avatars"){TS.model.prefs.theme="light";
TS.model.prefs.avatars=true
}}}},onTeamPrefChanged:function(a){if(a.name=="msg_edit_window_mins"){TS.model.team.prefs.msg_edit_window_mins=a.value
}else{if(a.name=="allow_message_deletion"){TS.model.team.prefs.allow_message_deletion=!!a.value
}else{if(a.name=="hide_referers"){TS.model.team.prefs.hide_referers=!!a.value;
TS.prefs.team_hide_referers_changed_sig.dispatch()
}else{if(a.name=="require_at_for_mention"){TS.model.team.prefs.require_at_for_mention=!!a.value;
TS.prefs.setHighlightWords(TS.model.prefs.highlight_words);
TS.prefs.team_require_at_for_mention_changed_sig.dispatch()
}else{if(a.name=="display_real_names"){TS.model.team.prefs.display_real_names=!!a.value;
TS.prefs.team_display_real_names_changed_sig.dispatch()
}else{if(a.name.indexOf("who_can_")===0){if(TS.model.team.prefs[a.name]!=a.value){TS.model.team.prefs[a.name]=a.value;
TS.prefs.team_perms_pref_changed_sig.dispatch(a.name)
}}else{if(a.name=="compliance_export_start"){if(TS.model.team.prefs.compliance_export_start!=a.value){TS.model.team.prefs.compliance_export_start=a.value;
TS.prefs.compliance_export_start_changed_sig.dispatch()
}}else{if(a.name=="disallow_public_file_urls"){TS.model.team.prefs.disallow_public_file_urls=!!a.value;
TS.prefs.team_disallow_public_file_urls_changed_sig.dispatch()
}else{TS.model.team.prefs[a.name]=a.value
}}}}}}}}},onPrefChanged:function(a){if(a.name=="color_names_in_list"){TS.model.prefs.color_names_in_list=!!a.value;
TS.prefs.color_names_in_list_changed_sig.dispatch()
}else{if(a.name=="display_real_names_override"){TS.model.prefs.display_real_names_override=a.value;
TS.prefs.display_real_names_override_changed_sig.dispatch()
}else{if(a.name=="growls_enabled"){TS.model.prefs.growls_enabled=!!a.value;
TS.prefs.dtop_notif_changed_sig.dispatch()
}else{if(a.name=="sidebar_theme"){if(TS.model.prefs.sidebar_theme!==a.value){TS.model.prefs.sidebar_theme=a.value;
TS.prefs.sidebar_theme_changed_sig.dispatch()
}}else{if(a.name=="sidebar_theme_custom_values"){if(TS.model.prefs.sidebar_theme_custom_values!==a.value){TS.prefs.setSidebarThemeCustomValues(JSON.parse(a.value));
TS.prefs.sidebar_theme_changed_sig.dispatch()
}}else{if(a.name=="expand_inline_imgs"){TS.model.prefs.expand_inline_imgs=!!a.value;
TS.prefs.expand_inline_imgs_changed_sig.dispatch()
}else{if(a.name=="webapp_spellcheck"){TS.model.prefs.webapp_spellcheck=!!a.value;
TS.prefs.webapp_spellcheck_changed_sig.dispatch()
}else{if(a.name=="expand_internal_inline_imgs"){TS.model.prefs.expand_internal_inline_imgs=!!a.value;
TS.prefs.expand_internal_inline_imgs_changed_sig.dispatch()
}else{if(a.name=="expand_non_media_attachments"){TS.model.prefs.expand_non_media_attachments=!!a.value;
TS.prefs.expand_non_media_attachments_changed_sig.dispatch()
}else{if(a.name=="messages_theme"){TS.model.prefs.messages_theme=a.value;
TS.prefs.setTheme();
TS.prefs.messages_theme_changed_sig.dispatch()
}else{if(a.name=="show_member_presence"){TS.model.prefs.show_member_presence=!!a.value;
TS.prefs.show_member_presence_changed_sig.dispatch()
}else{if(a.name=="highlight_words"){TS.prefs.setHighlightWords(a.value);
TS.prefs.highlight_words_changed_sig.dispatch()
}else{if(a.name=="at_channel_suppressed_channels"){TS.prefs.setSuppressedChannels(a.value);
TS.prefs.dtop_notif_changed_sig.dispatch()
}else{if(a.name=="push_at_channel_suppressed_channels"){TS.prefs.setPushSuppressedChannels(a.value);
TS.prefs.push_changed_sig.dispatch()
}else{if(a.name=="loud_channels"){TS.prefs.setLoudChannels(a.value)
}else{if(a.name=="never_channels"){TS.prefs.setNeverChannels(a.value)
}else{if(a.name=="muted_channels"){TS.prefs.setMutedChannels(a.value);
TS.prefs.muted_channels_changed_sig.dispatch()
}else{if(a.name=="loud_channels_set"){TS.prefs.setLoudChannelsSet(a.value);
TS.prefs.dtop_notif_changed_sig.dispatch()
}else{if(a.name=="push_loud_channels"){TS.prefs.setPushLoudChannels(a.value)
}else{if(a.name=="push_mention_channels"){TS.prefs.setPushMentionChannels(a.value)
}else{if(a.name=="push_loud_channels_set"){TS.prefs.setPushLoudChannelsSet(a.value);
TS.prefs.push_changed_sig.dispatch()
}else{if(a.name=="emoji_use"){TS.prefs.setEmojiUse(a.value);
TS.makeEmoticonList();
TS.prefs.emoji_use_changed_sig.dispatch()
}else{if(a.name=="user_colors"){var c;
var b;
for(b in TS.model.user_colors){c=TS.members.getMemberById(b);
if(c){TS.members.setMemberUserColor(c,c.color)
}}TS.prefs.setUserColors(a.value);
for(b in TS.model.user_colors){c=TS.members.getMemberById(b);
if(c){TS.members.setMemberUserColor(c,TS.model.user_colors[b])
}}}else{if(a.name=="graphic_emoticons"){TS.model.prefs.graphic_emoticons=a.value;
TS.prefs.setEmojiMode();
TS.prefs.emoji_mode_changed_sig.dispatch()
}else{if(a.name=="ss_emojis"){TS.model.prefs.ss_emojis=a.value;
TS.prefs.setEmojiMode();
TS.prefs.emoji_mode_changed_sig.dispatch();
TS.makeEmoticonList()
}else{if(a.name=="emoji_mode"){TS.model.prefs.emoji_mode=a.value;
TS.prefs.setEmojiMode();
TS.prefs.emoji_mode_changed_sig.dispatch();
TS.makeEmoticonList()
}else{if(a.name=="obey_inline_img_limit"){TS.model.prefs.obey_inline_img_limit=a.value;
TS.prefs.obey_inline_img_limit_changed_sig.dispatch()
}else{if(a.name=="search_only_my_channels"){TS.model.prefs.search_only_my_channels=!!a.value;
TS.prefs.search_only_my_channels_changed_sig.dispatch()
}else{if(a.name=="search_exclude_channels"){TS.prefs.setSearchExcludeChannels(a.value);
TS.prefs.search_exclude_channels_changed_sig.dispatch()
}else{if(a.name=="search_exclude_bots"){TS.model.prefs.search_exclude_bots=!!a.value;
TS.prefs.search_exclude_bots_changed_sig.dispatch()
}else{if(a.name=="mac_speak_voice"){if(TS.model.prefs.mac_speak_voice!=a.value){TS.model.prefs.mac_speak_voice=a.value;
TS.prefs.mac_speak_changed_sig.dispatch()
}}else{if(a.name=="mac_speak_speed"){if(TS.model.prefs.mac_speak_speed!=a.value){TS.model.prefs.mac_speak_speed=a.value;
TS.prefs.mac_speak_changed_sig.dispatch()
}}else{if(a.name=="speak_growls"){if(TS.model.prefs.speak_growls!==a.value){TS.model.prefs.speak_growls=a.value;
TS.prefs.mac_speak_changed_sig.dispatch()
}}else{if(a.name=="has_uploaded"){TS.model.prefs.has_uploaded=!!a.value;
TS.newxp.updateStartChecks()
}else{if(a.name=="has_invited"){TS.model.prefs.has_invited=!!a.value;
TS.newxp.updateStartChecks()
}else{if(a.name=="has_created_channel"){TS.model.prefs.has_created_channel=!!a.value;
TS.newxp.updateStartChecks()
}else{if(a.name=="no_joined_overlays"){TS.model.prefs.no_joined_overlays=!!a.value
}else{if(a.name=="no_created_overlays"){TS.model.prefs.no_created_overlays=!!a.value
}else{if(a.name=="seen_welcome_2"){TS.model.prefs.seen_welcome_2=!!a.value;
TS.prefs.seen_welcome_2_changed_sig.dispatch()
}else{if(a.name=="box_enabled"){TS.model.prefs.box_enabled=!!a.value;
TS.prefs.box_enabled_changed_sig.dispatch()
}else{if(a.name=="dropbox_enabled"){TS.model.prefs.dropbox_enabled=!!a.value;
TS.prefs.dropbox_enabled_changed_sig.dispatch()
}else{if(a.name=="collapsible"){if(TS.model.prefs.collapsible!==!!a.value){TS.model.prefs.collapsible=!!a.value;
TS.prefs.collapsible_changed_sig.dispatch()
}}else{if(a.name=="collapsible_by_click"){if(TS.model.prefs.collapsible_by_click!==!!a.value){TS.model.prefs.collapsible_by_click=!!a.value;
TS.prefs.collapsible_changed_sig.dispatch()
}}else{if(a.name=="mark_msgs_read_immediately"){if(TS.model.prefs.mark_msgs_read_immediately!==!!a.value){TS.model.prefs.mark_msgs_read_immediately=!!a.value;
TS.prefs.read_changed_sig.dispatch()
}}else{if(a.name=="start_scroll_at_oldest"){if(TS.model.prefs.start_scroll_at_oldest!==!!a.value){TS.model.prefs.start_scroll_at_oldest=!!a.value;
TS.prefs.read_changed_sig.dispatch()
}}else{if(a.name=="mac_ssb_bullet"){if(TS.model.prefs.mac_ssb_bullet!==!!a.value){TS.model.prefs.mac_ssb_bullet=!!a.value;
TS.prefs.mac_ssb_bullet_changed_sig.dispatch()
}}else{if(a.name=="all_channels_loud"){if(TS.model.prefs.all_channels_loud!==!!a.value){TS.model.prefs.all_channels_loud=!!a.value;
TS.prefs.dtop_notif_changed_sig.dispatch()
}}else{if(a.name=="push_everything"){if(TS.model.prefs.push_everything!==!!a.value){TS.model.prefs.push_everything=!!a.value;
TS.prefs.push_changed_sig.dispatch()
}}else{if(a.name=="push_mention_alert"){if(TS.model.prefs.push_mention_alert!==!!a.value){TS.model.prefs.push_mention_alert=!!a.value;
TS.prefs.push_changed_sig.dispatch()
}}else{if(a.name=="push_dm_alert"){if(TS.model.prefs.push_dm_alert!==!!a.value){TS.model.prefs.push_dm_alert=!!a.value;
TS.prefs.push_changed_sig.dispatch()
}}else{if(a.name=="time24"){if(TS.model.prefs.time24!==!!a.value){TS.model.prefs.time24=!!a.value;
TS.prefs.time24_changed_sig.dispatch()
}}else{if(a.name=="sidebar_behavior"){if(TS.model.prefs.sidebar_behavior!=a.value){TS.model.prefs.sidebar_behavior=a.value;
TS.prefs.sidebar_behavior_changed_sig.dispatch()
}}else{if(a.name=="privacy_policy_seen"){if(TS.model.prefs.privacy_policy_seen!=a.value){TS.model.prefs.privacy_policy_seen=a.value;
TS.prefs.privacy_policy_seen_changed_sig.dispatch()
}}else{if(a.name=="last_seen_at_channel_warning"){if(TS.model.prefs.last_seen_at_channel_warning!=a.value){TS.model.prefs.last_seen_at_channel_warning=a.value
}}else{if(a.name=="msg_preview"){if(TS.model.prefs.msg_preview!=a.value){TS.model.prefs.msg_preview=a.value;
TS.prefs.msg_preview_changed_sig.dispatch()
}}else{if(a.name=="msg_preview_displaces"){if(TS.model.prefs.msg_preview_displaces!=a.value){TS.model.prefs.msg_preview_displaces=a.value;
TS.prefs.msg_preview_changed_sig.dispatch()
}}else{if(a.name=="msg_preview_persistent"){if(TS.model.prefs.msg_preview_persistent!=a.value){TS.model.prefs.msg_preview_persistent=a.value;
TS.prefs.msg_preview_changed_sig.dispatch()
}}else{if(a.name=="winssb_run_from_tray"){if(TS.model.prefs.winssb_run_from_tray!=a.value){TS.model.prefs.winssb_run_from_tray=a.value;
TSSSB.call("runFromTray",!!TS.model.prefs.winssb_run_from_tray)
}}else{if(a.name=="mentions_exclude_at_channels"){if(TS.model.prefs.mentions_exclude_at_channels!=a.value){TS.model.prefs.mentions_exclude_at_channels=a.value;
TS.prefs.mentions_exclude_at_channels_changed_sig.dispatch()
}}else{if(a.name=="k_key_omnibox"){if(TS.model.prefs.k_key_omnibox!=a.value){TS.model.prefs.k_key_omnibox=a.value;
TS.prefs.k_key_omnibox_changed_sig.dispatch()
}}else{TS.model.prefs[a.name]=a.value
}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}},hex_regex:new RegExp(/^#?([0-9a-f]{6})$/i),setSidebarThemeCustomValues:function(b){var c=false;
if(b&&typeof b==="object"&&b.length===undefined){for(var a in b){c=false;
if(!b[a]){break
}if(!b[a].substr){break
}b[a]=b[a].substr(0,7);
if(!b[a].match(TS.prefs.hex_regex)){break
}c=true
}}if(c){TS.model.prefs.sidebar_theme_custom_values=JSON.stringify(b)
}else{TS.model.prefs.sidebar_theme="default";
TS.model.prefs.sidebar_theme_custom_values=JSON.stringify(TS.sidebar_themes.default_themes.default_theme)
}},setEmojiMode:function(){emoji.text_mode=TS.model.prefs.emoji_mode=="as_text";
emoji.do_emoticons=!!TS.model.prefs.graphic_emoticons;
emoji.allow_native=false;
emoji.use_sheet=(function(){if(!TS.model.prefs.ss_emojis){return false
}if(TS.boot_data.feature_reactions){return !!TS.boot_data.page_needs_custom_emoji
}return !!(TS.client||TS.web.service_icon)
})();
emoji.data["00a9"]=TS.utility.clone(emoji.unaltered_data["00a9"]);
emoji.data["00ae"]=TS.utility.clone(emoji.unaltered_data["00ae"]);
if(TS.model.prefs.emoji_mode=="google"){emoji.img_path="https://slack-assets2.s3-us-west-2.amazonaws.com/19692/img/emoji-hangouts-v2/";
emoji.sheet_path=cdn_url+"/f034/img/emoji_hangouts_64_indexed_256colors.png";
if(TS.model.mac_ssb_version>=0.44||window.winssb){emoji.sheet_path="slack-resources:emoji_hangouts_64_indexed_256colors.png"
}}else{if(TS.model.prefs.emoji_mode=="emojione"){emoji.img_path="https://slack-assets2.s3-us-west-2.amazonaws.com/26954/img/emoji-emojione/";
emoji.sheet_path=cdn_url+"/6757/img/emoji_emojione_64_indexed_256colors.png";
if(TS.model.mac_ssb_version>=0.64||window.winssb){emoji.sheet_path="slack-resources:emoji_emojione_64_indexed_256colors.png"
}}else{if(TS.model.prefs.emoji_mode=="twitter"){emoji.data["00a9"][4]=emoji.data["00a9"][5]=null;
emoji.data["00a9"][7]=cdn_url+"/3cfb/img/emoji-hangouts-v2/00a9.png";
emoji.data["00a9"][8]=true;
emoji.data["00ae"][4]=emoji.data["00ae"][5]=null;
emoji.data["00ae"][7]=cdn_url+"/3cfb/img/emoji-hangouts-v2/00ae.png";
emoji.data["00a9"][8]=true;
emoji.img_path="https://slack-assets2.s3-us-west-2.amazonaws.com/19166/img/emoji-twitter/";
emoji.sheet_path=cdn_url+"/db90/img/emoji_twitter_64_indexed_256colors.png";
if(TS.model.mac_ssb_version>=0.43||window.winssb){emoji.sheet_path="slack-resources:emoji_twitter_64_indexed_256colors.png"
}}else{emoji.img_path="https://slack-assets2.s3-us-west-2.amazonaws.com/5504/img/emoji/";
emoji.sheet_path=cdn_url+"/272a/img/emoji_apple_64_indexed_256colors.png";
if(TS.model.mac_ssb_version>=0.43||window.winssb){emoji.sheet_path="slack-resources:emoji_apple_64_indexed_256colors.png"
}}}}if(!TS.model.emoji_complex_customs){return
}for(var a in TS.model.emoji_complex_customs){if(!emoji.data[a]){continue
}emoji.data[a][7]=TS.model.emoji_complex_customs[a][TS.model.prefs.emoji_mode]||TS.model.emoji_complex_customs[a]["apple"]
}},setMultiPrefsByAPI:function(c,d){var e="";
for(var a in c){e+="&"+encodeURIComponent(a)+"="+encodeURIComponent(c[a])
}if(!e){TS.error(" no prefs to set?");
return
}var b={prefs:e};
TS.prefs.setPrefByAPI(b,d)
},setPrefByAPI:function(a,b){var c=function(f,g,d){if(!f){var i="args:"+JSON.stringify(d)+" ";
try{i+="data:"+JSON.stringify(g)
}catch(h){i+="data2:"+g
}TS.logError({message:"TS.prefs.setPrefByAPI call got a not ok rsp"},i);
setTimeout(function(){if(d.prefs){alert("multi preferences setting failed.")
}else{alert('"'+d.name+'" preference setting failed.')
}},0)
}if(b){b(f,g,d)
}};
TS.api.call("users.prefs.set",a,c)
},saveHighlightWords:function(e,g,c){var a=$.trim(e.replace(/\, /g,",")).split(",");
var f=[];
for(var b=0;
b<a.length;
b++){if(a[b]){f.push(a[b])
}}var d=f.join(",");
if(c||TS.model.prefs.highlight_words!=d){TS.prefs.setPrefByAPI({name:"highlight_words",value:d},g)
}},getReadStateTrackingPref:function(){var a="default";
if(TS.model.prefs.mark_msgs_read_immediately&&TS.model.prefs.start_scroll_at_oldest){a="immediate_scroll"
}else{if(TS.model.prefs.mark_msgs_read_immediately){a="immediate"
}}return a
},setReadStateTrackingPref:function(c,b){var a={};
if(c=="immediate_scroll"||c=="immediate"){a.mark_msgs_read_immediately=true;
TS.model.prefs.mark_msgs_read_immediately=true;
if(c=="immediate_scroll"){a.start_scroll_at_oldest=true;
TS.model.prefs.start_scroll_at_oldest=true
}else{a.start_scroll_at_oldest=false;
TS.model.prefs.start_scroll_at_oldest=false
}}else{a.mark_msgs_read_immediately=false;
TS.model.prefs.mark_msgs_read_immediately=false;
a.start_scroll_at_oldest=false;
TS.model.prefs.start_scroll_at_oldest=false
}TS.prefs.setMultiPrefsByAPI(a,b)
}})
})();
(function(){TS.registerModule("search",{search_dispatched_sig:new signals.Signal(),quick_search_results_fetched_sig:new signals.Signal(),all_search_results_fetched_sig:new signals.Signal(),message_search_results_fetched_sig:new signals.Signal(),file_search_results_fetched_sig:new signals.Signal(),autosuggest_search_results_fetched_sig:new signals.Signal(),search_filter_set_sig:new signals.Signal(),search_filetype_filter_set_sig:new signals.Signal(),search_sort_set_sig:new signals.Signal(),search_channel_set_sig:new signals.Signal(),search_group_set_sig:new signals.Signal(),search_member_set_sig:new signals.Signal(),message_search_more_results_fetched_sig:new signals.Signal(),query:"",query_string:"",last_search_query:"",previous_query:"",sort:"timestamp",filter:"messages",filetype:"all",results:{},submit_tim:0,delay:500,suggestions:[],input:"",from_regex:/from:[@*\-.\w]+/gi,member:null,from:null,in_regex:/in:[#*\-.\w]+/gi,channel:null,group:null,im:null,per_page:-1,keyword_modifiers:["after","before","bot","during","from","to","has","in","on"],keyword_modifier_pair_regex:null,keyword_modifier_extract_regex:null,search_query_max_length:250,onStart:function(){TS.search.keyword_modifier_pair_regex=new RegExp("^("+TS.search.keyword_modifiers.join("|")+"):S+$");
TS.search.keyword_modifier_extract_regex=new RegExp("^("+TS.search.keyword_modifiers.join("|")+"):w*");
TS.search.per_page=parseInt(TS.qs_args.search_count)||20;
if(TS.client){TS.search.delay=10
}if(TS.client){TS.client.login_sig.add(TS.search.loggedIn,TS.search)
}else{if(TS.web){TS.web.login_sig.add(TS.search.loggedIn,TS.search)
}}TS.search.search_channel_set_sig.add(TS.search.searchAll,TS.search);
TS.search.search_group_set_sig.add(TS.search.searchAll,TS.search);
TS.search.search_member_set_sig.add(TS.search.searchAll,TS.search);
TS.prefs.search_only_my_channels_changed_sig.add(TS.search.searchAll,TS.search);
TS.prefs.search_exclude_bots_changed_sig.add(TS.search.searchAll,TS.search);
if(TS.qs_args.delay){TS.search.delay=TS.qs_args.delay
}TS.search.input=$("#search_terms")
},loggedIn:function(){var f=TS.model.prefs.search_sort;
TS.search.sort=(f=="score"||f=="timestamp")?f:TS.search.sort
},startSearchTimer:function(g,f,h){clearTimeout(TS.search.submit_tim);
TS.search.submit_tim=setTimeout(TS.search.dispatchSearch,TS.search.delay,g,f,h);
TS.search.search_dispatched_sig.dispatch()
},getNextPageOfSearchResults:function(g,f){TS.search.dispatchSearch(g,TS.search.per_page,TS.search.onSearchAll,f)
},getNextPageOfMessageResults:function(h,g){var f=a(h,TS.search.per_page,g);
TS.search.searchTiming('"'+h+'" search.messages');
TS.api.call("search.messages",f,d)
},getNextPageOfFileResults:function(h,g){var f=a(h,TS.search.per_page,g);
TS.search.searchTiming('"'+h+'" search.files');
TS.api.call("search.files",f,e)
},extractNonModifierSearchTxt:function(g){var h="";
var f=g.split(" ");
f.forEach(function(i){if(i.match(TS.search.keyword_modifier_extract_regex)){return
}h+=" "+i
});
h=$.trim(h);
return h
},dispatchSearch:function(i,g,l,h){var f=a(i,g,h);
if(!h||h==1){var k=TS.search.extractNonModifierSearchTxt(i);
if(k){TSSSB.call("writeFindString",k)
}}if(TS.search.separateMessagesAndFiles()){if(!h||h==1){TS.search.results[i]=null
}var j=c();
TS.api.call("search.messages",f,j.msgs);
TS.api.call("search.files",f,j.files);
TS.search.searchTiming('"'+i+'" search.messages');
TS.search.searchTiming('"'+i+'" search.files')
}else{TS.api.call("search.all",f,l)
}},setFilter:function(f){TS.search.filter=f;
TS.search.search_filter_set_sig.dispatch()
},setFiletypeFilter:function(f){TS.search.filetype=f;
TS.search.search_filetype_filter_set_sig.dispatch()
},setSort:function(f){if(TS.search.sort==f){return
}$(".search_toggle").toggleClass("active");
TS.search.sort=f;
TS.search.search_sort_set_sig.dispatch();
TS.prefs.setPrefByAPI({name:"search_sort",value:(f=="score"?"score":"timestamp")})
},setChannel:function(g){var f=TS.channels.getChannelById(g);
if(f){TS.search.channel=f;
TS.search.group=null;
TS.search.im=null
}else{TS.search.channel=null
}TS.search.search_channel_set_sig.dispatch()
},setGroup:function(g){var f=TS.groups.getGroupById(g);
if(f){TS.search.group=f;
TS.search.channel=null;
TS.search.im=null
}else{TS.search.group=null
}TS.search.search_group_set_sig.dispatch()
},setMember:function(i){var h=TS.members.getMemberById(i);
if(h){TS.search.member=h
}else{TS.search.member=null;
TS.search.from=null;
var f=$.trim(TS.search.input.val());
var g=f.match(TS.search.from_regex);
if(g){$.each(g,function(k,j){f=$.trim(f.replace(j,""))
});
TS.search.input.val(f)
}}TS.search.search_member_set_sig.dispatch()
},buildQueryString:function(i,h){var g=i.match(TS.search.from_regex);
if(g){var k=false;
$.each(g,function(n,m){if(k){i=$.trim(i.replace(m,""))
}else{var l=m.replace("from:","");
if(l.toLowerCase()=="me"){if(h){TS.search.member=TS.model.user
}TS.search.from=null;
k=true
}else{var o=TS.members.getMemberByName(l);
if(o){if(h){TS.search.member=o
}TS.search.from=null;
k=true
}else{if(h){TS.search.from=l;
TS.search.member=null
}else{if(TS.search.member){TS.search.from=null
}}k=true
}}if(k){i=$.trim(i.replace(m,""))
}}})
}else{if(!TS.search.view.advanced_options&&TS.search.filter=="messages"){TS.search.member=null;
TS.search.from=null
}}var f=i.match(TS.search.in_regex);
if(f){var j=false;
$.each(f,function(o,n){if(j){i=$.trim(i.replace(n,""))
}else{var m=n.replace("in:","");
var p=TS.channels.getChannelByName(m);
var q=TS.groups.getGroupByName(m);
var l=TS.ims.getImByUsername(m);
if(p){j=true;
if(h){TS.search.channel=p;
TS.search.group=null;
TS.search.im=null
}}else{if(q){j=true;
if(h){TS.search.group=q;
TS.search.channel=null;
TS.search.im=null
}}else{if(l){j=true;
if(h){TS.search.im=l;
TS.search.channel=null;
TS.search.group=null
}}else{TS.info("Unable to filter search results by channel, group, or IM named '"+m+"'")
}}}j=true
}if(j){i=$.trim(i.replace(n,""))
}})
}else{if(!TS.search.view.advanced_options){TS.search.channel=null;
TS.search.group=null;
TS.search.im=null
}}if(!g){if(TS.search.previous_query==TS.search.query&&h){TS.search.member=null;
TS.search.from=null
}}if(!f){if(TS.search.previous_query==TS.search.query&&h){TS.search.channel=null;
TS.search.group=null;
TS.search.im=null
}}TS.search.query=$.trim(i);
TS.search.query_string=TS.search.query;
if(TS.search.member!==null){TS.search.query_string+=" from:"+TS.search.member.name
}if(TS.search.from!==null){TS.search.query_string+=" from:"+TS.search.from
}if(TS.search.channel!==null){TS.search.query_string+=" in:"+TS.search.channel.name
}if(TS.search.group!==null){TS.search.query_string+=" in:"+TS.search.group.name
}if(TS.search.im!==null){TS.search.query_string+=" in:"+TS.search.im.name
}TS.search.query_string=$.trim(TS.search.query_string)
},quickSearch:function(g){TS.search.query=g;
TS.search.buildQueryString(g);
var f=5;
TS.search.startSearchTimer(g,f,TS.search.onQuickSearch)
},onQuickSearch:function(g,h,f){if(!g){return
}TS.search.quick_search_results_fetched_sig.dispatch(h)
},searchAll:function(g){if(!TS.client){clearTimeout(TS.search.widget.key_tim)
}var f;
TS.search.previous_query=TS.search.query;
if(g){TS.search.query=g;
f=true
}else{TS.search.query=$.trim(TS.search.input.val());
if(TS.search.previous_query==g){f=true
}else{f=false
}}TS.search.query=$.trim(TS.search.query);
TS.search.query_string=TS.search.query;
if(TS.search.query_string){TS.search.startSearchTimer(TS.search.query_string,TS.search.per_page,TS.search.onSearchAll)
}else{TS.search.view.updateOptions();
if(TS.client){TS.search.autocomplete.stopSpinner()
}else{TS.search.widget.stopSpinner()
}}},onSearchAll:function(g,i,f){if(TS.qs_args.force_search_fail=="1"){window.failed_once=true;
g=false;
i={ok:false,error:"solr_failed"}
}if(!g){var j=(i&&i.error)?i.error:"unknown_error";
if(!i){i={ok:false,error:j}
}i.query=i.query||f.query;
i.messages=i.messages||{total:0,paging:{count:TS.search.per_page,total:0,page:1,pages:0},matches:[]};
i.files=i.files||{total:0,paging:{count:TS.search.per_page,total:0,page:1,pages:0},matches:[]}
}if(f.query!=TS.search.query_string){if(!TS.search.results[f.query]||!TS.search.results[f.query].error){return
}}TS.search.last_search_query=f.query;
if(TS.client){TS.search.upsertFiles(i)
}TS.search.expandChannelsAndCheckForMsgsInModel(i);
if(f.page==1){TS.search.results[f.query]=i;
TS.search.results[f.query]["_time_of_search"]=TS.utility.date.getTimeStamp();
TS.search.all_search_results_fetched_sig.dispatch(i,f);
TS.search.getNextPageOfSearchResults(f.query,2)
}else{var h=TS.search.results[f.query];
if(h.messages.matches){i.messages.matches=h.messages.matches.concat(i.messages.matches)
}if(h.files.matches){i.files.matches=h.files.matches.concat(i.files.matches)
}TS.search.results[f.query]=i;
TS.search.all_search_results_fetched_sig.dispatch(i,f)
}},searchSuggest:function(f){TS.api.call("search.autocomplete",{query:f},TS.search.onSearchSuggest)
},onSearchSuggest:function(g,h,f){if(!TS.client){if(TS.search.widget.suppress_suggestions){TS.search.widget.suppress_suggestions=false;
return
}}if(!g){return
}TS.search.suggestions=[];
if(h.suggestions[0]==TS.search.query&&h.suggestions.length==1){TS.search.suggestions=[]
}else{$.each(h.suggestions,function(j,k){TS.search.suggestions[j]={value:k,highlighted:TS.search.highlightSuggestion(TS.utility.htmlEntities(k))}
})
}TS.search.autosuggest_search_results_fetched_sig.dispatch(h,f)
},highlightSuggestion:function(g){var f=g.replace(new RegExp("("+TS.utility.preg_quote(TS.search.input.val())+")","gi"),"<b>$1</b>");
return f
},expandChannelsAndCheckForMsgsInModel:function(j){var g;
var f;
if(!j.messages||!j.messages.matches){return
}var k;
for(var h=0;
h<j.messages.matches.length;
h++){g=j.messages.matches[h];
if(!g){continue
}TS.utility.msgs.processAttachments(g.attachments);
if(g.next){TS.utility.msgs.processAttachments(g.next.attachments)
}if(g.next_2){TS.utility.msgs.processAttachments(g.next_2.attachments)
}if(g.previous){TS.utility.msgs.processAttachments(g.previous.attachments)
}if(g.previous_2){TS.utility.msgs.processAttachments(g.previous_2.attachments)
}if(TS.boot_data.feature_reactions){g._rxn_key=TS.rxns.getRxnKey("message",g.ts,g.channel.id);
k=TS.rxns.getExistingRxnsByKey(g._rxn_key);
if(k&&!g.reactions){TS.warn("msg:"+g.ts+" has reactions in local model, but we got an object in search results that does NOT have reactions, which seems suspicious")
}else{TS.rxns.upsertRxnsFromDataAndUpdateUI(g._rxn_key,g.reactions)
}}f=TS.shared.getModelObById(g.channel.id);
if(f){if(f.msgs){g.is_loaded=!!TS.utility.msgs.getMsg(g.ts,f.msgs)
}else{if(TS.client){TS.warn(f.name+" has no msgs")
}}g.channel=f;
if(!g.permalink){g.permalink=TS.utility.msgs.constructMsgPermalink(f,g.ts)
}}}},upsertFiles:function(g){if(!g.files||!g.files.matches){return
}for(var f=0;
f<g.files.matches.length;
f++){if(g.files.matches[f].preview){g.files.matches[f].preview_search=g.files.matches[f].preview;
delete g.files.matches[f].preview
}g.files.matches[f]=TS.files.upsertFile(g.files.matches[f]).file
}},getResultsByQuery:function(f){return TS.search.results[f]
},getMatchByQueryAndTs:function(g,f){return TS.search.getMatchByQueryByThings(g,f)
},getMatchByQueryAndChannelAndTs:function(h,f,g){return TS.search.getMatchByQueryByThings(h,g,f)
},getMatchByQueryByThings:function(i,h,f){var g=TS.search.getResultsByQuery(i);
if(!g){TS.error("WTF no results?");
return null
}return TS.search.getMatchFromResultsByThings(false,g,h,f)
},getMatchFromResultsByThings:function(l,j,k,f){if(!j){TS.error("WTF no results?");
return null
}if(!j.messages){TS.error("WTF no results.messages?");
return null
}if(!j.messages.matches){TS.error("WTF no results.messages.matches?");
return null
}var g;
for(var h=0;
h<j.messages.matches.length;
h++){g=j.messages.matches[h];
if(!g){TS.error("WTF no match?");
continue
}if((!f||g.channel.id==f)&&g.ts==k){if(l){return{match:g,index:h}
}else{return g
}}}return null
},truncateQuery:function(f){if(f.length>TS.search.search_query_max_length){return f.substring(0,TS.search.search_query_max_length)
}return f
},resetSearchOptions:function(){TS.search.channel=null;
TS.search.group=null;
TS.search.im=null;
TS.search.member=null;
TS.search.from=null;
TS.search.searchAll()
},saveSearch:function(f,g){if(!f.terms){return
}f.terms=$.trim(f.terms);
if(TS.search.keyword_modifier_pair_regex.test(f.terms)){return
}TS.api.call("search.save",f,g)
},separateMessagesAndFiles:function(){return !!TS.client
},searchTiming:function(h){if(TS.model.team.domain!=="tinyspeck"){return
}if(b[h]){var f=Date.now();
var g=b[h];
b[h]=null;
TS.info(h+" took "+(f-g)+" ms")
}else{b[h]=Date.now()
}},setInputVal:function(f){TS.search.input.val(f).focus()
},appendToInputAndSelect:function(f){var g=TS.search.input.val();
if(g&&!/\s$/.test(g)){g+=" "
}TS.search.input.val(g+f);
TS.search.input.textrange("set",g.length,g.length+f.length)
},submitSearch:function(){TS.search.input.closest("form").trigger("submit")
}});
var b={};
var a=function(i,g,h){var f={query:i,highlight:true,count:g,types:[TS.search.filetype],sort:TS.search.sort,no_posts:1,more_matches:true,page:h||1,include_attachments:!!TS.boot_data.feature_search_attachments,extracts:1,extra_message_data:1,max_extract_len:150,highlight_attachments:1};
return f
};
var d=function(g,i,f){TS.search.searchTiming('"'+f.query+'" search.messages');
if(TS.search.filter=="messages"){TS.search.searchTiming('"'+TS.search.query_string+'" render results')
}if(!g){var j=(i&&i.error)?i.error:"unknown_error";
if(!i){i={ok:false,error:j}
}i.query=i.query||f.query;
i.messages=i.messages||{total:0,paging:{count:TS.search.per_page,total:0,page:1,pages:0},matches:[]}
}if(f.query!=TS.search.query_string){if(!TS.search.results[f.query]||!TS.search.results[f.query].error){return
}}if(TS.search.last_search_query!==f.query){delete TS.search.results[TS.search.last_search_query]
}TS.search.last_search_query=f.query;
TS.search.expandChannelsAndCheckForMsgsInModel(i);
var h=TS.search.results[f.query];
if(f.page==1){if(!h){TS.search.results[f.query]=i;
h=i
}else{$.extend(h,i)
}h.initial_messages_total=i.messages.total;
h._time_of_search=TS.utility.date.getTimeStamp();
TS.search.message_search_results_fetched_sig.dispatch(h,f)
}else{if(h.messages&&h.messages.matches){i.messages.matches=h.messages.matches.concat(i.messages.matches)
}$.extend(h,i);
TS.search.message_search_results_fetched_sig.dispatch(h,f)
}if(TS.search.filter=="messages"){TS.search.searchTiming('"'+TS.search.query_string+'" render results')
}};
var e=function(g,i,f){TS.search.searchTiming('"'+f.query+'" search.files');
if(TS.search.filter=="files"){TS.search.searchTiming('"'+TS.search.query_string+'" render results')
}if(!g){var j=(i&&i.error)?i.error:"unknown_error";
if(!i){i={ok:false,error:j}
}i.query=i.query||f.query;
i.files=i.files||{total:0,paging:{count:TS.search.per_page,total:0,page:1,pages:0},matches:[]}
}if(f.query!=TS.search.query_string){if(!TS.search.results[f.query]||!TS.search.results[f.query].error){return
}}if(TS.search.last_search_query!==f.query){delete TS.search.results[TS.search.last_search_query]
}TS.search.last_search_query=f.query;
if(TS.client){TS.search.upsertFiles(i)
}var h=TS.search.results[f.query];
if(f.page==1){if(!h){TS.search.results[f.query]=i;
h=i
}else{$.extend(h,i)
}h.initial_files_total=i.files.total;
h._time_of_search=TS.utility.date.getTimeStamp();
TS.search.file_search_results_fetched_sig.dispatch(h,f)
}else{if(h.files&&h.files.matches){i.files.matches=h.files.matches.concat(i.files.matches)
}$.extend(h,i);
TS.search.file_search_results_fetched_sig.dispatch(h,f)
}if(TS.search.filter=="files"){TS.search.searchTiming('"'+TS.search.query_string+'" render results')
}};
var c=function(){var g=false;
var f=false;
var h=function(){if(g&&f){TS.search.all_search_results_fetched_sig.dispatch()
}};
return{msgs:function(){g=true;
d.apply(this,arguments);
h()
},files:function(){f=true;
e.apply(this,arguments);
h()
}}
}
})();
(function(){TS.registerModule("ms",{last_pong_time:0,sent_map:{},connected_sig:new signals.Signal(),disconnected_sig:new signals.Signal(),trouble_sig:new signals.Signal(),reconnecting_sig:new signals.Signal(),pong_sig:new signals.Signal(),on_msg_sig:new signals.Signal(),reconnect_requested_sig:new signals.Signal(),onStart:function(){if(TS.web){p=c
}i(TS.model.ui.is_window_focused||false);
TS.ui.window_focus_changed_sig.add(i);
setInterval(function(){if(!TS.model.ms_connected){return
}if(TS.model.rtm_start_throttler<1){return
}TS.model.rtm_start_throttler--
},1000*60)
},send:function(M,K,L){M.id=++I;
TS.ms.sent_map[M.id.toString()]={msg:M,handler:K,ts:TS.utility.date.getTimeStamp(),temp_ts:L};
if(M.type=="ping"||M.type=="pong"){TS.log(3,"sending "+M.type);
TS.dir(3,M)
}else{TS.model.last_net_send=TS.utility.date.getTimeStamp();
TS.log(2,"sending "+M.type);
TS.dir(2,M)
}t.send(JSON.stringify(M));
return M.id
},sendTyping:function(K){var L='{"type":"typing", "channel":"'+K+'"}';
t.send(L)
},handleMsg:function(K){var N=K.reply_to&&!("ok" in K)&&K.type=="message";
if(N){}var L;
if(K.reply_to){if(K.reply_to.toString() in TS.ms.sent_map){L=TS.ms.sent_map[K.reply_to];
K.SENT_MSG=L.msg;
delete TS.ms.sent_map[K.reply_to]
}else{if(!N){TS.error('received msg "'+K.reply_to+'" with type "'+K.type+'" but we have no record of it in sent_map')
}}}else{if(K.event_ts&&!K._from_evt_log){TS.ms.storeLastEventTS(K.event_ts)
}}if(K.type=="ping"||K.type=="pong"){TS.log(3,"msg "+K.type+" time: "+(TS.utility.date.getTimeStamp()-L.ts)+"ms");
TS.ms.last_pong_time=TS.utility.date.getTimeStamp();
TS.ms.pong_sig.dispatch();
TS.dir(3,K)
}else{if(L){var M=K.type?K.type:(K.SENT_MSG.type)?K.SENT_MSG.type:"";
TS.log(2,"msg "+((M)?'"'+M+'" ':"")+"rsp time "+(TS.utility.date.getTimeStamp()-L.ts)+"ms")
}else{TS.log(2,'msg "'+K.type+'"')
}TS.dir(2,K)
}if(K.type=="error"){B(K)
}else{if(K.type=="hello"){g()
}else{if(!K.reply_to){TS.ms.on_msg_sig.dispatch(K)
}}}if(L){if(!K.ok){K.error=K.error||{code:0,msg:"unknown error (not specified by MS)"}
}if(N){K.ok=true
}if(L.handler){L.handler(K.ok,K)
}}},storeLastEventTS:function(L){if(!L){return
}var K=TS.storage.fetchLastEventTS();
if(K&&L<=K){return
}TS.storage.storeLastEventTS(L)
},onFailure:function(M){TS.warn("TS.ms.onFailure reason_str:"+M);
if(M){a("You got disconnected and are on team Tiny Speck, so here are some details:\n>>>"+M)
}e=false;
d();
if(TS.model.ms_connected){TS.info("Disconnected from MS, TS.model.rtm_start_throttler:"+TS.model.rtm_start_throttler);
TS.ms.logConnectionFlow("on_connected_failure");
TS.model.ms_reconnect_ms=100;
TS.ms.disconnect()
}else{TS.ms.logConnectionFlow("on_notconnected_failure");
var L=TS.model.ms_reconnect_ms=((TS.model.ms_reconnect_ms+1000)*1.3);
if(TS.model.ms_reconnect_ms>4000){TS.model.ms_reconnect_ms=TS.utility.randomInt(L,L+(L/3))
}TS.model.ms_reconnect_ms=Math.min(TS.model.ms_reconnect_ms,300000)
}if(TS.model.rtm_start_throttler>5){var K=2000*TS.model.rtm_start_throttler;
if(TS.model.ms_reconnect_ms<K){TS.info("because TS.model.rtm_start_throttler:"+TS.model.rtm_start_throttler+" we are increasing time until next login call");
TS.model.ms_reconnect_ms=K
}}if(TS.model.ms_connected){TS.model.ms_connected=false;
TS.ms.disconnected_sig.dispatch()
}TS.model.ms_connected=false;
clearInterval(u);
if(TS.model.ms_asleep){TS.warn("NOT doing startReconnection(), we are asleep");
return
}TS.ms.startReconnection()
},startReconnection:function(){TS.model.ms_reconnect_time=TS.utility.date.getTimeStamp()+TS.model.ms_reconnect_ms;
TS.info("Attempting to reconnect in "+TS.model.ms_reconnect_ms+"ms");
clearInterval(q);
q=setInterval(D,k);
D();
clearTimeout(b);
b=setTimeout(function(){if(!TS.model.window_unloading){TS.ms.reconnect_requested_sig.dispatch()
}},TS.model.ms_reconnect_ms)
},manualReconnectNow:function(){TS.ms.logConnectionFlow("manual_reconnect");
clearTimeout(b);
clearInterval(q);
clearTimeout(G);
J=0;
if(!TS.model.window_unloading){TS.ms.reconnect_requested_sig.dispatch();
TS.ms.reconnecting_sig.dispatch(0)
}},disconnect:function(){if(t&&TS.model.ms_connected){TS.ms.logConnectionFlow("disconnect");
t.close()
}else{TS.warn("TS.ms.disconnect called, but _websocket="+t+" TS.model.ms_connected="+TS.model.ms_connected)
}},logConnectionFlow:function(K){var L=TS.model.ms_conn_log;
var M=TS.utility.date.getTimeStamp();
L.push({name:K,time:M,delta:(L.length)?M-L[L.length-1].time:0});
TS.log(2,"logConnectionFlow "+K+" "+L[L.length-1].delta)
},getConnectionFlowLog:function(O){var N=TS.model.ms_conn_log;
var K=[];
for(var L=0;
L<N.length;
L++){K.push(encodeURIComponent(N[L].name+"-"+(N[L].delta?Math.round(N[L].delta/1000):0)+"-"+Math.round(N[L].time/1000)))
}TS.dir(2,TS.model.ms_conn_log);
var M=K.join("&");
if(O&&M.length>O){M=M.substr(0,O)
}return M
},connect:function(){TS.logLoad("TS.ms.connect "+TS.model.team.url);
if(!window.WebSocket){window.WebSocket=window.MozWebSocket
}if(window.WebSocket){var L;
try{TS.ms.logConnectionFlow("connect");
L=TS.model.team.url;
var O=2000-L.length;
var M=TS.ms.getConnectionFlowLog(O);
var N=(TS.qs_args.simulate_old_token==1)?"&TRIGGER_OLD_TOKEN=1":"";
L+="?version_uid="+TS.boot_data.version_uid+N+"&"+M;
TS.info("Connecting to: "+L);
if(TS.qs_args.simulate_first_connect_failure==1&&!window.already_simulated_first_connect_failure){L=L.replace("e","w");
TS.info("simulate_first_connect_failure url:"+L);
window.already_simulated_first_connect_failure=true
}y=(window.WEB_SOCKET_USING_FLASH)?E:w;
clearTimeout(G);
G=setTimeout(C,y);
TS.ms.last_url=L;
TS.ms.last_start_ms=new Date().getTime();
d();
t=new WebSocket(L)
}catch(K){TS.warn("failed to create new WebSocket");
TS.error(K);
TS.ms.onFailure("failed to create new WebSocket");
return
}TS.model.ms_connecting=true;
if(TS.qs_args.simulate_first_connect_timeout==1&&J<1){TS.info("simulate_first_connect_timeout url:"+L)
}else{t.onopen=F
}t.onclose=v;
t.onerror=A
}else{alert("Your browser does not support Web Sockets.")
}}});
var u=0;
var p=3000;
var c=10000;
var G=0;
var y=0;
var w=10000;
var E=20000;
var h=0;
var o=10000;
var z=0;
var x=5000;
var q=0;
var k=1000;
var b=0;
var t=null;
var I=0;
var e=false;
var n=0;
var l=300000;
var J=0;
var m=null;
var j=400;
var i=function(K){if(K){n=10000
}else{n=60000
}n+=p;
TS.log(3,"_pong_timeout_ms set to:"+n+" has_focus:"+K)
};
var f=function(L){var K=JSON.parse(L.data);
TS.ms.handleMsg(K)
};
var F=function(K){clearTimeout(G);
J=0;
if(TS.qs_args.simulate_hello_timeout==1&&!window.already_simulated_hello_timeout){TS.info("simulate_hello_timeout");
window.already_simulated_hello_timeout=true
}else{t.onmessage=f
}TS.model.ms_conn_log.length=0;
TS.logLoad("_onConnect (took "+(new Date().getTime()-TS.ms.last_start_ms)+"ms)");
TS.info("MS WS connected!");
TS.ms.logConnectionFlow("on_connect");
clearTimeout(h);
h=setTimeout(H,o)
};
var s=function(U,R,T){if(!U){TS.error("_onEventLog "+R);
if(TS.client&&R&&R.error=="timestamp_too_old"){TS.storage.cleanOutMsgStorageAndReset();
var L="TS.reload() after a TS.storage.cleanOutMsgStorageAndReset() because data.error: <code>timestamp_too_old</code>";
if(R.reason){L+=" data.reason: <code>"+R.reason+"</code>"
}if(T){delete T.token
}try{L+=" args: <pre>"+JSON.stringify(T,null,"\t")+"</pre>"
}catch(N){}L+="<p><b>Tell eric about this, please!</b></p>";
setTimeout(TS.reload,1,null,L)
}return
}if(!R.events){TS.error("_onEventLog missing events");
return
}var P=1000;
if(TS.client&&R.total>P){TS.storage.cleanOutMsgStorageAndReset();
TS.info("going to call TS.reload() after a TS.storage.cleanOutMsgStorageAndReset() because data.total > "+P+")");
setTimeout(TS.reload,1,null,"TS.reload() after a TS.storage.cleanOutMsgStorageAndReset() because data.total > "+P+")");
return
}var M;
var W;
var O=[];
var V={};
var K;
var Q;
for(Q=R.events.length-1;
Q>-1;
Q--){W=R.events[Q];
W._from_evt_log=true;
K=null;
M=M||W.event_ts;
if(W.type=="file_change"&&W.file&&W.file.id){K=W.type+W.file.id
}else{if(W.type=="user_change"&&W.user&&W.user.id){K=W.type+W.user.id
}else{if(W.type=="emoji_changed"){K=W.type
}else{if(W.type=="channel_history_changed"&&W.channel){K=W.type+W.channel
}else{if(W.type=="group_history_changed"&&W.channel){K=W.type+W.channel
}else{if(W.type=="im_history_changed"&&W.channel){K=W.type+W.channel
}}}}}}if(K){if(V[K]){continue
}V[K]=true;
O.unshift(W)
}else{if(W.type=="slack_broadcast"){if(!W.reload){continue
}var X=m;
if(X){if(!X.force_reload&&W.force_reload){m=W
}}else{m=W
}}else{O.unshift(W)
}}}for(Q=0;
Q<O.length;
Q++){W=O[Q];
try{TS.ms.handleMsg(W)
}catch(S){}}if(R.has_more){if(!R.events.length){TS.error(" WTF data.events.length==0 and data.has_more:true ??????")
}else{TS.api.call("eventlog.history",{start:M,count:j},s)
}}else{if(M){TS.ms.storeLastEventTS(M)
}if(m){try{TS.ms.handleMsg(m)
}catch(S){}m=null
}}};
var r=function(){if(e){var L=TS.utility.date.getTimeStamp()-TS.ms.last_pong_time;
TS.log(3,"since_last_pong_ms:"+L+" pong_timeout_ms:"+n);
if(L>n){TS.warn("since_last_pong_ms too long! "+L+" > "+n);
TS.warn("calling disconnect(), expect to get an onDisconnect() callback");
TS.ms.logConnectionFlow("on_ping_timeout");
TS.ms.trouble_sig.dispatch();
e=false;
a("You are on team Tiny Speck, so here are some pong details:\n>>>since_last_pong_ms too long! "+L+" > "+n+" ... calling disconnect(), expect to get an onDisconnect() callback");
try{TS.ms.disconnect();
clearTimeout(z);
z=setTimeout(function(){TS.info("called disconnect, no onDisconnect callback happened in "+x+"ms, so calling _onDisconnect() manually now");
v(null,"since_last_pong_ms too long! then called disconnect, but no onDisconnect callback happened in "+x+"ms, so calling _onDisconnect() manually now")
},x)
}catch(K){TS.info("since_last_pong_ms too long! then an error calling disconnect, going to assume it is because it is already closed, calling _onDisconnect() manually now");
TS.warn(K);
v(null,"error calling disconnect, going to assume it is because it is already closed, calling _onDisconnect() manually now")
}return
}}TS.ms.send({type:"ping",ping_interv_ms:p,client_time:Date.now()})
};
var v=function(L,K){K=K||"_onDisconnect called with event:"+L;
TS.info("MS WS disconnected");
TS.ms.logConnectionFlow("on_disconnect");
clearTimeout(z);
clearTimeout(h);
clearTimeout(G);
if(L){TS.info("_onDisconnect event.code:"+L.code);
if(L.code=="1006"&&false){TS.generic_dialog.start({title:"Connection trouble error #1006",body:"Apologies, we're having some trouble with your connection. The particular error code indicates that restarting the application might fix it.",show_cancel_button:false,show_go_button:true,go_button_text:"OK",esc_for_ok:true})
}}else{TS.info("no event")
}TS.ms.onFailure(K)
};
var a=function(K){return
};
var d=function(){if(!t){return
}t.onmessage=null;
t.onopen=null;
t.onerror=null;
t.onclose=null;
try{t.close()
}catch(L){}if(false){var K=t;
t.onclose=function(M){TS.ms.logConnectionFlow("old_socket_closed");
if(!TS.model.ms_connected&&!TS.model.ms_connecting){TS.warn("Our last socket just fired a close event, and we are not yet connected or connecting again, so let us jump start the connection process with manualReconnectNow()");
TS.ms.manualReconnectNow()
}K.onclose=null
}
}};
var D=function(){var K=TS.model.ms_reconnect_time-TS.utility.date.getTimeStamp();
var L=Math.round(K/1000);
if(L>=0){TS.ms.reconnecting_sig.dispatch(L)
}if(TS.model.window_unloading){clearInterval(q)
}};
var H=function(){var K="socket received no hello msg "+o+"ms after connection";
TS.warn(K);
TS.ms.logConnectionFlow("_onHelloTimeout");
TS.ms.onFailure(K)
};
var C=function(){J++;
var K="socket not connected "+y+"ms after creation. _connect_timeout_count:"+J;
TS.warn(K);
TS.ms.logConnectionFlow("_onConnectTimeout");
if(J==3){TS.generic_dialog.start({title:"Connection trouble",body:"<p>Apologies, we're having some trouble with your web socket connection.</p>				<p>We've seen this problem clear up with a restart of "+(TS.model.is_our_app?"Slack":"your browser")+", 				a solution which we suggest to you now only with great regret and self loathing.</p>				",show_cancel_button:false,go_button_text:"OK",esc_for_ok:true});
return
}else{if(J==2){if(window.WEB_SOCKET_USING_FLASH){}else{if(TS.model.is_chrome){window.fallBackToFlashWebSockets();
setTimeout(function(){if(window.WEB_SOCKET_USING_FLASH_BUT_NO_FLASH||!document.getElementById("webSocketFlash")||!document.getElementById("webSocketFlash").receiveEvents){TS.generic_dialog.start({title:"Connection trouble",body:"<p>Apologies, we're having some trouble with your web socket connection. 							We tried falling back to Flash, but it appears you do not have a version of Flash installed that we can use.</p>							<p>But we've seen this problem clear up with a restart of "+(TS.model.is_our_app?"Slack":"your browser")+", 							a solution which we suggest to you now only with great regret and self loathing.</p>							",show_cancel_button:false,go_button_text:"OK",esc_for_ok:true})
}else{TS.ms.onFailure("3secs passed, waiting on Flash, no connection")
}},3000);
return
}}}}TS.ms.onFailure(K)
};
var A=function(K){var L="";
if(K){if(K.name){L+=" e.name="+K.name
}if(K.message){L+=" e.message="+K.message
}if(K.data){L+=" e.data="+K.data
}}TS.warn("_onError err_str: "+L);
TS.dir(0,K)
};
var B=function(K){if(K.error){if(K.error.code==1){TS.ms.logConnectionFlow("msg_error_code_1")
}else{TS.logError({message:"_onErrorMsg"},JSON.stringify(K));
TS.ms.onFailure("_onErrorMsg imsg.error:"+K.error)
}}else{TS.logError({message:"_onErrorMsg"},K?JSON.stringify(K):"no imsg?")
}};
var g=function(){clearTimeout(h);
TS.logLoad("_onHello (took "+(new Date().getTime()-TS.ms.last_start_ms)+"ms)");
var L=TS.utility.date.getTimeStamp()-TS.ms.last_pong_time;
TS.info("Hello msg recvd, since_last_pong_ms:"+L);
TS.ms.logConnectionFlow("on_hello");
if(TS.client&&L>l){TS.client.ui.maybePromptForSetActive()
}clearInterval(q);
e=true;
TS.ms.last_pong_time=TS.utility.date.getTimeStamp();
clearInterval(u);
u=setInterval(r,p);
TS.model.ms_connecting=false;
TS.model.ms_connected=true;
var K=TS.storage.fetchLastEventTS();
TS.info("calling eventlog.history with start:"+K+" (from TS.storage.fetchLastEventTS())");
if(K){TS.api.callImmediately("eventlog.history",{start:K,count:j},s)
}TS.ms.connected_sig.dispatch()
}
})();
(function(){TS.registerModule("ms.msg_handlers",{onStart:function(){TS.ms.on_msg_sig.add(TS.ms.msg_handlers.msgReceived)
},msgReceived:function(b){if(b.reply_to){return
}if(!TS.ms.msg_handlers[b.type]){return
}TS.ms.msg_handlers[b.type](b)
},message:function(c){if(!TS.client){return
}TS.log(2,"recved message "+c.type);
if(c.is_ephemeral&&!c.ts){c.ts=TS.utility.date.makeTsStamp()
}var f="subtype__"+c.subtype;
if(f in TS.ms.msg_handlers){if(TS.boot_data.feature_channel_eventlog_client){if(c.subtype=="message_changed"||c.subtype=="message_deleted"||c.subtype=="channel_history_changed"||c.subtype=="group_history_changed"||c.subtype=="im_history_changed"){c.type=c.subtype;
delete c.subtype;
TS.ms.msg_handlers[c.type](c);
return
}if(c.hidden){console.error("WE SHOULD NOT BE GETTING ANY HIDDEN MESSAGES ANYMORE");
console.dir(0,c)
}}TS.ms.msg_handlers[f](c)
}var d=TS.utility.msgs.processImsg(c,c.channel);
if(TS.ims.getImById(c.channel)){if(c.text=="start_profile_AAAAAA"){TS.model.profiling_keys=true
}else{if(c.text=="end_profile_AAAAAA"){TS.model.profiling_keys=false;
if(TS.model.profiling_key_times){TS.files.upload({text:JSON.stringify(TS.model.profiling_key_times,null,"\t"),title:"auto profile",filetype:"javascript",channels:[c.channel],initial_comment:""});
delete TS.model.profiling_key_times
}}}TS.ims.addMsg(c.channel,d)
}else{if(TS.groups.getGroupById(c.channel)){TS.groups.addMsg(c.channel,d)
}else{TS.channels.addMsg(c.channel,d)
}}var b=TS.ims.getImById(c.channel)||TS.groups.getGroupById(c.channel)||TS.channels.getChannelById(c.channel);
var e=TS.members.getMemberById(d.user);
if(TS.typing&&e&&b){TS.typing.memberEnded(b,e)
}},subtype__file_share:function(b){if(!b.file){return
}if(b.file.id==TS.files.polling_file_id){TS.files.uploadProcessingOver(true,b.file.id)
}},message_changed:function(b){TS.log(2,"recved message "+b.type);
TS.ms.msg_handlers.message_changed_worker(b)
},subtype__message_changed:function(b){TS.log(2,"recved subtype "+b.subtype);
if(TS.boot_data.feature_channel_eventlog_client){TS.warn("feature_channel_eventlog_client=1 so we should never be getting subtype "+b.subtype)
}TS.ms.msg_handlers.message_changed_worker(b)
},message_changed_worker:function(d){if(!d.message){TS.error("no message?");
return
}TS.mentions.replaceMsg(d.message);
var e=TS.channels.getChannelById(d.channel);
var f;
var c;
if(!e){c=TS.ims.getImById(d.channel)
}if(!e&&!c){f=TS.groups.getGroupById(d.channel)
}if(!c&&!e&&!f){TS.error("unknown imsg.channel:"+d.channel);
return
}if(TS.boot_data.feature_pins&&TS.pins){TS.pins.replaceMsg(d.message,c||e||f)
}if(d.message.imgs||TS.utility.msgs.hasImgs(d.message)){TS.model.show_inline_img_size_pref_reminder=true
}var b=true;
TS.utility.msgs.replaceMsg(c||e||f,d.message,b)
},message_deleted:function(b){TS.log(2,"recved message "+b.type);
TS.ms.msg_handlers.message_deleted_worker(b)
},subtype__message_deleted:function(b){TS.log(2,"recved subtype "+b.subtype);
if(TS.boot_data.feature_channel_eventlog_client){TS.warn("feature_channel_eventlog_client=1 so we should never be getting subtype "+b.subtype)
}TS.ms.msg_handlers.message_deleted_worker(b)
},message_deleted_worker:function(e){if(!e.deleted_ts){TS.error("no deleted_ts?");
return
}TS.mentions.removeMsg(e.deleted_ts);
var f=TS.channels.getChannelById(e.channel);
var c;
var g;
if(!f){c=TS.ims.getImById(e.channel)
}if(!f&&!c){g=TS.groups.getGroupById(e.channel)
}if(!c&&!f&&!g){TS.error("unknown imsg.channel:"+e.channel);
return
}var b=c||f||g;
if(TS.boot_data.feature_pins&&TS.pins){TS.pins.removeMsg(e.deleted_ts,b)
}var d=TS.utility.msgs.getMsg(e.deleted_ts,b.msgs);
if(!d&&b._archive_msgs){d=TS.utility.msgs.getMsg(e.deleted_ts,b._archive_msgs)
}if(!d){return
}if(c){TS.ims.removeMsg(b.id,d)
}else{if(f){TS.channels.removeMsg(b.id,d)
}else{if(g){TS.groups.removeMsg(b.id,d)
}}}},channel_left:function(b){TS.info("You left channel "+b.channel);
var c=TS.channels.getChannelById(b.channel);
if(!c){TS.error('unknown channel: "'+b.channel)
}c.is_member=false;
if(TS.model.active_channel_id==b.channel&&!c.was_archived_this_session){if(TS.client){TS.client.activeChannelDisplayGoneAway()
}}TS.channels.calcUnreadCnts(c,true);
TS.members.invalidateMembersUserCanSeeArrayCaches();
TS.channels.left_sig.dispatch(c)
},subtype__channel_leave:function(c){var b=c.user;
var f=TS.members.getMemberById(b);
if(!f){TS.error('unknown member: "'+b+'"');
return
}TS.info(f.name+" left channel "+c.channel);
var e=TS.channels.getChannelById(c.channel);
if(e){for(var d=0;
d<e.members.length;
d++){if(e.members[d]==f.id){e.members.splice(d,1);
TS.channels.calcActiveMembersForChannel(e);
break
}}}TS.members.invalidateMembersUserCanSeeArrayCaches();
TS.channels.member_left_sig.dispatch(e,f)
},channel_joined:function(b){TS.info("You joined channel "+b.channel.name);
var c=TS.channels.upsertChannel(b.channel);
TS.members.invalidateMembersUserCanSeeArrayCaches();
TS.channels.joined_sig.dispatch(c)
},channel_created:function(b){TS.info("created channel "+b.channel.name);
var c=TS.channels.upsertChannel(b.channel);
TS.channels.created_sig.dispatch(c);
if(!b._from_evt_log){TS.activity.maybeUpdateTeamActivity()
}},channel_deleted:function(b){var c=TS.channels.getChannelById(b.channel);
if(!c){TS.error('unknown channel: "'+b.channel);
return
}TS.info("deleted channel "+b.channel);
TS.channels.removeChannel(c)
},channel_archive:function(b){var c=TS.channels.getChannelById(b.channel);
if(!c){TS.error('unknown channel: "'+b.channel);
return
}if(c.is_archived){return
}TS.info("archived channel "+b.channel);
c.members.length=0;
TS.channels.calcActiveMembersForChannel(c);
c.is_archived=true;
if(!TS.model.user.is_restricted){if(c.is_member){c.was_archived_this_session=true
}}TS.channels.archived_sig.dispatch(c)
},channel_unarchive:function(b){var d=TS.channels.getChannelById(b.channel);
if(!d){TS.error('unknown channel: "'+b.channel);
return
}if(!d.is_archived){return
}TS.info("unarchived channel "+b.channel);
if(d.was_archived_this_session){var c=true;
TS.channels.join(d.name,null,c)
}d.is_archived=false;
d.was_archived_this_session=false;
TS.channels.unarchived_sig.dispatch(d)
},channel_rename:function(b){var c=TS.channels.getChannelById(b.channel.id);
if(!c){TS.error('unknown channel: "'+b.channel);
return
}TS.info("renamed channel "+b.channel.id+" to "+b.channel.name);
TS.channels.channelRenamed(b.channel)
},subtype__channel_join:function(c){var b=c.user;
var g=TS.members.getMemberById(b);
if(!g){TS.error('unknown member: "'+b+'"');
return
}TS.info(g.name+" joined channel "+c.channel);
var f=TS.channels.getChannelById(c.channel);
var d;
if(f){for(var e=0;
e<f.members.length;
e++){if(f.members[e]==g.id){d=f.members[e];
break
}}}if(!d){f.members.push(g.id);
TS.channels.calcActiveMembersForChannel(f)
}if(g.is_self&&c.inviter){f.needs_invited_message=true;
f.inviter=c.inviter
}TS.members.invalidateMembersUserCanSeeArrayCaches();
TS.channels.member_joined_sig.dispatch(f,g)
},channel_marked:function(b){if(!TS.client){return
}var c=TS.channels.getChannelById(b.channel);
if(!c){TS.error('unknown channel: "'+b.channel+'"');
return
}c.needs_invited_message=false;
TS.channels.setLastRead(c,b.ts)
},subtype__channel_topic:function(c){var d=TS.channels.getChannelById(c.channel);
if(!d){TS.error('unknown channel: "'+c.channel+'"');
return
}var b=c.user;
var e=TS.members.getMemberById(b);
if(!e){TS.error('unknown member: "'+b+'"');
return
}TS.info(e.name+" changed topic for channel "+c.channel+" to "+c.topic);
TS.channels.topicChanged(d,b,c.ts,c.topic)
},subtype__channel_purpose:function(c){var d=TS.channels.getChannelById(c.channel);
if(!d){TS.error('unknown channel: "'+c.channel+'"');
return
}var b=c.user;
var e=TS.members.getMemberById(b);
if(!e){TS.error('unknown member: "'+b+'"');
return
}TS.info(e.name+" changed purpose for channel "+c.channel+" to "+c.purpose);
TS.channels.purposeChanged(d,b,c.ts,c.purpose)
},channel_history_changed:function(b){TS.ms.msg_handlers.channel_history_changed_worker(b)
},subtype__channel_history_changed:function(b){if(TS.boot_data.feature_channel_eventlog_client){TS.warn("feature_channel_eventlog_client=1 so we should never be getting subtype "+b.subtype)
}TS.ms.msg_handlers.channel_history_changed_worker(b)
},channel_history_changed_worker:function(b){var c=TS.channels.getChannelById(b.channel);
if(!c){TS.error('unknown channel: "'+b.channel+'"');
return
}if(!c.is_member){TS.warn("we can ignore this channel_history_changed msg, we are not a member");
return
}c.history_changed=true;
TS.channels.fetchHistory(c,{channel:c.id,latest:b.latest,inclusive:true,count:TS.utility.clamp(c.msgs.length,TS.model.initial_msgs_cnt,1000)},function(f,g,d){if(!f){TS.error("could not retrieve history")
}else{c.is_limited=false;
c.oldest_msg_ts=null;
TS.storage.storeOldestTs(c.id,null);
TS.warn("imsg.latest: "+b.latest);
for(var e=c.msgs.length-1;
e>-1;
e--){var h=c.msgs[e];
if(h.ts<b.latest){continue
}g.messages.unshift(h)
}c.msgs.length=0
}TS.channels.onHistory(f,g,d);
delete c.history_changed
});
if(c.id==TS.model.active_channel_id){}else{}},group_left:function(b){TS.info("You left group "+b.channel);
var c=TS.groups.getGroupById(b.channel);
if(!c){TS.error('unknown group: "'+b.channel);
return
}TS.groups.removeGroup(c);
TS.members.invalidateMembersUserCanSeeArrayCaches();
TS.groups.left_sig.dispatch(c)
},subtype__group_leave:function(c){var b=c.user;
var f=TS.members.getMemberById(b);
if(!f){TS.error('unknown member: "'+b+'"');
return
}TS.info(f.name+" left group "+c.channel);
var e=TS.groups.getGroupById(c.channel);
if(e){for(var d=0;
d<e.members.length;
d++){if(e.members[d]==f.id){e.members.splice(d,1);
TS.groups.calcActiveMembersForGroup(e);
break
}}}TS.members.invalidateMembersUserCanSeeArrayCaches();
TS.groups.member_left_sig.dispatch(e,f)
},group_joined:function(b){TS.info("You joined group "+b.channel.name);
var c=TS.groups.getGroupById(b.channel.name);
if(c){TS.error("should not be getting a group_joined message if we already know about the group: "+b.channel.name+" "+b.channel.id);
return
}var d=TS.groups.upsertGroup(b.channel);
TS.members.invalidateMembersUserCanSeeArrayCaches();
TS.groups.joined_sig.dispatch(d);
if(TS.client){TS.shared.checkInitialMsgHistory(d,TS.groups)
}},group_deleted:function(b){var c=TS.groups.getGroupById(b.channel);
if(!c){TS.error('unknown group: "'+b.channel);
return
}TS.info("deleted group "+b.channel);
TS.groups.removeGroup(c)
},group_archive:function(b){var c=TS.groups.getGroupById(b.channel);
if(!c){TS.error('unknown group: "'+b.channel);
return
}if(c.is_archived){return
}TS.info("archived group "+b.channel);
c.is_archived=true;
if(c.is_open){c.was_archived_this_session=true
}TS.groups.archived_sig.dispatch(c)
},group_unarchive:function(b){var c=TS.groups.getGroupById(b.channel);
if(!c){TS.error('unknown group: "'+b.channel);
return
}if(!c.is_archived){return
}TS.info("unarchived group "+b.channel);
c.is_archived=false;
c.was_archived_this_session=false;
TS.groups.unarchived_sig.dispatch(c)
},group_rename:function(b){var c=TS.groups.getGroupById(b.channel.id);
if(!c){TS.error('unknown group: "'+b.channel.id);
return
}TS.info("renamed group "+b.channel.id+" to "+b.channel.name);
TS.groups.groupRenamed(b.channel)
},subtype__group_join:function(c){var b=c.user;
var g=TS.members.getMemberById(b);
if(!g){TS.error('unknown member: "'+b+'"');
return
}TS.info(g.name+" joined group "+c.channel);
var f=TS.groups.getGroupById(c.channel);
var d;
if(f){for(var e=0;
e<f.members.length;
e++){if(f.members[e]==g.id){d=f.members[e];
break
}}}if(!d){f.members.push(g.id);
TS.groups.calcActiveMembersForGroup(f)
}if(g.is_self&&c.inviter){f.needs_invited_message=true;
f.inviter=c.inviter
}TS.members.invalidateMembersUserCanSeeArrayCaches();
TS.groups.member_joined_sig.dispatch(f,g)
},group_open:function(b){var d=TS.groups.getGroupById(b.channel);
if(!d){TS.error("unkown group! "+b.channel);
return
}var c=d.is_open;
d.is_open=true;
if(TS.model.requested_group_opens[b.channel]){TS.groups.displayGroup(d.id,false,TS.model.requested_group_opens[b.channel].and_send_txt);
delete TS.model.requested_group_opens[b.channel]
}d.opened_this_session=true;
if(!c){TS.groups.opened_sig.dispatch(d);
if(TS.client){TS.shared.checkInitialMsgHistory(d,TS.groups)
}}},group_marked:function(b){if(!TS.client){return
}var c=TS.groups.getGroupById(b.channel);
if(!c){TS.error('unknown group: "'+b.channel+'"');
return
}c.needs_invited_message=false;
TS.groups.setLastRead(c,b.ts)
},group_close:function(b){var c=TS.groups.getGroupById(b.channel);
if(!c){TS.error('unknown group: "'+b.channel+'"');
return
}c.is_open=false;
if(TS.model.active_group_id==b.channel){if(TS.client){TS.client.activeChannelDisplayGoneAway()
}}TS.groups.closed_sig.dispatch(c)
},subtype__group_topic:function(c){var d=TS.groups.getGroupById(c.channel);
if(!d){TS.error('unknown group: "'+c.channel+'"');
return
}var b=c.user;
var e=TS.members.getMemberById(b);
if(!e){TS.error('unknown member: "'+b+'"');
return
}TS.info(e.name+" changed topic for group "+c.channel+" to "+c.topic);
TS.groups.topicChanged(d,b,c.ts,c.topic)
},subtype__group_purpose:function(c){var d=TS.groups.getGroupById(c.channel);
if(!d){TS.error('unknown group: "'+c.channel+'"');
return
}var b=c.user;
var e=TS.members.getMemberById(b);
if(!e){TS.error('unknown member: "'+b+'"');
return
}TS.info(e.name+" changed purpose for group "+c.channel+" to "+c.purpose);
TS.groups.purposeChanged(d,b,c.ts,c.purpose)
},group_history_changed:function(b){TS.ms.msg_handlers.group_history_changed_worker(b)
},subtype__group_history_changed:function(b){if(TS.boot_data.feature_channel_eventlog_client){TS.warn("feature_channel_eventlog_client=1 so we should never be getting subtype "+b.subtype)
}TS.ms.msg_handlers.group_history_changed_worker(b)
},group_history_changed_worker:function(b){var c=TS.groups.getGroupById(b.channel);
if(!c){TS.error('unknown group: "'+b.channel+'"');
return
}c.history_changed=true;
TS.groups.fetchHistory(c,{channel:c.id,latest:b.latest,inclusive:true,count:TS.utility.clamp(c.msgs.length,TS.model.initial_msgs_cnt,1000)},function(f,g,d){if(!f){TS.error("could not retrieve history")
}else{c.is_limited=false;
c.oldest_msg_ts=null;
TS.storage.storeOldestTs(c.id,null);
TS.warn("imsg.latest: "+b.latest);
for(var e=c.msgs.length-1;
e>-1;
e--){var h=c.msgs[e];
if(h.ts<b.latest){continue
}g.messages.unshift(h)
}c.msgs.length=0
}TS.groups.onHistory(f,g,d);
delete c.history_changed
});
if(c.id==TS.model.active_group_id){}else{}},im_created:function(c){var b=TS.ims.getImById(c.channel.id);
if(b){TS.error("we already have an im for this user! "+c.user);
return
}TS.ims.upsertIm(c.channel);
b=TS.ims.getImById(c.channel.id);
if(!b){TS.error("WTF why can we not find this im: "+c.channel.id);
return
}TS.members.invalidateMembersUserCanSeeArrayCaches();
if(b.is_open){if(TS.model.requested_im_opens[c.user]){TS.ims.displayIm(b.id,false,TS.model.requested_im_opens[c.user].and_send_txt);
delete TS.model.requested_im_opens[c.user]
}TS.ims.opened_sig.dispatch(b)
}b.opened_this_session=true
},im_open:function(c){var b=TS.ims.getImById(c.channel);
if(!b){TS.error("unkown im! "+c.channel);
return
}var d=b.is_open;
b.is_open=true;
if(TS.model.requested_im_opens[c.user]){TS.ims.displayIm(b.id,false,TS.model.requested_im_opens[c.user].and_send_txt);
delete TS.model.requested_im_opens[c.user]
}b.opened_this_session=true;
if(!d&&TS.client){TS.ims.opened_sig.dispatch(b);
TS.shared.checkInitialMsgHistory(b,TS.ims)
}},im_marked:function(c){if(!TS.client){return
}var b=TS.ims.getImById(c.channel);
if(!b){TS.error('unknown im: "'+c.channel+'"');
return
}TS.ims.setLastRead(b,c.ts)
},im_close:function(c){var b=TS.ims.getImById(c.channel);
if(!b){TS.error('unknown im: "'+c.channel+'"');
return
}b.is_open=false;
if(TS.model.active_im_id==c.channel){if(TS.client){TS.client.activeChannelDisplayGoneAway()
}}TS.ims.closed_sig.dispatch(b)
},im_history_changed:function(b){TS.ms.msg_handlers.im_history_changed_worker(b)
},subtype__im_history_changed:function(b){if(TS.boot_data.feature_channel_eventlog_client){TS.warn("feature_channel_eventlog_client=1 so we should never be getting subtype "+b.subtype)
}TS.ms.msg_handlers.im_history_changed_worker(b)
},im_history_changed_worker:function(c){var b=TS.ims.getImById(c.channel);
if(!b){TS.error('unknown im: "'+c.channel+'"');
return
}b.history_changed=true;
TS.ims.fetchHistory(b,{channel:b.id,latest:c.latest,inclusive:true,count:TS.utility.clamp(b.msgs.length,TS.model.initial_msgs_cnt,1000)},function(f,g,d){if(!f){TS.error("could not retrieve history")
}else{b.is_limited=false;
b.oldest_msg_ts=null;
TS.storage.storeOldestTs(b.id,null);
TS.warn("imsg.latest: "+c.latest);
for(var e=b.msgs.length-1;
e>-1;
e--){var h=b.msgs[e];
if(h.ts<c.latest){continue
}g.messages.unshift(h)
}b.msgs.length=0
}TS.ims.onHistory(f,g,d);
delete b.history_changed
});
if(b.id==TS.model.active_im_id){}else{}},manual_presence_change:function(c){var b=TS.model.user;
if(c.presence!="away"&&c.presence!="active"){TS.error('unknown presence: "'+c.presence+'"');
return
}b.manual_presence=c.presence;
TS.members.presence_changed_sig.dispatch(b)
},presence_change:function(b){var c=TS.members.getMemberById(b.user);
if(!c){TS.error('unknown member: "'+b.user+'"');
return
}if(b.presence!="away"&&b.presence!="active"){TS.error('unknown presence: "'+b.presence+'"');
return
}if(c.presence==b.presence){return
}if(c.is_self){c._presence_last_changed=new Date()
}c.presence=b.presence;
TS.members.presence_changed_sig.dispatch(c)
},status_change:function(b){var c=TS.members.getMemberById(b.user);
if(!c){TS.error('unknown member: "'+b.user+'"');
return
}if(c.status==b.status){return
}c.status=b.status;
TS.members.status_changed_sig.dispatch(c)
},pref_change:function(b){TS.prefs.onPrefChanged(b)
},team_pref_change:function(b){TS.prefs.onTeamPrefChanged(b)
},file_created:function(b){if(!a(b)){return
}var c=TS.files.getFileById(b.file.id);
if(c){TS.warn("we already know about this file, which probably means the files.upload response came in before this message (so np) "+b.file.id)
}else{TS.files.upsertAndSignal(b.file)
}},file_public:function(b){if(!a(b)){return
}TS.files.upsertAndSignal(b.file);
if(!b._from_evt_log){TS.activity.maybeUpdateTeamActivity()
}},file_deleted:function(b){if(!a(b)){return
}TS.files.removeFile(b.file_id);
if(!b._from_evt_log){TS.activity.maybeUpdateTeamActivity()
}},file_private:function(b){if(!a(b)){return
}TS.files.fetchFileInfo(b.file_id);
if(!b._from_evt_log){TS.activity.maybeUpdateTeamActivity()
}},file_change:function(b){if(!a(b)){return
}TS.files.upsertAndSignal(b.file);
TS.files.fileWasMaybeRefreshed(b.file);
if(b.file.mode=="snippet"||b.file.mode=="post"||b.file.mode=="space"){TS.files.fetchFileInfo(b.file.id)
}},file_shared:function(b){if(!a(b)){return
}TS.files.upsertAndSignal(b.file)
},file_unshared:function(b){if(!a(b)){return
}TS.files.upsertAndSignal(b.file)
},file_comment_added:function(b){if(!a(b)){return
}var c=TS.files.getFileById(b.file.id);
if(!c){return
}if(!TS.files.editCommentOnFile(b.comment,c)){TS.files.addCommentToFile(b.comment,c)
}TS.files.upsertFile(b.file);
if(!b._from_evt_log){TS.activity.maybeUpdateTeamActivity()
}},file_comment_edited:function(b){if(!a(b)){return
}var c=TS.files.getFileById(b.file.id);
if(!c){return
}TS.files.editCommentOnFile(b.comment,c);
TS.files.upsertFile(b.file)
},file_comment_deleted:function(b){if(!a(b)){return
}var c=TS.files.getFileById(b.file.id);
if(!c){return
}TS.files.deleteCommentOnFile(b.comment,c);
TS.files.upsertFile(b.file);
if(!b._from_evt_log){TS.activity.maybeUpdateTeamActivity()
}},hello:function(b){},team_join:function(b){var c=b.user;
TS.info(c.name+" joined the team");
TS.members.upsertMember(c);
c=TS.members.getMemberById(c.id);
if(!c){TS.error("wtf no member "+c.id+"?");
return
}TS.members.joined_team_sig.dispatch(c);
if(TS.client){TS.view.showProperTeamPaneFiller()
}},user_change:function(b){var c=TS.members.getMemberById(b.user.id);
if(!c){TS.error("wtf no member "+b.user.id+"?");
return
}TS.members.upsertAndSignal(b.user)
},star_added:function(b){if(!b.item){TS.error(b.type+" has no item");
return
}if(b.user==TS.model.user.id){TS.stars.starStatusHasChanged(true,b.item,b.type);
TS.stars.maybeUpdateStarredItems()
}else{TS.activity.slurpStarItem(b.item,b.type)
}if(!b._from_evt_log){TS.activity.maybeUpdateTeamActivity()
}},star_removed:function(b){if(!b.item){TS.error(b.type+" has no item");
return
}if(b.user==TS.model.user.id){TS.stars.starStatusHasChanged(false,b.item,b.type);
TS.stars.maybeUpdateStarredItems()
}else{TS.activity.slurpStarItem(b.item,b.type)
}if(!b._from_evt_log){TS.activity.maybeUpdateTeamActivity()
}},reaction_added:function(b){if(!b.item){TS.error(b.type+" has no item");
return
}TS.rxns.changeRxnsFromIMsg(b)
},reaction_removed:function(b){if(!b.item){TS.error(b.type+" has no item");
return
}TS.rxns.changeRxnsFromIMsg(b)
},email_domain_changed:function(b){TS.model.team.email_domain=b.email_domain;
if(TS.client){TS.view.showProperTeamPaneFiller()
}},team_domain_change:function(b){TS.model.last_team_domain=TS.model.team.domain=b.domain;
TSSSB.call("setCurrentTeam",TS.model.team.domain)
},slack_broadcast:function(c){var f=null;
var h=c.title||"Broadcast message";
var b=c.body||"";
var g="";
var e=c.button||(c.reload?"Reload":"OK");
var i=false;
if(!!c.reload){if(!!c.force_reload){TS.info("reloading because imsg.force_reload");
i=true
}else{if(!TS.boot_data.version_ts){TS.info("reloading because we dont have an version_ts");
i=true
}else{if(c.version_ts=="dev"){TS.info("reloading because dev");
i=true
}else{if(parseInt(TS.boot_data.version_ts)<parseInt(c.version_ts)){TS.info("reloading because "+TS.boot_data.version_ts+" < "+c.version_ts);
i=true
}}}}if(!i){return
}f=function(){if(TS.client){TS.reload()
}}
}if(i){var d=TS.utility.randomInt(10,20);
g='<p class="top_margin">(You will be auto reloaded in <span id="auto_secs">'+d+"</span> seconds.)</p>";
setTimeout(function(){if(TS.client){TS.reload()
}},d*1000);
setInterval(function(){d--;
if(d<1){return
}$("#auto_secs").text(d)
},1000)
}TS.generic_dialog.start({title:TS.format.formatWithOptions(h,null,{no_highlights:true,no_specials:true}),body:TS.format.formatWithOptions(b,null,{no_highlights:true,no_specials:true})+g,go_button_text:e,show_cancel_button:false,esc_for_ok:true,on_go:f})
},team_rename:function(b){$("#team_name").text(b.name);
document.title=document.title.replace(TS.model.last_team_name,b.name);
if(TS.ui.growls.original_document_title){TS.ui.growls.original_document_title=TS.ui.growls.original_document_title.replace(TS.model.last_team_name,b.name)
}TS.model.last_team_name=TS.model.team.name=b.name
},team_icon_change:function(b){if(!b.icon){return
}TS.model.team.icon=b.icon;
if(TS.client){TS.client.updateTeamIcon()
}},bot_added:function(b){var c=b.bot;
TS.info(c.name+" was added");
TS.bots.upsertBot(c);
c=TS.bots.getBotById(c.id);
if(!c){TS.error("wtf no bot "+c.id+"?");
return
}TS.bots.added_sig.dispatch(c)
},bot_changed:function(b){var c=TS.bots.getBotById(b.bot.id);
if(!c){TS.error("wtf no bot "+b.bot.id+"?");
return
}TS.bots.upsertAndSignal(b.bot)
},bot_removed:function(b){var c=TS.bots.getBotById(b.bot.id);
if(!c){TS.error("wtf no bot "+b.bot.id+"?");
return
}TS.bots.upsertAndSignal(b.bot)
},error:function(b){},user_typing:function(d){if(!TS.typing){return
}var g=TS.members.getMemberById(d.user);
if(!g){TS.error("unknown imsg.user:"+d.user);
return
}var e=TS.channels.getChannelById(d.channel);
var c;
var f;
if(!e){c=TS.ims.getImById(d.channel)
}if(!e&&!c){f=TS.groups.getGroupById(d.channel)
}if(!c&&!e&&!f){TS.error("unknown imsg.channel:"+d.channel);
return
}var b=c||e||f;
TS.typing.memberStarted(b,g)
},issue_change:function(b){TS.help.onIssueChange(b.issue)
},emoji_changed:function(b){TS.setUpEmoji(function(){TS.prefs.setEmojiMode();
TS.model.emoji_names.length=0;
for(var c in emoji.data){var f=emoji.data[c][3];
for(var e=0;
e<f.length;
e++){var d=f[e];
TS.model.emoji_names.push(d)
}}TS.model.emoji_names.sort();
if(TS.client){TS.client.ui.rebuildAll()
}TS.makeEmoticonList()
})
},play_sound:function(b){if(TS.model.prefs.autoplay_chat_sounds){TS.sounds.play(b.sound+".mp3")
}},commands_changed:function(b){TS.setUpCmds()
},accounts_changed:function(){setTimeout(TS.refreshTeams,1000)
},pin_added:function(c){if(!TS.boot_data.feature_pins){return
}var b=TS.shared.getModelObById(c.channel_id);
if(b){TS.pins.pinStatusHasChanged(true,c.item,c.item.type,b);
if(TS.boot_data.feature_lazy_load_pins){b.has_pins=true
}}},pin_removed:function(c){if(!TS.boot_data.feature_pins){return
}var b=TS.shared.getModelObById(c.channel_id);
if(b){TS.pins.pinStatusHasChanged(false,c.item,c.item.type,b);
if(TS.boot_data.feature_lazy_load_pins&&false===c.has_pins){b.has_pins=false
}}}});
var a=function(b){if(!TS.web){return true
}if(b.file&&TS.web.space&&!TS.web.space.isFileRelevant(b.file.id)){return false
}if(b.file_id&&TS.web.space&&!TS.web.space.isFileRelevant(b.file_id)){return false
}return true
}
})();
(function(){TS.registerModule("ds",{last_pong_time:0,sent_map:{},connected_sig:new signals.Signal(),disconnected_sig:new signals.Signal(),trouble_sig:new signals.Signal(),reconnecting_sig:new signals.Signal(),pong_sig:new signals.Signal(),on_msg_sig:new signals.Signal(),reconnect_requested_sig:new signals.Signal(),onStart:function(){g(TS.model.ui.is_window_focused||false);
TS.ui.window_focus_changed_sig.add(g);
setInterval(function(){if(!TS.model.ds_connected){return
}if(TS.model.rtd_start_throttler<1){return
}TS.model.rtd_start_throttler--
},1000*60)
},send:function(H,F,G){H.id=++e;
TS.ds.sent_map[H.id.toString()]={msg:H,handler:F,ts:TS.utility.date.getTimeStamp(),temp_ts:G};
if(H.type=="ping"||H.type=="pong"){TS.log(3,"TS.ds ping -->\n"+JSON.stringify(H,null,"  "))
}else{TS.model.last_net_send=TS.utility.date.getTimeStamp();
TS.log(2,"TS.ds -->\n"+JSON.stringify(H,null,"  "))
}if(r&&TS.model.ds_connected){r.send(JSON.stringify(H))
}else{TS.ds.Q.push(H)
}return H.id
},Q:[],sendTyping:function(F){var G='{"type":"typing", "channel":"'+F+'"}';
r.send(G)
},handleMsg:function(F){var I=F.reply_to&&!("ok" in F)&&F.type=="message";
if(I){}var G;
if(F.reply_to){if(F.reply_to.toString() in TS.ds.sent_map){G=TS.ds.sent_map[F.reply_to];
F.SENT_MSG=G.msg;
delete TS.ds.sent_map[F.reply_to]
}else{if(!I){TS.error('received msg "'+F.reply_to+'" with type "'+F.type+'" but we have no record of it in sent_map')
}}}if(F.type=="ping"||F.type=="pong"){TS.log(3,"msg "+F.type+" time: "+(TS.utility.date.getTimeStamp()-G.ts)+"ms");
TS.log(3,"TS.ds ping <--\n"+JSON.stringify(F,null,"  "));
TS.ds.last_pong_time=TS.utility.date.getTimeStamp();
TS.ds.pong_sig.dispatch()
}else{if(G){var H=F.type?F.type:(F.SENT_MSG.type)?F.SENT_MSG.type:"";
TS.log(2,"msg "+((H)?'"'+H+'" ':"")+"rsp time "+(TS.utility.date.getTimeStamp()-G.ts)+"ms")
}else{}TS.log(2,"TS.ds <-- \n"+JSON.stringify(F,null," "))
}if(F.type=="error"){h(F)
}else{if(!F.reply_to){TS.ds.on_msg_sig.dispatch(F);
if(F.type=="hello"){k(F)
}}}if(G){if(!F.ok){F.error=F.error||{code:0,msg:"unknown error (not specified by MS)"}
}if(I){F.ok=true
}if(G.handler){G.handler(F.ok,F)
}}},onFailure:function(H){if(H){v("You got disconnected and are on team Tiny Speck, so here are some details:\n>>>"+H)
}b=false;
d();
if(TS.model.ds_connected){TS.info("Disconnected from DS, TS.model.rtd_start_throttler:"+TS.model.rtd_start_throttler);
TS.ds.logConnectionFlow("on_connected_failure");
TS.model.ds_reconnect_ms=100;
TS.ds.disconnect()
}else{TS.ds.logConnectionFlow("on_notconnected_failure");
var G=TS.model.ds_reconnect_ms=((TS.model.ds_reconnect_ms+1000)*1.3);
if(TS.model.ds_reconnect_ms>4000){TS.model.ds_reconnect_ms=TS.utility.randomInt(G,G+(G/3))
}TS.model.ds_reconnect_ms=Math.min(TS.model.ds_reconnect_ms,300000)
}if(TS.model.rtd_start_throttler>5){var F=2000*TS.model.rtd_start_throttler;
if(TS.model.ds_reconnect_ms<F){TS.info("because TS.model.rtd_start_throttler:"+TS.model.rtd_start_throttler+" we are increasing time until next login call");
TS.model.ds_reconnect_ms=F
}}if(TS.model.ds_connected){TS.model.ds_connected=false;
TS.ds.disconnected_sig.dispatch()
}TS.model.ds_connected=false;
clearInterval(s);
if(TS.model.ds_asleep){TS.warn("NOT doing startReconnection(), we are asleep");
return
}TS.ds.startReconnection()
},startReconnection:function(){TS.model.ds_reconnect_time=TS.utility.date.getTimeStamp()+TS.model.ds_reconnect_ms;
TS.info("Attempting to reconnect in "+TS.model.ds_reconnect_ms+"ms");
clearInterval(a);
a=setInterval(c,q);
c();
clearTimeout(n);
n=setTimeout(function(){if(!TS.model.window_unloading){TS.ds.reconnect_requested_sig.dispatch()
}},TS.model.ds_reconnect_ms)
},manualReconnectNow:function(){TS.ds.logConnectionFlow("manual_reconnect");
clearTimeout(n);
clearInterval(a);
clearTimeout(f);
p=0;
if(!TS.model.window_unloading){TS.ds.reconnect_requested_sig.dispatch();
TS.ds.reconnecting_sig.dispatch(0)
}},disconnect:function(){if(r&&TS.model.ds_connected){TS.ds.logConnectionFlow("disconnect");
r.close()
}else{TS.warn("TS.ds.disconnect called, but _websocket="+r+" TS.model.ds_connected="+TS.model.ds_connected)
}},logConnectionFlow:function(F){var H=TS.model.ds_conn_log;
var G=TS.utility.date.getTimeStamp();
H.push({name:F,time:G,delta:(H.length)?G-H[H.length-1].time:0});
TS.log(2,"logConnectionFlow "+F+" "+H[H.length-1].delta)
},getConnectionFlowLog:function(I){var J=TS.model.ds_conn_log;
var F=[];
for(var G=0;
G<J.length;
G++){F.push(encodeURIComponent(J[G].name+"-"+(J[G].delta?Math.round(J[G].delta/1000):0)+"-"+Math.round(J[G].time/1000)))
}TS.dir(2,TS.model.ds_conn_log);
var H=F.join("&");
if(I&&H.length>I){H=H.substr(0,I)
}return H
},connect:function(){TS.logLoad("TS.ds.connect "+TS.web.space.login_data.ws);
if(!window.WebSocket){window.WebSocket=window.MozWebSocket
}if(window.WebSocket){var G;
try{TS.ds.logConnectionFlow("connect");
G=TS.web.space.login_data.ws;
var J=2000-G.length;
var H=TS.ds.getConnectionFlowLog(J);
var I=(TS.qs_args.simulate_old_token==1)?"&TRIGGER_OLD_TOKEN=1":"";
G+="?version_uid="+TS.boot_data.version_uid+I+"&"+H;
TS.info("Connecting to: "+G);
if(TS.qs_args.simulate_first_connect_failure==1&&!window.already_simulated_first_connect_failure){G=G.replace("e","w");
TS.info("simulate_first_connect_failure url:"+G);
window.already_simulated_first_connect_failure=true
}B=(window.WEB_SOCKET_USING_FLASH)?t:A;
clearTimeout(f);
f=setTimeout(o,B);
TS.ds.last_url=G;
TS.ds.last_start_ms=new Date().getTime();
d();
r=new WebSocket(G)
}catch(F){TS.warn("failed to create new WebSocket");
TS.error(F);
TS.ds.onFailure("failed to create new WebSocket");
return
}TS.model.ds_connecting=true;
if(TS.qs_args.simulate_first_connect_timeout==1&&p<1){TS.info("simulate_first_connect_timeout url:"+G)
}else{r.onopen=x
}r.onclose=j;
r.onerror=u
}else{alert("Your browser does not support Web Sockets.")
}}});
var s=0;
var m=3000;
var f=0;
var B=0;
var A=10000;
var t=20000;
var y=0;
var z=10000;
var E=0;
var l=5000;
var a=0;
var q=1000;
var n=0;
var r=null;
var e=0;
var b=false;
var D=0;
var p=0;
var g=function(F){if(F){D=10000
}else{D=60000
}D+=m;
TS.log(3,"_pong_timeout_ms set to:"+D+" has_focus:"+F)
};
var C=function(G){var F=JSON.parse(G.data);
TS.ds.handleMsg(F)
};
var x=function(F){clearTimeout(f);
p=0;
if(TS.qs_args.simulate_hello_timeout==1&&!window.already_simulated_hello_timeout){TS.info("simulate_hello_timeout");
window.already_simulated_hello_timeout=true
}else{r.onmessage=C
}TS.model.ds_conn_log.length=0;
TS.logLoad("_onConnect (took "+(new Date().getTime()-TS.ds.last_start_ms)+"ms)");
TS.info("DS WS connected!");
TS.ds.logConnectionFlow("on_connect");
clearTimeout(y);
y=setTimeout(i,z)
};
var w=function(){if(b){var G=TS.utility.date.getTimeStamp()-TS.ds.last_pong_time;
TS.log(3,"since_last_pong_ms:"+G+" pong_timeout_ms:"+D);
if(G>D){TS.warn("since_last_pong_ms too long! "+G+" > "+D);
TS.warn("calling disconnect(), expect to get an onDisconnect() callback");
TS.ds.logConnectionFlow("on_ping_timeout");
TS.ds.trouble_sig.dispatch();
b=false;
v("You are on team Tiny Speck, so here are some pong details:\n>>>since_last_pong_ms too long! "+G+" > "+D+" ... calling disconnect(), expect to get an onDisconnect() callback");
try{TS.ds.disconnect();
clearTimeout(E);
E=setTimeout(function(){TS.info("called disconnect, no onDisconnect callback happened in "+l+"ms, so calling _onDisconnect() manually now");
j(null,"since_last_pong_ms too long! then called disconnect, but no onDisconnect callback happened in "+l+"ms, so calling _onDisconnect() manually now")
},l)
}catch(F){TS.info("since_last_pong_ms too long! then an error calling disconnect, going to assume it is because it is already closed, calling _onDisconnect() manually now");
TS.warn(F);
j(null,"error calling disconnect, going to assume it is because it is already closed, calling _onDisconnect() manually now")
}return
}}TS.ds.send({type:"ping",ping_interv_ms:m})
};
var j=function(G,F){F=F||"_onDisconnect called with event:"+G;
TS.info("DS WS disconnected");
TS.ds.logConnectionFlow("on_disconnect");
clearTimeout(E);
clearTimeout(y);
clearTimeout(f);
if(G){TS.info("_onDisconnect event.code:"+G.code);
if(G.code=="1006"&&false){TS.generic_dialog.start({title:"Connection trouble error #1006",body:"Apologies, we're having some trouble with your connection. The particular error code indicates that restarting the application might fix it.",show_cancel_button:false,show_go_button:true,go_button_text:"OK",esc_for_ok:true})
}}else{TS.info("no event")
}TS.ds.onFailure(F)
};
var v=function(F){TS.warn("_reportDisconnect reason_str:"+F)
};
var d=function(){if(!r){return
}r.onmessage=null;
r.onopen=null;
r.onerror=null;
r.onclose=null;
try{r.close()
}catch(G){}if(false){var F=r;
r.onclose=function(H){TS.ds.logConnectionFlow("old_socket_closed");
if(!TS.model.ds_connected&&!TS.model.ds_connecting){TS.warn("Our last socket just fired a close event, and we are not yet connected or connecting again, so let us jump start the connection process with manualReconnectNow()");
TS.ds.manualReconnectNow()
}F.onclose=null
}
}};
var c=function(){var F=TS.model.ds_reconnect_time-TS.utility.date.getTimeStamp();
var G=Math.round(F/1000);
if(G>=0){TS.ds.reconnecting_sig.dispatch(G)
}if(TS.model.window_unloading){clearInterval(a)
}};
var i=function(){var F="socket received no hello msg "+z+"ms after connection";
TS.warn(F);
TS.ds.logConnectionFlow("_onHelloTimeout");
TS.ds.onFailure(F)
};
var o=function(){p++;
var F="socket not connected "+B+"ms after creation. _connect_timeout_count:"+p;
TS.warn(F);
TS.ds.logConnectionFlow("_onConnectTimeout");
if(p==3){TS.generic_dialog.start({title:"Connection trouble",body:"<p>Apologies, we're having some trouble with your web socket connection.</p>				<p>We've seen this problem clear up with a restart of "+(TS.model.is_our_app?"Slack":"your browser")+", 				a solution which we suggest to you now only with great regret and self loathing.</p>				",show_cancel_button:false,go_button_text:"OK",esc_for_ok:true});
return
}else{if(p==2){if(window.WEB_SOCKET_USING_FLASH){}else{if(TS.model.is_chrome){window.fallBackToFlashWebSockets();
setTimeout(function(){if(window.WEB_SOCKET_USING_FLASH_BUT_NO_FLASH||!document.getElementById("webSocketFlash")||!document.getElementById("webSocketFlash").receiveEvents){TS.generic_dialog.start({title:"Connection trouble",body:"<p>Apologies, we're having some trouble with your web socket connection. 							We tried falling back to Flash, but it appears you do not have a version of Flash installed that we can use.</p>							<p>But we've seen this problem clear up with a restart of "+(TS.model.is_our_app?"Slack":"your browser")+", 							a solution which we suggest to you now only with great regret and self loathing.</p>							",show_cancel_button:false,go_button_text:"OK",esc_for_ok:true})
}else{TS.ms.onFailure("3secs passed, waiting on Flash, no connection")
}},3000);
return
}}}}TS.ds.onFailure(F)
};
var u=function(F){var G="";
if(F){if(F.name){G+=" e.name="+F.name
}if(F.message){G+=" e.message="+F.message
}if(F.data){G+=" e.data="+F.data
}}TS.warn("_onError err_str: "+G);
TS.dir(0,F)
};
var h=function(F){if(F.error){if(F.error.code==1){TS.ds.logConnectionFlow("msg_error_code_1")
}else{TS.logError({message:"_onErrorMsg"},JSON.stringify(F));
TS.ds.onFailure("_onErrorMsg imsg.error:"+F.error)
}}else{TS.logError({message:"_onErrorMsg"},F?JSON.stringify(F):"no imsg?")
}};
var k=function(){clearTimeout(y);
TS.logLoad("_onHello (took "+(new Date().getTime()-TS.ds.last_start_ms)+"ms)");
var G=TS.utility.date.getTimeStamp()-TS.ds.last_pong_time;
TS.info("Hello msg recvd, since_last_pong_ms:"+G);
TS.ds.logConnectionFlow("on_hello");
clearInterval(a);
b=true;
TS.ds.last_pong_time=TS.utility.date.getTimeStamp();
clearInterval(s);
s=setInterval(w,m);
TS.model.ds_connecting=false;
TS.model.ds_connected=true;
var H;
for(var F=0;
F<TS.ds.Q.length;
F++){H=TS.ds.Q.shift();
TS.log(2,"TS.ds (Q) -->\n"+JSON.stringify(H,null,"  "));
r.send(JSON.stringify(H))
}TS.ds.connected_sig.dispatch()
}
})();
(function(){TS.registerModule("ds.msg_handlers",{onStart:function(){TS.ds.on_msg_sig.add(a)
},hello:function(b){if(!b.active||!b.active.length){return
}var d;
for(var c=0;
c<b.active.length;
c++){d=TS.members.getMemberById(b.active[c]);
if(!d){TS.error('unknown member: "'+b.active[c]+'"');
return
}d.ds_active=true
}},presence_change:function(b){var c=TS.members.getMemberById(b.user);
if(!c){TS.error('unknown member: "'+b.user+'"');
return
}if(b.presence!="away"&&b.presence!="active"){TS.error('unknown presence: "'+b.presence+'"');
return
}if(c.ds_active&&b.presence=="active"){return
}if(!c.ds_active&&b.presence=="away"){return
}c.ds_active=(b.presence=="active");
TS.members.ds_presence_changed_sig.dispatch(c)
}});
var a=function(b){if(b.reply_to){return
}if(b.event=="rocket"){return
}if(!TS.ds.msg_handlers[b.type]){TS.error("non handled non rocket event received\n"+JSON.stringify(b,null,"  "));
return
}TS.ds.msg_handlers[b.type](b)
}
})();
(function(){TS.registerModule("templates",{onStart:function(){TS.templates.load();
TS.templates.registerPartials();
TS.members.user_color_changed_sig.add(TS.templates.memberUserColorChanged,TS.templates);
TS.prefs.sidebar_behavior_changed_sig.add(TS.templates.sidebarBehaviorPrefChanged,TS.templates);
TS.ui.retina_changed_sig.add(a)
},generic_dialog_template:'		<div class="modal-header">			<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>			<h3>{{{title}}} <img src="'+cdn_url+'/272a/img/loading.gif" width="16" height="16" class="throbber hidden"></h3>		</div>		<div class="modal-body" style="overflow-x: hidden;">			{{{body}}}		</div>		<div class="modal-footer">			<a style="cursor: pointer" class="btn btn_outline dialog_cancel"></a>			<a style="cursor: pointer" class="btn btn dialog_secondary_go hidden"></a>			<a style="cursor: pointer" class="btn dialog_go"></a>		</div>		',generic_dialog_sample_template:'		<p><a class="btn btn_small" onclick="TS.generic_dialog.cancel(); $(\'#file-upload\').trigger(\'click\');">Choose a file</a> 		OR <a class="btn btn_small" hhref="/files/create/snippet" target="{{newWindowName}}" onclick="TS.ui.snippet_dialog.startCreate(); TS.generic_dialog.cancel();">Create a text file</a></p>		',privacy_policy_dialog_template:'		<div class="modal-content">			{{#if title}}				<div class="modal-header">					<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>				</div>			{{/if}}			<div class="modal-body" style="overflow-x: hidden;">				{{{body}}}			</div>			<div class="modal-footer">				{{#if footer}}					{{{footer}}}				{{/if}}			</div>		</div>		',existing_groups_template:'		{{#if_equal existing_groups.length compare=1}}			The following group has the same members as the one you are trying to create. Would you like to use it instead?<br><br>		{{else}}			The following groups have the same members as the one you are trying to create. Would you like to use one of them instead?<br><br>		{{/if_equal}}		{{#each existing_groups}}			<p class="small_bottom_margin" style="font-size:0.8rem; color:black"><span style="color: #AAA;">{{{groupPrefix}}}</span>{{this.name}}&nbsp;&nbsp;<a onclick="TS.ui.group_create_dialog.useExistingGroup(\'{{this.id}}\')" class="btn btn_small ">{{#if this.is_archived}}unarchive{{else}}open{{/if}}</a></p>		{{/each}}		<br>		If you really want to create a new group, just click the "create new group" button again.		',issue_list_item_template:'		<div class="issue_list_div issue_{{issue.state}}" id="{{makeIssueListDomId issue.id}}" data-issue-id="{{issue.id}}">			<div class="issue_list_left">				<div class="issue_list_title">{{issue.title}}</div>				<div class="issue_list_short_text">{{issue.short_text}}</div>			</div>			<div class="issue_list_right">				<div class="issue_list_state">{{issue.state}}{{#if_equal issue.state compare="unread"}} <i class="ts_icon ts_icon_exclamation_circle icon"></i>{{/if_equal}}</div>				<div class="issue_list_short_ts">{{toCalendarDateOrNamedDayShort issue.ts}} at {{toTime issue.ts}}</div>			</div>		</div>		',help_issue_div_template:'		<p class="small_bottom_margin"><b>{{issue.title}}</b></p>		{{#if show_comments}}			{{#each issue.comments}}				<div class="issue_comment_div">					<p class="small_bottom_margin"><b>{{this.from}}</b> <span class="issue_list_short_ts">{{toCalendarDateOrNamedDayShort this.ts}} at {{toTime this.ts}}</span></p>					{{{formatMessageSimple this.text}}}				</div>			{{/each}}		{{else}}			<div class="issue_comment_div">			</div>		{{/if}}		',help_issue_reply_comments_template:'		{{#each issue.comments}}			<div class="issue_comment_div">				<p class="small_bottom_margin"><b>{{this.from}}</b> <span class="issue_list_short_ts">{{toCalendarDateOrNamedDayShort this.ts}} at {{toTime this.ts}}</span></p>				{{{formatMessageSimple this.text}}}			</div>		{{/each}}		',message_screenhero_attachment_template:'		{{! screenhero_config currrently only contains "room_id", but once we do look up of the call on the back end, we can attach more meta data}}		<div class="screenhero_attachment clearfix">			<i class="ts_icon ts_icon_phone"></i>			<span>				<p class="no_bottom_margin">					<a target="screenhero_{{screenhero_config.room_id}}" href="{{share_url_prefix}}{{screenhero_config.room_id}}">Join this call.</a>				</p>				<p class="call_subinfo no_bottom_margin">Started at {{toTime shared_ts}}, shared {{#if shared_in_im}}with @{{else}}in #{{/if}}{{shared_channel_or_group_or_im}}</p>			</span>		</div>		',message_attachment_template:'{{{initial_caret_html}}}<div {{#if real_src}}data-real-src="{{real_src}}"{{/if}} class="inline_attachment{{#unless expand_it}} hidden{{/unless}} {{max_width_class}}">{{#if attachment.pretext}}<div class="attachment_pretext">{{{formatMessageAttachmentPart attachment.pretext msg true attachment.mrkdwn_in_hash.pretext}}}</div>{{/if}}<div class="inline_attachment_wrapper{{#if is_standalone}} standalone{{/if}}"><div class="attachment_bar" style="background:#{{bg_color}};"><div class="shim"></div></div><div class="content dynamic_content_max_width">{{#if thumb_at_top}}{{#if small_thumb}}<div class="msg_inline_attachment_thumb_holder at_top">{{#if thumb_link}}<a {{{makeRefererSafeLink url=thumb_link}}} target="{{thumb_link}}">{{/if}}{{!using style for width height is important! we must override default img styles}}<img class="msg_inline_attachment_thumb" src="{{small_thumb_url}}" style="width:{{attachment._floated_thumb_display_width}}px; height:{{attachment._floated_thumb_display_height}}px;">{{#if thumb_link}}</a>{{/if}}</div>{{/if}}{{/if}}{{#if can_delete}}<div class="delete_attachment_link" data-attachment-id="{{attachment.id}}"><i class="ts_icon ts_icon_times_small"></i></div>{{/if}}<div>{{#if attachment.service_icon}}<img class="attachment_service_icon" src="{{attachment.service_icon}}" width="16" height="16">{{/if}}{{#if attachment.author_icon}}{{#if attachment.author_link}}<a {{{makeRefererSafeLink url=attachment.author_link}}} target="{{attachment.author_link}}"><img class="attachment_author_icon" src="{{attachment.author_icon}}" width="16" height="16"></a><a {{{makeRefererSafeLink url=attachment.author_link}}} target="{{attachment.author_link}}"><span class="attachment_author_name">{{{formatMessageAttachmentPart attachment.author_name msg false false}}}</span></a><a {{{makeRefererSafeLink url=attachment.author_link}}} target="{{attachment.author_link}}"><span class="attachment_author_subname">{{{formatMessageAttachmentPart attachment.author_subname msg false false}}}</span></a>{{else}}<img class="attachment_author_icon" src="{{attachment.author_icon}}" width="16" height="16"><span class="attachment_author_name">{{{formatMessageAttachmentPart attachment.author_name msg false false}}}</span><span class="attachment_author_subname">{{{formatMessageAttachmentPart attachment.author_subname msg false false}}}</span>{{/if}}{{else}}{{#if attachment.service_url}}<a {{{makeRefererSafeLink url=attachment.service_url}}} target="{{attachment.service_url}}"><span class="attachment_service_name">{{{formatMessageAttachmentPart attachment.service_name msg false false}}}</span></a>{{else}}<span class="attachment_service_name">{{{formatMessageAttachmentPart attachment.service_name msg false false}}}</span>{{/if}}{{/if}}{{#unless attachment.title}}{{#unless attachment.text}}{{#unless attachment.fields}}{{{media_caret_html}}}{{/unless}}{{/unless}}{{/unless}}</div>{{#unless thumb_at_top}}{{#if small_thumb}}<div class="msg_inline_attachment_thumb_holder">{{#if thumb_link}}<a {{{makeRefererSafeLink url=thumb_link}}} target="{{thumb_link}}">{{/if}}{{!using style for width height is important! we must override default img styles}}<img class="msg_inline_attachment_thumb" src="{{small_thumb_url}}" style="width:{{attachment._floated_thumb_display_width}}px; height:{{attachment._floated_thumb_display_height}}px;">{{#if thumb_link}}</a>{{/if}}</div>{{/if}}{{/unless}}{{#unless attachment.author_icon}}{{#if attachment.author_link}}<a {{{makeRefererSafeLink url=attachment.author_link}}} target="{{attachment.author_link}}"><span class="attachment_author_name">{{{formatMessageAttachmentPart attachment.author_name msg false false}}}</span></a><a {{{makeRefererSafeLink url=attachment.author_link}}} target="{{attachment.author_link}}"><span class="attachment_author_subname">{{{formatMessageAttachmentPart attachment.author_subname msg false false}}}</span></a>{{else}}{{#if attachment.author_name}}<span class="attachment_author_name">{{{formatMessageAttachmentPart attachment.author_name msg false false}}}</span><span class="attachment_author_subname">{{{formatMessageAttachmentPart attachment.author_subname msg false false}}}</span>{{/if}}{{/if}}{{/unless}}{{#if attachment.title}}<div>{{#if attachment.title_link}}<span class="attachment_title"><a {{{makeRefererSafeLink url=attachment.title_link}}} target="{{attachment.title_link}}">{{{formatMessageAttachmentPart attachment.title msg true false enable_slack_action_links}}}</a></span>{{else}}<span class="attachment_title">{{{formatMessageAttachmentPart attachment.title msg true false enable_slack_action_links}}}</span>{{/if}}{{#unless attachment.text}}{{#unless attachment.fields}}{{{media_caret_html}}}{{/unless}}{{/unless}}</div>{{/if}}{{#if attachment.text}}{{#feature flag="feature_more_field_in_message_attachments"}}<div class="attachment_contents">{{#if has_more}}{{#if is_text_collapsed}}<span class="short_text" data-all-text="{{formatMessageAttachmentPart attachment.text msg true attachment.mrkdwn_in_hash.text}}">{{{formatMessageAttachmentPart attachment._short_text msg true attachment.mrkdwn_in_hash.text enable_slack_action_links}}}</span>{{else}}<span class="short_text" data-all-text="{{formatMessageAttachmentPart attachment.text msg true attachment.mrkdwn_in_hash.text}}">{{{formatMessageAttachmentPart attachment.text msg true attachment.mrkdwn_in_hash.text enable_slack_action_links}}}{{/if}}<span id="{{makeMsgAttachmentTextExpanderDomId msg.ts attachment._index}}" class="rest_text_expander"{{#if attachment.more_hidetext}} data-hide-text="{{attachment.more_hidetext}}"{{/if}}> <a><br /><span>{{#if attachment.more_showtext}}{{attachment.more_showtext}}{{else}}Show more{{/if}}</span>{{#if attachment.more_hidetext}} <i class="ts_icon ts_icon_caret_right tiny_left_margin"></i>{{else}}...{{/if}}</a></span><span class="more_text hidden"><br />{{{formatMessageAttachmentPart attachment.more msg true attachment.mrkdwn_in_hash.text enable_slack_action_links}}}</span>{{else}}{{#if is_text_collapsed}}<span class="short_text" data-all-text="{{formatMessageAttachmentPart attachment.text msg true attachment.mrkdwn_in_hash.text}}">{{{formatMessageAttachmentPart attachment._short_text msg true attachment.mrkdwn_in_hash.text enable_slack_action_links}}}</span><span id="{{makeMsgAttachmentTextExpanderDomId msg.ts attachment._index}}" class="rest_text_expander"> <a>Show more...</a></span>{{else}}{{{formatMessageAttachmentPart attachment.text msg true attachment.mrkdwn_in_hash.text enable_slack_action_links}}}{{/if}}{{/if}}{{#unless attachment.fields}}{{{media_caret_html}}}{{/unless}}</div>{{#if attachment.footer}}<div class="attachment_footer">{{{formatMessageAttachmentPart attachment.footer msg true attachment.mrkdwn_in_hash.footer enable_slack_action_links}}}</div>{{/if}}{{#if attachment.ts}}<div class="attachment_ts">{{#if ts_link}}<a {{{makeRefererSafeLink url=ts_link}}} target="{{ts_link}}">{{/if}}{{toCalendarDateOrNamedDayShort attachment.ts}} at {{toTime attachment.ts}}{{#if ts_link}}</a>{{/if}}</div>{{/if}}{{else}}<div class="attachment_contents">{{#if is_text_collapsed}}<span class="short_text" data-all-text="{{formatMessageAttachmentPart attachment.text msg true attachment.mrkdwn_in_hash.text}}">{{{formatMessageAttachmentPart attachment._short_text msg true attachment.mrkdwn_in_hash.text enable_slack_action_links}}}</span><span id="{{makeMsgAttachmentTextExpanderDomId msg.ts attachment._index}}" class="rest_text_expander"> <a>Show more...</a></span>{{else}}{{{formatMessageAttachmentPart attachment.text msg true attachment.mrkdwn_in_hash.text enable_slack_action_links}}}{{/if}}{{#unless attachment.fields}}{{{media_caret_html}}}{{/unless}}</div>{{#if attachment.footer}}<div class="attachment_footer">{{{formatMessageAttachmentPart attachment.footer msg true attachment.mrkdwn_in_hash.footer enable_slack_action_links}}}</div>{{/if}}{{#if attachment.ts}}<div class="attachment_ts">{{#if ts_link}}<a {{{makeRefererSafeLink url=ts_link}}} target="{{ts_link}}">{{/if}}{{toCalendarDateOrNamedDayShort attachment.ts}} at {{toTime attachment.ts}}{{#if ts_link}}</a>{{/if}}</div>{{/if}}{{/feature}}{{/if}}{{#if attachment.fields}}<div class="attachment_fields">{{#if show_fields_table}}<table class="" cellpadding="0" cellspacing="0" border="0" align="left"><tbody>{{#foreach attachment.fields}}{{#if this.value._new_row}}<tr>{{/if}}<td valign="top" colspan="{{#if this.value.short}}1{{else}}2{{/if}}" {{#if this.value.short}}{{#if this.value._new_row}}width="250"{{/if}}{{/if}}><div class="attachment_field_title">{{{formatMessageAttachmentPart this.value.title msg false false}}}</div><i class="copy_only">----------------<br></i><div class="attachment_field_value {{#if this.value.short}}short{{/if}}">{{{formatMessageAttachmentPart this.value.value msg true ../attachment.mrkdwn_in_hash.fields ../enable_slack_action_links}}}<i class="copy_only"><br><br></i></div></td>{{/foreach}}</tbody></table>{{else}}{{#foreach long_fields}}<span class="attachment_field_title">{{{formatMessageAttachmentPart this.value.title msg false false}}}</span>&nbsp;&nbsp;&nbsp;{{{formatMessageAttachmentPart this.value.value msg true ../attachment.mrkdwn_in_hash.fields}}}<br>{{/foreach}}{{#foreach short_fields}}{{#unless this.first}}&nbsp;&nbsp;•&nbsp;&nbsp;{{/unless}}<span class="attachment_field_title">{{{formatMessageAttachmentPart this.value.title msg false false}}}</span>&nbsp;&nbsp;&nbsp;{{{formatMessageAttachmentPart this.value.value msg true ../attachment.mrkdwn_in_hash.fields ../enable_slack_action_links}}}{{/foreach}}{{/if}}</div>{{{media_caret_html}}}{{/if}}{{#if attachment.other_html}}{{{inlineOtherDiv attachment.other_html msg_dom_id attachment.safe_other_html expand_media}}}{{/if}}{{#if attachment.video_html}}{{#if attachment.thumb_url}}{{#if attachment.from_url}}{{{inlineVideoDiv attachment.from_url msg_dom_id expand_media}}}{{else}}{{{inlineVideoDiv attachment.thumb_url msg_dom_id expand_media}}}{{/if}}{{/if}}{{else}}{{/if}}{{#if attachment.image_url}}{{#if attachment.from_url}}{{{inlineImgDiv attachment.from_url msg_dom_id expand_media}}}{{else}}{{{inlineImgDiv attachment.image_url msg_dom_id expand_media}}}{{/if}}{{/if}}{{#if attachment.audio_html}}{{{inlineAudioDiv attachment.audio_html msg_dom_id attachment.safe_audio_html expand_media}}}{{else}}{{#if attachment.audio_url}}{{{formatSoundUrl attachment}}}{{/if}}{{/if}}{{#if show_action_links}}{{#if attachment.actions}}<div class="attachment_actions">{{#foreach attachment.actions}}{{{formatActionLink this.value msg ../enable_slack_action_links}}}{{#unless this.last}} • {{/unless}}{{/foreach}}</div>{{/if}}{{/if}}</div></div></div>{{#if show_fallback}}<div class="attachment_fallback">{{#if attachment.fallback}}{{{formatMessageAttachmentPart attachment.fallback msg true attachment.mrkdwn_in_hash.fallback enable_slack_action_links}}}{{else}}NO FALLBACK PROVIDED{{/if}}</div>{{/if}}',file_snippet_reference_template:'<div class="file_reference">{{#isTheme theme="dense"}}	<div class="meta">		{{#if uploader}}{{{makeMemberPreviewLinkById uploader.id false}}}\'s{{else}}a{{/if}} snippet: 		<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_name bold">{{#if file.title}}{{file.title}}{{else}}{{file.name}}{{/if}}</a>		<a href="{{file.permalink}}" target="{{file.permalink}}" class="ts_icon ts_icon_external_link icon_new_window" title="Open file page"></a>	</div>	{{#unless standalone}}		<div class="snippet_preview">			{{{file.preview_highlight}}}			{{#if_gt file.lines_more compare=0}}				<a href="{{file.permalink}}" data-file-id="{{file.id}}" class="file_preview_link snippet_preview_more" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}">+ {{file.lines_more}} more line{{#if_gt file.lines_more compare=1}}s{{/if_gt}}...</a>			{{/if_gt}}		</div>		<div class="snippet_meta">			<a href="{{file.url_private_download}}" target="{{file.url_private_download}}" title="Download this file">{{convertFilesize file.size}} <span>{{file.pretty_type}}</span></a>			<span class="bullet">•</span>			{{#memberIsSelf id=member.id}} 				{{#unless uploader}}					<a href="{{file.edit_link}}" target="{{file.id}}" class="file_edit" onclick="TS.ui.snippet_dialog.startEdit(\'{{file.id}}\'); return false">Edit</a> <span class="bullet">•</span>				{{/unless}}			{{/memberIsSelf}}			<a href="{{file.permalink}}" target="{{file.id}}">New window</a>			<span class="bullet">•</span> 			<a href="{{file.url_private}}" target="{{file.id}}">View raw</a>			<span class="bullet">•</span>			<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_comment_link">				{{#if file.comments_count}}{{pluralCount file.comments_count "comment" "comments"}}{{else}}Add comment{{/if}}			</a>		</div>	{{/unless}}	{{/isTheme}}		{{#isTheme theme="light"}}	<span class="meta">		{{#if uploader}}{{{makeMemberPreviewLinkById uploader.id false}}}\'s{{else}}a{{/if}} snippet: 		<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_name">{{#if file.title}}{{file.title}}{{else}}{{file.name}}{{/if}}</a>	</span><br />	{{#unless standalone}}		<div class="snippet_preview">			{{{file.preview_highlight}}}			{{#if_gt file.lines_more compare=0}}				<a href="{{file.permalink}}" data-file-id="{{file.id}}" class="file_preview_link snippet_preview_more" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}">+ {{file.lines_more}} more line{{#if_gt file.lines_more compare=1}}s{{/if_gt}}...</a>			{{/if_gt}}		</div>		<span class="meta block snippet_meta">			<a href="{{file.url_private_download}}" target="{{file.url_private_download}}" title="Download this file">{{convertFilesize file.size}} <span>{{file.pretty_type}}</span></a>			<span class="bullet">•</span> 			{{#memberIsSelf id=member.id}} 				{{#unless uploader}}					<a href="{{file.edit_link}}" target="{{file.id}}" class="file_edit" onclick="TS.ui.snippet_dialog.startEdit(\'{{file.id}}\'); return false">Edit</a> <span class="bullet">•</span>				{{/unless}}			{{/memberIsSelf}}			<a href="{{file.permalink}}" target="{{file.id}}">New window</a>			<span class="bullet">•</span> 			<a href="{{file.url_private}}" target="{{file.id}}">View raw</a>			<span class="bullet">•</span>			<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_comment_link">				{{#if file.comments_count}}{{pluralCount file.comments_count "comment" "comments"}}{{else}}Add comment{{/if}}			</a>		</span>	{{/unless}}	{{/isTheme}}</div>',file_post_reference_template:'<div class="file_reference">	{{#isTheme theme="dense"}}		<div class="post_meta">			{{#if uploader}}{{{makeMemberPreviewLinkById uploader.id false}}}\'s{{else}}a{{/if}} post: 			<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_name bold">{{#if file.title}}{{file.title}}{{else}}{{file.name}}{{/if}}</a>			<a href="{{file.permalink}}" target="{{file.permalink}}" class="ts_icon ts_icon_external_link icon_new_window" title="Open file page"></a><br />		</div>		{{#unless standalone}}			<div class="post_preview">				{{{smartnl2br file.preview}}}				<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}}data-file-id="{{file.id}}" class="file_preview_link">more</a>			</div>			<span class="meta block post_meta">				{{#memberIsSelf id=member.id}} 					{{#unless uploader}}						<a href="{{file.permalink}}/edit">Edit</a>						<span class="bullet">•</span>					{{/unless}}				{{/memberIsSelf}}				<a href="{{file.permalink}}" target="{{file.id}}">New window</a>				<span class="bullet">•</span>				<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_comment_link">					{{#if file.comments_count}}{{pluralCount file.comments_count "comment" "comments"}}{{else}}Add comment{{/if}}				</a>			</span>		{{/unless}}	{{/isTheme}}		{{#isTheme theme="light"}}		<span class="meta">			{{#if uploader}}{{{makeMemberPreviewLinkById uploader.id false}}}\'s{{else}}a{{/if}} post: 			<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}}data-file-id="{{file.id}}" class="file_preview_link file_name">{{#if file.title}}{{file.title}}{{else}}{{file.name}}{{/if}}</a>			<a href="{{file.permalink}}" target="{{newWindowName}}" data-toggle="tooltip" title="Open post in a new tab" aria-label="Open post in a new tab"><i class="ts_icon ts_icon_external_link file_inline_icon"></i></a>		</span>		{{#unless standalone}}			<div class="post_preview">				{{{smartnl2br file.preview}}}				<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}}data-file-id="{{file.id}}" class="file_preview_link">more</a>			</div>			<span class="meta block post_meta">				{{#memberIsSelf id=member.id}} 					{{#unless uploader}}						<a href="{{file.permalink}}/edit">Edit</a>						<span class="bullet">•</span>					{{/unless}}				{{/memberIsSelf}}				<a href="{{file.permalink}}" target="{{file.id}}">New window</a>				<span class="bullet">•</span>				<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_comment_link">					{{#if file.comments_count}}{{pluralCount file.comments_count "comment" "comments"}}{{else}}Add comment{{/if}}				</a>			</span>		{{/unless}}	{{/isTheme}}</div>',file_space_reference_template:'<div class="file_reference">	{{#isTheme theme="dense"}}		<div class="space_meta">			{{#if uploader}}{{{makeMemberPreviewLinkById uploader.id false}}}\'s{{else}}a{{/if}} space: 			<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_name bold">{{#if file.title}}{{file.title}}{{else}}{{file.name}}{{/if}}</a>			<a href="{{file.permalink}}" target="{{file.permalink}}" class="ts_icon ts_icon_external_link icon_new_window" title="Open file page"></a><br />		</div>		{{#unless standalone}}			<div class="space_preview space_body">				{{{file.preview}}}				<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}}data-file-id="{{file.id}}" class="file_preview_link">more</a>			</div>			<span class="meta block space_meta">				{{#memberIsSelf id=member.id}} 					{{#unless uploader}}						<a href="{{file.permalink}}/edit">Edit</a>						<span class="bullet">•</span>					{{/unless}}				{{/memberIsSelf}}				{{#feature flag="feature_spaces_in_windows"}}{{else}}<a href="{{file.permalink}}" target="{{file.id}}">New window</a>				<span class="bullet">•</span>{{/feature}}				<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_comment_link">					{{#if file.comments_count}}{{pluralCount file.comments_count "comment" "comments"}}{{else}}Add comment{{/if}}				</a>			</span>		{{/unless}}	{{/isTheme}}		{{#isTheme theme="light"}}		<span class="meta">			{{#if uploader}}{{{makeMemberPreviewLinkById uploader.id false}}}\'s{{else}}a{{/if}} space: 			<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}}data-file-id="{{file.id}}" class="file_preview_link file_name">{{#if file.title}}{{file.title}}{{else}}{{file.name}}{{/if}}</a>			<a href="{{file.permalink}}" target="{{newWindowName}}" data-toggle="tooltip" title="Open space in a new tab" aria-label="Open space in a new tab"><i class="ts_icon ts_icon_external_link file_inline_icon"></i></a>		</span>		{{#unless standalone}}			<div class="space_preview space_body">				{{{file.preview}}}				<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}}data-file-id="{{file.id}}" class="file_preview_link">more</a>			</div>			<span class="meta block space_meta">				{{#memberIsSelf id=member.id}} 					{{#unless uploader}}						<a href="{{file.permalink}}/edit">Edit</a>						<span class="bullet">•</span>					{{/unless}}				{{/memberIsSelf}}				{{#feature flag="feature_spaces_in_windows"}}{{else}}<a href="{{file.permalink}}" target="{{file.id}}">New window</a>				<span class="bullet">•</span>{{/feature}}				<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_comment_link">					{{#if file.comments_count}}{{pluralCount file.comments_count "comment" "comments"}}{{else}}Add comment{{/if}}				</a>			</span>		{{/unless}}	{{/isTheme}}</div>',file_reference_template:'<div class="file_reference">{{#isTheme theme="dense"}}	<!--	<em>		{{{makeMemberPreviewLink member}}} referenced:		{{#if uploader}}			{{{makeMemberPreviewLink uploader}}}{{possessive uploader.name}} file:		{{/if}}	</em>	<a href="{{#if file.is_external}}{{file.url}}{{else}}{{file.permalink}}{{/if}}" target="{{#if file.is_external}}{{file.url}}{{else}}{{file.permalink}}{{/if}}" class="ts_icon ts_icon_external_link icon_new_window" title="{{#if file.is_external}}Open original in new tab{{else}}Open file page{{/if}}"></a>	-->	<div class="file_details">		{{#if file.is_external}}			<a href="{{file.url}}" {{#isClient}}target="{{file.url}}"{{/isClient}} data-file-id="{{file.id}}" class="icon icon_40 {{icon_class}}" title="Open original in new tab">		{{else}}			{{#fileIsImage id=file.id}}				<a href="{{file.url}}" {{#isClient}}target="{{file.url}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link icon icon_40 {{icon_class}} {{#if lightbox}}lightbox_link{{/if}}" title="Open in lightbox ({{#isMac}}cmd{{else}}ctrl{{/isMac}}+click to open original in new tab)">			{{else}}				<a href="{{file.url}}" {{#isClient}}target="{{file.url}}"{{/isClient}} data-file-id="{{file.id}}" class="icon icon_40 {{icon_class}}" title="Open original in new tab">			{{/fileIsImage}}		{{/if}}			{{#if file.thumb_80}}				{{#if_equal icon_class compare="thumb_40"}}					<img src="{{file.thumb_80}}" />				{{else}}					<img src="{{file.thumb_360}}" />				{{/if_equal}}			{{else}}				<span data-file-id="{{file.id}}" class="filetype_icon s24 {{file.filetype}}"></span>			{{/if}}		</a>		<span class="float_left" style="width: 85%">			<a href="{{file.permalink}}"{{#isClient}}target="{{file.permalink}}"{{/isClient}}  data-file-id="{{file.id}}" class="file_preview_link file_name">{{#if file.title}}{{file.title}}{{else}}{{file.name}}{{/if}}</a>			{{#unless file.thumb_360}}				{{#unless file.is_external}}					<a href="{{file.url_private_download}}" target="{{file.url_private_download}}" target="{{newWindowName}}" data-toggle="tooltip" title="Download file" aria-label="Download file"><i class="ts_icon ts_icon_cloud_download file_inline_icon"></i></a>				{{/unless}}			{{/unless}}			{{#unless standalone}}				{{#if file.thumb_360_gif}}					{{{inlineImgToggler file.thumb_360_gif msg_dom_id}}}				{{else}}					{{{inlineImgToggler file.thumb_360 msg_dom_id}}}				{{/if}}			{{/unless}}			<br />			{{{makeFileShareLabel file}}}			<span class="bullet">•</span>			<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_comment_link">				{{#if file.comments_count}}{{pluralCount file.comments_count "comment" "comments"}}{{else}}Add comment{{/if}}			</a>			{{#fileIsImage id=file.id}}				<span class="bullet">•</span>				<a href="{{file.url_private}}" target="{{file.url_private}}" data-file-id="{{file.id}}">Open original</a>			{{/fileIsImage}}			</span>		<div class="clear_both"></div>	</div>	{{#unless standalone}}		{{#if file.thumb_360_gif}}			{{{inlineImgDiv file.thumb_360_gif msg_dom_id}}}		{{else}}			{{{inlineImgDiv file.thumb_360 msg_dom_id}}}		{{/if}}	{{/unless}}	{{/isTheme}}	{{#isTheme theme="light"}}	<span class="meta">		<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}}data-file-id="{{file.id}}" class="file_preview_link file_name">			{{#if file.title}}{{file.title}}{{else}}{{file.name}}{{/if}}		</a>		{{#if file.is_external}}			<a href="{{#if file.is_external}}{{file.url}}{{else}}{{file.permalink}}{{/if}}" target="{{newWindowName}}" data-toggle="tooltip" title="Open file on {{#if_equal file.external_type compare="gdrive"}}Google Drive{{/if_equal}}{{#if_equal file.external_type compare="dropbox"}}Dropbox{{/if_equal}}{{#if_equal file.external_type compare="box"}}Box{{/if_equal}}{{#if_equal file.external_type compare="onedrive"}}OneDrive{{/if_equal}}{{#if_equal file.external_type compare="unknown"}}a web page{{/if_equal}}"><i class="ts_icon ts_icon_external_link file_inline_icon"></i></a>		{{/if}}		{{#unless file.thumb_360}}			{{#unless file.is_external}}				<a href="{{file.url_private_download}}" target="{{newWindowName}}" data-toggle="tooltip" title="Download file" aria-label="Download file"><i class="ts_icon ts_icon_cloud_download file_inline_icon"></i></a>			{{/unless}}		{{/unless}}	</span>	{{#unless standalone}}		{{#if file.thumb_360_gif}}			{{{inlineImgToggler file.thumb_360_gif msg_dom_id}}}		{{else}}			{{{inlineImgToggler file.thumb_360 msg_dom_id}}}		{{/if}}		{{#if file.thumb_360_gif}}			{{{inlineImgDiv file.thumb_360_gif msg_dom_id}}}		{{else}}			{{{inlineImgDiv file.thumb_360 msg_dom_id}}}		{{/if}}	{{/unless}}	<span class="meta block">		{{#if file.is_external}}			{{#if_equal file.external_type compare="gdrive"}}				<a href="{{file.url}}" class="no_underline" target="{{newWindowName}}" data-toggle="tooltip" title="Open file on Google Drive"><img src="'+cdn_url+'/0d95/img/services/gdrive_16.png" class="gdrive_icon file_service_icon grayscale" /></a>			{{/if_equal}}			{{#if_equal file.external_type compare="dropbox"}}				<a href="{{file.url}}" class="no_underline" target="{{newWindowName}}" data-toggle="tooltip" title="Open file on Dropbox"><i class="ts_icon ts_icon_dropbox ts_icon_inherit file_service_icon"></i></a>			{{/if_equal}}			{{#if_equal file.external_type compare="box"}}				<a href="{{file.url}}" class="no_underline" target="{{newWindowName}}" data-toggle="tooltip" title="Open file on Box"><img src="'+cdn_url+'/9a0a/plugins/auth/box/assets/auth_32.png" class="box_icon file_service_icon grayscale" /></a>			{{/if_equal}}			{{#if_equal file.external_type compare="onedrive"}}				<a href="{{file.url}}" class="no_underline" target="{{newWindowName}}" data-toggle="tooltip" title="Open file on OneDrive"><img src="'+cdn_url+'/da92/plugins/onedrive/assets/service_32.png" class="onedrive_icon file_service_icon grayscale" /></a>			{{/if_equal}}		{{/if}}		{{#if uploader}}{{{makeMemberPreviewLinkById uploader.id false}}}{{possessive uploader.name}}{{else}}{{/if}} 		{{#if file.is_external}}			{{{external_filetype_html}}}		{{else}}			File		{{/if}}		{{#unless file.is_external}}			<span class="bullet">•</span>			<a href="{{file.url_private_download}}" target="{{file.url_private_download}}" class="file_download_link" title="Download this file">{{convertFilesize file.size}} <span>{{file.pretty_type}}</span></a>		{{/unless}}		<span class="file_share_shared_label{{#unless file.is_shared}} hidden{{/unless}}" data-file-id="{{file.id}}">			<span class="bullet">•</span> {{{makeFileShareLabel file}}}		<span>		{{#unless standalone}}			<span class="bullet">•</span>			<a href="{{file.permalink}}" {{#isClient}}target="{{file.permalink}}"{{/isClient}} data-file-id="{{file.id}}" class="file_preview_link file_comment_link">				{{#if file.comments_count}}{{pluralCount file.comments_count "comment" "comments"}}{{else}}Add comment{{/if}}			</a>		{{/unless}}		{{#fileIsImage id=file.id}}			<span class="bullet">•</span>			<a href="{{file.url_private}}" target="{{file.url_private}}" data-file-id="{{file.id}}">Open original</a>		{{/fileIsImage}}	</span>	{{/isTheme}}</div>',messages_search_paging_template:'<div class="search_paging">{{#if_not_equal pages compare=1}}{{#if_equal current_page compare=1}}<i class="left ts_icon ts_icon_chevron_circle_left disabled"></i>{{else}}<a onclick="TS.search.view.pageMessagesBack()"><i class="left ts_icon ts_icon_chevron_circle_left"></i></a>{{/if_equal}}{{/if_not_equal}}<span class="page_text">page {{current_page}} of {{pages}}</span>{{#if_not_equal pages compare=1}}{{#if_equal current_page compare=pages}}<i class="right ts_icon ts_icon_chevron_medium_right disabled"></i>{{else}}<a onclick="TS.search.view.pageMessagesForward()"><i class="right ts_icon ts_icon_chevron_circle_right"></i></a>{{/if_equal}}{{/if_not_equal}}</div>',files_search_paging_template:'<div class="search_paging">{{#if_not_equal pages compare=1}}{{#if_equal current_page compare=1}}<i class="left ts_icon ts_icon_chevron_circle_left disabled"></i>{{else}}<a onclick="TS.search.view.pageFilesBack()"><i class="left ts_icon ts_icon_chevron_circle_left"></i></a>{{/if_equal}}{{/if_not_equal}}<span class="page_text">page {{current_page}} of {{pages}}</span>{{#if_not_equal pages compare=1}}{{#if_equal current_page compare=pages}}<i class="right ts_icon ts_icon_chevron_medium_right disabled"></i>{{else}}<a onclick="TS.search.view.pageFilesForward()"><i class="right ts_icon ts_icon_chevron_circle_right"></i></a>{{/if_equal}}{{/if_not_equal}}</div>',compile:function(c){var f=c+"_template";
if(TS.templates[f]){return Handlebars.compile(TS.templates[f])
}var b="#"+f;
var e=$(b).html();
if(!e){TS.warn(b+" has no html");
return null
}var d=Handlebars.compile(e);
return d
},load:function(){var e=TS.utility.date.getTimeStamp();
TS.templates.message=TS.templates.compile("message");
TS.templates.message_edit_form=TS.templates.compile("message_edit_form");
TS.templates.message_attachment=TS.templates.compile("message_attachment");
TS.templates.message_screenhero_attachment=TS.templates.compile("message_screenhero_attachment");
TS.templates.message_file_share=TS.templates.compile("message_file_share");
TS.templates.message_file_share_old=TS.templates.compile("message_file_share_old");
TS.templates.message_file_post_share=TS.templates.compile("message_file_post_share");
TS.templates.message_file_space_share=TS.templates.compile("message_file_space_share");
TS.templates.message_file_space_share_old=TS.templates.compile("message_file_space_share_old");
TS.templates.message_file_space_share_preview=TS.templates.compile("message_file_space_share_preview");
TS.templates.message_file_snippet_share=TS.templates.compile("message_file_snippet_share");
TS.templates.message_file_snippet_share_old=TS.templates.compile("message_file_snippet_share_old");
if(TS.boot_data.feature_email_integration||TS.boot_data.feature_email_ingestion){TS.templates.message_file_email_share=TS.templates.compile("message_file_email_share");
TS.templates.file_email=TS.templates.compile("file_email")
}TS.templates.message_file_upload=TS.templates.compile("message_file_upload");
TS.templates.message_file_upload_old=TS.templates.compile("message_file_upload_old");
TS.templates.message_file_snippet_create=TS.templates.compile("message_file_snippet_create");
TS.templates.message_file_snippet_create_old=TS.templates.compile("message_file_snippet_create_old");
TS.templates.message_file_comment=TS.templates.compile("message_file_comment");
TS.templates.message_file_post_comment=TS.templates.compile("message_file_post_comment");
TS.templates.message_file_preview_footer=TS.templates.compile("message_file_preview_footer");
TS.templates.message_file_preview_actions=TS.templates.compile("message_file_preview_actions");
TS.templates.message_file_generic_preview=TS.templates.compile("message_file_generic_preview");
TS.templates.messages_day_divider=TS.templates.compile("messages_day_divider");
TS.templates.messages_unread_divider=TS.templates.compile("messages_unread_divider");
TS.templates.file_reference=TS.templates.compile("file_reference");
TS.templates.file_snippet_reference=TS.templates.compile("file_snippet_reference");
TS.templates.file_post_reference=TS.templates.compile("file_post_reference");
TS.templates.file_space_reference=TS.templates.compile("file_space_reference");
TS.templates.channel_list=TS.templates.compile("channel_list");
TS.templates.channel_members_list=TS.templates.compile("channel_members_list");
TS.templates.channel_create_overlay=TS.templates.compile("channel_create_overlay");
TS.templates.channel_join_overlay=TS.templates.compile("channel_join_overlay");
TS.templates.group_create_overlay=TS.templates.compile("group_create_overlay");
TS.templates.group_join_overlay=TS.templates.compile("group_join_overlay");
TS.templates.member=TS.templates.compile("member");
TS.templates.group=TS.templates.compile("group");
TS.templates.channel=TS.templates.compile("channel");
TS.templates.team_list=TS.templates.compile("team_list");
TS.templates.team_list_no_results=TS.templates.compile("team_list_no_results");
TS.templates.team_tabs=TS.templates.compile("team_tabs");
TS.templates.team_list_item=TS.templates.compile("team_list_item");
TS.templates.team_list_item_details=TS.templates.compile("team_list_item_details");
TS.templates.team_list_item_buttons=TS.templates.compile("team_list_item_buttons");
TS.templates.team_member_preview=TS.templates.compile("team_member_preview");
TS.templates.team_member_edit=TS.templates.compile("team_member_edit");
TS.templates.dm_badge=TS.templates.compile("dm_badge");
TS.templates.file_list_item=TS.templates.compile("file_list_item");
TS.templates.file_header=TS.templates.compile("file_header");
TS.templates.file_preview_head_section=TS.templates.compile("file_preview_head_section");
TS.templates.file_snippet_preview_head_section=TS.templates.compile("file_snippet_preview_head_section");
TS.templates.file_post_preview_head_section=TS.templates.compile("file_post_preview_head_section");
TS.templates.file_space_preview_head_section=TS.templates.compile("file_space_preview_head_section");
TS.templates.file_email_preview_head_section=TS.templates.compile("file_email_preview_head_section");
TS.templates.comments=TS.templates.compile("comments");
TS.templates.comment=TS.templates.compile("comment");
TS.templates.comment_standalone=TS.templates.compile("comment_standalone");
TS.templates.search_widget=TS.templates.compile("search_widget");
TS.templates.search_options=TS.templates.compile("search_options");
TS.templates.search_tabs=TS.templates.compile("search_tabs");
TS.templates.search_files_heading=TS.templates.compile("search_files_heading");
TS.templates.search_team_results=TS.templates.compile("search_team_results");
TS.templates.search_message_results=TS.templates.compile("search_message_results");
TS.templates.search_attachment_extracts=TS.templates.compile("search_attachment_extracts");
TS.templates.search_message_extracts=TS.templates.compile("search_message_extracts");
TS.templates.search_message_results_item=TS.templates.compile("search_message_results_item");
TS.templates.search_results_none=TS.templates.compile("search_results_none");
TS.templates.search_autocomplete_menu=TS.templates.compile("search_autocomplete_menu");
TS.templates.search_autocomplete_menu_channels=TS.templates.compile("search_autocomplete_menu_channels");
TS.templates.search_autocomplete_menu_dms=TS.templates.compile("search_autocomplete_menu_dms");
TS.templates.search_autocomplete_menu_groups=TS.templates.compile("search_autocomplete_menu_groups");
TS.templates.user_status_form=TS.templates.compile("user_status_form");
TS.templates.menu=TS.templates.compile("menu");
TS.templates.emoji_menu=TS.templates.compile("emoji_menu");
TS.templates.emoji_header=TS.templates.compile("emoji_header");
TS.templates.menu_emoticons=TS.templates.compile("menu_emoticons");
TS.templates.menu_member_header=TS.templates.compile("menu_member_header");
TS.templates.menu_member_items=TS.templates.compile("menu_member_items");
TS.templates.menu_member_items_short=TS.templates.compile("menu_member_items_short");
TS.templates.menu_member_footer=TS.templates.compile("menu_member_footer");
TS.templates.menu_user_footer=TS.templates.compile("menu_user_footer");
TS.templates.menu_members_header=TS.templates.compile("menu_members_header");
TS.templates.menu_members_items=TS.templates.compile("menu_members_items");
TS.templates.menu_members_footer=TS.templates.compile("menu_members_footer");
TS.templates.menu_group_header=TS.templates.compile("menu_group_header");
TS.templates.menu_group_items=TS.templates.compile("menu_group_items");
TS.templates.menu_group_footer=TS.templates.compile("menu_group_footer");
TS.templates.menu_channel_header=TS.templates.compile("menu_channel_header");
TS.templates.menu_channel_items=TS.templates.compile("menu_channel_items");
TS.templates.menu_channel_footer=TS.templates.compile("menu_channel_footer");
TS.templates.menu_groups_header=TS.templates.compile("menu_groups_header");
TS.templates.menu_groups_items=TS.templates.compile("menu_groups_items");
TS.templates.menu_team_and_user_items=TS.templates.compile("menu_team_and_user_items");
TS.templates.menu_team_items=TS.templates.compile("menu_team_items");
TS.templates.menu_user_items=TS.templates.compile("menu_user_items");
TS.templates.menu_activity_toggle_items=TS.templates.compile("menu_activity_toggle_items");
TS.templates.menu_file_filter_items=TS.templates.compile("menu_file_filter_items");
TS.templates.menu_file_member_header=TS.templates.compile("menu_file_member_header");
TS.templates.menu_file_member_filter_items=TS.templates.compile("menu_file_member_filter_items");
TS.templates.menu_message_action_items=TS.templates.compile("menu_message_action_items");
TS.templates.menu_comment_action_items=TS.templates.compile("menu_comment_action_items");
TS.templates.menu_file_action_items=TS.templates.compile("menu_file_action_items");
TS.templates.menu_space_action_items=TS.templates.compile("menu_space_action_items");
TS.templates.menu_flexpane_header=TS.templates.compile("menu_flexpane_header");
TS.templates.menu_flexpane_items=TS.templates.compile("menu_flexpane_items");
TS.templates.menu_flexpane_footer=TS.templates.compile("menu_flexpane_footer");
TS.templates.menu_channel_picker_header=TS.templates.compile("menu_channel_picker_header");
TS.templates.menu_channel_picker=TS.templates.compile("menu_channel_picker");
TS.templates.menu_search_filter_items=TS.templates.compile("menu_search_filter_items");
TS.templates.activity_messages=TS.templates.compile("activity_messages");
TS.templates.activity_user_rename=TS.templates.compile("activity_user_rename");
TS.templates.activity_user_files=TS.templates.compile("activity_user_files");
TS.templates.activity_user_files_post=TS.templates.compile("activity_user_files_post");
TS.templates.activity_user_files_space=TS.templates.compile("activity_user_files_space");
TS.templates.activity_user_files_snippet=TS.templates.compile("activity_user_files_snippet");
TS.templates.activity_team_files=TS.templates.compile("activity_team_files");
TS.templates.activity_file_comments=TS.templates.compile("activity_file_comments");
TS.templates.activity_file_stars=TS.templates.compile("activity_file_stars");
TS.templates.activity_file_comment_stars=TS.templates.compile("activity_file_comment_stars");
TS.templates.activity_message_stars=TS.templates.compile("activity_message_stars");
TS.templates.activity_new_channels=TS.templates.compile("activity_new_channels");
TS.templates.activity_new_members=TS.templates.compile("activity_new_members");
TS.templates.activity_unread_messages=TS.templates.compile("activity_unread_messages");
TS.templates.activity_unread_group_messages=TS.templates.compile("activity_unread_group_messages");
TS.templates.activity_unread_dms=TS.templates.compile("activity_unread_dms");
TS.templates.activity_sent_messages=TS.templates.compile("activity_sent_messages");
TS.templates.activity_sent_group_messages=TS.templates.compile("activity_sent_group_messages");
TS.templates.activity_sent_dms=TS.templates.compile("activity_sent_dms");
TS.templates.activity_user_file=TS.templates.compile("activity_user_file");
TS.templates.activity_user_file_post=TS.templates.compile("activity_user_file_post");
TS.templates.activity_user_file_space=TS.templates.compile("activity_user_file_space");
TS.templates.activity_user_file_snippet=TS.templates.compile("activity_user_file_snippet");
TS.templates.activity_user_file_comment=TS.templates.compile("activity_user_file_comment");
TS.templates.activity_user_star=TS.templates.compile("activity_user_star");
TS.templates.activity_starred_by_you=TS.templates.compile("activity_starred_by_you");
TS.templates.activity_day=TS.templates.compile("activity_day");
TS.templates.activity_days_list=TS.templates.compile("activity_days_list");
TS.templates.activity_individual_list=TS.templates.compile("activity_individual_list");
TS.templates.star_item=TS.templates.compile("star_item");
TS.templates.group_create=TS.templates.compile("group_create");
TS.templates.channel_create_dialog=TS.templates.compile("channel_create_dialog");
TS.templates.list_browser_dialog=TS.templates.compile("list_browser_dialog");
TS.templates.list_browser_items=TS.templates.compile("list_browser_items");
TS.templates.list_browser_items_by_membership=TS.templates.compile("list_browser_items_by_membership");
TS.templates.purpose_dialog=TS.templates.compile("purpose_dialog");
TS.templates.file_upload_dialog=TS.templates.compile("file_upload_dialog");
TS.templates.channel_invite_list=TS.templates.compile("channel_invite_list");
TS.templates.group_invite_list=TS.templates.compile("group_invite_list");
TS.templates.channel_member_invite_list=TS.templates.compile("channel_member_invite_list");
TS.templates.group_member_invite_list=TS.templates.compile("group_member_invite_list");
TS.templates.channel_conversion_dialog=TS.templates.compile("channel_conversion_dialog");
TS.templates.channel_data_retention_dialog=TS.templates.compile("channel_data_retention_dialog");
TS.templates.channel_deletion_dialog=TS.templates.compile("channel_deletion_dialog");
TS.templates.channel_options_dialog=TS.templates.compile("channel_options_dialog");
TS.templates.file_sharing=TS.templates.compile("file_sharing");
TS.templates.file_public_link=TS.templates.compile("file_public_link");
TS.templates.prefs_dialog=TS.templates.compile("prefs_dialog");
TS.templates.debug_prefs_dialog=TS.templates.compile("debug_prefs_dialog");
TS.templates.channel_prefs_dialog=TS.templates.compile("channel_prefs_dialog");
TS.templates.help_dialog=TS.templates.compile("help_dialog");
TS.templates.share_dialog=TS.templates.compile("share_dialog");
TS.templates.lightbox_image=TS.templates.compile("lightbox_image");
TS.templates.lightbox_external_image=TS.templates.compile("lightbox_external_image");
TS.templates.lightbox_dialog=TS.templates.compile("lightbox_dialog");
TS.templates.snippet_dialog=TS.templates.compile("snippet_dialog");
TS.templates.generic_dialog=TS.templates.compile("generic_dialog");
TS.templates.generic_dialog_sample=TS.templates.compile("generic_dialog_sample");
TS.templates.privacy_policy_dialog=TS.templates.compile("privacy_policy_dialog");
TS.templates.at_channel_warning_dialog=TS.templates.compile("at_channel_warning_dialog");
TS.templates.at_channel_warning_note=TS.templates.compile("at_channel_warning_note");
if(TS.boot_data.feature_fullscreen_modals){TS.templates.fs_modal=TS.templates.compile("fs_modal");
TS.templates.fs_modal_generic_contents=TS.templates.compile("fs_modal_generic_contents")
}TS.templates.existing_groups=TS.templates.compile("existing_groups");
TS.templates.tip_card=TS.templates.compile("tip_card");
TS.templates.sidebar_theme_css=TS.templates.compile("sidebar_theme_css");
TS.templates.shortcuts_dialog=TS.templates.compile("shortcuts_dialog");
TS.templates.shortcuts_spaces_dialog=TS.templates.compile("shortcuts_spaces_dialog");
TS.templates.omnibox=TS.templates.compile("omnibox");
TS.templates.growl_prompt_overlay=TS.templates.compile("growl_prompt_overlay");
TS.templates.admin_list_item=TS.templates.compile("admin_list_item");
TS.templates.admin_invite_list_item=TS.templates.compile("admin_invite_list_item");
TS.templates.admin_invite_row=TS.templates.compile("admin_invite_row");
if(TS.boot_data.feature_in_app_invites){TS.templates.admin_invite_modal=TS.templates.compile("admin_invite_modal");
TS.templates.admin_invite_sent_row=TS.templates.compile("admin_invite_sent_row");
TS.templates.admin_invite_account_type_header=TS.templates.compile("admin_invite_account_type_header")
}TS.templates.admin_restricted_info=TS.templates.compile("admin_restricted_info");
TS.templates.admin_restricted_info_sso=TS.templates.compile("admin_restricted_info_sso");
TS.templates.admin_restrict_account=TS.templates.compile("admin_restrict_account");
TS.templates.issue_list_item=TS.templates.compile("issue_list_item");
TS.templates.help_issue_div=TS.templates.compile("help_issue_div");
TS.templates.help_issue_reply_comments=TS.templates.compile("help_issue_reply_comments");
TS.templates.messages_search_paging=TS.templates.compile("messages_search_paging");
TS.templates.files_search_paging=TS.templates.compile("files_search_paging");
TS.templates.account_notifications_channel_overrides=TS.templates.compile("account_notifications_channel_overrides");
TS.templates.account_notifications_channel_overrides_row=TS.templates.compile("account_notifications_channel_overrides_row");
TS.templates.billing_contact=TS.templates.compile("billing_contact");
TS.templates.billing_add_contact_form=TS.templates.compile("billing_add_contact_form");
TS.templates.bank_account_verification_dialog=TS.templates.compile("bank_account_verification_dialog");
if(TS.boot_data.feature_screenhero){TS.templates.screenhero_conference=TS.templates.compile("screenhero_conference");
TS.templates.screenhero_conference_participants=TS.templates.compile("screenhero_conference_participants");
TS.templates.screenhero_conference_invitees=TS.templates.compile("screenhero_conference_invitees");
TS.templates.screenhero_conference_share_channels=TS.templates.compile("screenhero_conference_share_channels")
}if(TS.boot_data.feature_spaces){var c=["spaces_connected_members","spaces_connected_member","spaces_connected_member_count","spaces_connected_member_overflow_popover","spaces_link_popover","spaces_style_popover","spaces_shared_in"];
c.forEach(function(f){TS.templates[f]=TS.templates.compile(f)
})
}if(TS.boot_data.feature_flexpane_rework){var d=["channel_page_empty_state","channel_page_details","channel_page_member_tabs","channel_page_member_lists","channel_page_member_row","channel_page_empty_pinned_items","channel_page_pinned_item","message_pinned_file","message_pinned_message","message_pinned_comment"];
d.forEach(function(f){TS.templates[f]=TS.templates.compile(f)
})
}var b=TS.utility.date.getTimeStamp()-e;
TS.log(2,b+"ms spent compiling templates")
},registerPartials:function(){Handlebars.registerPartial("channel",$("#channel_template").html());
Handlebars.registerPartial("member",$("#member_template").html());
Handlebars.registerPartial("member",$("#member_template").html());
Handlebars.registerPartial("team_list_item",$("#team_list_item_template").html());
Handlebars.registerPartial("comment",$("#comment_template").html());
Handlebars.registerPartial("search_widget_message_result",$("#search_widget_message_result_template").html());
Handlebars.registerPartial("search_widget_file_result",$("#search_widget_file_result_template").html());
Handlebars.registerPartial("search_message_results_item",TS.templates.search_message_results_item);
Handlebars.registerPartial("list_browser_items",TS.templates.list_browser_items);
Handlebars.registerPartial("file_public_link",TS.templates.file_public_link);
Handlebars.registerPartial("message_file_preview_actions",TS.templates.message_file_preview_actions);
Handlebars.registerPartial("message_file_preview_footer",TS.templates.message_file_preview_footer);
Handlebars.registerPartial("message_file_generic_preview",TS.templates.message_file_generic_preview);
if(TS.boot_data.feature_spaces){Handlebars.registerPartial("spaces_connected_member_count",$("#spaces_connected_member_count_template").html());
Handlebars.registerPartial("message_file_space_share_preview",TS.templates.message_file_space_share_preview)
}if(TS.boot_data.feature_in_app_invites){Handlebars.registerPartial("admin_invite_account_type_header",TS.templates.admin_invite_account_type_header)
}if(TS.boot_data.feature_flexpane_rework){Handlebars.registerPartial("channel_page_member_row",TS.templates.channel_page_member_row)
}},makeUnreadMessagesDomId:function(b){return TS.utility.makeSafeForDomId("activity_unread_messages_"+b.id)
},makeRxnKeyDomId:function(b){return TS.utility.makeSafeForDomId("rxns_key_"+b)
},makeUnreadGroupMessagesDomId:function(b){return TS.utility.makeSafeForDomId("activity_unread_group_messages_"+b.id)
},makeUnreadDmsDomId:function(b){return TS.utility.makeSafeForDomId("activity_unread_dms_"+b.id)
},makeSentMessagesDomId:function(b){return TS.utility.makeSafeForDomId("activity_sent_messages_"+b.id)
},makeSentGroupMessagesDomId:function(b){return TS.utility.makeSafeForDomId("activity_sent_group_messages_"+b.id)
},makeActivityMessagesDomId:function(b){return TS.utility.makeSafeForDomId("activity_messages_"+b)
},makeActivityDayDomId:function(b){return"activity_day_"+b
},makeIssueListDomId:function(b){return"issue_list_"+b
},makeSentDmsDomId:function(b){return TS.utility.makeSafeForDomId("activity_sent_dms_"+b.id)
},makeMsgDomId:function(b){return TS.utility.makeSafeForDomId("msg_"+b)
},makeMsgLabelDomId:function(b){return TS.utility.makeSafeForDomId("msg_"+b+"_label")
},makeMsgAttachmentTextExpanderDomId:function(c,b){return TS.utility.makeSafeForDomId("msg_rest_text_expander_"+c+"_"+b)
},makeMSRDomId:function(b){return TS.utility.makeSafeForDomId("MSR_"+b.channel.id+"_"+b.ts)
},makeChannelDomId:function(b){return"channel_"+b.id
},makeDayDividerDomId:function(b){return TS.utility.makeSafeForDomId("day_divider_"+b)
},makeGroupDomId:function(b){return"group_"+b.id
},makeMemberDomId:function(b){if(!b){return
}return TS.templates.makeMemberDomIdById(b.id)
},makeMemberDomIdById:function(b){if(!b){return
}return"member_"+b
},makeChannelListDomId:function(b){return"channel_"+b.id+"_member_list"
},makeFileDomId:function(b){return"file_"+b.id
},makeFileCommentsDomId:function(b){return"file_comments_"+b.id
},makeFileContentsDomId:function(b){return"file_contents_"+b.id
},makeUnreadJustDomId:function(b){return"unread_just_"+b.id
},makeUnreadHighlightDomId:function(b){if(!b){return
}return"unread_highlight_"+b.id
},makeMemberPresenceDomClass:function(b){return"member_presence_"+b
},makeMemberPresenceIcon:function(e){var d=TS.templates.makeMemberPresenceDomClass(e.id);
var b='<i class="ts_icon ts_icon_presence_online presence_icon"></i>';
if(e.is_ultra_restricted){d+=" ura";
b='<i class="ts_icon ts_icon_presence_ura_online presence_icon"></i>'
}else{if(e.is_restricted){d+=" ra";
b='<i class="ts_icon ts_icon_presence_ra_online presence_icon"></i>'
}}var c='<span class="presence '+e.presence+" "+d+'" title="'+e.presence+'">'+b+"</span>";
return c
},makeMemberStatusDomClass:function(b){return"member_status_"+b
},memberUserColorChanged:function(e){var b="color_"+e.id;
if(e.color==e.member_color){var d="color_rule_"+b;
var c=$("#"+d);
c.remove();
return
}TS.templates.makeUserColorRule(b,"#"+e.member_color)
},makeUserColorRule:function(b,d){d=TS.utility.htmlEntities(d);
var f="color_rule_"+b;
var c=$("#"+f);
var e;
if(TS.client){e="				."+b+":not(.nuc), 				#col_channels ul li:not(.active):not(.away) > ."+b+":not(.nuc), 				#col_channels:not(.show_presence) ul li > ."+b+":not(.nuc) {					color:"+d+";				}				"
}else{e="			."+b+":not(.nuc) {				color:"+d+";			}			"
}if(c.length){c.html(e)
}else{$('<style type="text/css" id="'+f+'">'+e+"</style>").appendTo("body")
}},sidebarBehaviorPrefChanged:function(){TS.templates.makeSidebarBehaviorRule()
},makeSidebarBehaviorRule:function(){var d;
var c="sidebar_behavior";
var b=$("#"+c);
if(TS.model.prefs.sidebar_behavior=="hide_read_channels"){d="				.channels_list_holder ul li:not(.unread):not(.active):not(.show_in_list_even_though_no_unreads) {					display: none;			}"
}else{if(TS.model.prefs.sidebar_behavior=="hide_read_channels_unless_starred"){d="				.channels_list_holder div:not(#starred_div)>ul li:not(.unread):not(.active):not(.show_in_list_even_though_no_unreads) {					display: none;			}"
}else{if(TS.model.prefs.sidebar_behavior=="shrink_left_column"){d="				.real_names .im_name {					font-size: 0.7rem;				}				.channels_list_holder ul li a {					height: auto;				}				.channels_list_holder ul li {					height: auto;					font-size: .7rem;				}				.channels_list_holder ul li {					height: auto;					line-height: .8rem;				}				.channels_list_holder .section_holder {					margin: .3rem 0 .4rem;				}				.slackbot_icon, .channels_list_holder ul li.group i.prefix {					font-size: 0.4rem;					margin-top: 4px;				}				.channels_list_holder .unread_highlight {					background: none repeat scroll 0 0 #eb4d5c;					font-size: 0.5rem;					font-weight: 700;					line-height: 10px;					padding: 0 9px;				}				#im-list .presence i.presence_icon, #starred-list .presence i.presence_icon {					font-size: 7px;				}				.channels_list_holder h2, .list_more {					font-size: .6rem;			}"
}}}if(d){if(b.length){b.text(d)
}else{$('<style type="text/css" id="'+c+'">'+d+"</style>").appendTo("head")
}}else{$("#"+c).remove()
}}});
var a=function(){var e,c,d,b;
$(".member_image").each(function(){b=$(this);
e=b.data("member-id");
c=b.data("thumb-size");
d=!(b.is("a"));
if(e&&c){$(this).replaceWith(TS.templates.builders.makeMemberPreviewLinkImage(e,c,false,d))
}});
b=null
}
})();
(function(){TS.registerModule("templates.builders",{onStart:function(){},activityDaysListHTML:function(c){var b="";
if(c){for(var a=0;
a<c.length;
a++){b+=TS.templates.activity_day({content:TS.templates.builders.activityListHTML(c[a].items,"team",c[a].date),date_str:c[a].date})
}}b=TS.templates.activity_days_list({content:b,has_more:TS.activity.team_has_more});
return b
},activityIndividualListHTML:function(b){var a=TS.templates.activity_individual_list({content:TS.templates.builders.activityListHTML(b.activity,"individual"),has_more:!!b.individual_activity_next_ts,member:b});
return a
},debug_items:{},debug_items_index:0,activityListHTML:function(j,l,d){var n;
var f="";
var h;
var b=TS.qs_args.debug_activity=="1";
if(j){for(var e=0;
e<j.length;
e++){n=j[e];
if(b){var k="act_item_"+(TS.templates.builders.debug_items_index++);
TS.templates.builders.debug_items[k]=n;
f+='<p class="admin-section" style="padding: 2px">Activity type: <a onclick="TS.dir(0, TS.templates.builders.debug_items[\''+k+"'])\">"+n.type+"</a></p>"
}h={item:n,feed_type:l};
if((n.type=="file_stars"||n.type=="file_comment_stars"||n.type=="message_stars")&&h.item.stars){for(var c=0;
c<h.item.stars.length;
c++){if(TS.model.user.id==h.item.stars[c].user){h.can_unstar=true;
break
}}}if(d){h.date_str=d
}if(n.type=="file_comments"||n.type=="user_file_comment"){h.item["file"]["icon_class"]=TS.utility.getImageIconClass(n.file,"thumb_80")
}else{if(n.type=="user_file"){h.item["file"]["icon_class"]=TS.utility.getImageIconClass(n.file,"thumb_80")
}else{if(n.type=="user_files"){$.each(n.files,function(i,m){h.item["files"][i]["icon_class"]=TS.utility.getImageIconClass(m,"thumb_80")
})
}}}if(l=="individual"){h.current_user_id=TS.model.user.id
}var a,g;
if((n.type=="starred_by_you"||n.type=="user_star")&&n.item.type=="message"){a=TS.channels.getChannelById(n.item.channel);
if(!a){a=TS.groups.getGroupById(n.item.channel)
}if(a){if(!h.item["item"]["permalink"]){h.item["item"]["permalink"]=TS.utility.msgs.constructMsgPermalink(a,n.item.message.ts)
}}else{if(n.type!="user_star"){a=TS.ims.getImById(n.item.channel);
if(a){g=TS.members.getMemberById(a.user);
h.item["item"]["message"]["recipient"]=g
}}}h.model_ob=a;
if(!a){continue
}}if(n.type=="message_stars"){a=TS.channels.getChannelById(n.channel);
if(!a){a=TS.groups.getGroupById(n.channel)
}if(a){if(!h.item["message"]["permalink"]){h.item["message"]["permalink"]=TS.utility.msgs.constructMsgPermalink(a,n.message.ts)
}}else{a=TS.ims.getImById(n.channel);
if(a){g=TS.members.getMemberById(a.user);
h.item["message"]["recipient"]=g
}}h.model_ob=a;
if(!a){continue
}}if(n.type=="messages"){if(n.channels_with_messages>0||n.dms.length>0||n.groups.length>0){h.expanded=TS.activity.view.isActivityMessagesListExpanded(d);
f+=TS.templates.activity_messages(h)
}}else{if(n.type=="user_files"){if(n.num_files==1){switch(n.files[0].mode){case"post":f+=TS.templates.activity_user_files_post(h);
break;
case"space":f+=TS.templates.activity_user_files_space(h);
break;
case"snippet":f+=TS.templates.activity_user_files_snippet(h);
break;
default:f+=TS.templates.activity_user_files(h);
break
}}else{f+=TS.templates.activity_user_files(h)
}}else{if(n.type=="team_files"){}else{if(n.type=="file_comments"){f+=TS.templates.activity_file_comments(h)
}else{if(n.type=="file_stars"){f+=TS.templates.activity_file_stars(h)
}else{if(n.type=="file_comment_stars"){f+=TS.templates.activity_file_comment_stars(h)
}else{if(n.type=="message_stars"){f+=TS.templates.activity_message_stars(h)
}else{if(n.type=="starred_by_you"){f+=TS.templates.activity_starred_by_you(h)
}else{if(n.type=="user_star"){if(n.item.type!="im"){f+=TS.templates.activity_user_star(h)
}}else{if(n.type=="new_channels"){f+=TS.templates.activity_new_channels(h)
}else{if(n.type=="new_members"){f+=TS.templates.activity_new_members(h)
}else{if(n.type=="unread_messages"){f+=TS.templates.activity_unread_messages(h)
}else{if(n.type=="unread_group_messages"){f+=TS.templates.activity_unread_group_messages(h)
}else{if(n.type=="unread_dms"){f+=TS.templates.activity_unread_dms(h)
}else{if(n.type=="sent_messages"){f+=TS.templates.activity_sent_messages(h)
}else{if(n.type=="sent_group_messages"){f+=TS.templates.activity_sent_group_messages(h)
}else{if(n.type=="sent_dms"){f+=TS.templates.activity_sent_dms(h)
}else{if(n.type=="user_file"){switch(n.file.mode){case"post":f+=TS.templates.activity_user_file_post(h);
break;
case"space":f+=TS.templates.activity_user_file_space(h);
break;
case"snippet":f+=TS.templates.activity_user_file_snippet(h);
break;
default:f+=TS.templates.activity_user_file(h);
break
}}else{if(n.type=="user_file_comment"){f+=TS.templates.activity_user_file_comment(h)
}else{if(n.type=="user_rename"){}else{f+="<div>UNHANDLED: "+n.type+"</div>";
continue
}}}}}}}}}}}}}}}}}}}}}}return f
},fileHTML:function(b,c){var f=TS.members.getMemberById(b.user);
var e=TS.files.getFileActions(b);
var a;
var d={member:f,file:b,for_search:c,icon_class:TS.utility.getImageIconClass(b,"thumb_80"),is_email:b.mode=="email",is_space:b.mode=="space",is_post:b.mode=="post",is_snippet:b.mode=="snippet",is_hosted_or_external:b.mode=="hosted"||b.mode=="external",can_share:!!e.share};
if(b.mode=="external"){d.external_filetype_html=TS.templates.builders.makeExternalFiletypeHTML(b)
}if(b.mode=="email"){d.to_more_count=b.to.length-1;
d.cc_more_count=b.cc.length-1
}a=TS.templates.file_list_item(d);
return a
},buildMsgHTML:function(I,e){if(e){TS.dir(0,I)
}try{var f=true;
var H=I.msg;
if(false&&H.text){H=TS.utility.clone(H);
H.text+=" <slack-action://BSLACKBOT/help/files/D026MK7NF|testing>"
}var K=I.model_ob;
var A=I.prev_msg;
var Q=!!I.highlight;
var q=!!I.no_attachments;
var F=!!I.standalone;
var w=!!I.full_date;
if(TS.model.prefs.fuller_timestamps&&!w){w=!TS.utility.date.sameDay(TS.utility.date.toDateObject(H.ts),new Date())
}var y=I.jump_link;
var g=!!I.starred_items_list;
var r=I.rxn_options||{};
var m=(I.container_id)?"#"+I.container_id:"";
var s=!!I.enable_slack_action_links;
var z=I.theme;
if(!z){z=TS.model.prefs.theme
}var x="";
var L=TS.members.getMemberById(H.user);
var o=true;
var c=!F;
var T=false;
var B=false;
var N=TS.utility.date.toDateObject(H.ts);
var i=false;
var J=false;
var d=!!(H.rsp_id);
var p=false;
var G=H.user;
var k=H.is_ephemeral;
if(!G&&f){G=TS.templates.builders.getBotIdentifier(H)
}var S=TS.utility.msgs.shouldHaveBotLabel(H,L);
var u;
if(A){u=(A.subtype=="file_comment"&&A.comment)?A.comment.user:A.user;
if(!u&&f){u=TS.templates.builders.getBotIdentifier(A)
}}if(!H.no_display&&!F){if(A){var C=TS.utility.date.toDateObject(A.ts);
if(K.last_read<=A.ts){B=true
}if(H.subtype&&H.subtype=="file_comment"&&H.comment){G=H.comment.user
}if(TS.utility.msgs.automated_subtypes.indexOf(H.subtype)!=-1){c=true;
o=true
}else{if(u==G&&TS.utility.msgs.automated_subtypes.indexOf(A.subtype)===-1){if(!H.subtype&&A.subtype&&A.subtype=="file_comment"){c=true;
o=true
}else{if(z=="light"&&H.subtype=="file_share"||H.subtype=="file_mention"){c=true
}else{c=false
}if(!A.subtype||(TS.templates.builders.getBotIdentifier(A)&&f)){o=false
}if(TS.utility.msgs.isTempMsg(H)&&(H.type=="bot_message"||H.user=="USLACKBOT")){o=true
}}}}if(!d&&!TS.utility.date.sameDay(N,C)){if(!$(m+' div.day_divider[data-date="'+TS.utility.date.toCalendarDate(H.ts)+'"]').length){try{x+=TS.templates.messages_day_divider({ts:H.ts})
}catch(P){TS.logError(P,"Problem with TS.templates.messages_day_divider 1.1 msg.ts:"+(H?H.ts:"no msg?"))
}}i=true;
var v=$(m+" div.day_divider");
if(v.length>0){var t;
var b=$(v[v.length-1]);
if(b.length){t="";
try{t=TS.templates.messages_day_divider({ts:b.data("ts")})
}catch(P){TS.logError(P,"Problem with TS.templates.messages_day_divider 2.1 $last_divider.data('ts'):"+b.data("ts"))
}b.replaceWith(t)
}if(v.length>1){var O=$(v[v.length-2]);
if(O.length){t="";
try{t=TS.templates.messages_day_divider({ts:O.data("ts")})
}catch(P){TS.logError(P,"Problem with TS.templates.messages_day_divider 3.1 $second_last_divider.data('ts'):"+O.data("ts"))
}O.replaceWith(t)
}}}}if(!d&&TS.utility.date.distanceInMinutes(N,C)>TS.model.msg_activity_interval){J=true;
K.last_time_divider=N
}}else{if(!$(m+' div.day_divider[data-date="'+TS.utility.date.toCalendarDate(H.ts)+'"]').length){try{x+=TS.templates.messages_day_divider({ts:H.ts})
}catch(P){TS.logError(P,"Problem with TS.templates.messages_day_divider 4.1 msg.ts:"+(H?H.ts:"no msg?"))
}}J=true;
K.last_time_divider=N
}}if(J){o=true;
T=true
}if(H.type!="message"){o=true
}if(H.subtype=="bot_message"){if(TS.templates.builders.getBotIdentifier(H)){if(!f){o=true
}}else{o=false
}}if(H.subtype=="me_message"||(A&&A.subtype=="me_message")){o=true;
c=true
}var R=true;
if(F){R=false
}var D=TS.utility.msgs.getMsgActions(H);
var a=false;
if(D.edit_msg||D.delete_msg||D.pin_msg||D.unpin_msg||D.add_rxn){a=true
}var h=TS.utility.msgs.isMessageUserHidden(H);
var E=false;
if(h){if(u==G){return""
}E=true
}var n={msg:H,actions:D,show_actions_cog:a,member:L,show_user:o,hide_user_name:p,show_divider:c,first_in_block:T,unread:B,unprocessed:d,highlight:Q,model_ob:K,do_inline_imgs:R,msg_dom_id:TS.templates.makeMsgDomId(H.ts),standalone:F,full_date:w,jump_link:y,show_resend_controls:H.ts in TS.model.display_unsent_msgs,starred_items_list:g,rxn_options:r,theme:z,no_attachments:q,is_ephemeral:k,enable_slack_action_links:s,minimal_view:E,is_bot:S};
if(!TS.utility.msgs.isTempMsg(H)){n.permalink=TS.utility.msgs.constructMsgPermalink(K,H.ts)
}var M;
if(H.subtype=="file_share"||H.subtype=="file_mention"){if(!H.file){}else{n.file=H.file;
n.is_mention=(H.subtype=="file_mention");
n.lightbox=false;
if(H.file.thumb_360_w==360||H.file.thumb_360_h==360){n.lightbox=true
}n.show_retina_thumb=false;
if(TS.model.is_retina&&H.file.thumb_720){n.show_retina_thumb=true
}if(H.subtype=="file_share"&&H.upload){n.show_initial_comment=true;
if(H.file.mode=="snippet"){if(TS.boot_data.feature_fix_files&&TS.qs_args.snippet_previews=="1"){x+=TS.templates.message_file_snippet_create(n)
}else{x+=TS.templates.message_file_snippet_create_old(n)
}}else{if(H.file.mode=="email"){n.is_added=true;
x+=TS.templates.message_file_email_share(n)
}else{n.icon_class=TS.utility.getImageIconClass(H.file,"thumb_80");
try{if(TS.boot_data.feature_fix_files){x+=TS.templates.message_file_upload(n)
}else{x+=TS.templates.message_file_upload_old(n)
}}catch(P){var U=H.ts;
try{var l=TS.utility.clone(H);
delete l.text;
U+=" "+JSON.stringify(l,null,"\t")
}catch(j){}TS.logError(P,"Problem with TS.templates.message_file_upload msg:"+U);
x+='<p class="small_top_margin small_bottom_margin"><code>Error rendering file_share msg</code></p>'
}}}}else{if(H.file.user!=H.user){M=TS.members.getMemberById(H.file.user);
n.uploader=M
}if(H.file.mode=="snippet"){if(TS.boot_data.feature_fix_files&&TS.qs_args.snippet_previews=="1"){x+=TS.templates.message_file_snippet_share(n)
}else{x+=TS.templates.message_file_snippet_share_old(n)
}}else{if(H.file.mode=="post"){x+=TS.templates.message_file_post_share(n)
}else{if(H.file.mode=="space"){if(TS.boot_data.feature_fix_files){x+=TS.templates.message_file_space_share(n)
}else{x+=TS.templates.message_file_space_share_old(n)
}}else{if(H.file.mode=="email"){x+=TS.templates.message_file_email_share(n)
}else{n.icon_class=TS.utility.getImageIconClass(H.file,"thumb_40");
if(H.file.is_external){n.external_filetype_html=TS.templates.builders.makeExternalFiletypeHTML(H.file)
}if(TS.boot_data.feature_fix_files){x+=TS.templates.message_file_share(n)
}else{x+=TS.templates.message_file_share_old(n)
}}}}}}}}else{if(H.subtype=="file_comment"){if(A&&!A.no_display&&A.file&&H.file&&H.file.id==A.file.id){n.show_divider=false;
if(!i){n.is_file_convo_continuation=true
}}n.show_comment_quote_icon=true;
if(A&&!A.no_display&&A.file&&H.file&&H.file.id==A.file.id){if(A.subtype=="file_share"&&A.upload&&A.file.initial_comment){if(!i){n.show_comment_quote_icon=false
}}if(A.subtype=="file_comment"){if(!i){n.show_comment_quote_icon=false
}}}n.file=H.file;
n.icon_class=TS.utility.getImageIconClass(H.file,"thumb_40");
n.comment=H.comment;
L=(H.comment)?TS.members.getMemberById(H.comment.user):null;
n.member=L;
if(H.file&&H.file.user!=H.comment.user){M=TS.members.getMemberById(H.file.user);
n.uploader=M
}if(H.file&&H.file.mode=="post"){x+=TS.templates.message_file_post_comment(n)
}else{x+=TS.templates.message_file_comment(n)
}}else{x+=TS.templates.message(n)
}}x=x.replace(/\ue000/g,"").replace(/\ue001/g,"");
return x
}catch(P){var U="";
if(H){U="msg.ts:"+H.ts;
delete I.model_ob;
try{I.msg=TS.utility.clone(H);
I.msg.text="REDACTED";
U+=" "+JSON.stringify(I,null,"  ")
}catch(j){}}TS.logError(P,"Problem in buildMsgHTML with_args "+U);
return""
}},formatSoundUrl:function(b,a){return""
},buildAttachmentHTML:function(b){var k=TS.templates.makeMsgDomId(b.msg.ts);
var q=b.attachment;
var x=TS.shared.getActiveModelOb();
if(q.screenhero_config){return TS.templates.message_screenhero_attachment({screenhero_config:q.screenhero_config,share_url_prefix:TS.utility.screenhero.share_url_prefix,shared_ts:b.msg.ts,shared_channel_or_group_or_im:x.name,shared_in_im:x.is_im})
}if(TS.templates.builders.shouldDoSimpleAttachment(q,b.msg)){if(q.video_html){return TS.templates.builders.buildInlineVideoTogglerAndDiv(q.from_url,k)
}else{if(q.image_url){return TS.templates.builders.buildInlineImgTogglerAndDiv(q.from_url,k,b)
}else{if(q.audio_url){return" "+TS.templates.builders.formatSoundUrl(q,b.msg)
}}}}var A=true;
var m="";
var l="";
if(b.show_initial_caret||b.show_media_caret){if(q.video_html){var a=TS.model.inline_videos[q.from_url||q.thumb_url];
if(a){var z=true;
m=TS.templates.builders.buildInlineVideoToggler(q.from_url||q.thumb_url,k,z);
l=q.thumb_url;
A=TS.inline_videos.shouldExpand(k,a)
}}else{if(q.audio_html||q.audio_url){var j=TS.model.inline_audios[q.audio_html||q.audio_url];
if(j){m=TS.templates.builders.buildInlineAudioToggler(q.audio_html||q.audio_url,k);
l=q.audio_html||q.audio_url;
A=TS.inline_audios.shouldExpand(k,j)
}}else{if(q.other_html){var s=TS.model.inline_others[q.other_html];
if(s){m=TS.templates.builders.buildInlineOtherToggler(q.other_html,k);
l=q.other_html;
A=TS.inline_others.shouldExpand(k,s)
}}else{if(q.image_url){var p=TS.model.inline_imgs[q.from_url||q.image_url];
if(p){var v=!b.show_media_caret;
m=TS.templates.builders.buildInlineImgToggler(q.from_url||q.image_url,k,v);
l=q.image_url;
A=TS.inline_imgs.shouldExpand(k,p)
}}else{var y=TS.model.inline_attachments[q.from_url];
if(y){l=q.from_url;
m=TS.templates.builders.buildInlineAttachmentToggler(q.from_url,k);
A=TS.inline_attachments.shouldExpand(k,y)
}else{TS.warn("no inline_attachment for "+q.from_url)
}}}}}}if(q.color){if(typeof q.color=="number"){q.color=q.color.toString()
}if(!q.color.indexOf){TS.warn("msg "+b.msg.ts+" has an invalid (non string) color:"+q.color+" (removed in client)");
delete q.color
}else{if(q.color.indexOf("#")!=-1){TS.warn("msg "+b.msg.ts+" has an invalid color:"+q.color+" (fixed in client)")
}q.color=q.color.replace(/\#/g,"")
}}var n=[];
var r=[];
if(q.fields){var C;
var w;
var o;
for(var B=0;
B<q.fields.length;
B++){w=true;
C=q.fields[B];
if(o&&C["short"]&&o["short"]&&o._new_row){w=false
}C._new_row=w;
o=C;
if(C["short"]){n.push(C)
}else{r.push(C)
}}}var e=q._short_text&&!TS.inline_attachments.shouldExpandText(TS.templates.makeMsgAttachmentTextExpanderDomId(b.msg.ts,q._index));
var d=!!q.more;
var t=q.ts_link||q.from_url||q.title_link||q.author_link;
var h=q.thumb_link||t;
var g=false;
if(!x){TS.warn("need to get model_ob passed in here somehow! for expanding messages in activity feed")
}else{if(b.can_delete!==false){g=(q.id||q.id===0)&&(q.from_url||b.msg.text)&&((TS.model.user.is_admin&&!x.is_im)||TS.model.user.id==b.msg.user)&&(b.msg.subtype!=="pinned_item")
}}var u=q.thumb_url&&!q.image_url&&!q.video_html&&!q.audio_html;
var c=(u)?q.proxied_thumb_url||q.thumb_url:null;
return TS.templates.message_attachment({is_text_collapsed:e,has_more:d,attachment:q,short_fields:n,long_fields:r,url:b.url,msg:b.msg,initial_caret_html:(b.show_initial_caret)?m:"",media_caret_html:(b.show_media_caret)?m:"",msg_dom_id:k,expand_it:(b.show_initial_caret)?A:true,expand_media:(b.show_media_caret)?A:true,real_src:l,bg_color:q.color||"e3e4e6",is_standalone:(!b.msg.text||b.msg.ignore_if_attachments_supported)||!q.pretext,show_fields_table:TS.qs_args.show_fields_table!="0",thumb_at_top:!window.attach_thumb_align_title,can_delete:g,ts_link:t,thumb_link:h,small_thumb:u,small_thumb_url:c,max_width_class:u?"right_thumb_max_w":"",show_fallback:TS.model.show_attachment_fallback,enable_slack_action_links:b.enable_slack_action_links===true,show_action_links:b.enable_slack_action_links===true})
},shouldDoSimpleAttachment:function(c,b){var a=false;
if((c.image_url||c.audio_url)&&c.from_url){if(b&&b.text){if(b.text.indexOf(c.from_url)!=-1){a=true
}if(TS.model.ampersands_are_inconsistent_in_from_urls){if(b.text.indexOf(c.from_url.replace(/\&/g,"&amp;"))!=-1){a=true
}}}if(c.service_name||c.title){a=false
}}return a
},formatAttachments:function(g,a){a=(a===true);
var d="";
if(!g.attachments){return d
}var f;
for(var c=0;
c<g.attachments.length;
c++){f=g.attachments[c];
if(!f){TS.info("formatAttachments bad attach");
TS.dir(0,g);
continue
}if(f.slack_file_id){var b=TS.files.getFileById(f.slack_file_id);
if(b){if(!b.is_deleted&&!f._slack_file_is_deleted){var e={icon_class:TS.utility.getImageIconClass(b,"thumb_40"),file:b,member:TS.members.getMemberById(g.user),msg_dom_id:TS.templates.makeMsgDomId(g.ts),uploader:TS.members.getMemberById(b.user)};
if(b.mode=="snippet"){d+=TS.templates.file_snippet_reference(e)
}else{if(b.mode=="post"){d+=TS.templates.file_post_reference(e)
}else{if(b.mode=="space"){d+=TS.templates.file_space_reference(e)
}else{e.icon_class=TS.utility.getImageIconClass(b,"thumb_40");
e.lightbox=false;
if(b.thumb_360_w==360||b.thumb_360_h==360){e.lightbox=true
}if(b.is_external){e.external_filetype_html=TS.templates.builders.makeExternalFiletypeHTML(b)
}d+=TS.templates.file_reference(e)
}}}}}else{if(!f._slack_file_is_deleted){TS.files.fetchFileInfo(f.slack_file_id,function(k,j){if(j&&!j.is_deleted){var i=TS.inline_attachments.getAttachmentBySlackFileId(g.attachments,j.id);
if(i){i._slack_file=j
}var h=TS.shared.getActiveModelOb();
if(h){TS.utility.msgs.updateFileMsgs(h,j)
}}})
}}continue
}if(f.from_url&&(TS.boot_data.feature_attachments_inline||TS.templates.builders.shouldDoSimpleAttachment(f,g))){d+="";
continue
}if(!TS.inline_attachments.shouldShow(f,g)){d+="";
continue
}d+=TS.templates.builders.buildAttachmentHTML({attachment:f,url:null,msg:g,show_initial_caret:TS.templates.builders.shouldDoSimpleAttachment(f,g),show_media_caret:f.video_html||f.image_url||f.audio_html||f.audio_url||f.other_html,enable_slack_action_links:a})
}return d
},buildJoinLeaveRollUpStr:function(a){var b="";
if(a.is_in){if(a.joined&&a.left){b="left and rejoined"
}else{b="joined"
}}else{if(a.joined&&a.left){b="joined and left"
}else{b="left"
}}return b
},formatMessageByType:function(e,d,o,j){var g="";
var h;
if(e.ignore_if_attachments_supported){return g
}d=(d===true);
o=(o===true);
var t,f,p;
if(e._jl_rollup_hash&&e.user in e._jl_rollup_hash.users){t=j;
p=TS.members.getMemberById(e.inviter);
var a=e._jl_rollup_hash.users[e.user];
var l=TS.templates.builders.buildJoinLeaveRollUpStr(a);
l+=(t?" #"+t.name:" the channel");
if(a.is_in&&p){l+=" by invitation from <@"+p.id+"|"+p.name+">"
}var r=[];
var s=[];
var q="along with";
var m;
for(var n in e._jl_rollup_hash.users){if(n==e.user){continue
}m=e._jl_rollup_hash.users[n];
if(m.is_in===a.is_in){if(m.is_in){if(m.inviter==e.user){q="and invited"
}if(m.inviter&&(m.inviter==a.inviter||m.inviter==e.user)){r.push("<@"+n+">")
}else{s.push("<@"+n+"> "+TS.templates.builders.buildJoinLeaveRollUpStr(m))
}}else{r.push("<@"+n+">")
}}else{s.push("<@"+n+"> "+TS.templates.builders.buildJoinLeaveRollUpStr(m))
}}if(r.length){l+=", "+q+" "+r.join(", ")
}if(s.length){l+=". Also, "+s.join(", ")+"."
}g=TS.format.formatWithOptions(l,null,{no_highlights:true,no_specials:true})
}else{if(e.subtype=="channel_join"){t=j;
p=TS.members.getMemberById(e.inviter);
if(p){h="joined"+(t?" #"+t.name:" the channel")+" from an invitation by <@"+p.id+"|"+p.name+">";
g=TS.format.formatWithOptions(h,e,{no_highlights:true,no_specials:true})
}else{g="joined"+(t?" #"+t.name:" the channel")
}}else{if(e.subtype=="channel_leave"){t=j;
g="left"+(t?" #"+t.name:" the channel")
}else{if(e.subtype=="channel_name"){g='renamed the channel from "'+e.old_name+'" to "'+e.name+'"'
}else{if(e.subtype=="channel_topic"){if(!e.topic){g="cleared the channel topic"
}else{g='set the channel topic: <span class="topic">'+TS.format.formatWithOptions(e.topic,e,{no_highlights:true,no_specials:true})+"</span>"
}}else{if(e.subtype=="channel_purpose"){if(!e.purpose){g="cleared the channel purpose"
}else{g='set the channel purpose: <span class="purpose">'+TS.format.formatWithOptions(e.purpose,e,{no_highlights:true,no_specials:true})+"</span>"
}}else{if(e.subtype=="group_join"){f=j;
p=TS.members.getMemberById(e.inviter);
if(p){h="from an invitation by <@"+p.id+"|"+p.name+">";
g="joined"+(f?" "+TS.model.group_prefix+f.name:" the group")+" "+TS.format.formatWithOptions(h,e,{no_highlights:true,no_specials:true})
}else{g="joined"+(f?" "+TS.model.group_prefix+f.name:" the group")
}}else{if(e.subtype=="group_leave"){f=j;
g="left"+(f?" "+TS.model.group_prefix+f.name:" the group")
}else{if(e.subtype=="group_name"){g='renamed the group from "'+e.old_name+'" to "'+e.name+'"'
}else{if(e.subtype=="group_topic"){if(!e.topic){g="cleared the group topic"
}else{g="set the group topic: "+TS.format.formatWithOptions(e.topic,e,{no_highlights:true,no_specials:true})
}}else{if(e.subtype=="group_purpose"){if(!e.purpose){g="cleared the group purpose"
}else{g="set the group purpose: "+TS.format.formatWithOptions(e.purpose,e,{no_highlights:true,no_specials:true})
}}else{if(e.subtype=="group_archive"){f=j;
g="archived"+(f?" "+TS.model.group_prefix+f.name:" the group");
if(TS.client&&f&&f.is_archived){if(TS.model.archive_view_is_showing){g+='. The contents will still be available in search and browsable in the <a target="_blank" href="/archives/'+f.name+'">archives</a>.'
}else{g+='. The contents will still be available in search and browsable in the <a target="_blank" href="/archives/'+f.name+'">archives</a>. 						It can also be un-archived at any time. To close it now, <a onclick="TS.groups.closeGroup(\''+f.id+"')\">click here</a>."
}}}else{if(e.subtype=="group_unarchive"){f=j;
g="un-archived"+(f?" "+TS.model.group_prefix+f.name:" the group")
}else{if(e.subtype=="channel_archive"){t=j;
g="archived"+(t?" #"+t.name:" the channel");
if(TS.client&&t&&t.is_archived){if(TS.model.archive_view_is_showing){g+='. The contents will still be available in search and browsable in the <a target="_blank" href="/archives/'+t.name+'">archives</a>.'
}else{g+='. The contents will still be available in search and browsable in the <a target="_blank" href="/archives/'+t.name+'">archives</a>. 						It can also be un-archived at any time. To close it now, <a onclick="TS.channels.closeArchivedChannel(\''+t.id+"')\">click here</a>."
}}}else{if(e.subtype=="channel_unarchive"){t=j;
g="un-archived"+(t?" #"+t.name:" the channel")
}else{if(e.subtype=="me_message"){g="<i>"+TS.format.formatWithOptions(e.text,e,{do_inline_imgs:d})+"</i>"
}else{if(e.subtype=="play_sound"){g='played "'+e.sound+'"'
}else{if(e.subtype==="pinned_item"&&TS.boot_data.feature_pins&&!e.no_display){if(e.item_type==="F"){var i=!!e.item?TS.members.getMemberById(e.item.user):null;
g=TS.templates.message_pinned_file({file:e.item,own_file:!!e.item&&e.item.user===e.user,theme:TS.model.prefs.theme,uploader:i,model_ob:j,display_name:TS.members.getMemberDisplayName(i)})
}else{if(e.item_type==="Fc"){g=TS.templates.message_pinned_comment({theme:TS.model.prefs.theme,model_ob:j});
var c;
if(e.item){c=TS.members.getMemberById(e.item.user)
}if(c&&e.item.comment){g+=TS.templates.builders.buildAttachmentHTML({attachment:{author_icon:c.profile.image_24,author_name:c.profile.real_name,author_subname:c.name,color:"D0D0D0",ts:e.item.timestamp,text:e.item.comment,mrkdwn_in_hash:{text:true}},msg:e})
}}else{if(e.item_type==="C"||e.item_type==="G"){g=TS.templates.message_pinned_message({theme:TS.model.prefs.theme,model_ob:j});
var b;
if(e.item){b=TS.members.getMemberById(e.item.user)
}if(b&&e.item.text){g+=TS.templates.builders.buildAttachmentHTML({attachment:{author_icon:b.profile.image_24,author_name:b.profile.real_name,author_subname:b.name,color:"D0D0D0",ts:e.item.ts,text:e.item.text,mrkdwn_in_hash:{text:true}},msg:e})
}}}}}else{g=TS.format.formatWithOptions(e.text,e,{do_inline_imgs:d,enable_slack_action_links:o})
}}}}}}}}}}}}}}}}}}if(!g&&g!==""){TS.warn("no html msg.subtype:"+e.subtype);
return""
}g=TS.utility.msgs.handleSearchHighlights(g);
return g
},msgHtmlForSearch:function(e,a,d,b){if(e.subtype!=="bot_message"){e.subtype=null
}var c="";
if(d==="extract"){c+='<div class="search_result_with_extract">';
c+='<div class="extract_expand_icons"><i class="ts_icon ts_icon_chevron_up up_arrow"></i><i class="ts_icon ts_icon_chevron_down down_arrow"></i></div>'
}else{if(d==="context"){c+='<div class="search_result_for_context">'
}else{c+='<div class="search_result_for_extra_context">'
}}c+=TS.templates.builders.buildMsgHTML({msg:e,model_ob:a,container_id:"search_message_results",standalone:true});
c+="</div>";
return c
},buildMsgHTMLForSearch:function(f){var c=f.channel;
var d="";
var e=[];
if(f.previous_2){e.push(f.previous_2)
}if(f.previous){e.push(f.previous)
}e.push(f);
if(f.next){e.push(f.next)
}if(f.next_2){e.push(f.next_2)
}if(f.next_2&&!f.next_2.user&&f.next_2.subtype==="file_comment"){var a=/^<@(U\w+)|/.exec(f.next_2.text);
if(a&&a.length===2){var b=a[1];
var g=TS.members.getMemberById(b);
if(g){f.next_2.user=g.id;
f.next_2.username=g.name
}}}if(e.length>1&&!TS.search.view.resultHasExtracts(f)){f.force_extract_type="extract";
if(f.previous){f.previous.force_extract_type="context"
}if(f.next){f.next.force_extract_type="context"
}}e.forEach(function(j,i){var h;
if(j.force_extract_type){h=j.force_extract_type
}else{h=TS.search.view.determineMessageResultType(e,i)
}d+=TS.templates.builders.msgHtmlForSearch(j,c,h,f.extracts_expanded)
});
return d
},search_ellipsis:'<span class="extract_ellipsis"></span>',buildStar:function(g,b,f){if(!g){return""
}if(g=="channel"&&b&&typeof b=="string"){b=TS.channels.getChannelById(b)
}else{if(g=="group"&&b&&typeof b=="string"){b=TS.groups.getGroupById(b)
}else{if(g=="im"&&b&&typeof b=="string"){b=TS.ims.getImById(b)
}}}if(!b){return""
}if(g=="message"&&f&&typeof f=="string"){var i=f;
f=TS.channels.getChannelById(i);
if(!f){f=TS.ims.getImById(i)
}if(!f){f=TS.groups.getGroupById(i)
}}var j={};
var d="";
var c=[];
var h=["star","ts_icon","ts_icon_star","ts_icon_inherit"];
var a=b.id||b.ts;
var e=(f)?f.id:null;
if(g=="message"){if(!e){return""
}j["data-msg-id"]=a;
j["data-c-id"]=e;
if(TS.utility.msgs.isTempMsg(b)){h.push("hidden")
}}else{if(g=="file"){j["data-file-id"]=a
}else{if(g=="file_comment"){j["data-comment-id"]=a;
j["data-file-id"]=e;
h.push("star_comment")
}else{if(g=="channel"){j["data-channel-id"]=a
}else{if(g=="group"){j["data-group-id"]=a
}else{if(g=="im"){j["data-im-id"]=a
}else{TS.error("buildStar needs to handle star item type:"+g);
return""
}}}}}}if(b.is_starred){h.push("starred")
}h.push("star_"+g);
$.each(j,function(k,l){c.push(k+'="'+l+'"')
});
d="<span "+c.join(" ")+' class="'+h.join(" ")+'"></span>';
return d
},buildMentionHTML:function(k){var e=k.message;
var i="";
if(!e){return i
}if(e.subtype=="file_share"||e.subtype=="file_mention"||e.subtype=="file_comment"){if(!e.file){return i
}}var c=TS.shared.getModelObById(k.channel);
if(!c){return i
}var h=true;
if(c.is_channel){if(!c.is_member){h=false
}}var n;
var m;
var b;
var g;
var f;
var d="";
var l="";
var j="";
if(TS.boot_data.feature_archive_viewer||(h&&!!TS.utility.msgs.getMsg(e.ts,c.msgs))){l=TS.templates.builders.strBuilder('<a class="msg_right_link msg_jump" data-cid="${cid}">Jump</a>',{cid:c.id})
}else{l=TS.templates.builders.strBuilder('<a class="msg_right_link" href="${permalink}" target="${permalink}">Archives</a>',{permalink:TS.utility.msgs.constructMsgPermalink(c,e.ts)})
}if(k.type=="rxn"){n=TS.rxns.getRxnRecordByKey(e._rxn_key);
b=TS.rxns.getExistingRxnsByKey(e._rxn_key);
if(!b||!n){return""
}m={render_for_mentions:true};
for(var a in n.emoji){n.emoji[a].forEach(function(o){if(!g||o.when>g.when){g=o;
f=a
}})
}if(!b[f]){return""
}if(b[f].count==2){d=" & 1 other"
}else{if(b[f].count>2){d=" & "+(b[f].count-1)+" others"
}}j=TS.templates.builders.strBuilder('<div style="border: 0" class="member_image thumb_36">${emoji_html}</div><a class="message_sender member">${names}</a> reacted to your message:<!--<a class="timestamp no_wrap">${jump_link}</a>-->${jump_link_html}',{emoji_html:TS.utility.emojiGraphicReplace(":"+f+":",true,false,true),names:TS.members.getMemberDisplayNameById(g.id)+d,date_str:TS.utility.date.toCalendarDateOrNamedDayShort(g.when)+" "+TS.utility.date.toTime(g.when),jump_link_html:l})
}i+=TS.templates.builders.buildMsgHTML({rxn_options:m,msg:e,model_ob:c,standalone:true,full_date:(k.type=="rxn"),jump_link:l,no_attachments:!!e.text,theme:"light"});
if(!j){return i
}return TS.templates.builders.strBuilder('<div class="mention_rxn message show_user" data-ts="${ts}">${rxn_html}<div class="mention_rxn_msg_holder">${msg_html}</div></div>',{ts:e.ts,rxn_html:j,msg_html:i})
},buildMentions:function(){TS.mentions.weaveInRxnRecords();
var a="";
var b=null;
var c=TS.model.user;
if(!c.mentions||!c.mentions.length){return a
}$.each(c.mentions,function(f,e){var j=TS.templates.builders.buildMentionHTML(e);
if(!j){return
}var g="";
var d=TS.shared.getModelObById(e.channel);
var m=e.message;
var k=!b;
if(b&&!TS.utility.date.sameDay(TS.utility.date.toDateObject(b.rxn_ts||b.message.ts),TS.utility.date.toDateObject(e.rxn_ts||m.ts))){k=true
}if(k){if(b){g="</div>"
}g+='<div class="mention_day_container_div">'+TS.templates.messages_day_divider({ts:(e.rxn_ts||m.ts)})
}else{g+='<hr class="spacer">'
}var l=b&&b.channel;
if(d.is_channel){if(l!=d.id||k){g+='<hr class="spacer">';
g+='<h3 class="small_bottom_margin"><a href="/archives/'+d.name+'" target="/archives/'+d.name+'" class="channel_link" data-channel-id="'+d.id+'"><span class="normal">#</span>'+d.name+"</a></h3>"
}}else{if(d.is_group){if(l!=d.id||k){g+='<hr class="spacer">';
g+='<h3 class="small_bottom_margin"><a href="/archives/'+d.name+'" target="/archives/'+d.name+'" class="group_link" data-group-id="'+d.id+'">'+d.name+"</a></h3>"
}}else{}}a+=g+j;
b=e
});
if(a){a+="</div>"
}return a
},buildStarredItemHTML:function(e){var d="<div class='star_item'>";
var h={star:e,current_user_id:TS.model.user.id};
var a;
if(e.type=="message"){var b=e.message;
var c=!!TS.client;
a=TS.channels.getChannelById(e.channel);
if(a&&!a.is_member){c=false
}if(!a){a=TS.groups.getGroupById(e.channel)
}if(!a&&!b.permalink){a=TS.ims.getImById(e.channel);
var g=TS.members.getMemberById(a.user);
e.message["recipient"]=g
}if(!a){TS.warn("channel "+e.channel+" for this starred message was probably deleted");
return""
}var i="";
if(TS.boot_data.feature_archive_viewer||(c&&!!TS.utility.msgs.getMsg(b.ts,a.msgs))){i='<a class="star_jump msg_right_link" data-cid="'+a.id+'">Jump</a>'
}else{var j=TS.utility.msgs.constructMsgPermalink(a,b.ts);
i='<a class="msg_right_link" href="'+j+'" target="'+j+'">Archives</a>'
}var f=b.subtype;
if(f==="file_share"||f==="file_mention"||f==="file_comment"){d+=TS.templates.builders.buildStar("message",b,a)
}d+=TS.templates.builders.buildMsgHTML({msg:b,model_ob:a,standalone:true,starred_items_list:true,jump_link:i,no_attachments:!!b.text,full_date:true,theme:"light"})
}else{if(e.type=="file"){d+=TS.templates.builders.buildStar("file",e.file);
d+=TS.templates.builders.fileHTML(e.file)
}else{if(e.type=="channel"||e.type=="group"){a=TS.channels.getChannelById(e.channel);
if(!a){a=TS.groups.getGroupById(e.channel)
}if(!a){TS.warn("channel or group "+e.channel+" was probably deleted");
return""
}h.model_ob=a;
d+=TS.templates.star_item(h)
}else{d+=TS.templates.star_item(h)
}}}d+="</div>";
return d
},buildInlineImgTogglerAndDiv:function(b,c,a){var d=TS.model.inline_imgs[b];
if(!d){return""
}return TS.templates.builders.buildInlineImgToggler(b,c)+" "+TS.templates.builders.buildInlineImgDiv(b,c,undefined,a)
},buildInlineImgToggler:function(j,e,h){var k=TS.model.inline_imgs[j];
if(!k){console.warn("buildInlineImgToggler did not find anything in TS.model.inline_imgs for key:"+j);
return""
}var b=TS.inline_imgs.shouldExpand(e,k);
var c=k.link_url||j;
var g=k.bytes&&k.bytes>TS.model.inline_img_byte_limit;
var d=k.width&&k.height&&(k.width*k.height)>TS.model.inline_img_pixel_limit;
var i=!d;
var a="";
if(!b&&(!TS.model.prefs.obey_inline_img_limit||g)||d){var f=!k.internal_file_id&&TS.model.prefs.expand_inline_imgs&&TS.model.expandable_state["img_"+e+k.src]!==false;
if(f&&d){i=false;
a='<span class="too_large_for_auto_expand"> (Not automatically expanded because '+k.width+"x"+k.height+" is too large to display inline.)</span>"
}else{if(f&&g){a='<span class="too_large_for_auto_expand"> (Not automatically expanded because '+TS.utility.convertFilesize(k.bytes)+' is too large. You can <a class="cursor_pointer too_large_but_expand_anyway" data-real-src="'+TS.utility.htmlEntities(k.src)+'">expand it anyway</a> or <a '+TS.utility.makeRefererSafeLink(c)+' target="_blank" title="Open original in new tab">open it in a new window</a>.';
if(TS.model.show_inline_img_size_pref_reminder&&!TS.model.shown_inline_img_size_pref_reminder_once){a+=" You can also <a class=\"cursor_pointer\" onclick=\"TS.ui.prefs_dialog.start('media', '#dont_obey_inline_img_limit_p')\">change your preferences</a> to allow images of any file size to auto expand.)";
TS.model.shown_inline_img_size_pref_reminder_once=true
}a+="</span>"
}}}var l=(k.bytes&&h!==true)?'<span class="inline_img_bytes '+(a?"hidden":"")+'"> ('+TS.utility.convertFilesize(k.bytes)+")</span>":"";
return l+a+(i?'<i data-real-src="'+TS.utility.htmlEntities(k.src)+'" class="msg_inline_img_collapser ts_icon ts_icon_caret_down '+(b?"":"hidden")+'"></i><i data-real-src="'+TS.utility.htmlEntities(k.src)+'" class="msg_inline_img_expander ts_icon ts_icon_caret_right '+(b?"hidden":"")+'"></i>':"")
},buildInlineImgDiv:function(t,m,s,a){var d=TS.model.inline_imgs[t];
if(!d){return""
}var j=s===true||TS.inline_imgs.shouldExpand(m,d);
var h=d.link_url||t;
var p;
if(d.internal_file_id){p=TS.files.getFileById(d.internal_file_id)
}var n=!!TS.client;
var e="";
var g=d.hasOwnProperty("set_height")?!!d.set_height:true;
var l=g?("height:"+(d.display_h+2)+"px;"):"";
var r=g?"height:"+d.display_h+"px;":"";
var f="clear_both msg_inline_img_holder msg_inline_holder "+(j?"":"hidden");
if(p&&TS.boot_data.feature_fix_files){f+=" inline_file_preview_container"
}e='<div data-real-src="'+TS.utility.htmlEntities(d.src)+'" class="'+f+'" style="width:'+d.display_w+"px; "+l+'max-width: 100%;">';
var b="ctrl";
if(TS.model.is_mac){b="cmd"
}var k=(a&&a.hasOwnProperty("maybe_show_lightbox"))?a.maybe_show_lightbox:true;
var q;
if(d.internal_file_id){if(p&&p.mimetype.indexOf("image/")===0){if(p.external_type=="dropbox"||p.external_type=="gdrive"||p.external_type=="box"||p.external_type=="onedrive"){if(TS.boot_data.feature_fix_files){q=k&&(p.thumb_360_w==360||p.thumb_360_h==360)
}var i=p.thumb_720?p.thumb_720:p.thumb_360;
e+="<a "+TS.utility.makeRefererSafeLink(h)+' target="_blank" title="cmd+click to open original in new tab" class="lightbox_external_link" data-src="'+TS.utility.htmlEntities(i)+'"data-link-url="'+h+'">'
}else{if(TS.boot_data.feature_fix_files&&TS.qs_args["480_thumbs"]=="1"){q=k&&(d.width==d.thumb_size||d.height==d.thumb_size)
}else{q=k&&(p.thumb_360_w==360||p.thumb_360_h==360)
}if(q){e+='<a href="'+h+'" target="_blank" title="Open in lightbox ('+b+'+click to open original in new tab)" class="lightbox_channel_link lightbox_link" data-file-id="'+d.internal_file_id+'">'
}else{e+='<a href="'+h+'" target="_blank" title="'+b+'+click to open original in new tab" class="file_preview_link thumbnail_link" data-file-id="'+d.internal_file_id+'">'
}}}else{e+="<a "+TS.utility.makeRefererSafeLink(h)+' target="_blank" class="'+p.filetype+'">'
}}else{var c;
var o;
if(k){c="lightbox_external_link";
o="Open in lightbox ("+b+"+click to open original in new tab)"
}else{c="";
o="Click to open original in new tab"
}e+="<a "+TS.utility.makeRefererSafeLink(h)+' target="_blank" title="'+o+'" class="'+c+'" data-src="'+d.src+'" data-link-url="'+d.link_url+'" data-width="'+d.width+'" data-height="'+d.height+'">'
}e+='<img class="msg_inline_img msg_inline_child '+(n?"hidden":"")+'" '+(n?"data-real-src":"src")+'="'+TS.utility.htmlEntities(d.proxied_src||d.src)+'" style="width:'+d.display_w+"px; "+r+'">';
if(p&&q&&TS.boot_data.feature_fix_files){if(TS.client){e+='<i class="ts_icon ts_icon_arrows_alt preview_main_action"></i>'
}}e+="</a>";
if(p&&TS.boot_data.feature_fix_files){e+=TS.templates.message_file_preview_actions({file:p,download:p.mode==="hosted",new_window:true});
e+=TS.templates.message_file_preview_footer({file:p})
}e+="</div>";
return e
},buildInlineEmailDiv:function(c,d){var b=TS.files.getFileById(c);
if(!b){return""
}var e={file:b,is_message:true,to_more_count:b.to.length-1,cc_more_count:b.cc.length-1,msg_dom_id:d};
var a=TS.templates.file_email(e);
return a
},buildInlineAttachmentToggler:function(b,d){var a=TS.model.inline_attachments[b];
if(!a){return""
}var c=TS.inline_attachments.shouldExpand(d,a);
return' <i data-real-src="'+TS.utility.htmlEntities(a.from_url)+'" class="msg_inline_attachment_collapser ts_icon ts_icon_caret_down '+(c?"":"hidden")+'"></i><i data-real-src="'+TS.utility.htmlEntities(a.from_url)+'" class="msg_inline_attachment_expander ts_icon ts_icon_caret_right '+(c?"hidden":"")+'"></i>'
},buildInlineFilePreviewToggler:function(b,c){var a=TS.inline_file_previews.shouldExpand(c,b);
return'<i class="msg_inline_file_preview_collapser ts_icon ts_icon_caret_down'+(a?"":" hidden")+'" data-file-id="'+b+'"></i><i class="msg_inline_file_preview_expander ts_icon ts_icon_caret_right'+(a?" hidden":"")+'" data-file-id="'+b+'"></i>'
},makeMemberImage:function(b,i,c,h){var d=TS.members.getMemberById(b);
if(!d||!d.profile){return""
}c=(c===true);
h=(h===true);
var f,a;
switch(i){case 16:f=d.profile.image_24;
a="thumb_16";
break;
case 20:f=d.profile.image_24;
a="thumb_20";
break;
case 24:f=d.profile.image_24;
a="thumb_24";
break;
case 32:f=d.profile.image_32;
a="thumb_32";
break;
case 36:f=d.profile.image_48;
a="thumb_36";
break;
case 48:f=d.profile.image_48;
a="thumb_48";
break;
case 72:f=d.profile.image_72;
a="thumb_72";
break;
case 192:f=d.profile.image_192;
a="thumb_192";
break;
default:f=d.profile.image_48;
a="thumb_48";
break
}var g=(h)?'title="'+TS.members.getMemberDisplayName(d,true)+'"':"";
var e;
if(c){e='<img data-original="'+f+'" class="lazy member_image '+a+' member_preview_image" data-member-id="'+d.id+'" '+g+" />"
}else{e='<img src="'+f+'" class="member_image '+a+' member_preview_image" data-member-id="'+d.id+'" '+g+" />"
}return e
},buildInlineAudioToggler:function(b,d){var a=TS.model.inline_audios[b];
if(!a){return""
}var c=TS.inline_audios.shouldExpand(d,a);
return' <i data-real-src="'+TS.utility.htmlEntities(a.src)+'" class="msg_inline_audio_collapser ts_icon ts_icon_caret_down '+(c?"":"hidden")+'"></i><i data-real-src="'+TS.utility.htmlEntities(a.src)+'" class="msg_inline_audio_expander ts_icon ts_icon_caret_right '+(c?"hidden":"")+'"></i>'
},buildInlineAudioDiv:function(b,f,d,e){var a=TS.model.inline_audios[b];
if(!a){return""
}var c=e===true||TS.inline_audios.shouldExpand(f,a);
return'<div data-real-src="'+TS.utility.htmlEntities(a.src)+'" class="clear_both msg_inline_audio_holder msg_inline_holder '+(c?"":"hidden")+'">'+d+"</div>"
},buildInlineOtherToggler:function(a,c){var d=TS.model.inline_others[a];
if(!d){return""
}var b=TS.inline_others.shouldExpand(c,d);
return' <i data-real-src="'+TS.utility.htmlEntities(d.src)+'" class="msg_inline_other_collapser ts_icon ts_icon_caret_down '+(b?"":"hidden")+'"></i><i data-real-src="'+TS.utility.htmlEntities(d.src)+'" class="msg_inline_other_expander ts_icon ts_icon_caret_right '+(b?"hidden":"")+'"></i>'
},buildInlineOtherDiv:function(a,e,c,d){var f=TS.model.inline_others[a];
if(!f){return""
}var b=d===true||TS.inline_others.shouldExpand(e,f);
return'<div data-real-src="'+TS.utility.htmlEntities(f.src)+'" class="clear_both msg_inline_other_holder msg_inline_holder '+(b?"":"hidden")+'">'+c+"</div>"
},buildInlineVideoTogglerAndDiv:function(b,c){var a=TS.model.inline_videos[b];
if(!a){return""
}return TS.templates.builders.buildInlineVideoToggler(b,c)+" "+TS.templates.builders.buildInlineVideoDiv(b,c)
},buildInlineVideoToggler:function(c,e,a){var b=TS.model.inline_videos[c];
if(!b){return""
}var d=TS.inline_videos.shouldExpand(e,b);
return" "+(a===true?"":b.title)+' <i data-real-src="'+TS.utility.htmlEntities(b.src)+'" class="msg_inline_video_collapser ts_icon ts_icon_caret_down '+(d?"":"hidden")+'"></i><i data-real-src="'+TS.utility.htmlEntities(b.src)+'" class="msg_inline_video_expander ts_icon ts_icon_caret_right '+(d?"hidden":"")+'"></i>'
},buildInlineVideoDiv:function(j,g,c){var e=TS.model.inline_videos[j];
if(!e){return""
}var d=c===true||TS.inline_videos.shouldExpand(g,e);
var f=e.link_url||j;
var b=!!TS.client;
var l=FlashDetect.installed;
var h=l?251:137;
var a=l?119:113;
var k=parseInt((e.display_w-h)/2)+"px";
var i=parseInt((e.display_h-a)/2)+"px";
return'<div data-real-src="'+TS.utility.htmlEntities(e.src)+'" class="clear_both msg_inline_video_holder msg_inline_holder '+(d?"":"hidden")+'" style="width:'+e.display_w+"px; height:"+(e.display_h+2)+'px; max-width: 100%;"><div class="msg_inline_video_iframe_div hidden" data-url="'+TS.utility.htmlEntities(j)+'"></div><div class="msg_inline_video_thumb_div"><div class="msg_inline_video_buttons_div" style="top:'+i+";left:"+k+'">'+(l?'<a class="msg_inline_video_play_button" style="margin-right: 60px;" title="Play video in Slack"><i class="ts_icon ts_icon_play ts_icon_inherit" style="font-size: 3.4rem;"></i></a>':"")+'<a class="msg_inline_video_new_window_button" '+TS.utility.makeRefererSafeLink(f)+' target="_blank" title="Open video in new tab"><i class="ts_icon ts_icon_external_link ts_icon_inherit"></i></a></div><img class="msg_inline_video msg_inline_child '+(b?"hidden":"")+'" '+(b?"data-real-src":"src")+'="'+TS.utility.htmlEntities(e.proxied_src||e.src)+'" style="width:'+e.display_w+"px; height:"+e.display_h+'px"></div></div>'
},buildComments:function(d){var f=d.comments;
var c="";
var g=false;
for(var b=0;
b<f.length;
b++){var a=f[b].user==TS.model.user.id;
var e=a||TS.model.user.is_admin;
if(a||e){g=true
}c+=TS.templates.comment({comment:f[b],file:d,show_comment_actions:g})
}return c
},buildCommentStandalone:function(b,a){return TS.templates.comment_standalone({comment:b,file:a,current_user_id:TS.model.user.id})
},buildTeamListHTML:function(l){var f;
var d=[];
var j=[];
var g=[];
var a=[];
var h=[];
var b=[];
l.sort(function(m,i){var o=m._real_name_lc||m._name_lc;
var n=i._real_name_lc||i._name_lc;
return(o>n)?1:((n>o)?-1:0)
});
for(var e=0;
e<l.length;
e++){f=l[e];
if(f.deleted){if(TS.boot_data.feature_bot_users&&f.is_bot){g.push(f)
}else{j.push(f)
}}else{if(f.is_ultra_restricted){b.push(f)
}else{if(f.is_restricted){h.push(f)
}else{if(TS.boot_data.feature_bot_users&&(f.is_bot||f.is_slackbot)){a.push(f)
}else{d.push(f)
}}}}}var k=false;
if(a.length||g.length){k=true
}var c=false;
if(h.length||b.length){c=true
}$("#team_tabs").html(TS.templates.team_tabs({members:d,show_restricted_members:c,restricted_members:h.concat(b),disabled_members:j}));
$("#team_tabs").find('a[data-toggle="tab"]').on("shown",function(i){if(TS.client){TS.client.ui.updateClosestMonkeyScroller($("#team_list_members"))
}if(TS.web&&TS.web.members&&TS.web.members.lazyload){TS.web.members.lazyload.trigger("resize")
}$("#team_list_members").trigger("resize")
});
return TS.templates.team_list({members:d,bots:a,show_bots:k,show_restricted_members:c,restricted_members:h,ultra_restricted_members:b,disabled_members:j,deleted_bots:g})
},makeChannelLink:function(a){if(!a){return"ERROR: MISSING CHANNEL"
}var b=(TS.utility.shouldLinksHaveTargets())?'target="/archives/'+a.name+'"':"";
return'<a href="/archives/'+a.name+'" '+b+' class="channel_link" data-channel-id="'+a.id+'"><span class="normal">#</span>'+a.name+"</a>"
},makeGroupLink:function(b){if(!b){return"ERROR: MISSING GROUP"
}var a=(TS.utility.shouldLinksHaveTargets())?'target="/archives/'+b.name+'"':"";
return'<a href="/archives/'+b.name+'" '+a+'" class="group_link" data-group-id="'+b.id+'">'+TS.model.group_prefix+b.name+"</a>"
},makeMemberPreviewLink:function(e,b){if(!e){return""
}if(b!==true){b=false
}var a="color_"+((e)?e.id:"unknown");
var d=(TS.utility.shouldLinksHaveTargets())?'target="/team/'+e.name+'"':"";
var c='<a href="/team/'+e.name+'" '+d+' class="bold member member_preview_link '+a+'" data-member-id="'+e.id+'">';
if(b&&e.id==TS.model.user.id){c+="You"
}else{c+=TS.members.getMemberDisplayName(e,true)
}c+="</a>";
return c
},makeMemberPreviewLinkImage:function(b,k,c,g){var d=TS.members.getMemberById(b);
if(!d||!d.profile){return""
}c=(c===true);
g=(g===true);
var h,j;
var i,a;
i="background-image: ";
a=[];
switch(k){case 20:if(TS.model.is_retina){h=d.profile.image_48
}else{h=d.profile.image_24
}j="thumb_20";
break;
case 24:if(TS.model.is_retina){h=d.profile.image_48
}else{h=d.profile.image_24
}j="thumb_24";
break;
case 32:if(TS.model.is_retina){h=d.profile.image_72
}else{h=d.profile.image_32
}j="thumb_32";
break;
case 36:if(TS.model.is_retina){h=d.profile.image_72
}else{h=d.profile.image_48
}j="thumb_36";
break;
case 48:if(TS.model.is_retina){h=d.profile.image_72
}else{h=d.profile.image_48
}j="thumb_48";
break;
case 72:if(TS.model.is_retina){h=d.profile.image_192
}else{h=d.profile.image_72
}j="thumb_72";
break;
case 192:h=d.profile.image_192;
j="thumb_192";
break;
default:if(TS.model.is_retina){h=d.profile.image_72
}else{h=d.profile.image_48
}j="thumb_48";
break
}if(d.is_restricted){if(TS.model.is_retina){a.push("url('"+cdn_url+"/54f6/img/avatar_overlays_@2x.png')")
}else{a.push("url('"+cdn_url+"/54f6/img/avatar_overlays.png')")
}}if(d.is_ultra_restricted){j+=" ura"
}else{if(d.is_restricted){j+=" ra"
}else{if(TS.boot_data.feature_bot_users&&d.is_bot){j+=" bot"
}}}var e;
var f=(TS.utility.shouldLinksHaveTargets())?'target="/team/'+d.name+'"':"";
a.push("url('"+h+"')");
if(c){i=(a.length?a.join(", "):"");
if(g){e='<span class="lazy member_preview_link member_image '+j+'" data-member-id="'+d.id+'" data-thumb-size="'+k+'" data-original="'+i+'" style="background-color: #f6f6f6" aria-hidden="true"></span>'
}else{e='<a href="/team/'+d.name+'" '+f+' class="lazy member_preview_link member_image '+j+'" data-member-id="'+d.id+'" data-thumb-size="'+k+'" data-original="'+i+'" style="background-color: #f6f6f6" aria-hidden="true"></a>'
}}else{i=(a.length?i+a.join(", "):"");
if(g){e='<span class="member_preview_link member_image '+j+'" data-member-id="'+d.id+'" data-thumb-size="'+k+'" style="'+i+'" aria-hidden="true"></span>'
}else{e='<a href="/team/'+d.name+'" '+f+' class="member_preview_link member_image '+j+'" data-member-id="'+d.id+'" data-thumb-size="'+k+'" style="'+i+'" aria-hidden="true"></a>'
}}return e
},newWindowName:function(a){if(TS.boot_data.app=="web"){return"_self"
}return"new_"+TS.session_ms.toString()
},getBotIdentifier:function(b){if(!b.bot_id&&!b.username){return null
}var d=(b.bot_id)?TS.bots.getBotById(b.bot_id):null;
var a=(!b.username&&d&&d.name)?d.name:b.username;
var c=(d)?d.id:"NOBOTID";
return c+"_"+a
},getBotName:function(a){var c=a.username;
if(!c){var b=(a.bot_id)?TS.bots.getBotById(a.bot_id):null;
if(b&&b.name){c=b.name
}}if(!TS.boot_data.feature_bot_message_label){if(TS.members.botNameMatchesMemberName(c)){c+=" (bot)"
}}return c
},getBotNameWithLink:function(b){var d=b.username;
var c=(b.bot_id)?TS.bots.getBotById(b.bot_id):null;
var a=TS.templates.builders.makeBotLink(c,b.username);
if(!d){if(c&&c.name){d=c.name
}}if(!TS.boot_data.feature_bot_message_label){if(TS.members.botNameMatchesMemberName(d)){d+=" (bot)"
}}return a.start_a+TS.utility.htmlEntities(d)+a.end_a
},makeBotLink:function(f,e){var c=false;
var b="";
var a="";
var d=c?' class="bot_sender" data-bot-identifier="'+((f&&!f.deleted)?f.id:e)+'"':"";
if(f&&!f.deleted){b="<a"+d+' target="/services/'+f.id+'" href="/services/'+f.id+'">';
a="</a>"
}else{if(c){b="<a"+d+">";
a="</a>"
}}return{start_a:b,end_a:a}
},makeExternalFiletypeHTML:function(a){if(!a.is_external){return
}var b="";
switch(a.external_type){case"gdrive":switch(a.filetype){case"gsheet":b="Spreadsheet";
break;
case"gdoc":b="Document";
break;
case"gpres":b="Presentation";
break;
case"gdraw":b="Drawing";
break;
default:b=["<span>","</span> File"].join(a.pretty_type)
}b+=" from Google Drive";
break;
case"dropbox":b=["<span>","</span> File from Dropbox"].join(a.pretty_type);
break;
case"box":b=["<span>","</span> File from Box"].join(a.pretty_type);
break;
case"onedrive":b=["<span>","</span> File from OneDrive"].join(a.pretty_type);
break;
default:b="File"
}return b
},makeUnshareLink:function(b,a){var c=b.is_channel?("Remove this from #"+b.name):("Remove this from the "+b.name);
return'<a class="unshare_link" onclick="TS.files.promptForFileUnshare(\''+a.id+"', '"+b.id+'\')" data-toggle="tooltip" title="'+c+'"><i class="ts_icon ts_icon_minus_circle"></i></a>'
},updateFileShareLabels:function(a){var b=$('.file_share_label[data-file-id="'+a.id+'"]');
b.each(function(){$(this).replaceWith(TS.templates.builders.makeFileShareLabel(a))
});
if(a.is_shared){$('.file_share_shared_label[data-file-id="'+a.id+'"]').removeClass("hidden");
$('.file_share_unshared_label[data-file-id="'+a.id+'"]').addClass("hidden")
}else{$('.file_share_shared_label[data-file-id="'+a.id+'"]').addClass("hidden");
$('.file_share_unshared_label[data-file-id="'+a.id+'"]').removeClass("hidden")
}if(a.is_public){$('.file_share_private_label[data-file-id="'+a.id+'"]').addClass("hidden");
$('.file_share_public_label[data-file-id="'+a.id+'"]').removeClass("hidden")
}else{$('.file_share_private_label[data-file-id="'+a.id+'"]').removeClass("hidden");
$('.file_share_public_label[data-file-id="'+a.id+'"]').addClass("hidden")
}},makeFileShareLabel:function(b){var a='<span class="file_share_label" data-file-id="'+b.id+'">';
var c=TS.templates.builders.makeFileGroupChannelList(b);
if(!c.length){if(!b.is_public&&b.user!==TS.model.user.id){a+="shared with you"
}}else{a+="in "+c
}a+="</span>";
return a
},makeFileGroupChannelList:function(c){var e=[];
var b;
var d,a;
for(a=0;
a<c.channels.length;
a++){d=TS.channels.getChannelById(c.channels[a]);
if(!d){continue
}b='<span class="no_wrap">';
b+=TS.templates.builders.makeChannelLink(d,c);
b+="&nbsp;"+TS.templates.builders.makeUnshareLink(d,c);
b+="</span>";
e.push(b)
}var f;
for(a=0;
a<c.groups.length;
a++){f=TS.groups.getGroupById(c.groups[a]);
if(!f){continue
}b='<span class="no_wrap">';
b+=TS.templates.builders.makeGroupLink(f,c);
b+="&nbsp;"+TS.templates.builders.makeUnshareLink(f,c);
b+="</span>";
e.push(b)
}if(!e.length){return""
}return e.join(", ")
},buildFileSharingControls:function(s,o,b,k,t){var n,m;
var f;
var l;
if(TS.client){l=TS.shared.getActiveModelOb()
}else{if(TS.web&&TS.web.space){l=TS.shared.getModelObById(TS.web.space.getOriginChannel())
}}if(!l||l.is_channel){f="channel"
}else{if(l.is_im){f="im"
}else{if(l.is_group){f="group"
}}}var q=(TS.model.archive_view_is_showing&&TS.client.archives.current_model_ob)?TS.client.archives.current_model_ob.id:null;
var a=[];
var u;
var e=TS.members.canUserPostInGeneral();
for(n=0;
n<TS.model.channels.length;
n++){u=TS.model.channels[n];
if((u.is_member||q==u.id)&&(!u.is_general||e)&&!u.is_archived){a.push(u)
}}var p=[];
var g;
for(n=0;
n<TS.model.groups.length;
n++){g=TS.model.groups[n];
if(!g.is_archived){p.push(g)
}}var r=[];
var c;
var h={};
var d=TS.members.getMembersForUser();
for(n=0;
n<d.length;
n++){c=d[n];
if(!c||c.deleted||c.is_self){continue
}r.push(c);
h[c.id]=TS.members.getMemberDisplayNameLowerCase(c)
}a.sort(function(j,i){return(j._name_lc>i._name_lc)?1:((i._name_lc>j._name_lc)?-1:0)
});
p.sort(function(j,i){return(j._name_lc>i._name_lc)?1:((i._name_lc>j._name_lc)?-1:0)
});
r.sort(function(j,i){return(h[j.id]>h[i.id])?1:((h[i.id]>h[j.id])?-1:0)
});
if(TS.boot_data.feature_bot_users){for(n=0,m=r.length;
n<m;
n++){if(r[n].is_slackbot){r.push(r[n]);
r.splice(n,1);
break
}}}if(f=="group"&&!p.length){f="channel"
}b=b||"";
$("#file_sharing_div").remove();
return TS.templates.file_sharing({share_context:f,channels:a,groups:p,members:r,model_ob:l,file:s,has_title:k,hide_checkbox:o,comment:b,selection:t,show_channel_join_note:l&&l.is_channel&&!l.is_member&&!l.is_archived})
},buildNonDefaultNotificationBlock:function(d){d=d||"";
var c="";
var b;
var a=TS.notifs.getCorGsNotUsingGlobalNotificationSetting();
if(a.everything.length){c+='<div class="'+d+'">Set to notify for <b>all activity</b>:';
for(b=0;
b<a.everything.length;
b++){c+=" "+(a.everything[b].id.charAt(0)==="C"?"#":"")+a.everything[b].name+(b!=a.everything.length-1?",":"")
}c+="</div>"
}if(a.mentions.length){c+='<div class="'+d+'">Set to notify only for <b>Highlight Words</b>:';
for(b=0;
b<a.mentions.length;
b++){c+=" "+(a.mentions[b].id.charAt(0)==="C"?"#":"")+a.mentions[b].name+(b!=a.mentions.length-1?",":"")
}c+="</div>"
}if(a.nothing.length){c+='<div class="'+d+'">Set to <b>never notify</b>:';
for(b=0;
b<a.nothing.length;
b++){c+=" "+(a.nothing[b].id.charAt(0)==="C"?"#":"")+a.nothing[b].name+(b!=a.nothing.length-1?",":"")
}c+="</div>"
}return c
},strBuilder:function(b,a){return b.replace(/\${([a-z_]+)}/g,function(d,c){if(c.indexOf("_html")>-1){return a[c]
}return TS.utility.htmlEntities(a[c])
})
},buildRxnTitle:function(b){var f="";
if(b.count==1){if(b.user_reacted){f+="You (click to remove)"
}else{f+=TS.members.getMemberDisplayNameById(b.member_ids[0])
}return f
}var d=b.member_ids.length<b.count;
var a=b.member_ids.filter(function(g){return g!=TS.model.user.id
});
var e=(d)?"others":TS.members.getMemberDisplayNameById(a[a.length-1]);
var c=[];
if(b.user_reacted){c.push("You")
}a.forEach(function(h,g){if(!d&&g==a.length-1){return
}if(a.length>1){c.push(TS.members.getMemberDisplayNameById(h))
}});
f+=c.join(", ")+" and "+e;
return f
},buildRxnHtml:function(b){var a=TS.utility.emojiGraphicReplace(":"+b.name+":");
var c=TS.templates.builders.buildRxnTitle(b);
return TS.templates.builders.strBuilder('<span data-emoji="${name}" class="emoji_rxn emoji_rxn_real ${css_classes}" data-title="${title}">${emoji_html}<span class="emoji_rxn_count">${count}</span></span>',{name:b.name,css_classes:(b.user_reacted?"user_reacted":""),emoji_html:a,title:c,count:b.count})
},buildRxnDefaultHtml:function(b){var a;
if(b.is_menu){a='<span class="emoji emoji-sizer" style="background-image:url(https://slack.global.ssl.fastly.net/272a/img/emoji_menu_button.png)">:simple_smile:</span>'
}else{a=TS.utility.emojiGraphicReplace(":"+b.name+":")
}return TS.templates.builders.strBuilder('<span data-emoji="${name}" class="emoji_rxn emoji_rxn_default ${css_classes}">${emoji_html}</span>',{name:b.name,emoji_html:a,css_classes:(b.is_menu?"menu_rxn":" ")+(b.is_hidden?"hidden":" ")})
},updateRxnHtml:function(d,a){var c=d.find('.emoji_rxn.emoji_rxn_real[data-emoji="'+a.name+'"]');
if(c.length){c.find(".emoji_rxn_count").text(a.count);
c.toggleClass("user_reacted",a.user_reacted);
var e=TS.templates.builders.buildRxnTitle(a);
var b;
if(c.hasClass("tipped")){b=c.data("original-title");
if(b!=e){c.prop("title",e).data("original-title",e).removeAttr("data-title").removeData("title").tooltip("destroy").tooltip(TS.rxns.rxn_tooltip_options);
if(c.is(":hover")){c.tooltip("show")
}}}else{b=c.data("title");
if(b!=e){c.data("title",e)
}}if(a.animate_it_dramatically){setTimeout(a.animate_callback,0)
}else{if(a.animate_it){setTimeout(a.animate_callback,0)
}}}else{d.find(".emoji_rxn_spacer").before($(TS.templates.builders.buildRxnHtml(a)));
c=d.find('.emoji_rxn.emoji_rxn_real[data-emoji="'+a.name+'"]');
if(a.animate_it_dramatically){c.css("opacity",0).transition({opacity:1},300,a.animate_callback)
}else{if(a.animate_it){c.css("opacity",0).transition({opacity:1},300,a.animate_callback)
}}}},updateMsgRxnPanels:function(a,c,b){var d=TS.rxns.getExistingRxnsByKey(a);
var e=$("."+TS.templates.makeRxnKeyDomId(a));
e.each(function(l,j){var g=$(j);
var h;
var k;
var o;
var f=false;
var m=function(){var i=g.find(".emoji_rxn.emoji_rxn_default");
i.each(function(q,s){var r=$(s);
var p=r.data("emoji");
if(TS.rxns.doesRxnsHaveRxn(d,p)){r.addClass("hidden")
}else{r.removeClass("hidden")
}})
};
if(d){g.toggleClass("no_rxns",false);
for(h in d){k=(h==c);
o=(k&&b==TS.model.user.id);
TS.templates.builders.updateRxnHtml(g,{animate_it:k,animate_it_dramatically:o,name:h,count:d[h].count,user_reacted:TS.rxns.doesRxnsHaveRxnFromUser(d,h),member_ids:d[h].users})
}}var n=g.find(".emoji_rxn.emoji_rxn_real");
if(n.length){n.each(function(q,s){var r=$(s);
var p=r.data("emoji");
if(!TS.rxns.doesRxnsHaveRxn(d,p)){r.addClass("going_away");
r.tooltip("destroy");
f=true;
r.transition({opacity:0},300,function(){r.tooltip("destroy");
r.remove();
m();
if(!d){g.toggleClass("no_rxns",true)
}})
}})
}else{g.toggleClass("no_rxns",true);
g.find(".emoji_rxn").tooltip("destroy")
}if(!f){m()
}})
},rxnPanel:function(c,h){if(!c){return
}var j;
if(h.render_for_mentions){j=TS.rxns.getRxnRecordByKey(c)
}if(!window.made_rxns_styles){window.made_rxns_styles=1;
$("body").addClass("blue_rxns");
var g=[".rxn_panel.no_rxns {\rposition: absolute;\rtop:-4px;\rright:14px;\rz-index:1;\ropacity:0;\rtransition: opacity 0.05s linear 0s;\rvisibility:hidden;\r}",".emoji_rxn.emoji_rxn span.emoji-sizer {\rline-height: 20px;\rfont-size: 16px;\r}",".message.show_user .rxn_panel.no_rxns {\rtop:14px;\r}",".rxn_panel:not(.no_rxns) .emoji_rxn_default {\rvisibility:hidden;\ropacity:0;\rtransition: opacity 0.7s linear 1s, visibility 0.05s linear 1s;\r}",'.rxn_panel {\ropacity:.85;\r-webkit-user-select: none;\rmargin-top:1px;\rfont-family: "Helvetica Neue", Helvetica, "Segoe UI", Tahoma, Arial, sans-serif;}',".message:hover .rxn_panel {\ropacity:1;\r}",".rxn_panel:not(.no_rxns):hover .emoji_rxn_default {\rvisibility:visible;\ropacity:1;\rtransition: opacity 0.1s linear;\r}",".menu_rxn {\r}",".emoji_rxn {\rdisplay:inline-block;\rmargin-top:2px;\rmargin-bottom:2px;\rbackground: white;\rborder: 1px solid #E8E8E8;\rmargin-right: 4px !important;\rborder-radius:5px;\rpadding:1px 3px;\r-webkit-touch-callout: none;\r-khtml-user-select: none;\r-moz-user-select: none;\r-ms-user-select: none;\ruser-select: none;\rcursor: pointer;\rheight: 22px;\rline-height: 23px;\r}",".emoji_rxn.user_reacted {\rborder: 1px solid;\rpadding:1px 3px;\rborder-color: rgba(103, 203, 133, 1);\rbackground-color: rgba(79, 176, 252, 0.08);\r}","body.blue_rxns .emoji_rxn.user_reacted {\rborder-color: rgba(79, 176, 252, .4) !important;\rbackground-color: rgba(79, 176, 252, 0.08);\r}","body.thick_border_rxns .emoji_rxn.user_reacted {\rborder: 2px solid #67cb85;\rpadding:0 2px;\r}",".emoji_rxn:hover {\rborder-color: #4fb0fc;\r}",".emoji_rxn_count {\rfont-size: 11px;\rfont-family: helvetica, arial;\rposition: relative;\rtop: -4px;\rpadding: 0 1px 0 3px;\rcolor: #959595;\r}",".emoji_rxn.user_reacted .emoji_rxn_count {\rcolor: #67cb85;\rfont-weight: bold;\r}","body.blue_rxns .emoji_rxn.user_reacted .emoji_rxn_count {\rcolor: #4fb0fc;\r}",".emoji_rxn:hover .emoji_rxn_count, .emoji_rxn.user_reacted:hover .emoji_rxn_count {\rcolor: #4fb0fc;\r}"];
$('<style type="text/css">'+g.join("\r\r")+"</style>").appendTo("head")
}var a=TS.rxns.getExistingRxnsByKey(c);
var e="";
var b;
if(a){for(b in a){e+=TS.templates.builders.buildRxnHtml({name:b,count:a[b].count,user_reacted:TS.rxns.doesRxnsHaveRxnFromUser(a,b),member_ids:a[b].users})
}}e+='<span class="emoji_rxn_spacer">'+(e?"&nbsp;&nbsp;":"")+"</span>";
e+="<nobr>";
if(h.include_defaults){for(var d in TS.model.default_rxns){b=TS.model.default_rxns[d];
e+=TS.templates.builders.buildRxnDefaultHtml({name:b,is_hidden:TS.rxns.doesRxnsHaveRxn(a,b)})
}}else{e+=TS.templates.builders.buildRxnDefaultHtml({name:"simple_smile",is_menu:true})
}e+="</nobr>";
var f=[TS.templates.makeRxnKeyDomId(c)];
if(h.render_for_mentions){f.push("in_mentions")
}if(!a){f.push("no_rxns")
}return'<div class="rxn_panel '+f.join(" ")+'" data-rxn-key="'+c+'">'+e+"</div>"
},filePreviewBackIcon:function(){if(TS.boot_data.feature_flexpane_rework){return'<i class="ts_icon ts_icon_chevron_medium_left back_icon"></i>'
}else{return'<i class="ts_icon ts_icon_chevron_left back_icon"></i>'
}},buildQuickSwitcherBtnHtml:function(){var a=(!TS.model.is_mac&&(TS.model.is_our_app||TS.model.prefs.k_key_omnibox))?'<i class="ts_icon ts_icon_random"></i><span id="quick_switcher_label" class="quick_switcher_label_windows_alignment">Quick Switcher</span>':'<i class="ts_icon ts_icon_random"></i><span id="quick_switcher_label">Quick Switcher</span>';
if(TS.model.is_our_app||TS.model.prefs.k_key_omnibox){return[a,'<span id="quick_switcher_shortcut">',(TS.model.is_mac?"&#8984K":"Ctrl+K"),"</span>"].join("")
}return a
}})
})();
(function(){TS.registerModule("templates.helpers",{onStart:function(){TS.templates.helpers.register()
},register:function(){Handlebars.registerHelper("isClient",function(e){if(TS.boot_data.app=="client"){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("isChrome",function(e){if(TS.model.is_chrome){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("isFF",function(e){if(TS.model.is_FF){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("isSafariDesktop",function(e){if(TS.model.is_safari_desktop){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("isWeb",function(e){if(TS.boot_data.app=="web"||TS.boot_data.app=="mobile"||TS.boot_data.app=="space"){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("isMobileWeb",function(e){if(TS.boot_data.app=="mobile"){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("isMac",function(e){if(TS.model.is_mac){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("isOurApp",function(e){if(TS.model.is_our_app){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("supportsSpeech",function(e){if(TS.ui.growls.canSpeak()){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("isTheme",function(e){var f=e.hash.theme;
if(f==TS.model.prefs.theme){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("showAvatars",function(e){if(TS.model.prefs.avatars){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("feature",function(f){var e=f.hash.flag;
if(TS.qs_args[e]==1||TS.boot_data[e]==1){return f.fn(this)
}return f.inverse(this)
});
Handlebars.registerHelper("comments",TS.templates.builders.buildComments);
Handlebars.registerHelper("comment_standalone",TS.templates.builders.buildCommentStandalone);
Handlebars.registerHelper("star",TS.templates.builders.buildStar);
Handlebars.registerHelper("inlineImgTogglerAndDiv",TS.templates.builders.buildInlineImgTogglerAndDiv);
Handlebars.registerHelper("inlineImgDiv",TS.templates.builders.buildInlineImgDiv);
Handlebars.registerHelper("inlineImgToggler",TS.templates.builders.buildInlineImgToggler);
Handlebars.registerHelper("inlineImgTogglerForFile",function(f,h,e,g){if(TS.files.useLargerThumbnail(f)&&g!=="dense"){if(f.thumb_480_gif){return TS.templates.builders.buildInlineImgToggler(f.thumb_480_gif,e)
}if(h&&f.thumb_960){return TS.templates.builders.buildInlineImgToggler(f.thumb_960,e)
}if(f.thumb_480){return TS.templates.builders.buildInlineImgToggler(f.thumb_480,e)
}}if(f.thumb_360_gif){return TS.templates.builders.buildInlineImgToggler(f.thumb_360_gif,e)
}if(h){return TS.templates.builders.buildInlineImgToggler(f.thumb_720,e)
}else{return TS.templates.builders.buildInlineImgToggler(f.thumb_360,e)
}});
Handlebars.registerHelper("inlineImgDivForFile",function(f,h,e,g){if(TS.files.useLargerThumbnail(f)&&g!=="dense"){if(f.thumb_480_gif){return TS.templates.builders.buildInlineImgDiv(f.thumb_480_gif,e)
}if(h&&f.thumb_960){return TS.templates.builders.buildInlineImgDiv(f.thumb_960,e)
}if(f.thumb_480){return TS.templates.builders.buildInlineImgDiv(f.thumb_480,e)
}}if(f.thumb_360_gif){return TS.templates.builders.buildInlineImgDiv(f.thumb_360_gif,e)
}if(h){return TS.templates.builders.buildInlineImgDiv(f.thumb_720,e)
}else{return TS.templates.builders.buildInlineImgDiv(f.thumb_360,e)
}});
Handlebars.registerHelper("inlineEmailDiv",TS.templates.builders.buildInlineEmailDiv);
Handlebars.registerHelper("inlineVideoDiv",TS.templates.builders.buildInlineVideoDiv);
Handlebars.registerHelper("inlineAudioDiv",TS.templates.builders.buildInlineAudioDiv);
Handlebars.registerHelper("inlineOtherDiv",TS.templates.builders.buildInlineOtherDiv);
Handlebars.registerHelper("inlineFilePreviewToggler",TS.templates.builders.buildInlineFilePreviewToggler);
Handlebars.registerHelper("isInlineFilePreviewExpanded",function(e){var g=e.hash.container_id;
var f=e.hash.file_id;
if(TS.inline_file_previews.shouldExpand(g,f)){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("isInlineFilePreviewFullContent",function(e){var g=e.hash.container_id;
var f=e.hash.file_id;
if(TS.inline_file_previews.showingFullContent(g,f)){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("ifFileHasThumbnail",function(e){var f=e.hash.file;
if(TS.files.useLargerThumbnail(f)){if(f&&(f.thumb_480||f.thumb_480_gif)&&(TS.model.inline_imgs[f.thumb_480]||TS.model.inline_imgs[f.thumb_480_gif])){return e.fn(this)
}}if(f&&(f.thumb_360||f.thumb_360_gif)&&(TS.model.inline_imgs[f.thumb_360]||TS.model.inline_imgs[f.thumb_360_gif])){return e.fn(this)
}return e.inverse(this)
});
Handlebars.registerHelper("formatActionLink",function(g,i,e){if(!g){return""
}var h="<"+g.url+"|"+g.title+">";
var f=TS.format.formatWithOptions(h,i,{no_highlights:true,no_specials:true,enable_slack_action_links:e===true});
return f
});
Handlebars.registerHelper("formatSoundUrl",TS.templates.builders.formatSoundUrl);
Handlebars.registerHelper("ellipsize",function(f,e){TS.info("len"+e);
return TS.utility.ellipsize(f,e)
});
Handlebars.registerHelper("stripWhitespace",function(e){return e.replace(/\s+/g,"")
});
Handlebars.registerHelper("pluralize",function(g,f,e){g=parseInt(g);
if(g===1){return f
}else{return(typeof e==="string"?e:f+"s")
}});
Handlebars.registerHelper("pluralCount",function(g,f,e){return g+" "+Handlebars.helpers.pluralize.apply(this,arguments)
});
Handlebars.registerHelper("possessive",function(e){if(e.substr(-1,e.length)=="s"){return"'"
}else{return"'s"
}});
Handlebars.registerHelper("possessiveForMember",function(f){var e=TS.members.getMemberDisplayName(f);
if(e.substr(-1,e.length)=="s"){return"'"
}else{return"'s"
}});
Handlebars.registerHelper("canUserAtEveryone",function(e){return TS.members.canUserAtEveryone()?e.fn(this):e.inverse(this)
});
Handlebars.registerHelper("canUserAtChannelOrAtGroup",function(e){return TS.members.canUserAtChannelOrAtGroup()?e.fn(this):e.inverse(this)
});
Handlebars.registerHelper("canUserCreateChannels",function(e){return TS.members.canUserCreateChannels()?e.fn(this):e.inverse(this)
});
Handlebars.registerHelper("canUserArchiveChannels",function(e){return TS.members.canUserArchiveChannels()?e.fn(this):e.inverse(this)
});
Handlebars.registerHelper("canUserCreateGroups",function(e){return TS.members.canUserCreateGroups()?e.fn(this):e.inverse(this)
});
Handlebars.registerHelper("canUserPostInGeneral",function(e){return TS.members.canUserPostInGeneral()?e.fn(this):e.inverse(this)
});
Handlebars.registerHelper("canUserKickFromChannels",function(e){return TS.members.canUserKickFromChannels()?e.fn(this):e.inverse(this)
});
Handlebars.registerHelper("canUserKickFromGroups",function(e){return TS.members.canUserKickFromGroups()?e.fn(this):e.inverse(this)
});
Handlebars.registerHelper("numberWithMax",function(f,e){if(f>=e){return(e-1)+"+"
}else{return f
}});
Handlebars.registerHelper("convertFilesize",function(e){return TS.utility.convertFilesize(e)
});
Handlebars.registerHelper("toDate",function(e){return TS.utility.date.toDate(e)
});
Handlebars.registerHelper("toCalendarDate",function(e){return TS.utility.date.toCalendarDate(e)
});
Handlebars.registerHelper("toCalendarDateWords",function(e){return TS.utility.date.toCalendarDateWords(e)
});
Handlebars.registerHelper("toCalendarDateShort",function(e){return TS.utility.date.toCalendarDate(e,true)
});
Handlebars.registerHelper("toCalendarDateOrNamedDay",function(e){return TS.utility.date.toCalendarDateOrNamedDay(e)
});
Handlebars.registerHelper("toCalendarDateOrNamedDayWords",function(e){return TS.utility.date.toCalendarDateOrNamedDayWords(e)
});
Handlebars.registerHelper("toCalendarDateIfYesterdayOrToday",function(e){return TS.utility.date.toCalendarDateIfYesterdayOrToday(e)
});
Handlebars.registerHelper("toCalendarDateOrNamedDayShort",function(e){return TS.utility.date.toCalendarDateOrNamedDayShort(e)
});
Handlebars.registerHelper("toTime",function(f,e,g){return TS.utility.date.toTime(f,e!==false,g===true)
});
Handlebars.registerHelper("toTimeWords",function(f,e,g){return TS.utility.date.toTimeWords(f,e!==false,g===true)
});
Handlebars.registerHelper("toTimeAgo",function(e){return TS.utility.date.toTimeAgo(e)
});
Handlebars.registerHelper("msgTsTitle",function(f){var e=(TS.utility.date.toCalendarDateOrNamedDayShort(f.ts)+" at "+TS.utility.date.toTime(f.ts,true,true)).replace(/\s/g,"&nbsp;");
if(TS.client&&!TS.utility.msgs.isTempMsg(f)){e+="&#013;Click to open in archives"
}return e
});
Handlebars.registerHelper("toHour",function(e){return TS.utility.date.toHour(e)
});
Handlebars.registerHelper("timezoneLabel",function(f,e){return TS.utility.date.timezoneLabel(f,e)
});
Handlebars.registerHelper("memberLocalTime",function(e){return TS.utility.date.memberLocalTime(e)
});
Handlebars.registerHelper("memberUTCOffset",function(e){return TS.utility.date.memberUTCOffset(e)
});
Handlebars.registerHelper("isInDifferentTimeZone",function(f,e){if(f.tz_offset!==TS.model.user.tz_offset){return e.fn(this)
}return e.inverse(this)
});
Handlebars.registerHelper("isToday",function(f,e){if(TS.utility.date.isToday(TS.utility.date.toDateObject(f))){return e.fn(this)
}return e.inverse(this)
});
Handlebars.registerHelper("if_equal",function(f,e){if(f==e.hash.compare){return e.fn(this)
}return e.inverse(this)
});
Handlebars.registerHelper("if_not_equal",function(f,e){if(f!=e.hash.compare){return e.fn(this)
}return e.inverse(this)
});
Handlebars.registerHelper("if_gt",function(f,e){if(f>e.hash.compare){return e.fn(this)
}return e.inverse(this)
});
Handlebars.registerHelper("foreach",function(e,f){if(f.inverse&&!e.length){return f.inverse(this)
}return e.map(function(h,g){var i={index:g,value:h,length:e.length};
i.first=g===0;
i.last=g===e.length-1;
return f.fn(i)
}).join("")
});
Handlebars.registerHelper("makeDayDividerDomId",function(e){return TS.templates.makeDayDividerDomId(e)
});
Handlebars.registerHelper("formatFileTitle",function(e){if(!e||!e.title){return""
}return TS.format.formatWithOptions(e.title,null,{no_highlights:false,no_specials:true})
});
Handlebars.registerHelper("formatMessageByType",TS.templates.builders.formatMessageByType);
Handlebars.registerHelper("formatAttachments",TS.templates.builders.formatAttachments);
Handlebars.registerHelper("formatMessage",function(f,e){return TS.format.formatDefault(f,e)
});
Handlebars.registerHelper("formatMessageSimple",function(f,e){return TS.format.formatWithOptions(f,e,{no_highlights:true,no_specials:true})
});
Handlebars.registerHelper("formatMessageAttachmentPart",function(j,i,e,g,f){var h=TS.format.formatWithOptions(j,i,{no_highlights:(e!==true),no_specials:(g!==true),enable_slack_action_links:(f===true)});
h=TS.utility.msgs.handleSearchHighlights(h);
return h
});
Handlebars.registerHelper("formatTopicOrPurpose",function(e){return TS.utility.formatTopicOrPurpose(e)
});
Handlebars.registerHelper("unFormatMessage",function(f,e){return TS.format.unFormatMsg(f,e)
});
Handlebars.registerHelper("formatMessageResult",function(e){e=TS.format.formatJustText(e);
e=TS.utility.msgs.handleSearchHighlights(e);
return e
});
Handlebars.registerHelper("formatStarredMessageAndTruncate",function(h,f){var g=h.text;
if(h.subtype=="channel_topic"){if(h.text){g="channel topic: "+h.text
}else{g="channel topic cleared"
}}else{if(h.subtype=="channel_purpose"){if(h.text){g="channel purpose: "+h.text
}else{g="channel purpose cleared"
}}else{if(h.subtype=="channel_join"){g="joined channel"
}else{if(h.subtype=="channel_leave"){g="left channel"
}else{if(h.subtype=="group_topic"){if(h.text){g="group topic: "+h.text
}else{g="group topic cleared"
}}else{if(h.subtype=="group_purpose"){if(h.text){g="group purpose: "+h.text
}else{g="group purpose cleared"
}}else{if(h.subtype=="group_join"){g="joined group"
}else{if(h.subtype=="group_leave"){g="left group"
}else{if(h.subtype=="group_archive"){g="archived group"
}else{if(h.subtype=="group_unarchive"){g="un-archived group"
}else{if(h.subtype=="channel_archive"){g="archived channel"
}else{if(h.subtype=="channel_unarchive"){g="un-archived channel"
}}}}}}}}}}}}var i=truncate(TS.format.formatDefault(g,h),f);
if(h.permalink){var e=' <a target="'+TS.templates.builders.newWindowName()+'" href="'+h.permalink+'" class="normal tiny">read more</a>';
return i+e
}else{return i
}});
Handlebars.registerHelper("rxnPanel",function(e,f){return TS.templates.builders.rxnPanel(e,f||{})
});
Handlebars.registerHelper("msgActions",function(e){return'<a class="msg_actions" data-msg-ts="'+e.ts+'"><input type="checkbox" class="msg_select_cb" /><i class="msg_cog ts_icon ts_icon_cog ts_icon_inherit"></i></a>'
});
Handlebars.registerHelper("fileActionsCog",function(e){return'<a class="file_actions file_actions_cog ts_icon ts_icon_cog" data-file-id="'+e.id+'"></a>'
});
Handlebars.registerHelper("fileActionsBtn",function(e){return'<a class="file_actions ts_icon ts_icon_chevron_medium_down" data-file-id="'+e.id+'"></a>'
});
Handlebars.registerHelper("fileActionsLink",function(e){return'<a class="file_actions file_actions_link" data-file-id="'+e.id+'">Actions <i class="ts_icon ts_icon_caret_down ts_icon_inherit"></i></a>'
});
Handlebars.registerHelper("makeRefererSafeLink",function(e){return TS.utility.makeRefererSafeLink(e.hash.url)
});
Handlebars.registerHelper("makeSafeForDomId",TS.utility.makeSafeForDomId);
Handlebars.registerHelper("makeMsgAttachmentTextExpanderDomId",TS.templates.makeMsgAttachmentTextExpanderDomId);
Handlebars.registerHelper("makeMsgDomId",TS.templates.makeMsgDomId);
Handlebars.registerHelper("makeMsgLabelDomId",TS.templates.makeMsgLabelDomId);
Handlebars.registerHelper("makeMSRDomId",TS.templates.makeMSRDomId);
Handlebars.registerHelper("makeMsgDomClass",function(f){var e="";
if(!f.subtype){}else{if(f.subtype=="channel_join"||f.subtype=="group_join"){e+="joined"
}else{if(f.subtype=="channel_leave"||f.subtype=="group_leave"){e+="left"
}else{if(f.subtype=="channel_topic"||f.subtype=="group_topic"){e+="topic"
}else{if(f.subtype=="channel_name"||f.subtype=="group_name"){e+="rename"
}else{if(f.subtype=="channel_purpose"||f.subtype=="group_purpose"){e+="purpose"
}else{if(f.subtype=="channel_archive"||f.subtype=="group_archive"){e+="archived"
}else{if(f.subtype=="channel_unarchive"||f.subtype=="group_unarchive"){e+="unarchived"
}else{if(f.subtype=="bot_message"){e+="bot_message"
}else{if(f.subtype==="pinned_item"){e+="pinned"
}}}}}}}}}}return e
});
Handlebars.registerHelper("buildMsgHTMLForSearch",TS.templates.builders.buildMsgHTMLForSearch);
Handlebars.registerHelper("ifExtracts",function(f,e){if(f.previous||f.previous_2||f.next||f.next_2){return e.fn(this)
}return e.inverse(this)
});
Handlebars.registerHelper("willForceExtracts",function(l,e){if((!l.previous&&!l.next)||TS.search.view.resultHasExtracts(l)){return e.inverse(this)
}var h=TS.search.query_string;
var k=h.split(" ");
var g,j;
var f=false;
for(g=0;
g<k.length;
g++){j=$.trim(k[g]);
if(j.length>0&&!TS.search.keyword_modifier_pair_regex.test(j)){f=true;
break
}}if(!f){return e.fn(this)
}return e.inverse(this)
});
Handlebars.registerHelper("formatAttachmentExtracts",function(g,e){var f=g.color||"e3e4e6";
return TS.templates.search_attachment_extracts({attachment:g,message:e,bg_color:f})
});
Handlebars.registerHelper("concatMsgExtracts",function(g){if(!g.extracts||g.extracts.length===0){return""
}var h=[];
var e=TS.templates.builders.search_ellipsis;
g.extracts.forEach(function(i){if(i.text){i.text=i.text.replace(/&&gt;t;>&gt;/g,"&gt;&gt;&gt;")
}var j=TS.format.formatDefault(i.text,g);
j=TS.utility.msgs.handleSearchHighlights(j);
h.push(j)
});
var f=h.join(e);
if(g.extracts[0].truncated_head){f=e+f
}if(g.extracts[g.extracts.length-1].truncated_tail){f+=e
}return f
});
Handlebars.registerHelper("concatAttachmentExtracts",function(f,m){var j=[];
var h=f.extracts;
var l;
var i=TS.templates.builders.search_ellipsis;
if(!h){return""
}["title","text"].forEach(function(n){if(h[n]){h[n].forEach(function(o){var p=TS.format.formatDefault(o.text,m);
p=TS.utility.msgs.handleSearchHighlights(p);
if(j.length===0&&o.truncated_head){p=i+p
}l=o;
j.push(p)
})
}});
var k=j.join(i);
if(k&&l&&l.truncated_tail){k+=i
}if(!k&&h.fields&&!h.fallback){h.fields.forEach(function(o){var n=TS.utility.htmlEntities(o.value.text);
n=TS.utility.msgs.handleSearchHighlights(n);
if(o.value.truncated_head){n=i+n
}if(o.value.truncated_tail){n+=i
}k+="<strong>"+TS.utility.htmlEntities(o.title)+"</strong> &bull; "+n+"<br>"
})
}if(!k&&f.fallback){var e=f.fallback;
if(h.fallback&&h.fallback.length>0){e=h.fallback[0].text
}var g=TS.format.formatDefault(e,m);
g=TS.utility.msgs.handleSearchHighlights(g);
return g
}return k
});
Handlebars.registerHelper("newWindowName",TS.templates.builders.newWindowName);
Handlebars.registerHelper("nl2br",function(e){if(!e){return e
}e=TS.utility.htmlEntities(e);
return e.replace(/\n/g,"<br />").replace(/&amp;#95;/g,"_")
});
Handlebars.registerHelper("smartnl2br",function(e){if(!e){return e
}e=TS.utility.htmlEntities(e);
e=e.replace(/\n\r\n\r/g,'<span class="para_break"><br /></span>');
e=e.replace(/\n\r\n/g,'<span class="para_break"><br /></span>');
e=e.replace(/\n\n/g,'<span class="para_break"><br /></span>');
e=e.replace(/\n/g,"<br />");
return e.replace(/&amp;#95;/g,"_")
});
Handlebars.registerHelper("truncate",function(g,e){var f=truncate(g,e);
return f.replace(/&#64;/g,"@")
});
Handlebars.registerHelper("proxyImgUrls",function(f){var e=$("<div>"+f+"</div>");
e.find("img").each(function(){var h=$(this).attr("src");
var i=$(this).attr("width");
var j=$(this).attr("height");
var g;
if(i&&j){g=TS.utility.getImgProxyURL(h,i,j)
}else{g=TS.utility.getImgProxyURL(h)
}$(this).attr("src",g)
});
return e.html()
});
Handlebars.registerHelper("generalName",function(){var e=TS.channels.getGeneralChannel();
return(e)?e.name:""
});
Handlebars.registerHelper("makeChannelDomId",function(e){return TS.templates.makeChannelDomId(e)
});
Handlebars.registerHelper("ChannelNameMaxLength",function(e){return TS.model.channel_name_max_length
});
Handlebars.registerHelper("ChannelPurposeMaxLength",function(){return TS.model.channel_purpose_max_length
});
Handlebars.registerHelper("ChannelTopicMaxLength",function(){return TS.model.channel_topic_max_length
});
Handlebars.registerHelper("makeUnreadJustDomId",function(e){return TS.templates.makeUnreadJustDomId(e)
});
Handlebars.registerHelper("getCorGNameWithPrefixById",function(g){var e=TS.channels.getChannelById(g);
if(e){return"#"+e.name
}var f=TS.groups.getGroupById(g);
if(f){return TS.model.group_prefix+f.name
}return g
});
Handlebars.registerHelper("makeChannelLink",TS.templates.builders.makeChannelLink);
Handlebars.registerHelper("makeChannelLinkById",function(f){var e=TS.channels.getChannelById(f);
if(e){return TS.templates.builders.makeChannelLink(e)
}});
Handlebars.registerHelper("makeUnreadHighlightDomId",function(e){return TS.templates.makeUnreadHighlightDomId(e)
});
Handlebars.registerHelper("makeChannelDomClass",function(f){var e="";
if(TS.model.active_channel_id==f.id){e+="active "
}if(f.unread_cnt>0){e+="unread "
}if(f.unread_highlight_cnt>0){e+="mention "
}if(TS.notifs.isCorGMuted(f.id)){e+="muted_channel "
}if(f._show_in_list_even_though_no_unreads){e+="show_in_list_even_though_no_unreads "
}return e
});
Handlebars.registerHelper("makeChannelOrGroupLinkById",function(f){var e=TS.shared.getModelObById(f);
if(e.is_channel){return TS.templates.builders.makeChannelLink(e)
}else{if(e.is_group){return TS.templates.builders.makeGroupLink(e)
}}});
Handlebars.registerHelper("makeGroupDomId",function(e){return TS.templates.makeGroupDomId(e)
});
Handlebars.registerHelper("groupPrefix",function(e){return TS.model.group_prefix
});
Handlebars.registerHelper("makeGroupLink",TS.templates.builders.makeGroupLink);
Handlebars.registerHelper("makeGroupLinkById",function(f){var e=TS.groups.getGroupById(f);
if(e){return TS.templates.builders.makeGroupLink(e)
}});
Handlebars.registerHelper("makeGroupDomClass",function(f){var e="";
if(TS.model.active_group_id==f.id){e+="active "
}if(f.unread_cnt>0){e+="unread "
}if(f.unread_highlight_cnt>0){e+="mention "
}if(f.is_starred){e+="starred "
}if(TS.notifs.isCorGMuted(f.id)){e+="muted_channel "
}return e
});
Handlebars.registerHelper("currentUserId",function(){return TS.model.user.id
});
Handlebars.registerHelper("makeMemberDomId",function(e){return TS.templates.makeMemberDomId(e)
});
Handlebars.registerHelper("makeChannelListDomId",function(e){return TS.templates.makeChannelListDomId(e)
});
Handlebars.registerHelper("makeMemberPresenceDomClass",function(e){return TS.templates.makeMemberPresenceDomClass(e.id)
});
Handlebars.registerHelper("makeMemberPresenceIcon",function(e){return TS.templates.makeMemberPresenceIcon(e)
});
Handlebars.registerHelper("makeMemberStatusDomClass",function(e){return TS.templates.makeMemberStatusDomClass(e.id)
});
Handlebars.registerHelper("makeMemberDomClass",function(h){var f="";
if(!h){return f
}if(!h.is_self&&h.presence=="away"){f+="away "
}if(TS.model.active_im_id){var g=TS.ims.getImById(TS.model.active_im_id);
if(g.user==h.id){f+="active "
}}var e=TS.ims.getImByMemberId(h.id);
if(e){if(e.unread_cnt>0||e.unread_highlight_cnt>0){f+="unread mention "
}}return f
});
Handlebars.registerHelper("makeMemberListDomClass",function(f){var e="member ";
if(f.presence=="away"){e+="away "
}return e
});
Handlebars.registerHelper("makeMemberPreviewLink",TS.templates.builders.makeMemberPreviewLink);
Handlebars.registerHelper("makeMemberPreviewLinkById",function(g,e){if(e!==true){e=false
}var f=TS.members.getMemberById(g);
if(!f){return g
}return TS.templates.builders.makeMemberPreviewLink(f,e)
});
Handlebars.registerHelper("makeMemberPreviewLinkImage",TS.templates.builders.makeMemberPreviewLinkImage);
Handlebars.registerHelper("emojiGraphicReplace",function(e){return TS.utility.emojiGraphicReplace(e)
});
Handlebars.registerHelper("emojiGraphicReplaceByName",function(e){return TS.utility.emojiGraphicReplace(":"+e+":")
});
Handlebars.registerHelper("makeMemberImage",TS.templates.builders.makeMemberImage);
Handlebars.registerHelper("makeUsernameImage",function(g,o){var l,f,k,e;
var h;
var n=(g.bot_id)?TS.bots.getBotById(g.bot_id):null;
if(g.icons){h=g.icons
}else{if(n&&n.icons){h=n.icons
}else{}}if(h){if(h.image_36&&!TS.model.is_retina){l=h.image_36
}else{if(h.image_72&&TS.model.is_retina){l=h.image_72
}else{if(h.image_48){l=h.image_48
}else{if(h.emoji&&h.emoji.substr(0,1)==":"&&h.emoji.substr(h.emoji.length-1,1)==":"){k=h.emoji
}}}}}var j=TS.templates.builders.makeBotLink(n,g.username);
var m=(g&&g.is_ephemeral&&g.username=="slackbot")?TS.members.getMemberById("USLACKBOT"):null;
switch(o){case 24:f="thumb_24";
e="https://i0.wp.com/slack-assets2.s3-us-west-2.amazonaws.com/8390/img/avatars/ava_0002-24.png?ssl=1";
if(m){e=m.profile.image_24
}break;
case 32:f="thumb_32";
e="https://i0.wp.com/slack-assets2.s3-us-west-2.amazonaws.com/8390/img/avatars/ava_0002-32.png?ssl=1";
if(m){e=m.profile.image_32
}break;
case 36:f="thumb_36";
e="https://i0.wp.com/slack-assets2.s3-us-west-2.amazonaws.com/8390/img/avatars/ava_0002-48.png?ssl=1";
if(m){e=m.profile.image_48
}break;
case 72:f="thumb_72";
e="https://i0.wp.com/slack-assets2.s3-us-west-2.amazonaws.com/8390/img/avatars/ava_0002-72.png?ssl=1";
if(m){e=m.profile.image_72
}break;
case 192:f="thumb_192";
e="https://i0.wp.com/slack-assets2.s3-us-west-2.amazonaws.com/8390/img/avatars/ava_0002-192.png?ssl=1";
if(m){e=m.profile.image_192
}break;
default:f="thumb_48";
e="https://i0.wp.com/slack-assets2.s3-us-west-2.amazonaws.com/8390/img/avatars/ava_0002-48.png?ssl=1";
if(m){e=m.profile.image_48
}break
}var i;
if(l){i=j.start_a+'<img style="border: 0" src="'+l+'" class="member_image '+f+'" />'+j.end_a
}else{if(k){i=j.start_a+'<div style="border: 0" class="member_image '+f+'">'+TS.utility.emojiGraphicReplace(TS.utility.htmlEntities(k),true,false,true)+"</div>"+j.end_a
}else{if(m){i=j.start_a+'<img src="'+e+'" class="member_image '+f+'" />'+j.end_a
}else{i=j.start_a+'<img src="'+e+'" class="member_image bot_icon_default '+f+'" />'+j.end_a
}}}return i
});
Handlebars.registerHelper("getMemberNameById",function(f){var e=TS.members.getMemberById(f);
return e?e.name:f
});
Handlebars.registerHelper("getMemberDisplayNameById",function(e){return TS.members.getMemberDisplayNameById(e)
});
Handlebars.registerHelper("getMemberDisplayName",function(e){return TS.members.getMemberDisplayName(e)
});
Handlebars.registerHelper("getDisplayNameOfUserForIm",function(e){if(!e){return"MISSING_IM"
}return TS.ims.getDisplayNameOfUserForIm(e)
});
Handlebars.registerHelper("getIMNameById",function(f){var e=TS.ims.getImById(f);
return e?e.name:f
});
Handlebars.registerHelper("getIMIdByMemberId",function(f){var e=TS.ims.getImByMemberId(f);
return e?e.id:""
});
Handlebars.registerHelper("memberHasIm",function(e){var g=e.hash.member;
var f=false;
if(g){if(TS.ims.getImByMemberId(g.id)){f=true
}}if(f){return e.fn(this)
}else{return e.inverse(this)
}});
function b(e){var h=TS.members.getMemberById(e.user);
var g="color_"+((h)?h.id:"unknown");
var f=(TS.utility.shouldLinksHaveTargets())?'target="/messages/@'+e.name+'"':"";
return'<a href="/messages/@'+e.name+'" '+f+'" class="internal_im_link '+g+'" data-member-name="'+e.name+'">@'+e.name+"</a>"
}Handlebars.registerHelper("makeIMLink",b);
Handlebars.registerHelper("makeIMLinkById",function(f){var e=TS.ims.getImById(f);
if(e){return b(e)
}});
function a(h){var j=TS.utility.htmlEntities(h.username);
var g;
var i=(h.bot_id)?TS.bots.getBotById(h.bot_id):null;
if(h.icons){g=h.icons
}else{if(i&&i.icons){g=i.icons
}else{}}if(!j&&i&&i.name){j=TS.utility.htmlEntities(i.name)
}if(!TS.boot_data.feature_bot_message_label){if(TS.members.botNameMatchesMemberName(j)){j+=" (bot)"
}}var e=TS.templates.builders.makeBotLink(i,h.username);
if(!g){return e.start_a+j+e.end_a
}var f;
if(g.emoji&&g.emoji.substr(0,1)==":"&&g.emoji.substr(g.emoji.length-1,1)==":"){f=e.start_a+TS.utility.emojiGraphicReplace(TS.utility.htmlEntities(g.emoji),true,false,true)+e.end_a+" "+e.start_a+j+e.end_a
}else{if(g.image_36&&!TS.model.is_retina){f=e.start_a+'<img src="'+g.image_36+'" class="inline_bot_icon">'+e.end_a+" "+e.start_a+j+e.end_a
}else{if(g.image_72&&TS.model.is_retina){f=e.start_a+'<img src="'+g.image_72+'" class="inline_bot_icon">'+e.end_a+" "+e.start_a+j+e.end_a
}else{if(g.image_48){f=e.start_a+'<img src="'+g.image_48+'" class="inline_bot_icon">'+e.end_a+" "+e.start_a+j+e.end_a
}else{f=e.start_a+j+e.end_a
}}}}return f
}Handlebars.registerHelper("getBotNameAndIcon",a);
Handlebars.registerHelper("getBotName",TS.templates.builders.getBotName);
Handlebars.registerHelper("getBotNameWithLink",TS.templates.builders.getBotNameWithLink);
function c(e){if(!e){return"color_unknown"
}return"color_bot_"+TS.utility.makeSafeForDomClass(e)
}Handlebars.registerHelper("getBotColorClassByUserName",c);
function d(f){var e=TS.members.getMemberById(f);
if(!e){return"color_unknown"
}return"color_"+e.id
}Handlebars.registerHelper("getMemberColorClassById",d);
Handlebars.registerHelper("getMemberColorClassByImId",function(f){var e=TS.ims.getImById(f);
if(!e){return"color_unknown"
}return d(e.user)
});
Handlebars.registerHelper("msgIsFromSelf",function(e){var f=e.hash.msg;
var h=f.user;
if(!h&&f.subtype=="file_comment"&&f.comment){h=f.comment.user
}var g=TS.members.getMemberById(h);
if(!g){return e.inverse(this)
}if(g.is_self){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("memberIsSelf",function(e){var f=TS.members.getMemberById(e.hash.id);
if(!f){return e.inverse(this)
}if(f.is_self){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("memberIsAdmin",function(e){var f=TS.members.getMemberById(e.hash.id);
if(!f){return e.inverse(this)
}if(f.is_admin){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("currentUserIsAdmin",function(e){if(TS.model.user.is_admin){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("currentUserIsOwner",function(e){if(TS.model.user.is_owner){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("tinyspeck",function(e){if(TS.model.team.domain=="tinyspeck"){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("makeUnshareLinkById",function(g){var f=TS.files.getFileById(TS.web.file.file_id);
var e=TS.shared.getModelObById(g);
if(e){return TS.templates.builders.makeUnshareLink(e,f)
}});
Handlebars.registerHelper("makeUnshareLink",function(e){var f=TS.files.getFileById(TS.web.file.file_id);
return TS.templates.builders.makeUnshareLink(e,f)
});
Handlebars.registerHelper("makeFileDomId",function(e){return TS.templates.makeFileDomId(e)
});
Handlebars.registerHelper("makeFileCommentsDomId",function(e){return TS.templates.makeFileCommentsDomId(e)
});
Handlebars.registerHelper("makeFileContentsDomId",function(e){return TS.templates.makeFileContentsDomId(e)
});
Handlebars.registerHelper("makeFileHeader",function(e,g){var f=e.mode=="space"||e.mode=="post";
return TS.templates.file_header({file:e,member:g,is_post_or_space:f})
});
Handlebars.registerHelper("makeFilePreviewHeader",function(e,g){var f=e.mode=="space"||e.mode=="post";
return TS.templates.file_header({file:e,member:g,is_post_or_space:f,preview:true})
});
Handlebars.registerHelper("formatSpaceHtml",function(f){function e(j){if(j.childNodes){for(var h=0;
h<j.childNodes.length;
h++){e(j.childNodes[h])
}}if(j.nodeType==Node.TEXT_NODE){j.textContent=emoji.replace_emoticons_with_colons(j.textContent)
}else{if(j.nodeType==Node.ELEMENT_NODE){j.innerHTML=TS.utility.emojiReplace(j.innerHTML)
}}}var g=$("<div>").html(f);
e(g[0]);
if(TS.client&&TS.client.ui){TS.client.ui.unfurlPlaceholders(g)
}return g.html()
});
Handlebars.registerHelper("fileIsImage",function(e){var f=TS.files.getFileById(e.hash.id);
if(!f){return e.inverse(this)
}if(f.mimetype&&f.mimetype.indexOf("image/")===0){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("makeFilePrivacyLabel",function(f){var e="";
if(f.is_public){e="Published"
}else{if((f.groups.length>0)||(f.ims.length>0)){e="Private"
}else{e="Draft"
}}return e
});
Handlebars.registerHelper("makeExternalFiletypeHTML",function(e){return TS.templates.builders.makeExternalFiletypeHTML(e)
});
Handlebars.registerHelper("makeFileShareLabel",function(e){return TS.templates.builders.makeFileShareLabel(e)
});
Handlebars.registerHelper("makeFileGroupChannelList",function(e){return TS.templates.builders.makeFileGroupChannelList(e)
});
Handlebars.registerHelper("nl2brAndHighlightSearchMatches",function(e){if(!e){return
}e=TS.utility.htmlEntities(e);
e=e.replace(/\n/g,"<br />");
return TS.utility.msgs.handleSearchHighlights(e)
});
Handlebars.registerHelper("highlightSearchMatches",function(e){if(!e){return
}e=TS.utility.htmlEntities(e);
return TS.utility.msgs.handleSearchHighlights(e)
});
Handlebars.registerHelper("highlightSearchMatchesInSpacesHtml",function(e){if(!e){return
}var f=Handlebars.helpers.formatSpaceHtml(e);
return TS.utility.msgs.handleSearchHighlights(f)
});
Handlebars.registerHelper("highlightSearchMatchesInFileTitle",function(e){if(!e){return
}e=TS.utility.emojiGraphicReplace(e);
return TS.utility.msgs.handleSearchHighlights(e)
});
Handlebars.registerHelper("searchFilter",function(){if(!TS.search.filter){return
}return TS.search.filter
});
Handlebars.registerHelper("searchSort",function(){if(!TS.search.sort){return
}return TS.search.sort
});
Handlebars.registerHelper("makeUnreadMessagesDomId",function(e){return TS.templates.makeUnreadMessagesDomId(e)
});
Handlebars.registerHelper("makeUnreadGroupMessagesDomId",function(e){return TS.templates.makeUnreadGroupMessagesDomId(e)
});
Handlebars.registerHelper("makeUnreadDmsDomId",function(e){return TS.templates.makeUnreadDmsDomId(e)
});
Handlebars.registerHelper("makeSentMessagesDomId",function(e){return TS.templates.makeSentMessagesDomId(e)
});
Handlebars.registerHelper("makeSentGroupMessagesDomId",function(e){return TS.templates.makeSentGroupMessagesDomId(e)
});
Handlebars.registerHelper("makeSentDmsDomId",function(e){return TS.templates.makeSentDmsDomId(e)
});
Handlebars.registerHelper("makeActivityMessagesDomId",function(e){return TS.templates.makeActivityMessagesDomId(e)
});
Handlebars.registerHelper("makeActivityDayDomId",function(e){return TS.templates.makeActivityDayDomId(e)
});
Handlebars.registerHelper("makeIssueListDomId",function(e){return TS.templates.makeIssueListDomId(e)
});
Handlebars.registerHelper("math",function(e,f,h,g){if(arguments.length<4){g=h;
h=f;
f="+"
}e=parseFloat(e);
h=parseFloat(h);
return{"+":e+h,"-":e-h,"*":e*h,"/":e/h,"%":e%h}[f]
});
Handlebars.registerHelper("loadingHTML",function(){var e=cdn_url+"/f85a/img/loading_hash_animation_@2x.gif";
return'<div class="loading_hash_animation"><img src="'+e+'" alt="Loading" /><br />loading...</div>'
});
Handlebars.registerHelper("isUsingArchiveViewer",function(e){if(TS.boot_data.feature_archive_viewer){return e.fn(this)
}else{return e.inverse(this)
}});
Handlebars.registerHelper("pinnedFileType",function(e){if(!e){return"file"
}if(e.mode==="space"){return"Space"
}if(e.mode==="snippet"){return"text snippet"
}if(e.mode==="post"){return"post"
}if(e.mode==="external"){var f=TS.templates.builders.makeExternalFiletypeHTML(e);
if(f){return f
}}return"file"
})
}})
})();
(function(){TS.registerModule("utility.date",{month_names:["January","February","March","April","May","June","July","August","September","October","November","December"],short_month_names:["Jan","Feb","March","April","May","June","July","Aug","Sept","Oct","Nov","Dec"],really_short_month_names:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],day_names:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],short_day_names:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],ones_digit_names:["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],tens_digit_names:["twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"],ones_digit_ordinal_names:["zeroth","first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth","eleventh","twelveth"],onStart:function(){},toDateObject:function(e){var c;
if(e&&typeof e=="string"&&e.indexOf("-")>-1){var b=e.split("-");
if(b.length>=3){c=new Date(b[0],b[1]-1,b[2])
}else{c=new Date(0)
}}else{var d=(e||"0").toString();
if(d.indexOf(".")!=-1){c=new Date(d.split(".")[0]*1000)
}else{c=new Date(e*1000)
}}return c
},toTime:function(f,h,k){var b=TS.utility.date.toDateObject(f);
var i=b.getHours();
var d=b.getMinutes();
var e=b.getSeconds();
var c=false;
if(TS.utility.date.do24hrTime()){if(i<10){i="0"+i
}}else{if(i>=12){if(i>12){i=i-12
}c=true
}else{if(i===0){i=12
}}}if(d<10){d="0"+d
}var g="";
if(k){if(e<10){g=":0"+e
}else{g=":"+e
}}var j=i+":"+d+g;
if(h&&!TS.utility.date.do24hrTime()){if(c){j+=" PM"
}else{j+=" AM"
}}return j
},toTimeAmount:function(b){var c={w:TS.utility.date.toWeekAmount(b),d:TS.utility.date.toDayAmount(b)-TS.utility.date.toWeekAmount(b)*7,h:TS.utility.date.toHourAmount(b)-TS.utility.date.toDayAmount(b)*24,mi:b%60};
return c
},toWeekAmount:function(b){return Math.floor(b/10080)
},toDayAmount:function(b){return Math.floor(b/1440)
},toHourAmount:function(b){return Math.floor(b/60)
},toDate:function(f,g){var b=TS.utility.date.toDateObject(f);
var h=b.getFullYear();
var e=b.getMonth();
var i=b.getDate();
var j=b.getHours();
var d=b.getMinutes();
var c=false;
if(TS.utility.date.do24hrTime()){if(j<10){j="0"+j
}}else{if(j>=12){if(j>12){j=j-12
}c=true
}else{if(j===0){j=12
}}}if(i<10){i="0"+i
}if(d<10){d="0"+d
}e=("0"+(e+1)).slice(-2);
var k=h+"-"+e+"-"+i;
if(g){return k
}k+=", "+j+":"+d;
if(!TS.utility.date.do24hrTime()){if(c){k+=" PM"
}else{k+=" AM"
}}return k
},toHumanReadableDateAndTime:function(c){var b=TS.utility.date.maybeGetRelativeDay(c);
if(b){var e=true;
var d=TS.utility.date.toTime(c,e);
return b+" at "+d
}return TS.utility.date.toCalendarDateOrNamedDayShort(c)
},shouldExcludeYear:function(e){var d=TS.utility.date.toDateObject(e);
var c=new Date();
var b=31*24*60*60*1000;
return(d.getFullYear()==c.getFullYear()||c-d<=b)
},toCalendarDateOrNamedDayShort:function(b){var c=TS.utility.date.shouldExcludeYear(b);
return TS.utility.date.toCalendarDateOrNamedDay(b,true,c)
},do24hrTime:function(){if(TS.model.user&&TS.model.prefs&&TS.model.prefs.time24){return true
}return false
},toFilenameFriendlyDate:function(f){var b=TS.utility.date.toDateObject(f);
var g=b.getFullYear();
var e=b.getMonth();
var h=b.getDate();
var i=b.getHours();
var d=b.getMinutes();
var c=false;
if(!TS.utility.date.do24hrTime()){if(i>=12){if(i>12){i=i-12
}c=true
}else{if(i===0){i=12
}}}if(h<10){h="0"+h
}if(i<10){i="0"+i
}if(d<10){d="0"+d
}e=("0"+(e+1)).slice(-2);
var j=g+"_"+e+"_"+h+" "+i+"_"+d;
if(!TS.utility.date.do24hrTime()){if(c){j+=" PM"
}else{j+=" AM"
}}return j
},toCalendarDate:function(f,d,b,i){var c=TS.utility.date.toDateObject(f);
var g=c.getFullYear();
var e=c.getMonth();
var h=c.getDate();
var j;
if(i){j=TS.utility.date.really_short_month_names[e]+" "+h
}else{if(d){j=TS.utility.date.short_month_names[e]+" "+TS.utility.ordinalNumber(h)
}else{j=TS.utility.date.month_names[e]+" "+TS.utility.ordinalNumber(h)
}}if(!b){j+=", "+g
}return j
},maybeGetRelativeDay:function(e){var c=TS.utility.date.toDateObject(e);
var b=new Date();
var d=new Date();
d.setDate(b.getDate()-1);
if(TS.utility.date.sameDay(c,b)){return"Today"
}else{if(TS.utility.date.sameDay(c,d)){return"Yesterday"
}}},toCalendarDateOrNamedDay:function(d,c,e){var f;
var b=TS.utility.date.maybeGetRelativeDay(d);
if(b){f=b+" "
}else{f=TS.utility.date.toCalendarDate(d,c,e)
}return f
},toCalendarDateIfYesterdayOrToday:function(f,d){var c=TS.utility.date.toDateObject(f);
var b=new Date();
var e=new Date();
e.setDate(b.getDate()-1);
var g="";
if(TS.utility.date.sameDay(c,b)){g=TS.utility.date.toCalendarDate(f,d)
}else{if(TS.utility.date.sameDay(c,e)){g=TS.utility.date.toCalendarDate(f,d)
}}return g
},toHour:function(e){var c=TS.utility.date.toDateObject(e);
var b=c.getHours();
var d=false;
if(TS.utility.date.do24hrTime()){if(b<10){b="0"+b
}}else{if(b>=12){if(b>12){b=b-12
}d=true
}else{if(b===0){b=12
}}}var f=b;
if(!TS.utility.date.do24hrTime()){if(d){f+=" PM"
}else{f+=" AM"
}}return""+f
},toDayOfTheWeek:function(c){var b=TS.utility.date.toDateObject(c);
return TS.utility.date.day_names[b.getDay()]
},toTimeAgo:function(j){var d=TS.utility.date.toDateObject(j);
var k=new Date();
var e=TS.utility.date.distanceInSeconds(k,d);
var h=(e<0);
var m=Math.abs(e);
var f=m/60;
var l=f/60;
var o=l/24;
var b=o/(365/12);
var i=o/365;
var c="",g="",n="";
if(m<45){c="less than a minute"
}else{if(m<90){c="about a minute"
}else{if(f<45){c=Math.round(f)+" minutes"
}else{if(f<90){c="about an hour"
}else{if(l<24){c="about "+Math.round(l)+" hours"
}else{if(l<42){c="a day"
}else{if(o<30){c=Math.round(o)+" days"
}else{if(o<45){c="about a month"
}else{if(o<365){c=Math.round(b)+" months"
}else{if(i<1.5){c="about a year"
}else{c=Math.round(i)+" years"
}}}}}}}}}}(h)?g="in ":n=" ago";
return g+c+n
},timezoneLabel:function(g,d){var c="Pacific Standard Time";
var f=-28800;
if(typeof g.tz_label!="undefined"){c=g.tz_label
}if(typeof g.tz_offset!="undefined"){f=g.tz_offset
}var e="<span title='"+c+"'><i class='ts_icon ts_icon_clock_o'></i> ";
if(g.id==TS.model.user.id){if(TS.client){e+=c+" (<a href='/account/settings' target='new'>change</a>)"
}else{e+=c+" (<a href='/account/settings'>change</a>)"
}}else{var b=(TS.model.user.tz_offset-f)/60/60;
if(d){e+=TS.utility.date.memberLocalTime(g)+" / "
}if(b===0){e+="in your timezone"
}else{e+=Math.abs(b)+" hour";
if(Math.abs(b)!=1){e+="s"
}}if(b>0){e+=" behind you"
}else{if(b<0){e+=" ahead of you"
}}e+=" "+TS.utility.date.memberUTCOffset(g)
}e+="</span>";
return e
},memberLocalTime:function(i,e){var h=a(i);
var d=new Date();
var f=d.getTime()+(d.getTimezoneOffset()*60000);
var c=new Date(f+(3600000*(h/3600)));
var g=TS.utility.date.toTime(c/1000,true);
var b;
if(e){b=g
}else{b='<span class="timezone_value">'+g+"</span> local time"
}return b
},memberUTCOffset:function(e){var d=a(e);
var b=d/60/60;
var c="";
if(b===0){c+="(UTC)"
}else{if(b<0){c+="(UTC"+b+")"
}else{if(b>0){c+="(UTC+"+b+")"
}}}return c
},getTimeStamp:function(){return new Date().getTime()
},fake_ts_unique_incrementer:"0",fake_ts_unique_padder:"x",makeTsStamp:function(f,c,e){f=f||new Date().getTime();
c=c||TS.utility.date.fake_ts_unique_padder;
e=(e===undefined||e===null)?++TS.utility.date.fake_ts_unique_incrementer:e;
var b=Math.floor(f/1000).toString();
var g=TS.utility.padNumber(e,6,c);
return b+"."+g
},sameDay:function(b,c){return((b.getFullYear()==c.getFullYear())&&(b.getMonth()==c.getMonth())&&(b.getDate()==c.getDate()))
},sameHour:function(b,c){return((b.getFullYear()==c.getFullYear())&&(b.getMonth()==c.getMonth())&&(b.getDate()==c.getDate())&&(b.getHours()==c.getHours()))
},distanceInSeconds:function(b,d){var c=Math.round(b.getTime()/1000)-Math.round(d.getTime()/1000);
return c
},distanceInMinutes:function(b,d){var c=TS.utility.date.distanceInSeconds(b,d)/60;
return c
},isToday:function(b){var c=new Date();
return TS.utility.date.sameDay(b,c)
},getNextActivityDayStamp:function(e){var d=TS.utility.date.toDateObject(e);
var c=new Date(d.getTime()+86400000);
var b=c.getFullYear()+"-"+TS.utility.padNumber(c.getMonth()+1,2,"0")+"-"+TS.utility.padNumber(c.getDate(),2,"0");
return b
},getPrevActivityDayStamp:function(e){var d=TS.utility.date.toDateObject(e);
var c=new Date(d.getTime()-86400000);
var b=c.getFullYear()+"-"+TS.utility.padNumber(c.getMonth()+1,2,"0")+"-"+TS.utility.padNumber(c.getDate(),2,"0");
return b
},toTimeWords:function(h,k,o){var b=TS.utility.date.toDateObject(h);
var m=b.getHours();
var e=b.getMinutes();
var f=b.getSeconds();
var d=(m>=12);
var c=(e===0);
var j="";
var g="";
var i="";
var l="";
var n="";
if(c&&(f===0||!o)){if(m===0){return"midnight"
}if(m===12){return"noon"
}}if(!TS.utility.date.do24hrTime()){if(m>=12){m=m-12
}else{if(m===0){m=12
}}}j=TS.utility.date.numberToWords(m);
if(c){if(m>12&&TS.utility.date.do24hrTime()){j+=" hundred"
}else{j+=" o'clock"
}}if(e!==0){i=" ";
if(e<10){i+="oh-"
}g=TS.utility.date.numberToWords(e)
}if(o&&f!==0){l=" and "+TS.utility.date.numberToWords(f)+" second"+(f===1?"":"s")
}if(k&&!TS.utility.date.do24hrTime()){n=(d)?" PM":" AM"
}if(TS.utility.date.do24hrTime()&&m===0){return g+" minute"+(e===1?"":"s")+l+" past midnight"
}return j+i+g+l+n
},toCalendarDateWords:function(g,b){var e=TS.utility.date.toDateObject(g);
var h=e.getFullYear();
var f=e.getMonth();
var i=e.getDate();
var d=TS.utility.date.numberToWords(i,true);
var c=TS.utility.date.month_names[f];
var j="";
if(!b){j=", ";
if(h%1000===0){j+=TS.utility.date.numberToWords(h/1000)+"-thousand"
}else{if(h%100===0){j+=TS.utility.date.numberToWords(h/100)+" hundred"
}else{if(h%1000<10){j+=TS.utility.date.numberToWords((h-h%1000)/1000)+"-thousand and "+TS.utility.date.numberToWords(h%1000)
}else{j+=TS.utility.date.numberToWords((h-h%100)/100)+" "+(h%100<10?"oh-":"")+TS.utility.date.numberToWords(h%100)
}}}}return c+" "+d+j
},toCalendarDateOrNamedDayWords:function(e,f){var c=TS.utility.date.toDateObject(e);
var b=new Date();
var d=new Date();
d.setDate(b.getDate()-1);
var g;
if(TS.utility.date.sameDay(c,b)){g="Today"
}else{if(TS.utility.date.sameDay(c,d)){g="Yesterday"
}else{g=TS.utility.date.toCalendarDateWords(e,f)
}}return g
},numberToWords:function(e,c){var d,f,b="";
if(c){if(e<TS.utility.date.ones_digit_ordinal_names.length){b=TS.utility.date.ones_digit_ordinal_names[e]
}else{d=Math.floor(e/10);
f=e%10;
if(e<TS.utility.date.ones_digit_names.length){b=TS.utility.date.ones_digit_names[e]+"th"
}else{if(d<=9){if(f===0){b=TS.utility.date.tens_digit_names[d-2].replace(/y$/,"ieth")
}else{b=TS.utility.date.tens_digit_names[d-2];
b+="-"+TS.utility.date.ones_digit_ordinal_names[f]
}}}}}else{if(e<TS.utility.date.ones_digit_names.length){b=TS.utility.date.ones_digit_names[e]
}else{d=Math.floor(e/10);
f=e%10;
if(d<=9){b=TS.utility.date.tens_digit_names[d-2];
if(f>0){b+="-"+TS.utility.date.ones_digit_names[f]
}}}}return b
},formatDate:function(e,g,h){var b=new Date(g*1000);
var j=new Date();
var i=TS.utility.date.makeTsStamp(b);
var k=TS.utility.date.distanceInMinutes(b,j);
var c=k>(-182*24*60)&&k<(182*24*60);
var f=false,d=false;
if(!h){h=e
}if(isNaN(b.getTime())){return h
}e=e.replace(/{(.*?)}/g,function(l,m){var n;
switch(m){case"date_num":return TS.utility.date.toDate(i,true);
case"date_long":return TS.utility.date.toDayOfTheWeek(i)+", "+TS.utility.date.toCalendarDate(i,false,c);
case"date_long_pretty":n=TS.utility.date.prettifyDateString(i,TS.utility.date.toDayOfTheWeek(i)+", "+TS.utility.date.toCalendarDate(i,false,c));
if(!f&&e.indexOf("{date_long_pretty}")===0&&["today","yesterday","tomorrow"].indexOf(n)!==-1){f=true
}return n;
case"date":return TS.utility.date.toCalendarDate(i,false,c);
case"date_pretty":n=TS.utility.date.prettifyDateString(i,TS.utility.date.toCalendarDate(i,false,c));
if(!f&&e.indexOf("{date_pretty}")===0&&["today","yesterday","tomorrow"].indexOf(n)!==-1){f=true
}return n;
case"date_short":return TS.utility.date.toCalendarDate(i,true,c,true);
case"date_short_pretty":n=TS.utility.date.prettifyDateString(i,TS.utility.date.toCalendarDate(i,true,c,true));
if(!f&&e.indexOf("{date_short_pretty}")===0&&["today","yesterday","tomorrow"].indexOf(n)!==-1){f=true
}return n;
case"time":return TS.utility.date.toTime(i,true);
case"time_secs":return TS.utility.date.toTime(i,true,true);
case"ago":n=TS.utility.date.toTimeAgo(i);
if(!f&&e.indexOf("{ago}")===0){f=true
}return n;
default:d=true;
return""
}});
if(d){return h
}if(f){e=e.charAt(0).toUpperCase()+e.slice(1)
}return e
},prettifyDateString:function(g,c){var e=TS.utility.date.toDateObject(g);
var d=new Date();
var f=new Date((new Date()).valueOf()-1000*60*60*24);
var b=new Date((new Date()).valueOf()+1000*60*60*24);
if(TS.utility.date.sameDay(e,d)){return"today"
}if(TS.utility.date.sameDay(e,f)){return"yesterday"
}if(TS.utility.date.sameDay(e,b)){return"tomorrow"
}return c
}});
var a=function(c){var b=-28800;
if(typeof c.tz_offset!="undefined"){b=c.tz_offset
}return b
}
})();
(function(){TS.registerModule("utility.msgs",{automated_subtypes:["channel_join","channel_leave","channel_topic","channel_purpose","channel_archive","channel_unarchive","group_join","group_leave","group_topic","group_purpose","group_archive","group_unarchive","group_name","channel_name","play_sound","pinned_item"],ephemeral_msgs_map:{},onStart:function(){},appendMsg:function(a,b){a.unshift(TS.utility.msgs.makeSureMsgObIsValid(b))
},setMsgs:function(a,c){for(var b=0;
b<c.length;
b++){c[b]=TS.utility.msgs.makeSureMsgObIsValid(c[b])
}TS.utility.msgs.sortMsgs(c);
a.msgs=c;
TS.utility.msgs.maybeStoreMsgs(a.id,a.msgs);
return a.msgs
},spliceMsg:function(b,c){var a=b.indexOf(c);
if(a>-1){b.splice(a,1)
}},getNonTempMsgFromUserMatchingText:function(e,a,c){if(!e&&e!==0){return null
}var d;
for(var b=0;
b<c.length;
b++){d=c[b];
if(d.user!=a){continue
}if(TS.utility.msgs.isTempMsg(d)){continue
}if(d.text==e){return d
}}return null
},getMsgByProp:function(a,d,c){if(!d&&d!==0){return null
}var e;
for(var b=0;
b<c.length;
b++){e=c[b];
if(e[a]==d){return e
}}return null
},getEditableMsgByProp:function(a,d,c){if(!d&&d!==0){return null
}var e;
for(var b=0;
b<c.length;
b++){e=c[b];
if(e.subtype&&e.subtype!="me_message"){continue
}if(e[a]==d){return e
}}return null
},sortMsgs:function(b){function a(d,c){if(d.ts<c.ts){return 1
}if(d.ts>c.ts){return -1
}return 0
}b.sort(a)
},getPrevDisplayedMsg:function(c,d){var e;
var a=false;
for(var b=0;
b<d.length;
b++){e=d[b];
if(a){if(!e.no_display&&!e._jl_rolled_up_in){return e
}}else{if(e.ts==c){a=true
}}}return null
},getDisplayedMsgs:function(c){var a=[];
var d;
for(var b=0;
b<c.length;
b++){d=c[b];
if(!d.no_display&&!d._jl_rolled_up_in){a.push(d)
}}return a
},getDisplayedMsgAfterTS:function(b,c){var d;
for(var a=c.length-1;
a>-1;
a--){d=c[a];
if(d.ts>b){if(!d.no_display&&!d._jl_rolled_up_in){return d
}}}return null
},getDisplayedMsgBeforeTS:function(b,c){var d;
for(var a=0;
a<c.length;
a++){d=c[a];
if(d.ts<b){if(!d.no_display&&!d._jl_rolled_up_in){return d
}}}return null
},getMsg:function(b,a){if(!a){return null
}return TS.utility.msgs.getMsgByProp("ts",b,a)
},getMsgByRspId:function(a,b){if(!b){return null
}return TS.utility.msgs.getMsgByProp("rsp_id",a,b)
},getMsgActions:function(e){if(!e){return
}var c=(e.subtype=="file_upload"||e.subtype=="file_share"||e.subtype=="file_mention"||e.subtype=="file_comment");
var d={edit_msg:true,delete_msg:true};
var a=false;
if(e.user==TS.model.user.id){a=true
}if(!a){d.edit_msg=false
}else{if(TS.model.team.prefs.msg_edit_window_mins>-1&&(TS.utility.date.getTimeStamp()-TS.utility.date.toDateObject(e.ts))/60000>TS.model.team.prefs.msg_edit_window_mins){d.edit_msg=false
}else{if(TS.utility.msgs.automated_subtypes.indexOf(e.subtype)!=-1){d.edit_msg=false
}else{if(c){d.edit_msg=false
}}}}if(!TS.model.team.prefs.allow_message_deletion){if(!TS.model.user.is_admin){d.delete_msg=false
}else{if(TS.model.active_im_id&&!a){d.delete_msg=false
}}}else{if(TS.model.active_im_id){if(!a&&e.user!="USLACKBOT"&&e.subtype!="bot_message"){d.delete_msg=false
}}else{if(!a){if(!TS.model.user.is_admin){d.delete_msg=false
}}else{if(TS.utility.msgs.automated_subtypes.indexOf(e.subtype)!=-1){if(!TS.model.user.is_admin&&e.subtype!=="pinned_item"){d.delete_msg=false
}}}}}if(e.is_ephemeral){d.delete_msg=true
}else{if(TS.boot_data.feature_pins&&TS.client&&e.subtype!=="pinned_item"&&e.subtype!=="unpinned_item"){var b=TS.shared.getActiveModelOb();
if(TS.pins.canUserPinHere(b)){if(TS.pins.isMessagePinned(e,b)){d.unpin_msg=true
}else{d.pin_msg=true
}}}if(TS.boot_data.feature_reactions){if(e.subtype=="file_comment"){d.add_file_comment_rxn=true
}else{if(c){d.add_file_rxn=true
}else{d.add_rxn=true
}}}}return d
},maybeStoreMsgs:function(d,c,b){if(!TS.client){return
}c=TS.utility.msgs.prepareMsgsForLS(c,d);
var a=TS.storage.fetchMsgsRaw(d);
if(b||!a||!TS.utility.areSimpleObjectsEqual(a,c,"msgs of c_id:"+d)){TS.storage.storeMsgs(d,c)
}},validateMsg:function(c,b,a){if(!b.ts){TS.error("msg lacks a ts ("+c+")");
TS.dir(0,b);
return false
}if(TS.utility.msgs.getMsg(b.ts,a)){TS.warn("msg "+b.ts+" already exists! ("+c+")");
TS.dir(0,b);
return false
}return true
},replaceMsg:function(c,b,a){var e=TS.utility.msgs.getMsg(b.ts,c.msgs);
if(!e&&c._archive_msgs){e=TS.utility.msgs.getMsg(b.ts,c._archive_msgs)
}if(!e){if(!a){TS.error("unknown msg:"+b.ts+" in "+c.id)
}return
}if(TS.boot_data.feature_reactions){b._rxn_key=e._rxn_key
}if(!b.pinned_to){b.pinned_to=e.pinned_to
}if(!("is_starred" in b)){b.is_starred=e.is_starred
}var f=b.comment||null;
b=TS.utility.msgs.processImsg(b,c.id);
if(f){b.comment=f
}var d;
for(d in e){delete e[d]
}for(d in b){e[d]=b[d]
}if(c.id==TS.model.active_im_id){TS.ims.message_changed_sig.dispatch(c,e)
}else{if(c.id==TS.model.active_channel_id){TS.channels.message_changed_sig.dispatch(c,e)
}else{if(c.id==TS.model.active_group_id){TS.groups.message_changed_sig.dispatch(c,e)
}}}TS.utility.msgs.maybeStoreMsgs(c.id,c.msgs)
},removeEphemeralMsg:function(b,c){var a=TS.groups.getGroupById(b)||TS.channels.getChannelById(b);
if(!a){return
}if(a.is_channel){TS.channels.removeMsg(b,TS.utility.msgs.getMsg(c,a.msgs))
}else{if(a.is_group){TS.groups.removeMsg(b,TS.utility.msgs.getMsg(c,a.msgs))
}}},getMemberFromMemberMarkup:function(b){var c=b.substr(1);
if(c){c=c.split("|")[0]
}var a=TS.members.getMemberById(c);
if(!a){a=TS.members.getMemberByName(c)
}return a
},makeSureMsgObIsValid:function(a){return a
},api_url_prefix:"api::",doApiUrl:function(b){if(!TS.client){alert("This link will not work in the archives.");
return
}b=b.replace(TS.utility.msgs.api_url_prefix,"");
var f=b.split("?");
var a=f[0];
var h={};
if(f.length>1){var e=f[1].split("&");
for(var g=0;
g<e.length;
g++){var d=e[g].indexOf("=");
if(d!=-1){var c=e[g].substring(0,d);
var j=e[g].substring(d+1);
h[c]=unescape(j)
}}}TS.api.call(a,h)
},new_api_url_prefix:"slack-action://",doNewApiUrl:function(a){if(!TS.client){alert("This link will not work in the archives.");
return
}var c=a.replace(TS.utility.msgs.new_api_url_prefix,"").split("/");
var d=c.shift();
var b=c.join("/");
TS.api.call("chat.action",{bot:d,payload:decodeURIComponent(b)})
},getHighlightWordsRegex:function(){if(!TS.model.highlight_words_regex){TS.utility.msgs.makeHighlightWordsRegex()
}return TS.model.highlight_words_regex
},makeHighlightWordsRegex:function(){var b;
var c=[];
for(var a=0;
a<TS.model.highlight_words.length;
a++){b=TS.format.swapOutAts(TS.model.highlight_words[a]);
b=TS.utility.regexpEscape(b);
if(b=="don"){b+="(?!'t)"
}c.push(b)
}TS.model.highlight_words_regex=new RegExp("(\\b|_|\\s|^)("+c.join("|")+")(\\b|_|\\s|$)","i")
},msgContainsMention:function(b,h){var e=TS.utility.msgs.getHighlightWordsRegex();
var f=(b.subtype=="bot_message");
function a(i){if(!i){return false
}if(TS.model.you_regex.test(i)){return true
}if(TS.boot_data.feature_at_here&&TS.model.here_regex.test(i)&&!h){return true
}if(TS.model.everyone_regex.test(i)){return true
}if(TS.model.channel_regex.test(i)){return true
}if(TS.model.group_regex.test(i)){return true
}if(f){return false
}i=TS.format.swapOutAts(i);
if(e.test(i)){return true
}return false
}if(!b.ignore_if_attachments_supported&&a(b.text)){return true
}var g;
var j;
if(b.attachments){for(var d=0;
d<b.attachments.length;
d++){g=b.attachments[d];
if(g.from_url){continue
}if(a(g.title)){return true
}if(a(g.pretext)){return true
}if(a(g.text)){return true
}if(a(g.footer)){return true
}if(!g.fields||!g.fields.length){continue
}for(var c=0;
c<g.fields.length;
c++){j=g.fields[c];
if(a(j.value)){return true
}}}}return false
},getMsgMentionData:function(b){var h={mentions:false,non_channel_mentions:false};
var e=TS.utility.msgs.getHighlightWordsRegex();
var f=(b.subtype=="bot_message");
function a(i){if(j(i)){h.non_channel_mentions=true;
h.mentions=true;
return true
}if(l(i)){h.mentions=true
}return false
}function j(i){if(!i){return false
}if(TS.model.you_regex.test(i)){return true
}if(f){return false
}i=TS.format.swapOutAts(i);
if(e.test(i)){return true
}return false
}function l(i){if(!i){return false
}if(TS.model.everyone_regex.test(i)){return true
}if(TS.model.channel_regex.test(i)){return true
}if(TS.model.group_regex.test(i)){return true
}return false
}if(!b.ignore_if_attachments_supported&&a(b.text)){return h
}var g;
var k;
if(b.attachments){for(var d=0;
d<b.attachments.length;
d++){g=b.attachments[d];
if(g.from_url){continue
}if(a(g.title)){return h
}if(a(g.pretext)){return h
}if(a(g.text)){return h
}if(a(g.footer)){return h
}if(!g.fields||!g.fields.length){continue
}for(var c=0;
c<g.fields.length;
c++){k=g.fields[c];
if(a(k.value)){return h
}}}}return h
},msgCanCountAsUnread:function(a){if(a.no_display){return false
}if(a.subtype=="channel_join"&&a.inviter&&a.user==TS.model.user.id){return true
}if(a.subtype=="group_join"&&a.inviter&&a.user==TS.model.user.id){return true
}if(a.user==TS.model.user.id){return false
}if(a.subtype=="channel_join"){return false
}if(a.subtype=="channel_leave"){return false
}if(a.subtype=="group_join"){return false
}if(a.subtype=="group_leave"){return false
}if(a.comment&&a.comment.user==TS.model.user.id){return false
}return true
},countAllUnreads:function(){TS.model.all_unread_highlights_cnt=0;
TS.model.all_unread_cnt=0;
var c;
var b;
var d;
var e;
var a=TS.channels.getChannelsForUser();
for(c=0;
c<a.length;
c++){d=a[c];
if(d.is_archived&&!d.was_archived_this_session){continue
}TS.model.all_unread_cnt+=parseInt(d.unread_cnt)||0;
TS.model.all_unread_highlights_cnt+=parseInt(d.unread_highlight_cnt)||0
}for(c=0;
c<TS.model.groups.length;
c++){e=TS.model.groups[c];
if(e.is_archived&&!e.was_archived_this_session){continue
}TS.model.all_unread_cnt+=parseInt(e.unread_cnt)||0;
TS.model.all_unread_highlights_cnt+=parseInt(e.unread_highlight_cnt)||0
}for(c=0;
c<TS.model.ims.length;
c++){b=TS.model.ims[c];
TS.model.all_unread_cnt+=parseInt(b.unread_cnt)||0;
TS.model.all_unread_highlights_cnt+=parseInt(b.unread_cnt)||0
}},doesMsgHaveRxnFromUser:function(b,a){return TS.rxns.doesRxnsHaveRxnFromUser(TS.rxns.getExistingRxnsByKey(b._rxn_key),a)
},doesMsgHaveRxn:function(b,a){return TS.rxns.doesRxnsHaveRxn(TS.rxns.getExistingRxnsByKey(b._rxn_key),a)
},recordEmojiInHash:function(g,e){if(!g){return false
}if(!e){return false
}var f=true;
var a=TS.utility.findAllTeamEmojiInStr(g,f);
if(!a.length){return false
}var d=false;
var b;
for(var c=0;
c<a.length;
c++){b=a[c].replace(/:/g,"").toLowerCase();
if(!emoji.map.colons[b]){continue
}if(!parseInt(e[b])){e[b]=0
}e[b]++;
d=true
}return d
},populateEmojiUsePrefFromExistingMsgs:function(){TS.model.emoji_use={};
TS.utility.msgs.countAllExistingEmoji(TS.shared.getAllModelObsForUser(),TS.model.emoji_use,TS.model.user.id,{});
TS.dir(888,TS.model.emoji_use,"TS.model.emoji_use is now:");
TS.utility.callFuncWhenApiQisEmpty(TS.prefs.saveEmojiUse)
},populateEmojiUsePrefFromAllHistory:function(){TS.model.emoji_use={};
var l=TS.model.user.id;
var d=TS.utility.date.makeTsStamp(TS.model.user.created*1000);
var f={};
var g={};
var b=0;
var j=0;
var k=0;
var a=0;
var h=function(){k=0;
a++;
var m=TS.shared.getAllModelObsForUser();
for(var n=0;
n<m.length;
n++){if(g[m[n].id]){continue
}g[m[n].id]=true;
return m[n]
}return null
};
var e=function(m){if(m.is_channel){return"channels.history"
}if(m.is_group){return"groups.history"
}if(m.is_im){return"im.history"
}TS.dir(0,m);
throw ("wtf")
};
var i=function(m,n){setTimeout(c,parseInt(TS.qs_args.delay)||3000,m,n)
};
var c=function(m,n){if(!m){TS.log(888,"done getting all messages");
return
}TS.api.call(e(m),{channel:m.id,count:1000,latest:n||""},function(q,r,p){if(!q||!r||!r.messages){TS.error("failed to get history");
i(h());
return
}if(window.stahp){TS.error("stahp");
return
}r.messages.forEach(function(s){b++;
k++;
if(l&&s.user!=l){return
}var t=m.id+"_"+s.ts;
if(f){if(f[t]){return
}f[t]=true
}TS.prefs.recordEmojiUse(s.text);
j++
});
TS.log(888,"getHistory ["+a+" of "+TS.shared.getAllModelObsForUser().length+"] "+m.name+" model_ob:"+k+" total:"+b+" user:"+j);
if(!r.messages.length){TS.error("no data.messages? so moving on");
i(h())
}else{var o=r.messages[r.messages.length-1].ts;
if(o<d){TS.log(888,"oldest_ts:"+o+" < after_ts:"+d+" so moving on");
i(h())
}else{if(r.has_more){i(m,o)
}else{i(h())
}}}})
};
i(h())
},countAllExistingEmoji:function(a,d,c,b){a=a||TS.channels.getChannelsForUser();
d=d||{};
a.forEach(function(e){if(!e.msgs){return
}e.msgs.forEach(function(h){var i=e.id+"_"+h.ts;
if(b){if(b[i]){return
}b[i]=true
}if(TS.boot_data.feature_reactions){var g=TS.rxns.getExistingRxnsByKey(h._rxn_key);
if(g){for(var f in g){if(c&&TS.rxns.doesRxnsHaveRxnFromMember(g,f,c)){continue
}TS.utility.msgs.recordEmojiInHash(f,d)
}}}if(c&&h.user!=c){return
}TS.utility.msgs.recordEmojiInHash(h.text,d)
})
});
return d
},reCalcAndCountAllUnreads:function(){var c;
var b;
var d;
var e;
var a=TS.channels.getChannelsForUser();
for(c=0;
c<a.length;
c++){d=a[c];
if(d.is_archived&&!d.was_archived_this_session){continue
}TS.channels.calcUnreadCnts(d)
}for(c=0;
c<TS.model.groups.length;
c++){e=TS.model.groups[c];
if(e.is_archived&&!e.was_archived_this_session){continue
}TS.groups.calcUnreadCnts(e)
}for(c=0;
c<TS.model.ims.length;
c++){b=TS.model.ims[c];
TS.ims.calcUnreadCnts(b)
}TS.utility.msgs.countAllUnreads()
},whatisunread:function(){var c;
var b;
var d;
var e;
var a=[];
for(c=0;
c<TS.model.channels.length;
c++){d=TS.model.channels[c];
if(d.unread_cnt){a.push("C:"+d.name+" "+d.unread_cnt)
}}for(c=0;
c<TS.model.groups.length;
c++){e=TS.model.groups[c];
if(e.unread_cnt){a.push("G:"+e.name+" "+e.unread_cnt)
}}for(c=0;
c<TS.model.ims.length;
c++){b=TS.model.ims[c];
if(b.unread_cnt){a.push("D:"+b.name+" "+b.unread_cnt)
}}TS.info("unreads: "+a.join(","))
},maybeSetOldestMsgsTsAfterMsgAdded:function(a){if(a.oldest_msg_ts){return
}if(a.latest){return
}TS.utility.msgs.setOldestMsgsTs(a)
},setOldestMsgsTs:function(a){var b=TS.utility.msgs.getOldestValidTs(a.msgs);
if(b){a.oldest_msg_ts=b;
TS.storage.storeOldestTs(a.id,a.oldest_msg_ts)
}},getOlderMsgsStatus:function(b){var g=b.msgs;
var c=b.oldest_msg_ts;
var a=TS.shared.getLatestMsgTs(b)||null;
var f=false;
var h="ERROR";
var e=false;
var d=0;
if(c&&TS.utility.msgs.getMsg(c,g)){f=true
}if(!a){if(g.length){e=false;
d=1;
h="There are NOT older messages than these."
}else{e=false;
d=2;
h="THIS IS A BRAND NEW CHANNEL SAY SOMETHING"
}}else{if(f||b.is_limited){e=false;
d=3;
h="We have the oldest msg: "+c+". is_limited:"+b.is_limited
}else{e=true;
d=4;
if(c){h="There are older messages than these. oldest_msg_ts: "+c
}else{h="There are older messages than these. oldest_msg_ts: unknown"
}}}return{text:h,more:e,code:d,is_limited:b.is_limited}
},getMostRecentValidTs:function(b){var c;
for(var a=0;
a<b.length;
a++){c=b[a];
if(!TS.utility.msgs.isTempMsg(c)){return c.ts
}}return null
},getOldestValidTs:function(b){var c;
for(var a=b.length-1;
a>-1;
a--){c=b[a];
if(!TS.utility.msgs.isTempMsg(c)){return c.ts
}}return null
},getHistoryFetchJobKey:function(a,b){var c=a;
if(b){c+="_"+b
}return c
},processImsg:function(a,b){TS.utility.msgs._slurpExtraData(a,b);
return TS.utility.msgs._makeInternalMsgObject(a)
},processImsgFromHistory:function(a,b){var c=TS.utility.msgs.processImsg(a,b);
a.channel=b;
if(a.subtype=="message_deleted"){TS.ms.msg_handlers.subtype__message_deleted(a)
}else{if(a.subtype=="message_changed"){TS.ms.msg_handlers.subtype__message_changed(a)
}}return c
},_makeInternalMsgObject:function(d){var a={type:"message",ts:d.ts};
if(d.type=="channel_topic"||d.type=="channel_purpose"||d.type=="channel_join"||d.type=="channel_leave"){d.subtype=d.type
}if(d.inviter){a.inviter=d.inviter
}if(d.hidden){a.hidden=d.hidden
}if(d.no_notifications){a.no_notifications=d.no_notifications
}if(d.ignore_if_attachments_supported){a.ignore_if_attachments_supported=d.ignore_if_attachments_supported
}if(d.hidden||d.no_display){a.no_display=true
}if(d.ignore_if_attachments_supported&&(!d.attachments||!d.attachments.length)){a.no_display=true
}if(d.edited){a.edited=d.edited
}if(d.user){a.user=d.user
}if(d.attachments){a.attachments=d.attachments
}if(d.img_vids){a.img_vids=d.img_vids
}var e;
if(d.imgs){a.img_vids=a.img_vids||{};
var c;
for(e in d.imgs){if(a.img_vids[e]){continue
}c=d.imgs[e];
c.img_vid_type="img";
a.img_vids[e]=c
}}if(d.videos){a.img_vids=a.img_vids||{};
var g;
for(e in d.videos){if(a.img_vids[e]){continue
}g=d.videos[e];
g.img_vid_type="video";
a.img_vids[e]=g
}}if(d.icons){a.icons=d.icons
}if(d.bot_id){a.bot_id=d.bot_id
}if(d.is_ephemeral){a.is_ephemeral=d.is_ephemeral
}if(d._alert_even_though_temp){a._alert_even_though_temp=d._alert_even_though_temp
}if(d.is_starred){a.is_starred=d.is_starred
}if(d.reactions){delete d.reactions
}if(d._rxn_key){a._rxn_key=d._rxn_key
}if(d.pinned_to){a.pinned_to=d.pinned_to
}if(d.topic){a.topic=d.topic
}if(d.name){a.name=d.name
}if(d.old_name){a.old_name=d.old_name
}if(d.purpose){a.purpose=d.purpose
}if(d.text){a.text=d.text
}if(d.sound){a.sound=d.sound
}if("mrkdwn" in d){a.mrkdwn=!!d.mrkdwn
}if("hex_swatches" in d){a.hex_swatches=!!d.hex_swatches
}if(d.subtype){a.subtype=d.subtype;
if(a.subtype=="bot_message"){if(d.username){a.username=d.username
}}if(d.subtype=="file_share"||d.subtype=="file_mention"||d.subtype=="file_comment"){if(d.upload){a.upload=true
}if(d.file){var f=TS.files.getFileById(d.file.id);
if(f){a.file=f
}else{TS.error("no file, no_display = true "+a.ts);
a.no_display=true
}}else{a.no_display=true
}if(d.subtype=="file_comment"){if(d.comment){if(a.file){a.comment=TS.files.addCommentToFile(d.comment,a.file)
}else{a.comment=d.comment
}}else{a.no_display=true
}}}if(d.subtype==="pinned_item"){if(TS.boot_data.feature_pins){if(d.item_type){a.item_type=d.item_type
}if(d.item_type==="F"){if(d.item){var b=TS.files.getFileById(d.item.id);
a.item=b
}}else{if(d.item_type==="Fc"||d.item_type==="C"||d.item_type==="G"){a.item=d.item
}else{a.no_display=true
}}}else{a.no_display=true
}}}return a
},fetchInitialMsgsFromLS:function(b){var c=TS.storage.fetchMsgs(b.id);
var a=TS.model.initial_msgs_cnt;
if(c.length>a){c.length=a
}return c
},processAttachments:function(a){if(!a){return
}var h;
for(var e=0;
e<a.length;
e++){h=a[e];
if(!h){TS.warn("attachment is null!");
continue
}if(h.slack_file_id&&!h._slack_file_is_deleted){var d=TS.files.getFileById(h.slack_file_id);
if(d){h._slack_file=d
}else{if(h._slack_file){h._slack_file=TS.files.upsertFile(h._slack_file).file
}}}if(h.mrkdwn_in&&$.isArray(h.mrkdwn_in)&&h.mrkdwn_in.length){h.mrkdwn_in_hash={};
for(var b=0;
b<h.mrkdwn_in.length;
b++){h.mrkdwn_in_hash[h.mrkdwn_in[b]]=true
}}if(!h.mrkdwn_in_hash){h.mrkdwn_in_hash={}
}delete h.mrkdwn_in;
h.hex_swatches=!!h.hex_swatches;
if(h.audio_html||h.audio_url){TS.inline_audios.makeInternalInlineAudio(h.audio_html||h.audio_url,h)
}if(h.screenhero_config){try{h.screenhero_config=JSON.parse(h.screenhero_config)
}catch(f){}}if(h.other_html){TS.inline_others.makeInternalInlineOther(h)
}else{if(h.video_html){var c=(h.video_html_width&&parseInt(h.video_html_width)>parseInt(h.thumb_width))?h.video_html_width:h.thumb_width;
var g=(h.video_html_height&&parseInt(h.video_html_height)>parseInt(h.thumb_height))?h.video_html_height:h.thumb_height;
TS.inline_videos.makeInternalInlineVideo(h.from_url||h.thumb_url,{title:h.title,html:h.video_html,thumbnail:{url:h.thumb_url,width:c,height:g,link_url:h.from_url||h.title_url}})
}else{if(h.image_url){TS.inline_imgs.makeInternalInlineImg(h.from_url||h.image_url,{src:h.image_url,width:h.image_width,height:h.image_height,link_url:h.from_url||h.title_url||h.image_url,bytes:h.image_bytes})
}else{if(h.from_url){TS.inline_attachments.makeInternalInlineAttachment(h.from_url,h)
}}}}TS.inline_attachments.massageAttachment(h,e)
}},_slurpExtraData:function(a,d){TS.utility.msgs.processAttachments(a.attachments);
if(TS.boot_data.feature_reactions){a._rxn_key=TS.rxns.getRxnKey("message",a.ts,d);
if(a.reactions){TS.rxns.upsertRxnsFromDataAndUpdateUI(a._rxn_key,a.reactions);
delete a.reactions
}}var b;
if(a.img_vids){var e;
for(b in a.img_vids){e=a.img_vids[b];
if(e.img_vid_type=="img"){TS.inline_imgs.makeInternalInlineImg(b,e)
}else{if(e.img_vid_type=="video"){TS.inline_videos.makeInternalInlineVideo(b,e)
}}}}if(a.imgs){for(b in a.imgs){a.imgs[b].from_url=b;
TS.inline_imgs.makeInternalInlineImg(b,a.imgs[b])
}}if(a.videos){for(b in a.videos){a.videos[b].from_url=b;
TS.inline_videos.makeInternalInlineVideo(b,a.videos[b])
}}if(a.subtype=="file_share"||a.subtype=="file_mention"||a.subtype=="file_comment"){if(a.file&&!a.file.id){TS.error("WTF no file id on file in imsg.subtype:"+a.subtype+" "+a.ts)
}else{if(a.file){TS.files.upsertAndSignal(a.file);
if(a.subtype=="file_share"||a.subtype=="file_mention"){}if(a.subtype=="file_comment"){if(a.comment){var c=TS.files.getFileById(a.file.id);
if(c){TS.files.addCommentToFile(a.comment,c)
}else{TS.warn("WTF no file? id:"+a.file.id)
}}else{TS.error("WTF no comment in imsg.subtype:"+a.subtype+" "+a.ts)
}}}else{}}}if(a.subtype=="pinned_item"&&TS.boot_data.feature_pins){if(a.item_type==="F"&&a.item&&a.item.id&&!a.item.is_deleted){TS.files.upsertAndSignal(a.item)
}}},constructMsgPermalink:function(a,b){if(a.is_im){return"/archives/"+a.id+"/p"+b.replace(".","")
}return"/archives/"+a.name+"/p"+b.replace(".","")
},isTempMsg:function(a){return(!a.ts||a.ts.indexOf(TS.utility.date.fake_ts_unique_padder)>-1)
},shouldMarkUnreadsOnMessageFetch:function(){if(TS.qs_args.no_unread_marking_on_msgs_fetch=="1"){return false
}return true
},ipsum:function(){var a=["Now that we know who you are, I know who I am.","I'm not a mistake! It all makes sense! In a comic, you know how you can tell who the arch-villain's going to be? He's the exact opposite of the hero.","And most times they're friends, like you and me! I should've known way back when… You know why, David? Because of the kids.","They called me Mr Glass.","Normally, both your asses would be dead as fucking fried chicken, but you happen to pull this shit while I'm in a transitional period so I don't wanna kill you, I wanna help you.","But I can't give you this case, it don't belong to me.","Besides, I've already been through too much shit this morning over this case to hand it over to your dumb ass.","Now that there is the Tec-9, a crappy spray gun from South Miami.","This gun is advertised as the most popular gun in American crime.","Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime.","Like they're actually proud of that shit.","Now that there is the Tec-9, a crappy spray gun from South Miami.","This gun is advertised as the most popular gun in American crime.","Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime.","Like they're actually proud of that shit.","Look, just because I don't be givin' no man a foot massage don't make it right for Marsellus to throw Antwone into a glass motherfuckin' house, fuckin' up the way the nigger talks.","Motherfucker do that shit to me, he better paralyze my ass, 'cause I'll kill the motherfucker, know what I'm sayin'?","You think water moves fast? You should see ice.","It moves like it has a mind.","Like it knows it killed the world once and got a taste for murder.","After the avalanche, it took us a week to climb out.","Now, I don't know exactly when we turned on each other, but I know that seven of us survived the slide… and only five made it out.","Now we took an oath, that I'm breaking now.","We said we'd say it was the snow that killed the other two, but it wasn't.","Nature is lethal but it doesn't hold a candle to man."];
return a
},removeFileSharesAndMentions:function(b,d){if(!TS.client){return
}var e=b.msgs;
var a;
for(var c=e.length-1;
c>-1;
c--){a=e[c];
if((a.subtype=="file_share"||a.subtype=="file_mention")&&a.file&&a.file.id==d.id){if(b.is_channel){TS.channels.removeMsg(b.id,a)
}else{if(b.is_group){TS.groups.removeMsg(b.id,a)
}else{TS.ims.removeMsg(b.id,a)
}}}}},removeFileComments:function(b,d){if(!TS.client){return
}var e=b.msgs;
var a;
for(var c=e.length-1;
c>-1;
c--){a=e[c];
if(a.subtype=="file_comment"&&a.file&&a.file.id==d.id){if(b.is_channel){TS.channels.removeMsg(b.id,a)
}else{if(b.is_group){TS.groups.removeMsg(b.id,a)
}else{TS.ims.removeMsg(b.id,a)
}}}}},removeFileReferences:function(b,e){if(!TS.client){return
}var f=b.msgs;
var a;
for(var d=f.length-1;
d>-1;
d--){a=f[d];
if(a.attachments){var c=TS.inline_attachments.getAttachmentBySlackFileId(a.attachments,e);
if(c&&!c._slack_file_is_deleted){c._slack_file_is_deleted=true;
delete c._slack_file;
if(b.id==TS.model.active_im_id){TS.ims.message_changed_sig.dispatch(b,a)
}else{if(b.id==TS.model.active_channel_id){TS.channels.message_changed_sig.dispatch(b,a)
}else{if(b.id==TS.model.active_group_id){TS.groups.message_changed_sig.dispatch(b,a)
}}}TS.utility.msgs.maybeStoreMsgs(b.id,f)
}}}},updateFileMsgs:function(b,d){var f=b.msgs;
var a;
var e=function(g){if(!g){return false
}if(!g.attachments){return false
}if(!g.attachments.length){return false
}if(TS.inline_attachments.getAttachmentBySlackFileId(g.attachments,d.id)){return true
}return false
};
for(var c=f.length-1;
c>-1;
c--){a=f[c];
if(!d.is_deleted&&(a.subtype=="file_share"||a.subtype=="file_mention"||a.subtype=="file_comment")&&a.file&&a.file.id==d.id){}else{if(e(a)){}else{continue
}}if(b.id==TS.model.active_im_id){TS.ims.message_changed_sig.dispatch(b,a)
}else{if(b.id==TS.model.active_channel_id){TS.channels.message_changed_sig.dispatch(b,a)
}else{if(b.id==TS.model.active_group_id){TS.groups.message_changed_sig.dispatch(b,a)
}}}}},tryToEditLastMsgFromShortcut:function(c){var a=TS.shared.getActiveModelOb();
if(!a){return
}var f=TS.utility.msgs.getEditableMsgByProp("user",TS.model.user.id,a.msgs);
if(!f){TS.sounds.play("beep");
alert("Found no recent messages from you to edit :(");
return
}var e=TS.format.unFormatMsg(f.text,f);
var d=new RegExp("(\\W|^)("+TS.utility.regexpEscape(c.str)+")\\b",(c.g?"g":"")+(c.i?"i":""));
var b=e.replace(d,function(h,i,g,k,j){return i+c.rpl
});
if(e==b){TS.sounds.play("beep");
return
}TS.msg_edit.commitEdit(f,TS.shared.getActiveModelOb(),b)
},getEditLastShortcutCmd:function(b){var e=b.split("/");
if(e.length!=5&&e.length!=4){return
}if(e[1]!="s"){return
}var f=e[2];
var a=e[3];
var d=e.length==5&&(e[4]=="g"||e[4]=="gi"||e[4]=="ig");
var c=e.length==5&&(e[4]=="i"||e[4]=="gi"||e[4]=="ig");
if(!f){return
}return{str:f,rpl:a,g:d,i:c}
},maybeTruncateMsgs:function(b){if(!b){return
}if(!b.msgs){return
}if(!b.msgs.length){return
}if(!TS.model.active_cid||!TS.shared.getActiveModelOb()){return
}var l=TS.model.initial_msgs_cnt+1;
var i=Math.min(TS.model.hard_msg_limit,l*2);
var f=1000;
var g=0;
var d=1000*20;
var j=b.msgs;
var k=TS.utility.msgs.getDisplayedMsgs(j);
var c=TS.utility.date.getTimeStamp();
var h=(b.has_fetched_history_after_scrollback)?c-b.fetched_history_after_scrollback_time:c;
if(k.length>i&&(b.id!=TS.shared.getActiveModelOb().id||(b.scroll_top<f&&h>d))){l=i
}else{if(k.length-50<=l){return
}if(b.last_made_active){var e=c-b.last_made_active;
if(e<g){return
}}if(b.unread_cnt&&b.unread_count&&!b.all_read_this_session_once){return
}if(b.scroll_top!=-1){return
}}if(b.history_is_being_fetched){return
}var a=[];
while(TS.utility.msgs.getDisplayedMsgs(j).length>l){a.push(j.pop())
}if(b.id==TS.model.active_channel_id){TS.view.removeMsgsAfterTruncation(a)
}TS.storage.storeMsgs(b.id,TS.utility.msgs.prepareMsgsForLS(j,b.id))
},checkForMsgsToTruncate:function(){if(!TS.model){return
}if(!TS.model.channels){return
}var b=TS.model.channels;
var f;
var e;
for(e=0;
e<b.length;
e++){f=b[e];
if(f.id==TS.model.active_channel_id){continue
}if(!f.is_member){continue
}if(f.is_archived){continue
}TS.utility.msgs.maybeTruncateMsgs(f)
}var d=TS.model.ims;
var c;
for(e=0;
e<d.length;
e++){c=d[e];
if(c.id==TS.model.active_im_id){continue
}TS.utility.msgs.maybeTruncateMsgs(c)
}var a=TS.model.groups;
var g;
for(e=0;
e<a.length;
e++){g=a[e];
if(g.id==TS.model.active_group_id){continue
}if(g.is_archived){continue
}TS.utility.msgs.maybeTruncateMsgs(g)
}},getEphemeralMsgsByCidAndType:function(e,c){var g;
var d;
var a=[];
var b=TS.groups.getGroupById(e)||TS.channels.getChannelById(e)||TS.ims.getImById(e);
if(!b){return a
}for(var f in TS.utility.msgs.ephemeral_msgs_map){d=TS.utility.msgs.ephemeral_msgs_map[f];
if(d.ephemeral_type==c&&d.c_id==e){g=TS.utility.msgs.getMsg(f,b.msgs);
if(!g){continue
}a.push(g)
}}return a
},removeAllEphemeralMsgsByType:function(b,d){var a;
var c;
var f;
for(var e in TS.utility.msgs.ephemeral_msgs_map){c=TS.utility.msgs.ephemeral_msgs_map[e];
if(c.ephemeral_type==b){if(d&&d!=c.c_id){continue
}a=TS.shared.getModelObById(c.c_id);
if(!a){continue
}f=TS.utility.msgs.getMsg(e,a.msgs);
if(!f){continue
}if(a.is_im){TS.ims.removeMsg(a.id,f)
}else{if(a.is_channel){TS.channels.removeMsg(a.id,f)
}else{if(a.is_group){TS.groups.removeMsg(a.id,f)
}}}delete TS.utility.msgs.ephemeral_msgs_map[e]
}}},prepareMsgsForLS:function(g,h){if(!g){return g
}var j=[];
var f;
var c;
var a;
for(var e=0;
e<g.length;
e++){c=g[e];
f={};
j.push(f);
for(var d in c){if(d=="file"&&c.file){f.file={};
for(var b in c.file){if(b=="content"){continue
}if(b=="content_html"){continue
}if(b=="simplified_html"){continue
}if(b=="content_highlight_html"){continue
}if(b=="comments"){continue
}if(b=="_rxn_key"){a=TS.boot_data.feature_reactions&&TS.rxns.getExistingRxnsByKey(c.file._rxn_key);
if(a){f.file.reactions=a
}}f.file[b]=c.file[b]
}}else{if(d=="_rxn_key"){a=TS.rxns.getExistingRxnsByKey(c._rxn_key);
if(a){f.reactions=a
}}else{f[d]=c[d]
}}}}return j
},hasImgs:function(d){if(!d){return false
}if(d.img_vids){var c;
var a;
for(a in d.img_vids){c=d.img_vids[a];
if(c.img_vid_type=="img"){return true
}}}else{if(d.attachments){for(var b=0;
b<d.attachments.length;
b++){if(d.attachments[b].image_url){return true
}}}}return false
},ingestMessagesFromBootData:function(b){if(!TS.boot_data.msgs){return
}var e=TS.boot_data.msgs[b.id];
var a=[];
if(e){var c;
for(var d=0;
d<e.length;
d++){c=e[d];
if(!c.ts){continue
}a.push(TS.utility.msgs.processImsg(c,b.id))
}}TS.utility.msgs.setMsgs(b,a)
},handleSearchHighlights:function(a){a=a.replace(/\ue000/g,'<span class="match">').replace(/\ue001/g,"</span>");
return a
},findAllMsgsBySubtype:function(d){var f;
var a;
var c;
var b=TS.channels.getChannelsForUser().concat(TS.model.ims.concat(TS.model.groups));
var e={};
for(f=0;
f<b.length;
f++){c=b[f];
if(!c.msgs){continue
}for(a=0;
a<c.msgs.length;
a++){if(d!=c.msgs[a].subtype){continue
}e[c.name]=e[c.name]||{id:c.id};
e[c.name]["msg_index_"+a]=c.msgs[a]
}}TS.info(JSON.stringify(e,null,"\t"))
},isMessageUserHidden:function(a){if(a.user){return TS.model.user_hiddens.indexOf(a.user)>-1
}if(a.bot_id){return TS.model.user_hiddens.indexOf(a.bot_id)>-1
}if(a.username){return TS.model.user_hiddens.indexOf(a.username)>-1
}},hideMessagesFrom:function(b){var a=TS.model.user_hiddens.indexOf(b);
if(a==-1){TS.model.user_hiddens.push(b)
}if(TS.client){TS.client.msg_pane.rebuildMsgs()
}if(TS.web){TS.web.channel.renderMsgs(TS.shared.getActiveModelOb())
}},unHideMessagesFrom:function(b){var a=TS.model.user_hiddens.indexOf(b);
if(a>-1){TS.model.user_hiddens.splice(a,1)
}if(TS.client){TS.client.msg_pane.rebuildMsgs()
}if(TS.web){TS.web.channel.renderMsgs(TS.shared.getActiveModelOb())
}},handleFailedMsgSend:function(c,a,d){var b=TS.utility.msgs.getMsg(c,a.msgs);
if(b){if(a.is_channel){TS.channels.removeMsg(a.id,b);
if(d){TS.channels.sendMsg(a.id,TS.format.unFormatMsg(b.text,b))
}}else{if(a.is_group){TS.groups.removeMsg(a.id,b);
if(d){TS.groups.sendMsg(a.id,TS.format.unFormatMsg(b.text,b))
}}else{TS.ims.removeMsg(a.id,b);
if(d){TS.ims.sendMsg(a.id,TS.format.unFormatMsg(b.text,b))
}}}delete TS.model.unsent_msgs[b.ts];
delete TS.model.display_unsent_msgs[b.ts]
}else{TS.error("no msg?: "+c)
}},msgMightBeRolledUp:function(a){return(TS.boot_data.feature_join_leave_rollups&&a.subtype&&TS.model.join_leave_subtypes.indexOf(a.subtype)!=-1)
},msgRollUpWorker:function(e,h,f,d){delete h._jl_rollup_hash;
delete h._jl_rolled_up_in;
if(!TS.utility.msgs.msgMightBeRolledUp(h)){return
}d.push(h);
if(e!==0&&TS.utility.msgs.msgMightBeRolledUp(f[e-1])){return"continue"
}else{var g=d[0]._jl_rollup_hash={msg_ids:[],users:{}};
var c;
for(var a=0;
a<d.length;
a++){c=d[a];
var b=g.users[c.user]=(g.users[c.user]||{});
g.msg_ids.push(c.ts);
c._jl_rolled_up_in=d[0].ts;
if(c.subtype=="channel_join"||c.subtype=="group_join"){b.inviter=c.inviter;
b.joined=true;
b.is_in=true
}else{if(c.subtype=="channel_leave"||c.subtype=="group_leave"){b.left=true;
b.is_in=false
}}}return"swap"
}},shouldHaveBotLabel:function(a,b){return TS.boot_data.feature_bot_message_label&&((a.subtype&&a.subtype=="bot_message"&&a.username!="slackbot")||(b&&b.is_bot&&!b.is_slackbot))
}})
})();
(function(){TS.registerModule("utility",{keymap:{alt:18,ctrl:17,cmd_ff:224,cmd_other:91,cmd_right:93,esc:27,shift:16,tab:9,del:8,enter:13,left:37,up:38,right:39,down:40,pageup:33,pagedown:34,end:35,home:36,space:32,semicolon:59,equals_sign:187,minus_sign:189,comma:188,period:190,left_square_bracket:219,right_square_bracket:221,V:86,insert:45},keymap_reverse:{"18":"alt","17":"ctrl","224":"cmd_ff","91":"cmd_other","93":"cmd_right","27":"esc","16":"shift","9":"tab","8":"del","13":"enter","37":"left","38":"up","39":"right","40":"down","187":"equals_sign","189":"minus_sign","188":"comma","190":"period","219":"left_square_bracket","221":"right_square_bracket","86":"V","45":"insert"},onStart:function(){},isRetina:function(g){g=g||window;
return("devicePixelRatio" in g&&g.devicePixelRatio>1)
},regexpEscape:function(h,g){h=h||"";
g=g||500000;
g=Math.min(g,500000);
if(h.length>g){h=h.substr(0,g)
}return h.replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&")
},randomInt:function(h,g){h=parseInt(h);
g=parseInt(g);
return h+Math.floor(Math.random()*(1+g-h))
},compactArray:function(g){return g.filter(Boolean)
},randomFromArray:function(g){return g[TS.utility.randomInt(0,g.length-1)]
},removeFromArray:function(g,j){var h=g.indexOf(j);
if(h==-1){return false
}g.splice(h,1);
return true
},ensureInArray:function(g,h){if(g.indexOf(h)>-1){return false
}g.push(h);
return true
},doRectsOverlap:function(h,g){return !(g.left>h.right||g.right<h.left||g.top>h.bottom||g.bottom<h.top)
},doesRectContainRect:function(i,g,h,j){h=h||0;
if(g.top<i.top-h){return false
}if(g.bottom>i.bottom+h){return false
}if(j){return true
}if(g.left<i.left-h){return false
}if(g.right>i.right+h){return false
}return true
},clamp:function(i,h,g){return Math.max(h,Math.min(g,i))
},inArray:function(g,h){if(!g){return false
}if(!h&&h!==0){return false
}for(var j=0;
j<g.length;
j++){if(g[j]==h){return true
}}return false
},shouldLinksHaveTargets:function(){return !!(TS.client||(TS.web&&TS.web.space))
},clone:function(g){if(g===null){return g
}return JSON.parse(JSON.stringify(g))
},padNumber:function(i,h,g){g=(g||"0").toString();
var j=i.toString();
while(j.length<h){j=g+j
}return j
},ordinalNumber:function(g){g=g.toString();
var h=g.substr(-(Math.min(g.length,2)))>3&&g.substr(-(Math.min(g.length,2)))<21?"th":["th","st","nd","rd","th"][Math.min(Number(g)%10,4)];
return g+h
},getChannelNameFromUrl:function(g){var h=TS.utility._getPathAFromUrl(g);
if(h&&h.length>0){return decodeURIComponent(h[0])
}return""
},getFlexNameFromUrl:function(g){var h=TS.utility._getPathAFromUrl(g);
if(h&&h.length>1){return decodeURIComponent(h[1])
}return""
},getFlexExtraFromUrl:function(g){var h=TS.utility._getPathAFromUrl(g);
if(h&&h.length>2){var i=h[2];
i=decodeURIComponent(i);
i=i.replace(/%2F/g,"/");
return i
}return""
},_getPathAFromUrl:function(h){if(h.indexOf("/messages/")==-1){return null
}var g=h.split("/messages/");
var j=g[1].split("?");
var i=j[0].split("/");
return i
},refashionUrl:function(g,j,k,o){var n=g.split(/\.com\/+messages/);
var h=n[0]+".com";
var l=n[1].split("?");
var i=l[0].split("/");
var m=(l[1])?"?"+l[1]:"";
i.length=2;
i[0]=j;
i[1]=k;
if(o){i.length=3;
i[2]=o
}if(!i[1]){i.length=1
}return h+"/messages/"+i.join("/")+"/"+m
},dataURItoBlob:function(g){return TS.utility.base64StrtoBlob(TS.utility.base64StrFromDataURI(g))
},base64StrFromDataURI:function(g){return g.split(",")[1]
},base64StrtoBlob:function(m){var n=atob(m);
var j=new ArrayBuffer(n.length);
var k=new Uint8Array(j);
for(var h=0;
h<n.length;
h++){k[h]=n.charCodeAt(h)
}var l=new DataView(j);
var g=new Blob([l]);
return g
},ellipsize:function(j,g){if(!j){return j
}if(!g||!parseInt(g)){g=50
}if(j.length>g){var h=j.substr(0,g/2);
var i=j.substr(-(g/2),j.length);
j=h+"..."+i
}return j
},makeSafeForDomId:function(g){return g.replace(/\./g,"_")
},makeSafeForDomClass:function(g){return g.replace(/\s/g,"_")
},getImageIconClass:function(k,g){var h=g;
var j=80;
var i=80;
if(k&&(k.thumb_360_w<j||k.thumb_360_h<i)){if(k.thumb_360_w>k.thumb_360_h){h="landscape"
}else{if(k.thumb_360_w<k.thumb_360_h){h="portrait"
}else{h="square"
}}}return h
},convertFilesize:function(h){h=parseInt(h);
if(h===0){return"0 bytes"
}var g=["b","KB","MB","GB"];
var i=parseInt(Math.floor(Math.log(h)/Math.log(1024)));
var j=h/Math.pow(1024,i);
var k=Math.round(j,2);
if(k>999){k=1;
i++
}return k+g[i]
},numberWithCommas:function(g){if(g===undefined){return""
}var h=g.toString().split(".");
h[0]=h[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
return h.join(".")
},numberWithK:function(g){if(g>999){g=Math.round((g/1000)*10)/10;
return TS.utility.numberWithCommas(g)+"K"
}else{return TS.utility.numberWithCommas(g)
}},cleanChannelName:function(g){g=g.toLowerCase();
while(g.substr(0,1)=="#"){g=g.substr(1)
}g=g.replace(/ /g,"-");
g=g.replace(/[^a-z0-9-_]/g,"_");
g=g.replace(/\-+/g,"-");
g=g.replace(/\_+/g,"_");
return g
},openInNewTab:function(h,k){h=TS.utility.htmlEntities(h);
if(h.indexOf("/")===0&&TS.boot_data.team_url){var g=TS.boot_data.team_url;
g=g.substr(0,g.length-1);
h=g+h
}var i=h;
var j="";
if(TS.utility.urlNeedsRefererHiding(h)){j='<input type="hidden" name="url" value="'+h+'">';
i=(TS.boot_data.feature_referer_policy?"https://":"http://")+TS.boot_data.redir_domain+"/link"
}$("<form>"+j+"</form>").attr({method:"GET",action:i,target:k}).appendTo("body").submit().remove()
},isScalar:function(g){return(/boolean|number|string/).test(typeof g)
},replaceUrls:function(g,h){return g.toString().replace(f,h)
},findUrls:function(g){return g.match(f)||[]
},linkify:function(h,j,i,g){if(!h){return h
}h=TS.utility.replaceUrls(h,function(k){var l;
if(k.toLowerCase().indexOf("www.")===0){if(!i){return k
}l="http://"+k
}else{l=k
}if(g){return"<"+l+"|"+k+">"
}else{return"<a "+TS.utility.makeRefererSafeLink(l)+' target="'+(j||"")+'">'+k+"</a>"
}});
return h
},linkifyInternal:function(g,h){return TS.utility.linkify(g,"",h,true)
},emojiGraphicReplace:function(m,o,n,i){emoji.init_env();
var l=emoji.text_mode;
var h=emoji.include_title;
var g=emoji.include_text;
var j=emoji.allow_native;
emoji.text_mode=false;
emoji.include_title=!!n;
emoji.include_text=!i;
emoji.allow_native=false;
var k=TS.utility.emojiReplace(m);
emoji.text_mode=l;
emoji.include_title=h;
emoji.include_text=g;
emoji.allow_native=j;
return k
},emojiReplace:function(k,i,h){if(!k){return""
}var g;
emoji.init_env();
var j=emoji.supports_css;
if(h){emoji.supports_css=false
}if(i){g=emoji.replace_colons(k,function(l){return TS.format.tokenizeStr(i,l)
})
}else{g=emoji.replace_colons(k)
}emoji.supports_css=j;
return g
},getCursorPosition:function(g){var i,k,j,h;
i=$(g).get(0);
k=0;
if("selectionStart" in i){k=i.selectionStart
}else{if("selection" in document){i.focus();
j=document.selection.createRange();
h=document.selection.createRange().text.length;
j.moveStart("character",-i.value.length);
k=j.text.length-h
}}return k
},setCursorPosition:function(g,j){var i,h;
i=$(g).get(0);
if(i!==null){if(i.createTextRange){h=i.createTextRange();
h.move("character",j);
h.select()
}else{i.focus();
i.setSelectionRange(j,j)
}}},htmlEntities:function(g){if(!g&&g!==0){return""
}return String(g).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
},unHtmlEntities:function(g){if(!g&&g!==0){return""
}return String(g).replace(/\&lt\;/g,"<").replace(/\&gt\;/g,">").replace(/\&amp\;/g,"&").replace(/\&quot;/g,'"')
},jsString:function(g){return JSON.stringify(""+g)
},preg_quote:function(g){return(g+"").replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g,"\\$1")
},getActiveElementProp:function(g){if(!document){return""
}if(!document.activeElement){return""
}if(g=="NODENAME"){if(!document.activeElement.nodeName){return""
}return document.activeElement.nodeName.toUpperCase()
}return document.activeElement[g]
},isArrowNavUnSafe:function(){var h=function(){if(!document){return false
}if(!document.activeElement){return false
}var i=TS.utility.getActiveElementProp("NODENAME");
if(i=="INPUT"){return true
}if(i=="SELECT"){return true
}if(i=="CHECKBOX"){return true
}if(i=="TEXTAREA"){if($&&$("#message-input").is(":focus")&&!$("#message-input").val()){return false
}return true
}return false
};
var g=h();
return g
},isFocusOnInput:function(){if(!document){return false
}if(!document.activeElement){return false
}var g=TS.utility.getActiveElementProp("NODENAME");
if(g=="INPUT"){return true
}if(g=="TEXTAREA"){return true
}if(g=="SELECT"){return true
}if(g=="CHECKBOX"){return true
}return false
},formatTopicOrPurpose:function(g){g=TS.format.unFormatMsg(g);
g=TS.format.cleanMsg(g);
g=TS.utility.linkifyInternal(g,true);
g=TS.format.formatJustText(g);
return g
},capitalize:function(g){return g.charAt(0).toUpperCase()+g.slice(1)
},shuffleArray:function(g){var l=g.length,k,h;
if(l===0){return g
}while(--l){k=Math.floor(Math.random()*(l+1));
h=g[l];
g[l]=g[k];
g[k]=h
}return g
},populateInput:function(h,g){h.val(g).trigger("autosize").trigger("autosize-resize").trigger("textchange");
h.data("textchange_lastvalue",g)
},diff:function(i,h){function g(o){var p=o;
p=p.replace(/&/g,"&amp;");
p=p.replace(/</g,"&lt;");
p=p.replace(/>/g,"&gt;");
p=p.replace(/"/g,"&quot;");
return p
}function k(v,w){v=v.replace(/\s+$/,"");
w=w.replace(/\s+$/,"");
var q=j(v==""?[]:v.split(/\s+/),w==""?[]:w.split(/\s+/));
var u="";
var p=v.match(/\s+/g);
if(p==null){p=["\n"]
}else{p.push("\n")
}var s=w.match(/\s+/g);
if(s==null){s=["\n"]
}else{s.push("\n")
}if(q.n.length===0){for(var r=0;
r<q.o.length;
r++){u+="<del>"+g(q.o[r])+p[r]+"</del>"
}}else{if(q.n[0].text==null){for(w=0;
w<q.o.length&&q.o[w].text==null;
w++){u+="<del>"+g(q.o[w])+p[w]+"</del>"
}}for(var r=0;
r<q.n.length;
r++){if(q.n[r].text==null){u+="<ins>"+g(q.n[r])+s[r]+"</ins>"
}else{var t="";
for(w=q.n[r].row+1;
w<q.o.length&&q.o[w].text==null;
w++){t+="<del>"+g(q.o[w])+p[w]+"</del>"
}u+=" "+q.n[r].text+s[r]+t
}}}return u
}function m(){return"rgb("+(Math.random()*100)+"%, "+(Math.random()*100)+"%, "+(Math.random()*100)+"%)"
}function l(q,r){q=q.replace(/\s+$/,"");
r=r.replace(/\s+$/,"");
var t=j(q==""?[]:q.split(/\s+/),r==""?[]:r.split(/\s+/));
var x=q.match(/\s+/g);
if(x==null){x=["\n"]
}else{x.push("\n")
}var v=r.match(/\s+/g);
if(v==null){v=["\n"]
}else{v.push("\n")
}var s="";
var p=new Array();
for(var u=0;
u<t.o.length;
u++){p[u]=m();
if(t.o[u].text!=null){s+='<span style="background-color: '+p[u]+'">'+g(t.o[u].text)+x[u]+"</span>"
}else{s+="<del>"+g(t.o[u])+x[u]+"</del>"
}}var w="";
for(var u=0;
u<t.n.length;
u++){if(t.n[u].text!=null){w+='<span style="background-color: '+p[t.n[u].row]+'">'+g(t.n[u].text)+v[u]+"</span>"
}else{w+="<ins>"+g(t.n[u])+v[u]+"</ins>"
}}return{o:s,n:w}
}function j(s,t){var q=new Object();
var r=new Object();
for(var p=0;
p<t.length;
p++){if(q[t[p]]==null){q[t[p]]={rows:new Array(),o:null}
}q[t[p]].rows.push(p)
}for(var p=0;
p<s.length;
p++){if(r[s[p]]==null){r[s[p]]={rows:new Array(),n:null}
}r[s[p]].rows.push(p)
}for(var p in q){if(q[p].rows.length==1&&typeof r[p]!="undefined"&&r[p].rows.length==1){t[q[p].rows[0]]={text:t[q[p].rows[0]],row:r[p].rows[0]};
s[r[p].rows[0]]={text:s[r[p].rows[0]],row:q[p].rows[0]}
}}for(var p=0;
p<t.length-1;
p++){if(t[p].text!=null&&t[p+1].text==null&&t[p].row+1<s.length&&s[t[p].row+1].text==null&&t[p+1]==s[t[p].row+1]){t[p+1]={text:t[p+1],row:t[p].row+1};
s[t[p].row+1]={text:s[t[p].row+1],row:p+1}
}}for(var p=t.length-1;
p>0;
p--){if(t[p].text!=null&&t[p-1].text==null&&t[p].row>0&&s[t[p].row-1].text==null&&t[p-1]==s[t[p].row-1]){t[p-1]={text:t[p-1],row:t[p].row-1};
s[t[p].row-1]={text:s[t[p].row-1],row:p-1}
}}return{o:s,n:t}
}return k(i.replace(/</g,"&lt;").replace(/\,/g,", "),h.replace(/</g,"&lt;").replace(/\,/g,", "))
},urlNeedsRefererHiding:function(g){if(!g){return false
}g=g.toLowerCase();
if(g.indexOf("https://")!==0&&g.indexOf("http://")!==0){return false
}g=g.replace(/^https:\/\//,"").replace(/^http:\/\//,"");
var j=getRefererHidingWhiteList();
for(var h=0;
h<j.length;
h++){if(g==j[h]||g.indexOf(j[h]+"/")===0){return false
}}return true
},referer_safe_url_map:{},makeRefererSafeLink:function(i){i=i.replace(/\ue000/g,"").replace(/\ue001/g,"");
var k=i.replace(/\&amp\;/g,"&");
var m=TS.utility.htmlEntities(k);
var j='href="'+m+'"';
var l="onclick";
if(!TS.model||!TS.model.is_our_app){if(a&&a.rewrite_on_right_click){l="onmousedown"
}}if(!TS.utility.urlNeedsRefererHiding(i)){return j
}if(TS.utility.externalURLsNeedRedirecting()){var h=encodeURIComponent(k);
var g=(TS.boot_data.feature_referer_policy?"https://":"http://")+TS.boot_data.redir_domain+"/link?url="+h+(TS.boot_data.feature_referer_policy&&a&&a.redirect_type?"&v="+a.redirect_type:"");
var n=TS.utility.htmlEntities(h);
TS.utility.referer_safe_url_map[n]=k;
j+=' data-referer-safe="1" '+l+'="this.href=&quot;'+g+'&quot;" onmouseover="this.href=TS.utility.referer_safe_url_map[&quot;'+n+'&quot;]" rel="noreferrer"'
}else{j+=' rel="noreferrer"'
}return j
},makeSureAllExternalLinksAreRefererSafe:function(g){var i=TS.utility.date.getTimeStamp();
var h=[];
if(TS.utility.externalURLsNeedRedirecting()){g.find("a[href]:not([data-referer-safe])").each(function(){var j=$(this);
var k=j.attr("href");
if(!TS.utility.urlNeedsRefererHiding(k)){return
}h.push(this.outerHTML);
j.removeAttr("href");
var l=this.outerHTML.replace("<a","<a "+TS.utility.makeRefererSafeLink(k)+" ");
j.replaceWith(l);
h[h.length-1]+="\n->\n"+l
});
if(TS.model&&TS.model.team&&TS.model.team.domain=="tinyspeck"){if(h.length){TS.log(365,"#"+g.attr("id")+" had "+h.length+" LINKS WITH EXT HREFS BUT NOT data-referer-safe! to fix it took "+(TS.utility.date.getTimeStamp()-i)+"ms");
TS.dir(365,h)
}else{TS.log(365,"#"+g.attr("id")+" had "+h.length+" LINKS WITH EXT HREFS BUT NOT data-referer-safe! to check it took "+(TS.utility.date.getTimeStamp()-i)+"ms")
}}}else{g.find("a[href]:not([rel])").each(function(){var j=$(this);
var k=j.attr("href");
if(k.indexOf("mailto")===0||k.indexOf("skype")===0){return
}if(k&&k!="#"){if(TS.utility.urlNeedsRefererHiding(k)){h.push(this.outerHTML);
j.attr("rel","noreferrer");
h[h.length-1]+="\n->\n"+this.outerHTML
}}else{j.removeAttr("href")
}});
if(TS.model&&TS.model.team&&TS.model.team.domain=="tinyspeck"){if(h.length){TS.log(365,"#"+g.attr("id")+" had "+h.length+' LINKS WITH EXT HREFS BUT WITHOUT rel="noreferrer"! to add rel it took '+(TS.utility.date.getTimeStamp()-i)+"ms");
TS.dir(365,h)
}else{TS.log(365,"#"+g.attr("id")+" had "+h.length+' LINKS WITH EXT HREFS BUT WITHOUT rel="noreferrer"! to check it took '+(TS.utility.date.getTimeStamp()-i)+"ms")
}}}},makeSureAllLinksHaveTargets:function(g){var i=TS.utility.date.getTimeStamp();
var h=[];
g.find("a[href]:not([target])").each(function(){var j=$(this);
var k=j.attr("href");
if(k.indexOf("mailto")===0||k.indexOf("skype")===0){return
}if(k&&k!="#"){h.push(this.outerHTML);
j.attr("target",k);
h[h.length-1]+="\n->\n"+this.outerHTML
}else{j.removeAttr("href")
}});
if(TS.model&&TS.model.team&&TS.model.team.domain=="tinyspeck"){if(h.length){TS.log(365,"#"+g.attr("id")+" had "+h.length+" LINKS WITH HREFS BUT WITHOUT TARGETS! to add targets it took "+(TS.utility.date.getTimeStamp()-i)+"ms");
TS.dir(365,h)
}else{TS.log(365,"#"+g.attr("id")+" had "+h.length+" LINKS WITH HREFS BUT WITHOUT TARGETS! to check it took "+(TS.utility.date.getTimeStamp()-i)+"ms")
}}TS.utility.makeSureAllExternalLinksAreRefererSafe(g)
},sortTable:function(n,h,j,k,g){j=(j=="desc")?"desc":"asc";
g=(g=="desc")?"desc":"asc";
function o(i){return function(t,s){var r=m(t,i);
var q=m(s,i);
if($.isNumeric(r)&&$.isNumeric(q)){if(r==q&&k){r=m(t,k);
q=m(s,k);
if($.isNumeric(r)&&$.isNumeric(q)){if(g!=j){return q-r
}else{return r-q
}}else{if(g!=j){return q.localeCompare(r)
}else{return r.localeCompare(q)
}}}return r-q
}else{return r.localeCompare(q)
}}
}function m(q,i){return $(q).children("td").eq(i).data("sort-val")
}var p=n.find("tr:gt(0)").toArray().sort(o(h));
if(j=="desc"){p=p.reverse()
}for(var l=0;
l<p.length;
l++){n.append(p[l])
}},getPercSmartly:function(g,i){if(!g||!i){return"0%"
}var h=(g/i)*100;
if(h!=100&&Math.round(h)==100){return"99%"
}if(h<0.7){return"<1%"
}return Math.round(h)+"%"
},isCursorWithinTBTs:function(h){var k=h.getCursorPosition();
var l=h.val();
var g=l.substr(0,k);
var i=g.match(/```/g);
if(!i){return false
}var j=i.length;
if(j%2){return true
}return false
},getLowerCaseValue:function(g){return(g&&g.toLowerCase?g.toLowerCase():"")
},rgb2hex:function(g){if(/^#[0-9A-F]{6}$/i.test(g)){return g
}var h=g.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
if(!h){h=g.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d*\.?\d+)\)$/)
}if(!h){return
}function i(j){return("0"+parseInt(j).toString(16)).slice(-2)
}return"#"+i(h[1])+i(h[2])+i(h[3])
},setImmediate:function(g){c(g)
},immediateDebounce:function(g){var h=false;
return function(){if(h){return
}var i=this;
var j=arguments;
h=true;
c(function(){h=false;
g.apply(i,j)
})
}
},debounce:function(h,g){var i;
return function(){var j=this;
var k=arguments;
clearTimeout(i);
i=setTimeout(function(){h.apply(j,k)
},g)
}
},throttleFunc:function(i,h,g){var k={};
var j=function j(){var l=Array.prototype.slice.apply(arguments);
if(!l.every(TS.utility.isScalar)){TS.warn("You're passing non-scalar arguments to a function throttled with TS.utility.throttleFunc; it will likely not work as you want")
}var m="f-"+l.join("-");
if(k[m]&&k[m].context!==this){throw new Error("Cannot use this function with different `this` contexts across different calls")
}k[m]=k[m]||{requested:false,timeout:0,context:this};
if(k[m].timeout||j.always_wait){k[m].requested=true
}else{i.apply(k[m].context,l)
}clearTimeout(k[m].timeout);
k[m].timeout=setTimeout(function(){if(k[m].requested){i.apply(k[m].context,l)
}delete k[m]
},h)
};
j.always_wait=!!g;
return j
},cmdKey:function(g){if(!g){return false
}if(TS.model.is_mac){return !!g.metaKey
}else{return !!g.ctrlKey
}},throttle:(function(){var h,g;
h={delay:200,timer_group:"generic"};
g={timers:{},queues:{}};
function i(k){var m,l;
if(g.timers[k]){if(g.queues[k]){for(m=0,l=g.queues[k].length;
m<l;
m++){if(g.queues[k][m]){g.queues[k][m]()
}}}g.queues[k]=null;
g.timers[k]=null
}}function j(m,k,l){if(!m){return false
}k=k||h.timer_group;
if(!g.timers[k]){l=l||h.delay;
g.timers[k]=window.setTimeout(function(){i(k)
},l)
}if(!g.queues[k]){g.queues[k]=[]
}if(g.queues[k].indexOf){if(g.queues[k].indexOf(m)===-1){g.queues[k].push(m)
}}else{g.queues[k].push(m)
}}return{method:j}
}()),getImgProxyURL:function(g,r,n){if(!g){return g
}if(!TS.boot_data.feature_image_proxy){return g
}if(!TS.boot_data.image_proxy_url){return g
}var p=TS.boot_data.image_proxy_url;
if(g.indexOf(p)===0){return g
}var m,l;
var k=getRefererHidingWhiteList();
var o;
if(g.indexOf("https://")===0){o=g.replace(/^https:\/\//,"");
for(m=0,l=k.length;
m<l;
m++){if(o.indexOf(k[m]+"/")===0){return g
}}}var s=TS.qs_args.proxy_breakage||"";
var q=p+"?url="+s+encodeURIComponent(g);
r=parseInt(r);
n=parseInt(n);
if(r&&n){q+="&width="+r+"&height="+n
}return q
},rAF:(function(){var j=["ms","moz","webkit","o"];
var i=window.requestAnimationFrame;
var g;
for(g=0;
g<j.length&&!i;
g++){i=window[j[g]+"RequestAnimationFrame"]
}if(!i){var h=0;
return function(n){var k=Date.now();
var m=Math.max(0,16-(k-h));
var l=window.setTimeout(function(){n(k+m)
},m);
h=k+m;
return l
}
}return function(k){return i.call(window,k)
}
})(),cancelRAF:(function(){var i=["ms","moz","webkit","o"];
var h=window.cancelAnimationFrame;
var g;
for(g=0;
g<i.length&&!h;
g++){h=window[i[g]+"CancelAnimationFrame"]||window[i[g]+"CancelRequestAnimationFrame"]
}if(!h){return function(j){clearTimeout(j)
}
}return function(j){h.call(window,j)
}
})(),loadUrlInWindowIfOnline:function(g,h){h=h||document;
TS.api.call("api.test",{},function(j,k,i){if(j){$("body").addClass("hidden");
h.location=g
}else{TS.generic_dialog.alert("You can't perform that action because you are not online :(")
}})
},externalURLsNeedRedirecting:function(){if(TS.boot_data.feature_no_redirects_in_ssb){if(TS.model.team.prefs.hide_referers&&!TS.model.is_our_app){return true
}}else{if(TS.model.team.prefs.hide_referers){return true
}}return false
},swapInRedirUrlForIframe:function(i,h){h=h||a;
if(!h){return i
}if(!h.iframe_redirect_type){return i
}var g=$(i);
var j=g.attr("src");
if(!j){return i
}if(TS.qs_args.test_iframe_referers=="1"){j="https://"+document.location.host+"/referertester.html?"+Date.now()
}j="https://"+TS.boot_data.redir_domain+"/link?v="+h.iframe_redirect_type+"&url="+encodeURIComponent(j);
g.attr("src",j);
i=g[0].outerHTML;
if(TS.qs_args.test_iframe_referers=="1"){TS.info("html with redir:"+i)
}return i
},getPlaceholderHTMLFromIframe:function(h){h=h.replace(/<iframe/,"<div").replace(/<\/iframe/,"</div");
var g=$(h);
g.css("height",g.attr("height")+"px").css("width",g.attr("width")+"px").attr("data-real-src",g.attr("src")).attr("src","").addClass("iframe_placeholder");
h=g[0].outerHTML;
return h
},getIframeHTMLFromPlaceholder:function(h){h=h.replace(/<div/,"<iframe").replace(/<\/div/,"</iframe");
var g=$(h);
g.attr("src",g.data("real-src")).removeClass("iframe_placeholder");
h=g[0].outerHTML;
return h
},isArrowKey:function(h){var g=TS.utility.keymap;
if(h==g.down){return true
}if(h==g.up){return true
}if(h==g.right){return true
}if(h==g.left){return true
}return false
},isPageKey:function(h){var g=TS.utility.keymap;
if(h==g.pageup){return true
}if(h==g.pagedown){return true
}if(h==g.home){return true
}if(h==g.end){return true
}return false
},getFileIDFromURL:function(i){if(!i){return null
}if(!TS.client){return null
}i=TS.utility.normalizeDevHost(String(i));
i=i.replace("https://","").replace("http://","");
var k=TS.client.files_url.replace("https://","").replace("http://","");
if(i.indexOf(k)===0){i=i.replace(k,"files")
}while(i.indexOf("/")===0){i=i.substr(1)
}if(i.indexOf("files/")!==0){return null
}var g=i.split("/");
if(g.length<3){return null
}var h=g[1];
if(!h){return null
}if(!TS.members.getMemberByName(h)){return null
}var j=g[2];
if(!j){return null
}if(j.substr(0,1)!="F"){return null
}if(j.length<2){return null
}if(j.length>15){return null
}return j
},normalizeDevHost:function(g){return g.replace(/\.dev[0-9]*.slack.com/i,".dev.slack.com").replace(/\.staging.slack.com/i,".slack.com")
},platformSupportsHtmlNotifications:function(){if(TS.model.win_ssb_version&&window.winssb){if(winssb.app.willUseHwAcceleration===false){return false
}return true
}return false
},platformSupportsImgEmojiInHtmlNotifications:function(){return(TS.model.win_ssb_version&&(TS.model.win_ssb_version>0.9||(TS.model.win_ssb_version==0.9&&TS.model.win_ssb_version_minor>=5)))
},ensureArray:function(g){return($.isArray(g))?g:[]
},findAllTeamEmojiInStr:function(k,j){k=$.trim(k);
var g=[];
if(!k){return g
}var i=/:/g;
var h=k.match(i)&&k.match(i).length;
if(h==2&&emoji.map.colons[k.replace(i,"").toLowerCase()]){g[0]=k
}else{g=k.match(emoji.rx_colons);
if(g&&j){g=g.filter(function(n,m,l){return l.indexOf(n)===m
})
}}return g||[]
},callFuncWhenApiQisEmpty:function(g){if(TS.api.pending){if(!TS.api.Q_empty_sig.has(g)){TS.api.Q_empty_sig.addOnce(g)
}}else{g()
}},equal_stats:{agree:0,agree_true:0,agree_false:0,disagree:0,json_true:0,comp_true:0,json_ms:0,comp_ms:0},areSimpleObjectsEqual:function(q,o,A){A="[ "+(A||(q&&q.id?q.id:"root"))+" ]";
var w=TS.utility.equal_stats;
var g;
var i=[];
var j;
var l;
var n;
var h;
var v;
var t;
var s;
var z=TS.shouldLog(283);
var u=z||TS.shouldLog(282);
var m=(function(){if(u||z){return(z?283:282)
}return 0
})();
var r=function(C,B,p,D){if(u){i.push(B+" FAIL "+C+"\n\tx:"+p+"\n\ty:"+D+"\n")
}return false
};
var k=function k(p,D,B,C){if(p===D){return true
}if(B){j=JSON.stringify(p||null);
l=JSON.stringify(D||null);
return(j==l)
}if(typeof p!==typeof D){return r(C,"TYPEOF",typeof p,typeof D)
}if(p===null&&D){return r(C,"X NULL",p,D)
}if(D===null&&p){return r(C,"Y NULL",p,D)
}if(p===undefined&&D){return r(C,"X UND",p,D)
}if(D===undefined&&p){return r(C,"Y UND",p,D)
}if(p.length!==D.length){return r(C,"LENGTH",p.length,D.length)
}for(s in D){if(typeof p[s]=="undefined"&&typeof D[s]!="undefined"){return r(C+"[ "+s+" ]","UNDEFINED",p[s],D[s])
}if(D[s]){switch(typeof D[s]){case"object":if(!k(p[s],D[s],B,C+"[ "+s+" ]")){return false
}break;
case"function":if(String(D[s])!=String(p[s])){return r(C+"[ "+s+" ]","FUNCTION",p[s],D[s])
}break;
default:if(D[s]!==p[s]){return r(C+"[ "+s+" ]","EQUALITY",p[s],D[s])
}}}else{if(p[s]){return r(C+"[ "+s+" ]","EXISTENCE IN X",p[s],D[s])
}}}for(s in p){if(typeof D[s]=="undefined"&&typeof p[s]!="undefined"){return r(C+"[ "+s+" ]","EXISTENCE IN Y",p[s],D[s])
}}return true
};
g=Date.now();
n=k(q,o,true,A);
h=Date.now()-g;
w.json_ms+=h;
g=Date.now();
v=k(q,o,false,A);
t=Date.now()-g;
w.comp_ms+=t;
if(n!=v){if(!u){z=u=true;
k(q,o,true,A);
k(q,o,false,A)
}i.push("❌");
i.push("json_says: "+n);
i.push("x_json.length: "+j.length);
i.push("y_json.length: "+l.length);
if(j.length<100){i.push("x_json: "+j);
i.push("y_json: "+l)
}i.push("comp_says: "+v);
i.push("json_time: "+h);
i.push("comp_time: "+t);
w.disagree++;
if(n){w.json_true++
}else{w.comp_true++
}}else{if(u&&!n){i.push("❗️")
}else{if(z){i.push("✅")
}}w.agree++;
if(n){w.agree_true++
}else{w.agree_false++
}}if(i.length){i.push(JSON.stringify(TS.utility.equal_stats,null,2));
TS.log(m,A+"\n"+i.join("\n"))
}return v&&n
}});
var a=(function(){var i=window.boot_data;
if(!i.feature_referer_policy&&TS.qs_args.test_iframe_referers!="1"){return null
}var h={iframe_redirect_type:4,redirect_type:3,rewrite_on_right_click:true};
var g=(window.console!==undefined&&console.warn);
if(!window.bowser){if(g){console.warn("window.bowser undefined, defaulting to restrictive referrer policy")
}return h
}if((bowser.chrome&&bowser.version>=4.1)||(bowser.opera&&bowser.version>=15)){return{iframe_redirect_type:4,redirect_type:null,rewrite_on_right_click:false}
}if(bowser.ie){return{iframe_redirect_type:4,redirect_type:3,rewrite_on_right_click:true}
}if(bowser.firefox){return{iframe_redirect_type:2,redirect_type:3,rewrite_on_right_click:true}
}if((bowser.safari&&bowser.version>=5)||navigator.userAgent.match(/(Slack_SSB)/g)){return{iframe_redirect_type:2,redirect_type:null,rewrite_on_right_click:false}
}if(g){console.warn("browser not recognized, defaulting to restrictive referrer policy")
}return h
}());
var d=null;
window.getRefererHidingWhiteList=function(){if(d){return d
}d=[TS.model.team.domain+".dev.slack.com",TS.model.team.domain+".staging.slack.com",TS.model.team.domain+".slack.com","files.staging.slack.com","files.dev.slack.com","files.slack.com","dev.slack-files.com","staging.slack-files.com","www.slack-files.com","slack-files.com","slack-imgs.com","slack.com",TS.boot_data.redir_domain,"my.slack.com","www.slack.com"];
for(var g=0;
g<100;
g++){d.push(TS.model.team.domain+".dev"+g+".slack.com");
d.push("dev"+g+".slack-files.com")
}return d
};
var f=/((ftp|http|https)\:\/\/|\bw{3}\.)[a-z0-9\-\.]+\.[a-z]+(:[a-z0-9]*)?\/?([@a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*/gi;
var c=window.setImmediate;
if(!c){if(window.MutationObserver){var b=document.createElement("div");
var e=[];
(new MutationObserver(function(h){var g=e.slice();
e.length=0;
g.forEach(function(i){i()
})
})).observe(b,{attributes:true});
c=function(g){if(!e.length){b.setAttribute("yes","no")
}e.push(g)
}
}else{c=function(g){setTimeout(g,0)
}
}}})();
(function(){TS.registerModule("format",{testing_with_generic_tokens:false,theme_rx:/((?:#[A-Fa-f0-9]{6} {0,1}, {0,1}){7})(#[A-Fa-f0-9]{6})(\b)/g,onStart:function(){if(TS.boot_data.feature_at_here){b.push("here")
}},cleanMsg:function(e){if(!e){return""
}e=e.replace(/\&/g,"&amp;");
e=e.replace(/</g,"&lt;");
e=e.replace(/>/g,"&gt;");
e=e.replace(/(^|\s|\(|&gt;|\*|_)(@[\w|.|-]+)/g,function(h,k,j){var i="";
var f=j.toLowerCase();
var g;
if(/^@everyone[\.|\-|_]*$/.test(f)){g="<!everyone>";
i=f.substr("!everyone".length)
}else{if(/^@here[\.|\-|_]*$/.test(f)&&TS.boot_data.feature_at_here){g="<!here|@here>";
i=f.substr("!here".length)
}else{if(/^@channel[\.|\-|_]*$/.test(f)){g="<!channel>";
i=f.substr("!channel".length)
}else{if(/^@group[\.|\-|_]*$/.test(f)){g="<!group>";
i=f.substr("!group".length)
}}}}if(g){return k+g+i
}h=TS.members.getMemberByName(j);
var o=[".","..","...","....","-","--","_"];
var l;
var p=0;
while(!h&&p<o.length){l=o[p];
if(j&&j.substr(j.length-l.length,l.length)==l){var n=j.substr(0,j.length-l.length);
i=l;
h=TS.members.getMemberByName(n)
}p++
}if(h){return k+"<@"+h.id+">"+i
}return k+j
});
e=e.replace(/(^|\s|\(|&gt;|\*|_)(#[a-zA-Z0-9\-_]+)/g,function(f,i,h){var l=TS.channels.getChannelByName(h);
var g="";
var n=["-","--","_"];
var j;
var o=0;
while(!l&&o<n.length){j=n[o];
if(h&&h.substr(h.length-j.length,j.length)==j){var k=h.substr(0,h.length-j.length);
g=j;
l=TS.channels.getChannelByName(k);
if(l){g=j
}}o++
}if(l){return i+"<#"+l.id+">"+g
}return i+h
});
if(TS.model.prefs.convert_emoticons&&TS.model.prefs.emoji_mode!="as_text"){e=TS.format.doEmoticonConversion(e)
}return e
},emoticon_conversion_token_map:[],emoticonConversionTokenReplacer:function(e){return TS.format.tokenizeStr(TS.format.emoticon_conversion_token_map,e)
},doEmoticonConversion:function(e){TS.format.emoticon_conversion_token_map.length=0;
e=e.replace(TS.format.special_pre_rx,TS.format.emoticonConversionTokenReplacer);
e=e.replace(TS.format.special_code_rx,TS.format.emoticonConversionTokenReplacer);
e=e.replace(TS.format.special_quote_rx,TS.format.emoticonConversionTokenReplacer);
e=emoji.replace_emoticons_with_colons(e);
e=TS.format.deTokenizeStr(TS.format.emoticon_conversion_token_map,e);
return e
},token_cnt:0,token_base:"~^$-+—!?][{}~^$-+—!?][{}~^$-+—!?][{}~^$-+—!?][{}~^$-+—!?][{}~^$-+—!?][{}~^$-+—!?][{}".split("").sort(function(){return 0.5-Math.random()
}).join(""),tokenizeStr:function(g,h,i){if(!h){return""
}i=i||"";
var e=(h.indexOf("\n")===0)?"\n":"";
var f=TS.format.encodeSpecialFormattingCharsAndColon(e+TS.format.token_base+(TS.format.token_cnt++)+TS.utility.date.getTimeStamp());
f=i+f+i;
g.push({str:h,token:f});
return f
},deTokenizeStr:function(f,h){var g;
var e=f.length-1;
for(e;
e>-1;
e--){g=f[e];
h=h.replace(g.token,g.str.replace(/\$/g,"$$$$"))
}return h
},unFormatMsg:function(e,f){if(!e){return""
}return TS.format.formatWithOptions(e,f,{for_edit:true})
},formatJustText:function(e){return TS.format.formatWithOptions(e)
},formatDefault:function(e,f){return TS.format.formatWithOptions(e,f)
},formatNotification:function(e,f){return TS.format.formatWithOptions(e,f,{for_growl:true})
},formatWithOptions:function(s,n,r){var l=(r&&!!r.do_inline_imgs)||undefined;
var x=(r&&!!r.for_growl)||undefined;
var q=(r&&!!r.for_edit)||undefined;
var g=(r&&!!r.no_highlights)||undefined;
var z=(r&&!!r.no_specials)||undefined;
var w=(r&&!!r.enable_slack_action_links)||undefined;
var h=(r&&!!r.force_tsf_despite_mismatch)||undefined;
g=(n&&("no_highlights" in n))?!!n.no_highlights:!!g;
if(z===true||z===false){z=z
}else{if(n&&("mrkdwn" in n)){z=(n.mrkdwn===false)
}else{z=false
}}if(q){z=true
}var t=(n&&n.no_emoji);
var v=!(l&&(!n||n.subtype!="bot_message"));
var e=(!v&&TS.client&&TS.model.team&&TS.model.team.domain=="tinyspeck");
if(!s){return""
}var y=$.trim(s);
if(!y){return""
}var o;
var f;
if(window.TSF){try{f="NORMAL";
if(z){f="NOMRKDWN"
}if(x){f="GROWL"
}if(q){f="EDIT"
}o=c(s,n,f,z,g,t,v,l,w,e)
}catch(m){TS.error("error testing TSF:"+m);
TS.info("txt was:"+s)
}}var k=[];
var j=[];
var u=function(V,C,G,U){var Y;
var S;
var N;
var aa;
if(C.substr(0,1)=="#"){var M=C.substr(1);
N=M.split("|");
S=N[0];
Y=TS.channels.getChannelById(S);
if(!Y){Y=TS.channels.getChannelByName(S)
}if(Y){if(x||q){return TS.format.tokenizeStr(k,"#"+Y.name)
}aa=TS.utility.shouldLinksHaveTargets()?'target="/archives/'+Y.name+'"':"";
if(TS.format.testing_with_generic_tokens){return TS.format.tokenizeStr(k,TS.format.generic_link_open+"#"+Y.name+TS.format.link_close)
}return TS.format.tokenizeStr(k,'<a href="/archives/'+Y.name+'" '+aa+' data-channel-name="'+Y.name+'" data-channel-id="'+Y.id+'" class="internal_channel_link">#'+Y.name+TS.format.link_close)
}else{if(N.length>1&&N[1]){return TS.format.tokenizeStr(k,"#"+N[1])
}else{if(TS.model.user.is_restricted){return TS.format.tokenizeStr(k,"#unknown-channel")
}else{return TS.format.tokenizeStr(k,"#deleted-channel")
}}}}if(C.substr(0,1)=="@"){V=TS.utility.msgs.getMemberFromMemberMarkup(C);
if(V){if(x||q){return TS.format.tokenizeStr(k,"@"+V.name)
}aa=TS.utility.shouldLinksHaveTargets()?'target="/team/'+V.name+'" ':"";
var ab=(g)?"@"+V.name:TS.format.doHighlighting("@"+V.name);
if(TS.format.testing_with_generic_tokens){return TS.format.tokenizeStr(k,TS.format.generic_link_open+ab+TS.format.link_close)
}return TS.format.tokenizeStr(k,'<a href="/team/'+V.name+'" '+aa+'data-member-name="'+V.name+'" class="internal_member_link">'+ab+TS.format.link_close)
}else{return TS.format.tokenizeStr(k,C)
}}if(C.substr(0,1)=="!"){var W=C.substr(1);
var R=(W||"").split("|");
W=R[0];
var P=(R[1])?R[1]:W;
if(TS.utility.inArray(b,W)){if(x||q){return TS.format.tokenizeStr(k,"@"+W)
}return TS.format.tokenizeStr(k,'<b class="mention">@'+W+"</b>")
}else{if(W.indexOf("^")!==-1){var J=W.split("^");
W=J[0];
if(W==="date"&&J.length>=3&&TS.boot_data.feature_client_date_formatting){var T=J[1];
var ac=J[2];
var O=(J.length>3)?J[3]:"";
var E=(O===""||x||q)?"":"<a "+TS.utility.makeRefererSafeLink(O)+' target="_blank">';
var A=(O===""||x||q)?"":TS.format.link_close;
return TS.format.tokenizeStr(k,E+TS.utility.date.formatDate(ac,T,P)+A)
}else{return TS.format.tokenizeStr(k,P)
}}}if(x||q){return TS.format.tokenizeStr(k,"<"+P+">")
}else{return TS.format.tokenizeStr(k,"&lt;"+P+"&gt;")
}}var Z=C.split("|");
var D=Z.shift();
D=D.replace(/\"/g,"&quot;");
var I=Z.join("|")||D;
I=$.trim(I);
if(D.indexOf("<")===0){return TS.format.tokenizeStr(k,"&lt;"+C.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"&gt;")
}I=I.replace(/</g,"&lt;");
I=I.replace(/>/g,"&gt;");
if(x){if(I==D){var K=(D.indexOf("//")>-1)?D.split("//")[1]:D;
K=jQuery.trim(K).substring(0,30).trim(this)+"...";
return""+K+""
}return"<"+I+">"
}else{if(q){return I
}}if(!z&&I!=D){I=TS.format.doSpecials(I,n&&n._special_debug)
}if(!t&&I!=D){I=TS.utility.emojiReplace(I,j)
}if(!g){I=TS.format.doHighlighting(I)
}var H;
if(D.indexOf(TS.utility.msgs.api_url_prefix+"chat.help")===0){if(w){H=TS.utility.htmlEntities(TS.utility.jsString(D));
return TS.format.tokenizeStr(k,'<a onclick="TS.utility.msgs.doApiUrl('+H+')" class="api_url">'+I+TS.format.link_close)
}else{return TS.format.tokenizeStr(k,'<a class="api_url muted">(Disabled) '+I+TS.format.link_close)
}}else{if(D.indexOf(TS.utility.msgs.new_api_url_prefix)===0){if(w){H=TS.utility.htmlEntities(TS.utility.jsString(D));
return TS.format.tokenizeStr(k,'<a onclick="TS.utility.msgs.doNewApiUrl('+H+')" class="api_url">'+I+TS.format.link_close)
}else{return TS.format.tokenizeStr(k,'<a class="api_url muted">(Disabled) '+I+TS.format.link_close)
}}else{if(D.indexOf("javascript:")==0){return TS.format.tokenizeStr(k,'<a onclick="'+D.replace("javascript:","")+'">'+I+TS.format.link_close)
}else{if(TS.client&&TS.client.core_url&&D.indexOf(TS.client.core_url)===0){if(TS.format.testing_with_generic_tokens){return TS.format.tokenizeStr(k,TS.format.generic_link_open+I+TS.format.link_close)
}return TS.format.tokenizeStr(k,'<a target="_self" href="'+D+'">'+I+TS.format.link_close)
}else{var X="";
var L;
if(n&&n.ts&&l){L=TS.inline_attachments.getAttachmentByFromUrl(n.attachments,D);
if(L){if(TS.boot_data.feature_attachments_inline||TS.templates.builders.shouldDoSimpleAttachment(L,n)){X=TS.templates.builders.buildAttachmentHTML({attachment:L,url:D,msg:n,show_initial_caret:true}).replace(/\n/g,"").replace(/\t/g,"").replace(/  /g," ")
}}}if(X){X=X.replace(/\n/g,"").replace(/\t/g,"").replace(/ +/g," ")
}if(TS.format.testing_with_generic_tokens){return TS.format.tokenizeStr(k,TS.format.generic_link_open+I+TS.format.link_close+X)
}var B=TS.utility.getFileIDFromURL(D);
var F=(B)?' class="file_preview_link"':"";
var Q=(B)?' data-file-id="'+B+'"':"";
return TS.format.tokenizeStr(k,"<a "+TS.utility.makeRefererSafeLink(D)+' target="_blank"'+F+Q+">"+I+TS.format.link_close+X)
}}}}};
y=y.replace(/<(.*?)>/g,u);
y=y.replace(/\</g,"&lt;");
y=y.replace(/\>/g,"&gt;");
if(q){y=TS.utility.unHtmlEntities(y)
}else{if(x){if(TS.utility.platformSupportsHtmlNotifications()){if(TS.utility.platformSupportsImgEmojiInHtmlNotifications()){y=TS.utility.emojiReplace(y,null,true)
}}else{y=TS.utility.unHtmlEntities(y);
if(emoji.replace_mode=="unified"){y=emoji.replace_colons_with_unified(y)
}}}else{TS.format.special_token_map=[];
if(!z){y=TS.format.doSpecials(y,n&&n._special_debug)
}if(!v){if(e){y=y.replace(TS.format.theme_rx,function(B,A,C){return A+"<nobr>"+C+" "+TS.format.tokenizeStr(TS.format.special_token_map,a(B)+"</nobr>")
})
}y=y.replace(TS.format.hex_rx,TS.format.hexReplace)
}if(!t){y=TS.utility.emojiReplace(y,j)
}y=TS.format.deTokenizeStr(TS.format.special_token_map,y);
TS.format.special_token_map=null;
if(!g){y=TS.format.doHighlighting(y)
}y=y.replace(/<\/div>\n/g,"</div>");
y=y.replace(/<\/pre>\n/g,"</pre>");
y=y.replace(/codecopyonly> /g,"codecopyonly>&nbsp;");
y=y.replace(/ <span class="codecopyonly/g,'&nbsp;<span class="codecopyonly');
y=y.replace(/&nbsp;&nbsp;/g," &nbsp;");
y=y.replace(/\n\r\n\r/g,TS.format.para_break);
y=y.replace(/\n\r\n/g,TS.format.para_break);
y=y.replace(/\n\n/g,TS.format.para_break);
y=y.replace(/\n/g,TS.format.line_break);
y=y.replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;");
y=y.replace(/  /g," &nbsp;");
y=y.replace(/^ /g,"&nbsp;")
}}y=TS.format.deTokenizeStr(k,y);
y=TS.format.deTokenizeStr(j,y);
j=null;
if(window.TSF&&o){if(o!=y){TS.error("======================================================================== "+f+" "+(o==y));
TS.info("txt     :"+s);
TS.info("new_txt :"+y);
TS.info("tsf_str :"+o);
if(TS.model.user.id=="U024BE7LM"||TS.model.user.id=="U032VEM0B"){window._temp_bad_message_hash=window._temp_bad_message_hash||{};
var i="format bot";
var p=(n)?n.ts:s.substr(0,30);
if(!window._temp_bad_message_hash[p]&&(!n||n.username!=i)){window._temp_bad_message_hash[p]=true;
TS.ims.addMsg(TS.ims.getImByMemberId("USLACKBOT").id,{type:"message",subtype:"bot_message",is_ephemeral:true,username:i,icons:{emoji:":symbols:"},ts:TS.utility.date.makeTsStamp(),text:"check console for bad message report! ts: "+(n?n.ts:"unknown")})
}}if(h){return o
}}else{if(window.show_all_msg_tests){TS.warn("================================"+f+" "+(o==y));
TS.info("new_txt:"+y);
TS.info("tsf_str:"+o)
}return o
}}return y
},hex_rx:/(\W|^)(#[A-Fa-f0-9]{6})(\b)/g,hexReplace:function(f,g,e,h){return g+e+' <div class="inline_color_block" style="background:'+e+';"></div>'+h
},special_i_rx:/(^|\s|[\?\.,\-!\^;:{(\[%$#+=\u2000-\u206F\u2E00-\u2E7F"])\_(.*?\S *)?\_($|\s|[\?\.,\-!\^;:})\]%$#+=\u2000-\u206F\u2E00-\u2E7F…"])/g,special_b_rx:/(^|\s|[\?\.,\-!\^;:{(\[%$#+=\u2000-\u206F\u2E00-\u2E7F"])\*(.*?\S *)?\*(?=$|\s|[\?\.,\-!\^;:})\]%$#+=\u2000-\u206F\u2E00-\u2E7F…"])/g,special_code_rx:/(^|\s|[\?\.,\-!\^;:{(\[%$#+=\u2000-\u206F\u2E00-\u2E7F"])\`(.*?\S *)?\`/g,special_pre_rx:/(^|\s|[\?\.,\-!\^;:{(\[%$#+=\u2000-\u206F\u2E00-\u2E7F"])```([\s\S]*?)?```(?=$|\s|[\?\.,\-!\^;:})\]%$#+=\u2000-\u206F\u2E00-\u2E7F…"])/g,special_quote_rx:/(^|\n)&gt;(?![\W_](?:&lt;|&gt;|[\|\/\\\[\]{}\(\)Dpb](?=\s|$)))(([^\n]*)(\n&gt;[^\n]*)*)/g,special_3_quote_rx:/(^|\n)&gt;&gt;&gt;([\s\S]*$)/,special_quote_prefix:'<span class="copyonly">&gt;</span>',special_longquote_prefix:'<span class="copyonly">&gt;&gt;&gt;</span>',special_i_open:'<i><span class="copyonly">&#95;</span>',special_i_close:'<span class="copyonly">&#95;</span></i>',special_b_open:'<b><span class="copyonly">&ast;</span>',special_b_close:'<span class="copyonly">&ast;</span></b>',special_pre_open:'<pre class="special_formatting"><span class="copyonly">&#96;&#96;&#96;</span>',special_pre_close:'<span class="copyonly">&#96;&#96;&#96;</span></pre>',special_code_open:'<code><span class="copyonly">&#96;</span codecopyonly>',special_code_close:'<span class="codecopyonly copyonly">&#96;</span></code>',special_quote_open:'<div class="special_formatting_quote"><div class="quote_bar"><div class="shim"></div></div><div class="content dynamic_content_max_width">',special_quote_close:"</div></div>",line_break:"<br>",hard_space:"&nbsp;",generic_link_open:"<a>",link_close:"</a>",para_break:'<span class="para_break"><i class="copy_only"><br></i></span>',specialPreReplace:function(f,e,g){if(!g){return f
}if(g&&g.length&&g.substr(0,1)=="\n"){g=g.substr(1)
}if(TS.format.special_token_map){g=TS.format.encodeForPre(g);
return e+TS.format.special_pre_open+TS.format.tokenizeStr(TS.format.special_token_map,g)+TS.format.special_pre_close
}g=TS.format.encodeSpecialFormattingCharsAndMoreForPre(g);
return e+TS.format.special_pre_open+(g)+TS.format.special_pre_close
},specialCodeReplace:function(f,e,g){if(TS.format.log_specials){TS.warn('match in specialCodeReplace:\n"'+f+'"')
}if(!g||g.substr(0,1)=="`"||g.substr(g.length-1,1)=="`"||(g.match(/<pre/g)&&g.match(/<\/pre/g))){return f
}if(TS.format.special_token_map){return e+TS.format.special_code_open+TS.format.tokenizeStr(TS.format.special_token_map,g)+TS.format.special_code_close
}g=TS.format.encodeSpecialFormattingCharsAndColon(g);
return e+TS.format.special_code_open+g+TS.format.special_code_close
},specialItalicReplace:function(f,e,h,g){if(TS.format.log_specials){TS.warn('match in specialItalicReplace:\n"'+f+'"')
}if(!h||!h.match(/[^_*`]/)||h.substr(0,1)=="_"||h.substr(h.length-1,1)=="_"||(e==":"&&g==":")){return f
}return e+TS.format.special_i_open+TS.format.doSpecials(h)+TS.format.special_i_close+g
},specialBoldReplace:function(f,e,g){if(!g||!g.match(/[^_*`]/)||g.substr(0,1)=="*"||g.substr(g.length-1,1)=="*"||(g.substr(0,1)==" "&&g.substr(g.length-1,1)==" ")){return f
}return e+TS.format.special_b_open+TS.format.doSpecials(g)+TS.format.special_b_close
},specialQuoteReplace:function(f,e,h,g){if(f=="&gt;"){return f
}h=h.replace(/\n&gt;/g,"\n"+TS.format.special_quote_prefix);
return TS.format.special_quote_open+TS.format.special_quote_prefix+h+TS.format.special_quote_close
},special3QuoteReplace:function(f,e,g){if(f=="&gt;&gt;&gt;"){return"&gt;&gt;&gt;"
}g=g.replace(/^([\s]*)(&gt;)*/g,function(h,j,i,l,k){if(i){return h
}return""
});
return TS.format.special_quote_open+TS.format.special_longquote_prefix+g+TS.format.special_quote_close
},log_specials:false,doSpecials:function(f,e){f=f||"";
if(e){TS.info("debugging specials for text:::::::::::::::::::::\n"+f);
TS.format.log_specials=true
}f=f.replace(TS.format.special_pre_rx,TS.format.specialPreReplace);
f=f.replace(TS.format.special_code_rx,TS.format.specialCodeReplace);
f=f.replace(TS.format.special_i_rx,TS.format.specialItalicReplace);
f=f.replace(TS.format.special_b_rx,TS.format.specialBoldReplace);
f=f.replace(TS.format.special_3_quote_rx,TS.format.special3QuoteReplace);
f=f.replace(TS.format.special_quote_rx,TS.format.specialQuoteReplace);
TS.format.log_specials=false;
return f
},at_symbol_token:"thisreplacementtokenallowsustotreatatsymbolsasiftheywerewordcharactersinregex".split("").sort(function(){return 0.5-Math.random()
}).join(""),swapInAts:function(e){if(!e){return e
}return e.replace(new RegExp(TS.format.at_symbol_token,"g"),"@")
},swapOutAts:function(e){if(!e){return e
}return e.replace(/@/g,TS.format.at_symbol_token)
},doHighlighting:function(g){var m;
var l;
var e=TS.model.highlight_words.concat();
e.sort(function k(n,i){var o=n.length;
var p=i.length;
if(o<p){return 1
}if(o>p){return -1
}return 0
});
var f=false;
if(g.indexOf("@")!=-1){f=true;
g=TS.format.swapOutAts(g)
}for(var h=0;
h<e.length;
h++){m=e[h];
if(f){m=TS.format.swapOutAts(e[h])
}m=TS.utility.regexpEscape(m);
if(m=="don"){m+="(?!'t)"
}l=new RegExp("(\\b|_|\\s|^)("+m+")(\\b|_|\\s|$)","ig");
var j=0;
g=g.replace(l,function(o,p,n,t,s,r){if(r.substr(0,s).match(/</)){for(var q=s;
q>=j;
q--){if(r.charAt(q)=="<"){return p+n+t
}if(r.charAt(q)==">"){break
}}}j=s+o.length;
return p+'<span class="mention">'+n+"</span>"+t
})
}if(f){return TS.format.swapInAts(g)
}else{return g
}},encodeSpecialFormattingChars:function(e){e=e||"";
return e.replace(/\*/g,"&ast;").replace(/\_/g,"&#95;").replace(/\`/g,"&#96;")
},encodeSpecialFormattingCharsAndColon:function(e){e=e||"";
return TS.format.encodeSpecialFormattingChars(e).replace(/\:/g,"&#58;")
},encodeSpecialFormattingCharsAndMoreForPre:function(e){e=e||"";
return TS.format.encodeForPre(TS.format.encodeSpecialFormattingCharsAndColon(e))
},encodeForPre:function(e){e=e||"";
return e.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,TS.format.line_break)
}});
var b=["everyone","channel","group"];
var d;
var c=function(k,P,l,p,n,B,x,V,D,J){d=d||{"<B:START>":TS.format.special_b_open,"<B:END>":TS.format.special_b_close,"<PRE:START>":TS.format.special_pre_open,"<PRE:END>":TS.format.special_pre_close,"<CODE:START>":TS.format.special_code_open,"<CODE:END>":TS.format.special_code_close,"<I:START>":TS.format.special_i_open,"<I:END>":TS.format.special_i_close,"<QUOTE:START>":TS.format.special_quote_open,"<QUOTE:PREFIX>":TS.format.special_quote_prefix,"<LONGQUOTE:PREFIX>":TS.format.special_longquote_prefix,"<QUOTE:END>":TS.format.special_quote_close,"<LINK:END>":TS.format.link_close,"<LINE:BREAK>":TS.format.line_break,"<PARA:BREAK>":TS.format.para_break,"<SPACE:HARD>":TS.format.hard_space};
var E=d;
var M=[];
if(J){k=k.replace(TS.format.theme_rx,function(A,i,Y){return i+TS.format.tokenizeStr(M,"<nobr>",",")+Y+" "+TS.format.tokenizeStr(M,a(A)+"</nobr>")
})
}var G="";
var r=TSF.getTokensArray($.trim(k),l);
var X;
var I;
var F;
var T;
var K;
var R;
var u;
var e;
var U;
var Q;
var t;
var v;
var C;
var q;
var o;
var H;
var z;
if(l=="GROWL"||l=="EDIT"){for(T=0;
T<r.length;
T++){F=r[T];
if(F.indexOf("<")===0){if(E[F]){TS.error('unexpected: mode == "GROWL" || "EDIT", and yet we got something in the formatting map? '+F)
}else{if(F.indexOf("<!")===0){I=F.replace(/<|>/g,"");
t=(I||"").split("|");
U=t[0].substr(1);
if(TS.utility.inArray(b,U)){G+="@"+U
}else{Q=(t[1])?t[1]:U;
if(U.indexOf("^")!==-1){v=U.split("^");
U=v[0];
if(U==="date"&&v.length>=3&&TS.boot_data.feature_client_date_formatting){C=v[1];
q=v[2];
G+=TS.utility.date.formatDate(q,C,Q)
}else{G+="<"+Q+">"
}}else{G+="<"+Q+">"
}}}else{if(F.indexOf("<@")===0){I=F.replace(/<|>/g,"");
R=TS.utility.msgs.getMemberFromMemberMarkup(I);
if(R){G+="@"+R.name
}else{if(l=="EDIT"){G+=I
}else{if(l=="GROWL"){G+=F
}}}}else{if(F.indexOf("<#")===0){I=F.replace(/<|>|#/g,"");
u=I.split("|");
K=u[0];
X=TS.channels.getChannelById(K);
if(X){G+="#"+X.name
}else{if(u.length>1&&u[1]){G+="#"+u[1]
}else{if(TS.model.user.is_restricted){G+="#unknown-channel"
}else{G+="#deleted-channel"
}}}}else{if(F.indexOf(TSF.LINK_START.split(" ")[0])===0){TS.error('unexpected: mode == "GROWL" || "EDIT", and yet we got '+F)
}else{if(F.indexOf(TSF.EMOJI_COLONS.split(" ")[0])===0){TS.error('unexpected: mode == "GROWL" || "EDIT", and yet we got '+F)
}else{if(F.indexOf(TSF.HEX_BLOCK.split(" ")[0])===0){TS.error('unexpected: mode == "GROWL" || "EDIT", and yet we got '+F)
}else{TS.error("markup token not handled:"+F)
}}}}}}}}else{if(F.indexOf("<")==-1){if(l=="EDIT"){G+=TS.utility.unHtmlEntities(F)
}else{if(l=="GROWL"){if(TS.utility.platformSupportsHtmlNotifications()){if(TS.utility.platformSupportsImgEmojiInHtmlNotifications()){G+=TS.utility.emojiReplace(F,null,true)
}}else{var S=TS.utility.unHtmlEntities(F);
if(emoji.replace_mode=="unified"){S=emoji.replace_colons_with_unified(S)
}G+=S
}}}}else{TS.error("token has a < in it but it is not the first character!\n"+F)
}}}}else{var W="";
var s;
for(T=0;
T<r.length;
T++){F=r[T];
if(F.indexOf("<")===0){if(E[F]){G+=E[F];
if(F==TSF.LINK_END){G+=W;
W=""
}}else{if(F.indexOf("<!")===0){I=F.replace(/<|>/g,"");
t=(I||"").split("|");
U=t[0].substr(1);
if(TS.utility.inArray(b,U)){G+='<b class="mention">@'+U+"</b>"
}else{Q=(t[1])?t[1]:U;
if(U.indexOf("^")!==-1){v=U.split("^");
U=v[0];
if(U==="date"&&v.length>=3&&TS.boot_data.feature_client_date_formatting){C=v[1];
q=v[2];
o=(v.length>3)?v[3]:"";
H=(o==="")?"":"<a "+TS.utility.makeRefererSafeLink(o)+' target="_blank">';
z=(o==="")?"":TS.format.link_close;
G+=H+TS.utility.date.formatDate(q,C,Q)+z
}else{G+="&lt;"+Q+"&gt;"
}}else{G+="&lt;"+Q+"&gt;"
}}}else{if(F.indexOf("<@")===0){I=F.replace(/<|>/g,"");
R=TS.utility.msgs.getMemberFromMemberMarkup(I);
if(R){e=TS.utility.shouldLinksHaveTargets()?'target="/team/'+R.name+'" ':"";
var O=(n)?"@"+R.name:TS.format.doHighlighting("@"+R.name);
G+='<a href="/team/'+R.name+'" '+e+'data-member-name="'+R.name+'" class="internal_member_link">'+O+TS.format.link_close
}else{G+=I
}}else{if(F.indexOf("<#")===0){I=F.replace(/<|>|#/g,"");
u=I.split("|");
K=u[0];
X=TS.channels.getChannelById(K);
if(X){e=(TS.utility.shouldLinksHaveTargets())?'target="/archives/'+X.name+'"':"";
if(TS.format.testing_with_generic_tokens){G+=TS.format.generic_link_open+"#"+X.name+TS.format.link_close
}G+='<a href="/archives/'+X.name+'" '+e+' data-channel-name="'+X.name+'" data-channel-id="'+X.id+'" class="internal_channel_link">#'+X.name+TS.format.link_close
}else{if(u.length>1&&u[1]){G+="#"+u[1]
}else{if(TS.model.user.is_restricted){G+="#unknown-channel"
}else{G+="#deleted-channel"
}}}}else{if(F.indexOf(TSF.LINK_START.split(" ")[0])===0){var h=(function(m){var i=$.trim(m.replace(TSF.LINK_START.split(" ")[0],""));
return i.substr(0,i.length-1)
})(F);
if(h.indexOf(TS.utility.msgs.api_url_prefix+"chat.help")===0){if(D){s=TS.utility.htmlEntities(TS.utility.jsString(h));
G+='<a onclick="TS.utility.msgs.doApiUrl('+s+')" class="api_url">'
}else{G+='<a class="api_url muted">(Disabled) '
}}else{if(h.indexOf(TS.utility.msgs.new_api_url_prefix)===0){if(D){s=TS.utility.htmlEntities(TS.utility.jsString(h));
G+='<a onclick="TS.utility.msgs.doNewApiUrl('+s+')" class="api_url">'
}else{G+='<a class="api_url muted">(Disabled) '
}}else{if(h.indexOf("javascript:")===0){G+='<a onclick="'+h.replace("javascript:","")+'">'
}else{if(TS.client&&TS.client.core_url&&h.indexOf(TS.client.core_url)===0){G+='<a target="_self" href="'+h+'">'
}else{var f=TS.utility.getFileIDFromURL(h);
var N=(f)?' class="file_preview_link"':"";
var j=(f)?' data-file-id="'+f+'"':"";
G+="<a "+TS.utility.makeRefererSafeLink(h)+' target="_blank"'+N+j+">";
if(W){TS.error("WTF we should have no attach_html")
}W="";
var y;
if(P&&P.ts&&V){y=TS.inline_attachments.getAttachmentByFromUrl(P.attachments,h);
if(y){if(TS.boot_data.feature_attachments_inline||TS.templates.builders.shouldDoSimpleAttachment(y,P)){W=TS.templates.builders.buildAttachmentHTML({attachment:y,url:h,msg:P,show_initial_caret:true})
}}}}}}}}else{if(F.indexOf(TSF.EMOJI_COLONS.split(" ")[0])===0){var g=F.split(" ")[1].replace(">","");
if(!B){var w=TS.utility.emojiReplace(g);
if(w==g){if(n){G+=g
}else{G+=TS.format.doHighlighting(g)
}}else{G+=TS.utility.emojiReplace(g)
}}else{G+=g
}}else{if(F.indexOf(TSF.HEX_BLOCK.split(" ")[0])===0){var L=F.split(" ")[1].replace(">","");
if(!x){G+=' <div class="inline_color_block" style="background:'+L+';"></div>'
}}else{TS.error("markup token not handled:"+F)
}}}}}}}}else{if(F.indexOf("<")==-1){if(n){G+=F
}else{G+=TS.format.doHighlighting(F)
}}else{TS.error("token has a < in it but it is not the first character!\n"+F)
}}}}G=TS.format.deTokenizeStr(M,G);
return G
};
var a=function(f,e){e=(e)?" to "+e:"";
return'<a data-theme="'+TS.utility.htmlEntities(f)+'" class="btn btn_small tiny_right_margin theme_installer_btn" style="padding: 0px 7px 1px;"><i class="ts_icon ts_icon_cog align_middle"></i> Switch'+e+"</a>"
}
})();
(function(){TS.registerModule("emoji_menu",{active_emoji_group:null,is_showing:false,is_dirty:true,onStart:function(){TS.prefs.emoji_use_changed_sig.add(function(){B=true
});
T.append(TS.templates.emoji_menu());
H=$("#emoji_menu");
y=H.find("#emoji_menu_items_scroller");
var aq=TS.qs_args.debug_scroll=="1";
y.monkeyScroll({debug:aq});
if(TS.boot_data.feature_reactions){N="";
ab="mine";
H.addClass("all_emoji");
y.bind("scroll",O)
}G=H.find("#emoji_menu_header");
P=H.find("#emoji_menu_items_div");
S=H.find("#emoji_menu_footer");
e=$("#emoji_preview");
X=$("#emoji_preview_img");
Q=$("#emoji_name");
i=$("#emoji_aliases");
H.detach()
},startEmoForRxn:function(ar,aq,at){ak=aq;
if(!ak){ak=null;
TS.error("no _rxn_key for rxn_key:"+aq)
}TS.emoji_menu.startEmo(ar,null,at)
},startEmo:function(av,aq,az){if(TS.emoji_menu.is_showing){s();
return
}var aw=$(av&&av.target);
aw.closest(".emo_menu").addClass("active");
if(aq){al=aq
}if(TS.client&&TS.client.ui.$msg_input.prop("disabled")){return
}m=az;
var ar=new Date();
TS.emoji_menu.active_emoji_group=TS.emoji_menu.active_emoji_group||ab;
var aA;
if(TS.boot_data.feature_reactions){aA=TS.emoji_menu.is_dirty
}else{aA=(R!==TS.emoji_menu.active_emoji_group);
if(B&&TS.emoji_menu.active_emoji_group=="mine"){aA=true
}}if(aA){aa()
}K(N);
if(!C){H.appendTo(T);
C=true
}var au=aw.offset();
var ay,ax;
if(au){if(TS.boot_data.feature_msg_input_revisions){ay=au.left-8;
ax=au.top-(H.outerHeight()+6)
}else{ay=au.left;
ax=au.top-(H.outerHeight()+10)
}}TS.emoji_menu.is_showing=true;
ae();
w();
H.css({top:parseInt(ax),left:parseInt(ay)});
y.scrollTop(0);
if(y.data("monkeyScroll")){y.data("monkeyScroll").updateFunc()
}k();
$(window).bind("resize",k);
$(window.document).bind("keydown",ai);
$("html").bind("mousedown",c);
H.css("opacity",0);
H.stop().transition({opacity:1,delay:20},100);
b=y.dimensions_rect();
am.top=0;
am.bottom=b.height*0.4;
l();
if(!TS.model.supports_sticky_position){$("#emoji_h3_"+TS.emoji_menu.active_emoji_group).scrollintoview({offset:"top",px_offset:0,duration:0})
}ad.focus();
var at=new Date()-ar;
if(at>Z&&!af){af=true;
TS.logError({message:"TS.emoji_menu.startEmo() > "+Z+" ms"}," startEmo() took "+at+" ms. localStorage = "+(TS.model.prefs.ls_disabled?0:1))
}}});
var ab="grinning";
var al="#message-input";
var ap="#message-input";
var af=null;
var Z=1000;
var D=false;
var F=false;
var t;
var r;
var E=null;
var L=-1;
var ag=null;
var C=false;
var g=false;
var B=false;
var R=null;
var ak=null;
var N=":smile:";
var T=(TS.client)?$("#client-ui"):$("body");
var H;
var G;
var P;
var S;
var ad;
var e;
var X;
var Q;
var i;
var d;
var V;
var Y;
var an;
var J;
var ah;
var y;
var W;
var b;
var am={right:0,left:0};
var aj={right:0,left:0};
var q;
var I;
var m;
var p=function(aq,ar){if(F){return
}F=true;
H.addClass("key_mode");
ad.blur();
E=Y.filter(":visible");
if(!ar&&r&&E.index(r)>-1){a(E.index(r));
A(aq)
}else{ao(0);
a(0)
}$("body").bind("mousedown.emoji_key_mode",function(){w()
});
y.bind("mousemove.emoji_key_mode",function(at){if(!t){t={x:at.pageX,y:at.pageY};
return
}if(Math.abs(at.pageX-t.x)>1||Math.abs(at.pageY-t.y)>1){w()
}})
};
var A=function(az){if(E.length==1){return
}var at=TS.utility.keymap;
var ay=E.eq(L);
var aw;
if(E.length<=TS.model.emoji_menu_columns){if(az==at.up){az=at.left
}if(az==at.down){az=at.right
}}if(az==at.up||az==at.down){if(az==at.up){aw=L-TS.model.emoji_menu_columns
}else{aw=L+TS.model.emoji_menu_columns
}if(D){if(aw>=E.length){var au=Math.ceil(E.length/TS.model.emoji_menu_columns);
var av=Math.ceil((E.index(ay)+1)/TS.model.emoji_menu_columns)-1;
if(au==av+1){aw=0
}else{aw=E.length-1
}}}else{var ar=ay.data("col");
var aB=ay.data("row");
var ax=(az==at.up)?aB-1:aB+1;
var aq=E.filter('[data-row="'+ax+'"]');
var aA=aq.filter('[data-col="'+ar+'"]');
if(aA.length){aw=E.index(aA)
}else{aw=E.index(aq.last())
}}}else{if(az==at.right){aw=L+1
}else{if(az==at.left){aw=L-1
}else{TS.error("invalid key passed to _changeKeyModeSelectionLiByArrow:"+az);
return
}}}if((az==at.up||az==at.left)&&aw<0){aw=E.length-1
}else{if((az==at.down||az==at.right)&&(aw==-1||aw>=E.length)){aw=0
}}a(aw)
};
var a=function(aq){var au=L;
if(au>-1){E.eq(au).removeClass("key_selection")
}L=aq;
var ar=E.eq(L);
var at=ar.find("a");
h(at);
K(at.data("name"),at.data("names"));
ar.addClass("key_selection").scrollintoview({offset:(L<au)?"top":"bottom",px_offset:(L<au)?26:-6,duration:100})
};
var w=function(){if(!F){return
}F=false;
t=null;
H.removeClass("key_mode");
E.removeClass("key_selection");
L=-1;
$("body").unbind("mousedown.emoji_key_mode");
y.unbind("mousemove.emoji_key_mode")
};
var j=function(){if(D){return
}D=true;
w();
d.addClass("hidden");
an.removeClass("hidden");
V.css("display","inline");
$(".emoji_section_div").css("display","inline");
ah.addClass("hidden");
J.addClass("hidden")
};
var ae=function(){if(!D){return
}D=false;
ag=null;
d.removeClass("hidden");
an.addClass("hidden");
V.css("display","block");
$(".emoji_section_div").css("display","block");
ah.removeClass("hidden");
J.addClass("hidden");
ad.val("");
Y.removeClass("hidden");
y.scrollTop(0);
y.data("monkeyScroll").updateFunc();
l()
};
var l=function(){q=[];
I={};
var aq;
var at;
var av;
var ar=-1;
d.each(function(ay,ax){var aw=$(ax);
av=aw.data("group-name");
if(!TS.model.supports_sticky_position){aw.css("top",0)
}if(aw.hasClass("hidden")){return
}ar++;
I[av]=q[ar]={index:ar,$el:aw,id:aw.attr("id"),group_name:av,rect:aw.dimensions_rect(),vis:{top:0,bottom:0,max_top:0,set_top:0}}
});
for(var au=0;
au<q.length;
au++){aq=q[au];
at=q[au+1];
aq.vis.top=aq.rect.top-b.top;
aq.vis.bottom=(at)?at.rect.top-b.top:100000000000;
aq.vis.max_top=(aq.vis.bottom-aq.vis.top)-aq.rect.height;
delete aq.rect
}};
var z=function(){var aq=0;
var ar=0;
var at;
Y.each(function(av,au){at=$(au);
at.attr("data-col",aq);
at.attr("data-row",ar);
if((aq+1==TS.model.emoji_menu_columns)||(at[0]==at.parent().find("li").last()[0])){ar++;
aq=0
}else{aq++
}})
};
var aa=function(){B=false;
TS.emoji_menu.is_dirty=false;
R=TS.emoji_menu.active_emoji_group;
G.html(TS.templates.emoji_header({emoji_groups:TS.model.emoji_groups,active_group:TS.emoji_menu.active_emoji_group}));
var ar=TS.templates.menu_emoticons({emoji_groups:TS.model.emoji_groups,active_group:TS.emoji_menu.active_emoji_group});
if(!TS.model.user.is_restricted){if(!TS.model.team.prefs.emoji_only_admins||TS.model.user.is_admin){ar+='<i class="ts_icon ts_icon_plus"></i> &nbsp;You can <a href="/admin/emoji" target="_blank">add custom emoji here</a>'
}}ar+="</div>";
P.html(ar);
ad=P.find("#emoji_input");
ad.bind("textchange",f);
d=P.find("h3");
V=P.find("ul");
Y=V.find("li");
z();
an=P.find("#emoji_search_results_h3");
J=P.find("#emoji_zero_results");
ah=P.find("#emoji_tip");
W={};
var aq=P.find("ul:not(#emoji_ul_mine)").find("li");
aq.each(function(av,at){var az=$(at);
var ay=az.data("names");
if(!ay){return
}var ax=ay.split(" ");
var au;
for(var aw=0;
aw<ax.length;
aw++){au=ax[aw].replace(/\:/g,"");
if(!W.hasOwnProperty(au)){W[au]={$li:az,names:az.data("names")}
}}});
if(TS.emoji_menu.is_showing){l()
}if(!g){g=true;
P.on("click.emoji_menu",".emoji_ul a",U);
P.on("mouseenter",".emoji_ul a",M);
P.on("mouseleave",".emoji_ul a",o);
G.on("click.emoji_menu","a.emoji_grouping_tab",x)
}};
var O=function(au){var av=y.scrollTop();
var aq;
var at;
for(var ar=0;
ar<q.length;
ar++){aq=q[ar];
if(av+ar===0){at=aq.group_name
}if(av>=aq.vis.top&&av<=aq.vis.bottom){at=aq.group_name;
if(!TS.model.supports_sticky_position){aq.set_top=Math.min(av-aq.vis.top,aq.vis.max_top);
aq.$el.css("top",aq.set_top)
}}else{if(aq.set_top&&!TS.model.supports_sticky_position){aq.set_top=0;
aq.$el.css("top",aq.set_top)
}}aj.top=aq.vis.top-av;
aj.bottom=aj.top+25;
if(av>0&&TS.utility.doesRectContainRect(am,aj,0,true)){at=aq.group_name
}else{if(parseInt(y.css("height"))+av+40>=y[0].scrollHeight){at=q[q.length-1].group_name
}}}if(at!=TS.emoji_menu.active_emoji_group){TS.emoji_menu.active_emoji_group=at;
$(".emoji_grouping_tab").removeClass("active");
$('.emoji_grouping_tab[data-group-name="'+TS.emoji_menu.active_emoji_group+'"]').addClass("active")
}};
var f=function(aC,au){var aw=$.trim(ad.val());
var av=Date.now();
TS.log(96,"--- _onInputTextchange ---");
if(!aw){ae();
return
}j();
TS.log(96,"after _startSearchMode "+(Date.now()-av));
Y.addClass("hidden");
TS.log(96,"after hiding all "+(Date.now()-av));
var aG=aw.split(" ");
var aB=[];
var aq;
var ay;
var ar;
var aD;
var at;
var aA;
var az;
names_loop:for(var ax=0;
ax<TS.model.emoji_names.length;
ax++){ar=TS.model.emoji_names[ax];
for(az=0;
az<aG.length;
az++){aD=aG[az];
if(aD.substr(0,1)==":"){aA="^"+TS.utility.regexpEscape(aD.replace(/:/g,""));
if(aD.length>1&&aD.substr(-1,1)==":"){aA+="$"
}}else{aA=TS.utility.regexpEscape(aD)
}at=new RegExp(aA,"i");
if(at.test(ar)){aB[aB.length]=ar;
continue names_loop
}}}TS.log(96,"after regex "+(Date.now()-av));
var aH;
var aF=false;
var aE=false;
for(ar in W){if(aB.indexOf(ar)===-1){continue
}aH=W[ar];
aE=aF;
aF=true;
aq=":"+ar+":";
ay=aH.names;
aH.$li.removeClass("hidden")
}TS.log(96,"after show/hide "+(Date.now()-av));
if(!TS.model.supports_sticky_position){an.css("top",0);
TS.log(96," after _$emoji_search_results_h3.css "+(Date.now()-av))
}J.toggleClass("hidden",aF);
TS.log(96," after emoji_zero_results.toggleClass "+(Date.now()-av));
if(y[0]["scrollTop"]){y[0]["scrollTop"]=0
}TS.log(96,"after scroller[0].scrollTop = 0 "+(Date.now()-av));
l();
TS.log(96,"after _calcHeaderRanges "+(Date.now()-av));
setTimeout(y.data("monkeyScroll").updateFunc,0);
ag=null;
if(aE){ay=aq=N
}else{if(aF){ag=aq;
aq=aq;
ay=ay
}else{ay=aq=":cry:"
}}K(aq,ay);
TS.log(96,"end "+(Date.now()-av))
};
var K=function(ar,aq){if(TS.boot_data.feature_reactions){if(ar){S.addClass("previewing");
X.html(TS.utility.emojiGraphicReplace(ar));
Q.html(ar.replace(/:/g,""));
i.html(aq||"")
}else{S.removeClass("previewing")
}}else{if(!ar){return
}X.html(TS.utility.emojiGraphicReplace(ar));
Q.html(aq||ar)
}};
var ac=function(aw,av){if(m){setTimeout(m,0,aw);
if(!av||!av.shiftKey){s()
}return
}var au=TS.utility.getCursorPosition(al);
var at=au+aw.length;
var ar=$(al).val();
var aq=ar.substr(0,au)+aw+ar.substr(au);
$(al).val(aq).trigger("autosize").trigger("autosize-resize").trigger("textchange");
if(!av||!av.shiftKey){setTimeout(TS.utility.setCursorPosition,0,al,at);
s()
}};
var ai=function(av){var at=TS.utility.keymap;
if(TS.boot_data.feature_reactions){if(F){if(TS.utility.isArrowKey(av.which)){A(av.which);
av.preventDefault();
return
}if(av.which==at.shift||av.which==at.esc||av.which==at.alt||av.which==at.ctrl||av.which==at.cmd_ff||av.which==at.cmd_other||av.which==at.cmd_right){return
}if(av.which==at.enter){ac(E.eq(L).find("a").data("name"),av);
av.preventDefault();
av.stopPropagation();
return
}w()
}var aq=TS.utility.isFocusOnInput();
var aw=aq&&(ad[0]===document.activeElement);
var ax=aq&&!aw;
if(ax){if(av.which==at.enter){s();
return
}else{if(av.which==at.semicolon&&av.shiftKey){s();
return
}}}else{if(aw){if(av.which==at.down){var au=ad.getCursorPosition();
var ar=ad.val().length;
if(au==ar){p(av.which,true);
av.preventDefault();
return
}}if(!ad.val()&&TS.utility.isArrowKey(av.which)){p(av.which);
av.preventDefault()
}}if(TS.utility.isArrowKey(av.which)){p(av.which);
av.preventDefault();
return
}}if(aw){if(av.which==at.enter){if(D&&ag){ac(ag,av);
av.preventDefault();
av.stopPropagation()
}return
}}if(av.which==at.esc||av.which==at.tab||(av.which==at.enter&&!av.shiftKey)){s();
av.preventDefault();
return
}if(!aq&&(!TS.client||TS.client.ui.isUserAttentionOnChat())&&!TS.utility.isArrowKey(av.which)&&!TS.utility.isPageKey(av.which)&&!av.metaKey&&!av.ctrlKey&&!av.altKey&&av.which!=at.shift){ad.focus()
}}else{if(av.which==at.esc||av.which==at.enter||av.which==at.tab||(av.which==at.semicolon&&av.shiftKey)){s();
av.preventDefault()
}}};
var k=function(){var ar=10;
var at=H.dimensions_rect();
var aq={top:0+ar,right:$(window).width()-ar,bottom:$(window).height()-(ar+14),left:0+ar};
if(TS.utility.doesRectContainRect(aq,at)){return
}if(at.left<aq.left){H.css("left",parseInt(aq.left))
}else{if(at.right>aq.right){H.css("left",parseInt(Math.max(aq.left,aq.right-H.width())))
}}if(at.top<aq.top){H.css("top",parseInt(aq.top))
}else{if(at.bottom>aq.bottom){H.css("top",parseInt(Math.max(aq.top,aq.bottom-H.height())))
}}};
var s=function(){TS.emoji_menu.is_showing=false;
ak=null;
H.stop().transition({opacity:0},150,function(){H.detach();
C=false
});
m=null;
$("a.emo_menu").removeClass("active");
al=ap;
$(window).unbind("resize",k);
$(window.document).unbind("keydown",ai);
$("html").unbind("mousedown",c)
};
var c=function(aq){if($(aq.target).closest("#emoji_menu").length===0&&$(aq.target).closest("#message-form").length===0){s()
}};
var U=function(aq){var ar=$(this).data("icon");
ac(ar,aq)
};
var o=function(aq){r=null;
K()
};
var M=function(au){var ar=$(this);
var aq=ar.data("name");
var at=ar.data("names");
if(TS.boot_data.feature_reactions){h(ar);
r=ar.parent();
if(window.hover_rxns&&au.shiftKey&&m){m(aq)
}}K(aq,at)
};
var h=function(aq){aq.removeClass(n.join(" "));
var ar;
while(!ar||ar==u){ar=TS.utility.randomFromArray(n)
}aq.addClass(ar);
u=ar
};
var x=function(aq){v($(this))
};
var v=function(at){TS.emoji_menu.active_emoji_group=at.data("group-name");
if(TS.boot_data.feature_reactions){if(TS.emoji_menu.is_dirty){aa()
}else{ae()
}var aq=I[TS.emoji_menu.active_emoji_group];
if(aq){var ar=(aq.index===0)?0:aq.vis.top;
ao(ar)
}}else{if(B&&TS.emoji_menu.active_emoji_group=="mine"){aa()
}$(".emoji_ul").addClass("hidden");
$("#emoji_ul_"+TS.emoji_menu.active_emoji_group).removeClass("hidden");
y.data("monkeyScroll").updateFunc()
}$(".emoji_grouping_tab").removeClass("active");
at.addClass("active")
};
var ao=function(aq){var ar=Math.abs(aq-y.scrollTop());
var at=100*(ar/300);
y.stop().animate({scrollTop:aq},at)
};
var u;
var n=["green","yellow","blue","pink"]
})();
(function(){TS.registerModule("menu",{$menu:null,$menu_header:null,$menu_items:null,$menu_footer:null,menu_lazy_load:null,channel:null,member:null,end_tim:0,$target_element:null,members_html_cache:null,large_list_trigger:1500,large_dom_trigger:500,watching_members_model:false,onStart:function(){if(TS.client){$("#client-ui").append(TS.templates.menu())
}else{$("body").append(TS.templates.menu())
}var d=TS.menu.$menu=$("#menu");
if(TS.boot_data.app!="mobile"&&TS.qs_args.new_scroll!="0"){var c=TS.qs_args.debug_scroll=="1";
d.find("#menu_items_scroller").monkeyScroll({debug:c})
}TS.menu.$menu_header=d.find("#menu_header");
TS.menu.$menu_items=d.find("#menu_items");
TS.menu.$menu_footer=d.find("#menu_footer");
d.detach()
},startWithChannel:function(i,d){if(TS.menu.isRedundantClick(i)){return
}if(TS.client.ui.checkForEditing(i)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
TS.menu.channel=TS.channels.getChannelById(d);
var h=TS.menu.channel;
var g=TS.boot_data.feature_email_ingestion&&TS.model.team.prefs.allow_email_ingestion;
TS.menu.$menu.addClass("headless");
TS.menu.$menu_header.addClass("hidden").empty();
var j={channel:h,user:TS.model.user,show_email_item:g};
if(h.purpose.last_set===0&&!TS.model.user.is_ultra_restricted&&h.is_member){j.show_purpose_item=true
}var c=TS.channels.makeMembersWithPreselectsForTemplate(TS.channels.getActiveMembersNotInThisChannelForInviting(d));
if(c.length===0){j.disable_invite=true
}TS.menu.$menu_items.html(TS.templates.menu_channel_items(j));
TS.menu.$menu_footer.html(TS.templates.menu_channel_footer({channel:h,user:TS.model.user,show_topic:h.is_member&&!TS.model.user.is_restricted&&(!h.is_general||TS.members.canUserPostInGeneral())}));
TS.menu.$menu_header.bind("click.menu",TS.menu.onChannelHeaderClick);
TS.menu.$menu_items.on("click.menu","li",TS.menu.onChannelItemClick);
TS.kb_nav.setSubmitItemHandler(TS.menu.onChannelItemClick);
TS.menu.start(i);
var f=TS.utility.keymap;
$("#menu_channel_topic_input").bind("keydown",function(l){var k=$(this);
if(l.which==f.enter&&!l.shiftKey){TS.channels.setTopic(d,$.trim(k.val()));
TS.menu.end()
}});
TS.menu.positionAt($("#active_channel_name .name"),24,47);
if(j.disable_invite){$("#channel_invite_item a").tooltip({title:"Everyone on your team is already in this channel",delay:{show:500,hide:0}})
}},onChannelHeaderClick:function(c){c.preventDefault()
},onChannelItemClick:function(c){var d=$(this).attr("id");
if($(this).hasClass("disabled")){TS.menu.end();
return
}if(d=="channel_join_item"){c.preventDefault();
if(TS.model.archive_view_is_showing&&TS.client.archives.current_model_ob.id==TS.menu.channel.id){TS.channels.join(TS.client.archives.current_model_ob.name)
}else{TS.channels.displayChannel(TS.menu.channel.id)
}}else{if(d=="channel_display_item"){c.preventDefault();
TS.channels.displayChannel(TS.menu.channel.id)
}else{if(d=="channel_close_archived_item"){c.preventDefault();
TS.channels.closeArchivedChannel(TS.menu.channel.id)
}else{if(d=="channel_leave_item"){c.preventDefault();
TS.channels.leave(TS.menu.channel.id)
}else{if(d=="channel_links_item"){}else{if(d=="channel_star_item"){c.preventDefault();
TS.stars.checkForStarClick(c)
}else{if(d=="channel_email_item"){}else{if(d=="channel_advanced_item"){c.preventDefault();
TS.ui.channel_options_dialog.start(TS.menu.channel.id)
}else{if(d=="channel_unarchive_item"){c.preventDefault();
TS.api.call("channels.unarchive",{channel:TS.menu.channel.id},function(f,g,e){if(f){return
}var h='Un-archiving failed with error "'+g.error+'"';
if(g.error=="restricted_action"){h="<p>You don't have permission to un-archive channels.</p><p>Talk to your team owner.</p>"
}setTimeout(TS.generic_dialog.alert,100,h)
})
}else{if(d=="channel_archives_item"){}else{if(d=="channel_rename_item"){c.preventDefault();
TS.ui.channel_create_dialog.start(TS.menu.channel.name,TS.menu.channel)
}else{if(d=="channel_purpose_item"){c.preventDefault();
TS.ui.purpose_dialog.start(TS.menu.channel.name,TS.menu.channel)
}else{if(d=="channel_invite_item"){c.preventDefault();
TS.ui.invite.showInviteMembersFromChannelDialog(TS.menu.channel.id)
}else{if(d=="channel_prefs"){c.preventDefault();
TS.ui.channel_prefs_dialog.start(TS.menu.channel.id)
}else{if(d=="channel_add_service_item"){}else{TS.warn("not sure what to do with clicked element id:"+d);
return
}}}}}}}}}}}}}}}TS.menu.end()
},startWithGroup:function(i,g){if(TS.menu.isRedundantClick(i)){return
}if(TS.client.ui.checkForEditing(i)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var h=TS.menu.group=TS.groups.getGroupById(g);
var f=TS.boot_data.feature_email_ingestion&&TS.model.team.prefs.allow_email_ingestion;
TS.menu.$menu_header.addClass("hidden").empty();
var j={group:h,user:TS.model.user,show_email_item:f};
if(h.purpose.last_set===0&&!TS.model.user.is_ultra_restricted){j.show_purpose_item=true
}var c=TS.channels.makeMembersWithPreselectsForTemplate(TS.groups.getActiveMembersNotInThisGroupForInviting(g));
if(c.length===0){j.disable_invite=true
}if(TS.model.user.is_restricted&&!TS.model.user.is_ultra_restricted&&TS.groups.canLeaveGroup(g)){j.ra_can_leave=true
}TS.menu.$menu_items.html(TS.templates.menu_group_items(j));
TS.menu.$menu_footer.html(TS.templates.menu_group_footer({group:h,user:TS.model.user}));
TS.menu.$menu_header.bind("click.menu",TS.menu.onGroupHeaderClick);
TS.menu.$menu_items.on("click.menu","li",TS.menu.onGroupItemClick);
TS.menu.start(i);
var d=TS.utility.keymap;
$("#menu_group_topic_input").bind("keydown",function(l){var k=$(this);
if(l.which==d.enter&&!l.shiftKey){TS.groups.setTopic(g,$.trim(k.val()));
TS.menu.end()
}});
TS.menu.positionAt($("#active_channel_name .name"),24,53);
if(j.disable_invite){$("#group_invite_item a").tooltip({title:"Everyone on your team is already in this group",delay:{show:500,hide:0}})
}},onGroupHeaderClick:function(c){c.preventDefault()
},onGroupItemClick:function(d){var f=$(this).attr("id");
if($(this).hasClass("disabled")){TS.menu.end();
return
}if(f=="group_display_item"){d.preventDefault();
TS.groups.displayGroup(TS.menu.group.id)
}else{if(f=="group_leave_item"){d.preventDefault();
TS.groups.leave(TS.menu.group.id)
}else{if(f=="group_links_item"){}else{if(f=="group_star_item"){d.preventDefault();
TS.stars.checkForStarClick(d)
}else{if(f=="group_email_item"){}else{if(f=="group_close_item"){d.preventDefault();
TS.groups.closeGroup(TS.menu.group.id)
}else{if(f=="group_leave_and_archive_item"){d.preventDefault();
var c=TS.menu.group;
TS.generic_dialog.start({title:"Leave and archive "+TS.model.group_prefix+c.name,body:"<p>If you archive this group, no one will be able to send any messages in it and it will be closed for anyone who currently has it open. You will still be able to view the archives on the site and you will still be able to search for messages from this group.</p><p>Are you sure you want to archive <b>"+TS.model.group_prefix+c.name+"</b>?</p>",go_button_text:"Yes, leave & archive the group",on_go:function(){TS.api.call("groups.archive",{channel:c.id},function(g,h,e){if(g){TS.groups.closeGroup(c.id);
return
}var i='Archiving failed with error "'+h.error+'"';
if(h.error=="last_ra_channel"){if(TS.model.user.is_admin){i="Sorry, you can't archive this group because it is the only group or channel one of the guest account members belongs to. If you first disable the guest account, you will then be able to archive the group."
}else{i="Sorry, you can't archive this group because it is the only group or channel one of the guest account members belongs to."
}}TS.generic_dialog.alert(i)
})
}})
}else{if(f=="group_unarchive_item"){d.preventDefault();
TS.api.call("groups.unarchive",{channel:TS.menu.group.id})
}else{if(f=="group_archives_item"){}else{if(f=="group_advanced_item"){d.preventDefault();
TS.ui.channel_options_dialog.start(TS.menu.group.id)
}else{if(f=="group_purpose_item"){d.preventDefault();
TS.ui.purpose_dialog.start(TS.menu.group.name,TS.menu.group)
}else{if(f=="group_invite_item"){d.preventDefault();
TS.ui.invite.showInviteMembersFromGroupDialog(TS.menu.group.id)
}else{if(f=="group_prefs"){d.preventDefault();
TS.ui.channel_prefs_dialog.start(TS.menu.group.id)
}else{if(f=="group_add_service_item"){}else{TS.warn("not sure what to do with clicked element id:"+f);
return
}}}}}}}}}}}}}}TS.menu.end()
},startWithGroups:function(g){if(TS.menu.isRedundantClick(g)){return
}if(TS.client.ui.checkForEditing(g)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var h=[];
var d=0;
var f;
for(var c=0;
c<TS.model.groups.length;
c++){f=TS.model.groups[c];
if(f.is_archived){d++;
continue
}if(TS.model.prefs.sidebar_behavior=="hide_read_channels"){if(f.unread_cnt){continue
}h.push(f)
}else{if(TS.model.prefs.sidebar_behavior=="hide_read_channels_unless_starred"){if(f.unread_cnt||f.is_starred){continue
}h.push(f)
}else{h.push(f)
}}}TS.menu.$menu_header.html(TS.templates.menu_groups_header());
TS.menu.$menu_items.html(TS.templates.menu_groups_items({nondisplayed_groups:h,show_archived_item:d,user:TS.model.user}));
TS.menu.$menu_items.on("click.menu","li",TS.menu.onGroupsItemClick);
TS.menu.start(g)
},onGroupsItemClick:function(d){var f=$(this).attr("id");
if(f=="new_group_item"){TS.menu.onNewGroupClick(d)
}else{if(f=="groups_archives_item"){}else{if(f=="about_groups_item"){d.preventDefault();
TS.tip_card.start({tip:TS.tips.getTipById("about_groups_tip_card")})
}else{d.preventDefault();
var c=$(this).data("group-id");
if(c){TS.groups.displayGroup(c)
}}}}TS.menu.end()
},onNewGroupClick:function(c){c.preventDefault();
TS.ui.group_create_dialog.start();
TS.menu.end()
},reported_no_file_reader:false,startWithNewFileOptions:function(f,d){if(TS.menu.isRedundantClick(f)){return
}if(TS.client.ui.checkForEditing(f)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
TS.menu.$menu.addClass("headless footless");
TS.menu.$menu_header.addClass("hidden").empty();
var c=[];
if(window.File){c.push('<li data-which="choose" class="file_menu_item"><a><i class="file_menu_icon file"></i> Upload a file</a></li>')
}else{if(!TS.menu.reported_no_file_reader){TS.menu.reported_no_file_reader=true;
TS.logError({message:"TS.menu: No File support?"},"navigator.userAgent: "+navigator.userAgent)
}}if(TS.boot_data.feature_email_ingestion&&TS.model.team.prefs.allow_email_ingestion){c.push('<li data-which="email" class="file_menu_item"><a target="_blank" href="/account/settings"><i class="file_menu_icon email"></i> Import an email</a></li>')
}c.push('<li data-which="snippet" class="file_menu_item"><a target="_blank" href="/files/create/snippet"><i class="file_menu_icon snippet"></i> Create a text snippet</a></li>');
if(TS.boot_data.feature_spaces){c.push('<li data-which="space" class="file_menu_item"><a target="_blank" href="/files/create/space"><i class="file_menu_icon space"></i> Create a Space</a></li>')
}if(!TS.boot_data.feature_spaces_api_migration){c.push('<li data-which="post" class="file_menu_item"><a target="_blank" href="/files/create/post"><i class="file_menu_icon post"></i> Create a post</a></li>')
}if(TS.boot_data.feature_box_plugin&&TS.utility.box.isBrowserSupported()&&TS.model.prefs.box_enabled){c.push('<li data-which="box" class="file_menu_item"><a><i class="file_menu_icon box_menu_icon"></i> Import from Box</a></li>')
}if(window.Dropbox&&Dropbox.isBrowserSupported()&&TS.model.prefs.dropbox_enabled){c.push('<li data-which="dropbox" class="file_menu_item"><a><i class="file_menu_icon dropbox"></i> Import from Dropbox</a></li>')
}TS.menu.$menu_items.html(c.join("\n"));
TS.menu.$menu_items.on("click.menu","li",TS.menu.onNewFileOptionsItemClick);
TS.kb_nav.setSubmitItemHandler(TS.menu.onNewFileOptionsItemClick);
TS.menu.start(f);
if(d.attr("id")=="primary_file_button"){if(TS.boot_data.feature_msg_input_revisions){TS.menu.positionAt(d,1,-(TS.menu.$menu.height()+6))
}else{TS.menu.positionAt(d,1,-(TS.menu.$menu.height()+2))
}}else{TS.menu.positionAt(d,d.width()-TS.menu.$menu.width(),d.outerHeight()+10)
}},onNewFileOptionsItemClick:function(c){var f=$(this).data("which");
if(f=="choose"){c.preventDefault();
$("#file-upload").trigger("click")
}else{if(f=="email"){}else{if(f=="snippet"){c.preventDefault();
TS.client.ui.startSnippetFromChatInput()
}else{if(f=="post"){}else{if(f=="box"){c.preventDefault();
TS.files.openBoxChooser()
}else{if(f=="dropbox"){c.preventDefault();
TS.files.openDropboxChooser()
}else{if(f=="space"&&TS.boot_data.feature_spaces){c.preventDefault();
var d=(c&&((c.ctrlKey&&!TS.model.is_mac)||(c.metaKey&&TS.model.is_mac)));
TS.files.createAndOpenNewSpace(null,d)
}else{c.preventDefault();
TS.warn("not sure what to do with clicked element:"+f)
}}}}}}}TS.menu.end()
},startWithMember:function(j,g,i,k,d){if(TS.menu.isRedundantClick(j)){return
}if(TS.client.ui.checkForEditing(j)){return
}if(TS.model.menu_is_showing){return
}var f=TS.menu.member=TS.members.getMemberById(g);
if(!f){return
}if(!TS.members.canUserSeeMember(f)){return
}var m=TS.boot_data.feature_email_ingestion&&TS.model.team.prefs.allow_email_ingestion;
TS.menu.clean();
var l={member:f,show_dm_item:!d,show_hide_messages_item:TS.boot_data.feature_user_hidden_msgs&&TS.model.user_hiddens.indexOf(f.id)==-1,show_unhide_messages_item:TS.boot_data.feature_user_hidden_msgs&&TS.model.user_hiddens.indexOf(f.id)>-1,show_email_item:m};
if(d){TS.menu.$menu_header.addClass("hidden").empty();
l.im=TS.ims.getImByMemberId(g)
}else{TS.menu.$menu_header.html(TS.templates.menu_member_header(l))
}if(k&&g==TS.model.user.id){l.other_accounts=TS.boot_data.other_accounts;
l.logout_url=TS.boot_data.logout_url;
l.signin_url=TS.boot_data.signin_url
}if(!f.deleted&&!f.is_slackbot&&g!=TS.model.user.id){if(!TS.model.user.is_ultra_restricted&&!f.is_ultra_restricted){var n=TS.members.getMyChannelsThatThisMemberIsNotIn(g);
if(n.length){l.show_channel_invite=true
}l.show_group_create=true;
if(TS.model.allow_invite_to_group_from_person){l.show_group_invite=true
}}}var c=TS.shared.getActiveModelOb();
if(TS.model.active_channel_id||TS.model.active_group_id){if((!c.is_general||f.is_restricted)&&g!=TS.model.user.id&&c.members&&c.members.indexOf(g)!=-1){if(!f.is_ultra_restricted){if((c.is_group&&TS.members.canUserKickFromGroups())||(c.is_channel&&TS.members.canUserKickFromChannels())){l.channel_kick_name=(TS.model.active_channel_id?"#":"")+c.name
}}}}if(g=="USLACKBOT"){var o=false;
if(TS.model.user.is_admin){o=true
}else{if(!TS.model.team.prefs.slackbot_responses_disabled&&!TS.model.team.prefs.slackbot_responses_only_admins){o=true
}}l.show_slackbot_responses_item=o
}TS.menu.$menu_items.html(TS.templates.menu_member_items(l));
if(g==TS.model.user.id){TS.menu.$menu_footer.html(TS.templates.menu_user_footer({user:f}));
TS.menu.$menu.addClass("footless")
}else{if(!d){TS.menu.$menu_footer.html(TS.templates.menu_member_footer({member:f}))
}}TS.menu.start(j,i);
var h=TS.utility.keymap;
$("#menu_member_dm_input").bind("keydown",function(q){var p=$(this);
if(q.which==h.enter&&!q.shiftKey){if($.trim(p.val())!==""){q.preventDefault();
TS.ims.startImByMemberId(f.id,false,p.val());
TS.menu.end()
}}});
TS.menu.$menu_header.bind("click.menu",TS.menu.onMemberHeaderClick);
TS.menu.$menu_items.on("click.menu","li",TS.menu.onMemberItemClick);
TS.kb_nav.setSubmitItemHandler(TS.menu.onMemberItemClick);
if(d){TS.menu.positionAt($("#active_channel_name .name"),24,47)
}$("#menu_user_status_input").select();
TS.menu.keepInBounds()
},onMemberHeaderClick:function(c){c.preventDefault();
TS.client.ui.previewMember(TS.menu.member.id);
TS.menu.end()
},onMemberItemClick:function(f){var g=$(this).attr("id");
clearTimeout(TS.menu.end_time);
if(g=="member_photo_item"){}else{if(g=="member_archives_item"){}else{if(g=="member_links_item"){}else{if(g=="member_star_item"){f.preventDefault();
TS.stars.checkForStarClick(f)
}else{if(g=="member_email_item"){}else{if(g=="member_skype_item"){}else{if(g=="member_account_item"){}else{if(g=="member_prefs_item"){f.preventDefault();
TS.ui.prefs_dialog.start()
}else{if(g=="member_files_item"){f.preventDefault();
TS.view.fileClearFilter();
TS.client.ui.filterFileList(TS.menu.member.id)
}else{if(g=="member_dm_item"){f.preventDefault();
TS.ims.startImByMemberId(TS.menu.member.id)
}else{if(g=="member_invite_channel_item"){f.preventDefault();
TS.ui.invite.showInviteMemberToChannelDialog(TS.menu.member.id)
}else{if(g=="member_invite_group_item"){f.preventDefault();
TS.ui.invite.showInviteMemberToGroupDialog(TS.menu.member.id)
}else{if(g=="member_create_group_item"){f.preventDefault();
TS.ui.group_create_dialog.startWithMember(TS.menu.member.id)
}else{if(g=="member_profile_item"){f.preventDefault();
TS.client.ui.previewMember(TS.menu.member.id)
}else{if(g=="member_presence"){f.preventDefault();
TS.members.toggleUserPresence();
TS.menu.end_time=setTimeout(function(){TS.menu.end()
},1000);
return
}else{if(g=="logout"){f.preventDefault();
TS.utility.loadUrlInWindowIfOnline(TS.boot_data.logout_url)
}else{if($(this).hasClass("switch_team")){f.preventDefault();
var d=$(this).data("team-id");
if(TSSSB.call("displayTeam",d)){f.preventDefault()
}else{var c=$(this).find("a").attr("href");
if(c&&c.indexOf("?")==-1){$(this).find("a").attr("href",c+="?"+TS.appendQSArgsToUrl())
}}}else{if(g=="member_kick_channel_item"){f.preventDefault();
if(TS.model.active_channel_id){TS.channels.kickMember(TS.model.active_channel_id,TS.menu.member.id)
}else{if(TS.model.active_group_id){TS.groups.kickMember(TS.model.active_group_id,TS.menu.member.id)
}}}else{if(g=="member_hide_messages_item"){TS.utility.msgs.hideMessagesFrom(TS.menu.member.id)
}else{if(g=="member_unhide_messages_item"){TS.utility.msgs.unHideMessagesFrom(TS.menu.member.id)
}else{if(g=="member_slackbot_responses"){}else{if(g=="member_open_profile_item"){}else{f.preventDefault();
TS.warn("not sure what to do with clicked element id:"+g);
return
}}}}}}}}}}}}}}}}}}}}}}TS.menu.end()
},startWithMemberPreview:function(i,f,g,c){if(TS.menu.isRedundantClick(i)){return
}if(TS.client&&TS.client.ui.checkForEditing(i)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var m=$(i.target).closest(".member_preview_menu_target");
if(!f){f=m.closest("[data-member-id]").data("member-id")
}var d=TS.menu.member=TS.members.getMemberById(f);
var k=TS.ims.getImByMemberId(f);
var j={member:d,is_team_directory:true,im_id:k&&k.id,hide_view_profile:c};
TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu.addClass("headless footless").css("min-width",245);
if(!d.deleted&&!d.is_slackbot&&f!=TS.model.user.id){if(!TS.model.user.is_ultra_restricted&&!d.is_ultra_restricted){var l=TS.members.getMyChannelsThatThisMemberIsNotIn(f);
if(l.length){j.show_channel_invite=true
}j.show_group_create=true;
if(TS.model.allow_invite_to_group_from_person){j.show_group_invite=true
}}}if(g){TS.menu.$menu_items.html(TS.templates.menu_member_items_short(j))
}else{TS.menu.$menu_items.html(TS.templates.menu_member_items(j));
TS.menu.$menu_items.on("click.menu","li",TS.menu.onMemberItemClick)
}TS.menu.start(i);
TS.kb_nav.setSubmitItemHandler(TS.menu.onMemberItemClick);
var h=0;
if(!d.is_self||TS.web){h=m.outerWidth()-TS.menu.$menu.width()-1
}TS.menu.positionAt(m,h,m.outerHeight()+5);
TS.menu.keepInBounds()
},startWithMembers:function(g){if(TS.menu.isRedundantClick(g)){return
}if(TS.client.ui.checkForEditing(g)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var c=false;
var d=TS.members.getActiveMembersWithSlackbotAndNotSelf();
if(d.length>5){c=true
}var f=false;
if(TS.menu.large_list_trigger>0&&d.length>TS.menu.large_list_trigger){f=true
}TS.menu.$menu_header.html(TS.templates.menu_members_header({show_filter:c,large_team:f}));
if(f){TS.menu.$menu_items.hide();
TS.menu.$menu_header.find(".show_all").one("click",function(j){TS.menu.large_list_trigger=0;
$("#dms_filter_show_all").remove();
TS.menu.$menu_items.show();
var k=$("#dms_filter").find(".member_filter");
var h=k.val();
k.focus();
if(h&&h.length){k.val("");
k.trigger("update-team-filter")
}else{var i=TS.menu.$menu.find("#menu_items_scroller").data("monkeyScroll");
if(i){i.updateFunc(true)
}TS.menu.$menu_items.trigger("scroll.lazyload")
}TS.menu.keepInBounds();
j.preventDefault();
return false
})
}else{TS.menu.$menu_items.show()
}if(!TS.menu.members_html_cache){TS.menu.members_html_cache=TS.templates.menu_members_items({members:d})
}TS.menu.$menu_items.html(TS.menu.members_html_cache);
TS.menu.$menu_footer.html(TS.templates.menu_members_footer());
TS.menu.$menu_items.on("click.menu","li",TS.menu.onMembersItemClick);
TS.menu.start(g);
$("#about_dms_link").on("click",function(h){h.preventDefault();
TS.menu.end();
TS.tip_card.start({tip:TS.tips.getTipById("about_dms_tip_card")})
});
if(c){TS.members.view.bindTeamFilter("#dms_filter","#menu_items_scroller");
$("#dms_filter").find(".member_filter").focus();
TS.members.view.team_filter_changed_sig.add(TS.kb_nav.clearHighlightedItem,TS.kb_nav);
TS.members.view.team_filter_changed_sig.add(TS.menu.filterChanged,TS.menu);
if(!TS.menu.watching_members_model){TS.members.members_for_user_changed_sig.add(TS.menu.membersModelChanged,TS.menu);
TS.members.changed_name_sig.add(TS.menu.membersModelChanged,TS.menu);
TS.members.changed_deleted_sig.add(TS.menu.membersModelChanged,TS.menu);
TS.members.presence_changed_sig.add(TS.menu.membersModelChanged,TS.menu);
TS.menu.watching_members_model=true
}TS.kb_nav.setAllowHighlightWithoutBlurringInput(true)
}},menu_items_hidden:true,filterChanged:function(c,d){if(!TS.menu.$menu_items){return
}if(TS.menu.large_list_trigger>0&&(!c||!c.length)){if(!TS.menu.menu_items_hidden){TS.menu.$menu_items.hide();
TS.menu.menu_items_hidden=true
}}else{if(TS.menu.menu_items_hidden){TS.menu.$menu_items.show();
TS.menu.menu_items_hidden=false
}}TS.menu.keepInBounds()
},membersModelChanged:function(){TS.menu.members_html_cache=null;
if(!TS.model.menu_is_showing||!$("#menu_items .dm_list_item").length){TS.members.members_for_user_changed_sig.remove(TS.menu.membersModelChanged,TS.menu);
TS.members.changed_name_sig.remove(TS.menu.membersModelChanged,TS.menu);
TS.members.changed_deleted_sig.remove(TS.menu.membersModelChanged,TS.menu);
TS.members.presence_changed_sig.remove(TS.menu.membersModelChanged,TS.menu);
TS.menu.watching_members_model=false;
return
}TS.menu.members_html_cache=TS.templates.menu_members_items({members:TS.members.getActiveMembersWithSlackbotAndNotSelf()});
if(TS.menu.menu_lazy_load&&TS.menu.menu_lazy_load.detachEvents){TS.menu.menu_lazy_load.detachEvents()
}TS.menu.$menu_items.html(TS.menu.members_html_cache);
TS.menu.menu_lazy_load=TS.menu.$menu_items.find(".lazy").lazyload({container:$("#menu_items_scroller"),all_images_same_size:true,throttle:250})
},onMembersItemClick:function(d){d.preventDefault();
var c=$(this).data("member-id");
if(c){TS.ims.startImByMemberId(c)
}TS.menu.end()
},startWithFileFilter:function(g,c){if(TS.menu.isRedundantClick(g)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
TS.menu.$menu.addClass("headless footless no_min_width");
var f="all";
if(TS.model.file_list_types){f=TS.model.file_list_types[0]
}var d=TS.boot_data.feature_email_integration||(TS.boot_data.feature_email_ingestion&&TS.model.team.prefs.allow_email_ingestion);
TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu_items.html(TS.templates.menu_file_filter_items({active_type:f,show_email_item:d}));
if(c){TS.menu.$menu_items.on("click.menu","li",TS.menu.onSearchFileFilterItemClick)
}else{TS.menu.$menu_items.on("click.menu","li",TS.menu.onFileFilterItemClick)
}TS.menu.start(g);
if(c){TS.menu.positionAt($("#search_results_container"),8,74)
}else{TS.menu.positionAt($("#file_list_container"),8,44)
}},onFileFilterItemClick:function(c){c.preventDefault();
TS.client.ui.filterFileList($(this).data("filetype"));
TS.view.fileSetButtonState($(this).data("filetype"));
TS.menu.end()
},onSearchFileFilterItemClick:function(c){c.preventDefault();
TS.search.setFiletypeFilter($(this).data("filetype"));
TS.view.fileSetButtonState($(this).data("filetype"));
TS.menu.end()
},startWithFileMemberFilter:function(m,l){var k,g,h,d,f,c;
if(TS.menu.isRedundantClick(m)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
c=TS.menu.$menu;
TS.menu.$menu.addClass("footless no_min_width");
TS.menu.$menu_header.html(TS.templates.menu_file_member_header());
h=TS.members.getMembersForUser();
d=[];
f=[];
if(TS.boot_data.feature_bot_users){for(k=0,g=h.length;
k<g;
k++){if(h[k].is_bot||h[k].is_slackbot){f.push(h[k])
}else{d.push(h[k])
}}h=d.concat(f)
}TS.menu.$menu_items.html(TS.templates.menu_file_member_filter_items({members:h}));
if(l){TS.menu.$menu_items.on("click.menu","li",TS.menu.onSearchFileMemberFilterItemClick)
}else{TS.menu.$menu_items.on("click.menu","li",TS.menu.onFileMemberFilterItemClick)
}TS.menu.start(m);
if(l){TS.menu.positionAt($("#search_results_container"),102,100)
}else{var n=$("#file_list_toggle_user");
TS.menu.positionAt($("#file_list_toggle_user"),0,n.outerHeight())
}TS.members.view.bindTeamFilter("#file_member_filter","#menu_items_scroller");
$("#file_member_filter").find(".member_filter").focus().keydown(function(i){if(i.which==TS.utility.keymap.enter){var j=$("#menu_items .member_item.active");
if(j.length==1){j.find("a").click()
}}});
TS.members.view.team_filter_changed_sig.add(TS.kb_nav.clearHighlightedItem,TS.kb_nav);
TS.kb_nav.setAllowHighlightWithoutBlurringInput(true)
},onFileMemberFilterItemClick:function(c){c.preventDefault();
var d=$(this).data("member-id");
TS.client.ui.toggleFileList(d);
TS.menu.end()
},onSearchFileMemberFilterItemClick:function(c){c.preventDefault();
var d=$(this).data("member-id");
TS.search.setMember(d);
TS.menu.end()
},startWithMessageActions:function(h,l,k){if(TS.client&&!TS.model.ms_connected){TS.sounds.play("beep");
return
}if(TS.menu.isRedundantClick(h)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
TS.menu.$menu.addClass("headless footless");
var c=TS.utility.msgs.getMsg(l,k);
TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu_items.html(TS.templates.menu_message_action_items({msg:c,actions:TS.utility.msgs.getMsgActions(c),model_ob:TS.shared.getActiveModelOb()}));
TS.menu.$menu.addClass("no_min_width");
TS.menu.$menu_items.on("click.menu","li",TS.menu.onMessageActionClick);
TS.menu.start(h);
var m=$(h.target);
var d=0;
var f=m.width()+10;
if(TS.client&&!TS.model.ui_state.flex_visible){f=-(TS.menu.$menu.width()+10)
}var g=TS.menu.$menu.find("#edit_link");
if(g.length===0){g=TS.menu.$menu.find("#rxn_link")
}if(g.length>0){var j=TS.menu.$menu.offset().top;
var i=g.offset().top;
d=-(i-j+(g.height()/2)-5)
}TS.menu.positionAt(m,f,d);
TS.menu.keepInBounds()
},onMessageActionClick:function(f){f.preventDefault();
var h=$(this).attr("id");
var g=$(this).data("msg-ts");
var c=$(this).data("rxn-key");
var d=TS.shared.getActiveModelOb();
if(h=="edit_link"){TS.msg_edit.startEdit(g,d)
}else{if(h=="delete_link"){TS.msg_edit.startDelete(g,d)
}else{if(h==="pin_link"){TS.pins.pinMessage(g,d)
}else{if(h==="unpin_link"){TS.pins.unPinMessage(g,d)
}else{if(h==="rxn_link"){TS.emoji_menu.startEmoForRxn(f,c,function(i){var e=true;
TS.rxns.changeRxnsFromUserAction(c,i.replace(/:/g,""),e)
})
}}}}}TS.menu.end()
},startWithCommentActions:function(h,g,f){if(TS.client&&!TS.model.ms_connected){TS.sounds.play("beep");
return
}if(TS.menu.isRedundantClick(h)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var d=TS.files.getFileById(g);
if(!d){return
}var j=TS.files.getFileCommentById(d,f);
if(!j){return
}var c=TS.shared.getActiveModelOb();
var i=TS.files.getFileCommentActions(j,d);
TS.menu.$menu.addClass("headless footless");
TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu_items.html(TS.templates.menu_comment_action_items({model_ob:c,file:d,comment:j,actions:i}));
TS.menu.$menu.addClass("no_min_width");
TS.menu.$menu_items.on("click.menu","li",TS.menu.onCommentActionClick);
TS.menu.start(h)
},onCommentActionClick:function(f){f.preventDefault();
var g=$(this).attr("id");
var c=$(this).data("rxn-key");
var d=TS.shared.getActiveModelOb();
if(g=="edit_file_comment"){f.preventDefault();
TS.comments.ui.startEdit($(this).data("file-id"),$(this).data("comment-id"))
}else{if(g=="delete_file_comment"){f.preventDefault();
TS.comments.ui.startDelete($(this).data("file-id"),$(this).data("comment-id"))
}else{if(g=="rxn_file_comment"){f.preventDefault();
TS.emoji_menu.startEmoForRxn(f,c,function(h){var e=true;
TS.rxns.changeRxnsFromUserAction(c,h.replace(/:/g,""),e)
})
}else{if(g=="pin_comment"&&d){f.preventDefault();
TS.pins.pinFileComment($(this).data("comment-id"),$(this).data("file-id"),d)
}else{if(g=="unpin_comment"&&d){f.preventDefault();
TS.pins.unPinFileComment($(this).data("comment-id"),$(this).data("file-id"),d)
}else{f.preventDefault();
TS.warn("not sure what to do with clicked element id:"+g);
return
}}}}}TS.menu.end()
},file_list_menu_up:false,startWithFileActions:function(i,g){if(TS.client&&!TS.model.ms_connected){TS.sounds.play("beep");
return
}if(TS.menu.isRedundantClick(i)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var d=TS.files.getFileById(g);
if(!d){return
}TS.menu.$menu.addClass("headless footless");
var k=TS.files.getFileActions(d);
var f=$(i.target).closest(".file_actions");
if(k.comment&&f.data("exclude-comment")){k.comment=false
}if(k.download&&f.data("exclude-download")){k.download=false
}if(k.open_original&&f.data("exclude-original")){k.open_original=false
}var j=$(i.target).closest(".file_list_item").length>0;
if(j){k.share=false;
TS.menu.file_list_menu_up=true
}var h=$(i.target).closest(".inline_file_preview_container").length>0;
if(h){$(i.target).closest(".inline_file_preview_container").addClass("file_menu_open")
}TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu_items.html(TS.templates.menu_file_action_items({file:d,actions:k,is_refreshing:TS.files.waiting_for_refresh[d.id],model_ob:TS.shared.getActiveModelOb()}));
if(TS.boot_data.feature_fix_files){TS.menu.$menu.addClass("no_icons")
}if(TS.web){TS.menu.$menu_items.on("click.menu","li",TS.menu.onFileActionClickWeb)
}else{if(TS.client){TS.menu.$menu_items.on("click.menu","li",TS.menu.onFileActionClickClient)
}}TS.menu.start(i);
var c=$(i.target);
c.closest(".file_list_item").addClass("active");
TS.menu.positionAt(c,-(TS.menu.$menu.width()+6),0);
TS.menu.keepInBounds()
},onFileActionClickClient:function(g){var h=$(this).attr("id");
var c=$(this).data("rxn-key");
var f=TS.files.getFileById($(this).data("file-id"));
var d=TS.shared.getActiveModelOb();
if(!f){TS.error("no file id:"+$(this).data("file-id"));
return
}if(h=="share_file"){g.preventDefault();
TS.view.shareFileInCurrentChannelOrIM(f.id)
}else{if(h=="edit_file_snippet"){g.preventDefault();
TS.ui.snippet_dialog.startEdit(f.id)
}else{if(h=="edit_file_post"){}else{if(h=="edit_file_title"){g.preventDefault();
if(TS.model.previewed_file_id!=f.id){TS.client.ui.previewFile(f.id,"file_list")
}TS.files.editFileTitle(f.id)
}else{if(h=="delete_file"){g.preventDefault();
TS.view.deleteFile(f.id)
}else{if(h=="create_public_link"){g.preventDefault();
if(TS.model.team.prefs.disallow_public_file_urls){TS.generic_dialog.alert("An administator has disabled public file URL creation. You will not be able to create a public URL for this file.");
return
}TS.files.createPublicURL(f,function(i,j,e){if(i){if(TS.model.previewed_file_id){$("#file_preview_scroller").find(".file_actions_link").scrollintoview({duration:500,offset:"top",px_offset:-50})
}$(".file_public_link_"+f.id).highlightText()
}})
}else{if(h=="revoke_public_link"){g.preventDefault();
TS.client.ui.fileRevokePublicLink(f.id)
}else{if(h=="refresh_file"){g.preventDefault();
TS.files.refreshFile(f.id);
TS.menu.$menu.find("#refresh_file").find(".item_label").text("Refreshing...").end().find("i").addClass("ts_icon_spin");
return
}else{if(h=="download_file"){}else{if(h=="open_original_file"){}else{if(h=="comment_file"){g.preventDefault();
if(TS.model.previewed_file_id!=f.id){TS.client.ui.previewFile(f.id,"file_list",false,true)
}else{$("#file_comment").focus()
}}else{if(h=="save_to_dropbox"){return Dropbox.save(f.url_download,f.name)
}else{if(h==="rxn_file"){g.preventDefault();
TS.emoji_menu.startEmoForRxn(g,c,function(i){var e=true;
TS.rxns.changeRxnsFromUserAction(c,i.replace(/:/g,""),e)
})
}else{if(h==="pin_file"&&d){g.preventDefault();
TS.pins.pinFile(f.id,d)
}else{if(h==="unpin_file"&&d){g.preventDefault();
TS.pins.unPinFile(f.id,d)
}else{g.preventDefault();
TS.warn("not sure what to do with clicked element id:"+h);
return
}}}}}}}}}}}}}}}TS.menu.end()
},onFileActionClickWeb:function(g){var h=$(this).attr("id");
var c=$(this).data("rxn-key");
var f=TS.files.getFileById($(this).data("file-id"));
var d=TS.shared.getActiveModelOb();
if(!f){TS.error("no file id:"+$(this).data("file-id"));
return
}if(h=="share_file"){g.preventDefault();
TS.ui.share_dialog.start(f.id)
}else{if(h=="edit_file_snippet"){}else{if(h=="edit_file_post"){}else{if(h=="edit_file_title"){}else{if(h=="delete_file"){g.preventDefault();
TS.web.file.deleteFile(f.id)
}else{if(h=="create_public_link"){g.preventDefault();
if(!TS.model.team.prefs.disallow_public_file_urls){TS.api.callImmediately("files.sharedPublicURL",{file:f.id},function(i,j,e){if(i){$(".file_public_link_shared").slideToggle(100);
TS.files.upsertAndSignal({id:f.id,public_url_shared:true})
}else{if(j.error&&j.error==="not_allowed"){TS.model.team.prefs.disallow_public_file_urls=true;
TS.generic_dialog.alert("An administator has disabled public file URL creation. You will not be able to create a public URL for this file.")
}}})
}}else{if(h=="revoke_public_link"){g.preventDefault();
TS.web.file.revokePublicURL(f)
}else{if(h=="refresh_file"){g.preventDefault();
TS.files.refreshFile(f.id);
TS.menu.$menu.find("#refresh_file").find(".item_label").text("Refreshing...").end().find("i").addClass("ts_icon_spin");
return
}else{if(h=="download_file"){}else{if(h=="print_file"){window.print();
g.preventDefault()
}else{if(h=="open_original_file"){}else{if(h=="comment_file"){g.preventDefault();
$("#file_comment").focus()
}else{if(h=="save_to_dropbox"){return Dropbox.save(f.url_download,f.name)
}else{if(h==="rxn_file"){g.preventDefault();
TS.emoji_menu.startEmoForRxn(g,c,function(i){var e=true;
TS.rxns.changeRxnsFromUserAction(c,i.replace(/:/g,""),e)
})
}else{if(h==="pin_file"&&d){g.preventDefault();
TS.pins.pinFile(f.id,d)
}else{if(h==="unpin_file"&&d){g.preventDefault();
TS.pins.unPinFile(f.id,d)
}else{g.preventDefault();
TS.warn("not sure what to do with clicked element id:"+h);
return
}}}}}}}}}}}}}}}}TS.menu.end()
},startWithSpaceWeb:function(i,h){if(TS.menu.isRedundantClick(i)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var g=TS.files.getFileById(h);
if(!g){return
}var k=TS.files.getFileActions(g);
var j={file:g,actions:k};
TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu_items.html(TS.templates.menu_space_action_items(j));
TS.menu.$menu_items.on("click.menu","li",TS.menu.onSpaceClickWeb);
TS.kb_nav.setSubmitItemHandler(TS.menu.onSpaceClickWeb);
TS.menu.start(i);
var f=$("#space_btn_more");
var d=-TS.menu.$menu.width()+f.width();
var c=$("header").height();
TS.menu.positionAt(f,d,c)
},onSpaceClickWeb:function(d){var f=$(this).attr("id");
var c=TS.files.getFileById($(this).data("file-id"));
if(!c){return
}if(f=="keyboard_shortcuts"){d.preventDefault();
TS.ui.shortcuts_dialog.start(true)
}else{if(f=="delete_space"){d.preventDefault();
TS.web.file.deleteFile(c.id)
}else{if(f=="create_public_space_link"||f=="view_public_space_link"){d.preventDefault();
TS.files.createPublicURL(c)
}else{if(f=="print_space"){window.print();
d.preventDefault()
}else{d.preventDefault();
TS.warn("not sure what to do with clicked element id:"+f);
return
}}}}TS.menu.end()
},startWithTeamAndUser:function(d){if(TS.menu.isRedundantClick(d)){return
}if(TS.client.ui.checkForEditing(d)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var c=true;
var f={user:TS.model.user,team_name:TS.model.team.name,logout_url:TS.boot_data.logout_url,signin_url:TS.boot_data.signin_url,help_url:TS.boot_data.help_url,show_invite_item:c};
if(Object.keys(TS.boot_data.other_accounts).length){f.other_accounts=TS.boot_data.other_accounts
}TS.menu.$menu.addClass("headless footless combined_menu");
TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu_items.html(TS.templates.menu_team_and_user_items(f));
TS.menu.$menu_items.on("click.menu","li",TS.menu.onTeamAndUserItemClick);
TS.menu.$menu_items.on("mouseenter.section_header","> div.section_header",TS.kb_nav.clearHighlightedItem);
TS.kb_nav.setSubmitItemHandler(TS.menu.onTeamAndUserItemClick);
TS.menu.start(d);
TS.menu.positionAt($("#team_menu"),150,49);
TS.view.setFlexMenuSize()
},onTeamAndUserItemClick:function(g){clearTimeout(TS.menu.end_time);
var c=$(this).attr("id");
if(!c&&$(this).hasClass("switch_team")){c="switch_team"
}switch(c){case"member_account_item":case"team_settings":case"team_invitations":case"team_services":case"team_customize":case"team_apps":break;
case"member_prefs_item":g.preventDefault();
TS.ui.prefs_dialog.start();
break;
case"team_help":g.preventDefault();
TS.help_dialog.start();
break;
case"team_home":g.preventDefault();
TS.client.ui.showTeamList();
break;
case"add_team":if(TSSSB.call("signInTeam")){g.preventDefault()
}break;
case"member_presence":g.preventDefault();
TS.members.toggleUserPresence();
TS.menu.end_time=setTimeout(TS.menu.end,1000);
return;
case"logout":g.preventDefault();
TS.utility.loadUrlInWindowIfOnline(TS.boot_data.logout_url);
break;
case"switch_team":var f=$(this).data("user-id");
if(TSSSB.call("displayTeam",f)){g.preventDefault()
}else{var d=$(this).find("a").attr("href");
if(d&&d.indexOf("?")==-1){$(this).find("a").attr("href",[d,TS.appendQSArgsToUrl()].join("?"))
}}break;
default:g.preventDefault();
return
}TS.menu.end()
},startWithTeam:function(d){if(TS.menu.isRedundantClick(d)){return
}if(TS.client.ui.checkForEditing(d)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var c=true;
var f={user:TS.model.user,team_name:TS.model.team.name,logout_url:TS.boot_data.logout_url,signin_url:TS.boot_data.signin_url,help_url:TS.boot_data.help_url,show_invite_item:c};
if(Object.keys(TS.boot_data.other_accounts).length){f.other_accounts=TS.boot_data.other_accounts
}TS.menu.$menu.addClass("headless footless").css("max-height",500);
TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu_items.html(TS.templates.menu_team_items(f));
TS.menu.$menu_items.on("click.menu","li",TS.menu.onTeamItemClick);
TS.kb_nav.setSubmitItemHandler(TS.menu.onTeamItemClick);
TS.menu.start(d);
TS.menu.positionAt($("#team_menu"),150,49)
},onTeamItemClick:function(f){var g=$(this).attr("id");
if(g=="team_home"||g=="team_settings"||g=="team_admin"||g=="team_services"||g=="team_invitations"||g=="team_apps"){}else{if(g=="team_help"){f.preventDefault();
TS.help_dialog.start()
}else{if(g=="logout"){f.preventDefault();
TS.utility.loadUrlInWindowIfOnline(TS.boot_data.logout_url)
}else{if(g=="add_team"){if(TSSSB.call("signInTeam")){f.preventDefault()
}}else{if($(this).hasClass("switch_team")){var d=$(this).data("user-id");
if(TSSSB.call("displayTeam",d)){f.preventDefault()
}else{var c=$(this).find("a").attr("href");
if(c&&c.indexOf("?")==-1){$(this).find("a").attr("href",c+="?"+TS.appendQSArgsToUrl())
}c=$(this).find("a").attr("href");
if(c&&c.indexOf("?")==-1){$(this).find("a").attr("href",c+="?"+TS.appendQSArgsToUrl())
}}}else{f.preventDefault();
TS.warn("not sure what to do with clicked element id:"+g);
return
}}}}}TS.menu.end()
},startWithUser:function(c){if(TS.menu.isRedundantClick(c)){return
}if(TS.client.ui.checkForEditing(c)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
var d={user:TS.model.user,other_accounts:TS.boot_data.other_accounts,logout_url:TS.boot_data.logout_url,signin_url:TS.boot_data.signin_url};
TS.menu.$menu.addClass("headless footless").css("min-width",245);
TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu_items.html(TS.templates.menu_user_items(d));
TS.menu.$menu_items.on("click.menu","li",TS.menu.onUserItemClick);
TS.kb_nav.setSubmitItemHandler(TS.menu.onUserItemClick);
TS.menu.start(c);
TS.menu.positionAt($("#user_menu"),152,-(TS.menu.$menu.height()-5))
},onUserItemClick:function(c){var d=$(this).attr("id");
clearTimeout(TS.menu.end_time);
if(d=="member_photo_item"){}else{if(d=="member_account_item"){}else{if(d=="member_prefs_item"){c.preventDefault();
TS.ui.prefs_dialog.start()
}else{if(d=="member_profile_item"){c.preventDefault();
TS.client.ui.previewMember(TS.model.user.id)
}else{if(d=="member_presence"){c.preventDefault();
TS.members.toggleUserPresence();
TS.menu.end_time=setTimeout(function(){TS.menu.end()
},1000);
return
}else{if(d=="member_help"){c.preventDefault();
TS.help_dialog.start()
}else{if(d=="logout"){c.preventDefault();
TS.utility.loadUrlInWindowIfOnline(TS.boot_data.logout_url)
}else{c.preventDefault();
TS.warn("not sure what to do with clicked element id:"+d);
return
}}}}}}}TS.menu.end()
},startWithFlexMenu:function(d){if(TS.menu.isRedundantClick(d)){return
}if(TS.model.menu_is_showing){return
}TS.menu.clean();
TS.menu.$menu_header.html(TS.templates.menu_flexpane_header());
TS.menu.$menu_items.html(TS.templates.menu_flexpane_items({special_flex_panes:TS.boot_data.special_flex_panes}));
TS.menu.$menu_footer.html(TS.templates.menu_flexpane_footer());
TS.menu.$menu_items.on("click.menu","li",TS.menu.onFlexMenuItemClick);
TS.menu.start(d);
if(!TS.boot_data.feature_flexpane_rework){b()
}TS.menu.$menu.addClass("flex_menu");
if(TS.boot_data.feature_flexpane_rework){TS.menu.positionAt($("#flex_menu_toggle"),-(TS.menu.$menu.width()-$("#flex_menu_toggle").width()),37);
TS.menu.$menu.addClass("feature_flexpane_rework")
}else{TS.menu.positionAt($("#flex_menu"),-(TS.menu.$menu.width()-$("#flex_menu").width()-31),40)
}if(TS.boot_data.special_flex_panes&&!TS.boot_data.feature_flexpane_rework){var c=TS.menu.$menu.width()-41;
TS.menu.$menu.find(".arrow, .arrow_shadow").css("left",c)
}if(TS.boot_data.feature_flexpane_rework){TS.help.updateIcon()
}if(TS.boot_data.feature_flexpane_rework){$("#flex_menu_toggle").addClass("menu_open")
}if(TS.boot_data.feature_flexpane_rework){$("#flex_menu_toggle").attr("title","Close Flexpane Menu")
}$("#flex_menu_callout").bind("click",function(f){TS.menu.end()
});
TS.view.setFlexMenuSize()
},onFlexMenuItemClick:function(g){var f=200;
if($(this).data("tab-id")){var d=$(this).data("tab-id");
setTimeout(function(){if(d=="files"){TS.client.ui.toggleFileList("all");
TS.client.ui.filterFileList("all")
}else{if(d=="team"){TS.client.ui.showTeamList()
}else{TS.client.ui.openFlexTab(d)
}}},f)
}else{if($(this).data("filetype")){var c=$(this).data("filetype");
setTimeout(function(){TS.client.ui.toggleFileList("all");
TS.client.ui.filterFileList(c);
TS.view.fileSetButtonState(c)
},f)
}else{var h=$(this).attr("id");
if(h=="help"){g.preventDefault();
setTimeout(function(){TS.help_dialog.start()
},f)
}}}TS.menu.end()
},startWithChannelPickerForChange:function(h,f){if(TS.menu.isRedundantClick(h)){return
}TS.menu.clean();
var j=TS.members.getMemberById(f);
var d=[],c=[];
$.each(TS.channels.getUnarchivedChannelsForUser(),function(e,k){if(!j.channels.hasOwnProperty(k.id)){d.push(k)
}});
$.each(TS.groups.getUnarchivedGroups(),function(e,k){if(!j.groups.hasOwnProperty(k.id)){c.push(k)
}});
var i={user_id:f,channels:d,groups:c};
TS.menu.$menu_header.html(TS.templates.menu_channel_picker_header(i));
TS.menu.$menu_items.html(TS.templates.menu_channel_picker(i)).css("max-height",274);
TS.menu.$menu_items.on("click.menu","li",TS.menu.onChannelPickerItemClickChangeChannel);
TS.menu.$menu.addClass("footless").css("width",274);
TS.menu.start(h);
var g=$(h.target).closest(".pill");
if(TS.boot_data.app=="mobile"){TS.menu.positionAt(g,-(g.offset().left)+16,0)
}else{TS.menu.positionAt(g,-(TS.menu.$menu.width())+g.outerWidth(),g.height()+4)
}TS.menu.$menu.scrollintoview({duration:500,offset:"bottom",px_offset:-25});
a();
TS.kb_nav.setAllowHighlightWithoutBlurringInput(true)
},onChannelPickerItemClickChangeChannel:function(g){var d=$(this).data("user-id"),c=$(this).data("channel-id"),f=$(this).data("group-id");
if(c){TS.api.call("users.admin.changeURAChannel",{user:d,channel:c},TS.web.admin.onMemberURAChanged)
}else{if(f){TS.api.call("users.admin.changeURAChannel",{user:d,channel:f},TS.web.admin.onMemberURAChanged)
}}TS.menu.end()
},startWithChannelPickerForInvite:function(g,d){if(TS.menu.isRedundantClick(g)){return
}TS.menu.clean();
var j=TS.members.getMemberById(d);
var i=[],c=[];
$.each(TS.channels.getUnarchivedChannelsForUser(),function(e,k){if(!j.channels.hasOwnProperty(k.id)){i.push(k)
}});
$.each(TS.groups.getUnarchivedGroups(),function(e,k){if(!j.groups.hasOwnProperty(k.id)){c.push(k)
}});
var h={user_id:d,channels:i,groups:c};
TS.menu.$menu_header.html(TS.templates.menu_channel_picker_header(h));
TS.menu.$menu_items.html(TS.templates.menu_channel_picker(h)).css("max-height",274);
TS.menu.$menu_items.on("click.menu","li",TS.menu.onChannelPickerItemClickInviteChannel);
TS.menu.$menu.addClass("footless").css("max-width",300);
TS.menu.start(g);
var f=$(g.target).closest(".pill");
if(TS.boot_data.app=="mobile"){TS.menu.positionAt(f,-(f.offset().left)+16,0)
}else{TS.menu.positionAt(f,-(f.width())+10,f.height()+4)
}TS.menu.$menu.scrollintoview({duration:500,offset:"bottom",px_offset:-25});
a();
TS.kb_nav.setAllowHighlightWithoutBlurringInput(true)
},onChannelPickerItemClickInviteChannel:function(g){var d=$(this).data("user-id"),c=$(this).data("channel-id"),f=$(this).data("group-id");
if(c){TS.api.call("channels.invite",{user:d,channel:c},TS.web.admin.onMemberInviteChannel)
}else{if(f){TS.api.call("groups.invite",{user:d,channel:f},TS.web.admin.onMemberInviteGroup)
}}TS.menu.end()
},startWithChannelPicker:function(g,d,c,f){if(TS.menu.isRedundantClick(g)){return
}TS.menu.clean();
var h={user_id:TS.model.user.id,channels:d,groups:c};
TS.menu.$menu_header.html(TS.templates.menu_channel_picker_header(h));
TS.menu.$menu_items.html(TS.templates.menu_channel_picker(h)).css("max-height",274);
TS.menu.$menu_items.on("click.menu","li",f);
TS.menu.$menu.addClass("footless").css("max-width",300);
TS.menu.start(g);
a();
TS.kb_nav.setAllowHighlightWithoutBlurringInput(true)
},startWithSearchFilter:function(d){if(TS.menu.isRedundantClick(d)){return
}if(TS.model.menu_is_showing){return
}var f={search_exclude_bots:TS.model.prefs.search_exclude_bots,search_only_my_channels:TS.model.prefs.search_only_my_channels,files_filter:TS.search.filter==="files",result_type:TS.search.filter==="messages"?"messages":"files"};
TS.menu.clean();
TS.menu.$menu_header.addClass("hidden").empty();
TS.menu.$menu.addClass("footless search_filter_menu");
TS.menu.$menu_items.html(TS.templates.menu_search_filter_items(f));
TS.menu.start(d);
b();
var c=$("#search_filter_menu_label");
TS.menu.positionAt(c,-8,c.height()+10);
$("#search_only_my_channels_cb").bind("change",function(){TS.prefs.setPrefByAPI({name:"search_only_my_channels",value:!$(this).prop("checked")})
});
$("#search_exclude_bots_cb").bind("change",function(){TS.prefs.setPrefByAPI({name:"search_exclude_bots",value:!$(this).prop("checked")})
});
TS.menu.search_filter_is_showing=true;
$("#search_filter_menu_label").addClass("active")
},positionAt:function(e,d,h){d=d||0;
h=h||0;
var f=e.offset();
var c=f.left+d;
var g=f.top+h;
TS.menu.$menu.css({top:g,left:c})
},isRedundantClick:function(c){if(c&&TS.menu.last_e&&c.target==TS.menu.last_e.target){return true
}return false
},isLarge:function(){return(TS.menu&&TS.menu.$menu&&TS.menu.$menu.find("li").length>TS.menu.large_dom_trigger)
},start:function(h,g){TS.menu.last_e=h;
var f=$(h.target).offset();
var k=f.left+$(h.target).width()+10;
var j=f.top;
if(g){k=h.pageX+10;
j=h.pageY+10
}$(".tooltip").hide();
$(h.currentTarget).addClass("active");
TS.menu.$target_element=$(h.currentTarget);
TS.model.menu_is_showing=true;
var c=TS.menu.$menu;
var i=TS.menu.isLarge();
c.css({top:j,left:k});
var m=c.find("#menu_items_scroller");
m.scrollTop(0);
if(TS.client){c.appendTo($("#client-ui"))
}else{c.appendTo($("body"))
}if(!i){c.css("opacity",0);
c.stop().transition({opacity:1},200)
}else{c.css("opacity",1)
}c.find(".menu_close").on("click",TS.menu.end);
TS.menu.keepInBounds();
var l=m.data("monkeyScroll");
if(l){var d=true;
l.updateFunc(d)
}if(TS.menu.menu_lazy_load&&TS.menu.menu_lazy_load.detachEvents){TS.menu.menu_lazy_load.detachEvents()
}TS.menu.menu_lazy_load=TS.menu.$menu_items.find(".lazy").lazyload({container:$("#menu_items_scroller"),all_images_same_size:true,throttle:250});
$(window).bind("resize",TS.menu.keepInBounds);
$(window.document).bind("keydown",TS.menu.onKeyDown);
$("html").bind("mousedown touchstart",TS.menu.onMouseDown);
TS.kb_nav.start(c.find("#menu_items"),"li:not(.divider)")
},clean:function(){TS.menu.$menu_footer.empty();
TS.menu.$menu_header.removeClass("hidden");
TS.menu.$menu.removeClass("no_min_width headless footless flex_menu search_filter_menu popover_menu no_icons combined_menu").css("min-width",0).css("max-height","");
TS.menu.$menu.find(".arrow, .arrow_shadow").remove();
TS.menu.$menu_items.off("mouseenter.section_header")
},end:function(){TS.model.menu_is_showing=false;
var d=TS.menu.$menu;
var c=function(){if(TS.model.menu_is_showing){return
}TS.menu.last_e=null;
d.detach();
TS.menu.clean()
};
if(!TS.menu.isLarge()){d.stop().transition({opacity:0},200,c)
}else{c()
}if(TS.menu.$target_element){TS.menu.$target_element.removeClass("active");
TS.menu.$target_element=null
}TS.menu.member=null;
TS.menu.channel=null;
TS.menu.$menu_header.unbind("click.menu");
TS.menu.$menu_items.off("click.menu");
$(window).unbind("resize",TS.menu.keepInBounds);
$(window.document).unbind("keydown",TS.menu.onKeyDown);
$("html").unbind("mousedown touchstart",TS.menu.onMouseDown);
TS.members.view.team_filter_changed_sig.remove(TS.kb_nav.clearHighlightedItem);
TS.members.view.team_filter_changed_sig.remove(TS.menu.filterChanged,TS.menu);
$(".file_list_item.active").removeClass("active");
TS.menu.search_filter_is_showing=false;
$("#search_filter_menu_label").removeClass("active");
if(TS.boot_data.feature_flexpane_rework){$("#flex_menu_toggle").removeClass("menu_open")
}if(TS.boot_data.feature_flexpane_rework){$("#flex_menu_toggle").attr("title","Open Flexpane Menu")
}setTimeout(function(){TS.menu.file_list_menu_up=false;
$(".inline_file_preview_container.file_menu_open").removeClass("file_menu_open")
},100);
TS.kb_nav.end()
},onKeyDown:function(f){var c=TS.utility.keymap;
var d=f.which;
var g=f.metaKey||f.ctrlKey||f.altKey;
if(d==c.esc){f.stopPropagation();
f.preventDefault();
TS.menu.end();
return
}else{if(!g&&!TS.utility.isArrowKey(d)&&d!=c.tab&&d!=c.enter){TS.kb_nav.clearHighlightedItem();
if(d==c.enter){setTimeout(function(){$("#menu_member_dm_input").focus()
},0)
}else{$("#menu_member_dm_input").focus()
}}}},onMouseDown:function(c){if($(c.target).closest("#menu").length===0&&$(c.target).closest("#tip_card").length===0){TS.menu.end()
}},keepInBounds:function(){if(window.requestAnimationFrame){window.requestAnimationFrame(TS.menu.keepInBoundsThrottled)
}else{TS.menu.keepInBoundsThrottled()
}},keepInBoundsThrottled:function(){var e=TS.menu.$menu;
var d=10;
var f=e.dimensions_rect();
var c={top:0+d,right:$(window).width()-d,bottom:$(window).height()-(d+14),left:0+d};
if(TS.utility.doesRectContainRect(c,f)){return
}if(f.left<c.left){e.css("left",c.left)
}else{if(f.right>c.right){e.css("left",Math.max(c.left,c.right-f.width))
}}if(f.top<c.top){e.css("top",c.top)
}else{if(f.bottom>c.bottom){e.css("top",Math.max(c.top,c.bottom-f.height+$(window).scrollTop()))
}}}});
var a=function(){var e=TS.menu.$menu.find(".no_results");
var d=TS.menu.$menu.find(".icon_close");
var f=TS.menu.$menu.find(".menu_filter");
var c="";
d.click(function(){f.val("").trigger("change");
f.focus()
});
TS.menu.$menu_items.children("li").each(function(){var g=$(this).data("channel-id");
if(g){var i=TS.channels.getChannelById(g);
if(i){$(this).data("name",i.name)
}return
}var h=$(this).data("group-id");
if(h){var j=TS.groups.getGroupById(h);
if(j){$(this).data("name",j.name)
}}});
f.on("keyup change paste",TS.utility.debounce(function(k){var j=$(this).val();
if(j){if(c!==j){var h=new RegExp(TS.utility.regexpEscape(j),"i");
var g=false;
d.removeClass("hidden");
TS.menu.$menu_items.children("li").removeClass("hidden").each(function(){var m=$(this).data("name");
if(m){var l=m.match(h);
if(l){g=true;
return
}}$(this).addClass("hidden")
});
if(g){e.addClass("hidden")
}else{e.removeClass("hidden");
e.find(".query").text(j)
}TS.kb_nav.clearHighlightedItem()
}}else{TS.menu.$menu_items.children("li.hidden").removeClass("hidden");
e.addClass("hidden");
d.addClass("hidden");
if(c!==j){TS.kb_nav.clearHighlightedItem()
}}c=j;
if(TS.menu.$menu.find("#menu_items_scroller").data("monkeyScroll")){var i=true;
TS.menu.$menu.find("#menu_items_scroller").data("monkeyScroll").updateFunc(i)
}},250));
f.focus()
};
var b=function(){var c=TS.menu.$menu;
c.addClass("popover_menu");
c.prepend('<span class="arrow"></span><span class="arrow_shadow"></span>')
}
})();
(function(){TS.registerModule("cmd_handlers",{server_cmds:null,onStart:function(){},mergeInServerCmds:function(a){TS.cmd_handlers.server_cmds=a;
var c;
for(var b in TS.cmd_handlers){if(b.indexOf("/")!==0){continue
}if(TS.cmd_handlers[b].type=="client"){delete TS.cmd_handlers[b].override
}else{TS.log(65,'mergeInCmds is removing the server command "'+b+'" from cmd_handlers');
delete TS.cmd_handlers[b]
}}for(c in a){if(c.indexOf("/")!==0){continue
}if(TS.cmd_handlers[c]){TS.cmd_handlers[c].override=true;
TS.log(65,'mergeInCmds is NOT overwriting a client command for "'+c+'"');
continue
}TS.log(65,'mergeInCmds is adding the server command "'+c+'" to cmd_handlers');
TS.cmd_handlers[c]=TS.cmd_handlers.makeInternalCmdObject(a[c])
}for(c in a){if(c.indexOf("/")!==0){continue
}if(!TS.cmd_handlers[c].alias_of){continue
}var d=TS.cmd_handlers[TS.cmd_handlers[c].alias_of];
if(!d){TS.log(65,'mergeInCmds is NOT adding an alias of "'+c+'" to "'+TS.cmd_handlers[c].alias_of+'" because it was not found');
continue
}if(d.type=="client"){TS.log(65,'mergeInCmds is NOT adding an alias of "'+c+'" to "'+TS.cmd_handlers[c].alias_of+'" because it is not a server command');
continue
}TS.log(65,'mergeInCmds is adding on alias of "'+c+'" to "'+TS.cmd_handlers[c].alias_of+'"');
if(!d.aliases){d.aliases=[]
}d.aliases.push(c)
}},makeInternalCmdObject:function(a){return{autocomplete:true,alias_of:a.alias_of?a.alias_of:null,aliases:null,usage:a.usage||"",desc:a.desc||"",help_text:a.help_text||"",type:a.type||""}
},addTempEphemeralFeedback:function(b,a){if(a){TS.client.ui.$msg_input.val(a)
}TS.client.ui.addOrFlashEphemeralBotMsg({text:b,ephemeral_type:"temp_slash_cmd_feedback"})
},addEphemeralFeedback:function(b,a){if(a){TS.client.ui.$msg_input.val(a)
}TS.utility.msgs.removeAllEphemeralMsgsByType("temp_slash_cmd_feedback",TS.model.active_cid);
TS.client.ui.addEphemeralBotMsg({text:b})
},runCommand:function(b,a,d,c){if(!TS.cmd_handlers[b]){return
}if(TS.model.last_active_cid){TS.utility.msgs.removeAllEphemeralMsgsByType("temp_slash_cmd_feedback",TS.model.last_active_cid)
}TS.cmd_handlers[b].func(b,a,d,c)
},"/status":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.members.setUserStatus(a)
}},"/away":{type:"client",autocomplete:true,alias_of:null,aliases:null,desc:'Toggle your "away" status',func:function(c,a,f,d){TS.members.toggleUserPresence();
TS.members.presence_changed_sig.add(function b(e){if(!e||e.id!=TS.model.user.id){return
}TS.members.presence_changed_sig.remove(b);
TS.cmd_handlers.addEphemeralFeedback(":white_check_mark: You are now marked as *"+e.presence+"*.")
});
if(a){TS.members.setUserStatus(a)
}}},"/prefs":{type:"client",autocomplete:true,alias_of:null,aliases:null,desc:"Open the preferences dialog",func:function(b,a,d,c){TS.ui.prefs_dialog.start()
}},"/shortcuts":{type:"client",autocomplete:true,alias_of:null,aliases:["/keys"],desc:"Open the keyboard shortcuts dialog",func:function(b,a,d,c){TS.ui.shortcuts_dialog.start()
}},"/keys":{type:"client",autocomplete:true,alias_of:"/shortcuts",aliases:null,desc:"",func:function(b,a,d,c){TS.cmd_handlers["/shortcuts"].func(b,a,d,c)
}},"/open":{type:"client",autocomplete:true,alias_of:null,aliases:["/join"],desc:"Open a channel or group",args:[{name:"channel",optional:true}],func:function(d,b,h,g){if(h.length==1){TS.ui.list_browser_dialog.start("channels")
}else{var a=TS.utility.cleanChannelName(b);
var c=TS.channels.getChannelByName(a);
var f=TS.groups.getGroupByName(a);
if(c){if(c.is_member){TS.channels.displayChannel(c.id)
}else{if(!TS.model.user.is_restricted){TS.channels.join(c.name)
}}}else{if(f){if(!f.is_archived||f.was_archived_this_session){TS.groups.displayGroup(f.id)
}}else{if(TS.members.canUserCreateChannels()){TS.ui.channel_create_dialog.start(a)
}else{TS.cmd_handlers.addEphemeralFeedback("I couldn't find a channel or group named \""+a+'", sorry :disappointed:')
}}}}}},"/join":{type:"client",autocomplete:true,alias_of:"/open",aliases:null,desc:"",func:function(b,a,d,c){TS.cmd_handlers["/open"].func(b,a,d,c)
}},"/msg":{type:"client",autocomplete:true,alias_of:null,aliases:["/dm"],desc:"Send a DM message to another user",args:[{name:"@user",optional:false},{name:"your message",optional:true}],func:function(d,b,i,h){var a=(i.length>1)?i[1]:"";
var f=TS.members.getMemberByName(a);
var g;
if(!f){if(a){var c=a.replace("#","");
g=TS.channels.getChannelByName(c);
if(!g){g=TS.groups.getGroupByName(c)
}if(!g){TS.cmd_handlers.addTempEphemeralFeedback("A valid team member name is required.",d+" "+b);
return
}}else{$("#direct_messages_header").trigger("click.open_dialog").scrollintoview({duration:500})
}}var j=b.replace(a,"");
if(f){if(f.deleted){TS.cmd_handlers.addTempEphemeralFeedback("That user has been deactivated :disappointed:",d+" "+b);
return
}TS.ims.startImByMemberId(f.id,false,j)
}else{if(g){if(g.is_archived){TS.cmd_handlers.addTempEphemeralFeedback("That "+(g.is_channel?"channel":"groups")+" has been archived :disappointed:");
return
}if(g.is_channel){TS.channels.displayChannel(g.id,j)
}else{TS.groups.displayGroup(g.id,j)
}}}}},"/invite":{type:"client",autocomplete:true,alias_of:null,aliases:null,desc:"Invite another member to a channel or group",args:[{name:"@user",optional:false},{name:"channel",optional:true}],func:function(d,b,k,i){var a=(k.length>1)?k[1]:"";
var f=TS.members.getMemberByName(a);
if(!f&&a){TS.cmd_handlers.addTempEphemeralFeedback("A valid team member name is required.",d+" "+b);
return
}if(f&&f.deleted){TS.cmd_handlers.addTempEphemeralFeedback("That user has been deactivated :disappointed:",d+" "+b);
return
}if(f&&f.is_ultra_restricted){TS.cmd_handlers.addTempEphemeralFeedback(TS.utility.htmlEntities(a)+" is a single channel guest.",d+" "+b);
return
}var l=(k.length>2)?k[2]:"";
if(l){if(!f){TS.cmd_handlers.addTempEphemeralFeedback("A valid channel name is required.",d+" "+b);
return
}var j=TS.channels.getChannelByName(l);
var h=TS.groups.getGroupByName(l);
if(j){TS.api.call("channels.invite",{channel:j.id,user:f.id})
}else{if(h){TS.ui.invite.showInviteMembersPreSelected(h.id,[f.id])
}else{TS.cmd_handlers.addTempEphemeralFeedback("A valid channel name is required.",d+" "+b);
return
}}}else{if(TS.model.active_channel_id){if(f){TS.api.call("channels.invite",{channel:TS.model.active_channel_id,user:f.id})
}else{if(i&&i.which==TS.utility.keymap.enter){$(window.document).bind("keyup.wait_for_invite",function(c){TS.ui.invite.showInviteMembersFromChannelDialog(TS.model.active_channel_id);
$(window.document).unbind("keyup.wait_for_invite")
})
}else{TS.ui.invite.showInviteMembersFromChannelDialog(TS.model.active_channel_id)
}}}else{if(TS.model.active_group_id){if(f){TS.ui.invite.showInviteMembersPreSelected(TS.model.active_group_id,[f.id])
}else{if(i&&i.which==TS.utility.keymap.enter){$(window.document).bind("keyup.wait_for_invite",function(c){TS.ui.invite.showInviteMembersFromGroupDialog(TS.model.active_group_id);
$(window.document).unbind("keyup.wait_for_invite")
})
}else{TS.ui.invite.showInviteMembersFromGroupDialog(TS.model.active_group_id)
}}}else{TS.cmd_handlers.addTempEphemeralFeedback("A valid channel name is required.",d+" "+b);
return
}}}}},"/dm":{type:"client",autocomplete:true,alias_of:"/msg",aliases:null,desc:"",func:function(b,a,d,c){TS.cmd_handlers["/msg"].func(b,a,d,c)
}},"/leave":{type:"client",autocomplete:true,alias_of:null,aliases:["/close","/part"],desc:"Leave a channel or DM",func:function(d,b,g,f){if(g.length==1){var a=TS.shared.getActiveModelOb();
if(TS.model.active_channel_id){if(TS.model.user.is_restricted){return
}if(a.is_archived){TS.channels.closeArchivedChannel(TS.model.active_channel_id)
}else{TS.channels.leave(TS.model.active_channel_id)
}}else{if(TS.model.active_im_id){TS.ims.closeIm(TS.model.active_im_id)
}else{if(TS.model.active_group_id){if(a.is_archived){TS.groups.closeGroup(a.id)
}else{TS.cmd_handlers.addTempEphemeralFeedback("Please use the group menu for this.")
}}else{TS.cmd_handlers.addTempEphemeralFeedback("A valid channel or team member name is required.")
}}}}else{var c=TS.channels.getChannelByName(b);
if(c){TS.channels.leave(c.id)
}else{TS.cmd_handlers.addTempEphemeralFeedback("A valid channel name is required.")
}}}},"/close":{type:"client",autocomplete:true,alias_of:"/leave",aliases:null,desc:"",func:function(b,a,d,c){TS.cmd_handlers["/leave"].func(b,a,d,c)
}},"/part":{type:"client",autocomplete:true,alias_of:"/leave",aliases:null,desc:"",func:function(b,a,d,c){TS.cmd_handlers["/leave"].func(b,a,d,c)
}},"/topic":{type:"client",autocomplete:true,alias_of:null,aliases:null,desc:"Set the channel or group topic",args:[{name:"new topic",optional:true}],func:function(b,a,d,c){if(TS.model.user.is_restricted||(TS.shared.getActiveModelOb().is_general&&!TS.members.canUserPostInGeneral())){TS.cmd_handlers.addTempEphemeralFeedback("Setting the topic is a restricted action.",b+" "+a);
return
}if(a.length>TS.model.channel_topic_max_length){TS.cmd_handlers.addTempEphemeralFeedback("Topics cannot exceed "+TS.model.channel_topic_max_length+" characters.",b+" "+a);
return
}if(TS.model.active_channel_id){if(a){TS.channels.setTopic(TS.model.active_channel_id,a)
}else{$("#active_channel_name .name, #group_actions").trigger("click.channel_actions");
$("#menu_channel_topic_input").focus().select()
}}else{if(TS.model.active_group_id){if(a){TS.groups.setTopic(TS.model.active_group_id,a)
}else{$("#active_channel_name .name, #group_actions").trigger("click.channel_actions");
$("#menu_channel_topic_input").focus().select()
}}else{TS.cmd_handlers.addTempEphemeralFeedback("IM channels do not have topics :disappointed:")
}}}},"/togglethemes":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.prefs.setPrefByAPI({name:"messages_theme",value:(TS.model.prefs.messages_theme=="light_with_avatars"?"dense":"light_with_avatars")})
}},"/search":{type:"client",autocomplete:false,alias_of:null,aliases:["/s"],desc:"Perform a search",args:[{name:"your text",optional:true}],func:function(b,a,d,c){var f=$("#search_terms");
TS.client.ui.openFlexTab("search");
TS.view.resizeManually("TS.search.view.showResults");
f.autocomplete("preventMenuOnNextFocus");
f.val(a).removeClass("placeholder").focus();
f.closest("form").submit()
}},"/s":{type:"client",autocomplete:true,alias_of:"/search",aliases:null,desc:"",func:function(b,a,d,c){TS.cmd_handlers["/search"].func(b,a,d,c)
}},"/rename":{type:"client",autocomplete:true,alias_of:null,aliases:null,desc:"Rename a channel or group",args:[{name:"new name",optional:true}],func:function(c,b,f,d){if(TS.model.user.is_restricted){TS.cmd_handlers.addTempEphemeralFeedback("You don't have permission to rename.");
return
}if(!TS.model.active_channel_id&&!TS.model.active_group_id){TS.cmd_handlers.addTempEphemeralFeedback("IM channels cannot be renamed :disappointed:");
return
}var a=TS.shared.getActiveModelOb();
if(TS.model.active_channel_id){if(!TS.model.user.is_admin&&a.creator!=TS.model.user.id){TS.cmd_handlers.addTempEphemeralFeedback("Only team admins (or the channel creator) are allowed to rename channels. :disappointed:");
return
}}TS.ui.channel_create_dialog.start(TS.utility.htmlEntities(b)||a.name,a)
}},"/trigger_w":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.model.collapse_trigger_w=parseInt(a);
alert("collapse_trigger_w = "+TS.model.collapse_trigger_w)
}},"/beep":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.sounds.play("new_message")
}},"/upload":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(c,b,f,d){var a=TS.utility.base64StrtoBlob(b);
TS.client.ui.file_pasted_sig.dispatch(a)
}},"/colors":{type:"client",autocomplete:false,alias_of:null,aliases:["/colours"],desc:"View any custom colors you have set for other members",func:function(d,c,h,f){var a=TS.members.getMembersForUser();
var j;
var g="";
for(var b=0;
b<a.length;
b++){j=a[b];
if(j.member_color!=j.color){g+=j.name+": "+j.member_color+"\n"
}}TS.cmd_handlers.addEphemeralFeedback((g)?"You have overridden colors as follows:\n"+g:"No user color overrides have been set.")
}},"/colours":{type:"client",autocomplete:true,alias_of:"/colors",aliases:null,desc:"",func:function(b,a,d,c){TS.cmd_handlers["/colors"].func(b,a,d,c)
}},"/color":{type:"client",autocomplete:false,alias_of:null,aliases:["/colour"],desc:"Set a custom color for another member",func:function(f,d,h,g){var c=(h.length>1)?h[1]:"";
var b=(h.length>2)?h[2].replace(/\#/g,""):"";
var a=TS.members.getMemberByName(c);
if(!a){TS.cmd_handlers.addTempEphemeralFeedback("A valid team member name is required.",f+" "+d);
return
}if(b&&(b.length!=6||!("#"+b).match(TS.format.hex_rx))){TS.cmd_handlers.addTempEphemeralFeedback("A valid 6 character hex code is required, like `FF0000`.",f+" "+d);
return
}TS.members.setMemberUserColor(a,b);
TS.model.prefs.user_colors=JSON.stringify(TS.model.user_colors);
TS.prefs.setPrefByAPI({name:"user_colors",value:TS.model.prefs.user_colors});
if(b){TS.cmd_handlers.addEphemeralFeedback("You've set your custom color for @"+a.name+" to #"+b)
}else{TS.cmd_handlers.addEphemeralFeedback("You've removed your custom color for @"+a.name+".")
}}},"/colour":{type:"client",autocomplete:true,alias_of:"/color",aliases:null,desc:"",func:function(b,a,d,c){TS.cmd_handlers["/color"].func(b,a,d,c)
}},"/colortest":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(g,f,j,h){var a=null;
if(f){try{a=JSON.parse(f)
}catch(d){TS.cmd_handlers.addTempEphemeralFeedback("Not a good value for colors: "+f);
return
}}if(!a||!a.length){a=["#DDCFFA","#2EF645","#F38303","#E702AE","#3C986D","#9D6158","#F43368","#97C10A","#7491F9","#9E63A3","#FACE41","#35A5CC","#39A93E","#4FECA8","#CA5B34","#E2A974","#2BCFCB","#F89BA7","#89868A","#6A7841","#ADC498","#B1DBDD","#B849C3","#9CDB81","#E72F36","#A16A28","#F68CCF","#317C84","#58851C","#FC4A97","#5774BB","#97B7FE","#C64D97","#CB4A5C","#F68B6B","#81EE4F","#B7ED6D","#756D8E","#3AED69","#81E7FB","#91ECB7","#ED8947","#57AF19","#28BC89","#4A9788","#D645DF","#B498FE","#71C8F9","#C07B1D","#16BD60","#EFCAE3","#A4E0BB","#478AAF","#59953E","#886CA7","#F0C3F1","#29AF70","#80A5F8","#636BB8"]
}var c;
for(c=0;
c<a.length;
c++){a[c]=a[c].replace("#","")
}var b=TS.members.getMembersForUser();
for(c=0;
c<b.length;
c++){TS.members.setMemberUserColor(b[c],a[TS.utility.randomInt(0,a.length-1)])
}}},"/discon":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.ms.disconnect()
}},"/sleep":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.sleepMS()
}},"/wake":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.wakeMS()
}},"/discon2":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.model.break_token=true;
TS.ms.disconnect()
}},"/discon3":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.model.break_reconnections=true;
TS.ms.disconnect()
}},"/overloaddontdothiseverpleaseyouwillbesorry":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(g,d,j,h){if(TS.model.user.is_restricted){return
}var f=d||10;
var c=0;
var b=TS.members.getActiveMembersWithSelfAndNotSlackbot();
var a=setInterval(function(){c++;
TS.ms.msg_handlers.message({channel:TS.channels.getGeneralChannel().id,type:"message",user:b[TS.utility.randomInt(0,b.length-1)].id,ts:TS.utility.date.makeTsStamp(null,"0"),text:"overload #"+c});
if(c>=f){clearInterval(a)
}},0)
}},"/babbledontdothiseverpleaseyouwillbesorry":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(c,a,j,h){var b=TS.utility.msgs.ipsum();
var f=1;
var g=a;
var k;
var d=function(){var i="("+f+") "+b[TS.utility.randomInt(0,b.length-1)];
var e=true;
if(parseInt(g)){if(f>parseInt(g)){clearInterval(k);
e=false
}}if(e){if(TS.model.active_channel_id){TS.channels.sendMsg(TS.model.active_channel_id,i)
}else{if(TS.model.active_im_id){TS.ims.sendMsg(TS.model.active_im_id,i)
}else{if(TS.model.active_group_id){TS.groups.sendMsg(TS.model.active_group_id,i)
}}}}f++
};
if(parseInt(g)){d();
k=setInterval(d,1000)
}else{if(confirm("You sure you want to do this? It will put a lot of crap messages into this channel, y'know? Also, it can't be stopped without a reload.")){d();
k=setInterval(d,1000)
}}}},"/nohrs":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){$('<style type="text/css">.message {border-top:1px solid transparent !important;}</style>').appendTo("head")
}},"/emo":{type:"client",autocomplete:false,alias_of:null,aliases:["/emote","/emoji"],desc:"",func:function(a){var b={};
b.target=$("#message-form");
TS.emoji_menu.startEmo(b)
}},"/emoji":{type:"client",autocomplete:false,alias_of:"/emo",aliases:null,desc:"",func:function(a){TS.cmd_handlers["/emo"].func(a)
}},"/emote":{type:"client",autocomplete:false,alias_of:"/emo",aliases:null,desc:"",func:function(a){TS.cmd_handlers["/emo"].func(a)
}},"/editlast":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"Edit the last message you posted",func:function(c,b,g,d){var a=TS.shared.getActiveModelOb();
if(!a){return
}b=$.trim(b);
if(!b){TS.cmd_handlers.addTempEphemeralFeedback("You must enter some text!",c+" "+b);
return
}var f=TS.utility.msgs.getEditableMsgByProp("user",TS.model.user.id,a.msgs);
if(!f){TS.cmd_handlers.addTempEphemeralFeedback("Found no recent messages from you to edit :disappointed:",c+" "+b);
return
}TS.msg_edit.commitEdit(f,TS.shared.getActiveModelOb(),b)
}},"/deletelast":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"Delete the last message you posted",func:function(c,b,g,d){var a=TS.shared.getActiveModelOb();
if(!a){return
}var f=TS.utility.msgs.getEditableMsgByProp("user",TS.model.user.id,a.msgs);
if(!f){TS.cmd_handlers.addTempEphemeralFeedback("Found no recent messages from you to delete :disappointed:");
return
}TS.msg_edit.startDelete(f.ts)
}},"/collapse":{type:"client",autocomplete:true,alias_of:null,aliases:null,desc:"Collapse all inline images and video in the current channel (opposite of /expand)",func:function(b,a,d,c){TS.inline_imgs.collapseAllInCurrent();
TS.inline_videos.collapseAllInCurrent();
TS.inline_attachments.collapseAllInCurrent();
TS.inline_audios.collapseAllInCurrent();
TS.inline_others.collapseAllInCurrent();
if(TS.boot_data.feature_email_ingestion||TS.boot_data.feature_email_integration||TS.boot_data.feature_fix_files){TS.inline_file_previews.collapseAllInCurrent()
}TS.cmd_handlers.addEphemeralFeedback("I've collapsed all inline media in this channel for you.")
}},"/expand":{type:"client",autocomplete:true,alias_of:null,aliases:null,desc:"Expand all inline images and video in the current channel (opposite of /collapse)",func:function(b,a,d,c){TS.inline_imgs.expandAllInCurrent();
TS.inline_videos.expandAllInCurrent();
TS.inline_attachments.expandAllInCurrent();
TS.inline_audios.expandAllInCurrent();
TS.inline_others.expandAllInCurrent();
if(TS.boot_data.feature_email_ingestion||TS.boot_data.feature_email_integration||TS.boot_data.feature_fix_files){TS.inline_file_previews.expandAllInCurrent()
}TS.cmd_handlers.addEphemeralFeedback("I've expanded all inline media in this channel for you.")
}},"/orb":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(c,b,f,d){if($("#orb").length){$("#orb").destroy();
$("#orb").remove()
}else{var a='					<div id="orb" class="tip_card_throbber throbbing">					<style>					#orb {						position: absolute;						top: 150px;						left: 65px;						z-index: 2000;					}					</style>					</div>				';
$("body").append(a)
}}},"/attach_align":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){$("body").toggleClass("attachments_flush_with_avatar")
}},"/attach_thumb_align":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){window.attach_thumb_align_title=!window.attach_thumb_align_title;
TS.client.msg_pane.rebuildMsgs()
}},"/remove":{type:"client",autocomplete:true,alias_of:null,aliases:["/kick"],desc:"Remove a person from the current channel or group",args:[{name:"@user",optional:false}],func:function(c,b,f,d){if(TS.model.active_channel_id&&!TS.members.canUserKickFromChannels()){TS.cmd_handlers.addTempEphemeralFeedback("Removing from channels is a restricted action.");
return
}if(TS.model.active_group_id&&!TS.members.canUserKickFromGroups()){TS.cmd_handlers.addTempEphemeralFeedback("Removing from groups is a restricted action.");
return
}if(TS.model.active_im_id){TS.cmd_handlers.addTempEphemeralFeedback("You can't remove someone from a DM.");
return
}var a=TS.shared.getActiveModelOb();
if(a.is_archived){TS.cmd_handlers.addTempEphemeralFeedback("You can't remove anyone from *"+(TS.model.active_channel_id?"#":"")+a.name+"* while it is archived.");
return
}b=$.trim(b);
if(!b){TS.cmd_handlers.addTempEphemeralFeedback("Please specifiy someone to remove!",c+" "+b);
return
}var g=TS.members.getMemberByName(b);
if(!g){TS.cmd_handlers.addTempEphemeralFeedback("*"+TS.utility.htmlEntities(b)+"* is not a recognized member name.",c+" "+b);
return
}if(a.is_general&&!g.is_restricted&&!g.is_bot){TS.cmd_handlers.addTempEphemeralFeedback("You can't remove this member from *"+(TS.model.active_channel_id?"#":"")+a.name+"*!");
return
}if(a.members.indexOf(g.id)==-1){TS.cmd_handlers.addTempEphemeralFeedback("*"+TS.utility.htmlEntities(b)+"* is not a member of this "+(TS.model.active_channel_id?"channel":"group")+".",c+" "+b);
return
}if(g.is_self){TS.client.ui.onSubmit("/leave");
return
}if(TS.model.active_channel_id){TS.channels.kickMember(TS.model.active_channel_id,g.id)
}else{if(TS.model.active_group_id){TS.groups.kickMember(TS.model.active_group_id,g.id)
}else{return
}}}},"/kick":{type:"client",autocomplete:true,alias_of:"/remove",aliases:null,desc:"",func:function(b,a,d,c){TS.cmd_handlers["/remove"].func(b,a,d,c)
}},"/feedback":{type:"client",autocomplete:true,alias_of:null,aliases:null,desc:"Send feedback to Slack",args:[{name:"your message",optional:false}],func:function(b,a,d,c){if(!a){TS.cmd_handlers.addTempEphemeralFeedback("Looks like you are trying to send us some feedback, but you didn't say anything!",b+" "+a);
return
}TS.generic_dialog.start({title:"Send feedback",body:'<p class="bold">Looks like you are trying to send us some feedback! Yes?</p>',show_cancel_button:true,show_go_button:true,go_button_text:"Yes, send it",on_go:function(){TS.api.call("chat.command",{agent:"webapp",command:b,text:a,channel:TS.model.active_cid},TS.client.ui.onAPICommand)
},on_cancel:function(){TS.client.ui.$msg_input.val(b+" "+a)
}})
}},"/shrug":{type:"client",autocomplete:true,alias_of:null,aliases:null,desc:"Appends ¯\\_(ツ)_/¯ to your message",args:[{name:"your message",optional:true}],func:function(c,b,f,d){var a=b||"";
if(a&&a.substr(a.length-1)!=" "){a+=" "
}a+="¯\\_(ツ)_/¯ ";
if(TS.model.active_channel_id){TS.channels.sendMsg(TS.model.active_channel_id,a)
}else{if(TS.model.active_im_id){TS.ims.sendMsg(TS.model.active_im_id,a)
}else{if(TS.model.active_group_id){TS.groups.sendMsg(TS.model.active_group_id,a)
}}}}},"/showfallbacks":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.model.show_attachment_fallback=!TS.model.show_attachment_fallback;
TS.client.msg_pane.rebuildMsgs()
}},"/macgap.app.enableDeveloperTools()":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){if(window.macgap&&window.macgap.app&&window.macgap.app.enableDeveloperTools){macgap.app.enableDeveloperTools()
}}},"/toggle_debugging_prefs":{type:"client",autocomplete:false,alias_of:null,aliases:null,desc:"",func:function(b,a,d,c){TS.ui.debug_prefs_dialog.start()
}}})
})();
(function(){TS.registerModule("stars",{member_stars_fetched_sig:new signals.Signal(),member_stars_being_fetched_sig:new signals.Signal(),onStart:function(){TS.files.team_file_changed_sig.add(TS.stars.teamFileChanged,TS.stars)
},teamFileChanged:function(b){if("is_starred" in b){TS.stars.updateFileStar(b.id,b.is_starred,b.id)
}},maybeUpdateStarredItems:function(){if(TS.boot_data.app!="client"){return
}if(!TS.model.team){return
}if(TS.stars.stars_being_fetched){TS.stars.stars_needs_fetched=true;
return
}TS.stars.updateStarredItems()
},stars_being_fetched:false,stars_needs_fetched:false,updateStarredItems:function(){TS.stars.stars_being_fetched=true;
TS.stars.stars_needs_fetched=false;
TS.stars.member_stars_being_fetched_sig.dispatch(TS.model.user,true);
var c=true;
var b=a(TS.model.user.id);
TS.api.call("stars.list",b,TS.stars.onFetchStarredItems,c)
},fetchStarredItems:function(b,d){if(b!=TS.model.user.id){alert("currently this should only be called for the current user; there are issues with is_starred that need to be fixed before we can handle starred items from another user");
return
}var c=a(b);
c.page=d||1;
TS.api.call("stars.list",c,TS.stars.onFetchStarredItems)
},onFetchStarredItems:function(e,g,c){TS.stars.stars_being_fetched=false;
if(TS.stars.stars_needs_fetched){setTimeout(TS.stars.maybeUpdateStarredItems,100)
}var j=TS.members.getMemberById(c.user);
if(!j){TS.stars.member_stars_being_fetched_sig.dispatch(TS.model.user,false);
TS.error("no member? user:"+c.user);
return
}if(!e){TS.error("failed fetchStarredItems");
return
}for(var d=0;
d<g.items.length;
d++){var f=g.items[d];
if(j.id==TS.model.user.id){if(TS.web&&f.type=="message"){var b=TS.shared.getModelObById(f.channel);
var h;
if(!b){TS.warn("onFetchStarredItems item.channel:"+f.channel+" not found")
}else{if(!b.msgs){b.msgs=[]
}h=TS.utility.msgs.getMsg(f.message.ts,b.msgs);
if(!h){TS.utility.msgs.appendMsg(b.msgs,f.message)
}}}TS.stars.starStatusHasChanged(true,f,"stars.list")
}else{TS.activity.slurpStarItem(f,"stars.list")
}}if(c.start_ts){j.stars=j.stars.concat(g.items)
}else{j.stars=g.items
}TS.stars.member_stars_fetched_sig.dispatch(j)
},starStatusHasChanged:function(g,d,f){TS.activity.slurpStarItem(d,f);
if(d.type=="message"){TS.stars.updateMsgStar(d.message.ts,d.channel,g)
}else{if(d.type=="file"){if(d.file.is_starred!=g){TS.stars.updateFileStar(d.file.id,g)
}}else{if(d.type=="file_comment"){if(d.comment.is_starred!=g){TS.stars.updateFileCommentStar(d.comment.id,d.file.id,g)
}}else{if(d.type=="channel"){var c=TS.channels.getChannelById(d.channel);
if(!c){TS.warn("starStatusHasChanged channel_id:"+d.channel+" not found")
}else{if(c.is_starred!=g){TS.stars.updateChannelStar(d.channel,g)
}}}else{if(d.type=="group"){var e=TS.groups.getGroupById(d.channel);
if(!e){TS.warn("starStatusHasChanged group_id:"+d.channel+" not found")
}else{if(e.is_starred!=g){TS.stars.updateGroupStar(d.channel,g)
}}}else{if(d.type=="im"){var b=TS.ims.getImById(d.channel);
if(!b){TS.warn("starStatusHasChanged im_id:"+d.channel+" not found")
}else{if(b.is_starred!=g){TS.stars.updateImStar(d.channel,g)
}}}else{TS.error("starStatusHasChanged needs to handle star item type:"+d.type)
}}}}}}},checkForStarClick:function(h){if(!h.target){return
}var f=$(h.target);
var b;
if(f.closest(".star").length){b=f.closest(".star")
}else{b=f.closest(".star_link")
}if(!b||!b.length){return
}if(b.hasClass("not-clickable")){return
}var g=b.hasClass("starred");
var d={};
var c;
if(b.hasClass("star_message")){d.channel=b.data("c-id");
d.timestamp=b.data("msg-id");
c=function(e){TS.stars.updateMsgStar(d.timestamp,d.channel,e);
TS.activity.updateActivityMsgStar(d.timestamp,d.channel,e)
}
}else{if(b.hasClass("star_file")){d.file=b.data("file-id");
c=function(e){TS.stars.updateFileStar(d.file,e)
}
}else{if(b.hasClass("star_file_comment")){d.file_comment=b.data("comment-id");
c=function(e){TS.stars.updateFileCommentStar(d.file_comment,b.data("file-id"),e)
}
}else{if(b.hasClass("star_channel")){d.channel=b.data("channel-id");
c=function(e){TS.stars.updateChannelStar(d.channel,e)
}
}else{if(b.hasClass("star_group")){d.channel=b.data("group-id");
c=function(e){TS.stars.updateGroupStar(d.channel,e)
}
}else{if(b.hasClass("star_im")){d.channel=b.data("im-id");
c=function(e){TS.stars.updateImStar(d.channel,e)
}
}else{TS.error("checkForStarClick doesn't know what to do with a click on "+b[0].outerHTML);
return
}}}}}}c(!g);
if(g){TS.api.call("stars.remove",d,function(i,j,e){if(i){return
}if(j.error=="not_starred"){if(TS.client&&TS.model.team.domain=="tinyspeck"){alert("tell eric not_starred (this message is for team tinyspeck only)")
}c(false)
}else{c()
}})
}else{TS.api.call("stars.add",d,function(i,j,e){if(i){return
}if(j.error=="already_starred"){if(TS.client&&TS.model.team.domain=="tinyspeck"){alert("tell eric already_starred (this message is for team tinyspeck only)")
}c()
}else{c(false)
}})
}},updateMsgStar:function(e,d,g){var c=TS.shared.getModelObById(d);
var f;
if(!c){TS.warn("updateMsgStar c_id:"+d+" not found")
}else{f=TS.utility.msgs.getMsg(e,c.msgs);
if(!f){}}var b='.star_message[data-msg-id="'+e+'"][data-c-id="'+d+'"]';
TS.stars.updateStar($(b),g,f,b);
if(TS.client){if(c){TS.utility.msgs.maybeStoreMsgs(c.id,c.msgs)
}}},updateFileCommentStar:function(d,e,f){var c=TS.files.getFileById(e);
var g;
if(!c){TS.warn("updateFileStar file_id:"+e+" not found")
}else{g=TS.files.getFileCommentById(c,d)
}var b='.star_comment[data-comment-id="'+d+'"]';
TS.stars.updateStar($(b),f,g,b);
TS.files.makeSureReferencesGetSavedToLS(e)
},updateFileStar:function(d,e){var c=TS.files.getFileById(d);
if(!c){TS.warn("updateFileStar file_id:"+d+" not found")
}var b='.star_file[data-file-id="'+d+'"]';
TS.stars.updateStar($(b),e,c,b);
TS.files.makeSureReferencesGetSavedToLS(d)
},updateChannelStar:function(c,e){var d=TS.channels.getChannelById(c);
if(!d){TS.warn("updateChannelStar channel_id:"+c+" not found")
}var b='.star_channel[data-channel-id="'+c+'"]';
TS.stars.updateStar($(b),e,d,b);
if(TS.client){TS.client.channel_pane.rebuildChannelList();
TS.client.channel_pane.rebuildStarredList()
}},updateGroupStar:function(c,e){var d=TS.groups.getGroupById(c);
if(!d){TS.warn("updateGroupStar group_id:"+c+" not found")
}var b='.star_group[data-group-id="'+c+'"]';
TS.stars.updateStar($(b),e,d,b);
if(TS.client){TS.client.channel_pane.rebuildGroupList();
TS.client.channel_pane.rebuildStarredList()
}},updateImStar:function(e,d){var c=TS.ims.getImById(e);
if(!c){TS.warn("updateImStar im_id:"+e+" not found")
}var b='.star_im[data-im-id="'+e+'"]';
TS.stars.updateStar($(b),d,c,b);
if(TS.client){TS.client.channel_pane.rebuildImList();
TS.client.channel_pane.rebuildStarredList()
}},updateStar:function(c,e,d,b){if(e){if(!c.hasClass("starred")){c.addClass("starred")
}}else{c.removeClass("starred")
}if(d){d.is_starred=e
}else{}}});
var a=function(b){var c={user:b||TS.model.user.id};
if(TS.boot_data.feature_flexpane_rework){c.exclude="Ch,Gh,Dh"
}return c
}
})();
(function(){TS.registerModule("mentions",{mention_changed_sig:new signals.Signal(),mention_removed_sig:new signals.Signal(),mentions_fetched_sig:new signals.Signal(),mentions_being_fetched_sig:new signals.Signal(),mentions_being_fetched:false,mentions_needs_fetched:false,has_more:false,after_ts:null,fetched_once:false,onStart:function(){if(TS.boot_data.feature_flexpane_rework){TS.prefs.mentions_exclude_at_channels_changed_sig.add(c)
}},maybeUpdateMentions:function(){if(TS.boot_data.app!="client"){return
}if(!TS.model.team){return
}if(TS.mentions.mentions_being_fetched){TS.mentions.mentions_needs_fetched=true;
return
}TS.mentions.updateMentions()
},updateMentions:function(){TS.mentions.mentions_being_fetched=true;
TS.mentions.mentions_needs_fetched=false;
TS.mentions.mentions_being_fetched_sig.dispatch();
var d=true;
TS.api.call("activity.mentions",b(),TS.mentions.onFetchMentions,d)
},fetchMoreMentions:function(){TS.mentions.fetchMentions(TS.mentions.after_ts)
},fetchMentions:function(e){TS.mentions.fetched_once=true;
var d=b();
e=e||"";
d.after_ts=e;
TS.api.call("activity.mentions",d,TS.mentions.onFetchMentions)
},getMentionByMsgId:function(h,g,d){for(var f=0;
f<TS.model.user.mentions.length;
f++){var e=TS.model.user.mentions[f];
if(!e.message){continue
}if(e.message.ts==h){if(g){TS.model.user.mentions[f].message=g
}else{if(d){TS.model.user.mentions.splice(f,1)
}}return e
}}return null
},onFetchMentions:function(o,k,n){TS.mentions.mentions_being_fetched=false;
if(TS.mentions.mentions_needs_fetched){setTimeout(TS.mentions.maybeUpdateMentions,100)
}if(!o){TS.error("failed fetchMentions");
return
}var j=[];
var e;
for(var l=0;
l<k.mentions.length;
l++){var p=k.mentions[l];
var f=p.message;
if(!f){continue
}var g=f.file;
var m=f.comment;
if(f.subtype=="file_share"||f.subtype=="file_mention"||f.subtype=="file_comment"){if(!g){continue
}if(f.subtype=="file_comment"){if(!m){continue
}}}if(f.ts=="0000000000.000000"){TS.warn("bad mention! msg.ts == 0000000000.000000");
continue
}if(TS.boot_data.feature_reactions){if(f.subtype=="file_share"||f.subtype=="file_mention"||f.subtype=="file_comment"){g._rxn_key=TS.rxns.getRxnKey("file",g.id);
e=TS.rxns.getExistingRxnsByKey(g._rxn_key);
if(e&&!g.reactions){TS.warn("file:"+g.id+" has reactions in local model, but we got an object in mentions that does NOT have reactions, which seems suspicious")
}else{TS.rxns.upsertRxnsFromDataAndUpdateUI(g._rxn_key,g.reactions)
}if(f.subtype=="file_comment"){m._rxn_key=TS.rxns.getRxnKey("file_comment",m.id);
e=TS.rxns.getExistingRxnsByKey(m._rxn_key);
if(e&&!m.reactions){TS.warn("comment:"+m.id+" has reactions in local model, but we got an object in mentions that does NOT have reactions, which seems suspicious")
}else{TS.rxns.upsertRxnsFromDataAndUpdateUI(m._rxn_key,m.reactions)
}}}else{f._rxn_key=TS.rxns.getRxnKey("message",f.ts,p.channel);
e=TS.rxns.getExistingRxnsByKey(f._rxn_key);
if(e&&!f.reactions){TS.warn("msg:"+f.ts+" has reactions in local model, but we got an object in mentions that does NOT have reactions, which seems suspicious")
}else{TS.rxns.upsertRxnsFromDataAndUpdateUI(f._rxn_key,f.reactions)
}var d=TS.shared.getModelObById(p.channel);
var h=TS.utility.msgs.getMsg(f.ts,d.msgs);
if(h){f.is_starred=h.is_starred
}}}if(TS.mentions.getMentionByMsgId(f.ts,f)){continue
}j.push(p)
}TS.model.user.mentions=TS.model.user.mentions.concat(j);
TS.mentions.sortMentions();
if(TS.mentions.after_ts===null||n.after_ts){TS.mentions.has_more=k.has_more;
if(TS.model.user.mentions.length){TS.mentions.after_ts=TS.model.user.mentions[TS.model.user.mentions.length-1].message.ts
}}TS.mentions.mentions_fetched_sig.dispatch()
},sortMentions:function(){var f;
var d;
function e(h,g){f=h.rxn_ts||h.message.ts;
d=g.rxn_ts||g.message.ts;
if(f<d){return 1
}if(f>d){return -1
}return 0
}TS.model.user.mentions.sort(e)
},replaceMsg:function(d){var e=TS.mentions.getMentionByMsgId(d.ts,d);
if(e){TS.mentions.mention_changed_sig.dispatch(e)
}},removeMsg:function(e){var d=TS.mentions.getMentionByMsgId(e,null,true);
if(d){TS.mentions.mention_removed_sig.dispatch(e)
}},setExcludeAtChannelsPref:function(d){d=!!d;
TS.model.prefs.mentions_exclude_at_channels=d;
TS.prefs.setPrefByAPI({name:"mentions_exclude_at_channels",value:d});
c()
},weaveInRxnRecords:function(){if(!TS.boot_data.feature_reactions){return
}var j=TS.rxns.getRxnRecords();
var g;
var d;
var k;
var f;
var e;
TS.model.user.mentions=TS.model.user.mentions.filter(function(i){return i.type!="rxn"
});
for(var h=0;
h<j.length;
h++){d=j[h].rxn_key;
g=TS.rxns.getRxnKeyParts(d);
if(g.type=="message"){f=TS.shared.getModelObById(g.c_id);
e=f&&TS.utility.msgs.getMsg(g.id,f.msgs);
if(!e){continue
}TS.mentions.getMentionByMsgId(g.id,null,true);
k={channel:g.c_id,type:"rxn",rxn_ts:j[h].last_update,message:{type:e.type||"message",subtype:e.subtype||undefined,user:e.user,text:e.text,ts:e.ts,_rxn_key:d}}
}else{if(g.type=="file"){continue
}else{if(g.type=="file_comment"){continue
}else{continue
}}}TS.model.user.mentions.push(k)
}TS.mentions.sortMentions()
}});
var b=function(){var d={};
if(TS.boot_data.feature_flexpane_rework){var e=TS.model.prefs.mentions_exclude_at_channels;
if(e){d.exclude="everyone,channel"
}}return d
};
var c=function(){var d=TS.model.prefs.mentions_exclude_at_channels;
if(d){a();
TS.mentions.mentions_fetched_sig.dispatch()
}else{TS.mentions.maybeUpdateMentions()
}};
var a=function(){var d;
for(var e=TS.model.user.mentions.length-1;
e>=0;
e--){d=TS.model.user.mentions[e];
if(d.type==="channel"||d.type==="everyone"){TS.model.user.mentions.splice(e,1)
}}}
})();
(function(){TS.registerModule("inline_imgs",{no_scrolling:false,onStart:function(){},shouldExpand:function(a,b){if(TS.model.expandable_state["img_"+a+b.src]){return true
}if(TS.model.expandable_state["img_"+a+b.src]===false){return false
}if(!b.internal_file_id){if(TS.model.prefs.obey_inline_img_limit&&b.bytes>TS.model.inline_img_byte_limit){return false
}if(b.width&&b.height){if((b.width*b.height)>TS.model.inline_img_pixel_limit){return false
}}}if(b.internal_file_id){return TS.model.prefs.expand_internal_inline_imgs
}return TS.model.prefs.expand_inline_imgs
},expandAllInCurrent:function(){TS.inline_imgs.no_scrolling=true;
$(".msg_inline_img_expander").trigger("click");
TS.inline_imgs.no_scrolling=false;
if(TS.client){TS.client.ui.instaScrollMsgsToBottom(false)
}},collapseAllInCurrent:function(){$(".msg_inline_img_collapser").trigger("click")
},expand:function(f,g){TS.model.expandable_state["img_"+f+g]=true;
TS.storage.storeExpandableState(TS.model.expandable_state);
var a="#"+TS.utility.makeSafeForDomId(f);
var b=$(a);
if(!b.length){return
}var d=(TS.client&&TS.client.ui.areMsgsScrolledToBottom());
var c=function(h){return $(this).data("real-src")==g
};
var e=(TS.boot_data.feature_attachments_inline)?b.find(".inline_attachment").filter(c):null;
if(!e||!e.length){e=b.find(".msg_inline_img_holder").filter(c)
}e.removeClass("hidden");
b.find(".msg_inline_img_expander").filter(c).addClass("hidden");
b.find(".msg_inline_img_collapser").filter(c).removeClass("hidden");
b.find(".too_large_for_auto_expand").addClass("hidden");
b.find(".inline_img_bytes").removeClass("hidden");
if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}e.css("opacity",0).stop().animate({opacity:1},300);
if(!TS.inline_imgs.no_scrolling){if(TS.client&&d){TS.client.ui.instaScrollMsgsToBottom(false);
e.scrollintoview({duration:0,offset:"top",px_offset:10,direction:"y"})
}else{e.scrollintoview({duration:200,offset:"bottom",px_offset:-10,direction:"y"})
}}if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}},collapse:function(e,f){TS.model.expandable_state["img_"+e+f]=false;
TS.storage.storeExpandableState(TS.model.expandable_state);
var a="#"+TS.utility.makeSafeForDomId(e);
var b=$(a);
if(!b.length){return
}var c=function(g){return $(this).data("real-src")==f
};
var d=(TS.boot_data.feature_attachments_inline)?b.find(".inline_attachment").filter(c):null;
if(!d||!d.length){d=b.find(".msg_inline_img_holder").filter(c)
}d.css("visibility","hidden");
b.find(".msg_inline_img_expander").filter(c).removeClass("hidden");
b.find(".msg_inline_img_collapser").filter(c).addClass("hidden");
setTimeout(function(){d.addClass("hidden");
d.css("visibility","visible")
},200)
},checkForInlineImgClick:function(g,b){if(!g.target){return
}var c=$(g.target);
var a=c.closest(".message").data("ts");
var f=TS.templates.makeMsgDomId(a);
if(b){a=c.closest(".search_message_result").data("ts");
f=TS.templates.makeMSRDomId(b)
}if(!a){return
}a=a.toString();
var d=c.closest(".too_large_but_expand_anyway");
if(d.length){g.preventDefault();
TS.inline_imgs.expand(f,d.data("real-src"))
}var i=c.closest(".msg_inline_img_expander");
if(i.length){g.preventDefault();
TS.inline_imgs.expand(f,i.data("real-src"))
}var h=c.closest(".msg_inline_img_collapser");
if(h.length){g.preventDefault();
TS.inline_imgs.collapse(f,h.data("real-src"))
}},makeInternalInlineImg:function(c,b){var e=400;
var a=500;
if(TS.boot_data.feature_fix_files&&TS.qs_args["480_thumbs"]=="1"&&b.internal_file_id){e=500;
a=600
}if(TS.model.inline_imgs[c]){b.internal_file_id=TS.model.inline_imgs[c].internal_file_id||b.internal_file_id;
b.link_url=TS.model.inline_imgs[c].link_url||b.link_url;
b.src=TS.model.inline_imgs[c].src||b.src
}TS.model.inline_imgs[c]=b;
b.src=b.src||c;
b.bytes=parseInt(b.bytes);
b.width=b.display_w=parseInt(b.width);
b.height=b.display_h=parseInt(b.height);
if(b.display_w>e){b.display_w=e;
b.display_h=parseInt(b.height*(b.display_w/b.width))
}if(b.display_h>a){b.display_h=a;
b.display_w=parseInt(b.width*(b.display_h/b.height))
}var d=TS.utility.getImgProxyURL(b.src,b.display_w,b.display_h);
if(d!=b.src){b.proxied_src=d
}else{delete b.proxied_src
}}})
})();
(function(){TS.registerModule("inline_videos",{no_scrolling:false,onStart:function(){},shouldExpand:function(b,a){if(TS.model.expandable_state["vid_"+b+a.src]){return true
}if(TS.model.expandable_state["vid_"+b+a.src]===false){return false
}if(a.internal_file_id){return TS.model.prefs.expand_internal_inline_imgs
}return TS.model.prefs.expand_inline_imgs
},expandAllInCurrent:function(){TS.inline_videos.no_scrolling=true;
$(".msg_inline_video_expander").trigger("click");
TS.inline_videos.no_scrolling=false;
if(TS.client){TS.client.ui.instaScrollMsgsToBottom(false)
}},collapseAllInCurrent:function(){$(".msg_inline_video_collapser").trigger("click")
},expand:function(f,g){TS.model.expandable_state["vid_"+f+g]=true;
TS.storage.storeExpandableState(TS.model.expandable_state);
var a="#"+TS.utility.makeSafeForDomId(f);
var b=$(a);
if(!b.length){return
}var d=(TS.client&&TS.client.ui.areMsgsScrolledToBottom());
var c=function(h){return $(this).data("real-src")==g
};
var e=(TS.boot_data.feature_attachments_inline)?b.find(".inline_attachment").filter(c):null;
if(!e||!e.length){e=b.find(".msg_inline_video_holder").filter(c)
}e.find(".msg_inline_video_thumb_div").removeClass("hidden");
e.removeClass("hidden");
b.find(".msg_inline_video_expander").filter(c).addClass("hidden");
b.find(".msg_inline_video_collapser").filter(c).removeClass("hidden");
if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}e.css("opacity",0).stop().animate({opacity:1},300);
if(!TS.inline_videos.no_scrolling){if(TS.client&&d){TS.client.ui.instaScrollMsgsToBottom(false);
b.children().first().scrollintoview({duration:0,offset:"top",px_offset:10,direction:"y"})
}else{b.find(".msg_inline_video").last().scrollintoview({duration:200,offset:"bottom",px_offset:-10,direction:"y"})
}}if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}},collapse:function(e,f){TS.model.expandable_state["vid_"+e+f]=false;
TS.storage.storeExpandableState(TS.model.expandable_state);
var a="#"+TS.utility.makeSafeForDomId(e);
var b=$(a);
if(!b.length){return
}var c=function(g){return $(this).data("real-src")==f
};
var d=(TS.boot_data.feature_attachments_inline)?b.find(".inline_attachment").filter(c):null;
if(!d||!d.length){d=b.find(".msg_inline_video_holder").filter(c)
}d.css("visibility","hidden");
b.find(".msg_inline_video_expander").filter(c).removeClass("hidden");
b.find(".msg_inline_video_collapser").filter(c).addClass("hidden");
d.find(".msg_inline_video_iframe_div").html("");
setTimeout(function(){d.addClass("hidden");
d.css("visibility","visible")
},200)
},checkForInlineVideoClick:function(k,j){if(!k.target){return
}var n=$(k.target);
var f=n.closest(".message").data("ts");
var h=TS.templates.makeMsgDomId(f);
if(!f&&j){f=n.closest(".search_message_result").data("ts");
h=TS.templates.makeMSRDomId(j)
}if(!f){return
}f=f.toString();
var i=n.closest(".msg_inline_video_expander");
if(i.length){k.preventDefault();
TS.inline_videos.expand(h,i.data("real-src"));
return
}var m=n.closest(".msg_inline_video_collapser");
if(m.length){k.preventDefault();
TS.inline_videos.collapse(h,m.data("real-src"));
return
}var b=n.closest(".msg_inline_video_play_button");
if(b.length){var d=b.closest(".msg_inline_video_holder");
var l=d.find(".msg_inline_video_iframe_div");
l.removeClass("hidden");
d.find(".msg_inline_video_thumb_div").addClass("hidden");
var a=l.data("url");
var c=TS.model.inline_videos[a];
if(!c){var g=a.replace(/\&/g,"&amp;");
c=TS.model.inline_videos[g]
}if(c){l.html(c.html)
}else{l.html('<div style="padding:10px; color:white">Error: unable to find "'+TS.utility.htmlEntities(a)+'" in TS.model.inline_videos</div>')
}return
}},makeInternalInlineVideo:function(k,d){var a=400;
var j=500;
TS.model.inline_videos[k]=d;
d.src=d.thumbnail.url||k;
d.width=d.display_w=parseInt(d.thumbnail.width);
d.height=d.display_h=parseInt(d.thumbnail.height);
if(d.display_w>a){d.display_w=a;
d.display_h=parseInt(d.height*(d.display_w/d.width))
}if(d.display_h>j){d.display_h=j;
d.display_w=parseInt(d.width*(d.display_h/d.height))
}if(!d.html){d.html="MISSING video.html"
}if(d.html.indexOf("gfycat.com/ifr")>-1){var f=$(d.html);
var g=f.attr("src");
var e=g.split("ifr/")[1];
var b=f.attr("width");
var i=f.attr("height");
var c="https://"+document.location.host+"/gfycat_iframe.php?key="+e+"&w="+b+"&h="+i+"&"+Date.now();
f.attr("src",c);
d.html=f[0].outerHTML
}d.html=d.html.replace("http://","//");
if(d.html.indexOf("oldwidth")==-1){d.html=d.html.replace(" width=",' width="'+d.display_w+'" oldwidth=');
d.html=d.html.replace(" height=",' height="'+d.display_h+'" oldheight=')
}if(d.html.indexOf("autoplay")==-1){d.html=d.html.replace("feature=oembed","feature=oembed&autoplay=1");
d.html=d.html.replace('" width','?autoplay=1" width')
}d.html=TS.utility.swapInRedirUrlForIframe(d.html);
var h=TS.utility.getImgProxyURL(d.src,d.display_w,d.display_h);
if(h!=d.src){d.proxied_src=h
}else{delete d.proxied_src
}}})
})();
(function(){TS.registerModule("inline_attachments",{no_scrolling:false,onStart:function(){},shouldExpand:function(b,a){if(TS.model.expandable_state["attach_"+b+a.from_url]){return true
}if(TS.model.expandable_state["attach_"+b+a.from_url]===false){return false
}return true
},shouldShow:function(b,a){if(!b.from_url){return true
}if(a&&a.text){if(a.text.indexOf(b.from_url)==-1){if(TS.model.ampersands_are_inconsistent_in_from_urls){if(a.text.indexOf(b.from_url.replace(/\&/g,"&amp;"))==-1){return true
}}else{return true
}}}if(TS.model.prefs.expand_inline_imgs){if(b.audio_html){return true
}if(b.other_html){return true
}if(b.video_html){return true
}if(b.image_url){return true
}if(b.service_name&&b.service_name.toString().toLowerCase()=="twitter"){return true
}}return !!TS.model.prefs.expand_non_media_attachments
},expandAllInCurrent:function(){TS.inline_attachments.no_scrolling=true;
$(".msg_inline_attachment_expander").trigger("click");
TS.inline_attachments.no_scrolling=false;
if(TS.client){TS.client.ui.instaScrollMsgsToBottom(false)
}},collapseAllInCurrent:function(){$(".msg_inline_attachment_collapser").trigger("click")
},expand:function(f,g){TS.model.expandable_state["attach_"+f+g]=true;
TS.storage.storeExpandableState(TS.model.expandable_state);
var a="#"+TS.utility.makeSafeForDomId(f);
var b=$(a);
if(!b.length){return
}var d=(TS.client&&TS.client.ui.areMsgsScrolledToBottom());
var c=function(h){return $(this).data("real-src")==g
};
var e=b.find(".inline_attachment").filter(c);
e.removeClass("hidden");
b.find(".msg_inline_attachment_expander").filter(c).addClass("hidden");
b.find(".msg_inline_attachment_collapser").filter(c).removeClass("hidden");
if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}e.css("opacity",0).stop().animate({opacity:1},300);
if(!TS.inline_attachments.no_scrolling){if(TS.client&&d){TS.client.ui.instaScrollMsgsToBottom(false);
b.children().first().scrollintoview({duration:0,offset:"top",px_offset:10,direction:"y"})
}else{e.scrollintoview({duration:200,offset:"bottom",px_offset:-10,direction:"y"})
}}if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}},collapse:function(e,f){TS.model.expandable_state["attach_"+e+f]=false;
TS.storage.storeExpandableState(TS.model.expandable_state);
var a="#"+TS.utility.makeSafeForDomId(e);
var b=$(a);
if(!b.length){return
}var c=function(g){return $(this).data("real-src")==f
};
var d=b.find(".inline_attachment").filter(c);
if(!d.length){d=b.find(".msg_inline_attachment_holder").filter(c)
}d.css("visibility","hidden");
b.find(".msg_inline_attachment_expander").filter(c).removeClass("hidden");
b.find(".msg_inline_attachment_collapser").filter(c).addClass("hidden");
setTimeout(function(){d.addClass("hidden");
d.css("visibility","visible")
},200)
},checkForInlineAttachmentClick:function(q,h){if(!q.target){return
}var u=$(q.target);
var o=u.closest(".message").data("ts");
var m=TS.templates.makeMsgDomId(o);
if(!o&&h){o=u.closest(".search_message_result").data("ts");
m=TS.templates.makeMSRDomId(h)
}if(!o){return
}o=o.toString();
var r=u.closest(".msg_inline_attachment_expander");
if(r.length){q.preventDefault();
TS.inline_attachments.expand(m,r.data("real-src"))
}var p=u.closest(".msg_inline_attachment_collapser");
if(p.length){q.preventDefault();
TS.inline_attachments.collapse(m,p.data("real-src"))
}var n=u.closest(".rest_text_expander");
if(n.length){q.preventDefault();
var a=(TS.client&&TS.client.ui.areMsgsScrolledToBottom());
var b=n.parent().find(".short_text");
var t;
var k=n.parent().find(".more_text");
if(n.data("show-text")){if(k.length){k.addClass("hidden");
t=n.find("a span");
n.data("hide-text",t.text());
t.text(n.data("show-text"));
n.data("show-text","");
n.find("a .fa").removeClass("ts_icon_caret_down").addClass("ts_icon_caret_right")
}}else{if(b.data("all-text")){b.html(b.data("all-text"));
b.data("all-text","")
}if(k.length){k.removeClass("hidden")
}if(k.length&&n.data("hide-text")){t=n.find("a span");
n.data("show-text",t.text());
t.text(n.data("hide-text"));
n.data("hide-text","");
n.find("a .fa").removeClass("ts_icon_caret_right").addClass("ts_icon_caret_down")
}else{n.css("display","none")
}}b.css("opacity",0).transition({opacity:1},300);
TS.inline_attachments.rest_texts_expanded[n.attr("id")]=true;
if(TS.client){TS.client.ui.updateClosestMonkeyScroller(b)
}if(TS.client&&a){TS.client.ui.instaScrollMsgsToBottom(false);
b.scrollintoview({duration:0,offset:"top",px_offset:10,direction:"y"})
}}var l=u.closest(".delete_attachment_link");
if(l.length){q.preventDefault();
var d=l.data("attachment-id").toString();
var j=TS.shared.getActiveModelOb();
if(!j){alert("missing model_ob");
return
}if(!d){alert("missing attachment-id");
return
}var s=j.id;
var g=TS.utility.msgs.getMsg(o,j.msgs);
var f="";
if(TS.model.user.is_admin){var i=TS.inline_attachments.getAttachmentById(g.attachments,d);
if(i&&i.from_url){var c=TS.inline_attachments.makeBlackListSelect(i.from_url);
f='						<p class="large_left_margin '+(c?"no_bottom_margin":"")+'">							<label class="checkbox normal" style="font-size: 16px;">								<input id="attachment_blacklist_cb" type="checkbox" class="small_right_margin" />								Disable future attachments from this website?</label>';
if(c){f+=c
}f+="</p>"
}}TS.generic_dialog.start({title:"Remove attachment",body:'<p class="'+(f?"small_bottom_margin":"")+'">Are you sure you wish to remove this attachment from the message?</p>'+f,go_button_text:"Yes, remove",on_show:function(){$("#attachment_blacklist_cb").bind("change",function(){var e=!!$("#attachment_blacklist_cb").prop("checked");
TS.info(e);
if(e){$("#attachment_blacklist_select").prop("disabled",false)
}else{$("#attachment_blacklist_select").prop("disabled",true)
}})
},on_go:function(){var x=!!$("#attachment_blacklist_cb").prop("checked");
var v=x?$("#attachment_blacklist_select").val():"none";
var e=x?$("#attachment_blacklist_select").find(":selected").data("url"):"";
var w={channel:s,ts:o,attachment:d,blacklist:x,blacklist_type:v,blacklist_url:e};
TS.dir(0,w);
TS.api.call("chat.deleteAttachment",w,function(z,A,y){if(z){if(TS.web){g.attachments=TS.inline_attachments.removeAttachmentById(g.attachments,d);
TS.utility.msgs.replaceMsg(j,g)
}}else{TS.generic_dialog.alert("Attachment removing failed!")
}})
}})
}},makeBlackListSelect:function(a){if(!a){return""
}a=TS.utility.htmlEntities(a).replace("https://","").replace("http://","");
var b="";
var g=a.split("/");
var f=g[0];
var e=g[g.length-1];
b+='<select id="attachment_blacklist_select" disabled="disabled" class="input-xlarge">\r';
b+='<option value="all" data-url="'+f+'">All links from '+f+"</option>\r";
b+='<option value="just" data-url="'+a+'">Just the link '+a+"</option>\r";
if(e!=f){TS.info(e);
var d=g.concat();
d.length=d.length-1;
var c=d.join("/");
if(c!=f){c+="/";
b+='<option value="under" data-url="'+c+'">All links under '+c+"</option>\r"
}}b+="</select>\r";
return b
},rest_texts_expanded:{},shouldExpandText:function(a){return !!TS.inline_attachments.rest_texts_expanded[a]
},makeInternalInlineAttachment:function(a,b){TS.model.inline_attachments[a]=b
},renderStandaloneAttachment:function(d){TS.inline_attachments.massageAttachment(d,0);
if(d.image_url&&!TS.model.inline_imgs[d.from_url]){TS.inline_imgs.makeInternalInlineImg(d.from_url,{link_url:d.from_url,bytes:d.image_bytes,src:d.image_url,width:d.image_width,height:d.image_height,set_height:false})
}if(d.video_html&&!TS.model.inline_videos[d.from_url]){TS.inline_videos.makeInternalInlineVideo(d.from_url,{src:d.thumb_url,html:d.video_html,proxied_src:d.proxied_thumb_url,title:d.title,display_h:d.video_html_height,display_w:d.video_html_width,thumbnail:{link_url:d.from_url,url:d.thumb_url,height:d.thumb_height,width:d.thumb_width}})
}var b=TS.utility.date.makeTsStamp();
var a=TS.templates.builders.buildAttachmentHTML({attachment:d,msg:{enable_slack_action_links:false,text:d.from_url,ts:b,url:d.from_url},can_delete:false,maybe_show_lightbox:false});
var c=TS.templates.makeMsgDomId(b);
return'<div class="message standalone-attachment" id="'+c+'" data-ts="'+b+'">'+a+"</div>"
},massageAttachment:function(f,j){f._index=j;
if("id" in f){f.id=f.id.toString()
}var h=500;
var p=3;
var a="";
if(f.text){var o="";
var n="";
var k;
var m=0;
var d=false;
for(var b=0;
b<f.text.length;
b++){k=f.text.charAt(b);
if(n||k=="<"){n+=k;
if(k==">"){a+=n;
n="";
if(a.length>h){d=true
}}}else{if(k=="\n"){m++
}if(m>p+1){o=f.text.replace(a,"");
break
}a+=k;
if(a.length>h){d=true
}if(d&&k==" "){o=f.text.replace(a,"");
break
}}}f._short_text=(a==f.text)?"":a;
var e=a.match(/```/g);
var l=o.match(/```/g);
if(e&&l){f._short_text+="```"
}}f._floated_thumb_display_height=75;
f._floated_thumb_display_width=75;
if(f.thumb_height&&f.thumb_width){if(f.thumb_height>f.thumb_width){f._floated_thumb_display_width=parseInt(f.thumb_width*(f._floated_thumb_display_height/f.thumb_height))
}else{f._floated_thumb_display_height=parseInt(f.thumb_height*(f._floated_thumb_display_width/f.thumb_width))
}}var g=TS.utility.getImgProxyURL(f.thumb_url,f._floated_thumb_display_width,f._floated_thumb_display_height);
if(g!=f.thumb_url){f.proxied_thumb_url=g
}else{delete f.proxied_thumb_url
}},getAttachmentByFromUrl:function(a,b){if(!a){return null
}for(var c=0;
c<a.length;
c++){if(!a[c]){TS.info(b);
TS.dir(0,a);
continue
}if(!a[c].from_url){continue
}if(a[c].from_url==b){return a[c]
}if(TS.model.ampersands_are_inconsistent_in_from_urls){if(a[c].from_url.replace(/\&/g,"&amp;")==b){return a[c]
}}}return null
},getAttachmentBySlackFileId:function(a,b){if(!a){return null
}if(!b){return null
}for(var c=0;
c<a.length;
c++){if(!a[c]){continue
}if(a[c].slack_file_id==b){return a[c]
}}return null
},removeAttachmentById:function(b,d){if(!b){return null
}var a=[];
for(var c=0;
c<b.length;
c++){if(b[c].id!=d){a.push(b[c])
}}return a
},getAttachmentById:function(a,c){if(!a){return null
}for(var b=0;
b<a.length;
b++){if(a[b].id==c){return a[b]
}}return null
}})
})();
(function(){TS.registerModule("inline_audios",{no_scrolling:false,onStart:function(){},shouldExpand:function(b,a){if(TS.model.expandable_state["aud_"+b+TS.utility.htmlEntities(a.src)]){return true
}if(TS.model.expandable_state["aud_"+b+TS.utility.htmlEntities(a.src)]===false){return false
}if(a.internal_file_id){return TS.model.prefs.expand_internal_inline_imgs
}return TS.model.prefs.expand_inline_imgs
},expandAllInCurrent:function(){TS.inline_audios.no_scrolling=true;
$(".msg_inline_audio_expander").trigger("click");
TS.inline_audios.no_scrolling=false;
if(TS.client){TS.client.ui.instaScrollMsgsToBottom(false)
}},collapseAllInCurrent:function(){$(".msg_inline_audio_collapser").trigger("click")
},expand:function(f,g){TS.model.expandable_state["aud_"+f+TS.utility.htmlEntities(g)]=true;
TS.storage.storeExpandableState(TS.model.expandable_state);
var a="#"+TS.utility.makeSafeForDomId(f);
var b=$(a);
if(!b.length){return
}var d=(TS.client&&TS.client.ui.areMsgsScrolledToBottom());
var c=function(h){return $(this).data("real-src")==g
};
var e=(TS.boot_data.feature_attachments_inline)?b.find(".inline_attachment").filter(c):null;
if(!e||!e.length){e=b.find(".msg_inline_audio_holder").filter(c)
}e.removeClass("hidden");
b.find(".msg_inline_audio_expander").filter(c).addClass("hidden");
b.find(".msg_inline_audio_collapser").filter(c).removeClass("hidden");
if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}e.css("opacity",0).stop().animate({opacity:1},300);
if(!TS.inline_audios.no_scrolling){if(TS.client&&d){TS.client.ui.instaScrollMsgsToBottom(false);
b.children().first().scrollintoview({duration:0,offset:"top",px_offset:10,direction:"y"})
}else{b.find(".msg_inline_audio").last().scrollintoview({duration:200,offset:"bottom",px_offset:-10,direction:"y"})
}}if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}},collapse:function(e,f){TS.model.expandable_state["aud_"+e+TS.utility.htmlEntities(f)]=false;
TS.storage.storeExpandableState(TS.model.expandable_state);
var a="#"+TS.utility.makeSafeForDomId(e);
var b=$(a);
if(!b.length){return
}var c=function(g){return $(this).data("real-src")==f
};
var d=(TS.boot_data.feature_attachments_inline)?b.find(".inline_attachment").filter(c):null;
if(!d||!d.length){d=b.find(".msg_inline_audio_holder").filter(c)
}d.css("visibility","hidden");
b.find(".msg_inline_audio_expander").filter(c).removeClass("hidden");
b.find(".msg_inline_audio_collapser").filter(c).addClass("hidden");
d.find(".msg_inline_audio_iframe_div").html("");
setTimeout(function(){d.addClass("hidden");
d.css("visibility","visible")
},200)
},checkForInlineAudioClick:function(h,g){if(!h.target){return
}var j=$(h.target);
var c=j.closest(".message").data("ts");
var d=TS.templates.makeMsgDomId(c);
if(!c&&g){c=j.closest(".search_message_result").data("ts");
d=TS.templates.makeMSRDomId(g)
}if(!c){return
}c=c.toString();
var i=j.closest(".msg_inline_audio_expander");
if(i.length){h.preventDefault();
TS.inline_audios.expand(d,i.data("real-src"))
}var f=j.closest(".msg_inline_audio_collapser");
if(f.length){h.preventDefault();
TS.inline_audios.collapse(d,f.data("real-src"))
}var b=j.closest(".inline_audio_play_link");
if(b.length){h.preventDefault();
var a=b.attr("href");
return alert("play "+a)
}},makeInternalInlineAudio:function(a,b){if(!b.audio_html){return
}b.safe_audio_html=b.audio_html;
b.safe_audio_html=TS.utility.swapInRedirUrlForIframe(b.safe_audio_html);
if(TS.client){b.safe_audio_html=TS.utility.getPlaceholderHTMLFromIframe(b.safe_audio_html)
}TS.model.inline_audios[a]={src:TS.utility.htmlEntities(b.audio_url||b.audio_html),attachment:b}
}})
})();
(function(){TS.registerModule("inline_others",{no_scrolling:false,onStart:function(){},shouldExpand:function(b,c){if(TS.model.expandable_state["vid_"+b+c.src]){return true
}if(TS.model.expandable_state["vid_"+b+c.src]===false){return false
}if(c.internal_file_id){return TS.model.prefs.expand_internal_inline_imgs
}return TS.model.prefs.expand_inline_imgs
},expandAllInCurrent:function(){TS.inline_others.no_scrolling=true;
$(".msg_inline_other_expander").trigger("click");
TS.inline_others.no_scrolling=false;
if(TS.client){TS.client.ui.instaScrollMsgsToBottom(false)
}},collapseAllInCurrent:function(){$(".msg_inline_other_collapser").trigger("click")
},expand:function(g,h){TS.model.expandable_state["vid_"+g+h]=true;
TS.storage.storeExpandableState(TS.model.expandable_state);
var b="#"+TS.utility.makeSafeForDomId(g);
var c=$(b);
if(!c.length){return
}var e=(TS.client&&TS.client.ui.areMsgsScrolledToBottom());
var d=function(j){return $(this).data("real-src")==h
};
var f=(TS.boot_data.feature_attachments_inline)?c.find(".inline_attachment").filter(d):null;
if(!f||!f.length){f=c.find(".msg_inline_other_holder").filter(d)
}f.removeClass("hidden");
c.find(".msg_inline_other_expander").filter(d).addClass("hidden");
c.find(".msg_inline_other_collapser").filter(d).removeClass("hidden");
if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}f.css("opacity",0).stop().animate({opacity:1},300);
if(!TS.inline_others.no_scrolling){if(TS.client&&e){TS.client.ui.instaScrollMsgsToBottom(false);
c.children().first().scrollintoview({duration:0,offset:"top",px_offset:10,direction:"y"})
}else{c.find(".msg_inline_other").last().scrollintoview({duration:200,offset:"bottom",px_offset:-10,direction:"y"})
}}if(TS.client){TS.client.ui.checkInlineImgsAndIframesEverywhere()
}},collapse:function(f,g){TS.model.expandable_state["vid_"+f+g]=false;
TS.storage.storeExpandableState(TS.model.expandable_state);
var b="#"+TS.utility.makeSafeForDomId(f);
var c=$(b);
if(!c.length){return
}var d=function(h){return $(this).data("real-src")==g
};
var e=(TS.boot_data.feature_attachments_inline)?c.find(".inline_attachment").filter(d):null;
if(!e||!e.length){e=c.find(".msg_inline_other_holder").filter(d)
}e.css("visibility","hidden");
c.find(".msg_inline_other_expander").filter(d).removeClass("hidden");
c.find(".msg_inline_other_collapser").filter(d).addClass("hidden");
e.find(".msg_inline_other_iframe_div").html("");
setTimeout(function(){e.addClass("hidden");
e.css("visibility","visible")
},200)
},checkForInlineOtherClick:function(h,c){if(!h.target){return
}var d=$(h.target);
var b=d.closest(".message").data("ts");
var g=TS.templates.makeMsgDomId(b);
if(!b&&c){b=d.closest(".search_message_result").data("ts");
g=TS.templates.makeMSRDomId(c)
}if(!b){return
}b=b.toString();
var f=d.closest(".msg_inline_other_expander");
if(f.length){h.preventDefault();
TS.inline_others.expand(g,f.data("real-src"));
return
}var i=d.closest(".msg_inline_other_collapser");
if(i.length){h.preventDefault();
TS.inline_others.collapse(g,i.data("real-src"));
return
}},makeInternalInlineOther:function(g){var f=400;
var b=500;
if(g.other_html_width>f){g.other_html_height=parseInt(g.other_html_height*(f/g.other_html_width));
g.other_html_width=f
}if(g.other_html_height>b){g.other_html_width=parseInt(g.other_html_width*(b/g.other_html_height));
g.other_html_height=b
}var e;
if(g.google_map_config){try{e=JSON.parse(g.google_map_config)
}catch(d){}}if(e&&e.center&&(typeof e.center.lat!="string")){e.scrollwheel=false;
var c="googmap_"+(a++);
g.other_html='<div class="google-maps" id="'+c+'" style="width:100%; min-width:'+TS.utility.htmlEntities(g.other_html_width)+"px; height:"+TS.utility.htmlEntities(g.other_html_height)+'px;"></div>			<script>TS.inline_others.runGoogleMapCode("'+c+"\", '"+JSON.stringify(e)+"')<\/script>";
g.safe_other_html=g.other_html
}else{if(g.other_html.indexOf("oldwidth")==-1){g.other_html=g.other_html.replace(" width=",' width="'+g.other_html_width+'" oldwidth=');
g.other_html=g.other_html.replace(" height=",' height="'+g.other_html_height+'" oldheight=')
}g.safe_other_html=g.other_html;
g.safe_other_html=TS.utility.swapInRedirUrlForIframe(g.safe_other_html);
if(TS.client){g.safe_other_html=TS.utility.getPlaceholderHTMLFromIframe(g.safe_other_html)
}}TS.model.inline_others[g.other_html]={src:TS.utility.htmlEntities(g.other_html),attachment:g}
},runGoogleMapCode:function(b,e){if(!window.google){return
}if(!e){return
}var c=JSON.parse(e);
var g=new google.maps.Map(document.getElementById(b),c);
if(!c.query){return
}var f=new google.maps.Geocoder();
var h=(typeof c.max_results=="number")?c.max_results:10;
if(h<0){h=Number.MAX_VALUE
}var d=function(){google.maps.event.clearListeners(g,"bounds_changed");
var k=g.getBounds();
var j=0;
var i=function(m){new google.maps.Marker({map:g,position:m.geometry.location});
j++
};
var l=function(q,o){var p=false;
if(o==google.maps.GeocoderStatus.OK){q.slice(0,h).map(function(r){i(r);
p=p||!r.partial_match
})
}else{TS.warn("Geocoder failed due to: "+o)
}if(!p&&j<h){var n=new google.maps.places.PlacesService(g);
var m=function(s,r){if(r==google.maps.places.PlacesServiceStatus.OK){s.slice(0,h-j).map(i)
}else{TS.warn("PlacesService failed due to: "+r)
}};
n.nearbySearch({bounds:k,name:c.query},m)
}};
f.geocode({address:c.query,bounds:k},l)
};
google.maps.event.addListener(g,"bounds_changed",d)
}});
var a=0
})();
(function(){TS.registerModule("newxp",{slideshow_state:{slide:1,count:-1},onStart:function(){},shouldShowFirstWelcome:function(){if(!TS.model.welcome_model_ob.id){return false
}var a=TS.shared.getActiveModelOb();
if(!a){return false
}if(a.id==TS.model.welcome_model_ob.id){return true
}return false
},updateStartChecks:function(){if(!TS.model.user.is_admin){return
}if(TS.model.prefs.has_invited){$("#welcome_start_invite").find(".check").removeClass("ts_icon_square_o").addClass("ts_icon_check_circle_o")
}if(TS.model.prefs.has_uploaded){$("#welcome_start_upload").find(".check").removeClass("ts_icon_square_o").addClass("ts_icon_check_circle_o")
}if(TS.model.prefs.has_created_channel){$("#welcome_start_channel").find(".check").removeClass("ts_icon_square_o").addClass("ts_icon_check_circle_o")
}},initSlideShow:function(){if(TS.model.user.is_ultra_restricted){var c=TS.channels.getChannelsForUser();
var e="";
var f="";
if(c.length){e="#"+c[0].name;
f="channel"
}else{var b=TS.groups.getUnarchivedGroups();
if(b.length){e=b[0].name;
f="group"
}}$("#ura_channel_name").html("<b>"+e+"</b> "+f)
}var a=$("#end_display_welcome_general_div");
var g=$("#welcome_slides_nav");
var d=$("#welcome_slides_dots");
var h=TS.newxp.slideshow_state;
h.count=a.find(".welcome_slide").length;
if(TS.model.prefs.seen_welcome_2){h.slide=h.count
}else{TS.model.seen_welcome_2_this_session=true
}g.find(".welcome_slides_back").bind("click.slideshow",TS.newxp.slideShowBack);
g.find(".welcome_slides_continue").bind("click.slideshow",TS.newxp.slideShowContinue);
g.find(".welcome_slides_done").bind("click.slideshow",TS.newxp.slideShowContinue);
d.find("a").bind("click.slideshow",function(){TS.newxp.slideShowSlideFromDot($(this).data("slide"))
});
if(h.count<3){d.css({visibility:"hidden"})
}TS.newxp.slideShowTransition(true)
},slideShowTransition:function(g){var a=$("#end_display_welcome_general_div");
var d=$("#welcome_slides_nav");
var b=$("#welcome_slides_dots");
var e=TS.newxp.slideshow_state;
a.find(".welcome_slide").addClass("hidden");
var f=a.find("#welcome_slide_"+e.slide);
if(g){f.removeClass("hidden").css("opacity",100)
}else{f.removeClass("hidden").css("opacity",0).transition({opacity:100},400)
}d.find(".welcome_slides_back").addClass("hidden");
d.find(".welcome_slides_continue").addClass("hidden");
d.find(".welcome_slides_done").addClass("hidden");
b.find("a").removeClass("active");
var c=false;
if(e.slide==e.count-1){if(c){d.find(".welcome_slides_back").removeClass("hidden")
}d.find(".welcome_slides_done").removeClass("hidden");
b.find('a[data-slide="2"]').addClass("active")
}else{if(e.slide==1){d.find(".welcome_slides_continue").removeClass("hidden");
b.find('a[data-slide="1"]').addClass("active")
}else{if(e.slide==e.count){if(c){d.find(".welcome_slides_back").removeClass("hidden")
}if(!TS.model.prefs.seen_welcome_2){TS.prefs.setPrefByAPI({name:"seen_welcome_2",value:true})
}b.addClass("hidden").find('a[data-slide="3"]').addClass("active");
TS.model.prefs.seen_welcome_2=true
}else{if(c){d.find(".welcome_slides_back").removeClass("hidden")
}d.find(".welcome_slides_continue").removeClass("hidden")
}}}},slideShowBack:function(){var a=TS.newxp.slideshow_state;
if(a.slide==1){return
}a.slide--;
TS.newxp.slideShowSlide(a.slide)
},slideShowContinue:function(){var a=TS.newxp.slideshow_state;
if(a.slide==a.count){return
}if(a.slide===1){mixpanel_track("newxp_1")
}if(a.slide===2){mixpanel_track("newxp_2")
}a.slide++;
TS.newxp.slideShowSlide(a.slide)
},slideShowSlideFromDot:function(b){var a=TS.newxp.slideshow_state;
if(a.slide==b){return
}TS.newxp.slideShowSlide(b)
},slideShowSlide:function(g){var a=TS.newxp.slideshow_state;
var e=g==a.count;
if(e){var f=$("#welcome_slides_nav");
TS.tips.animateInInititalThrobbers(f.find(".welcome_slides_done"))
}a.slide=g;
TS.newxp.slideShowTransition();
if(e){TS.view.unAdjustForWelcomeSlideShow(true);
var b=TS.model.welcome_model_ob;
if(!b.id){return
}var h=0;
for(var c=0;
c<b.msgs.length;
c++){if(b.msgs[c].no_display){continue
}h++
}if(h&&TS.client.ui.$msgs_scroller_div[0].scrollHeight>TS.client.ui.$msgs_scroller_div[0].clientHeight){var d=(TS.utility.msgs.getOlderMsgsStatus(b).more)?"+":"";
var j=(h==1)?"is 1 message":"are "+h+d+" messages";
$("#scroll_to_general_bottom").removeClass("hidden").html("There "+j+" in "+b.name+'. <a style="cursor:pointer">Click to scroll down</a>').find("a").bind("click",function(){$("#scroll_to_general_bottom").addClass("hidden");
TS.client.ui.slowScrollMsgsToBottom();
if(d){TS.client.msg_pane.updateEndMarker();
TS.client.msg_pane.padOutMsgsScroller()
}})
}}}})
})();
(function(){TS.registerModule("comments",{onStart:function(){}})
})();
(function(){TS.registerModule("comments.ui",{editing_file:null,editing_comment:null,editing:false,$edit_form:null,bound:false,onStart:function(){TS.comments.ui.$edit_form=$("#file_edit_comment_form");
TS.comments.ui.bindInput($("#file_comment"))
},bindInput:function(a,b){a.TS_tabComplete2({complete_cmds:false,complete_channels:true,complete_emoji:true,complete_member_specials:false,onComplete:function(c){TS.utility.populateInput(a,c)
}});
a.bind("keydown.cmd_submit",function(c){if(c.which===TS.utility.keymap.enter&&!TS.utility.cmdKey(c)){if(a.tab_complete_ui("isShowing")){c.preventDefault()
}return
}if(c.which==TS.utility.keymap.enter&&TS.utility.cmdKey(c)){if(b){b()
}else{$(this).closest("form").submit()
}c.preventDefault()
}});
a.tab_complete_ui({id:"comment_input_tab_ui",min_width:300,narrow:!!TS.client,no_model_ob:true,scroll_with_element:!!TS.client})
},bindEditForm:function(){TS.comments.ui.bound=true;
var a=TS.comments.ui.$edit_form;
$("#file_edit_comment").css("overflow","hidden").autogrow();
TS.comments.ui.bindInput($("#file_edit_comment"));
a.unbind("submit").bind("submit",TS.comments.ui.submitEditForm);
a.find(".save").unbind("click").bind("click",function(b){TS.comments.ui.submitEditForm();
return false
});
a.find(".cancel").unbind("click").bind("click",function(b){TS.comments.ui.onEndEdit();
return false
});
a.unbind("destroyed").bind("destroyed",function(){$("#file_comment_form").after($(this)[0].outerHTML);
TS.comments.ui.$edit_form=$("#file_edit_comment_form");
TS.comments.ui.bound=false;
if(!TS.comments.ui.editing){return
}TS.comments.ui.onEndEdit()
})
},submitEditForm:function(){var a=$("#file_edit_comment").val();
if(!$.trim(a)){if(TS.client){TS.sounds.play("beep")
}return false
}TS.comments.ui.saveEdit();
return false
},startEdit:function(c,b){if(TS.comments.ui.editing){TS.comments.ui.onEndEdit()
}var a=TS.files.getFileById(c);
if(!a){TS.error("no file?");
return null
}var f=TS.files.getFileCommentById(a,b);
if(!f){TS.error("no comment?");
return null
}var e=TS.comments.ui.$edit_form;
var d=$("#"+f.id);
if(!d.length){TS.error("no #"+f.id+"?");
return
}d.find(".comment_meta").addClass("hidden");
d.find(".comment_body").addClass("hidden").after(e);
$("#file_edit_comment").val("").css("height","");
if(!TS.comments.ui.bound){TS.comments.ui.bindEditForm()
}e.removeClass("hidden");
$("#file_edit_comment").val(TS.format.unFormatMsg(f.comment)).focus().setCursorPosition(1000000).trigger("keyup");
$("#file_comment_form").css("visibility","hidden");
TS.comments.ui.editing=true;
TS.comments.ui.editing_file=a;
TS.comments.ui.editing_comment=f
},saveEdit:function(){var a=TS.comments.ui.editing_file;
var e=TS.comments.ui.editing_comment;
var b=$("#"+e.id);
var d=$("#file_edit_comment").val();
if(d!=e.comment){var c=e.comment;
e.comment=d;
b.find(".comment_body").html(TS.format.formatJustText(TS.utility.htmlEntities(e.comment)));
TS.api.call("files.comments.edit",{file:a.id,id:e.id,comment:TS.format.cleanMsg(d)},function(g,h,f){if(!g){e.comment=c;
b.find(".comment_body").html(TS.format.formatJustText(e.comment));
alert("save failed")
}})
}TS.comments.ui.onEndEdit()
},onEndEdit:function(){var b=TS.comments.ui.editing_comment;
var a=$("#"+b.id);
TS.comments.ui.$edit_form.addClass("hidden");
a.find(".comment_meta").removeClass("hidden");
a.find(".comment_body").removeClass("hidden");
$("#file_comment_form").css("visibility","");
TS.comments.ui.editing=false;
TS.comments.ui.editing_file=null;
TS.comments.ui.editing_comment=null
},startDelete:function(c,b){var a=TS.files.getFileById(c);
if(!a){TS.error("no file?");
return null
}var d=TS.files.getFileCommentById(a,b);
if(!d){TS.error("no comment?");
return null
}TS.generic_dialog.start({title:"Delete a file comment",body:"<p>Are you sure you want to delete this comment? This cannot be undone.</p>"+TS.templates.comment({comment:d,file:a,show_comment_actions:false,hide_star:true}),go_button_text:"Yes, delete the comment",go_button_class:"btn_danger",on_go:function(){TS.comments.ui.commitDelete(c,b)
}})
},commitDelete:function(c,b){var a=TS.files.getFileById(c);
if(!a){TS.error("no file?");
return null
}var d=TS.files.getFileCommentById(a,b);
if(!d){TS.error("no comment?");
return null
}TS.api.call("files.comments.delete",{file:c,id:b},function(f,g,e){if(f){if(TS.client){}else{TS.files.deleteCommentOnFile(d.id,a)
}}else{if(g.error=="comment_not_found"){TS.files.deleteCommentOnFile(d.id,a)
}}})
},removeFileComment:function(b,c,a){$("#"+c).slideUp(200,a)
}})
})();
(function(){TS.registerModule("tips",{current_batch:null,tips_by_batch:{},tips:{channels_tip_card:{id:"channels_tip_card",pref_name:"seen_channels_tip_card",throbber_el_id:"channels_tip_card_throbber",card_el_id:"channels_tip_card_div",batch:"newxp"},message_input_tip_card:{id:"message_input_tip_card",pref_name:"seen_message_input_tip_card",throbber_el_id:"message_input_tip_card_throbber",card_el_id:"message_input_tip_card_div",batch:"newxp"},user_menu_tip_card:{id:"user_menu_tip_card",pref_name:"seen_user_menu_tip_card",throbber_el_id:"user_menu_tip_card_throbber",card_el_id:"user_menu_tip_card_div",batch:"newxp",also_onclick:function(a){TS.menu.startWithUser(a)
},place:function(){TS.tip_card.placeRightOf($("#menu"),-10,10)
}},flexpane_tip_card:{id:"flexpane_tip_card",pref_name:"seen_flexpane_tip_card",throbber_el_id:"flexpane_tip_card_throbber",card_el_id:"flexpane_tip_card_div",batch:"second",adjust_state:function(){},place:function(){var c=TS.tip_card.$tip_card;
var b=$("#menu");
var a=b.width()+($(window).width()-(b.width()+b.offset().left))+8;
c.css("left","").css("right","").css("top","").css("bottom","");
if(TS.boot_data.feature_flexpane_rework){c.css("top",49)
}else{c.css("top",62)
}c.css("right",a);
$("#tip_card_callout").addClass("hidden");
TS.tip_card.keepInBounds();
$("#tip_card_callout").css("left",c.outerWidth()).removeClass("hidden")
},also_onclick:function(a){TS.menu.startWithFlexMenu(a)
}},team_menu_tip_card:{id:"team_menu_tip_card",pref_name:"seen_team_menu_tip_card",throbber_el_id:"team_menu_tip_card_throbber",card_el_id:"team_menu_tip_card_div",batch:"second",also_onclick:function(a){if(TS.boot_data.feature_combined_menu){TS.menu.startWithTeamAndUser(a)
}else{TS.menu.startWithTeam(a)
}},place:function(){TS.tip_card.placeRightOf($("#menu"),0,10,-30)
}},channel_menu_tip_card:{id:"channel_menu_tip_card",pref_name:"seen_channel_menu_tip_card",throbber_el_id:"channel_menu_tip_card_throbber",card_el_id:"channel_menu_tip_card_div",batch:"second",also_onclick:function(a){TS.menu.startWithChannel(a,TS.shared.getActiveModelOb().id)
},place:function(){TS.tip_card.placeRightOf($("#menu"),0,10,-30)
},adjust_state:function(){var a=$("#channel_menu_tip_card_throbber");
if(!TS.model.active_channel_id||TS.shared.getActiveModelOb().is_general){a.css("display","none")
}else{a.css("display","block")
}}},search_input_tip_card:{id:"search_input_tip_card",pref_name:"seen_search_input_tip_card",throbber_el_id:"search_input_tip_card_throbber",card_el_id:"search_input_tip_card_div",batch:"second",place:function(){var a=TS.tip_card.$tip_card;
a.css("left","").css("right","").css("top","").css("bottom","");
a.css("right",($(window).width()-$("#search_terms").offset().left)-100);
$("#tip_card_callout").addClass("hidden");
TS.tip_card.keepInBounds();
$("#tip_card_callout").css("left",a.outerWidth()-55).removeClass("hidden")
},adjust_state:function(){var a=TS.tips.getTipById("flexpane_tip_card");
var b=TS.tips.getTipById("search_input_tip_card");
var c=$("#search_input_tip_card_throbber");
if(TS.model.prefs[a.pref_name]){if(b.hidden_for_now){b.fade_in_delay=1000;
b.hidden_for_now=false
}c.css("display","block")
}else{b.hidden_for_now=true;
c.css("display","none")
}}},about_channels_tip_card:{id:"about_channels_tip_card",pref_name:null,throbber_el_id:null,card_el_id:"about_channels_tip_card_div",batch:"no_throbber",place:function(){TS.tip_card.placeRightOf($("#channels_header"),-40)
}},about_dms_tip_card:{id:"about_dms_tip_card",pref_name:null,throbber_el_id:null,card_el_id:"about_dms_tip_card_div",batch:"no_throbber",place:function(){TS.tip_card.placeRightOf($("#direct_messages_header"),-40)
}},about_groups_tip_card:{id:"about_groups_tip_card",pref_name:null,throbber_el_id:null,card_el_id:"about_groups_tip_card_div",batch:"no_throbber",place:function(){TS.tip_card.placeRightOf($("#groups_header"),-40)
}}},getTipById:function(a){return TS.tips.getTipByProp("id",a)
},getTipByThrobberElId:function(a){return TS.tips.getTipByProp("throbber_el_id",a)
},getTipByProp:function(b,d){if(!b){return null
}var a=TS.tips.tips;
var c;
for(var e in a){c=a[e];
if(c[b]===d){return c
}}return null
},getAllTipsInBatch:function(c){if(c&&TS.tips.tips_by_batch[c]){return TS.tips.tips_by_batch[c]
}var b={};
var a=TS.tips.tips;
var d;
for(var e in a){d=a[e];
if(d.batch===c){b[e]=d
}}if(c){TS.tips.tips_by_batch[c]=b
}return b
},isBatchComplete:function(b){var a=TS.tips.getAllTipsInBatch(b);
var c;
for(var d in a){c=a[d];
if(c.pref_name&&!TS.model.prefs[c.pref_name]){return false
}}return true
},onStart:function(){if(!TS.client){return
}if(TS.boot_data.feature_combined_menu){delete TS.tips.tips.user_menu_tip_card
}TS.client.login_sig.add(TS.tips.loggedIn,TS.tips);
TS.channels.switched_sig.add(TS.tips.channelOrImOrGroupDisplaySwitched,TS.tips);
TS.ims.switched_sig.add(TS.tips.channelOrImOrGroupDisplaySwitched,TS.tips);
TS.groups.switched_sig.add(TS.tips.channelOrImOrGroupDisplaySwitched,TS.tips);
TS.client.flexpane_display_switched_sig.add(TS.tips.flexDisplaySwitched,TS.tips)
},adjustStateForCurrentBatch:function(){TS.tips.adjustStateForBatch(TS.tips.current_batch)
},adjustStateForBatch:function(b){if(!b){return
}var a=TS.tips.getAllTipsInBatch(b);
var c;
for(var d in a){c=a[d];
if(!TS.model.prefs[c.pref_name]&&c.adjust_state){c.adjust_state()
}}},flexDisplaySwitched:function(){TS.tips.adjustStateForCurrentBatch()
},channelOrImOrGroupDisplaySwitched:function(){var a=TS.shared.getActiveModelOb();
if(!TS.model.prefs.seen_welcome_2||!TS.tips.isBatchComplete("newxp")){var b="";
if(a.is_channel){b="channel_switch__"
}else{if(a.is_group){b="group_switch__"
}else{b="dm_switch__"
}}TS.tips.track(b+a.name)
}if(TS.model.prefs.seen_welcome_2&&TS.tips.current_batch=="newxp"&&a){if(a.is_slackbot_im){TS.tips.hideThrobbers()
}else{TS.tips.showThrobbers()
}}TS.tips.adjustStateForCurrentBatch()
},maybeChangeBatch:function(){var a=TS.tips.current_batch;
if(TS.tips.current_batch=="newxp"&&TS.tips.isBatchComplete("newxp")){TS.tips.current_batch="second"
}if(TS.tips.current_batch=="second"&&TS.tips.isBatchComplete("second")){TS.tips.current_batch=null
}if(a!=TS.tips.current_batch){if(TS.tips.current_batch){TS.info("a new tip batch is in play: "+TS.tips.current_batch)
}return true
}return false
},loggedIn:function(){if(TS.model.user.is_restricted){delete TS.tips.tips.channels_tip_card
}TS.tips.current_batch="newxp";
TS.tips.maybeChangeBatch();
if(TS.tips.current_batch=="newxp"){if(TS.model.prefs.seen_welcome_2){setTimeout(function(){if(!TS.shared.getActiveModelOb().is_slackbot_im){TS.tips.showThrobbers()
}},1000)
}}else{if(TS.tips.current_batch=="second"){setTimeout(function(){TS.tips.showThrobbers()
},1000)
}else{}}},animateInInititalThrobbers:function(a){TS.tips.current_batch="newxp";
var b=a.offset();
TS.tips.showThrobbers();
$(".tip_card_throbber:not(.hidden)").each(function(){var e=$(this);
var d=e.css("top");
var c=e.css("left");
e.offset({top:b.top,left:b.left}).css("scale",1.2);
e.transition({top:d,left:c,scale:1},1000,"easeOutSine",function(){$(this).transition({scale:2},300,"easeOutSine",function(){$(this).transition({scale:1},300,"easeInOutSine")
})
})
})
},hideThrobbers:function(){var a=TS.tips.tips;
var b;
for(var c in a){b=a[c];
TS.tips.hideThrobber(c)
}},showThrobbers:function(){var a=TS.tips.tips;
var b;
for(var c in a){b=a[c];
if(b.batch!=TS.tips.current_batch){continue
}if(TS.model.prefs[b.pref_name]===true){continue
}TS.tips.initTip(c)
}},initTip:function(c){var b=TS.tips.tips[c];
if(!b){TS.error('cannot init tip "'+c+'" because there is no record in TS.tips.tips with that name');
return
}var a=$("#"+b.throbber_el_id);
if(!a.length){TS.error('cannot init tip "'+c+'" because there is no element with id: '+b.throbber_el_id);
return
}TS.tips.showThrobber(c)
},showThrobber:function(c){var b=TS.tips.tips[c];
var a=$("#"+b.throbber_el_id);
if(!a.length){return
}if(!a.hasClass("hidden")){return
}if(b.adjust_state){b.adjust_state()
}if(TS.boot_data.feature_flexpane_rework){a.addClass("feature_flexpane_rework")
}a.removeClass("hidden").css("opacity",0).css("scale",1).transition({opacity:100,delay:b.fade_in_delay||0},1000,function(){a.addClass("throbbing")
});
delete b.fade_in_delay;
b.onclick=function(d){TS.tips.hideThrobber(c,true,function(){TS.tips.hideThrobbers();
if(b.also_onclick){b.also_onclick(d)
}TS.tip_card.start({tip:b,on_go:function(){TS.tips.cardHasBeenRead(c)
},on_cancel:function(){TS.tips.track("cancelled",b);
TS.tips.showThrobbers()
}})
})
};
a.unbind("click.throbber").bind("click.throbber",function(d){b.onclick(d);
TS.tips.track("clicked_throbber_for",b)
})
},track:function(a,b){return
},cardHasBeenRead:function(b){var a=TS.tips.tips[b];
if(!TS.model.prefs[a.pref_name]){TS.prefs.setPrefByAPI({name:a.pref_name,value:true})
}TS.model.prefs[a.pref_name]=true;
TS.tips.track("completed",a);
if(TS.tips.maybeChangeBatch()){TS.tips.startTipBatchAfterLastTipBatch()
}else{TS.tips.showThrobbers()
}},startTipBatchAfterLastTipBatch:function(){if(TS.tips.current_batch=="second"){setTimeout(function(){TS.tips.showThrobbers()
},(TS.qs_args.last_newxp_throbber=="1"||TS.qs_args.seen_welcome_2=="0"?0:1000*60*10))
}},hideThrobber:function(d,f,c){var b=TS.tips.tips[d];
var a=$("#"+b.throbber_el_id);
if(!a.length){return
}if(a.hasClass("hidden")){return
}a.unbind("click.throbber");
var e=(f)?2:1;
a.transition({opacity:0,scale:e},500,function(){a.removeClass("throbbing");
a.addClass("hidden");
if(c){c()
}})
},maybeDoThrobberProxyClick:function(b,d){var a=$("#"+b);
if(a.length&&!a.hasClass("hidden")&&a.css("display")!="none"){var c=TS.tips.getTipByThrobberElId(b);
if(c){if(c.onclick){c.onclick(d);
TS.tips.track("clicked_proxy_for",c);
return true
}else{TS.error("no tip.onclick for tip:"+c.id)
}}else{TS.error("no tip for throbber_el_id:"+b)
}}return false
},optOut:function(){var b;
var a=TS.tips.tips;
var c;
var d;
for(d in a){c=a[d];
if(!c.pref_name){continue
}if(!TS.model.prefs[c.pref_name]){if(!b){b={}
}b[c.pref_name]=true
}TS.model.prefs[c.pref_name]=true
}if(b){TS.prefs.setMultiPrefsByAPI(b)
}}})
})();
(function(){TS.registerModule("tip_card",{$tip_card:null,setting:null,is_showing:false,onStart:function(){if(TS.client){TS.client.login_sig.add(TS.tip_card.loggedIn,TS.tip_card)
}else{if(TS.web){TS.web.login_sig.add(TS.tip_card.loggedIn,TS.tip_card)
}}},hasSeen:function(){var b,c,a;
b=["seen_message_input_tip_card","seen_channels_tip_card","seen_flexpane_tip_card","seen_team_menu_tip_card","seen_channel_menu_tip_card","seen_search_input_tip_card"];
if(!TS.boot_data.feature_combined_menu){b.unshift("seen_user_menu_tip_card")
}for(c=0,a=b.length;
c<a;
c++){if(!TS.model||!TS.model.prefs||!TS.model.prefs[b[c]]){return false
}}return true
},loggedIn:function(){$("#client-ui").append(TS.templates.tip_card());
var a=TS.tip_card.$tip_card=$("#tip_card");
$("#tip_card_dots").find("a").bind("click.tipshow",function(){TS.tip_card.showScreenByIndex($(this).data("slide")-1)
});
$(".tip_card_go").bind("click.tipshow",function(){TS.tip_card.go()
});
a.detach()
},start:function(d){if(TS.tip_card.is_showing){TS.tip_card.cancel()
}var h=TS.tip_card.$tip_card;
var g=d.tip;
h.appendTo($("#client-ui"));
if(!$("#"+g.card_el_id).length){h.detach();
TS.error('cannot show tip "'+d.tip.id+'" because there is no element "'+g.card_el_id+'"');
if(d.on_cancel){d.on_cancel()
}return
}TS.tip_card.clean();
TS.tip_card.setting=d;
TS.tip_card.is_showing=TS.model.tip_card_is_showing=true;
if(d.tip.id=="user_menu_tip_card"){var f=(!TS.model.is_iOS&&!TS.ui.growls.no_notifications&&TS.ui.growls.shouldShowPermissionButton()&&TS.ui.growls.getPermissionLevel()!="denied");
f=false;
if(f){$("#notifications_screen").addClass("tip_screen").removeClass("hidden")
}else{$("#notifications_screen").removeClass("tip_screen").addClass("hidden")
}}h.css("left","").css("right","").css("top","").css("bottom","");
$("#tip_card_callout").css("left","").css("right","").css("top","").css("bottom","");
if(d.tip.id=="channels_tip_card"){var e=TS.channels.getChannelByName("random");
var c=(e&&!e.is_archived);
if(c){$("#channels_both").removeClass("hidden");
$("#channels_only_general").addClass("hidden")
}else{$("#channels_only_general").removeClass("hidden");
$("#channels_both").addClass("hidden")
}}d.screen_index=-1;
d.$screens=$("#"+g.card_el_id).find(".tip_screen");
var a=$("#tip_card_dots");
a.find("a").addClass("hidden");
if(d.$screens.length>1){a.removeClass("hidden");
for(var b=0;
b<d.$screens.length;
b++){a.find('a[data-slide="'+(b+1)+'"]').removeClass("hidden")
}}else{a.addClass("hidden")
}TS.tip_card.showScreenByIndex(0);
h.addClass(g.card_el_id);
$("#"+g.card_el_id).removeClass("hidden");
$(window.document).bind("keydown",TS.tip_card.onKeyDown);
$("html").bind("mousedown",TS.tip_card.onMouseDown);
h.css("opacity",0).stop().transition({opacity:1,delay:100},300);
if(g.place){g.place();
$(window).bind("resize.tip_placement",g.place)
}else{TS.tip_card.keepInBounds();
$(window).bind("resize.tip_placement",TS.tip_card.keepInBounds)
}$("#tip_card_bg").css("opacity",0).removeClass("hidden").stop().transition({opacity:1},200,function(){})
},placeRightOf:function(c,d,e,i){d=d||0;
e=e||0;
i=i||0;
var h=TS.tip_card.$tip_card;
if(!TS.tip_card.setting){return
}var g=30;
var a=10;
var b=c.offset();
h.css("top",b.top+d);
h.css("left",b.left+c.width()+e);
TS.tip_card.keepInBounds();
var f=h.dimensions_rect();
$("#tip_card_callout").css("top",TS.utility.clamp((b.top-f.top)+((c.height()-g)/2)+i,a,f.height-(a+g)))
},keepInBounds:function(){var c=TS.tip_card.setting;
var e=TS.tip_card.$tip_card;
var b=10;
var d=e.dimensions_rect();
var a={top:0+b,right:$(window).width()-b,bottom:$(window).height()-(b+14),left:0+b};
if(!c.tip.place){e.css("left","").css("right","").css("top","").css("bottom","")
}if(TS.utility.doesRectContainRect(a,d)){return
}if(d.left<a.left){e.css("left",a.left)
}else{if(d.right>a.right){e.css("left",Math.max(a.left,a.right-d.width))
}}if(d.top<a.top){e.css("top",a.top)
}else{if(d.bottom>a.bottom){e.css("top",Math.max(a.top,a.bottom-d.height))
}}},clean:function(){$(".tip_card_div").addClass("hidden");
if(TS.tip_card.setting){TS.tip_card.$tip_card.removeClass(TS.tip_card.setting.tip.card_el_id)
}TS.tip_card.setting=null
},cancel:function(){var a=TS.tip_card.setting;
if(a){if(a.screen_index==a.$screens.length-1){if(a.on_go){a.on_go()
}}else{if(a.on_cancel){a.on_cancel()
}}}TS.tip_card.end()
},openPrefsAndCloseTip:function(b){var a=TS.tip_card.setting;
a.screen_index=a.$screens.length-1;
TS.tip_card.go();
setTimeout(TS.ui.prefs_dialog.start,500,b)
},go:function(){var a=TS.tip_card.setting;
if(a.screen_index==a.$screens.length-1){if(TS.tip_card.setting.on_go){TS.tip_card.setting.on_go()
}TS.tip_card.end();
return
}TS.tip_card.showScreenByIndex(a.screen_index+1)
},optOutAndCloseTip:function(){TS.tip_card.end();
TS.tips.optOut()
},showScreenByIndex:function(c){var d=TS.tip_card.setting;
if(c==d.screen_index){return
}d.screen_index=c;
d.$screens.addClass("hidden");
d.$screens.eq(c).removeClass("hidden").css("opacity",0).stop().transition({opacity:1,delay:100},300);
var a=(d.screen_index==d.$screens.length-1)?"Done":"Next";
$(".tip_card_go").text(a);
var b=$("#tip_card_dots");
b.find("a").removeClass("active");
b.find('a[data-slide="'+(c+1)+'"]').addClass("active")
},end:function(){TS.tip_card.is_showing=TS.model.tip_card_is_showing=false;
var a=TS.tip_card.$tip_card;
a.stop().transition({opacity:0},200,function(){if(TS.tip_card.is_showing){return
}TS.tip_card.clean();
a.detach()
});
$("#tip_card_bg").stop().transition({opacity:0},200,function(){$("#tip_card_bg").addClass("hidden")
});
$(window.document).unbind("keydown",TS.tip_card.onKeyDown);
$("html").unbind("mousedown",TS.tip_card.onMouseDown);
$(window).unbind("resize.tip_placement")
},onKeyDown:function(a){if(a.which==TS.utility.keymap.esc){TS.tip_card.cancel()
}else{if(a.which==TS.utility.keymap.enter){TS.tip_card.go()
}}},onMouseDown:function(a){if($(a.target).closest("#tip_card").length===0){TS.tip_card.cancel()
}}})
})();
(function(){TS.registerModule("msg_edit",{edit_started_sig:new signals.Signal(),edit_ended_sig:new signals.Signal(),editing:false,deleting_from_editing:false,current_msg:null,current_model_ob:null,edit_interv:0,onStart:function(){},onCountDownInterval:function(){if(!TS.msg_edit.current_msg){return
}if(TS.model.team.prefs.msg_edit_window_mins==-1){$("#edit_countdown").empty();
return
}var c=TS.utility.date.toDateObject(TS.msg_edit.current_msg.ts).getTime()+(TS.model.team.prefs.msg_edit_window_mins*60*1000);
var b=Math.floor((c-TS.utility.date.getTimeStamp())/1000);
if(b<1){$("#edit_countdown").html("(your time to edit ran out)&nbsp&nbsp&nbsp&nbsp")
}else{if(b<61){$("#edit_countdown").html("(you have <b>"+b+"</b> seconds)&nbsp&nbsp&nbsp&nbsp")
}else{$("#edit_countdown").empty()
}}},cancelEditingINothingHasChanged:function(){if(!TS.msg_edit.editing){return true
}var c=TS.format.unFormatMsg(TS.msg_edit.current_msg.text);
var b=$("#message_edit_form").find("#msg_text").val();
if(b===c){TS.msg_edit.onCancelEdit();
return true
}return false
},editExpiration:function(b){var d="Message not editable. ";
var c;
if(b>0){d+="You have ";
if(b==1){d+="1 minute "
}else{c=TS.utility.date.toTimeAmount(b);
if(c.w>=1){d+=c.w+" week"+(c.w>1?"s ":" ")
}if(c.d>=1){d+=c.d+" day"+(c.d>1?"s ":" ")
}if(c.h>=1){d+=c.h+" hour"+(c.h>1?"s ":" ")
}if(c.mi>=1){d+=c.mi+" minute"+(c.mi>1?"s ":" ")
}}d+="to edit a message after posting."
}else{d+="You cannot edit your message after posting."
}return d
},startEdit:function(j,c){if($("#message_edit_form").length&&!TS.msg_edit.cancelEditingINothingHasChanged()){TS.msg_edit.promptEdit();
return
}if(!j){TS.error("no msg_ts?");
return null
}if(!c){TS.error("no model_ob?");
return null
}if(!c.msgs){TS.error("no model_ob.msgs?");
return null
}var e=TS.utility.msgs.getMsg(j,a(c));
if(!e){TS.error("no msg in msgs?");
return null
}var k=TS.format.unFormatMsg(e.text);
if(TS.model.team.prefs.msg_edit_window_mins>=0&&(TS.utility.date.getTimeStamp()-TS.utility.date.toDateObject(e.ts))/60000>TS.model.team.prefs.msg_edit_window_mins){TS.generic_dialog.alert(TS.msg_edit.editExpiration(TS.model.team.prefs.msg_edit_window_mins));
return
}TS.msg_edit.current_msg=e;
TS.msg_edit.current_model_ob=c;
var b=(TS.client&&TS.client.ui.areMsgsScrolledToBottom());
var f=TS.msg_edit.getDivForMsg(e.ts);
f.addClass("hidden");
var g=TS.templates.message_edit_form({msg:e,permalink:TS.utility.msgs.constructMsgPermalink(c,e.ts),first_in_block:f.hasClass("first"),include_emo:!!TS.client});
f.after(g);
var d=$("#message_edit_form");
var i=d.find("#msg_text");
TS.msg_edit.checkLengthOK(i);
TS.info("message_edit_form added");
TS.msg_edit.editing=true;
TS.msg_edit.edit_started_sig.dispatch();
d.bind("destroyed",function(){TS.info("message_edit_form removed");
TS.msg_edit.editing=false;
TS.msg_edit.edit_ended_sig.dispatch();
TS.msg_edit.resetEditUI()
});
i.TS_tabComplete2({complete_cmds:false,complete_channels:true,complete_emoji:true,complete_member_specials:true,no_tab_out:true,onComplete:function(l){TS.utility.populateInput(i,l)
},sort_by_membership:true,new_cmds:TS.boot_data.feature_cmd_autocomplete});
i.tab_complete_ui({id:"msg_edit_tab_ui",scroll_with_element:!!TS.client});
d.bind("submit",function(m){m.preventDefault();
var l=i.val();
if(l===k){TS.msg_edit.onCancelEdit();
return
}if(!l){TS.msg_edit.startDelete(TS.msg_edit.current_msg.ts,TS.msg_edit.current_model_ob,TS.msg_edit.onCancelEdit,true);
return
}if(!$.trim(l)){return
}TS.msg_edit.onConfirmEdit(l)
});
i.bind("textchange",function(l,m){TS.msg_edit.checkLengthOK(i)
}).bind("keyup",function(m){var l;
if(window.getSelection){l=window.getSelection();
if(l&&l.toString&&!l.toString()){$("#edit_controls").scrollintoview({px_offset:-50})
}}}).bind("keydown",function(m){if(m.which==TS.utility.keymap.enter&&(m.ctrlKey||m.altKey)){if(!TS.model.is_mac||TS.model.is_FF){var l=i.getCursorPosition();
var n=i.val();
i.val(n.substr(0,l)+"\n"+n.substr(l)).trigger("autosize.resize").setCursorPosition(l+1)
}}else{if(m.which==TS.utility.keymap.enter){if(TS.model.prefs.enter_is_special_in_tbt&&TS.utility.isCursorWithinTBTs(i)&&!m.shiftKey){return
}else{if(TS.model.prefs.enter_is_special_in_tbt&&TS.utility.isCursorWithinTBTs(i)&&m.shiftKey){m.preventDefault();
TS.msg_edit.checkAndSubmit(i,d);
return
}else{if(i.tab_complete_ui("isShowing")){m.preventDefault();
return
}else{if(!m.shiftKey&&!m.altKey){m.preventDefault();
TS.msg_edit.checkAndSubmit(i,d);
return
}}}}}}}).autosize();
$("body").bind("keydown.close_message_edit_form",function(l){if(l.which==TS.utility.keymap.esc){if(i.tab_complete_ui("isShowing")||i.tab_complete_ui("wasJustHidden")){return
}if(!TS.model.menu_is_showing&&!TS.model.dialog_is_showing){setTimeout(TS.msg_edit.onCancelEdit,0)
}}});
d.find("#commit_edit").bind("click",function(){TS.msg_edit.checkAndSubmit(i,d)
});
d.find("#cancel_edit").bind("click",function(){TS.msg_edit.onCancelEdit()
});
var h=d.find(".emo_menu");
h.removeClass("hidden");
h.bind("click.open_dialog",function(l){TS.emoji_menu.startEmo(l,"#msg_text")
});
h.html(TS.utility.emojiGraphicReplace(h.html()));
if(TS.client&&b){TS.client.ui.instaScrollMsgsToBottom(false)
}$("#edit_controls").scrollintoview({duration:500,px_offset:100,complete:function(){i.focus();
TS.utility.setCursorPosition("#msg_text",100000000)
}});
TS.msg_edit.onCountDownInterval();
TS.msg_edit.edit_interv=setInterval(TS.msg_edit.onCountDownInterval,1000)
},checkLengthOK:function(c){var b=c.val().length>TS.model.input_maxlength;
if(b){$("#edit_warning").removeClass("hidden");
$("#edit_saver").addClass("hidden");
return false
}else{$("#edit_warning").addClass("hidden");
$("#edit_saver").removeClass("hidden");
return true
}},checkAndSubmit:function(b,c){if(TS.msg_edit.checkLengthOK(b)){c.submit()
}},onConfirmEdit:function(b){if(!TS.msg_edit.current_msg){TS.error("no TS.msg_edit.current_msg?");
return null
}if(!b){TS.error("no edited_text?");
return null
}TS.msg_edit.commitEditInternal(b);
TS.msg_edit.resetEditUI()
},onCancelEdit:function(){if(!TS.msg_edit.current_msg){TS.error("no TS.msg_edit.current_msg?");
return null
}TS.msg_edit.resetEditUI();
if(TS.view){TS.view.focusMessageInput()
}},resetEditUI:function(){clearInterval(TS.msg_edit.edit_interv);
if(!TS.msg_edit.current_msg){TS.error("no TS.msg_edit.current_msg?");
return null
}var b=TS.msg_edit.getDivForMsg(TS.msg_edit.current_msg.ts);
b.removeClass("hidden");
$("#message_edit_container").remove();
$("body").unbind("keydown.close_message_edit_form")
},getDivForMsg:function(b){return $("#"+TS.templates.makeMsgDomId(b))
},commitEditInternal:function(b){TS.msg_edit.commitEdit(TS.msg_edit.current_msg,TS.msg_edit.current_model_ob,b)
},commitEdit:function(f,b,c,d,e){if(!f){TS.error("no msg?");
return null
}if(!b){TS.error("no model_ob?");
return null
}if(!d){d=0
}if(!e){e=100
}TS.api.call("chat.update",{channel:b.id,ts:f.ts,text:TS.format.cleanMsg(c),_attempts:d,_delay_ms:e},function(i,j,g){if(i){if(TS.web||(b.is_channel&&!b.is_member)){f.text=j.text;
f.edited={ts:TS.utility.date.makeTsStamp(null,"0")};
TS.utility.msgs.replaceMsg(b,f)
}}else{if(!j||!j.error){alert("Message editing failed.")
}else{if(j.error=="message_not_found"){if(g._attempts<10){g._delay_ms*=1.75;
setTimeout(function(){TS.msg_edit.commitEdit(f,b,c,g._attempts,g._delay_ms)
},g._delay_ms);
return
}var h=b.id;
if(h.charAt(0)==="C"){TS.channels.removeMsg(h,f)
}else{if(h.charAt(0)==="D"){TS.ims.removeMsg(h,f)
}else{if(h.charAt(0)==="G"){TS.groups.removeMsg(h,f)
}}}alert("Message editing failed.")
}else{if(j.error=="edit_window_closed"){alert("Message editing failed. You have only "+TS.model.team.prefs.msg_edit_window_mins+" minutes to edit a message after posting.")
}else{alert('Message editing failed with error "'+j.error+'".')
}}}}})
},promptEdit:function(){if($("#message_editing_info").css("display")!="none"){$("#message_edit_container").scrollintoview({duration:300,px_offset:0});
return
}$("#message_editing_info").css("display","");
$("#message_editing_info").css("opacity",0);
$("#message_edit_container").scrollintoview({duration:300,px_offset:0,complete:function(){$("#message_editing_info").transition({opacity:1},250)
}})
},startDelete:function(j,b,h,f){if(!j){TS.error("no msg_ts?");
return null
}if(!b){TS.error("no model_ob?");
return null
}if(!b.msgs){TS.error("no model_ob.msgs?");
return null
}var c=TS.utility.msgs.getMsg(j,a(b));
if(!c){TS.error("no msg in msgs?");
return null
}TS.msg_edit.deleting_from_editing=!!f;
TS.msg_edit.current_msg=c;
TS.msg_edit.current_model_ob=b;
var d=TS.msg_edit.getDivForMsg(c.ts);
var i='<p class="small_bottom_margin">Are you sure you want to delete this message? This cannot be undone.</p>';
if(c.subtype){var g;
if(c.file){g="file";
if(c.file.mode=="snippet"){g="snippet"
}else{if(c.file.mode=="post"){g="post"
}}}var e="";
if(c.subtype=="file_upload"){e="Note that deleting this message will not delete the "+g+" that was uploaded."
}else{if(c.subtype=="file_share"){e="Note that deleting this message will not unshare the "+g+"."
}else{if(c.subtype=="file_comment"){e="Note that deleting this message will not delete the comment."
}}}if(e){i+="<p>"+e+"</p>"
}}d.addClass("delete_mode");
TS.generic_dialog.start({title:"Delete Message",body:i+TS.templates.builders.buildMsgHTML({msg:c,model_ob:b,standalone:true}),go_button_text:"Yes, delete this message",go_button_class:"btn_danger",on_go:function(){if(TS.msg_edit.deleting_from_editing){TS.msg_edit.onCancelEdit()
}TS.msg_edit.commitDeleteInternal(h)
},on_cancel:function(){TS.msg_edit.onCancelDelete()
}})
},onCancelDelete:function(){if(!TS.msg_edit.current_msg){TS.error("no TS.msg_edit.current_msg?");
return null
}var b=TS.msg_edit.getDivForMsg(TS.msg_edit.current_msg.ts);
b.removeClass("delete_mode");
if(TS.msg_edit.deleting_from_editing){$("#msg_text").focus()
}},commitDeleteInternal:function(b){TS.msg_edit.commitDelete(TS.msg_edit.current_msg,TS.msg_edit.current_model_ob,TS.msg_edit.onCancelDelete,b)
},commitDelete:function(c,b,g,f,e,k,j){if(!c){TS.error("no msg?");
return null
}if(!b){TS.error("no model_ob?");
return null
}var l=b.id;
if(!k){k=0
}if(!j){j=100
}if(c.is_ephemeral||TS.utility.msgs.isTempMsg(c)){if(l.charAt(0)==="C"){TS.channels.removeMsg(l,c)
}else{if(l.charAt(0)==="D"){TS.ims.removeMsg(l,c)
}else{if(l.charAt(0)==="G"){TS.groups.removeMsg(l,c)
}else{return
}}}}else{if(c._jl_rollup_hash&&c._jl_rollup_hash.msg_ids){var h=c._jl_rollup_hash.msg_ids;
for(var d=0;
d<h.length;
d++){if(h[d]==c.ts){continue
}TS.api.call("chat.delete",{channel:l,ts:h[d],_attempts:k,_delay_ms:j},function(m,n,i){if(m||n.error=="message_not_found"){if(n.error=="message_not_found"){if(i._attempts<10){i._delay_ms*=1.75;
setTimeout(function(){TS.msg_edit.commitDelete(c,b,g,f,e,i._attempts,i._delay_ms)
},i._delay_ms);
return
}}if(TS.web||(b.is_channel&&!b.is_member)){if(l.charAt(0)==="C"){TS.channels.removeMsg(l,TS.utility.msgs.getMsg(i.ts,a(b)))
}else{if(l.charAt(0)==="D"){TS.ims.removeMsg(l,TS.utility.msgs.getMsg(i.ts,a(b)))
}else{if(l.charAt(0)==="G"){TS.groups.removeMsg(l,TS.utility.msgs.getMsg(i.ts,a(b)))
}}}}}})
}}TS.api.call("chat.delete",{channel:l,ts:c.ts,_attempts:k,_delay_ms:j},function(o,p,m){if(o||p.error=="message_not_found"){if(p.error=="message_not_found"){if(m._attempts<10){m._delay_ms*=1.75;
setTimeout(function(){TS.msg_edit.commitDelete(c,b,g,f,e,m._attempts,m._delay_ms)
},m._delay_ms);
return
}}if(TS.web||(b.is_channel&&!b.is_member)){if(l.charAt(0)==="C"){TS.channels.removeMsg(l,c)
}else{if(l.charAt(0)==="D"){TS.ims.removeMsg(l,c)
}else{if(l.charAt(0)==="G"){TS.groups.removeMsg(l,c)
}}}}if(f){f()
}}else{if(g){g()
}if(!e){var i="The message was not deleted.  The error was: "+(p&&p.error?p.error:"unknown");
TS.generic_dialog.start({title:"Delete Message Failed",body:i,show_cancel_button:false,esc_for_ok:true})
}}if(TS.web){var n=!TS.utility.msgs.getDisplayedMsgs(b.msgs).length;
if(n){var q=$(".pager .previous a");
if(q.attr("href")){window.location=q.attr("href")
}else{window.location.reload()
}}}})
}},$last_clicked_cb:null,startBatchDelete:function(){$("#msgs_div").addClass("selecting_messages");
$("#channel_actions_div").addClass("hidden");
$("#batch_delete_div").removeClass("hidden");
TS.msg_edit.batchDeleteSelectionChanged()
},cancelBatchDelete:function(){TS.msg_edit.selectNoneBatchDelete();
$("#msgs_div").removeClass("selecting_messages");
$("#channel_actions_div").removeClass("hidden");
$("#batch_delete_div").addClass("hidden")
},doBatchDelete:function(){var h=$("#msgs_div").find(".msg_select_cb:checked");
var b=TS.shared.getActiveModelOb();
if(h.length){var e=h.length;
if(e==1){TS.msg_edit.startDelete(h.eq(0).closest(".msg_actions").data("msg-ts"),b,TS.msg_edit.cancelBatchDelete);
return
}var f=(e==1)?"this message":"these "+e+" messages";
var g='<p class="small_bottom_margin">Are you sure you want to delete '+f+"? This cannot be undone! Note that deleting these messages will not delete any files or file comments.</p>";
var k;
var c;
for(var d=0;
d<e;
d++){if(c&&!c.no_display){k=c
}var j=h.eq(d).closest(".msg_actions").data("msg-ts");
c=TS.utility.msgs.getMsg(j,a(b));
if(!c){continue
}g+=TS.templates.builders.buildMsgHTML({msg:c,prev_msg:k,model_ob:b,standalone:true})
}var l=function(i){function n(o){TS.msg_edit.commitDelete(o,b,m,m,true)
}function m(){if(i.length){setTimeout(function(){n(i.pop())
},100)
}else{TS.generic_dialog.cancel();
TS.generic_dialog.start({title:"",body:"Messages deleted.",show_cancel_button:false,esc_for_ok:true})
}}TS.generic_dialog.start({title:"",body:"Deleting messages...",show_cancel_button:false,show_go_button:false});
m()
};
TS.generic_dialog.start({title:"Delete Messages",body:g,go_button_text:"Yes, delete these messages",go_button_class:"btn_danger",on_go:function(){var m=[];
for(var n=0;
n<e;
n++){var p=h.eq(n).closest(".msg_actions").data("msg-ts");
if(!p){alert("no msg_ts");
return
}var o=TS.utility.msgs.getMsg(p,a(b));
if(!o){alert("no msg");
return
}m.push(o)
}TS.msg_edit.cancelBatchDelete();
l(m)
},on_cancel:function(){}})
}else{}},batchDeleteSelectionChanged:function(c,g){var j=TS.msg_edit.$last_clicked_cb;
if(j&&c&&g){var b=$("#msgs_div").find(".msg_select_cb:visible");
var e=b.index(j);
var h=b.index(c);
if(e>h){h=e;
e=b.index(c)
}var l=j.prop("checked")=="checked";
for(var d=e;
d<=h;
d++){b.eq(d).prop("checked",l)
}}TS.msg_edit.$last_clicked_cb=j=c;
var f="0 messages";
var k=$("#msgs_div").find(".msg_select_cb:checked");
$("#msgs_div").find(".multi_delete_mode").removeClass("multi_delete_mode");
if(k.length){if(k.length==1){f="1 message"
}else{f=k.length+" messages"
}$("#batch_delete_button").removeClass("disabled");
k.each(function(){$(this).closest(".message").addClass("multi_delete_mode")
})
}else{$("#batch_delete_button").addClass("disabled")
}$("#batch_delete_count_span").html(f)
},selectAllBatchDelete:function(){$("#msgs_div").find(".msg_select_cb:visible").prop("checked",true);
TS.msg_edit.batchDeleteSelectionChanged()
},selectNoneBatchDelete:function(){$("#msgs_div").find(".msg_select_cb:visible").prop("checked",false);
TS.msg_edit.batchDeleteSelectionChanged()
}});
var a=function(b){return(TS.model.archive_view_is_showing&&b._archive_msgs)?b._archive_msgs:b.msgs
}
})();
(function(){TS.registerModule("generic_dialog",{div:null,is_showing:false,default_setting:{title:"",body:"BODY",body_template:null,show_go_button:true,show_secondary_go_button:false,show_cancel_button:true,go_button_text:"OK",go_button_class:"",secondary_go_button_text:"OK 2",secondary_go_button_class:"",cancel_button_text:"Cancel",on_go:null,on_secondary_go:null,on_cancel:null,on_end:null,show_throbber:false,esc_for_ok:false,on_show:null,force_small:false,enter_always_gos:false,fullscreen:false},current_setting:null,body_template_html:{},Q:[],onStart:function(){TS.generic_dialog.body_template_html.generic_dialog_sample=TS.templates.generic_dialog_sample()
},onKeydown:function(a){var b=TS.generic_dialog.current_setting;
if(a.which==TS.utility.keymap.enter){if(TS.utility.getActiveElementProp("NODENAME")=="BODY"||b.enter_always_gos){if(b.show_go_button){TS.generic_dialog.go();
a.preventDefault()
}}}else{if(a.which==TS.utility.keymap.esc){if(TS.utility.getActiveElementProp("NODENAME")=="BODY"){if(b.show_cancel_button){TS.generic_dialog.cancel()
}else{if(b.esc_for_ok){TS.generic_dialog.go()
}}}}}},alert:function(a,b){TS.generic_dialog.start({title:b||"",body:a,show_cancel_button:false,esc_for_ok:true,fullscreen:false})
},start:function(c){if(TS.boot_data.feature_fullscreen_modals&&c.fullscreen){TS.ui.fs_modal.start(c);
return
}if(TS.generic_dialog.is_showing){if(c.unique&&TS.generic_dialog.current_setting.unique==c.unique){TS.info("redundant generic dialog not Qed: "+c.unique)
}else{TS.generic_dialog.Q.push(c)
}return
}var e=TS.generic_dialog.current_setting=$.extend(TS.utility.clone(TS.generic_dialog.default_setting),c);
if(typeof c.show_close_button==="undefined"){e.show_close_button=e.show_cancel_button
}if(!TS.generic_dialog.div){TS.generic_dialog.build()
}var d=TS.generic_dialog.div;
var a=e.body;
if(e.body_template){if(TS.generic_dialog.body_template_html[e.body_template]){a=TS.generic_dialog.body_template_html[e.body_template];
if(e.body){TS.warn("both body and body_template were passed on settings, using body_template")
}}else{TS.error(e.body_template+" not found in TS.generic_dialog.body_template_html")
}}var b=TS.templates.generic_dialog({title:e.title,body:a});
d.empty();
d.html(b);
d.find(".close").bind("click",function(){if(e.show_cancel_button){TS.generic_dialog.cancel()
}else{if(e.esc_for_ok){TS.generic_dialog.go()
}}});
d.find(".dialog_go").click(TS.generic_dialog.go);
d.find(".dialog_go").html(e.go_button_text);
if(e.show_go_button){d.find(".dialog_go").removeClass("hidden").addClass(e.go_button_class)
}else{d.find(".dialog_go").addClass("hidden")
}d.find(".dialog_secondary_go").click(TS.generic_dialog.secondary_go);
d.find(".dialog_secondary_go").html(e.secondary_go_button_text);
if(e.show_secondary_go_button){d.find(".dialog_secondary_go").removeClass("hidden").addClass(e.secondary_go_button_class)
}else{d.find(".dialog_secondary_go").addClass("hidden")
}d.find(".dialog_cancel").click(TS.generic_dialog.cancel);
d.find(".dialog_cancel").html(e.cancel_button_text);
d.find(".dialog_cancel").toggleClass("hidden",!e.show_cancel_button);
d.find(".close").toggleClass("hidden",!e.show_close_button);
if(e.show_throbber){d.find(".throbber").removeClass("hidden")
}else{d.find(".throbber").addClass("hidden")
}if(e.title){d.find(".modal-header").removeClass("hidden")
}else{d.find(".modal-header").addClass("hidden")
}if(!e.show_go_button&&!e.show_secondary_go_button&&!e.show_cancel_button){d.find(".modal-footer").addClass("hidden")
}else{d.find(".modal-footer").removeClass("hidden")
}d.modal("show");
if(e.title||e.force_small){d.removeClass("small")
}else{d.addClass("small");
d.css("margin-left",-d.width()/2)
}if(document.activeElement&&document.activeElement!=document.body){document.activeElement.blur()
}if(e.on_show){e.on_show()
}},go:function(){if(!TS.generic_dialog.is_showing){TS.error("not showing?");
return
}var b=TS.generic_dialog.current_setting;
var a=TS.generic_dialog.div;
if(b.on_go){if(b.on_go()!==false){a.modal("hide")
}}else{a.modal("hide")
}},secondary_go:function(a){if(!TS.generic_dialog.is_showing){TS.error("not showing?");
return
}var c=TS.generic_dialog.current_setting;
var b=TS.generic_dialog.div;
if(c.on_secondary_go){if(c.on_secondary_go(a)!==false){b.modal("hide")
}}else{b.modal("hide")
}},cancel:function(){var a=TS.generic_dialog.current_setting;
TS.generic_dialog.div.modal("hide");
if(a.on_cancel){a.on_cancel()
}},end:function(){var b=TS.generic_dialog.current_setting;
TS.generic_dialog.is_showing=TS.model.dialog_is_showing=false;
$(window.document).unbind("keydown",TS.generic_dialog.onKeydown);
TS.generic_dialog.div.empty();
if(b.on_end){b.on_end()
}if(!TS.generic_dialog.is_showing&&TS.generic_dialog.Q.length){var a=TS.generic_dialog.Q.shift();
TS.generic_dialog.start(a)
}},build:function(){$("body").append('<div id="generic_dialog" class="modal hide fade" data-keyboard="false" data-backdrop="static"></div>');
var a=TS.generic_dialog.div=$("#generic_dialog");
a.on("hidden",function(b){if(b.target!=this){return
}setTimeout(function(){TS.generic_dialog.end()
},200)
});
a.on("show",function(b){if(b.target!=this){return
}TS.generic_dialog.is_showing=TS.model.dialog_is_showing=true
});
a.on("shown",function(b){if(b.target!=this){return
}setTimeout(function(){if(!TS.generic_dialog.is_showing){return
}a.find(".title_input").select();
$(window.document).bind("keydown",TS.generic_dialog.onKeydown)
},100)
})
}})
})();
(function(){TS.registerModule("help",{issues_sorted_sig:new signals.Signal(),issues:[],more_url:null,fake_api_rsps:false,max_title_chars:100,onStart:function(){if(!TS.client){return
}TS.api.call("help.issues.list",{},TS.help.onListIssues)
},getIssueById:function(c){var a;
for(var b=0;
b<TS.help.issues.length;
b++){a=TS.help.issues[b];
if(a.id==c){return a
}}return null
},onListIssues:function(b,c,a){if(TS.help.fake_api_rsps){TS.help.more_url="/help";
TS.help.issues=[{id:"T00001",title:"issue 1",ts:"1111111111",short_text:"blah blah blah blah blah",state:"resolved"},{id:"T00002",title:"issue 2",ts:"1141111111",short_text:"I think this is ok",state:"open"},{id:"T00003",title:"issue 3",ts:"1121111111",short_text:"but I am not so sure abotu this",state:"unread"},{id:"T00004",title:"issue 4",ts:"1161111111",short_text:"what about that?",state:"open"},{id:"T00005",title:"issue 5",ts:"1151111111",short_text:"fuck it all to hell",state:"open"},{id:"T00006",title:"issue 6",ts:"1171111111",short_text:"MORE BATTRY PLZ",state:"read"},{id:"T00007",title:"issue 7",ts:"1191111111",short_text:"halp",state:"unread"},{id:"T00008",title:"issue 8",ts:"191111111",short_text:"halp",state:"unread"},{id:"T00009",title:"issue 9",ts:"181111111",short_text:"halp",state:"unread"},{id:"T000010",title:"issue 10",ts:"171111111",short_text:"halp halp halp halp halp halp halp halp halp halp ...",state:"unread"}]
}else{if(b){TS.help.issues=c.issues
}}TS.help.sortIssues();
TS.help.updateIcon()
},sortIssues:function(){var c={unread:4,open:3,read:2,resolved:1};
var a;
for(var b=0;
b<TS.help.issues.length;
b++){a=TS.help.issues[b];
a._sorter=parseFloat((c[a.state]||5)+"."+a.ts)
}TS.help.issues.sort(function d(f,e){if(f._sorter<e._sorter){return 1
}if(f._sorter>e._sorter){return -1
}return 0
});
TS.help.issues_sorted_sig.dispatch()
},updateIcon:function(){var e="normal";
var d=0;
var b=0;
var a;
for(var c=0;
c<TS.help.issues.length;
c++){a=TS.help.issues[c];
if(a.state=="unread"){e="unread";
d++
}else{if(a.state=="open"){}}}$("#help_icon").removeClass("normal open unread").addClass(e);
if(d){$("#help_icon_circle_count").text(d)
}else{$("#help_icon_circle_count").text(b)
}if(TS.boot_data.feature_flexpane_rework){$("#flex_menu_toggle").removeClass("normal open unread").addClass(e);
$(".help_icon_circle_count").addClass("hidden");
if(d){$(".help_icon_circle_count").removeClass("hidden").text(d)
}}},createIssue:function(b,e){var d=b.title;
var c=b.text;
if(!d){return
}c=c||"";
var a={title:d,text:c};
if(b.tags){a.tags=b.tags
}TS.api.call("help.issues.create",a,function(h,i,g){if(h){}else{if(TS.help.fake_api_rsps){var f={id:TS.utility.date.getTimeStamp(),title:d,ts:TS.utility.date.getTimeStamp()/1000,short_text:c.substr(0,50),state:"open"};
setTimeout(function(){TS.ms.handleMsg({type:"issue_created",issue:f})
},2000)
}}if(e){e(h,TS.help.makeErrStr(i))
}})
},fetchIssueDetails:function(c,b){var a=TS.help.getIssueById(c);
if(!a){if(b){b(false,a,"unknown issue")
}return
}TS.api.call("help.issues.info",{id:c},function(e,f,d){var g;
if(TS.help.fake_api_rsps){e=true;
g=TS.utility.clone(a);
g.comments=[{ts:112211111,from:"eeric",text:"comment 1"},{ts:112214444,from:"whoop",text:"comment 2"}]
}else{if(e){g=f.issue
}}TS.help.onIssueChange(g);
if(b){b(e,a,TS.help.makeErrStr(f))
}})
},markIssueRead:function(c,b){var a=TS.help.getIssueById(c);
if(!a){if(b){b(false,"unknown issue")
}return
}if(a.state!="unread"){if(b){b(true)
}return
}TS.api.call("help.issues.markRead",{id:c},function(e,f,d){if(e){}else{if(TS.help.fake_api_rsps){var g=TS.utility.clone(a);
g.state="read";
setTimeout(function(){TS.ms.handleMsg({type:"issue_change",issue:g})
},2000)
}}if(b){b(e,TS.help.makeErrStr(f))
}})
},replyToIssue:function(c,a,b){TS.api.call("help.issues.replyTo",{id:c,text:a},function(e,f,d){if(b){b(e,TS.help.makeErrStr(f),(f&&f.error)?f.error:"")
}})
},markIssueResolved:function(c,b){var a=TS.help.getIssueById(c);
if(!a){if(b){b(false,"unknown issue")
}return
}TS.api.call("help.issues.markResolved",{id:c},function(e,f,d){if(TS.help.fake_api_rsps||(!e&&f&&f.error=="ticket_closed")){e=true;
var g=TS.utility.clone(a);
g.state="resolved";
setTimeout(function(){TS.ms.handleMsg({type:"issue_change",issue:g})
},1000)
}if(b){b(e,TS.help.makeErrStr(f))
}})
},onIssueChange:function(b){var a=TS.help.getIssueById(b.id);
if(a){TS.help.updateIssue(b,a)
}else{TS.help.issues.push(b)
}TS.help.sortIssues();
TS.help.updateIcon()
},updateIssue:function(d,a){for(var b in d){a[b]=d[b]
}if(a.comments){a.comments.sort(function c(f,e){if(f.ts<e.ts){return 1
}if(f.ts>e.ts){return -1
}return 0
})
}},makeErrStr:function(b){if(!b){return"missing data"
}if(b.ok){return null
}if(b.error&&b.info&&TS.model.team.domain=="tinyspeck"){try{return'api error: "'+b.error+'"<br><br><div class="admin-section" style="word-wrap: break-word; word-break: break-word;">api rsp: '+JSON.stringify(b).replace(/\,/g,", ")+"</div>"
}catch(a){}}if(b.error){return'api error: "'+b.error+'"'
}}})
})();
(function(){TS.registerModule("help_dialog",{div:null,showing:false,last_tab:null,last_issue_screen:null,onStart:function(){TS.help.issues_sorted_sig.add(TS.help_dialog.onIssuesSorted);
TS.help_dialog.just_docs=TS.qs_args.just_docs!="0"
},onKeydown:function(a){if(!TS.help_dialog.showing){return
}if(a.which==TS.utility.keymap.enter&&TS.utility.cmdKey(a)){if(TS.utility.getActiveElementProp("id")=="issue_reply_text"){TS.help_dialog.replyToIssue();
a.preventDefault()
}else{if(TS.utility.getActiveElementProp("id")=="issue_new_text"){TS.help_dialog.createIssue();
a.preventDefault()
}}}else{if(a.which==TS.utility.keymap.esc){if(TS.utility.getActiveElementProp("NODENAME")=="BODY"&&TS.help_dialog.last_issue_screen!="new"&&TS.help_dialog.last_issue_screen!="reply"){TS.help_dialog.cancel()
}}}},start:function(c,a){c=c||TS.help_dialog.last_tab;
if(TS.help_dialog.just_docs){if(c=="issues"){c="docs"
}}if(!TS.help_dialog.div){TS.help_dialog.build()
}if(TS.help_dialog.showing){return
}var d=TS.help_dialog.div;
var b=TS.templates.help_dialog({member:TS.model.user,issue_list_html:TS.help_dialog.buildIssueListHTML(),more_url:TS.help.more_url,max_title_chars:TS.help.max_title_chars});
d.empty();
d.html(b);
d.find(".dialog_tabs a").bind("click",function(g){var f=$(this);
d.find(".dialog_tabs a").removeClass("active");
d.find(".dialog_tab_pane").removeClass("active");
f.addClass("active");
$("#"+f.data("pane-id")).addClass("active");
TS.help_dialog.last_tab=f.data("which");
TS.client.ui.updateClosestMonkeyScroller($("#help_docs_scroller"));
TS.client.ui.updateClosestMonkeyScroller($("#help_issues_scroller"));
if(TS.help_dialog.last_tab=="docs"){}else{d.find(".modal-footer").removeClass("hidden")
}});
if(c=="issues"){$("#help_issues_tab").trigger("click")
}else{$("#help_docs_tab").trigger("click")
}$("#help_issues_list").bind("click",function(h){var g=$(h.target);
var f=g.closest(".issue_list_div").data("issue-id");
if(!f){return
}TS.help_dialog.showIssue(f)
});
$("#new_issue_submit_btn").bind("click",TS.help_dialog.createIssue);
$("#new_issue_cancel_btn").bind("click",TS.help_dialog.showIssueList);
$("#new_issue_btn").click(TS.help_dialog.showNewIssueForm);
$("#issue_resolved_btn").bind("click",TS.help_dialog.markIssueResolved);
$("#issue_back_btn").bind("click",TS.help_dialog.showIssueList);
$("#issue_reply_btn").bind("click",TS.help_dialog.showIssueReplyForm);
$("#issue_reply_submit_btn").bind("click",TS.help_dialog.replyToIssue);
$("#issue_reply_cancel_btn, #issue_reply_title").bind("click",function(){TS.help_dialog.showIssue()
});
TS.help_dialog.last_issue_screen="list";
TS.help_dialog.getElsForScreen("new").addClass("hidden");
TS.help_dialog.getElsForScreen("issue").addClass("hidden");
TS.help_dialog.getElsForScreen("reply").addClass("hidden");
$("#issues_overlaid_throbber").addClass("hidden");
$("#issue_new_title").bind("textchange",function(g,i){var f=$(this);
var h=f.val();
if(h.length>TS.help.max_title_chars){f.val(h.substr(0,TS.help.max_title_chars))
}});
if(TS.help_dialog.just_docs){$("#help_dialog").find(".with_tabs").removeClass("with_tabs");
$("#help_dialog").find(".dialog_tabs").addClass("hidden");
$("#help_dialog").find(".no_tabs_title").removeClass("hidden");
$("#help_dialog").find("#cant_find").removeClass("hidden")
}TS.help_dialog.updateDocsTab();
d.modal("show")
},updateDocsTab:function(){if(!TS.help_dialog.just_docs){return
}var e=0;
var c=0;
var a=TS.help.issues.length;
var b;
for(var d=0;
d<TS.help.issues.length;
d++){b=TS.help.issues[d];
if(b.state=="unread"){e++
}else{if(b.state=="open"){c++
}}}$("#help_dialog").find("#no_open_issues, #unread_issues, #open_issues, #unread_issues_many, #unread_issues_singular, #open_issues_many, #open_issues_singular").addClass("hidden");
if(a){$("#no_open_issues").removeClass("hidden")
}else{$("#cant_find").removeClass("hidden");
$("#help_divider").addClass("hidden")
}if(e){$("#unread_issues").removeClass("hidden");
$("#help_divider").removeClass("hidden");
$("#no_open_issues").addClass("hidden");
if(e>1){$("#unread_issues_count_txt").text(e);
$("#unread_issues_many").removeClass("hidden")
}else{$("#unread_issues_singular").removeClass("hidden")
}}else{if(c){$("#open_issues").removeClass("hidden");
$("#help_divider").removeClass("hidden");
$("#no_open_issues").addClass("hidden");
if(c>1){$("#open_issues_count_txt").text(c);
$("#open_issues_many").removeClass("hidden")
}else{$("#open_issues_singular").removeClass("hidden")
}}}},onIssuesSorted:function(){if(!TS.help_dialog.showing){return
}TS.help_dialog.updateDocsTab();
$("#help_issues_list").html(TS.help_dialog.buildIssueListHTML())
},buildIssueListHTML:function(){var c="";
var a;
for(var b=0;
b<TS.help.issues.length;
b++){a=TS.help.issues[b];
c+=TS.templates.issue_list_item({issue:a})
}return c
},getElsForScreen:function(a){if(a=="list"){return $("#help_issues_list, #help_issues_list_btns")
}if(a=="new"){return $("#help_issue_new_form_div, #help_issue_new_form_btns")
}if(a=="issue"){return $("#help_issue_div, #help_issue_btns")
}if(a=="reply"){return $("#help_issue_reply_form_div, #help_issue_reply_form_btns")
}return $("#wtfjones")
},startWorking:function(){$("#issues_overlaid_throbber").removeClass("hidden").css("opacity",0).transition({opacity:1},200);
$("#help_dialog .modal-footer").find(".btn.disable_when_working").addClass("disabled")
},stopWorking:function(){$("#issues_overlaid_throbber").transition({opacity:0},100).delay(100).addClass("hidden");
$("#help_dialog .modal-footer").find(".btn").removeClass("disabled")
},showIssueScreen:function(a,e){var d=TS.help_dialog.getElsForScreen(TS.help_dialog.last_issue_screen);
var b=TS.help_dialog.getElsForScreen(a);
d.transition({opacity:0},100,function c(){if(c.run){return
}c.run=true;
if(!TS.help_dialog.showing){return
}d.addClass("hidden");
b.removeClass("hidden").css("opacity",0).transition({opacity:1},100,function f(){if(f.run){return
}f.run=true;
if(!TS.help_dialog.showing){return
}if(e){e()
}TS.client.ui.updateClosestMonkeyScroller($("#help_issues_scroller"))
})
});
TS.help_dialog.last_issue_screen=a
},showIssueList:function(){TS.help_dialog.showIssueScreen("list")
},showIssueReplyForm:function(){var a=TS.help.getIssueById(TS.help_dialog.last_issue_id);
if(!a){return
}$("#issue_reply_title").text(a.title);
$("#issue_reply_footer").html(TS.templates.help_issue_reply_comments({issue:a}));
TS.client.ui.updateClosestMonkeyScroller($("#help_issues_scroller"));
TS.help_dialog.showIssueScreen("reply",function(){$("#issue_reply_text").focus();
TS.client.ui.updateClosestMonkeyScroller($("#help_issues_scroller"))
})
},showNewIssueForm:function(){TS.help_dialog.showIssueScreen("new",function(){$("#issue_new_title").focus()
})
},showIssue:function(c){var a=TS.help.getIssueById(c);
var b;
if(c&&!a){return
}if(a){TS.help_dialog.last_issue_id=c;
TS.help_dialog.startWorking();
$("#help_issue_div").empty();
b=function(){TS.help.fetchIssueDetails(c,function(e,d,f){if(!TS.help_dialog.showing){return
}if(!e){TS.generic_dialog.alert("Failed to retrieve the request details.<br><br>"+f);
TS.help_dialog.stopWorking();
TS.help_dialog.showIssueList();
return
}setTimeout(function(){if(!TS.help_dialog.showing){return
}TS.help.markIssueRead(c,function(g,h){if(!TS.help_dialog.showing){return
}$("#help_issue_div").html(TS.templates.help_issue_div({issue:d,show_comments:true}));
TS.client.ui.updateClosestMonkeyScroller($("#help_issues_scroller"));
TS.help_dialog.stopWorking()
});
if(d.state=="resolved"||d.is_closed){$("#issue_resolved_btn").addClass("hidden")
}else{$("#issue_resolved_btn").removeClass("hidden")
}if(d.is_closed){$("#issue_reply_btn").addClass("hidden")
}else{$("#issue_reply_btn").removeClass("hidden")
}},1000)
});
$("#help_issue_div").html(TS.templates.help_issue_div({issue:a}));
TS.client.ui.updateClosestMonkeyScroller($("#help_issues_scroller"))
}
}TS.help_dialog.showIssueScreen("issue",b)
},markIssueResolved:function(){TS.help_dialog.startWorking();
TS.help.markIssueResolved(TS.help_dialog.last_issue_id,function(a,b){if(!TS.help_dialog.showing){return
}if(!a){TS.generic_dialog.alert("Failed to mark the request resolved.<br><br>"+b)
}TS.help_dialog.stopWorking();
TS.help_dialog.showIssueList()
})
},createIssue:function(){var c=$("#issue_new_text").val();
var b=$("#issue_new_title").val()||"";
if(b.length>TS.help.max_title_chars){TS.info("too long");
return
}if(!c){return
}if(!b){b=c.substr(0,50)
}var a={title:b,text:c};
TS.help_dialog.startWorking();
TS.help.createIssue(a,function(d,e){if(!TS.help_dialog.showing){return
}TS.help_dialog.stopWorking();
if(!d){TS.generic_dialog.alert("Failed to create request.<br><br>"+e)
}else{TS.help_dialog.showIssueList();
$("#issue_new_text").val("");
$("#issue_new_title").val("")
}})
},replyToIssue:function(){var a=$("#issue_reply_text").val();
if(!a){return
}TS.help_dialog.startWorking();
TS.help.replyToIssue(TS.help_dialog.last_issue_id,a,function(c,d,b){if(!TS.help_dialog.showing){return
}TS.help_dialog.stopWorking();
if(!c){if(b=="ticket_closed"){TS.generic_dialog.alert("Failed to add comment.<br><br>"+d)
}else{TS.generic_dialog.alert("Failed to add comment.<br><br>"+d)
}}else{TS.help_dialog.showIssue(TS.help_dialog.last_issue_id);
$("#issue_reply_text").val("")
}})
},go:function(){if(!TS.help_dialog.showing){TS.error("not showing?");
return
}var a=TS.help_dialog.div;
a.modal("hide")
},cancel:function(){TS.help_dialog.div.modal("hide")
},end:function(){TS.help_dialog.showing=TS.model.dialog_is_showing=false;
$(window.document).unbind("keydown",TS.help_dialog.onKeydown)
},build:function(){$("body").append('<div id="help_dialog" class="modal hide fade"></div>');
var a=TS.help_dialog.div=$("#help_dialog");
a.on("hide",function(b){if(b.target!=this){return
}TS.help_dialog.end()
});
a.on("show",function(b){if(b.target!=this){return
}TS.help_dialog.showing=TS.model.dialog_is_showing=true
});
a.on("shown",function(b){if(b.target!=this){return
}$(window.document).bind("keydown",TS.help_dialog.onKeydown);
TS.client.ui.updateClosestMonkeyScroller($("#help_issues_scroller"));
TS.client.ui.updateClosestMonkeyScroller($("#help_docs_scroller"))
})
}})
})();
(function(){TS.registerModule("kb_nav",{onStart:function(){},start:function(u,t,v){m=u;
d=t;
c.lastX=null;
c.lastY=null;
if(!v){v="#menu"
}a=$(v);
$(document).on("mousemove.keyboard_navigation",f);
$(document).on("keydown",TS.kb_nav.onKeyDown);
m.on("mouseenter.keyboard_navigation",d,o)
},end:function(){b();
if(m){m.off(".keyboard_navigation")
}m=null;
d=null;
n=null;
g=false;
e=null;
$(document).off("mousemove.keyboard_navigation",f);
$(document).off("keydown",TS.kb_nav.onKeyDown)
},clearHighlightedItem:function(){s()
},setAllowHighlightWithoutBlurringInput:function(t){g=t
},setSubmitItemHandler:function(t){e=t
},onKeyDown:function(w){var u=TS.utility.keymap;
var v=w.which;
var x=w.metaKey||w.ctrlKey||w.shiftKey||w.altKey;
if((v==u.up)&&((g&&!x)||!l(w.target))){w.stopPropagation();
w.preventDefault();
p();
i(w);
return
}if((v==u.down)&&((g&&!x)||!l(w.target))){w.stopPropagation();
w.preventDefault();
p();
q(w);
return
}if(v==u.left&&!l(w.target)){w.stopPropagation();
w.preventDefault();
p();
i(w);
return
}if(v==u.right&&!l(w.target)){w.stopPropagation();
w.preventDefault();
p();
q(w);
return
}if(v==u.tab){w.stopPropagation();
w.preventDefault();
p();
if(!g&&l(w.target)){$(w.target).blur()
}if(w.shiftKey){i(w)
}else{q(w)
}return
}if(v==u.enter&&n){if(e){var t=n.get(0);
if(t){e.call(t,w)
}else{e(w)
}return
}w.stopPropagation();
w.preventDefault();
k();
return
}}});
var h={keyboard_active:"keyboard_active",no_pointer_events:"no_pointer_events"};
var a=null;
var m=null;
var j=false;
var d=null;
var n=null;
var g=false;
var e=null;
var p=function(){if(j){return
}a.addClass(h.keyboard_active);
a.addClass(h.no_pointer_events);
j=true
};
var c={lastX:null,lastY:null};
var f=function(t){if(!j){c.lastX=t.clientX;
c.lastY=t.clientY;
return
}if(c.lastX===null){c.lastX=t.clientX;
c.lastY=t.clientY
}else{if(t.clientX!==c.lastX||t.clientY!==c.lastY){b()
}c.lastX=t.clientX;
c.lastY=t.clientY
}};
var b=function(){if(!j){return
}if(n){n.removeClass("highlighted")
}a.removeClass(h.keyboard_active);
a.removeClass(h.no_pointer_events);
j=false
};
var i=function(v){var u;
var t=d;
if(n){u=n.prevAll(t).filter(":not(.disabled):visible:first")
}else{u=m.children(t).filter(":not(.disabled):visible:last")
}if(u.length>0){r(u,v)
}else{if(m.children(t).filter(":not(.disabled):visible").length!==0){s();
i(v)
}}};
var q=function(v){var u;
var t=d;
if(n){u=n.nextAll(t).filter(":not(.disabled):visible:first")
}else{u=m.children(t).filter(":not(.disabled):visible:first")
}if(u.length>0){r(u,v)
}else{if(m.children(t).filter(":not(.disabled):visible").length!==0){s();
q(v)
}}};
var r=function(t,u){s();
n=t;
t.addClass("highlighted").scrollintoview({offset:"top",px_offset:0,duration:0});
t.find("a:first").focus()
};
var s=function(){if(n){n.removeClass("highlighted");
n=null
}};
var o=function(t){n=$(t.target).closest(d)
};
var k=function(){if(n){n.find("a:first").click()
}};
var l=function(t){return $(t).is("input, textarea")
}
})();
(function(){TS.registerModule("privacy_policy_dialog",{div:null,is_showing:false,default_setting:{title:"",body:"BODY",body_template:null,on_go:null,on_cancel:null,on_end:null,esc_for_ok:false,on_show:null,force_small:false,enter_always_gos:false},current_setting:null,body_template_html:{},Q:[],onStart:function(){},start:function(b){if(TS.privacy_policy_dialog.is_showing){if(b.unique&&TS.privacy_policy_dialog.current_setting.unique==b.unique){TS.info("redundant generic dialog not Qed: "+b.unique)
}else{TS.privacy_policy_dialog.Q.push(b)
}return
}var d=TS.privacy_policy_dialog.current_setting=$.extend(TS.utility.clone(TS.privacy_policy_dialog.default_setting),b);
if(!TS.privacy_policy_dialog.div){TS.privacy_policy_dialog.build()
}var c=TS.privacy_policy_dialog.div;
var a=TS.templates.privacy_policy_dialog({title:d.title,body:d.body,footer:d.footer});
c.empty();
c.html(a);
c.find(".close").bind("click",function(){if(d.show_cancel_button){TS.privacy_policy_dialog.cancel()
}else{if(d.esc_for_ok){TS.privacy_policy_dialog.go()
}}});
c.find(".dialog_go").click(TS.privacy_policy_dialog.go);
if(d.go_button_text){c.find(".dialog_go").html(d.go_button_text)
}if(d.show_go_button){c.find(".dialog_go").removeClass("hidden").addClass(d.go_button_class)
}c.css("opacity",0);
c.css("display","block");
window.setTimeout(function(){c.css("marginLeft","0px");
c.slideDown(function(){c.animate({opacity:1},{duration:500,complete:function(){c.addClass("fading-in");
c.modal({backdrop:false}).show();
if(document.activeElement&&document.activeElement!=document.body){document.activeElement.blur()
}if(d.on_show){d.on_show()
}}})
})
},1)
},go:function(b){if(!TS.privacy_policy_dialog.is_showing){TS.error("not showing?");
return
}var d=TS.privacy_policy_dialog.current_setting;
var c=TS.privacy_policy_dialog.div;
function a(){c.removeClass("fading-in");
c.fadeOut(750,function(){c.modal("hide")
})
}if(d.on_go){if(d.on_go(b)!==false){a()
}}else{a()
}},cancel:function(){var b=TS.privacy_policy_dialog.current_setting;
var a=TS.privacy_policy_dialog.div;
a.removeClass("fading-in");
a.fadeOut(750,function(){a.modal("hide")
});
if(b.on_cancel){b.on_cancel()
}},end:function(){var b=TS.privacy_policy_dialog.current_setting;
TS.privacy_policy_dialog.is_showing=TS.model.dialog_is_showing=false;
TS.privacy_policy_dialog.div.empty();
if(b.on_end){b.on_end()
}if(!TS.privacy_policy_dialog.is_showing&&TS.privacy_policy_dialog.Q.length){var a=TS.privacy_policy_dialog.Q.shift();
TS.privacy_policy_dialog.start(a)
}},build:function(){$("body").append('<div id="privacy_policy_dialog" class="modal" data-keyboard="false"></div>');
var a=TS.privacy_policy_dialog.div=$("#privacy_policy_dialog");
a.on("hidden",function(b){if(b.target!=this){return
}setTimeout(function(){TS.privacy_policy_dialog.end()
},200)
});
a.on("show",function(b){if(b.target!=this){return
}TS.privacy_policy_dialog.is_showing=TS.model.dialog_is_showing=true
})
}})
})();
(function(){TS.registerModule("sidebar_themes",{default_themes:{default_theme:{column_bg:"#4D394B",menu_bg:"#3E313C",active_item:"#4C9689",active_item_text:"#FFFFFF",hover_item:"#3E313C",text_color:"#FFFFFF",active_presence:"#38978D",badge:"#EB4D5C"},hoth_theme:{column_bg:"#F8F8FA",menu_bg:"#F8F8FA",active_item:"#CAD1D9",active_item_text:"#FFFFFF",hover_item:"#FFFFFF",text_color:"#383F45",active_presence:"#60D156",badge:"#FF8669"},cotton_theme:{column_bg:"#BB6A76",menu_bg:"#AD5B67",active_item:"#62B791",active_item_text:"#FFFFFF",hover_item:"#A5516A",text_color:"#FFFFFF",active_presence:"#68F798",badge:"#694464"},eco_theme:{column_bg:"#86A34E",menu_bg:"#94AF63",active_item:"#FFFFFF",active_item_text:"#6D8B42",hover_item:"#94AF63",text_color:"#FFFFFF",active_presence:"#FFB10A",badge:"#DFA044"},monument_theme:{column_bg:"#0D7E83",menu_bg:"#076570",active_item:"#F79F66",active_item_text:"#FFFFFF",hover_item:"#D37C71",text_color:"#FFFFFF",active_presence:"#F79F66",badge:"#F15340"},chocolate_theme:{column_bg:"#544538",menu_bg:"#42362B",active_item:"#5DB09D",active_item_text:"#FFFFFF",hover_item:"#4A3C30",text_color:"#FFFFFF",active_presence:"#FFFFFF",badge:"#5DB09D"},ocean_theme:{column_bg:"#303E4D",menu_bg:"#2C3849",active_item:"#6698C8",active_item_text:"#FFFFFF",hover_item:"#4A5664",text_color:"#FFFFFF",active_presence:"#94E864",badge:"#78AF8F"},workhard_theme:{column_bg:"#4D5250",menu_bg:"#444A47",active_item:"#D39B46",active_item_text:"#FFFFFF",hover_item:"#434745",text_color:"#FFFFFF",active_presence:"#99D04A",badge:"#DB6668"}},onStart:function(){if(TS.client){TS.client.login_sig.add(TS.sidebar_themes.onLogin,TS.sidebar_themes)
}},onLogin:function(a,b){if(TS.model.prefs.sidebar_theme){TS.prefs.sidebar_theme_changed_sig.dispatch()
}}})
})();
(function(){TS.registerModule("ui.share_dialog",{div:null,showing:false,delegate:undefined,onStart:function(){},onKeydown:function(a){if(!TS.ui.share_dialog.showing){return
}if(a.which==TS.utility.keymap.enter){if(TS.utility.getActiveElementProp("NODENAME")=="BODY"){TS.ui.share_dialog.go();
a.preventDefault()
}}else{if(a.which==TS.utility.keymap.esc){if(TS.utility.getActiveElementProp("NODENAME")=="BODY"){TS.ui.share_dialog.cancel()
}}}},start:function(h,f,i){if(TS.client&&TS.client.ui.checkForEditing()){return
}var g=TS.files.getFileById(h);
var d="file";
if(g.mode=="post"){d="file_post"
}else{if(g.mode=="space"){d="file_space"
}else{if(g.mode=="snippet"){d="file_snippet"
}}}var e={type:d,item:g,item_owner:TS.members.getMemberById(g.user),sharing_html:TS.templates.builders.buildFileSharingControls(g,true,null,i),file_html:(f?"":TS.templates.builders.fileHTML(g))};
e.icon_class=TS.utility.getImageIconClass(g,"thumb_80");
if(!TS.ui.share_dialog.div){TS.ui.share_dialog.build()
}var b=TS.templates.share_dialog(e);
b=b.replace(/\ue000/g,"").replace(/\ue001/g,"");
var a=TS.ui.share_dialog.div;
a.html(b);
TS.ui.share_dialog.div.find("img.lazy").lazyload();
var c=$("#file_comment_textarea");
TS.comments.ui.bindInput(c,TS.ui.share_dialog.go);
c.autogrow();
a.modal("show");
a.find(".dialog_cancel").click(TS.ui.share_dialog.cancel);
a.find(".dialog_go").click(TS.ui.share_dialog.go);
TS.ui.bindFileShareDropdowns();
TS.ui.bindFileShareShareToggle();
TS.ui.bindFileShareCommentField()
},go:function(){if(!TS.ui.share_dialog.showing){TS.error("not showing?");
return
}var e=$("#share_dialog");
var b=e.find("#share_item_id").val();
var a=e.find("#share_model_ob_id").val();
if(!a){a=$("#select_share_channels").val()
}if(!a){TS.warn("model_ob_id is not set! "+$("#select_share_channels").val());
return
}var d=TS.format.cleanMsg($("#file_comment_textarea").val());
if($.trim(d)===""){d=""
}var c=function(){TS.shared.getShareModelObId(a,function(f){TS.files.shareFile(b,f,d)
})
};
if(TS.ui.share_dialog.delegate&&typeof TS.ui.share_dialog.delegate.submit=="function"){TS.ui.share_dialog.delegate.submit(e,c)
}else{c()
}TS.ui.share_dialog.div.modal("hide")
},cancel:function(){TS.ui.share_dialog.div.modal("hide")
},end:function(){TS.ui.share_dialog.showing=TS.model.dialog_is_showing=false;
TS.ui.share_dialog.div.empty();
$(window.document).unbind("keydown",TS.ui.share_dialog.onKeydown)
},build:function(){$("body").append('<div id="share_dialog" class="modal hide fade"></div>');
var a=TS.ui.share_dialog.div=$("#share_dialog");
a.on("hidden",function(b){if(b.target!=this){return
}TS.ui.share_dialog.end()
});
a.on("show",function(b){if(b.target!=this){return
}TS.ui.share_dialog.showing=TS.model.dialog_is_showing=true
});
a.on("shown",function(b){if(b.target!=this){return
}$("#file_comment_textarea").focus();
$(window.document).bind("keydown",TS.ui.share_dialog.onKeydown)
});
a.on("click",function(b){if(TS.view){TS.view.doLinkThings(b)
}})
}})
})();
(function(){TS.registerModule("pins",{pins_fetched_sig:new signals.Signal(),pinned_status_changed_sig:new signals.Signal(),pinned_message_changed_sig:new signals.Signal(),pinned_message_deleted_sig:new signals.Signal(),onStart:function(){TS.files.team_file_comment_deleted_sig.add(b);
TS.files.team_file_deleted_sig.add(a)
},fetchPins:function(l,m){TS.api.call("pins.list",{channel:l.id},function(o,p,n){if(o){var q=p.items;
TS.pins.upsertPinnedItems(q);
l.pinned_items=q;
TS.pins.pins_fetched_sig.dispatch(l,q)
}m(o,p,n)
})
},pinFile:function(n,l){var m=TS.files.getFileById(n);
if(!m){return
}f(l,{file:m,type:"file"})
},unPinFile:function(o,l){var m=c(o,l);
if(!m){return
}var n={file:m,type:"file"};
g(n,l,function(){d(l,n)
})
},pinFileComment:function(n,o,l){var m=TS.files.getFileById(o);
if(!m){return
}var p=TS.files.getFileCommentById(m,n);
if(!p){return
}f(l,{file:m,comment:p,type:"file_comment"})
},unPinFileComment:function(n,p,l){var q=j(n,p,l);
var m=TS.files.getFileById(p);
if(!q||!m){return
}var o={file:m,comment:q,type:"file_comment"};
g(o,l,function(){d(l,o)
})
},pinMessage:function(n,l){n=n.toString();
var m=TS.utility.msgs.getMsg(n,l.msgs);
if(!m&&l._archive_msgs){m=TS.utility.msgs.getMsg(n,l._archive_msgs)
}if(m){if(m.subtype==="file_comment"){TS.pins.pinFileComment(m.comment.id,m.file.id,l)
}else{if(m.file){TS.pins.pinFile(m.file.id,l)
}else{f(l,{message:m,type:"message"})
}}}},unPinMessage:function(o,l){o=o.toString();
var n=k(o,l);
if(n){if(n.subtype==="file_comment"){TS.pins.unPinFileComment(n.comment.id,n.file.id,l)
}else{if(n.file){TS.pins.unPinFile(n.file.id,l)
}else{var m={message:n,type:"message"};
g(m,l,function(){d(l,m)
})
}}}},isMessagePinned:function(m,l){if(m.subtype==="file_comment"){if(!m.comment){return false
}return !!j(m.comment.id,m.file.id,l)
}else{if(m.file){return !!c(m.file.id,l)
}else{return !!k(m.ts,l)
}}},pinStatusHasChanged:function(t,s,r,l){var m,n,p;
var q,u,o;
if(r==="message"&&(l.msgs||l._archive_msgs)){m=TS.utility.msgs.getMsg(s.message.ts,l.msgs);
if(!m&&l._archive_msgs){m=TS.utility.msgs.getMsg(s.message.ts,l._archive_msgs)
}if(m){s.message=m;
q=i(t,m,l)
}TS.utility.msgs.maybeStoreMsgs(l.id,l.msgs)
}else{if(r==="file_comment"){o=TS.files.upsertFile(s.file);
n=TS.files.getFileById(s.file.id);
s.file=n;
p=TS.files.getFileCommentById(n,s.comment.id);
if(p){s.comment=p;
q=i(t,p,l)
}else{p=TS.files.addCommentToFile(s.comment,n);
s.comment=p
}q=q||o.status==="CHANGED"
}else{if(r==="file"){o=TS.files.upsertFile(s.file);
n=TS.files.getFileById(s.file.id);
s.file=n;
q=i(t,n,l);
q=q||o.status==="CHANGED"
}}}if(s.file){TS.files.makeSureReferencesGetSavedToLS(s.file.id)
}u=e(t,s,r,l);
if(q||u){TS.pins.pinned_status_changed_sig.dispatch(l,s)
}},upsertPinnedItems:function(l){l.forEach(function(m){if(m.type==="file"){TS.files.upsertFile(m.file);
m.file=TS.files.getFileById(m.file.id)
}else{if(m.type==="file_comment"){TS.files.upsertFile(m.file);
m.file=TS.files.getFileById(m.file.id);
var n=TS.files.getFileCommentById(m.file,m.comment.id);
if(!n){n=TS.files.addCommentToFile(m.comment,m.file)
}m.comment=n
}}})
},replaceMsg:function(m,l){if(!l.pinned_items){return
}l.pinned_items.forEach(function(n){if(n.type==="message"&&n.message.ts===m.ts){n.message=m;
TS.pins.pinned_message_changed_sig.dispatch(l,n)
}})
},removeMsg:function(m,l){if(!l.pinned_items){return
}e(false,{message:{ts:m}},"message",l);
TS.pins.pinned_message_deleted_sig.dispatch(l)
},canUserPinHere:function(l){if(!TS.client||!l){return false
}if(l.is_im){return false
}if(l.is_general&&!TS.members.canUserPostInGeneral()){return false
}if(l.is_channel&&!l.is_member){return false
}return true
},test:function(){return{fileDeleted:a,fileCommentDeleted:b}
}});
var c=function(q,l){if(TS.boot_data.feature_lazy_load_pins){var n=TS.files.getFileById(q);
if(!n||!n.pinned_to){return null
}var o=n.pinned_to.indexOf(l.id)!==-1;
return o?n:null
}else{if(!l.pinned_items){return
}var p;
for(var m=0;
m<l.pinned_items.length;
m++){p=l.pinned_items[m];
if(p.type==="file"&&p.file.id===q){return p.file
}}return null
}};
var j=function(p,r,l){if(TS.boot_data.feature_lazy_load_pins){var n=TS.files.getFileById(r);
if(!n){return null
}var s=TS.files.getFileCommentById(n,p);
if(!s||!s.pinned_to){return null
}var o=s.pinned_to.indexOf(l.id)!==-1;
return o?s:null
}else{if(!l.pinned_items){return
}var q;
for(var m=0;
m<l.pinned_items.length;
m++){q=l.pinned_items[m];
if(q.type==="file_comment"&&q.comment.id===p){return q.comment
}}return null
}};
var k=function(p,l){if(l.pinned_items){var n;
for(var m=0;
m<l.pinned_items.length;
m++){n=l.pinned_items[m];
if(n.type==="message"&&n.message.ts===p){return n.message
}}}var o=TS.utility.msgs.getMsg(p,l.msgs);
if(!o&&l._archive_msgs){o=TS.utility.msgs.getMsg(p,l._archive_msgs)
}if(!o){return null
}if(o.subtype==="file_comment"){if(j(o.comment.id,o.file.id,l)){return o
}}else{if(o.file){if(c(o.file.id,l)){return o
}}else{if(o.pinned_to&&o.pinned_to.indexOf(l.id)!==-1){return o
}}}return null
};
var i=function(n,o,l){var p=false;
if(!o.pinned_to){o.pinned_to=[]
}if(n){if(o.pinned_to.indexOf(l.id)===-1){o.pinned_to.push(l.id);
p=true
}}else{var m=o.pinned_to.indexOf(l.id);
if(m!==-1){o.pinned_to.splice(m,1);
p=true
}}return p
};
var e=function(n,o,m,l){var q=false;
if(!l.pinned_items){l.pinned_items=[]
}var p=-1;
l.pinned_items.some(function(s,r){var t=false;
if(m==="message"&&s.type==="message"){if(s.message.ts===o.message.ts){t=true
}}else{if(m==="file"&&s.type==="file"){if(s.file.id===o.file.id){t=true
}}else{if(m==="file_comment"&&s.type==="file_comment"){if(s.comment.id===o.comment.id){t=true
}}}}if(t){p=r;
return true
}});
if(!n&&p!==-1){l.pinned_items.splice(p,1);
q=true
}else{if(n&&p===-1){l.pinned_items.unshift(o);
q=true
}}return q
};
var f=function(l,n){var m=h(l,n);
TS.api.call("pins.add",m,function(o,q){if(!o){if(q.error==="too_many_pins"){var p="message";
if(n.type==="file"){p="file"
}if(n.type==="file_comment"){p="comment"
}TS.generic_dialog.start({title:"Couldn't pin "+p,body:"<p>Sorry! You've hit the limit on how many pins you can have in this "+(l.is_channel?"channel":"group")+".</p>",show_cancel_button:false})
}else{TS.logError("pins.add got a not ok rsp",q.error)
}if(q.error!=="already_pinned"){return
}}TS.pins.pinStatusHasChanged(true,n,n.type,l)
})
};
var d=function(l,n){var m=h(l,n);
TS.api.call("pins.remove",m,function(o,p){if(!o){if(p.error!=="not_pinned"){return
}}TS.pins.pinStatusHasChanged(false,n,n.type,l)
})
};
var h=function(l,n){var m={channel:l.id};
if(n.type==="message"){m.timestamp=n.message.ts
}else{if(n.type==="file"){m.file=n.file.id
}else{if(n.type==="file_comment"){m.file_comment=n.comment.id
}}}return m
};
var g=function(n,l,o){TS.client.channel_page.highlightPinnedItemForRemoval(n);
var m=TS.client.channel_page.pinnedItemHtml(n,l);
TS.generic_dialog.start({title:"Remove Pinned Item",body:"<p>Are you sure you want to remove this pinned item?</p>"+m,go_button_text:"Yes, remove this pinned item",on_go:o,on_cancel:function(){TS.client.channel_page.unHighlightPinnedItemForRemoval(n)
}})
};
var b=function(l,m,n){if(!n||!n.pinned_to){return
}n.pinned_to.forEach(function(o){var p=TS.shared.getModelObById(o);
if(!p){return
}var q=e(false,{comment:n},"file_comment",p);
if(q){TS.pins.pinned_status_changed_sig.dispatch(p)
}})
};
var a=function(l){if(!l){return
}if(l.pinned_to){l.pinned_to.forEach(function(m){var n=TS.shared.getModelObById(m);
if(!n){return
}var o=e(false,{file:l},"file",n);
if(o){TS.pins.pinned_status_changed_sig.dispatch(n)
}})
}if(l.comments){l.comments.forEach(function(m){b(l,m.id,m)
})
}}
})();