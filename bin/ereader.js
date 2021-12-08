const htmlparser = require('node-html-parser')
const fs = require('fs');
const path = require('path');
const https = require('follow-redirects').https;
const { convert } = require('html-to-text');
const termkit = require('terminal-kit')
const term = termkit.terminal,
url = 'https://re-library.com/translations/arifureta/volume-8/vol-8-chapter-11-peerless-outbreak-of-war-without-self-restraint/'


menuDisplayed = false;

// Scrape HTML
function getData(pathF, callback) {
  var options = {
    'method': 'GET',
    'hostname': "re-library.com",
    'path': pathF,
    'maxRedirects': 20
  };
  https.request(options, function (res) {
    var chunks = [];
  
    res.on("data", function (chunk) {
      chunks.push(chunk);
    });
  
    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      callback(body.toString());
    });
  
    res.on("error", function (error) {
      console.error(error);
    });
  }).end();
}

// Recursive scraping
getChapter = function(pathF, iteration) {
    
  getData(pathF, function(info) {
    root = htmlparser.parse(info);
    content = root.querySelector(".entry-content").innerHTML
    titleText = root.querySelector(".entry-header .entry-title").innerHTML
    linknext = root.querySelector(".entry-content .nextPageLink a").attrs.href.split("https://re-library.com")[1];
    linkprev = root.querySelector(".entry-content .prevPageLink a").attrs.href.split("https://re-library.com")[1];

    texted = (" \n "+titleText + "\n \n"+ content.split("</table>")[1].split('<div class="prevPageLink">')[0]);
    links = {"current":pathF, "next":linknext, "previous":linkprev}
    
    fs.writeFile(path.join(__dirname + "/..","chapter.json"), JSON.stringify(links), function() {
        showText(convert(texted))
        //fs.writeFile("./chapter.txt", links, function() {
        //})
    })
    
  })
}

// Read last chapter, then execute
/*
fs.readFile("./chapter.txt", 'utf8', function(err, data) {
    getChapter(data, 1);
})*/

newChapter = function() {
    term.clear();
    term("Loading.....");
    fs.readFile(path.join(__dirname + "/..","chapter.json"), 'utf8', function(err, data) {
        links = JSON.parse(data);
        getChapter(links.next);
    })
    
}
lastChapter = function() {
    term.clear();
    term("Loading.....");
    fs.readFile(path.join(__dirname + "/..","chapter.json"), 'utf8', function(err, data) {
        links = JSON.parse(data);
        getChapter(links.previous);
    })
    
}

loadChapter = function() {
    term.clear();
    term("Loading.....");
    fs.readFile(path.join(__dirname + "/..","chapter.json"), 'utf8', function(err, data) {
        links = JSON.parse(data);
        getChapter(links.current);
    })
}

createMenu = function() {
    term.singleLineMenu(["Next","Close Menu", "Exit","Previous"], {
        y:term.height, 
    }, function(error, response) {
        if (error) return error;
        //console.log(response)
        menuDisplayed = false;
        switch (response.selectedIndex) {
            case 0:
                term.clear();
                newChapter();
                return;
            case 1:
                return;
            case 2:
                term.clear();
                process.exit();
                return;
            case 3:
                term.clear();
                lastChapter();
                return;
            default:
                return;
        }
    })
}

showText = function(text) {
    term.clear();
    term.grabInput();
    var document = term.createDocument( {
        palette: new termkit.Palette(),
    }) ;
    //fs.readFile(path.join(__dirname + "/..","info.txt"), 'utf8', function(err, data) {
        var textBox = new termkit.TextBox({
            parent: document ,
            //content: text ,
            //contentHasMarkup: true ,
            scrollable: true ,
            vScrollBar: true ,
            lineWrap: true ,
            //wordWrap: true ,
            x: 2 ,
            y: 0 ,
            width: term.width-2,
            height: term.height-1
        }) ;
        textBox.textBuffer.setText(text)
        textBox.scrollToTop();
        term.on('key', function(name, matches,data) {
            switch(name) {
                case ("CTRL_C"):
                    term.clear();
                    return process.exit();
                case("UP"):
                    if(!menuDisplayed) textBox.scroll(0,term.height-1);
                    return;
                case("DOWN"):
                    if(!menuDisplayed) textBox.scroll(0,-(term.height-1));
                    return;
                case("m"):
                    createMenu();
                    menuDisplayed = true;
                    return;
            }
        })
    //})
}
//showText();
module.exports = {loadChapter}