// import { Scene, Color } from 'three';
// import { CatmullRomCurve3, BufferGeometry, LineBasicMaterial, Line, Geometry} from 'three';
// import { LineSegments, OrbitControls } from 'three';

import OrbitControls from 'three-orbitcontrols'
import * as THREE from 'three'

const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F']

const buildScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("white");

    return scene;
}

const buildCamera = (width, height) => {
    const fov = 45
    const aspectRatio = width/height
    const nearPlane = 1
    const farPlane = 500

    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
    camera.position.z = -30;
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    return camera
}

const buildRenderer = (width, height) => {
    const renderer = new THREE.WebGLRenderer();
    const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(DPR);
    renderer.setSize(width, height);

    return renderer
}

function buildLights(scene) {
    // distance, x, y, z
    const cameraParams = [
        [0, 50, 0, -50],
        [0, -50, 0, -50],
        [0, 0, 0, 50],
        [0, 0, -100, 0],
        [0, 0, 100, 0]
    ]
    
    const lights = cameraParams.map( 
        cp => {
            const light = new THREE.PointLight(1, "#ffffff", ...cp)
            scene.add(light)
        }
    )
    return lights
}

let getRadius = function(pointList,y) {
    return pointList.find(pt => y >= pt.y).x
}

const getSpiralPoints = (topY, bottomY) => {
    const stepsPerRev = 120
    const radian = (Math.PI * 2) / stepsPerRev

    const totalHeight = (topY - bottomY)/2
    const diameter = totalHeight
    const deltaY = totalHeight / (stepsPerRev)

    const spiralPoints = []
    for (let numstep = 0; numstep < stepsPerRev * 2; numstep++) {
        
        let x = diameter * Math.cos(radian * numstep)
        let z = diameter * Math.sin(radian * numstep)
        let y = bottomY + (deltaY * numstep)

        let newPt = new THREE.Vector3(x, y, z);

        spiralPoints.push(newPt);
    }
    return spiralPoints
}

function AnchorPoint(scene, x, y, z, pitch) {
    const geometry = new THREE.SphereGeometry(
        0.1, 20, 20);
    const material = new THREE.MeshBasicMaterial({ color: 0x377eb8 });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.name = pitch
    mesh.position.set(x, y, z);
    scene.add(mesh)

    return mesh
   
}

// https://codepen.io/dxinteractive/pen/reNpOR
function createTextLabel() {
    const textDiv = document.createElement('div')
    textDiv.className = "note-label"
    textDiv.style.position = "absolute"
    textDiv.style.fontSize = "0.75em"
    // textDiv.style.width = 100;
    // textDiv.style.height = 100;
    // textDiv.style.top = -1000;
    // textDiv.style.left = -1000;

    return {
        element: textDiv,
        parent: null,
        position: new THREE.Vector3(0,0,0),
        setHTML: function (html) {this.element.innerHTML = html},
        setParent: function (mesh){this.parent = mesh},
        updatePosition: function (camera) {
            if (this.parent) {
                // console.log(this.parent.position)
                this.position.copy(this.parent.position)
            }
            var coords2d = this.get2DCoords(this.position, camera);
            this.element.style.left = coords2d.x + 'px'
            this.element.style.top = coords2d.y + 'px'
            
        },
        get2DCoords: function(position, camera) {
            var vector = position.project(camera);
            vector.x = (vector.x + 1)/2 * window.innerWidth;
            vector.y = -(vector.y - 1)/2 * window.innerHeight;
            return vector;
        }
        
    }
}

const noteMarkers = (scene, points, ref, camera) => {
    let markers = []
    let labels = []
    for (let i=0; i<24; i++) {
        let numPt = 2400 * i / 24
        let pitch = circleOfFifths[i] || ""
        let ptMesh = AnchorPoint(scene, points[numPt].x, points[numPt].y, points[numPt].z, pitch)
        let label = createTextLabel()
        label.setHTML(pitch)
        label.setParent(ptMesh)  
        ref.current.appendChild(label.element)
        label.updatePosition(camera)
        markers.push(ptMesh)
        labels.push(label)
    }

    return [markers, labels]
}

const getVectors = (noteMarkers, chord) => {
    return chord.pitches.map((pitch, i) => 
        noteMarkers.find((marker, index) => {
            const octave = chord.notes[i] - 72
            return pitch.toLowerCase() === marker.name.toLowerCase() // && index >= (octave * 12)
        }).position
    )
}

const chordPlane = (scene, noteMarkers, chord) => {
    // TO DO: remove doctoring 
    chord.pitches = ['C', 'G', 'E', 'B']
    const chordVectors = getVectors(noteMarkers, chord)

    var geometry = new THREE.Geometry()
    geometry.vertices.push(...chordVectors)
    geometry.faces.push(new THREE.Face3(2, 1, 0), new THREE.Face3(3, 2, 0))
    var material = new THREE.MeshBasicMaterial( {
        color:0x00ff00, 
        side:THREE.DoubleSide,
        transparent: true,
        opacity: 0.5 } 
    )

    const mesh = new THREE.Mesh(geometry, material)

    scene.add(mesh)
}

export const drawSpiral = (chord, ref) => {
    ref.current.style.width = '100%'
    ref.current.style.height = '100%'
    // ref.current.width  = ref.current.offsetWidth;
    // ref.current.height = ref.current.offsetHeight;
    // debugger
    const width = window.innerWidth
    const height = window.innerHeight
    const scene = buildScene()
    // var axesHelper = new THREE.AxesHelper( 5 );
    // scene.add( axesHelper )
    const camera = buildCamera(width, height)
    var renderer = buildRenderer(width, height)
    ref.current.appendChild( renderer.domElement )
    var controls = new OrbitControls(camera,ref.current)
    const lights = buildLights(scene);
    
    
    // debugger
    

    const anchorPointList = [[5, 5], [5, 0], [5, -5]]
    let curvePointList=[]

    anchorPointList.forEach(element => {
        let newPoint = new THREE.Vector2(element[0], element[1]);   
        curvePointList.push(newPoint);
    });

    var latheCurve = new THREE.SplineCurve(curvePointList)
    // console.log(latheCurve)
    // var spiralPoints = getSpiralPoints(latheCurve)
    var spiralPoints = getSpiralPoints(5, -5)
    var curve = new THREE.CatmullRomCurve3(spiralPoints)


    var points = curve.getPoints( 2400 );
    // console.log("catmull points")
    // console.log(points)
    
    var geometry = new THREE.BufferGeometry().setFromPoints( points );

    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

    var curveObject = new THREE.Line( geometry, material );

    scene.add(curveObject)
    const [markers, labels] = noteMarkers(scene, points, ref, camera)
    chordPlane(scene, markers, chord)

    function animate() {
        requestAnimationFrame( animate );

        if (labels) {labels.forEach(l => l.updatePosition(camera))}
        
        renderer.render( scene, camera );
        
    }
    animate();
}

