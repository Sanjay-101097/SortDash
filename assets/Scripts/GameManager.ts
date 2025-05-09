
import { _decorator, BlockInputEvents, Camera, Component, EventTouch, geometry, Input, input, Material, Node, PhysicsSystem, RigidBody, tween, Vec3 } from 'cc';
import { TileCreation } from './TileCreation';
import { Box } from './Box';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = GameManager
 * DateTime = Tue May 06 2025 22:21:54 GMT+0530 (India Standard Time)
 * Author = Sanjay_10
 * FileBasename = GameManager.ts
 * FileBasenameNoExtension = GameManager
 * URL = db://assets/Scripts/GameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */


@ccclass('GameManager')
export class GameManager extends Component {
    // [1]
    // dummy = '';

    // [2]
    @property(Node)
    Bolock: Node = null;

    @property(Node)
    Bus: Node = null;

    @property(Node)
    BusArr: Node[] = []

    @property(Node)
    Collector: Node = null;

    @property(Camera)
    camera: Camera = null;

    @property(Material)
    colorMaterials: Material[] = [];


    private _ray: geometry.Ray = new geometry.Ray();
    public static score: number = 0;
    StartingPoint: Vec3 = new Vec3(0, 0, 0);
    SelectedNode: Node = null;
    InitialAngle;
    previousAngle = 0;
    enableTouchMove = true;

    collectorArr: Node[] = [];
    busArr: Node[] = [];
    buscolor: string[] = ["0", "3", "4", "2", "1"];
    currentBusidx = 0;


