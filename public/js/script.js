$(function(){
	$.getJSON( '/history', function(data) {
		  var items = [];
		  $.each( data.history.data, function( key, val ) {
		    items.push( "<li id='" + key + "'>" + val.artist.name + "</li>" );
		  });
		 
		  $( "<ul/>", {
		    "class": "my-new-list",
		    html: items.join( "" )
		  }).appendTo( "body" );
	});
});