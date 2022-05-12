const CLIENT_FOLDER_ID = '';
const API_SECRET_KEY = '';

function onFormSubmit(e) {
  let person = parseSubmission(e);
  
  let full = person['chosen_first'];
  if (person.hasOwnProperty('chosen_middle'))
    full += ' ' + person['chosen_middle'];
  full += ' ' + person['chosen_last'];
  person['full'] = full;
  
  let legal = person['legal_first'];
  if (person.hasOwnProperty('legan_middle'))
    legal += ' ' + person['legan_middle'];
  legal += ' ' + person['legan_last'];
  person['legal'] = legal;
  
  person['full_address'] = person['address'] + ', ' + person['city'] + ', ' + person['state'] + ' ' + person['zip'];

  let folder = findFolderByName(full);
  if (!folder)
    folder = createFolderByName(full);

  genDoc(folder, person, generateAnswersTable(e), e.response.getTimestamp());
  genForms(folder, person);
}

function parseSubmission(e) {
  let p = {};
  for (const response of e.response.getItemResponses()) {
    switch (response.getItem().getTitle()) {
      case 'Chosen first name':
        p['chosen_first'] = response.getResponse();
        break;
      case 'Chosen middle name':
        p['chosen_middle'] = response.getResponse();
        break;
      case 'Chosen last name':
        p['chosen_last'] = response.getResponse();
        break;
      case 'What gender marker do you want on your identification documents?':
        p['desired_gender'] = response.getResponse();
        break;
      case 'Do you want to change your name on your birth certificate - if it\'s accessible to you? ':
        p['birth_certificate'] = response.getResponse();
        break;
      case 'What is your birth date? ':
        p['dob'] = response.getResponse();
        break;
      case 'How do you define your gender? ':
        p['current_gender'] = response.getResponse();
        break;
      case 'Current legal first name':
        p['legal_first'] = response.getResponse();
        break;
      case 'Current legal middle name':
        p['legal_middle'] = response.getResponse();
        break;
      case 'Current legal last name':
        p['legal_last'] = response.getResponse();
        break;
      case 'Email address':
        p['email'] = response.getResponse();
        break;
      case 'Phone number':
        p['phone'] = response.getResponse();
        break;
      case 'Legal first name at birth':
        p['birth_first'] = response.getResponse();
        break;
      case 'Legal middle name at birth':
        p['birth_middle'] = response.getResponse();
        break;
      case 'Legal last name at birth':
        p['birth_last'] = response.getResponse();
        break;
      case 'Other legal name 1':
        p['other_legal_1'] = response.getResponse();
        break;
      case 'Reason for changing to legal name 1':
        p['other_legal_1_reason'] = response.getResponse();
        break;
      case 'Other legal name 2':
        p['other_legal_2'] = response.getResponse();
        break;
      case 'Reason for changing to legal name 2':
        p['other_legal_2_reason'] = response.getResponse();
        break;
      case 'City of Birth':
        p['birth_city'] = response.getResponse();
        break;
      case 'State of Birth':
        p['birth_state'] = response.getResponse();
        break;
      case 'County of Birth':
        p['birth_county'] = response.getResponse();
        break;
      case 'Country of Birth':
        p['birth_country'] = response.getResponse();
        break;
      case 'Street address':
        p['address'] = response.getResponse();
        break;
      case 'City':
        p['city'] = response.getResponse();
        break;
      case 'State':
        p['state'] = response.getResponse();
        break;
      case 'Zip code':
        p['zip'] = response.getResponse();
        break;
      case 'What county do you live in?':
        p['county'] = response.getResponse();
        break;
      case 'Have you ever registered as a sex offender?':
        if (response.getResponse().toLowerCase().includes('yes'))
          p['never_registered_so'] = 'false';
        else
          p['never_registered_so'] = 'true';
        break;
      case 'If yes, what name were you registered under?':
        p['registered_so_names'] = response.getResponse();
        break;
      case 'What pronouns do you use? ':
        p['pronouns'] = response.getResponse();
        break;
    }
  }
  return p;
}

function genForms(folder, person) {
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
    let file = folder.createFile(response.getBlob());
    file.setName('Name Change Form ' + person['full'] + '.pdf');
  } else {
    console.log("ERROR: " + response.getContentText());
  }
}

