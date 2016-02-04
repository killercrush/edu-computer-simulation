(function comp_model() {
    'use strict';
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var lam1 = 1 / 30,
    lam2 = 1 / 30,
    p1 = 0.65,
    p2 = 0.85,
    s1 = 560,
    s2 = 50,
    n = 10,
    t = 30;

var t1 = [
  {count: 1, val: 40, disp: 15},
  {count: 2, val: 29, disp: 11},
  {count: 3, val: 22, disp: 8}
];

var t2 = [
  {count: 2, val: 40, disp: 10},
  {count: 3, val: 25, disp: 17},
];

var t3 = [
  {count: 1, val: 28, disp: 9},
  {count: 2, val: 20, disp: 8},
];

var t4 = [
  {count: 1, val: 40, disp: 10},
  {count: 2, val: 30, disp: 7},
  {count: 3, val: 20, disp: 5},
  {count: 4, val: 16, disp: 4}
];

var minutes = 0,
    prev_arriv1 = 0,
    prev_arriv2 = 0;
var uz1_queue = [];
var uz2_queue = [];
var adjust_queue = [];
var assemble_queue = [];
var complete_queue = [];

function Unit(id, price, time_arriv) {
  this.id = id;
  this.price = price;
  this.time_arriv = time_arriv;
}



function Product(u1, u2) {
  this.time_asm = 0;
  this.time_fo = 0;
  this.time_adj = 0;
  this.u1 = u1;
  this.u2 = u2;
}

// Операция подгонки
function FirstStage(len) { 
  this.in_process = false;
  this.timer = 0;
  this.unit1 = {};
  this.unit2 = {};
  this.start = function (uz1, uz2) {
    if (uz1.length == 0 || uz2.length == 0 || this.in_process) {
      return;
    }
    this.timer = len.val + getRandomInt(-len.disp, len.disp);
    this.unit1 = uz1.pop();
    this.unit2 = uz2.pop();
    console.log(this.unit1);
    console.log(this.unit2);
    this.in_process = true;
  }
  this.process = function() {
    if (this.in_process) {
      this.timer--;
      if (this.timer == 0) {
        this.in_process = false;
        return new Product(this.unit1, this.unit2);
      }
      else return false;
    }
  }
}

// Операция доводки
function SecondStage(len1, adj_p1, len2, adj_p2) {
  this.in_process = false;
  this.timer = 0;
  this.unit = '';
  this.start = function(unit_queue) {
    if (unit_queue.length == 0 || this.in_process) {
      return;
    }
    this.unit = unit_queue.pop();
    console.log(this.unit);
    var f1 = Math.random() <= adj_p1;
    var f2 = Math.random() <= adj_p2;
    var f_t = f1 || f2;
    if (f_t) {
      if (f1) this.timer = len1.val + getRandomInt(-len1.disp, len1.disp);
      if (f2) this.timer += len2.val + getRandomInt(-len2.disp, len2.disp);
      this.in_process = true;
    }
    else return this.unit;
  }
  this.process = function() {
    if (this.in_process) {
      this.timer--;
      if (this.timer == 0) {
        this.in_process = false;
        return this.unit;
      }
    }
  }
}

// Сборка
function ThirdStage(len) {
  this.in_process = false;
  this.timer = 0;
  this.unit = '';
  this.start = function (unit_queue) {
    if (unit_queue.length == 0 || this.in_process) {
      return;
    }
    this.timer = len.val + getRandomInt(-len.disp, len.disp);
    this.unit = unit_queue.pop();
    this.in_process = true;
  }
  this.process = function() {
    if (this.in_process) {
      this.timer--;
      if (this.timer == 0) {
        this.in_process = false;
        return this.unit;
      }
      else return false;
    }
  }
}


var first_stage = new FirstStage(t1[0]);
var second_stage = new SecondStage(p1, t2[0], p1, t3[0], p2);
var third_stage = new ThirdStage(t4);

while (true) {
  minutes++;
  if (minutes % 10 == 0) {//if (minutes - prev_arriv1 > 1 / lam1) {
    prev_arriv1 = minutes;
    uz1_queue.push(new Unit('d1_' + minutes, s1, minutes));
  }
  if (minutes % 10 == 0) {//if (minutes - prev_arriv2 > 1 / lam2) {
    prev_arriv2 = minutes;
    uz2_queue.push(new Unit('d2_' + minutes, s1, minutes));
  }

  first_stage.start(uz1_queue, uz2_queue);
  var op_res = first_stage.process();
  if (op_res){
    op_res.time_fo = minutes;
    adjust_queue.push(op_res);
    console.log(op_res);
  }

  var adj_res = second_stage.start(adjust_queue) || second_stage.process(adjust_queue);
  if (adj_res) {
    adj_res.time_adj = minutes;
    console.log(adj_res);
    assemble_queue.push(adj_res);
  }

  third_stage.start(assemble_queue);
  var asm_res = third_stage.process(assemble_queue);
  if (asm_res) {
    asm_res.time_asm = minutes;
    complete_queue.push(asm_res);
  }

  if (minutes > 59) break;
}
console.log("uz1_queue: ", uz1_queue);
console.log("uz2_queue: ",uz2_queue);
console.log("adjust_queue: ", adjust_queue);
console.log("assemble_queue: ", assemble_queue);
console.log("complete_queue: ", complete_queue);
})();