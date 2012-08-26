$(document).ready(function () {


	var longDesc='';	
	var opptyID='';
	//Get the list of SRs assigned to the current user
	var xmlDoc = ''; //XML String used for Parsing and like.
	var srNoDisc = ''; //Opportunity Number used for Discussions.
	var miniMessage = new gadgets.MiniMessage(); //__MODULE_ID__
	var myGroups = [ ];
	var idUser, idUserSiebel= '';
	var JObject=''; //For JSON
	var totalRecords= 0;
	var viewer;
	var srNumberRefer = "";
	
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
		$('#CanvasView').hide();
	}
	else
	{
		var encPassword = prefs.getString("Password");
		SiebelUser = prefs.getString("UserName");
		SiebelPassword = decryptPassword (encPassword);
		document.getElementById('userID').innerHTML = SiebelUser;
		$('#CanvasView').show();
		$('#LoginScreen').hide();
		loadTheRecords();
	}
	
 	function init() {
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
	
	//Get group information of current user
	osapi.groups.get({
		  userId: "@me",
		  groupId: "@self"
		}).execute(function(response) {
		  if (response.error) {
			//console.log("Error " + response.error.code + " retrieving all groups: " + response.error.message);
		  }
		  else {
			$(response.list).each(function(index, group) {
			  myGroups.push(group);
			});
			// Populate the list of groups in the UI
			$(myGroups).each(function(index, group) {
			  var html = '<option class="group-item" value = "'+group.id+'"data-groupId="' + group.id + '">';
			  html += group.title;
			  html += "</option>";
			  //alert("my groups");
			  $("#discussGroup").append(html);
			});
			$("#fetching").hide();
			$("#groups").show();
			//gadgets.window.adjustHeight();
		  }
		});
		
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
	
	function loadTheRecords() 
	{
		console.log("In Loadtherecords");
		var xmlDoc = '';	
		//Initialize Buddy List
		if (INITIALIZED == 0)
		{
			init();
		}		
		osapi.jive.core.users.get({id: '@viewer'}).execute(function(response) {
			var jiveUser = response.data;
			if (!response.error) {
			//idUser = jiveUser.username;
			$('#userID').text(SiebelUser);
			
			var xmlInput ='<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://siebel.com/CustomUI" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"><soapenv:Header/><soapenv:Body>    <cus:FINSANIRequestProvidersQueryByExample soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><SiebelMessage xsi:type="opp:ListOfOpportunityInterfaceTopElmt" xmlns:opp="http://www.siebel.com/xml/Opportunity Interface"><ListOfOpportunityInterface xsi:type="opp:ListOfOpportunityInterface"><Opportunity xsi:type="opp:ArrayOfOpportunity" soapenc:arrayType="opp:Opportunity[]"/><Opportunity><Name>*</Name><Account/><Comments/><CurrencyCode/><Description/><PriorityFlag/><PrimaryRevenueAmount/><PrimaryRevenueCloseDate/><PrimaryRevenueWinProbability/><ProductName/><SalesStage>Data Entry</SalesStage><Id/><OpptyId/><RowId/></Opportunity></ListOfOpportunityInterface></SiebelMessage></cus:FINSANIRequestProvidersQueryByExample></soapenv:Body></soapenv:Envelope>';
			
			var xmlInput = xmlInput + "&UserName=" + SiebelUser + "&Password=" + SiebelPassword;
			console.log("Request XML:..."+xmlInput);
			
			osapi.jive.connects.get({
			  'alias' : 'accenture',
			  'format' : 'text',
			  'headers' : { 'Content-Type' : ['application/xml;charset=utf-8'], 'Accept-Language' : ['en-us']},
			  'params' : { 'SWEExtData' : xmlInput } // Jive Connects will URI encode values for you
			}).execute(function(response) {
					if (!response.error) {
					//console.log(response.content);
					xmlDoc = response.content;
					
					try 
					{
						var myXML = xmlDoc;
						var xmlDoc = $.parseXML(myXML);
						var dummyParent = '';
						$myXML = $(xmlDoc);
						
						$dummyParent = $myXML.find('Opportunity');
						$return = $dummyParent.find('Opportunity');
						//var srNumber, srType, pGroup, pCat, Account, Status, Desc, openDate, upDate, Disc, srDisc, ID, row='', Severity = '';
						var srNumber, srType, pGroup, pCat, Account, Status, Desc, openDate, upDate, Disc, srDisc, opDisc, ID, row='', Severity = '';
						var opptyname, account, salesteam, revenue, revenuetype, channel, probability, priority, createddate, closuredate, closuresummary, salesstage ='';
						var pdName, descr, currency, prob, age, createDateFormat  ='',updateDateFormat  ='';
						var replies = 0;
						var count = 0;
						
						$return.each(function () {
							opptyname = ($(this).children('Name').text());
							pdName = ($(this).children('ProductName').text());
							descr = ($(this).children('Description').text());
							longDesc=($(this).children('History').text());
							//salesteam = ($(this).children('SalesTeam').text());
							revenue = ($(this).children('PrimaryRevenueAmount').text());
							revenuetype = ($(this).children('CurrencyCode').text());
							account = ($(this).children('Account').text());
							//channel = ($(this).children('Channel').text()); 
							priority = ($(this).children('PriorityFlag').text()); 
							//closuresummary = ($(this).children('ClosureSummary').text());
							status = ($(this).children('SalesStage').text());
							probability = ($(this).children('PrimaryRevenueWinProbability').text());
							createddate = ($(this).children('PrimaryRevenueCloseDate').text());
							//closuredate = ($(this).children('ClosureDate').text());
							salesstage = ($(this).children('SalesStage').text());
							srNumber = ($(this).children('Name').text());
							srType = ($(this).children('RevenueType').text());
							Account = ($(this).children('Account').text());
							pGroup = ($(this).children('ProductName').text()); 
							pCat = ($(this).children('PriorityFlag').text()); 
							Status = ($(this).children('SalesStage').text());
							upDate = ($(this).children('SCRMUpdate').text());		
							opptyID = ($(this).children('OpptyId').text());
							
							Disc = ($(this).children('Comments').text());
							updateDateFormat = DateFormatFunc(upDate);

							if (updateDateFormat.search(/day/i) != -1)
							{
							updated ='<td class="updateDays" style="height:20px;">'+updateDateFormat+' ago</td>'; //Image for Days ago
							}
							else if (updateDateFormat.search(/hour/i) != -1)
							{
							updated ='<td class="updateMins" style="height:20px;">'+updateDateFormat+' ago</td>'; //Image for Hours ago
							}
							else
							{
							updated ='<td class="updateMins" style="height:20px;">'+updateDateFormat+' ago</td>'; //Image for Minutes/Seconds ago
							}
							
							createDateFormat = DateFormatFunc(createddate);
							//var updated='<td  class="updateDays" style="height:20px;">'+updateDateFormat+'</td>';
							
							if (createDateFormat.search(/day/i) != -1)
							{
							age  ='<td class="updateDays" style="height:20px;">'+createDateFormat+'</td>'; //Image for Days ago
							}
							else if (createDateFormat.search(/hour/i) != -1)
							{
							age  ='<td class="updateMins" style="height:20px;">'+createDateFormat+'</td>'; //Image for Hours ago
							}
							else
							{
							age  ='<td class="updateMins" style="height:20px;">'+createDateFormat+'</td>'; //Image for Minutes/Seconds ago
							}
							
							//var age = '<td class="img3" style="height:20px;">'+createDateFormat+'</td>';
											 
							if (Disc=='')
							{
							opDisc = '<td class="noDiscuss" style="height:20px;"><a href="#" class="createDiscussion">Start<a></td>'; 
							//Discussion absent  image									
							}
							else
							{
							opDisc = '<td class="Discuss" style="height:20px;"><a href="'+Disc+'" target="_jiveDiscussion" class="openDiscussion">Open<a></td>'; //Discussion present image
							}
							if (priority == 'Y')
							{
							priority = '<td class="Severity4" style="height:20px;"><span style="display:none">'+ priority +'</span></td>';
							}
							else
							{
							priority = '<td style="height:20px;"><span style="display:none">'+ priority +'</span></td>';
							}
							
							if (probability >= 70)
							{
								prob = '<td class="prob4" style="height:20px;text-align: center;">'+ probability +'</td>';
							}
							else if (probability >= 30 && probability < 70)
							{
								prob = '<td class="prob2" style="height:20px;text-align: center;">'+ probability +'</td>';
							}
							else if (probability < 30)
							{
								prob = '<td class="prob3" style="height:20px;text-align: center;">'+ probability +'</td>';
							}
							var rowID = opptyID.replace(/ /g, ''); 
							row = row + 
										'<tr id="srno_' +rowID+'_'+count+'" style="height:20px">' +  
										'<td align="center" style="height:20px;width:125px;">' + srNumber + '</td>' + 
										'<td align="center" style="height:20px">' + account + '</td>' + 
										'<td align="center" style="height:20px">' + pdName + '</td>' + prob +
										'<td align="center" style="height:20px">' + revenuetype + '</td>' + 
										'<td align="center" style="height:20px">' + revenue + '</td>' + 
										'<td align="center" style="height:20px">' + descr + '</td>' +updated + age+priority+opDisc +
										'<td align="center" style="height:20px"><a href="#" class="referOppty">Refer</a> | <a href="#" class="viewOppty">View</a> | <a href="#" class="editOppty">Edit</a></td>' +
										'</tr>';	
										count++;
						});
					totalRecords = count;
					//Add the data to the table
					$("table#xmlTable tbody").append(row);
					//Sort the table - Add pages
					$("table#xmlTable").tablesorter({widthFixed: false, widgets: ['zebra'],sortList: [[8,1], [1,0]], headers: { 11:{sorter: false}}}).tablesorterPager({container: $("#pager")});
					$("#pager").show();
					$("#pagesize").val("15");
					$("#infoMsg").html("<b>The above are the Opportunities assigned to you.</b>");
					miniMessage.createTimerMessage(document.getElementById("infoMsg"),4);
					gadgets.window.adjustHeight();
					JObject = $.xml2json(xmlDoc); //Create JSON Object
					//console.log("Select response is " + JSON.stringify(JObject.Body));
					} catch (err) {
						$("table#xmlTable tbody").append('<tr align="center"><td colspan="12">No open Opportunities is assigned to you.</td></tr>');
						gadgets.window.adjustHeight();
					}
					}
					else
					{
					if (response.error.message == "Connection reset")
					{ 
						window.location.reload();
					}
					else
					{
						$("#infoMsg2").html("<b>Sorry! Unable to fetch any record. Try again at a later point of time.<br/>Error:<i>"+response.error.message+"</i></b>");
						miniMessage.createTimerMessage(document.getElementById("infoMsg2"),4);
						$("table#xmlTable tbody").append('<tr align="center"><td colspan="12" style="color:red;">Unable to fetch records now. Error: '+response.error.message+'</td></tr>');
						//console.log("Error:"+response.error.message);
						gadgets.window.adjustHeight();
					}
					}	
			});
			}
			else
			{
			$("table#xmlTable tbody").append('<tr align="center"><td colspan="12" style="color:red;">You do not seem to have corresponding account in Siebel, without which, no Opportunity details could be fetched for you.</td></tr>');
			('#create').attr('disabled','disabled');
			gadgets.window.adjustHeight();
			}
		});
		$('#CanvasView').show();
		$('#LoginScreen').hide();
	}
	//Top-Menu: Opportunity List
	$('a.displayList').click(function(){
		$('a.create').removeClass('active');
		$(this).addClass('active');
		$('#createTable').hide();
		$('#xmlTable').show();
		$('table.data-grid tr').removeClass('active');
		$('#canvas').hide();
		$('#pager').show();
		$('#discussTable').hide();
		$('#ReferPage').hide();
        $('#srNumber2').val("");
		$('#account2').val("Northern California Cable Company");
		$('#srType2').val("Data Center");
		$('#probability2').val("");
		$('#desc2').val("");
		$('#revenue2').val("");
		$("#priority2").prop("checked", false)
		$('#ccode2').val("USD");
		$('#status2').val("Data Entry");
		$('#longDesc2').val("");
		$('#msgSr').addClass('hidemsg');
		$('#msgSr').removeClass('showmsg');
		gadgets.window.adjustHeight();
	});
	
	//Top-Menu: CREATE Opportunity Link
	$('a.create').live('click', function(){
		$('a.displayList').removeClass('active');
		$(this).addClass('active');
		
		$('#xmlTable').hide();
		$('#canvas').hide();
		$('#discussTable').hide();
		$('#pager').hide();
		$('#ReferPage').hide();
		$('#createHead').text("Create Opportunity");
		$('#createTable').show();
		$("input:text:visible:first").focus();
		gadgets.window.adjustHeight();
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
		$('#CanvasView').hide();
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
			document.getElementById('userID').innerHTML = SiebelUser; //Setting the username in the User Menu on top.
			$('#loginStatus').hide();
			$('#LoginScreen').hide();
			$('#uname').val('');
			$('#pword').val('');
			loadTheRecords();
		}
	});
	
	//"View Opportunity" link for each record
	$('a.viewOppty').live('click', function(){
		var srNo = $(this).parent('td').parent('tr').children('td:first-child').text();
		var tr = $(this).closest('tr'), id = tr[0].id;
		$('table.data-grid tr').removeClass('active');
		//Highlight the selected row.
		$('table.data-grid tr#'+id).addClass('active');
		var row = $('table.data-grid tr#'+id+' td');
		$('#canvasHead').text("View Opportunity : "+srNo);
		//console.log("OPPTY NAME: "+srNo);
		$('#canvas').show();
		$('#viewDisplay').show();
		$('#editDisplay').hide();
		$('#discussTable').hide();
		$('#ReferPage').hide();
		
		var i = 1;
		$(row).each(function(){
			if(i<14){
				if(i===1){$('#srNumber').val($(this).text()).attr('disabled','disabled')} 
				else if(i=== 2){$('#account').val($(this).text()).attr('disabled','disabled')}
				else if(i=== 4){$('#probability').val($(this).text()).attr('disabled','disabled')}
				else if(i=== 3){$('select#srType').val($(this).text()).attr('disabled','disabled')} 
				else if(i=== 6){$('#revenue').val($(this).text()).attr('disabled','disabled')}		
				else if(i=== 5){$('select#ccode').val($(this).text()).attr('disabled','disabled')} 
				else if(i=== 7){$('#desc').val($(this).text()).attr('disabled','disabled')}				
				else if(i=== 12){$('select#status').val($(this).text()).attr('disabled','disabled')} 
				else if(i=== 10){if($(this).text()== "Y")$("#priority").prop("checked", true).attr('disabled','disabled');else $("#priority").prop("checked", false).attr('disabled','disabled');} 
				else if(i=== 13){$('#longDescr').val(longDesc).attr('disabled','disabled');}
				else if(i=== 9){$('#age').text($(this).text())} 
				//else if(i=== 8){$('#creation').text($(this).text())} 
				else if(i=== 8){$('#lastUpdate').text($(this).text())}				
			}		
			i++;
		});
		//if($('#longDesc').val()!==''){$('textarea#longDesc').html($('#longDesc').val());alert($('#longDesc').val());}
		var num= id.lastIndexOf('_');
		//console.log("id: "+id);
		var index = id.substr(num+1,id.length);
		if (totalRecords == 1)
		{
			var longDescription = JObject.Body.FINSANIRequestProvidersQueryByExampleResponse.SiebelMessage.ListOfOpportunityInterface.Opportunity.Opportunity.History;
			//console.log("longDescription: "+longDescription);
			$('#longDescr').val(longDescription).attr('disabled','disabled');
			//console.log("if longDesc: "+longDescription);
		}
		else
		{
		
	     var longDescription = JObject.Body.FINSANIRequestProvidersQueryByExampleResponse.SiebelMessage.ListOfOpportunityInterface.Opportunity.Opportunity[index].History;
		 $('#longDescr').val(longDescription).attr('disabled','disabled');
		 //console.log("else longDesc: "+longDescription);
		}
		
		if (longDescription == "[object Object]")
		{
			$('#longDescr').val("").attr('disabled','disabled');
		}
		else
		{
			$('#longDescr').val(longDescription).attr('disabled','disabled');
		}
		gadgets.window.adjustHeight();	
	});
	
	//"Edit Opportunity" link for each record.
	$('a.editOppty').live('click', function(){
		var srNo = $(this).parent('td').parent('tr').children('td:first-child').text();
		var tr = $(this).closest('tr'), id = tr[0].id;
		$('table.data-grid tr').removeClass('active');
		$('#editDisplay').removeAttr('disabled');
		//Highlight the selected row.
		$('table.data-grid tr#'+id).addClass('active');
		var row = $('table.data-grid tr#'+id+' td');
		
		$('#canvasHead').text("Edit Opportunity : "+srNo);
		$('#canvas').show();
		$('#editDisplay').show();
		$('#viewDisplay').hide();
		$('#discussTable').hide();
		$('#ReferPage').hide();
		//Added now
		$('#probability').removeAttr('disabled');
		$('select#srType').removeAttr('disabled');
		$('#revenue').removeAttr('disabled');
		$('select#ccode').removeAttr('disabled');
		$('#desc').removeAttr('disabled');
		$('select#status').removeAttr('disabled');
		$('#priority').removeAttr('disabled');
		$('textarea#longDescr').removeAttr('disabled');
		
		var i = 1;
		$(row).each(function(){
			if(i<13){
				if(i===1){$('#srNumber').val($(this).text()).attr('disabled','disabled')} 
				else if(i=== 2){$('#account').val($(this).text()).attr('disabled','disabled')} 
				else if(i=== 4){$('#probability').val($(this).text())}
				else if(i=== 3){$('select#srType').val($(this).text())} 
				else if(i=== 6){$('#revenue').val($(this).text())}		
				else if(i=== 5){$('select#ccode').val($(this).text())} 
				else if(i=== 7){$('#desc').val($(this).text())}				
				else if(i=== 12){$('select#status').val($(this).text())} 
				else if(i=== 10){if($(this).text()== "Y")$("#priority").prop("checked", true);else $("#priority").prop("checked", false);} 
				else if(i=== 13){$('textarea#longDescr').val($(this).text())}
				else if(i=== 9){$('#age').text($(this).text())} 
				//else if(i=== 8){$('#creation').text($(this).text())} 
				else if(i=== 8){$('#lastUpdate').text($(this).text())}				
			}		
			i++;
		});
		var num= id.lastIndexOf('_');
		var index = id.substr(num+1,id.length);
		if (totalRecords == 1)
		{
			var longDescription = JObject.Body.FINSANIRequestProvidersQueryByExampleResponse.SiebelMessage.ListOfOpportunityInterface.Opportunity.Opportunity.Description;
			$('#longDescr').val(longDescription);
			//console.log(longDescription);
		}
		else
		{
		
	     var longDescription = JObject.Body.FINSANIRequestProvidersQueryByExampleResponse.SiebelMessage.ListOfOpportunityInterface.Opportunity.Opportunity[index].Description;
		 $('#longDescr').val(longDescription);
		 //console.log("longDescription: "+longDescription);
		}
		if (longDescription == "[object Object]")
		{
			$('#longDescr').val("").removeAttr('disabled');
		}
		else
		{
			$('#longDescr').val(longDescription).removeAttr('disabled');
		}	
		gadgets.window.adjustHeight();
	});
	
	//"Refer Opportunity" link for each record
	$('a.referOppty').live('click', function(){
		var srNo = $(this).parent('td').parent('tr').children('td:first-child').text();
		srNumberRefer = srNo;
		var tr = $(this).closest('tr'), id = tr[0].id;
		$('table.data-grid tr').removeClass('active');
		//Highlight the selected row.
		$('table.data-grid tr#'+id).addClass('active');
		//$('#referSub').val("About OPPTY# "+srNo);
		$('#canvas').hide();
		$('#ReferPage').show();
		$('#createTable').hide();
		$('#discussTable').hide();
		gadgets.window.adjustHeight();
	});
	
	//"Create Discussion" link for each record - with no Discussion in Jive
	$('a.createDiscussion').live('click', function(){
		srNoDisc = ''; //Reset Opportunity Number so that it can be used in the current context.
		srNoDisc = $(this).parent('td').parent('tr').children('td:first-child').text();
		var tr = $(this).closest('tr'), id = tr[0].id;
		$('#discussHead').text("Create Discussion on Opportunity:"+srNoDisc);
		if ($('#discussGroup').val() == "")
		{init(); } //Fetch group information
		$('table.data-grid tr').removeClass('active');
		$('table.data-grid tr#'+id).addClass('active');
		$('#discussTable').show();
		$('#canvas').hide();
		$('#ReferPage').hide();
		$('#viewDisplay').hide();
		$('#editDisplay').hide();
		$('#discussSRprefix').text(srNoDisc);
		gadgets.window.adjustHeight();
	});

	//"Cancel Button" in Edit/View Modes.
	$('button#cancel').live('click', function(){
		$('#canvas').hide();
		var row = $('table.data-grid tr').removeClass('active');
		gadgets.window.adjustHeight();
	});
	
	//Submussion button for Discussion
	$('button#submitDiscussion').live('click', function(){
	var groupID = $('#discussGroup').val();
	$('#submitDiscussion').text("Processing...");
	$('#submitDiscussion').attr('disabled','disabled');
	$('#cancelDiscussion').hide();
	//console.log("ID of the selected Group: "+groupID);
		osapi.jive.core.groups.get({
			//userId : "@me",
			id : groupID
			}).execute(function (response) {
				  if (response.error) {
						$("#infoMsg3").html("<b>Unable to read the groups. Make sure you are part of a group in order to post a discussion.<br/>Error:<i>"+response.error.message+"</i></b>");
						miniMessage.createTimerMessage(document.getElementById("infoMsg3"),4);
				  }
				  else {
						var targetGroup = response.data;
						var messageTitle = $('#discussSRPrefix').text()+$('#discussTopic').val();
						//var messageTitle = $('#discussTopic').val();
						var messageHTML = $('#discussMessage').val();
						var discussion = {subject: messageTitle, html: messageHTML};
						var request = targetGroup.discussions.create(discussion);
						request.execute(function(response) {
							if (response.error) {
								//console.log(response.error);
								$('#submitDiscussion').text("Post Message");
								$('#submitDiscussion').removeAttr('disabled');
								$('#cancelDiscussion').show();
								$("#infoMsg4").html("<b>Unable to post discussion. Please try again.<br/>Error:<i>"+response.error.message+"</i></b>");
								miniMessage.createTimerMessage(document.getElementById("infoMsg4"),4);
							}
							else {
								srNumber = $('#discussSRprefix').text();
								//console.log("OPPTY NAME:"+srNumber);
								srDiscussion= response.data.resources.html.ref;								
								//console.log ("Discussion created successfully");
								UpdateRecord (srNumber,"","","","","","","","","","",srDiscussion);
							}
					   });
				  }
			});
			//$('#discussTable').hide();
			//var row = $('table.data-grid tr').removeClass('active');
	});

	//Cancel the Creation of Discussion	
	$('button#cancelDiscussion').live('click', function(){
		$('#discussTable').hide();
		$('#discussTopic').val("");
		$('#discussMessage').val("");
		var row = $('table.data-grid tr').removeClass('active');
		gadgets.window.adjustHeight();
	});
	
	//In View Mode -- Button to change the mode to Edit
	$('button#viewDisplay').live('click', function(){
		$('#canvasHead').text("Edit Opportunity: "+$('#srNumber').val());
		$('#editDisplay').show();
		$('#viewDisplay').hide();
		//$('#account').removeAttr('disabled');
		$('#probability').removeAttr('disabled');
		$('select#srType').removeAttr('disabled');
		$('#revenue').removeAttr('disabled');
		$('select#ccode').removeAttr('disabled');
		$('#desc').removeAttr('disabled');
		$('select#status').removeAttr('disabled');
		$('#priority').removeAttr('disabled');
		$('textarea#longDescr').removeAttr('disabled');
		var currentTime = new Date();
		var month = currentTime.getMonth() + 1;
        var day = currentTime.getDate();
        var year = currentTime.getFullYear();
        $('#lastUpdate').text(month + "/" + day + "/" + year);
		//$('#canvas').hide();
		//var row = $('table.data-grid tr').removeClass('active');
	});
	
	//In Edit Mode -- button to Update the Opportunity
	$('button#editDisplay').live('click', function(){
	   	var srNo = $('#srNumber').val();
		var srAccount = $('#account').val();
		var probability = $('#probability').val();
		var srType = $('#srType').val();
		var revenue = $('#revenue').val();
		var ccode = $('#ccode').val();
		var desc = $('#desc').val();
		var status = $('#status').val();
		
		
		if($("#priority").attr('checked'))
		var priority = "Y";
		else priority = "N";
		var srLongDesc = $('#longDescr').val();
		//alert(srNo+' '+srAccount+' '+probability+' '+srType+' '+revenue+' '+ccode+' '+desc+' '+status+' '+priority+' '+srLongDesc);
		//alert(srLongDesc);
		if(!false){
		$('#editDisplay').text("Processing...");
		$('#cancel').hide();
		$('#editDisplay').attr('disabled','disabled');
		UpdateRecord(srNo, srAccount, probability, srType, revenue, ccode,status, desc, status,priority, srLongDesc, "" );
		}
	});
	
	//Reset Button for Create
	$('button#resetCreate').live('click', function(){
		$('#srNumber2').val("");
		$('#account2').val("Northern California Cable Company");
		$('#srType2').val("Data Center");
		$('#probability2').val("");
		$('#desc2').val("");
		$('#revenue2').val("");
		$("#priority2").prop("checked", false)
		$('#ccode2').val("USD");
		$('#status2').val("Data Entry");
		$('#longDesc2').val("");
		$('#msgSr').addClass('hidemsg');
		$('#msgSr').removeClass('showmsg');
		$("input:text:visible:first").focus();
	});

	//Cancel button for Create -- resets the form; takes the user back to List View
	$('button#cancelCreate').live('click', function(){
		$('#srNumber2').val("");
		$('#account2').val("Northern California Cable Company");
		$('#srType2').val("Data Center");
		$('#probability2').val("");
		$('#desc2').val("");
		$('#revenue2').val("");
		$("#priority2").prop("checked", false)
		$('#ccode2').val("USD");
		$('#status2').val("Data Entry");
		$('#longDesc2').val("");
		$('#msgSr').addClass('hidemsg');
		$('#msgSr').removeClass('showmsg');
		$('a.create').removeClass('active');
		$('a.displayList').addClass('active');
        $('table.data-grid tr').removeClass('active');		
		$('#createTable').hide();
		$('#xmlTable').show();
		$("#pager").show();
		gadgets.window.adjustHeight();
	});	
	
	//Submit button for Create
	$('button#submitCreate').live('click', function(){
		var srNumber2 =$('#srNumber2').val();
		var account2 = $('#account2').val();
		var probability2 = $('#probability2').val();
		var srType2 = $('#srType2').val();
		var ccode2 = $('#ccode2').val();
		var revenue2 = $('#revenue2').val();
		var desc2 = $('#desc2').val();
	   // var status2 = $('#status2').val();
	     var status2='Data Entry';
		//$('#status2').val("Data entry");
		var bool=true;
        if(srNumber2)
		{
				$('#msgSr').addClass('hidemsg');
				$('#msgSr').removeClass('showmsg');
				bool=true;
		}
		else
		{
			$('#msgSr').removeClass('hidemsg');
				$('#msgSr').addClass('showmsg');
				bool=false;
		}
		if(bool)
		{
		if($("#priority2").attr('checked'))
		var priority2 = "Y";
		else priority2 = "N";
		//var longDesc2 = $('#longDesc2').val();
		//alert(srNumber2+' '+account2+' '+' '+probability2+' '+srType2+' '+ccode2+' '+revenue2+' '+desc2+' '+priority2+' '+longDesc2);
		var SRStatus = 'Data Entry'; //Status of the Opportunity
		var srLongDesc = $('#longDesc2').val();
		//console.log("Before Create Call");  
	//if(srNumber2==''){alert("Enter Opportunity Name");}
		//Convert to Strings (to counter presence of mathematical symbols and like!)
		srAccount = ConvertToString(account2);
		srType = ConvertToString(srType2);
		srDesc = ConvertToString(desc2);
		//srSeverity= ConvertToString(srSeverity);
		srLongDesc = ConvertToString(srLongDesc);
		//Disable the Submit & Reset buttons
		$('#submitCreate').text("Processing...");
		$('#resetCreate').hide();
		$('#cancelCreate').hide();
		$('#submitCreate').attr('disabled','disabled');
		
		for (var i=0;i<=(idUserSiebel.length-1);i++)
			{
			idUserSiebel.charCodeAt(i);
			}		
     	//console.log("Siebel USER For Create: "+idUserSiebel);
		var createXML = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://siebel.com/CustomUI" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">   <soapenv:Header/><soapenv:Body><cus:FINSANIRequestProvidersInsert soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><StatusObject xsi:type="xsd:string">?</StatusObject><SiebelMessage xsi:type="opp:ListOfOpportunityInterfaceTopElmt" xmlns:opp="http://www.siebel.com/xml/Opportunity%20Interface"><ListOfOpportunityInterface xsi:type="opp:ListOfOpportunityInterface"><!--Optional:--><Opportunity xsi:type="opp:ArrayOfOpportunity" soapenc:arrayType="opp:Opportunity[]"/><Opportunity>';
		if(srNumber2 != "" && srNumber2 != null)
		{
		createXML = createXML + '<Name>'+srNumber2+'</Name>';
		}
		if(account2 != "" && account2 != null)
		{
		createXML = createXML + '<Account>'+account2+'</Account>';
		}
		
		if(srType2 != "" && srType2 != null)
		{
		 createXML = createXML + '<ProductName>'+srType2+'</ProductName>';
		}
		if(srType2 != "" && srType2 != null)
		{
		createXML = createXML + '<PrimaryRevenueAmount>'+revenue2+'</PrimaryRevenueAmount>'; 
		}
	/*if(idUserSiebel != "" && idUserSiebel != null)
		{
		createXML = createXML + '<ws:Owner>'+idUserSiebel+'</ws:Owner>';
		} */
		if(ccode2 != "" && ccode2 != null)
		{
		createXML = createXML + '<CurrencyCode>'+ccode2+'</CurrencyCode>';
		}
		if(probability2 != "" && probability2 != null)
		{
		createXML = createXML + '<PrimaryRevenueWinProbability>'+probability2+'</PrimaryRevenueWinProbability>';
		}
		if(priority2 != "" && priority2 != null)
		{
		createXML = createXML + '<PriorityFlag>'+priority2+'</PriorityFlag>';
		}
		if(desc2 != "" && desc2 != null)
		{
		createXML = createXML + '<Description>'+desc2+'</Description>';
		}
		if(srLongDesc != "" && srLongDesc != null)
		{
		createXML = createXML + '<History>'+srLongDesc+'</History>';
		}
		if(SRStatus != "" && SRStatus != null)
		{
		createXML = createXML + '<SalesStage>'+SRStatus+'</SalesStage>';
		}
		//Any additional attributes should be added above this line only.
		createXML = createXML + '<AccountIntegrationId/><IntegrationId/><Id/><OpptyId/><RowId/></Opportunity></ListOfOpportunityInterface></SiebelMessage></cus:FINSANIRequestProvidersInsert></soapenv:Body></soapenv:Envelope>';
		createXML = ConvertToString(createXML);
		//console.log ("The Creation XML is: "+createXML);
		osapi.jive.connects.get({
		  'alias' : 'accenture',
		  'format' : 'text',
		  'headers' : { 'Content-Type' : ['application/xml;charset=utf-8'], 'Accept-Language' : ['en-us']},
		  'params' : { 'SWEExtData' : createXML } // Jive Connects will URI encode values for you
		}).execute(function(response) {
				if (!response.error) {
				$("#infoMsg5").html("<b>Opportunity created successfully.</b>");
				miniMessage.createTimerMessage(document.getElementById("infoMsg5"),4);
				$('#submitCreate').removeAttr('disabled');
				$('#submitCreate').text("Submit");
				$('#resetCreate').show();
				$('#cancelCreate').show();	
				$('#srNumber2').val("");
				$('#account2').val("Northern California Cable Company");
				$('#srType2').val("Data Center");
				$('#probability2').val("");
				$('#desc2').val("");
				$('#revenue2').val("");
				$("#priority2").prop("checked", false)
				$('#ccode2').val("USD");
				$('#status2').val("Data Entry");
				$('#longDesc2').val("");				
				window.location.reload();
				}
				else
				{
				$("#infoMsg6").html("<b>Unable to create Opportunity. Please try again.<br/>Error: <i>"+response.error.message+"</i></b>");
				miniMessage.createTimerMessage(document.getElementById("infoMsg6"),4);				
				//In case Submit fails, re-enable the Submit button.
				$('#submitCreate').removeAttr('disabled');
				$('#submitCreate').text("Submit");
				$('#resetCreate').show();
				$('#cancelCreate').show();				
				}
		});	
		}
	});

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
					$("#infoMsg10").html("<b>Notification posted successfully.</b>");
					miniMessage.createTimerMessage(document.getElementById("infoMsg10"),4);
					$('#ReferPage').hide();
					$('#referMsg').val("");
					$('#referSub').val("");
					$('table.data-grid tr').removeClass('active');
					}
				else {
					$("#infoMsg11").html("<b>Unable to post. Please try again. <br />Error: <i>"+response.error.message+"</i></b>");
					miniMessage.createTimerMessage(document.getElementById("infoMsg11"),4);
					msg.createTimerMessage("<div style='text-align:center;'> </div>", 4);
					}
				});	
	});

	//Cancel Message - Refer
	$('button#cancelMsg').live('click', function(){	
			$('#referMsg').val("");
			$('#referSub').val("");
			$('#ReferPage').hide();
			$('table.data-grid tr').removeClass('active');
			gadgets.window.adjustHeight();			
	});

	//Update the record -- invoked on click of "editDisplay" button
	function UpdateRecord (srNo, srAccount, probability, srType, revenue, ccode,status, desc, status,priority, srLongDesc, srDiscussion){
	var updateXML ='<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://siebel.com/CustomUI" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">   <soapenv:Header/><soapenv:Body><cus:FINSANIRequestProvidersUpdate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><StatusObject xsi:type="xsd:string">?</StatusObject><SiebelMessage xsi:type="opp:ListOfOpportunityInterfaceTopElmt" xmlns:opp="http://www.siebel.com/xml/Opportunity%20Interface"><ListOfOpportunityInterface xsi:type="opp:ListOfOpportunityInterface"><!--Optional:--><Opportunity xsi:type="opp:ArrayOfOpportunity" soapenc:arrayType="opp:Opportunity[]"/><Opportunity>';
	
	/*console.log("srNo,srAccount, probability, srType, revenue, ccode,status, desc, status,priority, srLongDesc, srDiscussion "+srNo 
+ ","+ srAccount+","+probability+","+srType+","+revenue+","+ccode+","+status+","+desc+","+status+","+priority+","+srLongDesc+","+srDiscussion);	
	console.log("in update srNo: "+srNo);	
	var priority='Y';
	console.log("priority:"+ priority);*/
	
	if(srNo != "" && srNo != null)
	{
	updateXML = updateXML + '<Name>'+srNo+'</Name>';
	}
	if(srAccount != "" && srAccount != null)
	{
	updateXML = updateXML + '<Account>'+srAccount+'</Account>';
	}
	if(srType != "" && srType != null)
	{
	updateXML = updateXML + '<ProductName>'+srType+'</ProductName>';
	}
	if(desc != "" && desc != null)
	{
	updateXML = updateXML + '<Description>'+desc+'</Description>';
	}
	if(revenue != "" && revenue != null)
	{
	updateXML = updateXML + '<PrimaryRevenueAmount>'+revenue+'</PrimaryRevenueAmount>';
	}
	if(probability != "" && probability != null)
	{
	updateXML = updateXML + '<PrimaryRevenueWinProbability>'+probability+'</PrimaryRevenueWinProbability>';
	}
	if(status != "" && status != null)
	{
	updateXML = updateXML + '<SalesStage>'+status+'</SalesStage>';
	}
	if(srLongDesc != "" && srLongDesc != null)
	{
	updateXML = updateXML + '<History>'+srLongDesc+'</History>';
	}
	if(priority != "" && priority != null)
	{
	updateXML = updateXML + '<PriorityFlag>'+priority+'</PriorityFlag>';
	}
	if(srDiscussion != "" && srDiscussion != null)
	{
	updateXML = updateXML + '<Comments>'+srDiscussion+'</Comments>';
	}	
	
	//updateXML = updateXML + '<AccountIntegrationId/>';
	if(ccode != "" && ccode != null)
	{
	updateXML = updateXML + '<CurrencyCode>'+ccode+'</CurrencyCode>';
	}

	updateXML =updateXML +'<SCRMUpdate/><IntegrationId/><OpptyId>'+opptyID+'</OpptyId></Opportunity></ListOfOpportunityInterface></SiebelMessage></cus:FINSANIRequestProvidersUpdate>   </soapenv:Body></soapenv:Envelope>';

	//console.log ("The Update XML is:"+updateXML);
	
	osapi.jive.connects.get({
	  'alias' : 'accenture',
	  'format' : 'text',
	  'headers' : { 'Content-Type' : ['application/xml;charset=utf-8'], 'Accept-Language' : ['en-us']},
	  'params' : { 'SWEExtData' : updateXML } // Jive Connects will URI encode values for you
	}).execute(function(response) {
	        // console.log(response);
			if (!response.error) {
			//console.log(response);
			if (srDiscussion == "")
			{
			$("#infoMsg7").html("<b>Opportunity updated successfully.</b>");
			miniMessage.createTimerMessage(document.getElementById("infoMsg7"),4);
			$('#editDisplay').text("Update");
			$('#editDisplay').removeAttr('disabled');
			$('#cancel').show();
			$('#canvas').hide();
			$('table.data-grid tr').removeClass('active');
			}
			else
			{
			
			$("#infoMsg8").html("<b>Discussion created successfully.</b>");
			miniMessage.createTimerMessage(document.getElementById("infoMsg8"),4);
			$('#discussTable').hide();
			$('#discussTopic').val("");
			$('#discussMessage').val("");
			$('#submitDiscussion').text("Post Message");
			$('#submitDiscussion').removeAttr('disabled');
			$('#cancelDiscussion').show();
			$('table.data-grid tr').removeClass('active');
			}
			//UpdateDataGrid(srNo,srAccount, srType, srStatus, srDesc, srDiscussion); //Still working on this function
			window.location.reload();
			}
			else
			{
			
			$("#infoMsg9").html("<b>Unable to process your request. Please try again.<br/>Error: <i>"+response.error.message+"</i></b>");
			miniMessage.createTimerMessage(document.getElementById("infoMsg9"),4);
			//Enable the Update Button in case the update fails
			$('#editDisplay').text("Update");
			$('#editDisplay').removeAttr('disabled');
			$('#cancel').show();
			}
	});
	}

	//Update Data Grid without actually reloading the page -- for future
	function UpdateDataGrid(srNo,srAccount, srType, srStatus, srDesc, srDiscussion)
	{
	var row = '#srno_'+srNo;
	var discussion = "";
	if(srDiscussion!= "")
	{
		discussion = '<a href="'+srDiscussion+'" target="_jiveDiscussion" class="openDiscussion">Open<a>';
	}
	
	if (srStatus != "Open")
	{
		(row).remove();
		//var row = document.getElementById('srno_'+srNo);
	}	
	else
	{
	row = $('table.data-grid tr#srno_'+srNo+' td');	
	var i = 1;
	$(row).each(function(){
			if(i<9){
				if(srType!="" && i===2){$(this).text(srType)} 
				//else if(i===1){$('#srNumber').text($(this).text())}
				else if(srAccount!=="" && i=== 3){$(this).text(srAccount)} 
				//else if(i=== 6){$('#creation').text($(this).text())} 
				else if(i=== 7){$(this).text("Just now")} 
				//else if(i=== 4){$('#status').val($(this).text()).attr('disabled','disabled')} 
				else if(srDesc!="" && i=== 5){$(this).text(srDesc)}
				else if(srDiscussion!="" && i===8){$(this).text(srDesc)}
			}		
			i++;
		});	
	}
				$("table#xmlTable").tablesorter({widthFixed: false, widgets: ['zebra'],sortList: [[6,1], [1,0]], headers: { 3:{sorter: false}, 8:{sorter: false}}}).tablesorterPager({container: $("#pager")});
				$("#pager").show();
	}
	//Create the record -- 
	function CreateRecord (srAccount, srType, srDesc){
	//Create code will be moved here once the current problem is resolved.
	}

	//Treat the strings as they are.
	function ConvertToString(theString)
	{
		for (var i=0;i<=(theString.length-1);i++)
		{
		theString.charCodeAt(i);
		}
		return (theString);
	}
	
	//Get the Discussion ID from the supplied URL
	function getDiscussionID(url)
	{
		var discussionID = '';
		var discussionID = (url.substring(url.lastIndexOf("/"))).substr(1);
		return discussionID;
	}
	
	function getReplyCount (DiscID)
	{
	var request = osapi.jive.core.discussions.get({id: DiscID});
	request.execute(function(response) { 
			//console.log("Response: "+JSON.stringify(response));
			//console.log("ReplyCount: "+ response.data.messages.root.replyCount);
			Count = response.data.messages.root.replyCount;
			//console.log ("Reply:"+response.data.messages.root.replyCount)	
			return Count;
		});
	}

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
		hours = hours - 13; //as it is IST now. WHen there is no Daylight saving 1 should be replaced with 12.
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
/*		else if (hours == 0)
		{
			if (mins > 0)
			{	return mins+" mins ago"; }
			else
			{	return secs+" secs ago"; }
		}
		else
		{	return secs+" secs ago"; } */
		return (dtfmtDate);
	}
});