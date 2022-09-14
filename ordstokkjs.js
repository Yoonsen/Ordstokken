// tegneomr�det - global variabel
var wArea; 
var scoreArea;

//setningsobjektet som tegnes
var sentenceObjects; 
var sentenceObjectsClone;
var currIndx;
var scoreText;
var difficulty;


// Her f�lger dra og slippmetodene som globale variabler.
var dragStart = function() {
    this.attr({"fill-opacity":  0.5});
    this.data("ox", this.attr("x"));
    this.data("oy",this.attr("y"));
   
    // wText2.attr({text:       "x: " + this.data("ox") + "  y: " + this.data("oy")});
};
var dragMove = function(dx, dy) {
    nx = this.data("ox") + dx;
    ny = this.data("oy") + dy;
    this.attr({x: nx , y: ny });
    // wText.attr({text: "x: " + dx + "  y: " + dy});
};

var dragEnd = function() {
    this.attr({"fill-opacity":1});
};


window.onload = function() {
    // lokale variabler
    var mDiv;

    //denne variabelen er koordinert med default radioknapp som er satt til lett
    difficulty="lett";

    // Omr�det i html-dokumentet som det tegnes i
    mDiv = document.getElementById("word-view");
    var scoreDiv = document.getElementById("score-view");

    //  Sett opp tegneomr�det
    wArea = Raphael("word-view", mDiv.offsetWidth - 10, mDiv.offsetHeight - 10); //plass for ord
    scoreArea = Raphael("score-view", scoreDiv.offsetWidth, scoreDiv.offsetHeight);
    scoreText = scoreArea.text(10,50, "").attr({fill:"rgb(20,50,120)", 'text-anchor':'start',
            "font-size":64, "font-family":"Garamond"}); ;

   
    // initialiser setningen
    currIndx = -1;
    sentenceObjects = NewSentence(wArea.set(), difficulty);
}

// Denne vil klon setningen som jo bare er en array av tekstobjekter
// som man kan se, s� flyttes de et stykke over tegneomr�det,
// s� ved en fremtid zoomfunksjon vil de kunne sees!
function cloneSet(aSet) {
    r = wArea.set();
    for (var i = 0; i < aSet.length; i++) {
        r.push(aSet[i].clone().attr({y:-100}));
    }
    return(r);
}


// Denne funksjonen lager tekstobjekter fra en setning
// og returnerer det hele som et Raphael.set()

function check_point(x, y, Rx, Ry, Rh, Rw) {
    return(((Rx -4 <= x) && (x <= Rx + Rh +4) && (Ry -4 <= y) && (y <= Ry + Rw +4)));
}

function check_overlap(object, Px, Py, Ph, Pw) {
    overlap = false;
  
    for (var i = 0; i < object.length; i++) {
        var Ox = object[i].attr("x");
        var Oy = object[i].attr("y");
        var Ow = object[i].getBBox().height;
        var Oh = object[i].getBBox().width;
        overlap = (
            overlap || 
            !(Ox > Px + Ph ||
            Px > Ox + Oh ||
            Oy > Py + Pw ||
            Py > Oy + Ow)
        );
        if (overlap) {
            break;
        }
    }
    return( overlap);
}

function words(sent) {
    
    var mDiv = document.getElementById("word-view");
    var sObj = wArea.set();
    var ws = sent.split(" ");
    var x = mDiv.offsetWidth - 100;
    var y = mDiv.offsetHeight - 100; 

    for (var i = 0; i < ws.length; i++) {
        var w = wArea.text(10, 80, ws[i]);
  
        overlap = true;
        while (overlap) {
            w.attr({fill:"rgb(20,50,120)", 'text-anchor':'start',
                "font-size":32, "font-family":"Garamond"});;
            var wx = Math.max(10,Math.round(Math.random()*x));
            var wy = Math.max(80, Math.round(Math.random()*y));
//             w = w.animate({"x":wx, "y":wy}, 500, "linear");
            w.attr({"x":wx, "y":wy});
            overlap = check_overlap(sObj, wx, wy, w.getBBox().width, w.getBBox().height)
//             if (overlap) {
//                 w.attr({fill:"red"});  
//             }
        }
            // mouseEvents(w);
        sObj.push(w);
    }
    console.log(sObj);
    for (var i = 0; i < sObj.length; i++) {
        wx = sObj[i].attr("x");
        wy = sObj[i].attr("y");
        sObj[i].attr({"x":mDiv.offsetWidth/2, "y":mDiv.offsetHeight/2});
       
     
        sObj[i].animate({"x":wx, "y":wy}, 500, "linear");
    }
    return(sObj);
}

