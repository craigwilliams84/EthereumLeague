contract('LeagueAggregate', function(accounts) {
  it("should be able to add a new league", function(done){
    var leagueAgg = LeagueAggregate.deployed();
    console.log(toUTF8Array("Test League"));
    
    leagueAgg.addLeague(toUTF8Array("Test League"), 3, 1, {from: accounts[0], gas: 3000000}).then(function() {
        console.log("Added");
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		console.log(leagueIds);
    		assert.equal(leagueIds.length, 1, "League not added correctly");
    		done();
    	});
    }).catch(function(err) {
    	console.log(err);
    	done(err);
  	});
  });
});

function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18), 
                      0x80 | ((charcode>>12) & 0x3f), 
                      0x80 | ((charcode>>6) & 0x3f), 
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}