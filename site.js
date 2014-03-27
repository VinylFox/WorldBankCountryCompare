var countryListUrl = 'https://finances.worldbank.org/views/rbxa-eznj/rows.json?jsonp=?',
	summaryDataUrl = 'https://finances.worldbank.org/views/i7mn-cgpk/rows.json?jsonp=?',
	countryDataUrl = 'https://finances.worldbank.org/resource/sfv5-tf7p.json?$jsonp=?&country=',
	loanStatusesUrl = 'https://finances.worldbank.org/views/jxks-acyi/rows.json?jsonp=?',
	countryA,
	countryB,
	countryItems = '',
	topDebtCountry,
	topLoanCountry,
	totalCountries = 0,
	totalLoanAmt = 0,
	totalRepaidAmt = 0,
	totalRemainAmt = 0,
	countryLookup = {},
	statuses = {},

	spinnerSettings = {
		lines: 11,
		length: 0,
		width: 30,
		radius: 20,
		corners: 1.0,
		rotate: 0,
		trail: 67,
		speed: 1.0,
		direction: 1,
		shadow: true
	},

	wbLoanCompare = {
		init: function() {

			$.getJSON(countryListUrl).done(this.handleCountryListData);
			$.getJSON(summaryDataUrl).done(this.handleSummaryData);
			$.getJSON(loanStatusesUrl).done(this.handleStatusesData);

			this.setupSelectionMaps();

		},
		setupSelectionMaps: function(){
			jQuery('div.map_a').vectorMap({
				map: 'world_en',
				backgroundColor: '#fff',
				onRegionClick: wbLoanCompare.countryClick
			});

			jQuery('div.map_b').vectorMap({
				map: 'world_en',
				backgroundColor: '#fff',
				onRegionClick: wbLoanCompare.countryClick
			});
		},
		handleStatusesData: function(data){
			$.each(data.data, function(i, item) {
				statuses[item[8]] = {
					principal: item[9],
					cancelled: item[10],
					undisbursed: item[11],
					disbursed: item[12],
					repaid: item[13],
					due: item[14]
				}
			});
		},
		handleCountryListData: function(data) {
			$.each(data.data, function(i, item) {
				if (item[8]) {
					totalCountries++;
					countryItems = countryItems + '<li><a href="#">' + item[8] + '</a></li>';
					countryLookup[item[8]] = true;
				}
			});
			$("ul.country_select_a").append(countryItems);
			$("ul.country_select_b").append(countryItems);
			$("span.loan_country_count").html(totalCountries);
			$("ul.dropdown-menu li a").click(function(evt) {
				var countryName = evt.currentTarget.innerHTML,
					target = $(arguments[0].currentTarget);

				if (countryName) {
					target.parents('li.dropdown').children('.dropdown-toggle').html(countryName);
				}

				if (target.parents('ul.country_select_b').length) {
					countryB = countryName;
				} else if (target.parents('ul.country_select_a').length) {
					countryA = countryName;
				}

				this.checkCountrySelections(countryA, countryB);
			});
		},
		handleSummaryData: function(data) {
			$.each(data.data, function(i, item) {
				if (i < 1) {
					topLoanCountry = item;
					topDebtCountry = item;
				}

				if (parseFloat(topLoanCountry[12]) < parseFloat(item[12])) {
					topLoanCountry = item;
				}

				totalLoanAmt = totalLoanAmt + parseFloat(item[12]);
				totalRepaidAmt = totalRepaidAmt + parseFloat(item[13]);
				totalRemainAmt = totalRemainAmt + parseFloat(item[14]);
			});

			// 
			$("span.debt_country_name").html(topDebtCountry[8]);
			$("span.debt_country_amt").html(pretty_number(topDebtCountry[14]));
			$("span.loan_country_name").html(topLoanCountry[8]);
			$("span.loan_country_amt").html(pretty_number(topLoanCountry[12]));

			$("span.loan_country_total").html(pretty_number(totalLoanAmt));
			$("span.loan_country_repay").html(pretty_number(totalRepaidAmt));
			$("span.loan_country_remain").html(pretty_number(totalRemainAmt));

		},
		isCountryInWorldBank: function(country){
			return !!countryLookup[country];
		},
		checkCountrySelections: function(countryA, countryB){
			if (countryA && countryB && countryA == countryB){
				alert('Please select two different countries to compare');
			} else{
				if (countryA && countryB) {
					wbLoanCompare.startCountryComparison(countryA, countryB);
				}
			}
		},
		startCountryComparison: function(countryA, countryB) {
			$('div.country_overview').removeClass('hidden');
			this.getCountryData(countryA, 'a');
			$('div.country_a_overview').append(new Spinner(spinnerSettings).spin().el);
			this.getCountryData(countryB, 'b');
			$('div.country_b_overview').append(new Spinner(spinnerSettings).spin().el);
		},
		countryClick: function(element, code, region) {
			if (wbLoanCompare.isCountryInWorldBank(region)){
				if (element.target.className.indexOf('map_b') > 0){
					countryB = region;
					$('.country_select_b_name').html(region);
				} else if (element.target.className.indexOf('map_a') > 0){
					countryA = region;
					$('.country_select_a_name').html(region);
				}
				wbLoanCompare.checkCountrySelections(countryA, countryB);
			}else{
				alert('Sorry, but '+region+' does not have any loans from the World Bank');
			}
		},
		getCountryData: function(country, position){
			$.getJSON(countryDataUrl + country).done(function(data){
				var summaryData = {
					first_agreement_signing_date: '',
					last_agreement_signing_date: '',
					borrowers: [],
					borrower_count: {},
					projects: [],
					project_count: {},
					disbursed_amount: 0,
					status_details: JSON.parse(JSON.stringify(statuses))
				};
				$('div.country_'+position+'_overview').children('.spinner').remove();
				$.each(data, function(i, item) {
					summaryData.disbursed_amount =+ item.disbursed_amount;
					$('div.country_'+position+'_overview').children('.total_loaned').html(summaryData.disbursed_amount);
				});
				console.log(summaryData);
			});
		}
	};

wbLoanCompare.init();