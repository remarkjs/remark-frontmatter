'use strict';

module.exports = {
  getFence: getFence
};

function getFence(matter, prop) {
  if (matter.fence) {
    if (typeof matter.fence === 'string') {
      return matter.fence;
    }

    return matter.fence[prop];
  }

  var marker = typeof matter.marker === 'string' ?
    matter.marker :
    matter.marker[prop];

  return marker + marker + marker;
}
