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
  var firebaseUrl = "https://anomaliesapp.firebaseio.com/";
  var secret = "cyMhyEpv4auOxtCwuGqmoEHahe4Yvmy2zkIKeSU5";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  var data = base.getData();
  var spaceName = space.split('/')[1]
  if(data.spaces != undefined && data.spaces[spaceName] != undefined && data.spaces[spaceName].votes != undefined){
    return data.spaces[spaceName].votes
  }else{
    return 'No vote for today'
  }
}

/**
* not using this at the moment
*/
function getPlaces() {
  var firebaseUrl = "https://anomaliesapp.firebaseio.com/";
  var secret = "cyMhyEpv4auOxtCwuGqmoEHahe4Yvmy2zkIKeSU5";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  var data = base.getData();
  return data.place
}

/**
* to get specific places for a space from firebase
*/
function getSpacePlaces(space) {
  var firebaseUrl = "https://anomaliesapp.firebaseio.com/";
  var secret = "cyMhyEpv4auOxtCwuGqmoEHahe4Yvmy2zkIKeSU5";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  var data = base.getData();
  var spaceName = space.split('/')[1]
  var placesArray = []
  if(data.spaces != undefined && data.spaces[spaceName] != undefined){
    
    for (var key in data.spaces[spaceName].places) {
      if (data.spaces[spaceName].places.hasOwnProperty(key)) {
        placesArray.push(data.spaces[spaceName].places[key])
      }
    }
    return placesArray
  }else{
    return 'No Place Added'
  }
}

/**
* insert vote for each person in the related space
*/
function updateVotes(space ,person , vote) {
  var firebaseUrl = "https://anomaliesapp.firebaseio.com/";
  var secret = "cyMhyEpv4auOxtCwuGqmoEHahe4Yvmy2zkIKeSU5";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  base.setData(space + "/votes/" + person, vote);
  return base.getData().votes
  
}

/**
* insert place for each space in the related space
*/
function addPlace(space , place) {
  var firebaseUrl = "https://anomaliesapp.firebaseio.com/";
  var secret = "cyMhyEpv4auOxtCwuGqmoEHahe4Yvmy2zkIKeSU5";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  base.setData(space + "/places/" + place, place);
  return base.getData().votes
  
}

/**
* Deletes all the votes in the passed space
*/
function deleteVotes(space) {
  var firebaseUrl = "https://anomaliesapp.firebaseio.com/";
  var secret = "cyMhyEpv4auOxtCwuGqmoEHahe4Yvmy2zkIKeSU5";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  base.setData(space + "/votes/" , {});
  var data = base.getData();
  if(data.votes != undefined){
    return data.votes
  }else{
    return 'No More Votes'
  }
}


/**
* Deletes a place in the specific space
*/
function deleteSpacePlace(space , place) {
  Logger.log('space: %s', space);
  Logger.log('place: %s', place);
  var firebaseUrl = "https://anomaliesapp.firebaseio.com/";
  var secret = "cyMhyEpv4auOxtCwuGqmoEHahe4Yvmy2zkIKeSU5";
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  base.removeData(space + "/places/" + place );
  var data = base.getData();
  if(data.votes != undefined){
    return data.votes
  }else{
    return 'No More Votes'
  }
}

function resetSpace (spaceId) {
  deleteVotes(spaceId)
}

function showResults(spaceId){
  var votesArray = [];
  var places = getSpacePlaces(spaceId);
  var allVotes = getVotes(spaceId);
  if(allVotes == 'No Votes' ){
  
  }else{
    for (var key in allVotes) {
      if (allVotes.hasOwnProperty(key)) {
        votesArray.push(allVotes[key])
      }
    }
    var response = places[Number(findCommon(votesArray))] + ' won. ' + votesArray.length + ' people participated.'
    postMessage(spaceId, {'text' : response})
  }
}


function generateCardPlaces(places){
 
  var widgets = []
  for (index in places){
      widgets.push(
        '{"widgets": [ {"buttons":[{ "textButton": { "text": "'  + String(places[index]) + '", "onClick": {"action": { "actionMethodName": "' + String(index) +'"}}}}]}]}'
      )
  }
  var result =  '{"cards": [{ "header":{ "imageUrl": "https://goo.gl/aeDtrS","title":"Hey guys... Where do you want to eat today? Click to Vote!"},"sections": [' + widgets + ']}]}'
  Logger.log('generateCardPlaces: %s', result);
  return  result       
}

