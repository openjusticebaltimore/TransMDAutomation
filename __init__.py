import os
import pypdftk
from datetime import datetime
from flask import Blueprint
from flask import request, send_file

bp = Blueprint('transmd', __name__)

@bp.route('/genpdf', methods=['POST'])
def genpdf():
    county = request.values['county']
    legal_first = request.values['legal_first']
    legal_middle = request.values.get('legal_middle')
    legal_last = request.values['legal_last']
    address = request.values['address']
    city = request.values['city']
    state = request.values['state']
    zip = request.values['zip']
    chosen_first = request.values['chosen_first']
    chosen_middle = request.values.get('chosen_middle')
    chosen_last = request.values['chosen_last']
    dob = request.values['dob']
    birth_city = request.values['birth_city']
    birth_state = request.values['birth_state']
    birth_county = request.values['birth_county']
    birth_country = request.values['birth_country']
    birth_first = request.values.get('birth_first')
    birth_middle = request.values.get('birth_middle')
    birth_last = request.values.get('birth_last')
    other_legal_0_reason = request.values.get('other_legal_0_reason')
    other_legal_1 = request.values.get('other_legal_1')
    other_legal_1_reason = request.values.get('other_legal_1_reason')
    other_legal_2 = request.values.get('other_legal_2')
    other_legal_2_reason = request.values.get('other_legal_2_reason')
    never_registered_so = request.values.get('never_registered_so')
    registered_so_names = request.values.get('registered_so_names')
    email = request.values['email']
    phone = request.values.get('phone')
    birth_certificate = request.values.get('birth_certificate')
    cost_assistance = request.values['cost_assistance']

    chosen = chosen_first
    if chosen_middle:
        chosen += ' ' + chosen_middle
    chosen += ' ' + chosen_last

    legal = legal_first
    if legal_middle:
        legal += ' ' + legal_middle
    legal += ' ' + legal_last

    birth_name = ''
    if birth_first and birth_last:
        birth_name = birth_first
        if birth_middle:
            birth_name += ' ' + birth_middle
        birth_name += ' ' + birth_last

    if county == 'Allegany County':
        court_address = '30 Washington St, Cumberland, MD 21502'
        money_form = 'AlleganyCheckClerkPetitionv2.pdf'
    elif county == 'Anne Arundel County':
        court_address = '8 Church Circle, Annapolis, MD 21401'
        money_form = 'AnneArundelCountyCheckClerkPetitionv2.pdf'
    elif county == 'Baltimore City':
        court_address = '111 N Calvert St, Room 109 Family Department, Baltimore, MD 21202'
        if cost_assistance == 'true':
            money_form = 'BaltimoreCityCheckPetitionv2.pdf'
        else:
            money_form = 'BaltimoreCityMoneyOrderPetitionv2.pdf'
    elif county == 'Baltimore County':
        court_address = '401 Bosley Ave, 2nd Floor Family Department, Towson, MD 21204'
        money_form = 'BaltimoreCountyCheckClerkPetitionv2.pdf'
    elif county == 'Calvert County':
        court_address = '175 Main St, Prince Frederick, MD 20678'
        money_form = 'CalvertCountyCheckClerkPetitionv2.pdf'
    elif county == 'Caroline County':
        court_address = '109 Market St, Denton, MD 21629'
        money_form = 'CarolineCountyCheckClerkPetitionv2.pdf'
    elif county == 'Carroll County':
        court_address = '55 N Court St, Westminster, MD 21157'
        money_form = 'CarrollCountyCheckClerkPetitionv2.pdf'
    elif county == 'Cecil County':
        court_address = '129 E Main St, Elkton, MD 21921'
        money_form = 'CecilCountyCheckClerkPetitionv2.pdf'
    elif county == 'Charles County':
        court_address = '200 Charles St, La Plata, MD 20646'
        money_form = 'CharlesCountyCheckClerkPetitionv2.pdf'
    elif county == 'Dorchester County':
        court_address = '206 High St # 1, Cambridge, MD 21613'
        money_form = 'DorchesterCountyCheckClerkPetitionv2.pdf'
    elif county == 'Frederick County':
        court_address = '100 W Patrick St, Frederick, MD 21701'
        money_form = 'FrederickCountyCheckClerkPetitionv2.pdf'
    elif county == 'Garrett County':
        court_address = '203 S 4th St #109, Oakland, MD 21550'
        money_form = 'GarrettCountyCheckClerkPetitionv2.pdf'
    elif county == 'Harford County':
        court_address = '20 W Courtland St, Bel Air, MD 21014'
        money_form = 'HarfordCountyCheckClerkPetitionv2.pdf'
    elif county == 'Howard County':
        court_address = '9250 Judicial Way, Suite 1900, Ellicott City, MD 21043'
        money_form = 'HowardCountyCheckClerkPetitionv2.pdf'
    elif county == 'Kent County':
        court_address = '103 N Cross St, Chestertown, MD 21620'
        money_form = 'KentCountyCheckClerkPetitionv2.pdf'
    elif county == 'Montgomery County':
        court_address = '50 Maryland Ave, Room 1460, Rockville, MD 20850'
        money_form = 'MontgomeryCountyCheckClerkPetitionv2.pdf'
    elif county == 'Prince George\'s County':
        court_address = '14735 Main St, Room D-1033, Upper Marlboro, MD 20772'
        money_form = 'PrinceGeorgesCountyCheckClerkPetitionv2.pdf'
    elif county == 'Queen Anne\'s County':
        court_address = '200 N Commerce St, Centreville, MD 21617'
        money_form = 'QueenAnnesCountyCheckClerkPetitionv2.pdf'
    elif county == 'Somerset County':
        court_address = '30512 Prince William St, Princess Anne, MD 21853'
        money_form = 'SomersetCountyCheckClerkPetitionv2.pdf'
    elif county == 'St. Mary\'s County':
        court_address = '41605 Court House Dr, Leonardtown, MD 20650'
        money_form = 'StMarysCoCheckClerkPetitionv2.pdf'
    elif county == 'Talbot County':
        court_address = '11 N Washington St # 16, Easton, MD 21601'
        money_form = 'TalbotCountyCheckClerkPetitionv2.pdf'
    elif county == 'Washington County':
        court_address = '24 Summit Ave, Hagerstown, MD 21740'
        money_form = 'WashingtonCountyCheckClerkPetitionv2.pdf'
    elif county == 'Wicomico County':
        court_address = '101 N Division St #105, Salisbury, MD 21801'
        money_form = 'WicomicoCountyCheckClerkPetitionv2.pdf'
    elif county == 'Worcester County':
        court_address = '1 W Market St, Snow Hill, MD 21863'
        money_form = 'WorcesterCountyCheckClerkPetitionv2.pdf'

    answers = {
        'Court Address': court_address,
        'Date of Birth': dob,
        'Attached is a copy of': f'{birth_city}, {birth_state}, {birth_county}, {birth_country}',
        'Birth name': birth_name,
        'City/County': county,
        'Address': address,
        'City State Zip': f'{city}, {state} {zip}',
        'Your current legal name': legal,
        'Name you want to be known as': chosen,
        'Email': email,
        'Date': datetime.now().date().isoformat()   
    }
    if other_legal_0_reason:
        answers['Name changed to 1'] = legal
        answers['Reason 1'] = other_legal_0_reason
    if other_legal_1:
        answers['Name changed to 2'] = other_legal_1
    if other_legal_2:
        answers['Name changed to 3'] = other_legal_2
    if other_legal_1_reason:
        answers['Reason 2'] = other_legal_1_reason
    if other_legal_2_reason:
        answers['Reason 3'] = other_legal_2_reason
    if never_registered_so and never_registered_so.lower() == 'true':
        answers['I have never registered as a sexual offender'] = 'On'
    if registered_so_names:
        answers['I am or have previously been registered as a sexual offender under the following names'] = 'On'
        answers['Full names as registered including suffixes'] = registered_so_names
    if phone:
        answers['Telephone'] = phone
    if birth_certificate and birth_certificate == 'Yes - I want to change my name on my birth certificate':
        answers['Check Box8'] = 'Yes'
    
    if county == 'Washington County':
        court_address = '24 Summit Ave, Hagerstown, MD 21740'
        answers = {
            'Your current legal name': legal,
            'Name you want to be known as': chosen,
            'Check Box1': 'Yes',
            'Date of Birth': dob
        }
        waco_form = pypdftk.fill_form('/app/endpoints/transmd/forms/WaCoDecreeForm2021.pdf', answers, flatten=False)
        main_form = pypdftk.fill_form('/app/endpoints/transmd/forms/MDAdultNameChange2022.pdf', answers, flatten=False)
        tmp = pypdftk.concat([main_form, waco_form])
    if county == 'Montgomery County' or county == 'Frederick County' \
            or county == 'Harford County' or county == "St. Mary's County":
        tmp = pypdftk.fill_form('/app/endpoints/transmd/forms/MDAdultNameChange2022Posting.pdf', answers, flatten=False)
    else:
        tmp = pypdftk.fill_form('/app/endpoints/transmd/forms/MDAdultNameChange2022.pdf', answers, flatten=False)
    
    money = pypdftk.fill_form('/app/endpoints/transmd/money_forms/' + money_form, answers, flatten=False)
    final = pypdftk.concat([tmp, money])

    ret = send_file(final, mimetype='application/pdf', download_name=f'Name Change Form {chosen}.pdf')
    os.remove(tmp)
    return ret