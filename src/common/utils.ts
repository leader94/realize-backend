import { v4 as uuid } from 'uuid';
function getUUID() {
  return uuid();
}


module.exports = {
  getUUID,
};
