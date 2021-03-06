var twilio = require('twilio');
var controller = require('../controllers/users');
var sochain = require('../api/sochain');

module.exports = function(request, response){
  var phone = request.body.From || 1;
  var input = request.body.Body || 'last';

  input = input.trim();
  controller.updateUser(phone, input, function(user) {
    var parsedMessage = user.lastMessage;
    console.log('\n\nparsedMessage: ' + parsedMessage);

    var respond = function(message) {
      var twiml = new twilio.TwimlResponse();
      twiml.message(message);
      response.writeHead(200, {'Content-Type': 'text/xml'});
      response.end(twiml.toString());
    };

    //convert a double to int if it doesn't have relevant decimal places
    var convertNumber = function(number){
      var doubleNum = number;
      var intNum = (doubleNum | 0);

      if(doubleNum > intNum || doubleNum < intNum){
        return doubleNum;
      }
      else{
        return intNum;
      }
    };

    //see if its a valid crypto address
    sochain.getCryptoType(parsedMessage, function(sochainResponse) {
      if (sochainResponse === 'error' || sochainResponse === 'none') {
        respond('\"' + parsedMessage + '\" is not a valid crypto address!\nKeep in mind we support BTC, LTC, and Doge');
      }
      else {
          respond('That\'s a ' + sochainResponse.data.network + ' wallet with a balance of ' + convertNumber(sochainResponse.data.balance) + ' and ' + convertNumber(sochainResponse.data.pending_value) + ' ' + sochainResponse.data.network + '\'s pending.');
      }
    });
  });
};
