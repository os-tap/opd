let defaultData = {
  active: 'neutral',
  speed: 100,
  r: 255,
  g: 0,
  b: 0
}
for (let key in defaultData) {
  if (!(key in localStorage)) {
    localStorage[key] = defaultData[key];
  }
}


const SpeedStep = 20;
let SpeedValue, HeadRight;



export function opd() {
  HeadRight = document.querySelector('#head-right');
  SpeedValue = document.querySelector('#speed');
  SpeedValue.innerHTML = localStorage.speed;

  ['left', 'right', 'avaria', 'neutral'].forEach((id) => {
    new Btn(id);
  });
  new Color('color');
  new Speed('speed-plus', false);
  new Speed('speed-minus', true);

  document.getElementById('refresh').addEventListener('click', unload);

 unload();

}

const fetching = async(url) => {
  url = "http://192.168.43.162" + url;
  try {
    HeadRight.classList.add('load');
    let response = await fetch(url, {cache: 'no-cache'});
    HeadRight.classList.remove('load');
    return true;
  } catch(err) {
    HeadRight.classList.remove('load');
    alert("can't reach " + url);
    return false;
  }
}

const unload = async () => {

  let params = '?';
  for (let key in defaultData) {
    params += key + '=' + localStorage[key] + '&';
  }

  HeadRight.classList.add('load');
  let response = await fetching('/unload' + params);
  response ? unsetError() : setError();

}

const getData = async () => {

  let response = await fetch('/update.json', {cache: 'no-cache'});

  if (response.ok) {
    let json = await response.json();
    return json;
  } else return {};

}

const Update = async () => {
  let data = await getData();
  if (!data) {
    setError();
  }

  unsetError();


  if (localStorage.speed != data.speed) {
    localStorage.speed = data.speed;
    SpeedValue.innerHTML = localStorage.speed;
    document.cookie
  }

  if (localStorage.active != data.active) {
    document.getElementById(localStorage.active).classList.remove('active');
    document.getElementById(data.active).classList.add('active');
    localStorage.active = data.active
  }


}

const setError = () => {
  document.body.classList.add('error');
//  alert("can't connect to arduino");
}
const unsetError = () => {
  document.body.classList.remove('error');
}

class Btn {
  constructor(id) {
    this.id = id;
    this.node = document.getElementById(id);
    this.node.addEventListener('click', this.send.bind(this));
    if (this.id == localStorage.active) this.set();
  }

  set() {
    document.getElementById(localStorage.active).classList.remove('active');
    this.node.classList.add('active');
    localStorage.active = this.id;
  }

  async send() {
    let response = await fetching('/'+this.id);
    if(response) this.set();
  }

}

class Color {

  constructor(id) {
    this.id = id;
    this.node = document.getElementById(this.id);
    this.node.addEventListener('change', this.send.bind(this));
    this.node.value = rgbToHex(localStorage.r, localStorage.g, localStorage.b);
  }

  async send() {
    let rgb = hexToRgb(this.node.value);
    let request = '';
    for (let key in rgb) {
      localStorage[key] = rgb[key];
      request += key + '=' + rgb[key] + '&';
    }
    let params = '?r=' + rgb.r + '&g=' + rgb.g + '&b=' + rgb.b;
    let response = await fetching('/color' + params);
  }

}

class Speed {
  constructor(id, decrease) {
    this.id = id;
    this.decrease = decrease;
    this.node = document.getElementById(this.id);
    this.node.addEventListener('click', this.send.bind(this));
  }

  async send() {
    let newSpeed = this.decrease ? parseInt(localStorage.speed) - SpeedStep : parseInt(localStorage.speed) + SpeedStep;

    if (newSpeed < 20 || newSpeed > 200) {
      return;
    }

    let response = await fetching('/speed?v=' + newSpeed);
    if (response) {
      localStorage.speed = newSpeed;
      SpeedValue.innerHTML = newSpeed;
    }

  }
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function componentToHex(c) {
  var hex = parseInt(c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