function genDoc(folder, person, answers, timestamp) {
  var results = folder.searchFiles("title contains '" + person['full'] + "'");
  if (!results.hasNext()) {
    let doc = DocumentApp.create(person['full']);
    let docFile = DriveApp.getFileById(doc.getId());
    folder.addFile(docFile);
    DriveApp.getRootFolder().removeFile(docFile);
    let body = doc.getBody();
    body.appendTable(generateHeaderTable(person));
    body.appendParagraph("");
    body.appendParagraph(timestamp.toString());
    body.appendTable(answers);
    doc.saveAndClose();
  } else {
    let docFile = results.next();
    let doc = DocumentApp.openById(docFile.getId());
    let body = doc.getBody();
    body.insertHorizontalRule(3);
    body.insertTable(3, answers);
    body.insertParagraph(3, timestamp.toString());
    body.insertParagraph(3,"");
    doc.saveAndClose();
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

function generateAnswersTable(e) {
  let cells = [];
  for (const response of e.response.getItemResponses()) {
    if (response.getResponse()) {
      let res = response.getResponse();
      if (Array.isArray(res))
        res = res.join(',');
      let question = response.getItem().getTitle();
      if (!question.includes('The information provided on this form'))
        cells.push([question, res]);
    }
  }
  return cells;
}

function generateHeaderTable(p) {
  return [
    ['Chosen name', p['full']],
    ['Legal name', p['legal']],
    ['DOB', p['dob']],
    ['Phone', p['phone']],
    ['Email', p['email']],
    ['Pronouns', p['pronouns']],
    ['Address', p['full_address']],
    ['County', p['county']]
  ];
}

function test_all() {
  test_genDoc()
  test_genForms()
}

function test_genForms() {
  let full = 'Firstname Middlename Lastname';
  let folder = findFolderByName(full);
  if (!folder)
    folder = createFolderByName(full);
  let person = {
    desired_gender: 'Female (F)',
    dob: '1950-01-01',
    current_gender: 'gender',
    chosen_first: 'Firstname',
    chosen_middle: 'Middlename',
    chosen_last: 'Lastname',
    full: 'Firstname Middlename Lastname',
    legal_first: 'legalfirst',
    legal_middle: 'legalmiddle',
    legal_last: 'legallast',
    email: 'foo@aasd.asd',
    phone: '4105555555',
    birth_first: 'legalfirst',
    birth_middle: 'legalmiddle',
    birth_last: 'legallast',
    other_legal_1: 'other legal',
    other_legal_1_reason: 'test',
    other_legal_2: 'other legal 2',
    other_legal_2_reason: 'test',
    birth_city: 'Baltimore',
    birth_state: 'MD',
    birth_county: 'Baltimore City',
    birth_country: 'USA',
    address: '123 Street',
    city: 'Baltimore',
    state: 'MD',
    zip: '21212',
    county: 'Frederick County',
    never_registered_so: 'true',
    registered_so_names: 'registered name',
    birth_certificate: 'Yes - I want to change my name on my birth certificate'
  };
  genForms(folder, person);
}

function test_genDoc() {
  let full = 'Firstname Middlename Lastname';
  let folder = findFolderByName(full);
  if (!folder)
    folder = createFolderByName(full);
  let person = {
    dob: '1950-01-01',
    chosen_first: 'Firstname',
    chosen_middle: 'Middlename',
    chosen_last: 'Lastname',
    full: 'Firstname Middlename Lastname',
    legal_first: 'legalfirst',
    legal_middle: 'legalmiddle',
    legal_last: 'legallast',
    legal: 'legalfirst legalmiddle legallast',
    email: 'foo@aasd.asd',
    phone: '4105555555',
    address: '123 Street',
    city: 'Baltimore',
    state: 'MD',
    zip: '21212',
    full_address: '123 Street, Baltimore, MD 21212',
    county: 'Frederick County',
    pronouns: 'They/them',
    birth_certificate: 'Yes - I want to change my name on my birth certificate'
  };
  let answers = [ [ 'Do you currently live in Maryland?',
      'Yes - I live in Maryland.' ],
    [ 'I am 18 years old, or am assisting a person 18 years old to fill out this application. ',
      'Yes - I am 18 years old, or am assisting someone 18 years old.' ],
    [ 'How do you describe your goals for your name change timeline? ',
      'I am in a rush to file' ],
    [ 'Are you...',
      'A trans adult either binary or nonbinary, seeking a name change. Adult = 18+' ],
    [ 'What gender marker do you want on your identification documents?',
      'Female (F)' ],
    [ 'Do you want to change your name on your birth certificate - if it\'s accessible to you? ',
      'Yes - I want to change my name on my birth certificate' ],
    [ 'What is your birth date? ', '1950-01-01' ],
    [ 'How do you define your gender? ', 'gender' ],
    [ 'What pronouns do you use? ', 'They/them' ],
    [ 'How do you define your race / ethnicity? ',
      'Black or African American' ],
    [ 'Do you have access to a printer?',
      'Yes - I can print my forms myself once they\'re completed.' ],
    [ 'Chosen first name', 'Firstname' ],
    [ 'Chosen middle name', 'Middlename' ],
    [ 'Chosen last name', 'Lastname' ],
    [ 'Current legal first name', 'legalfirst' ],
    [ 'Current legal middle name', 'legalmiddle' ],
    [ 'Current legal last name', 'legallast' ],
    [ 'Preferred contact method', 'Email,Text,other' ],
    [ 'Email address', 'foo@aasd.asd' ],
    [ 'Phone number', '4105555555' ],
    [ 'Can we leave a voicemail on your phone about your name change?',
      'Yes - it\'s ok to leave a voicemail on my phone about my name change.' ],
    [ 'What medical practice do you go to?', 'test' ],
    [ 'What is the name of your medical provider?', 'test' ],
    [ 'Are you currently enrolled with Maryland Medicaid? ',
      'Yes - I am currently enrolled in Maryland Medicaid' ],
    [ 'Have you ever legally changed your name before?',
      'Yes - I have legally changed my name before.' ],
    [ 'Legal first name at birth', 'legalfirst' ],
    [ 'Legal middle name at birth', 'legalmiddle' ],
    [ 'Legal last name at birth', 'legallast' ],
    [ 'What was your reason for changing to your current name',
      'test' ],
    [ 'Have you changed your name more than once', 'Yes' ],
    [ 'Other legal name 1', 'other legal' ],
    [ 'Reason for changing to legal name 1', 'test' ],
    [ 'Other legal name 2', 'other legal 2' ],
    [ 'Reason for changing to legal name 2', 'test' ],
    [ 'City of Birth', 'Baltimore' ],
    [ 'State of Birth', 'MD' ],
    [ 'County of Birth', 'Baltimore City' ],
    [ 'Country of Birth', 'USA' ],
    [ 'Do you have a mailing address?',
      'Yes - I have a legal mailing address.' ],
    [ 'Street address', '123 Street' ],
    [ 'City', 'Baltimore' ],
    [ 'State', 'MD' ],
    [ 'Zip code', '21212' ],
    [ 'What county do you live in?', 'Washington County' ],
    [ 'Can you afford the cost of your petition ($165) and other documents ($80-$300), or do you need assistance from our program?',
      'No - I will need assistance with those costs' ],
    [ 'Have you experienced job loss, furlough, reduction in hours, or any other financial situation as a result of COVID-19? ',
      'yes' ],
    [ 'Do you have an income?', 'Yes - I have an income' ],
    [ 'How many members are there in your household?', '5' ],
    [ 'Total gross monthly household income from wages', '123' ],
    [ 'Total gross monthly household income from Social Security/SSI',
      '123' ],
    [ 'Total gross monthly household income from Unemployment Insurance',
      '123' ],
    [ 'Total gross monthly household income from Temporary Cash Assistance',
      '123' ],
    [ 'Total gross monthly household income from alimony', '123' ],
    [ 'Total gross monthly household income from any other income',
      '123' ],
    [ 'Do you have any property in your name?', 'Yes' ],
    [ 'Is more than one car in your name?', 'Yes' ],
    [ 'Car #1 value', '123' ],
    [ 'Car #2 value', '123' ],
    [ 'Is more than one real estate property in your name?', 'yes' ],
    [ 'Property #1 value', '123' ],
    [ 'Property #2 value', '123' ],
    [ 'Do you have a bank account in your name?', 'Yes' ],
    [ 'What is the current balance of all bank accounts in your name?',
      '123' ],
    [ 'Credit card balance', '123' ],
    [ 'Monthly payment for credit card', '123' ],
    [ 'Other loan type', '123' ],
    [ 'Other loan balance', '123' ],
    [ 'Other loan monthly payment', '123' ],
    [ 'Have you ever registered as a sex offender?',
      'Yes - I have registered as a sex offender' ],
    [ 'If yes, what name were you registered under?',
      'registered name' ],
    [ 'Entering my current legal name here is an indication that I have read and understand the above disclaimer. ',
      'my name' ] ];
  
  genDoc(folder, person, answers, new Date());
}