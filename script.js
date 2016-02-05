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
  //{workers_count: 1, duration: 40, disp: 15},
  {workers_count: 1, duration: 4, disp: 1},
  {workers_count: 2, duration: 29, disp: 11},
  {workers_count: 3, duration: 22, disp: 8}
];

var t2 = [
  {workers_count: 2, duration: 40, disp: 10},
  {workers_count: 3, duration: 25, disp: 17},
];

var t3 = [
  {workers_count: 1, duration: 28, disp: 9},
  {workers_count: 2, duration: 20, disp: 8},
];

var t4 = [
  {workers_count: 1, duration: 40, disp: 10},
  {workers_count: 2, duration: 30, disp: 7},
  {workers_count: 3, duration: 20, disp: 5},
  {workers_count: 4, duration: 16, disp: 4}
];



function Unit(id, price, time_arriv) {
  this.id = id;
  this.price = price;
  this.time_arriv = time_arriv;
  var st1, st2, st3 = false;
  this.status = function() {
    return "Unit #" + id + " status: " +
      st1 + ", " + st2 + ", " + st3;
  }
  this.print = function() {
    return "Unit #" + id;
  }
}



function Product(u1, u2) {
  this.time_asm = 0;
  this.time_fo = 0;
  this.time_adj = 0;
  this.u1 = u1;
  this.u2 = u2;
}

// Операция подгонки
function FirstStage(params, in1, in2, out1, out2) { 
  this.in_process = false;
  this.timer = 0;
  this.unit1 = {};
  this.unit2 = {};
  this.process = function() {
    if (this.in_process) {
      this.timer--;
      if (this.timer == 0) {
        this.in_process = false;
        out1.push(this.unit1);
        out2.push(this.unit2);
        console.log(this.unit1.print() + " is finished stage 1");
        console.log(this.unit2.print() + " is finished stage 1");
        // this.unit1 = {};
        // this.unit2 = {};
      }
      return;
    }   
    if (in1.length == 0 || in2.length == 0) {
      return;
    }
    this.timer = params.duration + getRandomInt(-params.disp, params.disp);
    this.unit1 = in1.shift();
    this.unit2 = in2.shift();
    console.log(this.unit1.print() + " is on stage 1");
    console.log(this.unit2.print() + " is on stage 1");
    this.in_process = true;
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

var minutes = 0,
    prev_arriv1 = 0,
    prev_arriv2 = 0;
var unit_queue1 = [];
var unit_queue2 = [];
var after_st1_queue1 = [];
var after_st1_queue2 = [];

var adjust_queue = [];
var assemble_queue = [];
var complete_queue = [];

var first_stage = new FirstStage(t1[0], unit_queue1, unit_queue2, after_st1_queue1, after_st1_queue2);
var second_stage = new SecondStage(p1, t2[0], p1, t3[0], p2);
var third_stage = new ThirdStage(t4);

while (true) {
  minutes++;
  if (minutes < 5) {//if (minutes - prev_arriv1 > 1 / lam1) {
    prev_arriv1 = minutes;
    unit_queue1.push(new Unit('u1_' + minutes, s1, minutes));
  }
  if (minutes < 5) {//if (minutes - prev_arriv2 > 1 / lam2) {
    prev_arriv2 = minutes;
    unit_queue2.push(new Unit('u2_' + minutes, s1, minutes));
  }

  first_stage.process();

  // var adj_res = second_stage.start(adjust_queue) || second_stage.process(adjust_queue);
  // if (adj_res) {
  //   adj_res.time_adj = minutes;
  //   console.log(adj_res);
  //   assemble_queue.push(adj_res);
  // }

  // third_stage.start(assemble_queue);
  // var asm_res = third_stage.process(assemble_queue);
  // if (asm_res) {
  //   asm_res.time_asm = minutes;
  //   complete_queue.push(asm_res);
  // }

  if (minutes > 59) break;
}
console.log("unit_queue1: ", unit_queue1);
console.log("unit_queue2: ", unit_queue2);
console.log("after_st1_queue1: ", after_st1_queue2);
console.log("after_st1_queue1: ", after_st1_queue2);
})();