    onEnable() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }



    onDisable() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);

    }

    private Bidx = 0;
    private Cidx = 0;

    onTouchStart(event) {
        // this.anim();
        // this.handnode.active = false;
        // this.Canvas.active = false;
        const mousePos = event.getLocation();
        this.StartingPoint.x = mousePos.x;
        this.StartingPoint.y = mousePos.y;
        const ray = new geometry.Ray();
        this.camera.screenPointToRay(mousePos.x, mousePos.y, ray);
        const mask = 0xffffffff; // Detect all layers (default)
        const maxDistance = 1000; // Maximum ray distance
        const queryTrigger = true; // Include trigger colliders


        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {

            const result = PhysicsSystem.instance.raycastClosestResult;
            const collider = result.collider;
            const node = collider.node;


            if (node.name === "Col") {
                input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
                input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
                input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);

                this.schedule(() => {
                    let box = node.children[node.children.length - 1].addComponent(Box);

                    // console.log("I'm here",this.SelectedNode.getWorldPosition());

                    if (node.getWorldPosition().x >= 0) {
                        box.dir = 1
                    } else {
                        box.dir = -1
                        box.frequency = 0.5
                    }

                    const pos = node.getWorldPosition();

                    pos.x = Math.round(pos.x * 10) / 10;
                    pos.y = Math.round(pos.y * 10) / 10;
                    pos.z = Math.round(pos.z * 10) / 10;

                    if (pos.equals(new Vec3(-1.8, 0, 1.8))) {
                        box.amplitude = 5;
                        box.dir = 1;
                        box.frequency = 1
                        //   tween(box.node).to(0.001,{position: new Vec3(-2.3, 0, 2.7)}).start();
                    } else if (pos.equals(new Vec3(0, 0, 1.8))) {
                        box.amplitude = 7;
                    } else if (pos.equals(new Vec3(-1.8, 0, 0))) {
                        box.amplitude = 5;
                    } else if (pos.equals(new Vec3(0, 0, -1.8))) {
                        box.dir = -1
                        box.frequency = 0.5
                    }

                    if (box.node.name == this.buscolor[this.currentBusidx]) {
                        box.isBus = true;
                        box.anim(this.Bidx, this.BusArr[this.currentBusidx]);
                        this.busArr.push(box.node)
                        this.Bidx += 1;
                    } else if (this.Cidx <= 14) {
                        box.isBus = false;
                        box.anim(this.Cidx, this.Collector);
                        this.collectorArr.push(box.node)
                        this.Cidx += 1;
                    }

                    if (this.Bidx == 9) {
                        this.Bidx = 0;
                        let Fbus = this.BusArr[this.currentBusidx]
                        let Lbus
                        if((this.currentBusidx + 2) >2){
                            Lbus = 0
                        }else{
                            Lbus = this.currentBusidx + 2
                        }
                        
                        this.scheduleOnce(() => {
                            tween(this.BusArr[this.currentBusidx])
                                .to(0.3, { position: new Vec3(-0.157, 5.597, -11.644) }, { easing: 'sineIn' })
                                .call(() => {
                                    this.currentBusidx += 1;
                                    if (this.currentBusidx == 3) {
                                        this.currentBusidx = 0
                                    }
                                    tween(this.BusArr[this.currentBusidx])
                                        .to(0.3, { position: new Vec3(5.856, 5.597, -5.631) }, { easing: 'sineIn' }).call(() => {
                                            this.Bidx = 0;
                                            this.CheckCollector();
                                            Fbus.setPosition(11.491, 5.597, 0.004);
                                            Fbus.children?.forEach((child) => {
                                                child.destroy();
                                            })

                                        }).start()
                                    tween(this.BusArr[Lbus])
                                        .to(0.3, { position: new Vec3(8.55, 5.597, -2.937) }, { easing: 'sineIn' }).start()

                                }).start();
                        }, 1.5)
                    } else {
                        this.scheduleOnce(() => {
                            input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
                            input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
                            input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
                        }, 1.7)
                    }




                }, 0.1, 4)

            }

            this.SelectedNode = null;


        } else {
            // No object was hit

            this.SelectedNode = this.Bolock;
            this.InitialAngle = this.Bolock.eulerAngles.y;


        }


    }

    CheckCollector() {
        if (this.collectorArr.length > 0) {
            if (this.collectorArr[this.collectorArr.length - 1].name == this.buscolor[this.currentBusidx]) {
                // input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
                // input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
                // input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
                this.scheduleOnce(() => {
                    let tile = this.collectorArr.pop().getComponent(Box);
                    tile.isBus = true;
                    tile.fromcollector = true;
                    tile.getComponent(Box).anim(this.Bidx, this.BusArr[this.currentBusidx]);

                    this.Bidx += 1;
                    this.Cidx -= 1;

                    if (this.Bidx == 10) {
                        this.Bidx = 0;
                        let Fbus = this.BusArr[this.currentBusidx]
                        let Lbus
                        if((this.currentBusidx + 2) >=2){
                            Lbus = 0
                        }else{
                            Lbus = this.currentBusidx + 2
                        }
                        this.scheduleOnce(() => {
                            tween(this.BusArr[this.currentBusidx])
                                .to(0.3, { position: new Vec3(-0.157, 5.597, -11.644) }, { easing: 'sineIn' })
                                .call(() => {
                                    this.currentBusidx += 1;
                                    if (this.currentBusidx == 3) {
                                        this.currentBusidx = 0
                                    }
                                    tween(this.BusArr[this.currentBusidx])
                                        .to(0.3, { position: new Vec3(5.856, 5.597, -5.631) }, { easing: 'sineIn' }).call(() => {
                                            this.CheckCollector();
                                            Fbus.setPosition(11.491, 5.597, 0.004);
                                            Fbus.children?.forEach((child) => {
                                                child.destroy();
                                            })
                                        }).start()
                                    tween(this.BusArr[Lbus])
                                        .to(0.3, { position: new Vec3(8.55, 5.597, -2.937) }, { easing: 'sineIn' }).start()

                                }).start();
                        }, 1.5)
                    } else {
                        this.CheckCollector();
                    }

                }, 0.1);
            }

        } else {
            this.scheduleOnce(() => {
                this.enableTouchMove = true;
                input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
                input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
                input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
            }, 1.7)
        }
    }

    private worldPositions;


    onTouchMove(event: EventTouch) {
        const mousePos = event.getLocation();
        if (this.SelectedNode) {
            let angle = (mousePos.x - this.StartingPoint.x) / 2.5;
            this.SelectedNode.setRotationFromEuler(0, this.InitialAngle + angle, 0);
        }

    }
    onTouchEnd(event) {

        if (this.SelectedNode === null || !this.enableTouchMove) return;

        const angle = this.InitialAngle;
        let getAngle = this.calculateRotation(angle, this.SelectedNode.eulerAngles.y);
        let fixedAngle = this.FixRotPos(this.SelectedNode.eulerAngles.y);
        this.SelectedNode.setRotationFromEuler(0, fixedAngle, 0);

    }


    FixRotPos(n) {
        return Math.round(n / 90) * 90;
    }
    calculateRotation(fromAngle: number, toAngle: number): number {
        let rotation = toAngle - fromAngle;
        return rotation;
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/en/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/en/scripting/life-cycle-callbacks.html
 */
