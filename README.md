Numcatch searches for numbers in a text and splits them into individual figures for use with keypad-controls like TV-channel selection. Optionally certain texts can be converted to a number first.

##Action card:
* The action-card is the gateway to Numcatch. It will scan a text and when it finds one or two numbers, the matching trigger-cards will run a flow for further processing of these numbers and/or their individual digits. Any other numbers after the first two will be ignored.

##Trigger cards (5 available):

* 1 number found:
	* This card triggers when only 1 number is found and the value is less than 1,000,000.
	* Tokens available for the number and its 6 individual digits.

* 2 numbers found, 2+3 digits:
	* This card triggers when 2 numbers are found. The value of the 1st number is less than 100 and the value of the 2nd number is less than 1000.
	* Tokens available for the numbers, 2 individual digits for the 1st number and 3 individual digits for the 2nd number.

* 2 numbers found, 3+2 digits:
	* This card triggers when 2 numbers are found. The value of the 1st number is less than 1000 and the value of the 2nd number is less than 100.
	* Tokens available for the numbers, 3 individual digits for the 1st number and 2 individual digits for the 2nd number.

And for extreme cases where you might want to control thousands of devices with thousands of values...

* 1st of 2 found numbers:
	* This card will trigger when 2 numbers are found and the value of both numbers is less than 1,000,000.
	* Tokens available for the 1st number and its 6 individual digits.

* 2nd of 2 found numbers:
	* This card will trigger when 2 numbers are found and the value of both numbers is less than 1,000,000.
	* Tokens available for the 2nd number and its 6 individual digits.


##Example for selecting TV-channels:

- No matter how many times you are going to use Numcatch-triggers in your flows... The first flow is needed only once to feed them all with your voice.
Because the number-detection is seperated from the voice recognition, you'll still be able to use an app like 'Better Voice' before you feed the text to 'Numcatch'.

This flow sends the text output from 'you said anything' to Numcatch, where it will be searched for numbers.
Drag the 'text' token from the trigger-card to the droptoken area on the 'to Numcatch' action-card.
![](https://github.com/OpenMindNL/numcatch/raw/master/assets/images/example1.png)

Next we'll need 10 flows to control each number for the TV-channel selection.
In this case the Harmony Hub App is used to control the TV. If your device is controlled in a different way, you can apply the same procedure for the number-controls of your device.
The selection-figures (see next flow) will be assigned in consecutive manner to the 'TVnumber' variable. Therefore, we use the change of this variable in combination with the value of this variable to control the corresponding TV-numbers.
* First create flow TV-0 and save it.
* Duplicate the flow and change the name to TV-1. Also change 0 to 1 in the '...and...' and '...then' cards. Save the flow.
* Duplicate the flow and change the name to TV-2. Change 1 to 2 in all cards. Save the flow... and so on until you have 10 flows, named TV-0...TV-9.
![](https://github.com/OpenMindNL/numcatch/raw/master/assets/images/example2.png)

This flow triggers when Numcatch detects 1 number. When the text also contains ‘television’, 3 individual number-figures will be used to select a TV-channel.
* Drag the 'text (source)' token from the trigger-card to the droptoke area on the '...contains' card in the '...and...' area.
Before each digit is assigned to the 'TVnumber' variable, we first assign a asterisk (*) to it. The reason for that, is to be sure that the variable really changes when two consecutive digits are the same (like in: 22)
* Drag the 'hundreds' token from the trigger-card to the droptoke area on the 2nd 'Set a textual variable' card.
* Drag the 'tens' token from the trigger-card to the droptoke area on the 4th 'Set a textual variable' card.
* Drag the 'units' token from the trigger-card to the droptoke area on the 6th 'Set a textual variable' card.
* Drag the 'number' token from the trigger-card to the droptoke area on the 'Say something' card.
![](https://github.com/OpenMindNL/numcatch/raw/master/assets/images/example3.png)

When everything is entered, you are able to control TV-channel selection by saying; "OK Homey... Set television to channel 202" or whatever channel number you might like.

Nice... but wouldn't it be great when you could just say: "OK Homey... Set television to Discovery Science"..?
Numcatch offers a text-to-number conversion for that! Check out: Settings - Numcatch.
![](https://github.com/OpenMindNL/numcatch/raw/master/assets/images/example4.png)


###v0.0.9:
* First public release

NOTE:
 Built-in conversion for English and Dutch text-numbers (twenty-one, twenty-two, twenty-three) to numbers (21, 22, 23) in the range from 0...99.
 This conversion will possibly be removed when Athom brings some consistency to Homey's understanding of numbers (text or figures) but for now it brings more accuracy to the app.
 However, I can't handle a bug in Homey's strange understanding of some numbers in a particular syntax (firmware v1.1.9). Athom is working on that.
