import * as THREE from 'three';

var socket = io();
    
var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');


let texts = [
  {text: "Hello World", posX: 0, posY: 0, posZ: 0, rotX: 0, rotY: Math.PI * 2, rotZ: 0, textColor: 0xff0000},
  {text: "Another one", posX: 0, posY: 30, posZ: 0, rotX: 0, rotY: Math.PI * 2, rotZ: 0, textColor: 0x00ff00},
];

let renderedTextLength = 0;

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let color = getRandomColor();




const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 100;
//const camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
//camera.position.set( 0, 400, 700 );

const cameraTarget = new THREE.Vector3( 0, 150, 0 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight - 100);
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

// const plane = new THREE.Mesh(
//   new THREE.PlaneGeometry( 10000, 10000 ),
//   new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
// );
// plane.position.y = 0.1;
// plane.rotation.x = - Math.PI / 5;
// scene.add( plane );





const group = new THREE.Group();
group.position.x = 0;
group.position.y = 0;
group.position.z = 0;

scene.add( group );

const dirLight = new THREE.DirectionalLight( 0xffffff, 0.4 );
dirLight.position.set( 0, 0, 1 ).normalize();
scene.add( dirLight );

const pointLight = new THREE.PointLight( 0xffffff, 4.5, 0, 0 );
pointLight.color.setHSL( Math.random(), 1, 1 );
//pointLight.color.setHSL( Math.random(), 1, 0.5 );
pointLight.position.set( 0, 100, 90 );
scene.add( pointLight );

import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const loader = new FontLoader();

let font = null;

loader.load('fonts/helvetiker_regular.typeface.json', function ( _font ) {
  font = _font;
} );



let mouseX = 0;
let mouseY = 0;
let mouseDown = false;
document.addEventListener('mousemove', onDocumentMouseMove);
document.addEventListener('touchmove', onDocumentMouseMove);
document.addEventListener('mousedown', onDocumentMouseDown);
document.addEventListener('mouseup', onDocumentMouseUp);

function onDocumentMouseDown( event ) {
  mouseDown = true;
}

function onDocumentMouseUp( event ) {
  mouseDown = false;
}

function getGlobalVectorFromOffset ({posX, posY, posZ, rotX, rotY, rotZ}) {
  const globalVector = new THREE.Vector3(posX, posY, posZ);
  const euler = new THREE.Euler().setFromVector3(new THREE.Vector3(rotX, rotY, rotZ), 'YXZ');
  globalVector.applyEuler(euler);
  return globalVector;
}
function onDocumentMouseMove( event ) {
  event.preventDefault();
  event.clientX / window.innerWidth 
  if (mouseDown) {


    camera.rotation.order = 'YXZ';

    camera.rotation.y -= ( mouseX - event.clientX ) / window.innerWidth * 1;
    camera.rotation.x -= ( mouseY - event.clientY ) / window.innerHeight * 1;
    camera.rotation.z += 0;
    

    // const rotDiff = new THREE.Euler(
    //   -( mouseY - event.clientY ) / window.innerHeight * 0.000001,
    //   -( mouseX - event.clientX ) / window.innerWidth * 0.000001,
    //   0, 'YXZ' );
    // const b = new THREE.Vector3(camera.rotation);
    // b.applyEuler(rotDiff);

    // console.log(camera.rotation, rotDiff, b);

    // ///camera.rotation = b;

    // camera.rotation.set(b.x, b.y, b.z);

    // camera.rotation.y -= ( mouseX - event.clientX ) / window.innerWidth * 1;
    // camera.rotation.x -= ( mouseY - event.clientY ) / window.innerHeight * 1;
    // camera.rotation.z += 0;
  }

  mouseX = event.clientX;
  mouseY = event.clientY;
  //mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  //mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

let xChange = 0;
let yChange = 0;
let zChange = 0;

let speed = 3;

let prevTypedString = null;
let typedString = "";

document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case "w":
      yChange = speed;
      // Handle w key press
      break;
    case "s":
      yChange = -speed;
      // Handle a key press
      break;
    case "ArrowUp":
      zChange = -speed;
      // Handle up arrow key press
      break;
    case "ArrowDown":
      zChange = speed;
      // Handle down arrow key press
      break;
    case "ArrowLeft":
      xChange = -speed;
      // Handle left arrow key press
      break;
    case "ArrowRight":
      xChange = speed;
      // Handle right arrow key press
      break;
  }


  // Check for special keys
  if (event.key === 'Backspace') {
    typedString = typedString.slice(0, -1); 
  } else if (event.key === 'Enter') {
    if (typedString === '') return;
    const offsetVector = getGlobalVectorFromOffset({posX: 0, posY: 0, posZ: -70, rotX: camera.rotation.x, rotY: camera.rotation.y + Math.PI * 2, rotZ: camera.rotation.z});
    socket.emit('chat message', JSON.stringify({
      text: typedString,
      posX: camera.position.x + offsetVector.x,
      posY: camera.position.y + offsetVector.y,
      posZ: camera.position.z + offsetVector.z,
      rotX: camera.rotation.x,
      rotY: camera.rotation.y + Math.PI * 2,
      rotZ: camera.rotation.z,
      textColor: color,
    }));
    typedString = '';
  } else if (event.key.length === 1) { 
    typedString += event.key;
  }

  // Update the display (if needed)
  // Or display in an HTML element

});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case "w":
      if (yChange === speed) yChange = 0;
      // Handle w key press
      break;
    case "s":
      if (yChange === -speed) yChange = 0;
      // Handle a key press
      break;
    case "ArrowUp":
      if (zChange === -speed) zChange = 0;
      // Handle up arrow key press
      break;
    case "ArrowDown":
      if (zChange === speed) zChange = 0;
      // Handle down arrow key press
      break;
    case "ArrowLeft":
      if (xChange === -speed) xChange = 0;
      // Handle left arrow key press
      break;
    case "ArrowRight":
      if (xChange === speed) xChange = 0;
      // Handle right arrow key press
      break;
  }
});

