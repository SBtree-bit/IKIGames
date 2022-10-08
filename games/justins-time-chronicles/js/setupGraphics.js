import * as THREE from 'three';
import Stats from 'three/addons/libs/stats.module.js';
function setupGraphics() {
    let clock = new THREE.Clock();

    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    let fpCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
    fpCamera.position.set(0, 0, 0);
    let tpCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
    tpCamera.position.set(0, 0, -1)
    fpCamera.name = "First-Person Camera"
    tpCamera.name = "Third-Person Camera"

    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
    hemiLight.color.setHSL(0.6, 0.6, 0.6);
    hemiLight.groundColor.setHSL(0.1, 1, 0.4);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);
    let dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(100);
    scene.add(dirLight);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    let d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.camera.far = 13500;

    let renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xbfd1e5);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector("#game").appendChild(renderer.domElement);
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMap.enabled = true;

    window.onresize = function() {camera.aspect = window.innerWidth/ window.innerHeight; camera.updateProjectionMatrix();renderer.setSize(window.innerWidth, window.innerHeight)}

    let stats = Stats()
    //document.body.appendChild(stats.dom)
    let camera = fpCamera

    return {clock, scene, camera, fpCamera, tpCamera, renderer, stats}
}
export default setupGraphics;