function sortWords(sentenceObjects) {
        //konverter sentenceObjects til js-array
    var sortedObj = [sentenceObjects[0]];
    for( var i = 1; i < sentenceObjects.length; i++) {
        sortedObj.push(sentenceObjects[i]);        
    }
    // for s� � sortere som de st�r p� skjermen:
    sortedObj = sortedObj.sort(
        function(a, b) {
            var ax = a.attr("x");
            var bx = b.attr("x");

            return(ax - bx)});

    return(sortedObj);
}

function ToArray(aSet) {
    res = new Array();
    for (i = 0; i < aSet.length; i++) {
        res.push(aSet[i])
    }

    return(res);
}

function showBi(pID, anArray) {
    var elmnt = document.getElementById(pID);
    elmnt.innerHTML = anArray[0];
    for (i = 1; i<anArray.length; i++) {
        elmnt.innerHTML = elmnt.innerHTML + ", " + anArray[i]
    }
}

function GiScore() {
    var xT =  Score();
    scoreText.attr({"text":xT});
    scoreText.show();
}

function Score() {
    var sentArray = ToArray(sentenceObjects);
    var solution = sortWords(sentenceObjects);
    var biSol = bigrams(solution);
    // showBi("biSol", biSol);
    var biAns = bigrams(sentArray);
    // showBi("biAns", biAns);
    var scr = 0;
    for (i = 0; i < biSol.length; i++) {
        if (biAns.indexOf(biSol[i]) >= 0) {
            scr += 1;
        }
    }
    return(Math.round(scr/biAns.length*100));
}

function bigrams(aSet) {
    

    var res = new Array();
    var bigr;
    for (var i = 0; i < aSet.length - 1; i++) {
        for (var j= i+1; j < aSet.length; j++) {
            bigr = aSet[i].attr("text") + "-" + aSet[j].attr("text");
            res.push(bigr);
        }
    }
    return(res);
}

// Stokk om p� ordene som allerede synes
function StokkOm() {
    
    //flytt vekk l�sningen ....
    for(var i = 0; i < sentenceObjectsClone.length; i++){
        sentenceObjectsClone[i].attr({y:-100})

    }

    var mDiv = document.getElementById("word-view");
    var sObj = wArea.set();
    var ws = sentenceObjects;
    var x = mDiv.offsetWidth - 100;
    var y = mDiv.offsetHeight - 100; 
    for (var i = 0; i < ws.length; i++) 
        overlap = true;
        while (overlap) {
          /* w.attr({fill:"rgb(20,50,120)", 'text-anchor':'start',
                "font-size":32, "font-family":"Garamond"});;
          */
            var wx = Math.max(10,Math.round(Math.random()*x));
            var wy = Math.max(80, Math.round(Math.random()*y));
//             w = w.animate({"x":wx, "y":wy}, 500, "linear");
            ws[i].attr({"x":wx, "y":wy});
            overlap = check_overlap(ws, wx, wy, ws[i].getBBox().width, ws[i].getBBox().height)
//             if (overlap) {
//                 w.attr({fill:"red"});  
//             }
        }
}

function radioClick(radio) {
    difficulty = radio.value;
}

// Vis frem l�sningen, skriv den ut under forslaget
// b�r vel sjekke om ikke brukeren har skrevet vel langt ned,
// da m� l�sningen st� ovenfor
function Solve() {
    var answer = AlignAnswer();
    var xP = answer[0].attr("x");
    var yP = answer[0].attr("y");
    var vHeight = answer[0].getBBox().height;
    var vFree = document.getElementById("word-view").offsetHeight;
    var delta = vHeight + 10;
    if ((yP + vHeight + delta) > vFree) {
        delta = -delta;
    }
    var dx = 8;
    for (var i = 0; i < sentenceObjectsClone.length; i++) {
        var w = sentenceObjectsClone[i];
        w.attr({x:xP, y:yP+delta, fill:"green"})
        var bb = w.getBBox();
        //wArea.text(xP, 50, xP+"," +bb.width);
       // wArea.rect(bb.x, bb.y, bb.width, bb.height);
        xP += bb.width + dx;
    }
    scoreText.attr({text:Score()});
   
}

