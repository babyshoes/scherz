// import { Scene, Color } from 'three';
// import { CatmullRomCurve3, BufferGeometry, LineBasicMaterial, Line, Geometry} from 'three';
// import { LineSegments, OrbitControls } from 'three';

import OrbitControls from 'three-orbitcontrols'
import * as THREE from 'three'

const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F']

// TO DO:
// get spiral to resize
// function onResize() {
//     this.camera.aspect = window.innerWidth / window.innerHeight;
//     this.camera.updateProjectionMatrix();
//     this.renderer.setSize(window.innerWidth, window.innerHeight);
//   }

const buildScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("white");

    return scene;
}

const buildCamera = (width, height) => {
    const fov = 45
    const aspectRatio = width/height
    console.log(width, height)
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
function createTextLabel(ref) {
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
        ref: ref,
        setHTML: function (html) {this.element.innerHTML = html},
        setParent: function (mesh){this.parent = mesh},
        updatePosition: function (camera, ref) {
            if (this.parent) {
                this.position.copy(this.parent.position)
            }
            var coords2d = this.get2DCoords(this.position, camera);
            this.element.style.left = coords2d.x + 'px'
            this.element.style.top = coords2d.y + 'px'
            
        },
        get2DCoords: function(position, camera) {
            var width = this.ref.current.offsetWidth
            var height = this.ref.current.offsetHeight
            var vector = position.project(camera)
   
            // since it's an absolute position, gotta account for flexbox width of left side
            vector.x = (vector.x + 1)/2 * width + (width*2)
            vector.y = -(vector.y - 1)/2 * height

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
        let label = createTextLabel(ref)
        label.setHTML(pitch)
        label.setParent(ptMesh)  
        ref.current.appendChild(label.element)
        label.updatePosition(camera, ref)
        markers.push(ptMesh)
        labels.push(label)
    }

    return [markers, labels]
}

const getVector3s = (noteMarkers, chord) => {
    return chord.pitches.map((pitch, i) => 
        noteMarkers.find((marker, index) => {
            const octave = chord.notes[i] - 72
            return pitch.toLowerCase() === marker.name.toLowerCase() // && index >= (octave * 12)
        }).position
    )
}

const drawChordPlane = (scene, noteMarkers, chord) => {
    // TO DO: remove doctoring 
    chord.pitches = ['C', 'G', 'E', 'B']
    const chordVector3s = getVector3s(noteMarkers, chord)

    const geometry = new THREE.Geometry()
    geometry.vertices.push(...chordVector3s)
    geometry.faces.push(new THREE.Face3(2, 1, 0), new THREE.Face3(3, 2, 0))
    const material = new THREE.MeshBasicMaterial( {
        color:0x00ff00, 
        side:THREE.DoubleSide,
        transparent: true,
        opacity: 0.5 } 
    )

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh
}

const drawSpiralMesh = (scene) => {
    var spiralPoints = getSpiralPoints(5, -5)
    var curve = new THREE.CatmullRomCurve3(spiralPoints)

    var points = curve.getPoints( 2400 );
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    var curveObject = new THREE.Line( geometry, material );

    scene.add(curveObject)

    return [points, curveObject]
}

const buildControls = (camera, container) => {
    // debugger
    const controls = new OrbitControls(camera, container)
    controls.enableZoom = false;
    return controls
}

const spiralViewer = {
    scene: false,
    camera: false,
    controls: false,
    renderer: false,
    container: false,
    spiralMesh: false,
    points: false,
    markers: false,
    labels: false,

    
    onReady: function(chord, ref) {
        this.ref = ref
        const width = this.ref.current.offsetWidth
        const height = this.ref.current.offsetHeight
        
        this.scene = buildScene()
        this.camera = buildCamera(width, height)
        this.renderer = buildRenderer(width, height)
        this.controls = buildControls(this.camera, this.ref.current)

        this.ref.current.appendChild( spiralViewer.renderer.domElement )

        const [points, spiralMesh] = drawSpiralMesh(this.scene)
        const [markers, labels] = noteMarkers(this.scene, points, this.ref, this.camera)
        this.chordPlane = drawChordPlane(this.scene, markers, chord)
        this.labels = labels
        const animate = function() {
            if (this.labels) {
                this.labels.forEach(l => l.updatePosition(this.camera))
            }
            this.renderer.render( this.scene, this.camera )
        }.bind(this)
        animate()
    },

    onResize: function() {
        const width = this.ref.current.offsetWidth
        const height = this.ref.current.offsetHeight
        console.log(width, height)
        this.renderer.setSize( width, height );
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    },
}

export const drawSpiral = (chord, ref) => {
    ref.current.style.width = '100%'
    ref.current.style.height = '100%'
    
    spiralViewer.onReady(chord, ref)
    window.addEventListener('resize', function(){
        spiralViewer.onResize()
    }, false)

}

