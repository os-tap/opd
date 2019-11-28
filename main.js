function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


const HOST = 'http://192.168.0.1/';

let State = {
  active: 1,
  speed: 0,
  red: 100,
  green: 100,
  blue: 100
}
let Buttons = {
  1: 'left',
  2: 'right',
  3: 'avaria',
  4: 'neutral'
}

let colorInput, speedValue;


function setError() {
  document.body.classList.add('error');
}
function unsetError() {
  document.body.classList.remove('error');
}


async function getData() {

  let response = await fetch(HOST+'update.json');

  if (response.ok) {
    let json = await response.json();
//    console.log(json);
    return json;
  } else return null;

}

async function Update() {
  let data = await getData();
  console.log(data);
  if (data === null) {
    setError();
    return false;
  }
  unsetError();
  State.speed = data.speed;
  State.color = data.color;
  Buttons[data.active].set();
  colorInput.value = rgbToHex(data.red, data.green, data.blue);

  return true;

}

class Btn {
  constructor(num, id) {
    this.num = num;
    this.id = id;
    this.node = document.getElementById(this.id);
    this.node.addEventListener('click', this.send.bind(this));
  }

  set(){
    Buttons[State.active].node.classList.remove('active');
    this.node.classList.add('active');
    State.active = this.num;
  }

  async send(){
    let response = await fetch(HOST+this.id+'.html');

    if (response.ok) {
      let text = await response.text();
      console.log(text);
      if (text.trim() == "OK") {
        this.set();
      }
    } else setError();
  }


}

async function changeColor(colorHex) {
  let rgb = hexToRgb(colorHex);
  let response = await fetch(HOST+'color.html?r='+rgb.r+'&g='+rgb.g+'&b='+rgb.b);
  if(!response.ok) setError();
}
async function changeSpeed(increase = false) {
  let url = increase ? 'plus' : 'minus';
  let response = await fetch(HOST+'speed-'+url+'.html');
  if(!response.ok) setError();
  speed = await response.text();
  State.speed = parseInt(speed);
  speedValue.innerHTML = State.speed;
}


//main
(function(){

  document.addEventListener('DOMContentLoaded', ()=>{

    Update();

    colorInput = document.getElementById('color');
    speedValue = document.getElementById('speed');
    speedMinus = document.getElementById('speed-minus');
    speedPlus = document.getElementById('speed-plus');


    colorInput.addEventListener('change', ()=>{
      changeColor(colorInput.value);
      console.log(colorInput.value);
    });

    speedMinus.addEventListener('click', ()=>{
      changeSpeed(0);
    });
    speedPlus.addEventListener('click', ()=>{
      changeSpeed(1);
    });


    for(let num in Buttons) {
      Buttons[num] = new Btn(num, Buttons[num]);
    }

    document.getElementById('refresh').addEventListener('click', ()=>{
      Update();
    });



  });
})();
//main
