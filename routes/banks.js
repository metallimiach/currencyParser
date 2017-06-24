// banks.js
// =============================================================================

// call the packages we need
var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

// set base URL to grab html
var url = 'https://myfin.by/banki';
// array for saving rates
var banks = [];

router.get('/', function (req, res, next) {
    request({
        uri: url,
        method: 'GET',
        encoding: null                                      // encoding in binery
    }, function (error, response, body) {
        html = iconv.decode(new Buffer(body), 'utf8');   // encoding in utf8
        
        // Checking of response result
        if (!error && response.statusCode == 200) {
            banks = mainContentParser(html);
        };
        
        res.json(banks);

        banks = [];
    });
});

function mainContentParser(html) {
    var $ = cheerio.load(html, { ignoreWhitespace: true });

    // Extract data
    $('table.rates-table-sort').children('tbody').children('tr').each(function (i, el) {
        
        // Bank name
        var bank = $(this).children('td').first().text();
        // Bank Address
        var bankAddress = ($(this).children('td.number').first().text());
        // Bank Web Site
        var bankSite = ($(this).children('td').first().next().text());
        
        //Parsed meta data object
        var metadata = {
            bank: bank,
            bankAddress: bankAddress,
            bankSite: bankSite
        };
        banks.push(metadata);
    });
    return banks;

}

module.exports = router;