function createWelcomeCard (roomName){
  var header = "Thanks for adding me to <b>"+ roomName +"</b>!"
  var message = "You can add a new place by mentioning me and typing \`add\` and name of the place(example: <i>@lunchbot add KFC</i>).\
<br>You can delete a place by mentioning me and typing \`delete\` and name of the place(example: <i>@lunchbot delete KFC</i>).\
<br>You can get the list of places to eat by mentioning me and typing \`places\` and then by clicking on each place, you can vote.\
<br>Whenever you want you can ask me for result by typing result.<i><br>note 1: \
I will count only last vote of each person.  <br>note 2: In the room(group), try to call me by @LunchBot \
<br>note 3: If there are 2 places equaly with highest votes, the one who got the first vote wins</i>"

 var  msg =  '{ "cards": [{ "header":{ "imageUrl": "https://goo.gl/aeDtrS","title":"'+ String(header) +'"},"sections": [{"widgets": [{"textParagraph": {"text": "'+ String(message) + '"}}]}]}]}' 
 
 return msg
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
  }else if (event.space.type == "DM"){
    return {'text': 'This Bot works only in the rooms!'}
  }else if (event.message.text.toLowerCase().indexOf("add") != -1) {
    var receivedText = event.message.text.toLowerCase();
    var spaceName = event.space.name
    var placeName = receivedText.slice(receivedText.indexOf("add") + 4)
    addPlace(spaceName , placeName )
    return {'text': placeName+ ' added for ' + spaceName}
  }else if (event.message.text.toLowerCase().indexOf("delete") != -1) {
    var receivedText = event.message.text.toLowerCase();
    var spaceName = event.space.name
    var placeName = receivedText.slice(receivedText.indexOf("delete") + 7)
    deleteSpacePlace(spaceName , placeName )
    return {'text': placeName+ ' deleted from ' + spaceName}
  }else if(event.message.text.toLowerCase() === 'places' || event.message.text.toLowerCase() === '@lunchbot places'){
        var places = getSpacePlaces(event.space.name)
    Logger.log('log: %s', places);
    return JSON.parse(String(generateCardPlaces(places)))
  }else if(event.message.text.toLowerCase() === 'result' || event.message.text.toLowerCase() === '@lunchbot result' || event.message.text.toLowerCase().indexOf("result") != -1 ){
    // calculation of the result
    var votesArray = []
    var places = getSpacePlaces(event.space.name);
    var allVotes = getVotes(event.space.name);
    if(allVotes == 'No vote for today' ){
      return {'text': 'No Votes' }
    }else{
      for (var key in allVotes) {
        if (allVotes.hasOwnProperty(key)) {
          votesArray.push(allVotes[key])
        }
      }
      var response = places[Number(findCommon(votesArray))] + ' won. ' + votesArray.length + ' people participated.'
      return {'text': response }
    }
  } else if (event.message.text.toLowerCase() === 'reset' || event.message.text.toLowerCase() === '@lunchbot reset') {
    return {'text': JSON.stringify(deleteVotes(event.space.name))}
  } else if (event.message.text.toLowerCase() === 'message' || event.message.text.toLowerCase() === '@lunchbot message') {
    return { 'text': JSON.stringify(event)};
  } else if(event.message.text.toLowerCase() === 'help' || event.message.text.toLowerCase() === '@lunchbot help'){
    return JSON.parse(String(createWelcomeCard(event.space.displayName)));
  }else{
    return { 'text': 'No instruction for \`' + event.message.text + '\`' + ' use \`help\` for instructions '};
  }
}

/**
*  On click event in the chat, this callback will be called
*
*/
function onCardClick(event){
   Logger.log('event: %s', event);
  //return { 'text': JSON.stringify(event)};
  if(event.type == "CARD_CLICKED"){
    var vote = Number(event.action.actionMethodName);
    var places = getSpacePlaces(event.space.name);
    if(places[vote]){
      Logger.log('vote: %s', vote);
      Logger.log('place: %s', places[vote]);
      updateVotes(event.space.name ,event.user.displayName , vote)
      if(places[vote].toLowerCase().indexOf("casa") != -1){
        return {'text': 'aaaa bella vita ' + event.user.displayName }
      }else{
        return {'text': event.user.displayName + ' voted for ' + places[vote] }
      }
    }else{
      return {'text': 'Wrong option, try \`places\` to see all options' }
    }
    return { 'text': JSON.stringify(event)};
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
    message = JSON.parse(String(createWelcomeCard(event.user.displayName)));
  } else {
    message = JSON.parse(String(createWelcomeCard(event.space.displayName)));
  }
  return message;
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
  
  for (var i = 0; i < spaceIds.length; ++i) {
    var places = getSpacePlaces(spaceIds[i])
    postMessage(spaceIds[i], JSON.parse(String(generateCardPlaces(places))));
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




