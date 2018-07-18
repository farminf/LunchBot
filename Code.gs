var firebaseUrl = "XXX";
var secret = "XXX";
var SCOPE = 'https://www.googleapis.com/auth/chat.bot';
var SERVICE_ACCOUNT_PRIVATE_KEY = 'XXX';
var SERVICE_ACCOUNT_EMAIL = 'starting-account-xxx.iam.gserviceaccount.com';

/**
* First function to be called when arrived the message from chat
*
* Responds to a MESSAGE event in Hangouts Chat.
*
* @param {Object} event the event object from Hangouts Chat
*/
function onMessage(event) {
  
  if(event.user.type.toLowerCase() !== 'human'){
    return {'text': 'I do not talk with Non-Human!'}
  } else if(event.message.text.toLowerCase() === 'help' || event.message.text.toLowerCase() === '@lunchbot help' || event.message.text.toLowerCase().indexOf("help") != -1){
    return JSON.parse(String(createWelcomeCard(event.space.displayName)));
  }else if (event.space.type == "DM"){
    return {'text': 'LunchBot works only in the rooms!'}
  }else if (event.message.text.toLowerCase().indexOf("add") != -1) {
    var receivedText = event.message.text.toLowerCase();
    var spaceName = event.space.name
    var placeName = receivedText.slice(receivedText.indexOf("add") + 4)
    addPlace(spaceName , placeName )
    return {'text': placeName+ ' added in LunchBot for ' + event.space.displayName + ' as a new place to eat.'}
  }else if (event.message.text.toLowerCase().indexOf("delete") != -1) {
    var receivedText = event.message.text.toLowerCase();
    var spaceName = event.space.name
    var placeName = receivedText.slice(receivedText.indexOf("delete") + 7)
    deleteSpacePlace(spaceName , placeName )
    return {'text': placeName+ ' deleted from LunchBot for ' + event.space.displayName }
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
      var response = findCommon(votesArray) + ' won. ' + votesArray.length + ' people participated.'
      return {'text': response }
    }
  } else if (event.message.text.toLowerCase() === 'reset' || event.message.text.toLowerCase() === '@lunchbot reset') {
    return {'text': JSON.stringify(deleteVotes(event.space.name))}
  } else if (event.message.text.toLowerCase() === 'message' || event.message.text.toLowerCase() === '@lunchbot message') {
    return { 'text': JSON.stringify(event)};
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
    var vote = event.action.actionMethodName;
    Logger.log('vote: %s', vote);
    var places = getSpacePlaces(event.space.name);
    Logger.log('places: %s', places);
    if(places.indexOf(vote) > -1){
      updateVotes(event.space.name ,event.user.displayName , vote)
      return {'text': event.user.displayName + ' voted for ' + vote }
      
    }else{
      return {'text': 'Wrong option, try \`places\` to see all options' }
    }
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
* to find the place with highest votes
*/
function findCommon(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;  
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}
/**
* to get all the votes from firebase
*/
function getVotes(space) {
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
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  var data = base.getData();
  return data.place
}

/**
* to get specific places for a space from firebase
*/
function getSpacePlaces(space) {
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
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  base.setData(space + "/votes/" + person, vote);
  return base.getData().votes
  
}

/**
* insert place for each space in the related space
*/
function addPlace(space , place) {
  var base = FirebaseApp.getDatabaseByUrl(firebaseUrl, secret);
  base.setData(space + "/places/" + place, place);
  return base.getData().votes
  
}

/**
* Deletes all the votes in the passed space
*/
function deleteVotes(space) {
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
  if(allVotes == 'No vote for today' ){
  
  }else{
    for (var key in allVotes) {
      if (allVotes.hasOwnProperty(key)) {
        votesArray.push(allVotes[key])
      }
    }
    var response = findCommon(votesArray) + ' won. ' + votesArray.length + ' people participated.'
    postMessage(spaceId, {'text' : response})
  }
}


function generateCardPlaces(places){
 
  var widgets = []
  for (index in places){
      widgets.push(
        '{"widgets": [ {"buttons":[{ "textButton": { "text": "'  + String(places[index]) + '", "onClick": {"action": { "actionMethodName": "' + String(places[index]) +'"}}}}]}]}'
      )
  }
  var result =  '{"cards": [{ "header":{ "imageUrl": "https://goo.gl/aeDtrS","title":"Hey guys... Where do you want to eat today? Click to Vote!"},"sections": [' + widgets + ']}]}'
  Logger.log('generateCardPlaces: %s', result);
  return  result       
}

function createWelcomeCard (roomName){
  var subtitle = "Thanks for adding me!"
  var message = "<b>Before start,LunchBot works only in the rooms and you need to Login, in order to communicate with bot.</b> \
<br><br><li>- You can add a new place by mentioning me and typing <b>add</b> and name of the place(example: <font color='#830D0D'>@lunchbot add KFC</font>). \
<br>- You can delete a place by mentioning me and typing <b>delete</b> and name of the place(example: <font color='#830D0D'>@lunchbot delete KFC</font>). \
<br>- You can get the list of places to eat by mentioning me and typing <b>places</b> and then by clicking on each place, you can vote. \
<br>- Whenever you want you can ask me for result by typing <b>result</b>. \
<br><br><i>note 1: I will count only last vote of each person. \
<br>note 2: In the room(group), try to call me by <font color='#830D0D'>@lunchbot</font> \
<br>note 3: If there are 2 places equaly with highest votes, the one who got the first vote wins</i>"

 var  msg =  '{ "cards": [{ "header":{ "imageUrl": "https://goo.gl/aeDtrS","title": "LunchBot","subtitle":"'+ String(subtitle) +'"},"sections": [{"widgets": [{"textParagraph": {"text": "'+ String(message) + '"}}]}]}]}' 
 
 return msg
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




