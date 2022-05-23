// This script is meant to be attached to submission form response spreadsheet

const CLIENT_FOLDER_ID = '';
const API_SECRET_KEY = '';

function onOpen() {
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('PDF')
      .addItem('Regenerate PDFs for selected row', 'genForms')
      .addToUi();
}

function genForms() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let questions = sheet.getRange("1:1").getValues()[0];
  let answers = sheet.getActiveRange().getValues()[0];
  let map = {};
  for (let i = 0; i < questions.length; i++) {
    if (questions[i].length > 0)
      map[questions[i]] = answers[i];
  }

  let person = parseSubmission(map);

  let full = person['chosen_first'].trim();
  if (person.hasOwnProperty('chosen_middle') && person['chosen_middle'].length > 0)
    full += ' ' + person['chosen_middle'].trim();
  full += ' ' + person['chosen_last'].trim();
  person['full'] = full;
  
  let legal = person['legal_first'].trim();
  if (person.hasOwnProperty('legal_middle') && person['legal_middle'].length > 0)
    legal += ' ' + person['legal_middle'].trim();
  legal += ' ' + person['legal_last'].trim();
  person['legal'] = legal;
  
  person['full_address'] = person['address'] + ', ' + person['city'] + ', ' + person['state'] + ' ' + person['zip'];

  let folder = findFolderByName(full);
  if (!folder)
    folder = createFolderByName(full);

  console.log(person);
  
  let options = {
    method: 'post',
    payload: person,
    muteHttpExceptions: true
  };
  let response = UrlFetchApp.fetch(
    'https://api.acab.enterprises/transmd/genpdf?token=' + API_SECRET_KEY,
    options
  );

  console.log(response.getResponseCode());
  if (response.getResponseCode() == 200) {
    let existing = folder.getFilesByName('Name Change Form ' + person['full'] + '.pdf');
    while (existing.hasNext())
      existing.next().setTrashed(true);
    let file = folder.createFile(response.getBlob());
    file.setName('Name Change Form ' + person['full'] + '.pdf');
  } else {
    console.log("ERROR: " + response.getContentText());
  }
}

function findFolderByName(name) {
  var clientDir = DriveApp.getFolderById(CLIENT_FOLDER_ID);
  var folders = clientDir.searchFolders("title contains '" + name + "'");
  if (folders.hasNext())
    return folders.next();
  return null;
}

function createFolderByName(name) {
  var clientDir = DriveApp.getFolderById(CLIENT_FOLDER_ID);
  return clientDir.createFolder(name);
}

function parseSubmission(map) {
  let p = {};
  for (var question in map) {
    if (!map.hasOwnProperty(question)) continue;
    switch (question) {
      case 'Chosen first name':
        p['chosen_first'] = map[question];
        break;
      case 'Chosen middle name':
        p['chosen_middle'] = map[question];
        break;
      case 'Chosen last name':
        p['chosen_last'] = map[question];
        break;
      case 'What gender marker do you want on your identification documents?':
        p['desired_gender'] = map[question];
        break;
      case 'Do you want to change your name on your birth certificate - if it\'s accessible to you? ':
        p['birth_certificate'] = map[question];
        break;
      case 'What is your birth date? ':
        p['dob'] = map[question].toString();
        if (p['dob'].includes("00:00:00")) {
          p['dob'] = p['dob'].split(" ").slice(0, 4).join(" ");
        }
        break;
      case 'How do you define your gender? ':
        p['current_gender'] = map[question];
        break;
      case 'Current legal first name':
        p['legal_first'] = map[question];
        break;
      case 'Current legal middle name':
        p['legal_middle'] = map[question];
        break;
      case 'Current legal last name':
        p['legal_last'] = map[question];
        break;
      case 'Email address':
        p['email'] = map[question];
        break;
      case 'Phone number':
        p['phone'] = map[question].toString();
        break;
      case 'Legal first name at birth':
        p['birth_first'] = map[question];
        break;
      case 'Legal middle name at birth':
        p['birth_middle'] = map[question];
        break;
      case 'Legal last name at birth':
        p['birth_last'] = map[question];
        break;
      case 'What was your reason for changing to your current name':
        p['other_legal_0_reason'] = map[question];
        break;
      case 'Other legal name 1':
        p['other_legal_1'] = map[question];
        break;
      case 'Reason for changing to legal name 1':
        p['other_legal_1_reason'] = map[question];
        break;
      case 'Other legal name 2':
        p['other_legal_2'] = map[question];
        break;
      case 'Reason for changing to legal name 2':
        p['other_legal_2_reason'] = map[question];
        break;
      case 'City of Birth':
        p['birth_city'] = map[question];
        break;
      case 'State of Birth':
        p['birth_state'] = map[question];
        break;
      case 'County of Birth':
        p['birth_county'] = map[question];
        break;
      case 'Country of Birth':
        p['birth_country'] = map[question];
        break;
      case 'Street address':
        p['address'] = map[question];
        break;
      case 'City':
        p['city'] = map[question];
        break;
      case 'State':
        p['state'] = map[question];
        break;
      case 'Zip code':
        p['zip'] = map[question].toString();
        break;
      case 'What county do you live in?':
        p['county'] = map[question];
        break;
      case 'Have you ever registered as a sex offender?':
        if (map[question].toLowerCase().includes('yes'))
          p['never_registered_so'] = 'false';
        else
          p['never_registered_so'] = 'true';
        break;
      case 'If yes, what name were you registered under?':
        p['registered_so_names'] = map[question];
        break;
      case 'What pronouns do you use? ':
        p['pronouns'] = map[question];
        break;
    }
  }
  return p;
}