  let scene,renderer,mesh,clock;
  let meshFloor; 
  let ambientLight; 
  let keyboard = {};
  let tree;
  let crate,crateTexture,crateNormalMap,crateBumpMap;
  let player = {height:0.2,speed:0.03,turnSpeed:Math.PI * 0.01};
  
  let models = {
    stall:{
      obj:"models/stallGreen.obj",
      mtl:"models/stallGreen.mtl",
      mesh:null
    },
    treeHigh:{
      obj:"models/treeHigh.obj",
      mtl:"models/treeHigh.mtl",
      mesh:null
    },
    tree:{
      obj:"models/tree.obj",
      mtl:"models/tree.mtl",
      mesh:null
    },
    uzi:{
      obj:"models/uzi.obj",
      mtl:"models/uzi.mtl",
      mesh:null,
      castShadow:false
    }
  }

  let meshes ={}


  let loadingScreen = {
    scene:new THREE.Scene(),
    camera:new THREE.PerspectiveCamera(90,window.innerWidth/window.innerHeight,0.1,100),
    box:new THREE.Mesh(
      new THREE.BoxGeometry(1,1,1),
      new THREE.MeshBasicMaterial({color:0xffffff})
    )
  };

  let loadingManager;
  let RESOURCES_LOADED = false;
  
  for (const key in models) {
    if (models.hasOwnProperty(key)) {
      // const element = object[key];
      (function(key){
        let mtlLoader = new THREE.MTLLoader(loadingManager);
        mtlLoader.setMaterialOptions({side:THREE.DoubleSide});

        mtlLoader.load(models[key].mtl,function(materials){
          materials.preload();
          let objLoader = new THREE.OBJLoader(loadingManager);
          objLoader.setMaterials(materials);
          objLoader.load(models[key].obj,function(mesh){
               mesh.traverse(function(node){
                 if(node instanceof THREE.Mesh){
                   if ('castShadow' in models[key]) {
                     node.castShadow = models[key].castShadow
                   }else{
                     node.castShadow = true;
                   }
                   node.receiveShadow = true;
                 }
               })
               models[key].mesh = mesh;
          });
        })
      })(key);
      
    }
  }


  init = ()=> {
     scene = new THREE.Scene();
     camera = new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,1000);
     clock = new THREE.Clock();

     //LOADING_SCREEN
     loadingScreen.box.position.set(0,0,5);
     loadingScreen.camera.lookAt(loadingScreen.box.position);
     loadingScreen.scene.add(loadingScreen.box);

     loadingManager = new THREE.LoadingManager();
     loadingManager.onProgress = function(item,loaded,total){
        console.log(item,loaded,total);
     }
     loadingManager.onLoad = function() {
       console.log("All resources loaded");
       RESOURCES_LOADED = true;
       onResourcesLoaded();
    }


     //CUBE
     mesh = new THREE.Mesh(
         new THREE.BoxGeometry(1,1,1),
         new THREE.MeshPhongMaterial({color:0xff1100,wireframe:false})
     );
     mesh.receiveShadow = true;
     mesh.castShadow = true;

     //FLOOR
     meshFloor = new THREE.Mesh(
       new THREE.PlaneGeometry(10,10,10,10),
       new THREE.MeshPhongMaterial({color:0xffffff,wireframe:false})
     );
     meshFloor.rotation.x -= Math.PI / 2;
     meshFloor.position.set(0,-1,0);
     meshFloor.receiveShadow = true;

     //CRATE
     let textureLoader = new THREE.TextureLoader();
     crateTexture = new textureLoader.load("crate/crate0_diffuse.png");
     crateBumpMap = new textureLoader.load("crate/crate0_bump.png");
     crateNormalMap = new textureLoader.load("crate/crate0_normal.png");

     crate = new  THREE.Mesh(
             new THREE.BoxGeometry(1,1,1),
             new THREE.MeshPhongMaterial({color:0xffffff,
                                          map:crateTexture,
                                          bumpMap:crateBumpMap,
                                          normalMap:crateNormalMap,
                                          side:THREE.DoubleSide
                                        })
     );
     crate.position.set(-2,-0.5,-3);
     crate.receiveShadow = true;
     crate.castShadow = true;
     
     let crate2 = crate.clone();
     crate2.position.set(0,-1,0);
     crate2.scale.set(10,10,10);
     crate2.receiveShadow =true;
     crate2.castShadow = false;

     let lightball = mesh.clone();
     
     

     

     
     //LIGHTS
     ambientLight = new THREE.AmbientLight(0xffffff,0.3);
     
     let pointLight = new THREE.PointLight(0xffffff,0.8,18);

     pointLight.position.set(-3,3,-3);
     lightball.position.set(-3,4,-3);

     pointLight.castShadow = true;
     pointLight.shadow.camera.near = 0.1;
     pointLight.shadow.camera.far = 25;
     
     //LOADERS
    //  let mtlLoader = new THREE.MTLLoader();
    //  mtlLoader.load("models/tree.mtl",(materials)=>{
    //       materials.preload();
    //       let objLoader = new THREE.OBJLoader();
    //       objLoader.setMaterials(materials);

    //       objLoader.load("models/tree.obj",(mesh)=>{
    //         tree = mesh;
    //         mesh.traverse((node)=>{
    //              if(node instanceof THREE.Mesh){
    //                node.castShadow = true;
    //                node.receiveShadow = true;
    //              }
    //              console.log('I came',node);

    //         });

    //         scene.add(mesh);
    //         console.log(tree);
    //         mesh.position.set(3,-1,2);
    //       });
    //  });
  

     //SCENE
     scene.add(pointLight);
     scene.add(ambientLight);
     scene.add(mesh);
     scene.add(meshFloor);
     scene.add(crate);
     scene.add(crate2);
     scene.add(lightball);
     

     camera.position.set(0,player.height,5);
     camera.lookAt(new THREE.Vector3(0,player.height,0));

     renderer = new THREE.WebGLRenderer();

     renderer.setSize(window.innerWidth,window.innerHeight);
     //tell renderer to enable shadows
     renderer.shadowMap.enabled = true;
     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
     document.body.appendChild(renderer.domElement);

     animate();
  }

  update = ()=>{
    mesh.rotation.x += 0.001;
    mesh.rotation.y += 0.001;
    crate.rotation.y += 0.01;
    
    if (keyboard[87]) {  //W
      camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
      camera.position.z -= Math.cos(camera.rotation.y) * player.speed;
    }

    if (keyboard[83]) {  //s
      camera.position.x += Math.sin(camera.rotation.y) * player.speed;
      camera.position.z += Math.cos(camera.rotation.y) * player.speed;
    }

    if (keyboard[65]) {  //s
      camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
      camera.position.z += Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
    }

    if (keyboard[68]) {  //s
      camera.position.x -= Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
      camera.position.z -= Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
    }
    
    if (keyboard[37]) {  //left
      console.log("left");
      camera.rotation.y += player.turnSpeed;
      
    }
    if (keyboard[39]) {  //left
      camera.rotation.y -= player.turnSpeed;
    }
    // meshes["weapon"].position.x = camera.position.x;
    // meshes["weapon"].position.y = camera.position.y;
    // meshes["weapon"].position.z = camera.position.z - 0.5;
    let time = Date.now() * 0.0005;
    let delta = clock.getDelta();

    meshes["weapon"].position.set(
      camera.position.x - Math.sin(camera.rotation.y - Math.PI/7) * 1.8,
      camera.position.y - 1.0 + Math.sin(time*4.1 + camera.position.x*5+ camera.position.z*5) * 0.03,
      camera.position.z - Math.cos(camera.rotation.y - Math.PI/7) * 2.1
    );
    console.log(camera.position.z - 1.3);
    meshes["weapon"].rotation.set(
      camera.rotation.x,
      camera.rotation.y+Math.PI,
      camera.rotation.z
    );

    


  }

  onResourcesLoaded =()=>{
    meshes["tree1"] = models.tree.mesh.clone();
    meshes["tree2"] = models.tree.mesh.clone();
    meshes["treeHigh1"] = models.treeHigh.mesh.clone();
    meshes["treeHigh2"] = models.treeHigh.mesh.clone();
    meshes["stall1"] = models.stall.mesh.clone();
    meshes["stall2"] = models.stall.mesh.clone();
    meshes["weapon"] = models.uzi.mesh.clone();

    meshes["tree1"].position.set(2,-1,);
    scene.add(meshes.tree1);

    meshes["tree2"].position.set(-2,-1,2);
    scene.add(meshes.tree2);

    meshes["treeHigh1"].position.set(2,-1,3);
    scene.add(meshes.treeHigh1);

    meshes["treeHigh2"].position.set(-3,-1,3);
    scene.add(meshes.treeHigh2);

    meshes["stall1"].position.set(2,-1,-3);
    meshes["stall1"].rotation.y += Math.PI / 2;
    scene.add(meshes.stall1);

    meshes["weapon"].position.set(0,0,4);
    meshes["weapon"].scale.set(20,20,20);
    meshes["weapon"].rotation.y += Math.PI;

    scene.add(meshes.weapon);

    
  }

  animate =()=>{
      if (!RESOURCES_LOADED) {
         requestAnimationFrame(animate);
         loadingScreen.box.position.x -= 0.05;
         if(loadingScreen.box.position.x < -10)loadingScreen.box.position.x = 10;
         loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

         renderer.render(loadingScreen.scene,loadingScreen.camera);
         return;
      }
      requestAnimationFrame(animate);
      update();

      renderer.render(scene,camera);
  }
  KeyUp = (event)=>{
    console.log("leftu");
    keyboard[event.keyCode] = false;
    console.log(keyboard,event);
  }

  KeyDown = (event)=>{
    keyboard[event.keyCode] = true;
  }
  MouseMove = (event)=>{
    console.log(event);
  }

  window.addEventListener('keydown',KeyDown);
  window.addEventListener('keyup',KeyUp);
  // window.addEventListener('mousemove',MouseMove);

  window.onload = init;