"use strict";

var tokens, replacements = {};
var changeToNum = {};

function initReplace() {

	// initialize text-number -> number replacemtents. 0...100
	changeToNum = {};
	var xLang = Homey.manager( 'i18n' ).getLanguage( );
	switch(xLang){
	case 'nl':
		var replUnit = ['nul','een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen'];
		var replTeen = ['tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
		var replTen = ['', 'tien', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig'];
		break;
	default: // 'en'
		var replUnit = ['zero','one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
		var replTeen = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
		var replTen = ['', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
	}

	for(var i = 99; i > -1; i--){
		var t_input = '', t_replace = '';
		var i1 = Math.floor(i/10), i2 = i-i1*10;

		switch(xLang){
		case 'de':
			switch(i1){
			case 0: t_input = replUnit[i]; if(i == 1){ t_input += 's';} break;
			case 1: t_input = replTeen[i2]; break;
			default: t_input = replTen[i1]; if(i2 > 0){ t_input = replUnit[i2] + 'und' + t_input; }
			}
			break;

		case 'nl':
			switch(i1){
			case 0: t_input = replUnit[i]; break;
			case 1: t_input = replTeen[i2]; break;
			default: t_input = replTen[i1]; if(i2 > 0){ t_input = replUnit[i2] + 'en' + t_input; }
			}
			break;

		default: // 'en'
			switch(i1){
			case 0: t_input = replUnit[i]; break;
			case 1: t_input = replTeen[i2]; break;
			default: t_input = replTen[i1]; if(i2 > 0){ t_input = t_input + '-' + replUnit[i2]; }
			}
		}
		
		//if (i < 11){ 
			t_input = ' ' + t_input + ' ';
			t_replace = ' ' + i.toString() + ' ';
		//}
		changeToNum[t_input] = t_replace;
	}


	// initialize usertext -> num replacemtents. 0...100
    	var replText = Homey.manager('settings').get('replacements');
	if (typeof replText === 'object') {
		Object.keys(replText).forEach(function (key) {
			var xKey = ' ' + key.toLowerCase().trim() + ' ';
			changeToNum[xKey] = ' ' + replText[key].trim() + ' ';
		});
	}
}


Homey.manager('flow').on('action.number_detect', function( callback, args ){
	var txt_in = ' ' + args.droptoken + ' ',
		txt = txt_in.toLowerCase(),
		numStart = -1, 
		numStart2 = -1, 
		numEnd = -1, 
		numEnd2 = -1, 
		numDetected = '',
		numDetected2 = '',
		mDig = [];

	var hLog = '';
	// replacements
	if (typeof changeToNum === 'object') {
		Object.keys(changeToNum).forEach(function (key) {
			var txt_change = changeToNum[key];
			while(txt_change.length>1 && txt.indexOf(key)>-1){
				txt = txt.replace(key, txt_change);
				hLog += (key + ' --> ' + txt_change + '\n');
			}

			// remove internalspaces from key and check again for replacements.
			var xkey = key.trim();
			if(xkey.indexOf(' ')>-1){
				// remove spaces from copied key
				while(xkey.indexOf(' ')>-1){
					xkey = xkey.substr(0, xkey.indexOf(' ')) + xkey.substr(xkey.indexOf(' ')+1);
				}
				xkey = ' ' + xkey + ' ';
				while(txt_change.length>1 && txt.indexOf(xkey)>-1){
					txt = txt.replace(xkey, txt_change);
					hLog += (xkey + ' --> ' + txt_change + '\n');
				}
			}
		});
	}

	// search for numbers
	for(var i=0; i<txt.length; i++){
		var chCode = txt.charCodeAt(i);
		var numCode = ((chCode >= 48) && (chCode <= 57));
		if((numStart < 0) && numCode){
			numStart = i;
		} else if(numEnd < 0 && numStart >= 0 && !numCode){
			numEnd = i;
			numDetected = txt.substring(numStart, numEnd);
		} else if(numEnd >= 0 && (numStart2 < 0) && numCode){
			numStart2 = i;
		} else if(numEnd2 < 0 && numStart2 >= 0 && !numCode){
			numEnd2 = i;
			numDetected2 = txt.substring(numStart2, numEnd2);
		}
	}

	// log
	if(numDetected.length>0 || numDetected2.length>0){
		Homey.log('');
		Homey.log('Number(s) detected: ' + numDetected + ', ' + numDetected2);
		Homey.log('In text:' + txt_in);
		if(txt_in != txt){ Homey.log('Conversion:' + txt);}
		Homey.log(hLog.trim());
	}

	// assign to trigger cards
	if(numDetected.length>0 && numDetected2.length==0){
		if( Number(numDetected)<1000000){
			// trigger card: 1 number found
			mDig = [0, 0, 0, 0, 0, 0];
			for(var j=0; j<6; j++){
				if( j<numDetected.length){
					mDig[5-j] = Number(numDetected.substr(numDetected.length - 1 - j, 1));
				}
			}
			tokens = {'full_text': txt_in, 'detected_number': Number(numDetected), 'digit_6': mDig[0], 'digit_5': mDig[1], 'digit_4': mDig[2], 'digit_3': mDig[3], 'digit_2': mDig[4], 'digit_1': mDig[5] };
			Homey.manager('flow').trigger('one_number', tokens);
		}

	} else if(numDetected.length>0 && numDetected2.length>0){
		// trigger card: 2 numbers found, 2+3 digits
		if( Number(numDetected)<100 && Number(numDetected2)<1000){
			mDig = [0, 0, 0, 0, 0, 0];
			for(var j=0; j<2; j++){
				if( j<numDetected.length){
					mDig[2-j] = Number(numDetected.substr(numDetected.length - 1 - j, 1));
				}
			}
			for(var j=0; j<3; j++){
				if( j<numDetected2.length){
					mDig[5-j] = Number(numDetected2.substr(numDetected2.length - 1 - j, 1));
				}
			}
			tokens = {'full_text': txt_in, 'detected_number': Number(numDetected), 'detected_number2': Number(numDetected2), 'digit_5': mDig[1], 'digit_4': mDig[2], 'digit_3': mDig[3], 'digit_2': mDig[4], 'digit_1': mDig[5] };
			Homey.manager('flow').trigger('two_numbers', tokens); 
		}

		// trigger card: 3 + 2
		if( Number(numDetected)<1000 && Number(numDetected2)<100){
			mDig = [0, 0, 0, 0, 0, 0];
			for(var j=0; j<3; j++){
				if( j<numDetected.length){
					mDig[3-j] = Number(numDetected.substr(numDetected.length - 1 - j, 1));
				}
			}
			for(var j=0; j<2; j++){
				if( j<numDetected2.length){
					mDig[5-j] = Number(numDetected2.substr(numDetected2.length - 1 - j, 1));
				}
			}
			tokens = {'full_text': txt_in, 'detected_number': Number(numDetected), 'detected_number2': Number(numDetected2), 'digit_5': mDig[1], 'digit_4': mDig[2], 'digit_3': mDig[3], 'digit_2': mDig[4], 'digit_1': mDig[5] };
			Homey.manager('flow').trigger('two_numbers_b', tokens);
		}

		// trigger card: 1st of 2 found numbers
		if( Number(numDetected)<1000000){
			mDig = [0, 0, 0, 0, 0, 0];
			for(var j=0; j<6; j++){
				if( j<numDetected.length){
					mDig[5-j] = Number(numDetected.substr(numDetected.length - 1 - j, 1));
				}
			}
			tokens = {'full_text': txt_in, 'detected_number': Number(numDetected), 'digit_6': mDig[0], 'digit_5': mDig[1], 'digit_4': mDig[2], 'digit_3': mDig[3], 'digit_2': mDig[4], 'digit_1': mDig[5] };
			Homey.manager('flow').trigger('two_numbers_1', tokens);
		}

		// trigger card: 2nd of 2 found numbers
		if( Number(numDetected2)<1000000){
			mDig = [0, 0, 0, 0, 0, 0];
			for(var j=0; j<6; j++){
				if( j<numDetected2.length){
					mDig[5-j] = Number(numDetected2.substr(numDetected2.length - 1 - j, 1));
				}
			}
			tokens = {'full_text': txt_in, 'detected_number': Number(numDetected2), 'digit_6': mDig[0], 'digit_5': mDig[1], 'digit_4': mDig[2], 'digit_3': mDig[3], 'digit_2': mDig[4], 'digit_1': mDig[5] };
			Homey.manager('flow').trigger('two_numbers_2', tokens);
		}
	}
	callback( null, true ); // fired successfully 
});


Homey.manager('settings').on('set', function (setting) {
	if (setting !== 'replacements') {
		return;
	}
	initReplace();
});

function init() {
	initReplace();
	Homey.log("Numcatch installed.");
}

module.exports.init = init;