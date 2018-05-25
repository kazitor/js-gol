var data=initData(10,10);
var mousemode=null; //1: set cell, 0: remove cell
var ctx=null;

$(document).ready(function() {
  var canvas = document.getElementById('out');
  if(canvas.getContext) {
    ctx=canvas.getContext('2d');
    ctx = extendContext(ctx);

    // create a blinker
    data[3][5]=2;
    data[4][5]=2;
    data[5][5]=2;
    ctx.drawData(data);
  }

  $('#toggle').click(function() {
    if($(this).data('timer') === undefined) {
      $(this).text('Stop');
      run();
    } else {
      clearTimeout($(this).data('timer'));
      $(this).text('Start').removeData('timer');
    }
  });

  $('#step').click(function() {
    data = stepData(data);
    ctx.drawData(data);
  });

  $('#out').mousemove(doMouse).mousedown(doMouse).mouseup(doMouse);
});


function initData(x, y) {
  // return a 2d array of (x,y) filled with 0
  var col=Array(y);
  var data=Array(x);

  for(i=col.length - 1; i >= 0; i--)
    col[i]=0;
  for(i=data.length - 1; i >= 0; i--)
    data[i]=col.slice(0);

  return data;
}

function stepData(data, rule, loop) {
  if(loop===undefined) loop=true;
  if(rule===undefined) rule=getRule();

  var w = data.length;
  var h = data[0].length;
  var ret = Array(w);

  for(var x = 0; x < w; x++) {
    ret[x] = Array(h);
    for(var y = 0; y < h; y++) {
      if(data[x][y] == rule.C - 1 || data[x][y] == 0) {
        // if alive or dead
        // count surrounding live cells
        var c = 0;
        for(var i = x-1; i <= x+1; i++) {
          var iclamp = (i+w)%w;
          for(var j = y-1; j <= y+1; j++) {
            if(i==x && j==y)
              continue; // don't count current cell

            var jclamp = (j+h)%h;
            if(!loop && (i!=iclamp || j!=jclamp))
              continue; // don't count looped cells

            if(data[iclamp][jclamp] == rule.C - 1)
              c++;
          }
        }

        if(data[x][y]) { // cells that are alive:
          ret[x][y] = rule.C - (arrContains(rule.S, c) ? 1 : 2);
        } else { // cells that are dead:
          ret[x][y] = (arrContains(rule.B, c)) ? rule.C-1 : 0;
        }
      } else {
        // cell is dying
        ret[x][y] = data[x][y] - 1;
      }
    }
  }

  return ret;
}

function run() {
  data = stepData(data);
  ctx.drawData(data);
  $('#toggle').data('timer',setTimeout(run, 100));
}

function doMouse(e) {
  function coord(num) {
    return Math.min(Math.max(Math.floor(num / 50), 0), 9);
  }
  var x=coord(e.offsetX);
  var y=coord(e.offsetY);
  if(e.buttons & 1) {  // left mouse is down
    if(mousemode===null) {
      mousemode = data[x][y] - 1;
      if(mousemode==-1) mousemode = getRule().C - 1;
    }

    data[x][y] = mousemode;
    ctx.drawData(data);
  } else {
    mousemode = null;
  }

  //$('#debug').text(x + ', ' + y + ', ' + mousemode);
}

function extendContext(ctx) {
  // add functionality to a canvas context
  if(!ctx.drawCell) {
    ctx.drawCell = function (x,y,shade) {
      shade = Math.round(255 - shade * 255);
      this.fillStyle = 'rgb('+shade+','+shade+','+shade+')';
      this.fillRect(50*x + 5, 50*y + 5, 40, 40);
    }
  }

  if(!ctx.drawData) {
    ctx.drawData = function (data) {
      this.clearRect(0,0,500,500);
      var C = getRule().C;

      for(x=data.length - 1; x >= 0; x--) {
        var col=data[x];
        for(y=col.length - 1; y >= 0; y--)
          if(data[x][y])
            this.drawCell(x,y, data[x][y]/(C-1));
      }
      this.fillRect(50*x + 5, 50*y + 5, 40, 40);
    }
  }

  return ctx;
}

function getRule() {
  var r = {B:[], S:[], C:null};
  var B = $('#B').val();
  var S = $('#S').val();
  var C = $('#C').val();

  if(C=="") C=="2";
  r.C=parseInt(C);

  for(var i = 0; i < B.length; i++)
    r.B.push(parseInt(B[i]));
  for(var i = 0; i < S.length; i++)
    r.S.push(parseInt(S[i]));

  return r;
}

function arrContains(a, obj) {
// dammit IE!
  for (var i = 0; i < a.length; i++) {
    if (a[i] === obj) {
      return true;
    }
  }
  return false;
}