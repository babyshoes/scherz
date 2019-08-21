// import { Scene, Color } from 'three';
// import { CatmullRomCurve3, BufferGeometry, LineBasicMaterial, Line, Geometry} from 'three';
// import { LineSegments, OrbitControls } from 'three';

import OrbitControls from 'three-orbitcontrols'
import * as THREE from 'three'
import _ from 'lodash'

const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F']

// TO DO: 
// - make line weight and label text size dynamic
const buildScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#574e5c");

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

const buildRenderer = (ref, width, height) => {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const DPR = (window.devicePixelRatio) ? window.devicePixelRatio : 1;
    renderer.setPixelRatio(DPR);
    renderer.setSize(width, height);

    ref.current.appendChild(renderer.domElement)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'

    return renderer
}

const calculateSpiralPoints = (topY, bottomY) => {
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

const drawMarker = (scene, x, y, z, pitch) => {
    // var radius = 0.2,
    // segments = 12,
    // material = new THREE.LineBasicMaterial( { color: 'white' } ),
    // geometry = new THREE.CircleGeometry( radius, segments );
    // Remove center vertex
    // geometry.vertices.shift();
    // var mesh = new THREE.LineLoop( geometry, material )

    const geometry = new THREE.SphereGeometry(
        // 0.4, 20, 20);
        0.3, 3, 2);
    const material = new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.5 });
    const mesh = new THREE.Mesh(geometry, material);

    mesh.name = pitch
    mesh.position.set(x, y, z);
    scene.add(mesh)

    return mesh
}


const drawNoteMarkers = (scene, points) => {
    let markers = []
    for (let i=0; i<24; i++) {
        let numPt = 2400 * i / 24
        let pitch = circleOfFifths[i] || ""
        let ptMesh = drawMarker(scene, points[numPt].x, points[numPt].y, points[numPt].z, pitch)
        markers.push(ptMesh)
    }

    return markers
}

// https://codepen.io/dxinteractive/pen/reNpOR
const textLabel = function(ref) {
    const textDiv = document.createElement('div')
    textDiv.className = "note-label"
    textDiv.style.position = "absolute"

    return {
        element: textDiv,
        parent: null,
        position: new THREE.Vector3(0,0,0),
        ref: ref,
        setHTML: function (note) {
            // this.element.innerHTML = `<div>
            //     <div class='marker'>°</div>
            //     <div class='note'>${note}</div>
            // </div>`
            this.element.innerHTML = note
        },
        setParent: function (mesh){this.parent = mesh},
        updatePosition: function (camera, ref) {
            if (this.parent) {
                this.position.copy(this.parent.position)
            }
            const coords2d = this.get2DCoords(this.position, camera);
            this.element.style.left = coords2d.x + 'px'
            this.element.style.top = coords2d.y + 'px'
            
        },
        get2DCoords: function(position, camera) {
            const width = this.ref.current.offsetWidth
            const height = this.ref.current.offsetHeight
            const vector = position.project(camera)
   
            const otherDivsWidth = Array.from(document.getElementsByClassName("panel"))
                .filter(el => !el.className.includes("right"))
                .reduce((acc, el) => Number(el.clientWidth) + acc, 0)
            // debugger

            // since it's an absolute position, gotta account for flexbox width of left side
            vector.x = (vector.x + 1)/2 * width + otherDivsWidth
            vector.y = -(vector.y - 1)/2 * height

            return vector;
        }        
    }
}

const createTextLabels = (ref, camera, markers) => {
    return markers.map(ptMesh => {
        // const circle = textLabel(ref)
        // circle.setHTML("°")
        // circle.setParent(ptMesh)

        const label = textLabel(ref)
        label.setHTML(ptMesh.name)
        label.setParent(ptMesh) 
        ref.current.appendChild(label.element)
        label.updatePosition(camera, ref)
        return label
    })
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

    // const colorChoices = ['#e27d60', '#c38d9e', '#e8a87c', '#85dcb', '#41b3a3']
    const colorChoices = ['#3da4ab', '#f6cd61', '#fe8a71']
    const chordVector3s = getVector3s(noteMarkers, chord)

    const geometry = new THREE.Geometry()
    geometry.vertices.push(...chordVector3s)
    geometry.faces.push(new THREE.Face3(2, 1, 0), new THREE.Face3(3, 2, 0))
    const material = new THREE.MeshBasicMaterial( {
        // color:0x00ff00, 
        // color: '#41b3a3',
        color: _.sample(colorChoices),
        side: THREE.DoubleSide,
        // transparent: true,
        opacity: 1.0 } 
    )

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    return mesh
}

const removeLabels = (ref) => {
    ref.current.childNodes.forEach(n => { 
        if(n.className === "note-label") {
            ref.current.removeChild(n)
        }
    })
}

const removeChordPlane = (scene, chordPlaneMesh) => {
    scene.remove(chordPlaneMesh)
}

const getCatmullPoints = () => {
    const spiralPoints = calculateSpiralPoints(5, -5)
    const curve = new THREE.CatmullRomCurve3(spiralPoints)
    return curve.getPoints(2400)
}
const drawSpiralMesh = (scene, points) => {
    var geometry = new THREE.BufferGeometry().setFromPoints( points );
    var material = new THREE.LineBasicMaterial( { linewidth: 2.0, color : "white" } );
    var curveObject = new THREE.Line( geometry, material );

    scene.add(curveObject)

    return [points, curveObject]
}

const buildControls = (camera, container) => {
    const controls = new OrbitControls(camera, container)
    controls.enableZoom = false;
    return controls
}

const handleWindowResize = (ref, camera, renderer) => () => {
    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    renderer.setSize( width, height );
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

export const drawSpiral = function (chord, ref) {
    ref.current.style.width = '100%'
    ref.current.style.height = '100%'
    const width = ref.current.offsetWidth
    const height = ref.current.offsetHeight

    const scene = buildScene()
    const camera = buildCamera(width, height)
    const renderer = buildRenderer(ref, width, height)
    const controls = buildControls(camera, ref.current)

    const points = getCatmullPoints()
    const spiralMesh = drawSpiralMesh(scene, points)
    const markers = drawNoteMarkers(scene, points)
    const labels = createTextLabels(ref, camera, markers)

    const chordPlane = drawChordPlane(scene, markers, chord)
    window.addEventListener('resize', handleWindowResize(ref, camera, renderer))
    
    function animate() {
        requestAnimationFrame( animate );
        if (labels) {labels.forEach(l => l.updatePosition(camera))}
        renderer.render( scene, camera )
    }

    animate()

    return {
        updateChordPlane: function(chord) {
            removeLabels(ref)
            removeChordPlane(scene, chordPlane)
            labels = createTextLabels(ref, camera, markers)
            chordPlane = drawChordPlane(scene, markers, chord)
        }   
    }
}


