$(document).ready(makeApp)

function makeApp(){

	
	$('.logIn').on('click', logIn);
	$('.logOff').on('click', logOff);

	var ref = new Firebase("https://freezer-inventory.firebaseio.com");
	var authData = ref.getAuth();
		
	function logIn() {
		ref.authWithOAuthPopup ("facebook", function(error, authData) {
	  		if (error) {
	    		console.log("Login Failed!", error);
	  		} else {
	    		console.log("Authenticated successfully with payload:", authData);
	    		location.reload();
	 		 }
		});
		
	}
	function logOff() {
		ref.unauth();
		location.reload();
	}

	if(authData){
		$('.noauth').hide();
		$('.name').html(authData.facebook.displayName+"'s");
		var user = authData.uid;

	}else {
		$('.noauth').show();
		var user = Date.now();
	}

	$('#inputbutton').click(add);

	function getData() {
		
	
		var listRef = new Firebase("https://freezer-inventory.firebaseio.com/"+user);
		listRef.on("value", function(snapshot) {
			
			data = snapshot.val();
			var nowtimestamp = new Date().getTime();
			//console.log(nowtimestamp);
			
			$('#list').html("");
			var i=1;
			$.each(data, function(key, value) {
					
				//difference reported in days
				difference=(nowtimestamp-value.date)/(1000*60*60*24);
				
				
				if (difference > 365){
					$('#list').append('<li><div class="eighty"><input id="checkbox-'+i+'" class="checkbox-custom" type="checkbox" value="' + " " + value.item + '" >' + '<label for="checkbox-'+i+'" class="checkbox-custom-label">' + value.item + ' ' + value.date +  '</label></div><div class="twenty"><button  value="' + key + '"class="deletebutton">Remove</button></div></li> ');
					$('this').addClass('overayear');
					i++;
				} else if (difference > 180){
					$('#list').append('<li><div class="eighty"><input id="checkbox-'+i+'" class="checkbox-custom" type="checkbox" value="' + " " + value.item + '" >' + '<label for="checkbox-'+i+'" class="checkbox-custom-label">' + value.item + ' ' + value.date +  '</label></div><div class="twenty"><button  value="' + key + '"class="deletebutton">Remove</button></div></li> ');
					$('this').addClass('oversixmonth');
					i++;
				} else if (difference > 30){
					$('#list').append('<li><div class="eighty"><input id="checkbox-'+i+'" class="checkbox-custom" type="checkbox" value="' + " " + value.item + '" >' + '<label for="checkbox-'+i+'" class="checkbox-custom-label">' + value.item + ' ' + value.date +  '</label></div><div class="twenty"><button  value="' + key + '"class="deletebutton">Remove</button></div></li> ');
					$('this').addClass('overamonth');
					i++;
				} else {
					$('#list').append('<li><div class="eighty"><input id="checkbox-'+i+'" class="checkbox-custom" type="checkbox" value="' + " " + value.item + '" >' + '<label for="checkbox-'+i+'" class="checkbox-custom-label">' + value.item + ' ' + value.date +  '</label></div><div class="twenty"><button  value="' + key + '"class="deletebutton">Remove</button></div></li> ');
					i++;

				}   

			})
		
		})
	
	}
	
	getData();
	

	function add(e) {
		e.preventDefault();
		var fullDate = new Date();
		var month = fullDate.getMonth()
		var twoDigitMonth = ((month.length+1) === 1)? (month+1) : '0' + (month+1); 
		var currentDate =  twoDigitMonth + "/" + fullDate.getDate() + "/" + fullDate.getFullYear();
		var listRef = ref.child(user);
		var newListRef = listRef.push();
		if($('input.item').val()) {
			newListRef.set({
				item: $('input.item').val(),
				date: currentDate
				})
		}
		
		
		$('.item').val('');

		
		getData();
		
	}

	$('ul').on('click', '.deletebutton', deleteIt);
	function deleteIt() {
		var deleteKey = $(this).attr('value');
		//console.log(deleteKey);
		deleteRef = new Firebase("https://freezer-inventory.firebaseio.com/"+user +"/" + deleteKey);
		deleteRef.remove()
	}

	$('#getRecipe').on('click', getRecipe);
	function getRecipe(){
		var items = $('input[type=checkbox]:checked').map(function(_, el) {
		return $(el).val();
		}).get();
		//console.log(items);

		if (items.length >= 1) {
			url = 'https://api.yummly.com/v1/api/recipes?_app_id=eeca60e7&_app_key=16fee2293718af3bc44a29480f727fa5&q='+items;
			//console.log(url);
			$.get(url, function(data){
				//console.log(data);
				
				$.each(data.matches, function() {
					//console.log(this.smallImageUrls[0]);
					string=this.smallImageUrls[0];
					bigPic= (string).replace('=s90', '=s300');
					//console.log(bigPic);
					$('#recipe').prepend('<a href="https://www.yummly.com/recipe/' + this.id + '"><li class="listed"><img src="' + bigPic +  '" class="pic"><span>'+ this.recipeName +'</span> </li></a>');
				})
			})
		}
		else{ 
			$("#recipe").html("<li class='listed'>Select one or more items</li>")

		}
	}
}