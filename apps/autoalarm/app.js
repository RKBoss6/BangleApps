
var interval;

var calEvents = require("Storage").readJSON("android.calendar.json",true)||[];

//preprocess events by removing old ones
calEvents = calEvents.filter(e => e.timestamp >= Date.now()/1000);
//filter so only days are there
calEvents=calEvents.filter(item =>
      item.title.toLowerCase().includes("day")&&item.title.toLowerCase().includes("nhs"));
//sort by what comes first
calEvents=calEvents.sort((a,b)=>a.timestamp - b.timestamp);
var tomorrow=calEvents[0];
var dayToday=tomorrow.title;

//result should be A-day, B-day, C-day
dayToday = dayToday.replace("NHS: ", "");



print(dayToday);

function changeAlarmTime(time){
  var alarm=require("sched").getAlarm("wakeup");
  if(time==0){
    alarm.on=false;
  }else{
    alarm.on=true;
    alarm.t=time;
  }
  
  require("sched").setAlarm("wakeup",alarm);
  require("sched").reload();

}

function showChangeAlarmPrompt(){
  
  E.showPrompt("Choose alarm time", {
      title: "Change Alarm",
      buttons: { "6:00": 21600000,"6:30":23400000, "7:00":25200000,"Off":0, },
  }).then(function (answer) {
    changeAlarmTime(answer);
    Bangle.load();
});
}
function getAlarmTimeFromDay(){
  var str;
  var time;
  print("dayToday: "+dayToday);
  if(dayToday=="A-day"){
    str="7:00";
    time=25200000
    
  }else if(dayToday=="B-day"||dayToday=="C-day"){
    str="6:00";
    time=21600000;
  }else{
    str="Unknown";
    time=0;
  }
  return {
    time:time,
    str:str
  };
}

var alarmTime=getAlarmTimeFromDay();
function showUnknownPrompt(){
  startBuzz();
  E.showPrompt("Tomorrow is an unknown day! No alarm set.", {
      title: "Auto Alarm",
      buttons: { "OK": 1, "Change":2},
      buttonsLong: {"Change":3} 
  }).then(function (answer) {
    cancelBuzz();
    if(answer==1){
      chooseAutoAlarm();
      Bangle.load();
      
    }else{
      
      showChangeAlarmPrompt();
      
    }
});
};
  
function showStatusPrompt(alarm){
  startBuzz();
  var d=new Date(alarm.time);
  var m=require("locale").meridian(d);
  var str=alarm.str+(m!=""? " ":"")+m;
  var msg="Tomorrow is a: "+dayToday+"! Alarm set for "+str;
  E.showPrompt(msg, {
        title: "Auto Alarm",
        buttons: { "OK": 1, "Change":2},
        
    }).then(function (answer) {
      cancelBuzz()
      if(answer==1){
        changeAlarmTime(alarm.time);
        Bangle.load();
        
      }else{
        
        showChangeAlarmPrompt();
        
      }
  });
  
}


function cancelBuzz(){
  clearInterval(interval);
}
function startBuzz(){
  interval=setInterval(function(){
    Bangle.buzz(300)
  },2000);
}



print(calEvents);
print(alarmTime);
if(calEvents==[]||calEvents==undefined||!calEvents||alarmTime.time==0||alarmTime.str=="Unknown"){
  showUnknownPrompt();
}else{
  
  showStatusPrompt(alarmTime);
}

