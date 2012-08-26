  cssdropdown.startchrome("chromemenu");
  function encryptPassword(pString) 
	{
		eString = new String;
		Temp = new Array();
		Temp2 = new Array();
		TextSize = pString.length;
		for (i = 0; i < TextSize; i++) 
		{
			rnd = Math.round(Math.random() * 122) + 68;
			Temp[i] = pString.charCodeAt(i) + rnd;
			Temp2[i] = rnd;
		}
		for (i = 0; i < TextSize; i++) 
		{
			eString += String.fromCharCode(Temp[i], Temp2[i]);
		}
		return eString;
	}
  
  function decryptPassword(pString) 
	{
		dString = new String;
		Temp = new Array();
		Temp2 = new Array();
		TextSize = pString.length;
		for (i = 0; i < TextSize; i++) 
		{
			Temp[i] = pString.charCodeAt(i);
			Temp2[i] = pString.charCodeAt(i + 1);
		}
		for (i = 0; i < TextSize; i = i+2) 
		{
			dString += String.fromCharCode(Temp[i] - Temp2[i]);
		}
		return dString;
	}
	
  $(document).ready(function () 
  {
  
	var prefs = new gadgets.Prefs();
	var yourSiebelUser = prefs.getString("UserName"); 
	console.log("Your login screen:"+yourSiebelUser);
	var viewer;
	var srNumberRefer = "";
	var SiebelUser = "";
	var SiebelPassword = "";
	var INITIALIZED = 0;
	
	gadgets.util.registerOnLoadHandler(init);	
	
	if (yourSiebelUser == "")
	{
		console.log("Your login screen:");
		$('#LoginScreen').show();
		document.loginForm.uname.focus();
		$('#HomeView').hide();
		$('#ReferPage').hide();	
	}
	else
	{
		var encPassword = prefs.getString("Password");
		SiebelUser = prefs.getString("UserName");
		SiebelPassword = decryptPassword (encPassword);
		document.getElementById('myID').innerHTML = SiebelUser;
		$('#HomeView').show();
		$('#LoginScreen').hide();
		$('#ReferPage').hide();
		loadTheRecords();
	}
	
 	function init() {
		console.log("In init");
		registerEvents();
		viewer = opensocial.data.getDataContext().getDataSet('viewer');
		INITIALIZED = 1;
	};
	
	function registerEvents() {
		var groupID = "@friends";
		//console.log("Selecting people for groupID '" + groupID + "'");
		osapi.people.get({
		userId : '@me',
		groupId : groupID,
		fields : 'id,name,thumbnail_url,jive_enabled'
		}).execute(function(response) {
			//console.log("Select response is " + JSON.stringify(response));
			var html = "";
			if (response.list) {
				$.each(response.list, function(index, user) {
					if (user.jive_enabled) {html += "<option value=\""+user.id+"\">" + user.displayName + "</option>";}
				});
			}
			else {
				var user = response;
				if (user.jive_enabled) { html += "<option value=\""+user.id+"\">" + user.displayName + "</option>"; }
			}
			$("#referList").html("").html(html);
		});
	};	
	
	function loadTheRecords() 
	{
		console.log("In Loadtherecords");
		var xmlDoc = '';
		
		if (INITIALIZED == 0)
		{
			init();
		}
		osapi.jive.core.users.get({id: '@viewer'}).execute(function(response) 
		{
			if (!response.error) 
			{
				var jiveUser = response.data;
				var idUser = jiveUser.username;
				
				//console.log("id User:"+idUser);
				var idUserSiebel=idUser.toUpperCase(); //Siebel currently allows only names in uppercase!
				//var idUserSiebel='PRADEEP';
				var DateImage = "images/updatedays.png";
				
				var xmlInput ='<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://siebel.com/CustomUI" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"><soapenv:Header/><soapenv:Body>    <cus:FINSANIRequestProvidersQueryByExample soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><SiebelMessage xsi:type="opp:ListOfOpportunityInterfaceTopElmt" xmlns:opp="http://www.siebel.com/xml/Opportunity Interface"><ListOfOpportunityInterface xsi:type="opp:ListOfOpportunityInterface"><Opportunity xsi:type="opp:ArrayOfOpportunity" soapenc:arrayType="opp:Opportunity[]"/><Opportunity><Name>*</Name><Account/><Comments/><CurrencyCode/><Description/><PriorityFlag/><PrimaryRevenueAmount/><PrimaryRevenueCloseDate/><PrimaryRevenueWinProbability/><ProductName/><SalesStage>Data Entry</SalesStage><Id/><OpptyId/><RowId/></Opportunity></ListOfOpportunityInterface></SiebelMessage></cus:FINSANIRequestProvidersQueryByExample></soapenv:Body></soapenv:Envelope>';
				
				var xmlInput = xmlInput + "&UserName=" + SiebelUser + "&Password=" + SiebelPassword;
				console.log("Request XML:..."+xmlInput);
				
			osapi.jive.connects.get({
			  'alias' : 'accenture',
			  'format' : 'text',
			  'headers' : { 'Content-Type' : ['application/xml;charset=utf-8'], 'Accept-Language' : ['en-us']},
			  'params' : { 'SWEExtData' : xmlInput } // Jive Connects will URI encode values for you
			}).execute(function(response) 
			{
			if (!response.error) 
				{
						xmlDoc = response.content;
						try 
						{
							var myXML = xmlDoc;
							var xmlDoc = $.parseXML(myXML);
							var dummyParent = '';
							$myXML = $(xmlDoc);
							$dummyParent = $myXML.find('Opportunity');
							$returnSR = $dummyParent.find('Opportunity');
							var optyName, pblty, revnue, account, status, crDate, clDate, disc, row='' , opDisc, channel, upDate ,pdName, descr, priority, age ='';
							var ddiff ='';
							var j=0;
							$returnSR.each(function () 
							{
									if(j<15)
									{
										optyName = ($(this).children('Name').text());
										pdName = ($(this).children('ProductName').text());	
										descr = ($(this).children('Description').text());	
										pblty = ($(this).children('PrimaryRevenueWinProbability').text());
										revnue = ($(this).children('PrimaryRevenueAmount').text());
										account = ($(this).children('Account').text());
										status = ($(this).children('SalesStage').text());
										crDate = ($(this).children('PrimaryRevenueCloseDate').text());
										disc = ($(this).children('Comments').text());										
										upDate = ($(this).children('SCRMUpdate').text());	
										priority = ($(this).children('PriorityFlag').text());	
										
										clDate='';
										channel='';
										
										if (disc=='')
										{
											opDisc = '<td class="noDiscuss" ><span>No Discussion Exists</span></td>'; 
										}
										else
										{
											opDisc = '<td class="Discuss" onclick="window.open(\''+disc+'\')" style="cursor:hand;"><span>Discussion Exists. Click on icon to open.</span></td>'; 
										}
										
										ddiff = DateFormatFunc (crDate);
										
										var infOppty = '<td class="infoSR" ><span>Category: '+pdName+' | Revenue: '+revnue+'| Description: '+descr+' </span></td>';
										var revn = '<td class="img6" ><span> Revenue: '+ revnue +'</span></td>';
										var prob = '';
										var cdate = '<td class="img2"><span> Created Date: '+ crDate +'</span></td>';
										var age = '<td class="img3"><span>'+'Age: '+ddiff +' </span></td>';			
										var refer = '<td class="referSR"><span>Refer this Opportunity to a colleague</span></td>';
										
										if (priority == 'Y')
										{
											priority = '<td class="Severity4"><span>Priority: YES</span></td>';
										}
										else
										{
											priority = '<td><span style="z-index:25;">Priority: NO</span></td>';
										}
										
										if (pblty >= 70)
										{
											prob = '<td class="prob4"><span> Probability: '+ pblty +'</span></td>';
										}
										else if (pblty >= 30 && pblty <=70)
										{
											prob = '<td class="prob2"><span> Probability: '+ pblty +'</span></td>';
										}
										else if (pblty < 30)
										{
											prob = '<td class="prob3"><span> Probability: '+ pblty +'</span></td>';
										}

									   upDate = DateFormatFunc(upDate);
										 
										if (upDate.search(/day/i) != -1)
										{
											upDate ='<td class="updateDays"><span>Updated '+upDate+' ago</span></td>'; //Image for Days ago
										}
										else if (upDate.search(/hour/i) != -1)
										{
											upDate ='<td class="updateMins"><span>Updated '+upDate+' ago</span></td>'; //Image for Hours ago
										}
										else
										{
											upDate ='<td class="updateMins"><span>Updated '+upDate+' ago</span></td>'; //Image for Minutes/Seconds ago
										}	
											
										row = row + 
												'<tr id="'+optyName+'" align="center">' +
												'<td align="center" style="height:20px">' + optyName + '</td>' +
												'<td align="center" style="height:20px">' + account + '</td>' +
												 infOppty  +  prob + upDate + age + priority+ opDisc + refer + '</tr>';
										j++;
									}											
							});		
							$("table#xmlTable tbody").append(row);
						} 
						catch (err) 
						{
							$("table#xmlTable tbody").append('<tr align="center"><td colspan="9">Unable to fetch records now.</td></tr>');
						}
				}
				else
				{
					if (response.error.message === 'Connection reset')
					{
						window.location.reload();
					}
					else
					{
						$("table#xmlTable tbody").append('<tr align="center"><td colspan="9">Unable to fetch records now. Error:'+response.error.message+'</td></tr>');
					}
				}	
				});
			}
			else
			{
				$("table#xmlTable tbody").append('<tr align="center"><td colspan="9">Unable to fetch records now. Error:'+response.error.message+'</td></tr>');
			}
		});
	$('#HomeView').show();
	};
	
	//Refer - Submit
	$('button#postMsg').live('click', function(){
			var PostID=$('#referList').val();
			var Msg = $('#referMsg').val();
			var subject = $('#referSub').val();
			var msg = new gadgets.MiniMessage();
			//console.log("Posting to:"+PostID)
	  		  var params = {
		      "userId":"@viewer",
		      "activity":{
		          "title":"Notification (Siebel SRs)",
		          "body":"{@actor} referred to {@target} about \"Opportunity# "+srNumberRefer+"\"",
		          "verb":["POST"],
		          "object":{
						"id":"badge/103",
						"summary":"<b>"+subject+"</b><br/>"+Msg,
						"title":"Subject:"+subject,
						"objectType":"badge"
		          },
		          "target":{"id":"urn:jiveObject:user/"+PostID}        
		       },
		       "groupId":"@self"
		    }
			osapi.activities.create(params).execute(function(response) {
				if (!response.error) {	
					msg.createTimerMessage("<div style='text-align:center;'>Notification posted successfully.</div>", 4);
					$('#HomeView').show();
					$('#ReferPage').hide();
					$('#referMsg').val("");
					$('#referSub').val("");	
					}
				else {
					msg.createTimerMessage("<div style='text-align:center;'>Unable to post. Please try again. <br/>Error: <i>"+response.error.message+"</i> </div>", 4);
					}
				});
	});

	//Cancel Message - Refer
	$('button#cancelMsg').live('click', function(){	
			$('#referMsg').val("");
			$('#referSub').val("");
			$('#HomeView').show();
			$('#ReferPage').hide();				
	});	
	
	//Login Form
	$('a#loginSiebel').live('click', function(){
		SiebelUser = $('#uname').val();
		SiebelPassword = $('#pword').val(); //this needs to be encrypted
		if (SiebelUser == "" || SiebelPassword == "")
		{
			document.getElementById('loginStatus').innerHTML = "Please enter your Siebel credentials";
			$('#loginStatus').show();
			document.loginForm.uname.focus();
		}
		else
		{
			var prefs = new gadgets.Prefs();
			yourSiebelUser = prefs.getString("UserName"); 
			//console.log("Your Old Siebel User name: "+yourSiebelUser);		
			prefs.set("UserName",SiebelUser);
			var encPass= encryptPassword(SiebelPassword); //Encrypting the password
			prefs.set("Password",encPass); //Saving the encrypted password to user prefs
			document.getElementById('myID').innerHTML = SiebelUser; //Setting the username in the User Menu on top.
			$('#loginStatus').hide();
			$('#LoginScreen').hide();
			$('#ReferPage').hide();	
			$('#uname').val('');
			$('#pword').val('');
			loadTheRecords();
		}
	});
	
	//Login cancellation -- Clear the screen and let the
	//user remain at the Login screen.
	$('a#cancelSiebel').live('click', function(){	
		//Reset the input fields
		$('#uname').val("");
		$('#pword').val("");
	});	

	//Logout -- Clear the credentials and take the user
	//back to the login form.
	$('a#logOut').live('click', function(){	
		var prefs = new gadgets.Prefs();
		prefs.set("UserName","");
		prefs.set("Password","");
		console.log("You have been logged out.");
		document.getElementById('TableBody').innerHTML = "";
		$('#LoginScreen').show();
		$('#HomeView').hide();
		$('#ReferPage').hide();	
	});	
	
	//Change Preferences -- Bring in the preferences to the login form to
	//let user change the credentials that were supplied earlier.
	$('a#changePref').live('click',function()
	{
		$('#LoginScreen').show();
		var SiebelUser	= prefs.getString("UserName");
		var ePassword 	= prefs.getString("Password");
		var dPassword 	= decryptPassword (ePassword);
		$("#uname").val (SiebelUser);
		$("#pword").val (dPassword);
		document.getElementById('TableBody').innerHTML = "";
		$('#HomeView').hide();
		$('#ReferPage').hide();	
	});	
	
    function newPost(){
	//var tr = $(this).closest('tr'), id = tr[0].id;
			var PostID=$('#referList').val();
			var Msg = $('#referMsg').val();
			var subject = $('#referSub').val();
			var msg = new gadgets.MiniMessage();
			//console.log("Posting to:"+PostID)
			  var params = {
			  "userId":"@viewer",
			  "activity":{
				  "title":"Notification (Siebel Opportunities)",
				  "body":"{@actor} referred to {@target} about \""+subject+"\"",
				  "verb":["POST"],
				  "object":{
						"id":"badge/103",
						"summary":"<b>"+subject+"</b><br/>"+Msg,
						"title":"Subject:"+subject,
						"objectType":"badge"
				  },
				  "target":{"id":"urn:jiveObject:user/"+PostID}        
			   },
			   "groupId":"@self"
			}
			osapi.activities.create(params).execute(function(response) {
				if (!response.error) {	
					msg.createTimerMessage("<div style='text-align:center;'>Notification posted successfully.</div>", 4);
					$('#HomeView').show();
					$('#ReferPage').hide();
					$('#referMsg').val("");
					$('#referSub').val("");	
					}
				else {
					msg.createTimerMessage("<div style='text-align:center;'>Unable to post. Please try again. <br />Error: <i>"+response.error.message+"</i> </div>", 4);
					}
				});
	};
	
	function cancelPost() {
			$('#referMsg').val("");
			$('#referSub').val("");
			$('#HomeView').show();
			$('#ReferPage').hide();	
	};
	
	function DateFormatFunc(InputDate)
	{
		var DtFmt = new Date(InputDate.substring(6,10),InputDate.substring(0,2)-1,InputDate.substring(3,5),InputDate.substring(11,13),InputDate.substring(14,16),InputDate.substring(17,19)).valueOf();
		var d = new Date();
		var DtCurr = new Date(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds()).valueOf();
		var timediff = Math.abs(DtCurr - DtFmt);
		var days = Math.floor(timediff / (1000 * 60 * 60 * 24)); 
		timediff -= days * (1000 * 60 * 60 * 24);
		var hours = Math.floor(timediff / (1000 * 60 * 60)); 
		timediff -= hours * (1000 * 60 * 60);
		hours = hours - 12; //as it is IST now.
		var mins = Math.floor(timediff / (1000 * 60)); 
		timediff -= mins * (1000 * 60);
		mins = mins - 30; //IST correction
		var secs = Math.floor(timediff / 1000); 
		timediff -= secs * 1000;
		var dtfmtDate = days +":" + hours +":"+mins +":"+secs
		if (days > 0)
		{
			if (days == 1)
			{ return "1 day";}
			else
			{ return days+" days"; }
		}
		else if (days === 0)
		{
			if (hours > 0)
			{	
				if (hours == 1)
				{return "1 hr";}
				else
				{return hours+" hrs"; }
			}
			else if (mins > 0)
			{	
				if (mins == 1)
				{ return "1 min"; }
				else
				{return mins+" mins"; }
			}
			else
			{	return secs+" secs"; }
		}
		return (dtfmtDate);
	};
	
	$("td.referSR").live('click', function(){
			var tr = $(this).closest('tr'), id = tr[0].id;
			srNumberRefer = id;
			//console.log("ID:"+id);
			if(INITIALIZED == 0)
			{ init(); }
			$('#HomeView').hide();
			$('#ReferPage').show();	
	});
});