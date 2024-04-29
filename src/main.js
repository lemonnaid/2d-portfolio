import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, playAnimIfNotPlaying, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png",{
    sliceX: 39,
    sliceY: 31, //number of frames on x and y axis
    anims: {
        "idle-down": 960,
        "walk-down":{ from:960, to:963, loop:true, speed:8},
        "idle-side":999,
        "walk-side":{ from:999, to:1002, loop:true, speed:8},
        "idle-up":1038,
        "walk-up":{ from:1038, to:1041, loop:true, speed:8},
    },
});

k.loadSprite("map","./map.png");

k.setBackground(k.Color.fromHex("#DE8BBD"));

k.scene("main", async() => {
    const mapData = await (await fetch("./map.json")).json()
    const layers = mapData.layers;

    const map = k.add([
        k.sprite("map"),
        k.pos(0),
        k.scale(scaleFactor)
    ]);

    const player = k.make([
        k.sprite("spritesheet",{ anim: "idle-down"}),
        k.area({
            shape: new k.Rect(k.vec2(0,3), 10, 10),
        }),
        k.body(),
        k.anchor("center"),
        k.pos(),
        k.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,
        },
        "player",
    ]);

    for (const layer of layers){
        if (layer.name === "boundaries"){
            for (const boundary of layer.objects){
                map.add([
                    k.area({
                        shape: new k.Rect (k.vec2(0), boundary.width, boundary.height),
                    }),
                    k.body({ isStatic: true }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name,
                ]);

                if (boundary.name){
                    player.onCollide(boundary.name,() => {
                        player.isInDialogue = true;
                        displayDialogue(dialogueData[boundary.name], () => (player.isInDialogue = false));
                    });
                }
            }
            continue;
        }

        if (layer.name === "spawnpoint") {
            for (const entity of layer.objects){
                if(entity.name === "player"){
                    player.pos = k.vec2(
                        (map.pos.x + entity.x) * scaleFactor,
                    (map.pos.y + entity.y) * scaleFactor);
                    k.add(player);
                    continue;
                }
            }
        }
    }

    setCamScale(k);

    k.onResize(() => {
        setCamScale(k);
    });
    
    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 100);
    });
  //here
    k.onKeyDown((key) => {
        if(player.isInDialogue) return;
        if (["left","a"].includes(key)){
            player.flipX = true;
            playAnimIfNotPlaying(player, "walk-side");
            player.direction = "left";
            player.move(-player.speed, 0);
        }
        if (["right","d"].includes(key)){
            player.flipX = false;
            playAnimIfNotPlaying(player, "walk-side");
            player.direction = "right";
            player.move(player.speed, 0);
        }
        if (["up","w"].includes(key)){
            playAnimIfNotPlaying(player, "walk-up");
            player.direction = "up";
            player.move(0, -player.speed);
        }
        if (["down","s"].includes(key)){
            playAnimIfNotPlaying(player, "walk-down");
            player.direction = "down";
            player.move(0, player.speed);
        }
    });

k.onKeyRelease(() => {
    if (player.direction === "down") {
        player.play("idle-down");
    } else if (player.direction === "up") {
        player.play("idle-up");
    } else {
        player.play("idle-side");
    }
});

//here
    k.onMouseDown((mouseBtn) => {
        if(mouseBtn !== "left" || player.isInDialogue) return;
        
        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);
        
        const mouseAngle = player.pos.angle(worldMousePos)

        const lowerBound = 50;
        const upperBound = 125;

        if(
            mouseAngle > lowerBound &&
            mouseAngle < upperBound &&
            player.curAnim() !== "walk-up"
        ){
            player.play("walk-up");
            player.direction = "up";
            return;
        }
        if(
            mouseAngle < -lowerBound &&
            mouseAngle > -upperBound &&
            player.curAnim() !== "walk-down"
        ){
            player.play("walk-down");
            player.direction = "down";
            return;
        }

        if(Math.abs(mouseAngle) > upperBound){
            player.flipX =false;
            if(player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "right";
            return;
        }
        if(Math.abs(mouseAngle) < lowerBound){
            player.flipX = true;
            if(player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "left";
            return;
        }
    });

    k.onMouseRelease(() => {
        if(player.direction === "down"){
            player.play("idle-down");
            return;
        }
        if(player.direction === "up"){
            player.play("idle-up");
            return;
        }
        player.play("idle-side");
    });
});

k.go("main");