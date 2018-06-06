/**
* not using this at the moment
*/
function charIdGenerator() {
  var charId  ="";
  for (var i = 1; i < 10 ; i++) 
  { 
    charId += String.fromCharCode(97 + Math.random()*10);
  } 
  //Logger.log(charId)
  return charId;    
}

/**
* to find the place with highest votes
*/
function findCommon(arr) {
  var max = 1,
      m = [],
      val = arr[0],
      i, x;
  
  for(i = 0; i < arr.length; i ++) {
    x = arr[i]
    if (m[x]) {
      ++m[x] > max && (max = m[i], val = x);
    } else {
      m[x] = 1;
    }
  } return val;    
}

/**
* to get all the votes from firebase
*/
function getVotes(space) {
  var firebaseUrl = "https://***appname***.firebaseio.com/";
  var secret = "***secret***";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  var data = base.getData();
  var spaceName = space.split('/')[1]
  if(data.spaces != undefined && data.spaces[spaceName] != undefined){
    return data.spaces[spaceName].votes
  }else{
    return 'No Votes'
  }
}

/**
* to get all the places from firebase
*/
function getPlaces() {
  var firebaseUrl = "https://***appname***.firebaseio.com/";
  var secret = "***secret***";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  var data = base.getData();
  return data.place
}

/**
* insert vote for each person in the related space
*/
function updateVotes(space ,person , vote) {
  var firebaseUrl = "https://***appname***.firebaseio.com/";
  var secret = "***secret***";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  base.setData(space + "/votes/" + person, vote);
  return base.getData().votes
  
}

/**
* not using this at the moment
*/
function addData(person , text) {
  var firebaseUrl = "https://***appname***.firebaseio.com/";
  var secret = "***secret***";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  base.setData("votes/" + person, 4);
  return base.getData().votes
}

/**
* Deletes all the votes in the passed space
*/
function deleteVotes(space) {
  var firebaseUrl = "https://***appname***.firebaseio.com/";
  var secret = "***secret***";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  base.setData(space + "/votes/" , {});
  var data = base.getData();
  if(data.votes != undefined){
    return data.votes
  }else{
    return 'No More Votes'
  }
}



var INSTRUCTION_MSG = "You can get the list of places to eat by typing \`places\`. \
\nYou can vote for the place by typing \`vote \` and ONLY the number of the option. \
(example: vote 2)\nAt the end (or whenever you want), I will give you the result with \`result\`.\nnote 1: \
I will count only last vote of each person.  \nnote 2: In the room(group), try to call me by \`@LunchBot\` \
\nnote 3: If there are 2 places equaly with highest votes, the one who got the first vote wins"

function onCardClick(event){
  //return { 'text': JSON.stringify(event)};
  if(event.type == "CARD_CLICKED"){
    
    var vote = Number(event.action.actionMethodName);
    var places = getPlaces();
    if(places[vote-1]){
      updateVotes(event.space.name ,event.user.displayName , vote)
      if(places[vote-1].name.toLowerCase().indexOf("casa") != -1){
        return {'text': 'aaaa bella vita ' + event.user.displayName }
      }else{
        return {'text': event.user.displayName + ' voted for ' + places[vote-1].name }
      }
    }else{
      return {'text': 'Wrong option, try \`places\` to see all options' }
    }
    
    return { 'text': JSON.stringify(event)};
    
  }
  
}

function createCard(cb){
  var buttons = []
  var places = getPlaces();
  for (index in places){
      var number = Number(index) + 1
      buttons.push(
              '{ "textButton": { "text": "'  + String(places[index].name) + '", "onClick": {"action": { "actionMethodName": "' + String(number)+'"}}}}'
      )
  }
  var result =  '{"cards": [{ "header":{ "imageUrl": "https://goo.gl/aeDtrS","title":"Hi Guys... Where do you want to eat today? Click to Vote!"},"sections": [{"widgets": [ {"buttons":[' + buttons + ']}]}]}]}'
  return  result
              
}


