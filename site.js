var countryListUrl = 'https://finances.worldbank.org/views/rbxa-eznj/rows.json?jsonp=?',

	wbLoanCompare = {
		init: function() {
			var countryItems = '',
				countryA,
				countryB;
			$.getJSON(countryListUrl).done(function(data) {
				$.each(data.data, function(i, item) {
					if (item[8]){
						countryItems = countryItems + '<li><a href="#">'+item[8]+'</a></li>';
					}
				});
				$("ul.country_select_a").append(countryItems);
				$("ul.country_select_b").append(countryItems);
				$("ul.dropdown-menu li a").click(function(evt){
					var countryName = evt.currentTarget.innerHTML,
						target = $(arguments[0].currentTarget);
					if (countryName){
						target.parents('li.dropdown').children('.dropdown-toggle').html(countryName);
					}
					if (target.parents('ul.dropdown-menu'))
					if (countryA && countryB) {
						this.startCountryComparison(countryA, countryB);
					}
				});
			});
		}
	};

wbLoanCompare.init();