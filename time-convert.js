'use strict';

//pre-pad a 0 if applicable.
function PadMe (inData) {
  return (inData < 10) ? '0' + inData : inData;
}

module.exports = function (inDate) {
  var d = new Date(inDate);
  //var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var t = {year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate(),
        hour: d.getHours(), minute: d.getMinutes(), seconds: d.getSeconds()}
  //var timeStamp = PadMe(t.day) + '-' + PadMe(t.month) + '-' + t.year;
  //timeStamp += ' ' + PadMe(t.hour) + ':' + PadMe(t.minute) + ':' + PadMe(t.seconds);
  var timeStamp = PadMe(t.day) + '-' + PadMe(t.month) + '-' + t.year.toString().slice(2);
  timeStamp += ' ' + PadMe(t.hour) + ':' + PadMe(t.minute) + ':' + PadMe(t.seconds);
  return timeStamp;
};
