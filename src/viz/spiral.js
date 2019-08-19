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
    console.log(width, height)
    const nearPlane = 1
    const farPlane = 500

    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, nearPlane, farPlane);
    camera.position.z = -30;
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    return camera
}

const buildRenderer = (ref, width, height) => {
    const renderer = new THREE.WebGLRenderer();
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
function textLabel(ref) {
    const textDiv = document.createElement('div')
    textDiv.className = "note-label"
    textDiv.style.position = "absolute"
    textDiv.style.fontSize = "0.75em"

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

// const noteMarkers = (scene, points, ref, camera) => {
const drawNoteMarkers = (scene, points) => {
    let markers = []
    // let labels = []
    for (let i=0; i<24; i++) {
        let numPt = 2400 * i / 24
        let pitch = circleOfFifths[i] || ""
        let ptMesh = AnchorPoint(scene, points[numPt].x, points[numPt].y, points[numPt].z, pitch)
        
        // let label = textLabel(ref)
        // label.setHTML(pitch)
        // label.setParent(ptMesh)  
        // ref.current.appendChild(label.element)
        // label.updatePosition(camera, ref)
        markers.push(ptMesh)
        // labels.push(label)
    }

    return markers
    // return [markers, labels]
}

const createTextLabels = (ref, camera, markers) => {
    return markers.map(ptMesh => {
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
    var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
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

// export const drawSpiral = (chord, ref) => {
//     ref.current.style.width = '100%'
//     ref.current.style.height = '100%'
//     const width = ref.current.offsetWidth
//     const height = ref.current.offsetHeight
//     const scene = buildScene()

//     const camera = buildCamera(width, height)
//     const renderer = buildRenderer(width, height)
    
//     ref.current.appendChild( renderer.domElement )
//     renderer.domElement.style.width = '100%'
//     renderer.domElement.style.height = '100%'
    
//     const controls = buildControls(camera, ref.current)

//     const [points, spiralMesh] = drawSpiralMesh(scene)
//     const [markers, labels] = noteMarkers(scene, points, ref, camera)
//     const chordPlane = drawChordPlane(scene, markers, chord)

//     window.addEventListener('resize', handleWindowResize(ref, camera, renderer))
//     function animate() {
//         requestAnimationFrame( animate );
        
//         if (labels) {labels.forEach(l => l.updatePosition(camera))}
//         renderer.render( scene, camera )

//     }
//     animate();
// }

