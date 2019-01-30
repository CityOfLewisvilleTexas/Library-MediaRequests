"use strict";

// Vue!

var app = new Vue({
    el: "#app",

    data: {
	   //array for webservice results
	   result: [],
       nResult: [],
       select: '',
       sortType: ''
    
    },

    methods: {

        getUrlParameter: function(sParam) {
            var sPageURL = decodeURIComponent(window.location.hash.substring(1)),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;
           
            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam) {
                    return sParameterName[1] === undefined ? true : sParameterName[1];
                }
            }
        },

	/*all sorting methods are for the sort by button 
	  sorts by the date of the request for media*/
	sortedDate: function(event) {
		this.sortType = 'sDate';
		this.result.sort( (b, a) => {
			if(b.daterequested == '' && a.daterequested == ''){
				return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
			}
			else if(b.daterequested == ''){
				return 1;
			}
			else if(a.daterequested == ''){
				return -1;
			}
			else{
				var v = new Date(a.daterequested) - new Date(b.daterequested);
				if(v == 0){
					return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
				}
				else{
					return v;
				}
			}
		});
		return this.result;

    },

    //sorts by book title name
     sortedTitle: function(event) {
        this.sortType = 'sTitle';
        function compare(a, b){
			if(a.itemtitle == '' && b.itemtitle == ''){
				return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
			}
			else if(a.itemtitle == ''){
				return 1;
			}
			else if(b.itemtitle == ''){
				return -1;
			}
            else if(a.itemtitle < b.itemtitle)
            	return -1;
            else if(a.itemtitle > b.itemtitle)
            	return 1;
			else{
				return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
			}
        }
        return this.result.sort(compare);

     },
     //sorts what collection the books belong to 
     sortedColl: function() {
        this.sortType = 'sColl';
        function compare(a, b){
			if(a.collection_VSVal_ == '' && b.collection_VSVal_ == ''){
				return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
			}
			else if(a.collection_VSVal_ == ''){
				return 1;
			}
			else if(b.collection_VSVal_ == ''){
				return -1;
			}
            else if(a.collection_VSVal_ < b.collection_VSVal_)
            	return -1;
            else if(a.collection_VSVal_ > b.collection_VSVal_)
            	return 1;
			else{
				return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
			}
        }
        return this.result.sort(compare);
    },
    //Sorts the selectors
    sortedSelect: function() {
        this.sortType = 'sSelect';
        function compare(a, b){
			if(a.selector == '' && b.selector == ''){
				return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
			}
			else if(a.selector == ''){
				return 1;
			}
			else if(b.selector == ''){
				return -1;
			}
            else if(a.selector < b.selector)
            	return -1;
            else if(a.selector > b.selector)
            	return 1;
			else{
				return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
			}
        }
        return this.result.sort(compare);
    },
    //Used to sort the staff members 
    sortedStaff: function() {
        this.sortType = 'sStaff';
        function compare(a, b){
			if(a.staffrequesting == '' && b.staffrequesting == ''){
				return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
			}
			else if(a.staffrequesting == ''){
				return 1;
			}
			else if(b.staffrequesting == ''){
				return -1;
			}
            else if(a.staffrequesting < b.staffrequesting)
            	return -1;
            else if(a.staffrequesting > b.staffrequesting)
            	return 1;
			else{
				return new Date(a.psofia_createddate) - new Date(b.psofia_createddate);
			}
        }
        return this.result.sort(compare);

    },

    filtering: function(select){
         
         var j = 0;

          //var name = select.toUpperCase();
          //console.log("selector to find: " + select);

          if(select === "ALL")
            {
                this.nResult = this.result; 
            }

			else{
				this.nResult = this.result.filter(function(r){
					return r.selector.toUpperCase() === app.select;
				});
			}
        /* for (var i = 0; i < this.result.length; i++) {

           
            if(this.result[i].selector.toUpperCase() === select)
            {
                this.nResult[j] = this.result[i]; 
                j++;
            }           
         }*/
           return this.nResult;
    },
	
	getData: function(){
		$.post('https://query.cityoflewisville.com/v2/', { 
			webservice : 'Library/MediaRequest'
            //selectorName: app.select
            

		}, function(data){ 
           
           //store webservice data into an array
            app.result = data[0];
			
			app.result= app.filtering(app.select);
        
        //conditions to check sort status after reloading 
          if(app.sortType === 'sDate')
           {
            app.sortedDate();
           }
           else if(app.sortType === 'sTitle')
           {
            app.sortedTitle();
           }
           else if(app.sortType === 'sStaff')
           {
            app.sortedStaff();
           }
           else if(app.sortType === 'sColl')
           {
            app.sortedColl();
           }
           else if(app.sortType === 'sSelect')
           {
            app.sortedSelect();
           }
                      
           //filter the results array
          // console.log(data);
           //vm.result= vm.filtering(vm.select);
           //console.log(vm.result);
           //console.log("searching for: " + vm.select); //The selector to search for
		   
			if(document.getElementById("app").style.display == 'none'){
				showPage();
			}
        });
	},


    
 
    },
     
	mounted: function() {
		var vm = this;
		//console.log('created');

		vm.select = vm.getUrlParameter('selector').toUpperCase();
        vm.sortType = 'sDate';
     
		vm.getData();
		setInterval(vm.getData, 10000);
	 /*//Interval to update edited/added items on page
	  setInterval(() => {  
		//call webservice
        
		$.post('https://query.cityoflewisville.com/v2/', { 
			webservice : 'Library/MediaRequest'
            //selectorName: vm.select
            

		}, function(data){ 
           
           //store webservice data into an array
            vm.result = data[0];
			
			vm.result= vm.filtering(vm.select);
        
        //conditions to check sort status after reloading 
          if(vm.sortType === 'sDate')
           {
            vm.sortedDate();
           }
           else if(vm.sortType === 'sTitle')
           {
            vm.sortedTitle();
           }
           else if(vm.sortType === 'sStaff')
           {
            vm.sortedStaff();
           }
           else if(vm.sortType === 'sColl')
           {
            vm.sortedColl();
           }
           else if(vm.sortType === 'sSelect')
           {
            vm.sortedSelect();
           }
                      
           //filter the results array
          // console.log(data);
           //vm.result= vm.filtering(vm.select);
           //console.log(vm.result);
           //console.log("searching for: " + vm.select); //The selector to search for
		   
          
           
		}.bind(vm)); 
        }, 5000);*/
	}	
    })


//The hover/change color element for the sort by button
$(document).ready(function(){
    $("li").hover(function(){
        $(this).css("background-color", "#e0dcd9");
        }, function(){
        $(this).css("background-color", "white");

    })
});

var myVar;

/*function myFunction() {
    myVar = setTimeout(showPage, 1000);
}*/

function showPage() {
  document.getElementById("pre-loader").style.display = "none";
  document.getElementById("app").style.display = "block";
}  


