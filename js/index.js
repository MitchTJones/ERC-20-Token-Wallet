var account;
var contract;

const CONTRACT_STRING = /* INSERT contract address for token */ '0xeA35ee1c5bE37333fa5c254b67E4957bDC4fF844';

$(document).ready(init);

function init() {
	$('#blockexplorer').attr('href', 'https://etherscan.io/token/' + CONTRACT_STRING);
	var metaMaskChecker = setInterval(function() {
		if (typeof web3 == 'undefined') {
			var dlLink = '';
			switch(getBrowser()) {
				case 'Chrome':
					dlLink = 'https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en';
					break;
				case 'Firefox':
					dlLink = 'https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/';
					break;
				case 'Opera':
					dlLink = 'https://addons.opera.com/en/extensions/details/metamask/';
					break;
			}
			$('#dl-mm').attr('href', dlLink);
			if (dlLink == '')
				switchPage('wrong-browser');
			else
				switchPage('no-metamask');
		} else if (web3.eth.accounts.length == 0)
			switchPage('not-logged-in');
		else
			switchPage('wallet');
	},500);
	web3.version.getNetwork(function(err, netId) {
		switch (netId) {
			case '1':
				console.log('mainnet');
				break;
			case '2':
				console.log('deprecated Morden testnet');
				break;
			case '3':
				console.log('ropsten testnet');
				break;
			case '4':
				console.log('Rinkeby testnet');
				break;
			case '42':
				console.log('Kovan testnet');
				break;
			default:
				console.log('unknown network');
		}
	});
	getMetaMask();
}

function getMetaMask() {
	getAcc(function(acc) {
		account = acc;
	});
	getABI(function(abi) {
		contract = getContract(abi,CONTRACT_STRING);
	});
	var checker = setInterval(function() {
		if (typeof contract != 'undefined') {
			if (typeof account != 'undefined') {
				$('#wallet').show();
				startApp();
				clearInterval(checker);
			}
		}
	}, 100);
}

function startApp() {
	$('#send').click(function() {
		sendTokens($('#txAddress').val(), $('#txAmount').val());
	});
	console.log('account public address: '+account);
	console.log('Locke contract address: '+CONTRACT_STRING);
	setBalance();
	setInterval(setBalance, 5000);
	setTxHistory();
	$('#eth-address').html(account);
	$('#qr-address').attr('src', 'https://chart.googleapis.com/chart?cht=qr&chl=' + account + '&chs=235x235&chld=L|0')
}

function sendTokens(to,amount) {
	contract.transfer(to,amount*1000, function(err, res) {
		var txChecker = setInterval(function() {
			web3.eth.getTransactionReceipt(String(res), function(e,r) {
				setBalance();
				if (r)
					clearInterval(txChecker);
			});
		},100)
	});
}

function setBalance() {
	getBalance(account, function(b) {
		$('#balance').html(l(b));
	})
}

function setTxHistory() {
	var txs = [];
	$.getJSON('https://api.etherscan.io/api?module=account&action=txlist&address=' + CONTRACT_STRING + '&startblock=0&endblock=99999999&apikey=SQQJW5RNPKY13ZENIGTUXQD2PCKS5425EA', function(data) {
		data.result.sort(function(a,b) {
			return b.timeStamp - a.timeStamp;
		});
		for (i = 0; i < data.result.length; i++) {
			web3.eth.getTransactionReceipt(data.result[i].hash, function(err,res) {
				if (res.to == contract.address.toLowerCase()) {
					if (res.logs.length != 0) {
						var from = no0s(res.logs[0].topics[1]);
						var to = no0s(res.logs[0].topics[2]);
						if (from == account || to == account) {
							web3.eth.getBlock(res.blockHash, function(e,r) {
								addTx({
									from: from,
									to: to,
									block: r.hash,
									time: r.timestamp,
									hash: res.transactionHash,
									amount: l(web3.toDecimal(res.logs[0].data))
								});
							});
						}
					}
				}
			});
		}
	});
}

function addTx(json) {
	var ref = 'https://etherscan.io/tx/'+json.hash;
	var message = '';
	if (json.to == account) {
		message += '<a href="'+ref+'" class="list-group-item"><div class="tx"><p><b>From:</b> '+json.from+'</p>';
	} else {
		message += '<a href="'+ref+'" class="list-group-item"><div class="tx"><p><b>To:</b> '+json.to+'</p>';
	}
	message += '<p>'+json.amount+'</p>';
	message += '<p class="date">'+date(json.time*1000)+'</p>';
	message += '</div></a>';
	$('#txList').append(message);
}

function no0s(add) {
	a = add.replace('0x', '');
	while(!web3.isAddress('0x'+a)) {
		a = a.substr(1);
		if (add.length == 0)
			return null;
	}
	return '0x'+a;
}

function date(unix) {
	var d = new Date(unix);
	return d.getMonth()+'/'+d.getDate()+'/'+d.getFullYear()+', '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
}

function getBalance(acc, callback) {
	contract.balanceOf(acc, function(err, res) {
		callback(res.c[0]);
	});
}

function getContract(abi, add) {
	return web3.eth.contract(abi).at(add);
}

function getABI(callback) {	
	$.getJSON('/abi.json', callback);
}

function getAcc(callback) {
	var accInt = setInterval(function() {
		var acc = web3.eth.accounts[0];
		if (acc) {
			callback(acc);
			clearInterval(accInt);
		}
	}, 100);
}

function switchPage(id) {
	$('#wallet').hide();
	$('#no-metamask').hide();
	$('#not-logged-in').hide();
	$('#wrong-browser').hide();
	$('#'+id).show();
}

function getBrowser() {
	if (typeof InstallTrigger !== 'undefined')
		return 'Firefox';
	if ((!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0)
		return 'Opera';
	if (/constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)))
		return 'Safari';
	if (/*@cc_on!@*/false || !!document.documentMode)
		return 'Internet Explorer'
	if (!(/*@cc_on!@*/false || !!document.documentMode) && !!window.StyleMedia)
		return 'Edge';
	if (!!window.chrome && !!window.chrome.webstore)
		return 'Chrome';
	return '';
}

function l(inp) {
	return commas(inp/1000);
}

function commas(inp) {
	return String(inp).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}