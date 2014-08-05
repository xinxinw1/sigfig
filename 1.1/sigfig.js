/***** Significant Figures 1.1 *****/

/* require tools 4.0 */
/* require prec-math 4.0 - 4.1 */

////// Import //////

var udf = undefined;

var strp = $.strp;

var err = $.err;

var satt = $.satt;
var ratt = $.ratt;

////// Functions //////

// R.vldp(a) || R.vldp(a+"0"); // so 100. is valid
function vldp(a){
  return strp(a) && /^-?[0-9]+(\.[0-9]*)?$/.test(a);
}

// number of sig figs in a
function fig(a){
  a = R.abs(a);
  
  if (R.decp(a)){
    var passdot = false;
    for (var i = 0; i < a.length; i++){
      if (a[i] == "."){
        passdot = true;
        continue;
      }
      if (a[i] != "0")return a.length-i - (passdot?0:1);
    }
    return 0;
  }
  
  for (var i = a.length-1; i >= 0; i--){
    if (a[i] != "0")return i+1;
  }
  
  return 0;
}

//alert(fig("2."))
//alert(fig("-12"));
//alert(fig("-12."));
//alert(fig("00000.000000100"));

// the smallest n such that R.rnd(a, n) == a
function prec(a){
  if (R.decp(a))return R.declen(a);
  for (var i = a.length-1; i >= 0; i--){
    if (a[i] == "-")continue;
    if (a[i] != "0")return i-(a.length-1);
  }
  return 0;
}

//alert(prec("-010"));

function rnd(a, f){
  a = R.rnd(a, prec(a)-(fig(a)-f));
  if (R.intp(a)){
    var fd = fig(a+".");
    if (fd > f)return a; // rnd("100", 2)
    if (fd == f && fd == fig(a))return a;
    a += ".";
  }
  for (var i = f-fig(a); i >= 1; i--)a += "0";
  return a;
}

// same as R.rnd but with sigfig format
function rndp(a, p){
  a = R.rnd(a, p);
  if (R.intp(a)){
    if (p < 0)return a;
    if (p == 0 && fig(a+".") == fig(a))return a;
    a += ".";
  }
  for (var i = p-prec(a); i >= 1; i--)a += "0";
  return a;
}

function add(a, b){
  var m = Math.min(prec(a), prec(b));
  a = R.trim(a); b = R.trim(b);
  return rndp(R.add(a, b), m);
}

function sub(a, b){
  var m = Math.min(prec(a), prec(b));
  a = R.trim(a); b = R.trim(b);
  return rndp(R.sub(a, b), m);
}

function mul(a, b){
  var m = Math.min(fig(a), fig(b));
  a = R.trim(a); b = R.trim(b);
  return rnd(R.mul(a, b), m);
}

/*
let x = p-siz(a/b)
      = p-(floor(log(|a/b|))+1)
      = p-(floor(log(|a|)-log(|b|))+1)
floor(log(|a|))+floor(-log(|b|)) <= floor(log(|a|)-log(|b|)
floor(log(|a|))+floor(-log(|b|)) = floor(log(|a|))-ceil(log(|b|))
let g = p-(floor(log(|a|))-ceil(log(|b|))+1)
g >= x
g = p-(siz(a)-ceil(log(|b|)))
  = p-siz(a)+ceil(log(|b|))
let h = p-siz(a)+siz(b)
h >= g
*/

function div(a, b){
  if (R.trim(b) == "0")err(div, "b cannot be 0");
  var m = Math.min(fig(a), fig(b));
  a = R.trim(a); b = R.trim(b);
  return rnd(R.div(a, b, m-R.siz(a)+R.siz(b)), m);
}



var func;
function init(){
  var arr = ["add", "sub", "mul", "div"];
  for (var i = 0; i < arr.length; i++){
    satt($(arr[i]), {href: "javascript:void(0);",
                     onclick: mkOnclick(arr[i])});
  }
  
  $("a").onkeyup = update;
  $("b").onkeyup = update;
  
  change("add");
}

function update(){
  var a = $("a").value;
  var b = $("b").value;
  if (vldp(a) && vldp(b)){
    try {
      $("res").value = func(a, b);
    } catch (e){
      $("res").value = "";
    }
  } else {
    $("res").value = "";
  }
}

function mkOnclick(id){
  return function (){
    change(id);
    update();
  };
}

var curr = "add";
function change(id){
  satt($(curr), "href", "javascript:void(0);");
  ratt($(id), "href");
  var signs = {add: "+", sub: "−", mul: "×", div: "÷"};
  var funcs = {add: add, sub: sub, mul: mul, div: div};
  $("sign").innerHTML = signs[id];
  func = funcs[id];
  curr = id;
}
