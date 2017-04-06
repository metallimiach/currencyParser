// rates.js
// =============================================================================

// call the packages we need
var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

// set base URL to grab html
var url = 'https://benefit.by/exchange_rates/';           // this page in utf8
//var url = 'http://finance.blr.cc/obmen-valut/';         // this page in win1251

// array for saving rates
var rates = [];

router.get('/', function (req, res, next) {
    request({
        uri: url,
        method: 'GET',
        encoding: null                                      // encoding in binery
    }, function (error, response, body) {
        html = iconv.decode(new Buffer(body), 'utf8');   // encoding in utf8
        //html = iconv.decode(new Buffer(body), 'win1251'); // encoding in win1251
        
        // Checking of response result
        if (!error && response.statusCode == 200) {
            rates = mainContentParser(html);
        };
        res.json(rates);
        rates = [];
    });
});

function mainContentParser(html) {
    var $ = cheerio.load(html, { ignoreWhitespace: true });

    // Extract data
    $('#exchange_tbl').children('tbody').children('tr').each(function (i, el) {

        // Bank name
        var bank = $(this).children('td').first().text();
        // Exchange rates
        // USD
        var usdBuy = parseFloat($(this).children('td.td1').first().text());
        var usdSell = parseFloat($(this).children('td.td1').first().next().text());
        // EUR
        var eurBuy = parseFloat($(this).children('td.td1').first().next().next().text());
        var eurSell = parseFloat($(this).children('td.td1').first().next().next().next().text());
        // RUB
        var rubBuy = parseFloat($(this).children('td.td1').first().next().next().next().next().text());
        var rubSell = parseFloat($(this).children('td.td1').first().next().next().next().next().next().text());
        // Conversion rates
        var usdrub = parseFloat($(this).children('td.td1').last().prev().prev().prev().text());
        var rubusd = parseFloat($(this).children('td.td1').last().prev().prev().text());
        var eurusd = parseFloat($(this).children('td.td1').last().prev().text());
        var usdeur = parseFloat($(this).children('td.td1').last().text());

        //Parsed meta data object
        var metadata = {
            bank: bank,
            usdBuy: usdBuy,
            usdSell: usdSell,
            eurBuy: eurBuy,
            eurSell: eurSell,
            rubBuy: rubBuy,
            rubSell: rubSell,
            usdrub: usdrub,
            rubusd: rubusd,
            eurusd: eurusd,
            usdeur: usdeur
        };
        rates.push(metadata);
    });
    return rates;
}

function reserveContentParser (html) {
    var $ = cheerio.load(html);
    // find all 'tr' tags and extract data row by row
    $('tbody').children('tr').each(function (i, el) {
        // Bank name
        var bank = $(this).children('td.bank').find('b').text();
        // Address
        var bankAddress = $(this).children('td.bank').find('small').text();
        // Date and time of set rates 
        var date = $(this).children('td.bank').next().text();
        // Exchange rates
        // USD
        var usdBuy = $(this).children('td.bank').next().next().text();
        var usdSell = $(this).children('td.bank').next().next().next().text();
        // EUR
        var eurBuy = $(this).children().last().prev().prev().prev().text();
        var eurSell = $(this).children().last().prev().prev().text();
        // RUB
        var rubBuy = $(this).children().last().prev().text();
        var rubSell = $(this).children().last().text();

        // parsed meta data object
        var metadata = {
            bank: bank,
            Address: bankAddress,
            dateTime: date,
            usdBuy: usdBuy,
            usdSell: usdSell,
            eurBuy: eurBuy,
            eurSell: eurSell,
            rubBuy: rubBuy,
            rubSell: rubSell
        };
        rates.push(metadata);
    });
    return rates;
}

module.exports = router;