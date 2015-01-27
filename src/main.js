/*
* preload dragonBones scripts
*/
var ScriptLoader = (function(){
    var manifest,callback;
    function load(p_manifest,p_callback){
        manifest = p_manifest;
        callback = p_callback;
        loadNext();
    }
    function loadNext(){
        if(manifest.length > 0){
            var nextFile = manifest.shift();
            loadScript(nextFile,loadNext);
        } else {
            callback();
        }
    }
    function loadScript(p_path, p_callback) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = p_path;
        script.onload = p_callback;
        script.onreadystatechange = function() {
            if (this.readyState == 'complete') {
                p_callback();
            }
        }
        head.appendChild(script);
    }
    return {load:load};
})();

// ------------------------------------------------------------
/*
* Phaser DragonBones example
*/
// ------------------------------------------------------------

//the phaser game object
var game = null;
var armature = null;
var bonesBase = null;

//wait for scripts to load first
ScriptLoader.load(["src/dragonBones.js","src/phaser_dragonbones.js"], createGame)

//now instantiate the game
function createGame(){
    game = new Phaser.Game(800, 400, Phaser.AUTO, 'experiments', { preload: preload, create: create, update: update, render: render });
}

//preload game assets
function preload () {
    // the texture atlas image that includes the images for the dragon bones sprite 
    // (loaded independently to make it easily accessible to dragonbones)
    game.load.image('moto_image', 'assets/moto_texture.png');
    // the texture atlas data (TexturePacker JSON Array format) for the dragon bones sprite 
    // (loaded independently to make it easily accessible to dragonbones)
    game.load.json('moto_atlas', 'assets/moto_atlas.json');
    // load the texture atlas again so that it's content is registered in the atlas frame cache
    game.load.atlas('atlas', 'assets/moto_texture.png', 'assets/moto_atlas.json');  
    // the dragonbones skeleton data
    game.load.json('moto_skeleton', 'assets/moto_skeleton.json');   
}

//let's get this show on the road!
function create () {
    //call setup method for dragon bones
    addDragonBones();
    //start a run-loop for dragonbones, firing every 20ms
   //game.time.events.loop(20, update, this);

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 1000;

    var index = 1;
    var animations = armature.animation.animationNameList;

    game.input.onDown.add(function clicking() {
        index = (index + 1) % animations.length;
        armature.animation.gotoAndPlay(animations[index], 0.2);
   });

}

var head2_active = false;
var space_down = false;

function update() {
    // call advanceTime on the dragonBones world clock to progress the animation.
    //
    // For simplicity just using a hardcoded value of 0.02 secs
    // but ideally should evaluate how much time has really passed since last call
    // and send that value through instead -> eg use Date.now()

    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
        console.log('abajo')

        if (!space_down) {
            space_down = true;

            if (!head2_active) {
                armature.getSlot('head').setDisplay(armature._factory.getTextureDisplay("MovieClip/head2"));
                head2_active = true;
            }
            else {
                armature.getSlot('head').setDisplay(armature._factory.getTextureDisplay("MovieClip/head"));
                head2_active = false;   
            }
        }
    }
    else {
        if (space_down) {
            space_down = false;
        }
    }

    dragonBones.animation.WorldClock.clock.advanceTime(0.02);
}

function render() {
    
}


function addDragonBones(){

    //give dragonBones a reference to the game object
    dragonBones.game = game;

    // hardcoded ids for the dragonBones elements to target
    var armatureName = "motorcycleMan";//PigDragonBones";
    var skeletonId = "Motorcycle";//piggy";
    var animationId = "left";//run";
    // fetch the skeletonData from cache
    var skeletonData = game.cache.getJSON('moto_skeleton');
    // fetch the atlas data from cache
    var atlasJson = game.cache.getJSON('moto_atlas');
    // make an array listing the names of which images to use from the atlas
    //var partsList = ["arm_front", "head_ninja", "body", "fore_leg", "rear_leg", "rear arm"];
    var partsList = [
                "MovieClip/moto.png",
                "MovieClip/springf.png",
                "MovieClip/springb.png",
                "MovieClip/wheel.png",
                "MovieClip/head.png",
                "MovieClip/legf.png",
                "MovieClip/legu.png",
                "MovieClip/body.png",
                "MovieClip/armf.png",
                "MovieClip/armu.png",
                "MovieClip/head2.png"
                ];
    
    // fetch the atlas image
    var texture = game.cache.getImage("moto_image");
    
    // and the atlas id
    var atlasId = 'atlas';
    
    // pass the variables all through to a utility method to generate the dragonBones armature
    armature = dragonBones.makePhaserArmature(armatureName, skeletonId, animationId, skeletonData, atlasJson, texture, partsList, atlasId);
    
    // get the root display object from the armature
    bonesBase = armature.getDisplay();
    
    // position it
    bonesBase.x = 400;
    bonesBase.y = 300;

    // add it to the display list
    //game.world.add(bonesBase);

    //game.physics.arcade.enable(group);
    
    function setBody(obj) {

        obj.children.forEach(function(child) {

            if (child.children.length > 0) {
                setBody(child)
            }
            else {
                child.body.collideWorldBounds = true;
                child.body.bounce.y = 1;
            }
        });
    }
}