/**
* First function to be called when arrived the message from chat
*
* Responds to a MESSAGE event in Hangouts Chat.
*
* @param {Object} event the event object from Hangouts Chat
*/
function onMessage(event) {
  
  if(event.user.type.toLowerCase() !== 'human'){
    return {'text': 'fuck off Non-Human!'}
  }else if (event.message.text.toLowerCase().indexOf("card") != -1){
    return JSON.parse(String(createCard()));  
  }else if (event.space.type == "DM"){
    return {'text': 'This Bot works only in the rooms!'}
  }else if(event.message.text.toLowerCase() === 'places' || event.message.text.toLowerCase() === '@LunchBot places' || event.message.text.toLowerCase().indexOf("place") != -1){
    // giving number to each place
    response = '';
    var places = getPlaces();
    for (index in places){
      var number = Number(index) + 1
      response +=  number + ' - ' + places[index].name + '\n'
    }
    return {'text': response}
  }else if(event.message.text.toLowerCase() === 'result' || event.message.text.toLowerCase() === '@LunchBot result' || event.message.text.toLowerCase().indexOf("result") != -1 ){
    // calculation of the result
    var votesArray = []
    var places = getPlaces();
    var allVotes = getVotes(event.space.name);
    if(allVotes == 'No Votes' ){
      return {'text': 'No Votes' }
    }else{
      for (var key in allVotes) {
        if (allVotes.hasOwnProperty(key)) {
          votesArray.push(allVotes[key])
        }
      }
      var response = places[Number(findCommon(votesArray)) - 1].name + ' won. ' + votesArray.length + 'people participated.'
      return {'text': response }
    }
  } else if (event.message.text.toLowerCase().indexOf("vote") != -1 || event.message.text.toLowerCase().indexOf("vota") != -1) {
    var vote = Number(event.message.text.slice(-2));
    var places = getPlaces();
    //return {'text' : places[vote-1]}
    if(places[vote-1]){
      updateVotes(event.space.name ,event.user.displayName , vote)
      if(places[vote-1].name.toLowerCase().indexOf("casa") != -1){
        return {'text': ':D bella vita' }
      }else{
        return {'text': event.user.displayName + ' voted for ' + places[vote-1].name }
      }
    }else{
      return {'text': 'Wrong option, try \`places\` to see all options' }
    }
    //  } else if (event.message.text === 'add') {
    //    return {'text': JSON.stringify(addData(event.message.sender.displayName , event.message.text))}
  } else if (event.message.text.toLowerCase() === 'reset' || event.message.text.toLowerCase() === '@LunchBot reset') {
    return {'text': JSON.stringify(deleteVotes(event.space.name))}
  } else if (event.message.text.toLowerCase() === 'message' || event.message.text.toLowerCase() === '@LunchBot message') {
    return { 'text': JSON.stringify(event)};
  } else if(event.message.text.toLowerCase() === 'help' || event.message.text.toLowerCase() === '@LunchBot help' ){
    return { "text": INSTRUCTION_MSG };
  }else{
    return { 'text': 'No instruction for \`' + event.message.text + '\`' + ' use \`help\` for instructions '};
  }
}

/**
* Responds to an ADDED_TO_SPACE event in Hangouts Chat.
*
* @param {Object} event the event object from Hangouts Chat
*/
function onAddToSpace(event) {
  PropertiesService.getScriptProperties()
  .setProperty(event.space.name, '');
  
  var message = "";
  
  if (event.space.type == "DM") {
    message = "Thank you for adding me to a DM, " + event.user.displayName + "! \n";
  } else {
    message = "Thank you for adding me to " + event.space.displayName + "! \n";
  }
  
  var instruction = message + INSTRUCTION_MSG 
  return { "text": instruction };
}

/**
* Responds to a REMOVED_FROM_SPACE event in Hangouts Chat.
*
* @param {Object} event the event object from Hangouts Chat
*/
function onRemoveFromSpace(event) {
  PropertiesService.getScriptProperties()
  .deleteProperty(event.space.name);
  console.info("Bot removed from ", event.space.name);
  return { "text": 'Bye' };
}

/**
* This function will trigget the reset function, to remove all votes everyday morning
*/
function onResetTrigger() {
  var spaceIds = PropertiesService.getScriptProperties()
  .getKeys();
  var message = { 'text': 'Hi! It\'s now ' + (new Date()) };
  for (var i = 0; i < spaceIds.length; ++i) {
    resetSpace(spaceIds[i]);
  }
}

