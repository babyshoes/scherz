// import { Scene, Color } from 'three';
// import { CatmullRomCurve3, BufferGeometry, LineBasicMaterial, Line, Geometry} from 'three';
// import { LineSegments, OrbitControls } from 'three';

import * as THREE from 'three'

const buildScene = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("white");

    return scene;
}


export const drawSpiral = (chord, ref) => {
    const scene = buildScene()

    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    var renderer = new THREE.WebGLRenderer();
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // debugger
    ref.current.appendChild( renderer.domElement );

    var curve = new THREE.CatmullRomCurve3( [
        new THREE.Vector3( -10, 0, 10 ),
        new THREE.Vector3( -5, 5, 5 ),
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( 5, -5, 5 ),
        new THREE.Vector3( 10, 0, 10 )
    ] );

    var points = curve.getPoints( 50 );
    var geometry = new THREE.BufferGeometry().setFromPoints( points );

    var material = new THREE.LineBasicMaterial( { color : 0x00ff00 } );

    // Create the final object to add to the scene
    var curveObject = new THREE.Line( geometry, material );

    scene.add(curveObject)
    camera.position.z = 20;
    function animate() {
        requestAnimationFrame( animate );
        renderer.render( scene, camera );
    }
    animate();
}


// function buildLathe(scene, resolution){
//     lathe = new Lathe(scene, this.anchorPointList, resolution, gui.lathe,eventBus);
//     return lathe;
// }

// // 

// function buildSpiral(scene,lathe){
//     // get spiral points from lathe
//     const catMull = new CatmullRomCurve3(this.spiralPoints);
//     const catMullPoints = catMull.getPoints(spiralResolution);
//     const lineGeo = new BufferGeometry().setFromPoints(catMullPoints);

//     const lineMat = new LineBasicMaterial({ color: 0xff0000 });


//     const line = new Line(lineGeo,lineMat);

//     scene.add(line);
// }