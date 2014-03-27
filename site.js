var countryListUrl = 'https://finances.worldbank.org/views/rbxa-eznj/rows.json?jsonp=?',
	summaryDataUrl = 'https://finances.worldbank.org/views/i7mn-cgpk/rows.json?jsonp=?'

wbLoanCompare = {
	init: function() {
		var ME = this,
			countryItems = '',
			countryA,
			countryB,
			topDebtCountry,
			topLoanCountry,
			totalCountries = 0,
			totalLoanAmt = 0,
			totalRepaidAmt = 0,
			totalRemainAmt = 0;
		$.getJSON(countryListUrl).done(function(data) {
			$.each(data.data, function(i, item) {
				if (item[8]) {
					totalCountries++;
					countryItems = countryItems + '<li><a href="#">' + item[8] + '</a></li>';
				}
			});
			$("ul.country_select_a").append(countryItems);
			$("ul.country_select_b").append(countryItems);
			$("ul.dropdown-menu li a").click(function(evt) {
				var countryName = evt.currentTarget.innerHTML,
					target = $(arguments[0].currentTarget);

				if (countryName) {
					target.parents('li.dropdown').children('.dropdown-toggle').html(countryName);
				}

				if (target.parents('ul.country_select_b').length) {
					countryB = countryName;
				} else if (target.parents('ul.country_select_a').length){
					countryA = countryName;
				}

				if (countryA && countryB && countryA != countryB) {
					ME.startCountryComparison(countryA, countryB);
				}
			});
		});
		$.getJSON(summaryDataUrl).done(function(data) {
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

			$("span.loan_country_count").html(totalCountries);
			$("span.loan_country_total").html(pretty_number(totalLoanAmt));
			$("span.loan_country_repay").html(pretty_number(totalRepaidAmt));
			$("span.loan_country_remain").html(pretty_number(totalRemainAmt));

		});
	},
	startCountryComparison: function(){

	}
};

wbLoanCompare.init();

function pretty_number(num, opts) {
	var defaultOpts = {
		short: true,
		lowerCase: false,
		addCommas: true,
		round: 2
	};

	if (typeof num != "number") {
		num = parseFloat(num);
	}

	function round(num, dec) {
		num = num * Math.pow(10, dec);

		num = Math.round(num);

		num /= Math.pow(10, dec);

		return num;
	}

	if (typeof opts == 'undefined') {
		opts = {};
	}

	for (var i in defaultOpts) {
		opts[i] = (typeof opts[i] != 'undefined') ? opts[i] : defaultOpts[i];
	}

	if (opts.short) {
		var decimal_places = Math.floor(Math.log(num) / Math.log(10));

		var dec = [{
			'suffix': 'T',
			'divisor': 12
		}, {
			'suffix': 'B',
			'divisor': 9
		}, {
			'suffix': 'M',
			'divisor': 6
		}, {
			'suffix': 'K',
			'divisor': 3
		}, {
			'suffix': '',
			'divisor': 0
		}];

		for (var i in dec) {
			if (decimal_places > dec[i].divisor) {
				num = round((num / Math.pow(10, dec[i].divisor)), 2 - (decimal_places - dec[i].divisor));

				if (num >= 1000 && i > 0) {
					decimal_places -= 3;
					num = round(num / 1000, 2 - (decimal_places - dec[i - 1].divisor));
					num += dec[i - 1].suffix;
				} else {
					num += dec[i].suffix;
				}

				break;
			}
		}

		num = '' + num;

		if (opts.lowerCase) {
			num = num.toLowerCase();
		}
	} else if (opts.addCommas) {
		var decnum = ('' + (round(num, opts.round) - Math.floor(num))).substr(2);

		var tempnum = '' + Math.floor(num);
		num = '';
		for (i = tempnum.length - 1, j = 0; i >= 0; i--, j++) {
			if (j > 0 && j % 3 == 0) {
				num = ',' + num;
			}
			num = tempnum[i] + num;
		}

		if (decnum > 0) {
			num = num + '.' + decnum;
		}
	}

	return num;
}