/**
* This function will trigget the message on the chat to notify people for voting
*/
function onTrigger() {
  var spaceIds = PropertiesService.getScriptProperties()
  .getKeys();
  var placesString = '';
  var places = getPlaces();
  for (index in places){
    var number = Number(index) + 1;
    placesString +=  number + ' - ' + places[index].name + '\n';
  }
  //var message = {"cards": [{ "header":{ "imageUrl": "https://goo.gl/aeDtrS","title":"Hi Guys... Where do you want to eat today? Click to Vote!"},"sections": [{"widgets": [ {"buttons":[{ "textButton": { "text": "Mensa", "onClick": {"action": { "actionMethodName": "1"}}}},{ "textButton": { "text": "Miyama", "onClick": {"action": { "actionMethodName": "2"}}}},{ "textButton": { "text": "Borgo", "onClick": {"action": { "actionMethodName": "3"}}}},{ "textButton": { "text": "Contadina", "onClick": {"action": { "actionMethodName": "4"}}}},{ "textButton": { "text": "Baretto", "onClick": {"action": { "actionMethodName": "5"}}}},{ "textButton": { "text": "Principe", "onClick": {"action": { "actionMethodName": "6"}}}},{ "textButton": { "text": "Mr K", "onClick": {"action": { "actionMethodName": "7"}}}},{ "textButton": { "text": "Pizza Haus", "onClick": {"action": { "actionMethodName": "8"}}}},{ "textButton": { "text": "Grisea", "onClick": {"action": { "actionMethodName": "9"}}}},{ "textButton": { "text": "Park", "onClick": {"action": { "actionMethodName": "10"}}}},{ "textButton": { "text": "American Graffiti", "onClick": {"action": { "actionMethodName": "11"}}}},{ "textButton": { "text": "Tramè", "onClick": {"action": { "actionMethodName": "12"}}}},{ "textButton": { "text": "McDonald", "onClick": {"action": { "actionMethodName": "13"}}}},{ "textButton": { "text": "Burger King", "onClick": {"action": { "actionMethodName": "14"}}}},{ "textButton": { "text": "Paolino (Bonola)", "onClick": {"action": { "actionMethodName": "15"}}}},{ "textButton": { "text": "3 Caminetti", "onClick": {"action": { "actionMethodName": "16"}}}},{ "textButton": { "text": "Kebab", "onClick": {"action": { "actionMethodName": "17"}}}},{ "textButton": { "text": "Casa", "onClick": {"action": { "actionMethodName": "18"}}}}]}]}]}]}    
  
  //var message = { 'text': 'Hi Guys... Where do you want to eat today? \n' + placesString + 'Participate by mentioning me and typing \`vote $NumberOfTheChoice\`' };
  var message = JSON.parse(String(createCard()));
  for (var i = 0; i < spaceIds.length; ++i) {
    postMessage(spaceIds[i], message);
  }
}

function onTriggerResult(){
  var spaceIds = PropertiesService.getScriptProperties()
  .getKeys();
  for (var i = 0; i < spaceIds.length; ++i) {
    showResults(spaceIds[i]);
  }
}