function AlignAnswer() {
    var sortedObj = sortWords(sentenceObjects);
    // //konverter sentenceObjects til js-array
    // var sortedObj = [sentenceObjects[0]];
    // for( var i = 1; i < sentenceObjects.length; i++) {
    //     sortedObj.push(sentenceObjects[i]);        
    // }
    // // for s� � sortere som de st�r p� skjermen:
    // sortedObj = sortedObj.sort(
    //     function(a, b) {
    //         var ax = a.attr("x");
    //         var bx = b.attr("x");

    //         return(ax - bx)});

    // display the solution
    var dx = 8;
    var xP = sortedObj[0].attr("x");
    var yP = 0;
    for (var i = 0; i < sortedObj.length; i++) {
        yP += sortedObj[i].attr("y");
    }
    yP /= sortedObj.length;

    for (var i = 0; i < sortedObj.length; i++) {
        w = sortedObj[i];
        w.attr({x:xP, y:yP})
        bb = w.getBBox();
        //wArea.text(xP, 50, xP+"," +bb.width);
       // wArea.rect(bb.x, bb.y, bb.width, bb.height);
        xP += bb.width + dx;
    }

    // sjekk om teksten faller utenfor vinduet - resize
    // da skal rullefelt dukke opp.
    var mDiv = document.getElementById("word-view");
    if (mDiv.offsetWidth < xP) {
      //  wArea.text(40,40, "xP stor");
        wArea.setSize(xP, mDiv.offsetHeight - 40);
    }
    return(sortedObj);
}

function NewSent() {
    sentenceObjects = NewSentence(sentenceObjects, difficulty);
    scoreText.hide();
   
}

function NewSentence(sentenceObjects, diff) {
    // sett tegneomr�det til synlig omr�de

   
    // setningene er lagret i HTMLen under div med id=setninger
    var cont = document.getElementById("setninger").children;
   
    // fyll opp med setninger av en viss vanskelighetsgrad
    // styrt av diff og 'class'-attributtet for <p>
    var sentArray = new Array();
    for(var i = 0; i < cont.length; i++) {
        if (cont[i].getAttribute('class') == diff) {
          sentArray.push(cont[i]);
        }
    }

    cont = sentArray;

    // I det videre velges bare en setning av disse - skulle kanskje
    // pr�ve � ta hensyn til at det ikke velges noe som allerede er tatt, men....

    var len = cont.length;
    
    // indx er indeks til eksempelsetning
    var indx = Math.round(Math.random() * (len -1)) ;
    while (indx == currIndx && len > 1) {
        indx = Math.round(Math.random() * (len -1)) ;
    }
    currIndx = indx;
    console.log(cont);
    console.log(indx);
    // testsetningen ligger n� i test
    var test = cont[indx].innerHTML;


    // konverter setningen til en sekvens av tegnede objekter,
    // der hvert ord er et objekt

    // fjern tidligere setning fra tegnebrettet
    for(var i = 0; i < sentenceObjects.length; i++) {
        sentenceObjects[i].remove();
    }
    if (sentenceObjectsClone) {
       for(var i = 0; i < sentenceObjectsClone.length; i++) {
            sentenceObjectsClone[i].remove();
        }
    }

  
    sentenceObjects = words(test);
    // installer lytterne
    mouseEvents(sentenceObjects);
    sentenceObjects.drag(dragMove, dragStart, dragEnd);
    sentenceObjectsClone = cloneSet(sentenceObjects);

    divChange();

    return(sentenceObjects);
}

function divChange() {
    var mDiv = document.getElementById("word-view");
    var sDiv = document.getElementById("score-view");
    wArea.setSize(mDiv.offsetWidth-10, mDiv.offsetHeight-10);
    scoreArea.setSize(sDiv.offsetWidth, sDiv.offsetHeight);
 }


function mouseEvents(obj) {
   obj.mouseover(function(){
        document.body.style.cursor="move";
    });
    obj.mouseout(function(){
        document.body.style.cursor="auto";
    });
}