function calcTexts() {
  if (font === null) return;
  if (texts.length === renderedTextLength) return;

  let toRender = texts.slice(renderedTextLength);

  toRender.forEach(({text, posX, posY, posZ, rotX, rotY, rotZ, textColor}) => {

    const materials = [
      new THREE.MeshPhongMaterial( { color: textColor, flatShading: true } ), // front
      new THREE.MeshPhongMaterial( { color: textColor } ) // side
    ];

    const textGeo = new TextGeometry(text, {
      font: font,
      size: 14,
      depth: 1,
      curveSegments: 5,
      bevelEnabled: true,
      bevelThickness: 3,
      bevelSize: 0.2,
      bevelOffset: 0,
      bevelSegments: 5
    } );
  
    textGeo.computeBoundingBox();
  
    const centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
  
    const textMesh1 = new THREE.Mesh( textGeo, materials );

    const offsetVector = getGlobalVectorFromOffset({posX: centerOffset, posY: 0, posZ: 0, rotX: rotX, rotY: rotY, rotZ: rotZ});

    textMesh1.position.x = posX + offsetVector.x;
    textMesh1.position.y = posY + offsetVector.y;
    textMesh1.position.z = posZ + offsetVector.z;
  
    textMesh1.rotation.order = 'YXZ';

    textMesh1.rotation.x = rotX;
    textMesh1.rotation.y = rotY;
    textMesh1.rotation.z = rotZ;
  
    group.add( textMesh1 );
  });

  renderedTextLength = texts.length;
}

let typedStringGeo = null;
let typedStringMesh = null;

function showTypedText() {
  if (font === null) return;
  const materials = [
    new THREE.MeshPhongMaterial( { color: "rgb(255,255,255)", flatShading: true } ), // front
    new THREE.MeshPhongMaterial( { color: "rgb(255,255,255)" } ) // side
  ];

  if (prevTypedString !== typedString) {
    try {
      typedStringGeo = new TextGeometry(typedString + "|", {
        font: font,
        size: 14,
        depth: 1,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 3,
        bevelSize: 0.2,
        bevelOffset: 0,
        bevelSegments: 5
      } );
      typedStringGeo.computeBoundingBox();
    } catch (e) {
      console.error(e);
    } finally {
      prevTypedString = typedString;
    }

  }

  const centerOffset = - 0.5 * ( typedStringGeo.boundingBox.max.x - typedStringGeo.boundingBox.min.x );
  const newTypedStringMesh = new THREE.Mesh( typedStringGeo, materials );

  const offsetVector = getGlobalVectorFromOffset({posX: centerOffset, posY: 0, posZ: -70, rotX: camera.rotation.x, rotY: camera.rotation.y + Math.PI * 2, rotZ: camera.rotation.z});

  // newTypedStringMesh.position.x = camera.position.x + offsetVector.x;
  // newTypedStringMesh.position.y = camera.position.y + offsetVector.y;
  // newTypedStringMesh.position.z = camera.position.z + offsetVector.z;

  // const lookAtVector = new THREE.Vector3( 0, 0, -10 );
  // camera.getWorldDirection( lookAtVector );

  newTypedStringMesh.position.copy( camera.position );
  newTypedStringMesh.position.add( offsetVector );

  newTypedStringMesh.rotation.order = 'YXZ';

  newTypedStringMesh.rotation.x = camera.rotation.x;
  newTypedStringMesh.rotation.y = camera.rotation.y + Math.PI * 2;
  newTypedStringMesh.rotation.z = camera.rotation.z;

  group.remove(typedStringMesh)
  group.add(newTypedStringMesh);

  typedStringMesh = newTypedStringMesh;
}


function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  camera.position.x += xChange * Math.cos(camera.rotation.y) + zChange * Math.sin(camera.rotation.y);
  camera.position.y += yChange;
  camera.position.z += zChange * Math.cos(camera.rotation.y) - xChange * Math.sin(camera.rotation.y);

  calcTexts();
  showTypedText();

  // camera.lookAt( cameraTarget );
  renderer.clear();
	renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );


form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', JSON.stringify({
      text: input.value,
      posX: camera.position.x,
      posY: camera.position.y,
      posZ: camera.position.z - 10,
      textColor: color,
    }));
    input.value = '';
  }
});

socket.on('chat message', function(msg) {
  // var item = document.createElement('li');
  // item.textContent = msg;
  // messages.appendChild(item);
  // window.scrollTo(0, document.body.scrollHeight);

  texts.push(JSON.parse(msg));
});