var SCOPE = 'https://www.googleapis.com/auth/chat.bot';
var SERVICE_ACCOUNT_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLucNwpu1I8y8X\nnvxeTbGFIbLKsReBh5e28+up/xSJpKa+9ozEuVdJI1/3exLBxkYrJO5W3uozpEu0\nQL+AtWXTl4amBdSx60tqX81Gb/aXVphgAQdA5iFQyzIspzUJ7wc453hCoPwcNY9v\nAg9FNL/YZZ0AfGWe5c4yyJxAYzIy/u6VDeSSsaSAk4aOflK5MMKs++uZXMmKPIKK\nkGEnWqNrdlGU+raMbToNLetpn4KcaI85vvo/jcEEe84mRjx4Xd8I/ONA0qDH1szF\nRuvLEtR8fGGxBZgShhKt2G+Q9FsIvMUvzPn7Gx/ab9kUrgamDAdAxKFK7Kyo35XM\naqbq0rSrAgMBAAECggEAZVUzB1egc0ayx9cGxIl0oTnPys4nWQBu0EunjtkYCBbj\n8dyEzF08M17rHxgSjlvnDxLBkmgyqhkwpqoGFykjSwn1qaMA1raovnKEkmKij0g9\nZpNcXkWZkKxheqB420YPm5hW0x1sCUQC4j5uBghk3Gg+nb1CdrTryYrLXaN5lq8f\nrs7aS81LFdJXnQMc0YnzguA5odiGPe0TVX/Gjr4kDRBhcaOeflUEEWFdKNyxQHny\nxWEAKSj7lCxXMme2taSsFXxbaTDQRf7+PYY2cza/G5VWBMiTgFSEeETbMfO9j5FX\n/BjiWWC+f4i+kH3ydnQ89OfZRqdDNUixZF/TXQ09IQKBgQDzJDNqEPxOGozigH0K\nRh4+2Ayaxp7mPqewTn9KPfEwZJDaIgACLuyX6jW3EjrhDjNsudxtX2GetuI/Zd64\n6Lq19qEGl9thbwmJGMtE7sj2Z3aCfUhEG2ISv0qw+OgXMuLHYMnZZX4djiD5giyn\nQZc1rEQkFl7P0GPkpH+1H8ZCWQKBgQDWf+1tdxQKZtzlvopKwNQ/B+eJedeBJFIL\nBleEVbPgSZkxIYxto6rNV48vyOOqCySqIV15DYYUSKsrZvbnxgSfDr4tcSiuEj0D\nnmACMr5MEnGPBQISsqT9pfKpsq3DTIXK4HyZBQrQYXR5UDhQc8/Pm5hMdtDKAl+G\nZP2fH39mowKBgQCVo3v5FUcSkoiOheFux0SqDLGFOCRnM7xkZ4szl/euftYfSbmT\nnmmB/WTdrNyL0f+YNLMSpRchZRDNT9bJGoJ+prDnq+IajwnhVF8Vp5gK/hYTrSMi\nt2+edhhz3lyImoqzhj/0CeCaM/TbWmA898MmB0VQqGvlni08dHkccdfE0QKBgCx0\n4TGx3250eU4ImsL5ikPyEHP208qJS5PLYbIkzR4sQtri+Cb1J/5dKmkd+smQe63j\nMmtXeTWVBhz9vyi0atrIhHQIowTI9OpeFcn+2GAN5olc4VwcuIN1tIClbswufQBa\nXJieaepceHZ4QOOzzRtbRUp7ybREn6XMIqCrN41/AoGBAOtBU5Wj4d1uyOjYqy50\njIU8hFwveApydu7HE/0cGg3QZtCk4j+mnAEOpDmlBsnsrTaJbh/R+wCuWKxq42t/\nMGQ866oi38qyyQS8EF8PxtYhO+eQZAGlr9FeH7GhgFua5OZ/K2uOp9n3jgQUHSqS\nsVZhl9aOF5bMHJn9lDvwZ05S\n-----END PRIVATE KEY-----\n';
var SERVICE_ACCOUNT_EMAIL = 'starting-account-y65d2u4mrjje@poc-sm-aptar-1499416259786.iam.gserviceaccount.com';

// Posts a message into the given space ID via the API, using
// service account authentication.
function postMessage(spaceId, message) {
  var service = OAuth2.createService('chat')
  .setTokenUrl('https://accounts.google.com/o/oauth2/token')
  .setPrivateKey(SERVICE_ACCOUNT_PRIVATE_KEY)
  .setClientId(SERVICE_ACCOUNT_EMAIL)
  .setPropertyStore(PropertiesService.getUserProperties())
  .setScope(SCOPE);
  if (!service.hasAccess()) {
    Logger.log('Authentication error: %s', service.getLastError());
    return;
  }
  var url = 'https://chat.googleapis.com/v1/' + spaceId + '/messages';
  UrlFetchApp.fetch(url, {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + service.getAccessToken() },
    contentType: 'application/json',
    payload: JSON.stringify(message),
  });
}

function resetSpace (spaceId) {
  deleteVotes(spaceId)
}

function showResults(spaceId){
  var votesArray = [];
  var places = getPlaces();
  var allVotes = getVotes(spaceId);
  if(allVotes == 'No Votes' ){
    //return {'text': 'No Votes' }
  }else{
    for (var key in allVotes) {
      if (allVotes.hasOwnProperty(key)) {
        votesArray.push(allVotes[key])
      }
    }
    var response = places[Number(findCommon(votesArray)) - 1].name + ' won. ' + votesArray.length + 'people participated.'
    //return {'text': response }
    postMessage(spaceId, {'text' : response})
  }
}


