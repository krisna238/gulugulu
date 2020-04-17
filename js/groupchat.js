/*-------------------------------------------GroupChat js------------------------------------------------------ */
$(document).on("click", ".btnNewGroup", function () {
	$("#createGroupForm").find(".groupname").val("");
	$(".usrnmmsg").html("");
	$(".errormsg").html("");
	$("#IndexDynamicContent").show();
});
$(document).on("click", ".btnCancelNewGroup", function () {
	$("#createGroupForm").find(".groupname").val("");
	$(".usrnmmsg").html("");
	$(".errormsg").html("");
	$("#IndexDynamicContent").hide();
});


$("#createGroupForm").submit(function (e) {
	e.preventDefault();
	let el = $("#createGroupForm").find(".error").length;
	if (el > 0) {
		return;
	}
	let groupname = $("#createGroupForm").find(".groupname").val().toLowerCase().trim();
		$(".btncreateGroupSubmit").append(btnloader);
		let data = { creategroup: true, groupname: groupname };
		$.ajax({
			type: "POST",
			url: "controllers/controller.php",
			data: data,
			success: function (response) {
				if (response == "groupname_exists") {
					let message = '<span class="text-danger error"><small>Group already exists.</small></span>';
					$(".errormsg").removeClass("text-success").addClass("text-danger");
					$("#createGroupForm").find(".errormsg").html(message);
					$(".btncreateGroupSubmit").find(".spinner-border").remove();
				}
				else if (response == "inserted") {
					$(".btncreateGroupSubmit").find(".spinner-border").remove();
					let message = '<small>Group created successfully.</small>';
					$("#createGroupForm").find(".errormsg").removeClass("text-danger").addClass("text-success");
					$("#createGroupForm").find(".errormsg").html(message);
					$("#createGroupForm").find(".groupname").val("");
					getGroupList();
					$("#IndexDynamicContent").hide();
				}
				else if (response == "insert_failed") {
					let message = '<small>Group creation failed.</small>';
					$(".errormsg").removeClass("text-success").addClass("text-danger");
					$("#createGroupForm").find(".errormsg").html(message);
					$(".btncreateGroupSubmit").find(".spinner-border").remove();
					//$(".errormsg").addClass('error');
				}
			}
		});
});

function getGroupList(){
	let data = { getGroupList: true };
	$('.grouplist li:first').before('<center><div class="spinner-border text-danger mt-3"></div></center>');
	$.ajax({
		type: "POST",
		url: "controllers/controller.php",
		data: data,
		success: function (response) {
			if (response!="null") {

				response=JSON.parse(response);

				let grouplistdata='';
				for(let i=0;i<response.length;i++)
				{
					let data=response[i];
					//console.log(data);
					let dataid=JSON.stringify(data._id.$oid);
					//console.log(dataid);
					grouplistdata+='<li dataid='+dataid+' class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">\
								    '+data.GroupName+'<span class="badge badge-warning badge-pill mr-0">12</span>\
								    <div style="display:none;" class="dropdown dropright groupMenuDrpdown "><span class="dropdown-toggle" data-toggle="dropdown"><i class="fa fa-ellipsis-v" aria-hidden="true"></i></span>\
								        <div class="dropdown-menu">\
								        	<a class="dropdown-item btnCopyGrouplink" data-toggle="tooltip" data-placement="right" title="copy to clipboard" href="#">Copy Group Link <i class="fa fa-copy" aria-hidden="true"></i></a>\
								        	<a class="dropdown-item" href="#">Rename <i class="fa fa-edit" aria-hidden="true"></i></a>\
								        	<a class="dropdown-item btnDeleteGroup" href="#">Delete <i class="fa fa-trash" aria-hidden="true"></i></a>\
								        </div>\
								    </div>\
								</li>';
					$('.grouplist').html(grouplistdata);
				}
			}
		}
	});
}
if($('.grouplist').length>0)
getGroupList();

$("#groupMsgForm").submit(function (e) {
	e.preventDefault();
	let el = $("#groupMsgForm").find(".error").length;
	if (el > 0) {
		return;
	}
	let groupMSG = $("#groupMsgForm").find(".txtgrpmsg").val();
	let groupid = $("#groupMsgForm").find(".txtgroupid").val();
	
		let data = { savegroupmsg: true, groupMSG: groupMSG ,groupid : groupid};
		$.ajax({
			type: "POST",
			url: "controllers/controller.php",
			data: data,
			success: function (response) {
				if (response == "inserted") {
					displayGroupMessage(groupid);
					$("#groupMsgForm").find(".txtgrpmsg").val('');

				}
			}
		});
});

$(document).on('click',".grouplist li", function(){

	$('.grouplist li').removeClass('active');
	$('.groupMenuDrpdown').hide();
	$(this).find('.groupMenuDrpdown').show();
	$("#groupMsgForm").find(".txtgroupid").val($(this).attr('dataid'));
	$(this).addClass('active');
	displayGroupMessage($(this).attr('dataid'));
})

function displayGroupMessage(groupid){
	let data = { getGroupMessageList: true ,groupid:groupid};
	$.ajax({
		type: "POST",
		url: "controllers/controller.php",
		data: data,
		success: function (response) {
			if (response) {
				let result=response;
				result=JSON.parse(result);
				if(result[0].Messages!=undefined)
				{
					let Messages=result[0].Messages;
					if(result && result.length>0)
					{
						let MessageList='';
						for(let i=0;i<Messages.length;i++)
						{	 if(Messages[i].From==_constantClient.UserName)
							 MessageList+='<div class="containerr darker"><img src="images/pp.jpg" alt="Avatar" style="width:100%;"><p>'+Messages[i].Message+'</p><span class="time-right">'+Messages[i].CreateDate+'</span></div>';
						     else
							 MessageList+='<div class="containerr"><img src="images/pp.jpg" alt="Avatar" style="width:100%;"><p>'+Messages[i].Message+'</p><span class="time-right">'+Messages[i].CreateDate+'</span></div>';
						}
						$('.groupmessagelist').html(MessageList);
						divScrollBottom($('.groupmessagelist'));
					}
				}
				else
				{
					$('.groupmessagelist').html('<center><p style="margin-top: 10em;">this chat is empty.</p></center>');
				}
			}
		}
	});
}

$(document).on('click',".btnGroupRefreshMsg", function(){
	let groupid=$(this).closest(".row").find(".txtgroupid").val();
	if(groupid)
		displayGroupMessage(groupid);
});

$(document).on('click',".btnCopyGrouplink", function(){
	let groupid=$(this).closest("li").attr("dataid");
	var copyText = groupsharelink+groupid;
	let temp = $("<input>");
	$("body").append(temp);
	temp.val(copyText).select();
	document.execCommand("copy");
	temp.remove();
	$(this).attr("title", 'Copied: ' + copyText);
});

$(document).on('click',".btnDeleteGroup", function(){
	let groupid=$(this).closest("li").attr("dataid");
	if(groupid)
		deleteGroupById(groupid);
});

function deleteGroupById(groupid ) {
	let data = { deleteGroupById: true , groupid:groupid};
	$.ajax({
		type: "POST",
		url: "controllers/controller.php",
		data: data,
		success: function (response) {
			if (response=="deleted") {
				getGroupList();
			}
			else if(response=="delete_failed")
			{
				alert("something went wrong.");
			}
		},
		error: function (error) {
			console.log(error);
		}
	});
}
function divScrollBottom(div){
    div.scrollTop(div[0].scrollHeight);
}
divScrollBottom($('.groupmessagelist'));